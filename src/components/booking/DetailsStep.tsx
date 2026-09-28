"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/service-utils";
import type { CatalogueService, CatalogueTechnician } from "@/lib/vitech/catalogue";
import { phoneLooksDialable, type SlotOffer } from "@/lib/vitech/booking";
import { vitechConfig, vitech } from "@/lib/vitech/env";
import { TurnstileWidget, type TurnstileHandle } from "./TurnstileWidget";
import { t } from "@/lib/translations";
import { ShieldCheck, Calendar, Clock, User, Sparkles } from "lucide-react";
import type { Ref } from "react";

export interface DetailsStepProps {
  service: CatalogueService | null;
  date: string;
  offer: SlotOffer | null;
  technicianChoice: "any" | string;
  technicians: CatalogueTechnician[];
  shopName: string;
  name: string;
  onChangeName: (val: string) => void;
  phone: string;
  onChangePhone: (val: string) => void;
  email: string;
  onChangeEmail: (val: string) => void;
  notes: string;
  onChangeNotes: (val: string) => void;
  promoCode: string;
  onChangePromoCode: (val: string) => void;
  phoneError: string;
  bookingError: string;
  submitting: boolean;
  onConfirm: () => void;
  turnstileToken: string;
  onTurnstileToken: (token: string) => void;
  turnstileRef?: Ref<TurnstileHandle>;
}

export default function DetailsStep({
  service,
  date,
  offer,
  technicianChoice,
  technicians,
  shopName,
  name,
  onChangeName,
  phone,
  onChangePhone,
  email,
  onChangeEmail,
  notes,
  onChangeNotes,
  promoCode,
  onChangePromoCode,
  phoneError,
  bookingError,
  submitting,
  onConfirm,
  turnstileToken,
  onTurnstileToken,
  turnstileRef,
}: DetailsStepProps) {
  const { lang } = useLanguage();
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
  const [promoError, setPromoError] = useState<string>("");
  const [validatingPromo, setValidatingPromo] = useState<boolean>(false);

  const chosenTechnicianName =
    technicianChoice === "any"
      ? t("booking.anyAvailable", lang)
      : technicians.find((t) => t.id === technicianChoice)?.name || technicianChoice;

  const listPrice = service?.price ?? 0;
  const finalPrice = promoDiscount !== null ? Math.max(0, listPrice - promoDiscount) : listPrice;

  async function handleApplyPromo() {
    if (!promoCode.trim() || !service) return;
    setValidatingPromo(true);
    setPromoError("");
    try {
      const res = await vitech.validatePromo(promoCode.trim(), service.price.toFixed(2));
      if (res.valid && res.discount_amount != null) {
        setPromoDiscount(Number(res.discount_amount));
      } else {
        setPromoDiscount(null);
        setPromoError("Invalid promo code");
      }
    } catch (err: unknown) {
      setPromoDiscount(null);
      const msg = err instanceof Error ? err.message : "Invalid promo code";
      setPromoError(msg);
    } finally {
      setValidatingPromo(false);
    }
  }

  const phoneValid = phoneLooksDialable(phone);
  const needsTurnstile = Boolean(vitechConfig.turnstileSiteKey);
  const canSubmit =
    Boolean(name.trim()) &&
    phoneValid &&
    (!needsTurnstile || Boolean(turnstileToken)) &&
    !submitting;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl sm:text-2xl font-black mb-2 text-gray-900">
          {t("booking.confirmDetails", lang)}
        </h3>
        <p className="text-sm text-gray-500">
          Please provide your contact information to complete your booking.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
        <h4 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          <ShieldCheck size={20} className="text-pink-600" />
          <span>{t("booking.bookingSummary", lang)}</span>
        </h4>

        <div className="space-y-3 text-sm pt-2 border-t border-pink-100">
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-pink-500 shrink-0" />
              {t("booking.servicesLabel", lang)}
            </span>
            <span className="font-bold text-gray-900 text-right">
              {service?.name || "—"}
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar size={14} className="text-pink-500 shrink-0" />
              {t("booking.dateLabel", lang)}
            </span>
            <span className="font-semibold text-gray-900">{date || "—"}</span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Clock size={14} className="text-pink-500 shrink-0" />
              {t("booking.timeLabel", lang)}
            </span>
            <span className="font-semibold text-gray-900">
              {offer ? `${offer.time} - ${offer.end}` : "—"}
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <span className="text-gray-500 flex items-center gap-1.5">
              <User size={14} className="text-pink-500 shrink-0" />
              {t("booking.staffLabel", lang)}
            </span>
            <span className="font-semibold text-gray-900">
              {chosenTechnicianName}
            </span>
          </div>

          <div className="flex justify-between items-center gap-4 pt-2 border-t border-pink-100/60 font-bold">
            <span className="text-gray-700">{t("booking.total", lang)}</span>
            <div className="text-right">
              {promoDiscount !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 line-through text-xs font-normal">
                    {formatPrice(listPrice)}
                  </span>
                  <span className="text-pink-600 font-extrabold text-base">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-pink-600 font-extrabold text-base">
                  {formatPrice(listPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Form */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100/80 shadow-sm space-y-4">
        <h4 className="font-bold text-gray-900 text-base">Your Information</h4>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Sarah Jones"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Phone Number <span className="text-pink-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="07123 456789"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm"
          />
          {phone && !phoneValid && (
            <p className="text-xs text-rose-500 mt-1">
              Please enter a valid phone number (8–17 digits).
            </p>
          )}
          {phoneError && (
            <p className="text-xs text-rose-500 mt-1">{phoneError}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Email <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="sarah@example.co.uk"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Anything the salon should know?{" "}
            <span className="text-gray-400 font-normal">
              (Optional — please don&apos;t include medical details)
            </span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="Special requests or design preferences"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm resize-none"
          />
        </div>

        {/* Promo code */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Promo Code <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onChangePromoCode(e.target.value.toUpperCase())}
              placeholder="e.g. NAIL20"
              className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm uppercase"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || validatingPromo}
              className="px-5 py-2.5 bg-gray-100 hover:bg-pink-100 hover:text-pink-600 text-gray-700 font-bold rounded-2xl transition-all text-xs disabled:opacity-50"
            >
              {validatingPromo ? "Checking..." : "Apply"}
            </button>
          </div>
          {promoError && (
            <p className="text-xs text-rose-500 mt-1">{promoError}</p>
          )}
          {promoDiscount !== null && (
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              Promo applied: saved {formatPrice(promoDiscount)}!
            </p>
          )}
        </div>
      </div>

      {/* Turnstile challenge */}
      {needsTurnstile && (
        <div className="flex justify-center">
          <TurnstileWidget
            siteKey={vitechConfig.turnstileSiteKey}
            onToken={onTurnstileToken}
            ref={turnstileRef}
          />
        </div>
      )}

      {/* Mandatory data governance note */}
      <p className="text-xs text-gray-400 text-center px-4">
        Your details are used by {shopName} to manage your booking and are processed by Vi-Tech on the salon&apos;s behalf.
      </p>

      {/* Error alert */}
      {bookingError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl text-center">
          {bookingError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={!canSubmit}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-200 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Confirming your booking..." : t("booking.submit", lang)}
      </button>
    </div>
  );
}
