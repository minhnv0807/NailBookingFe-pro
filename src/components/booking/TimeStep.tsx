"use client";

import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import type { CatalogueTechnician } from "@/lib/vitech/catalogue";
import type { SlotOffer } from "@/lib/vitech/booking";
import { User, Star, Clock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TimeStepProps {
  technicians: CatalogueTechnician[];
  technicianChoice: "any" | string;
  onChangeTechnician: (techId: "any" | string) => void;
  slotsStatus: "idle" | "loading" | "ready" | "failed";
  offers: SlotOffer[];
  selectedTime: string;
  onSelectTime: (offer: SlotOffer) => void;
  date: string;
  salonPhone?: string;
  slotNotice?: string;
}

export default function TimeStep({
  technicians,
  technicianChoice,
  onChangeTechnician,
  slotsStatus,
  offers,
  selectedTime,
  onSelectTime,
  date,
  salonPhone = "+447****2572",
  slotNotice,
}: TimeStepProps) {
  const { lang } = useLanguage();

  if (technicians.length === 0 && slotsStatus !== "loading") {
    return (
      <div className="rounded-2xl border border-pink-200 bg-pink-50 p-6 text-center text-pink-900">
        <p className="font-semibold text-base mb-1">
          {t("booking.onlineClosedTitle", lang)}
        </p>
        <p className="text-sm text-pink-700">
          {t("booking.onlineClosedMessage", lang).replace("{phone}", salonPhone)}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-black mb-5 text-gray-900">
        {t("booking.selectStaffTime", lang)}
      </h3>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 space-y-6">
        {/* Technician choice */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <User size={16} /> {t("booking.staffAvailability", lang)}
          </label>
          <p className="text-xs text-gray-400 mb-3">
            {t("booking.onlyAvailable", lang)}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onChangeTechnician("any")}
              className={cn(
                "p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                technicianChoice === "any"
                  ? "border-pink-500 bg-pink-50 text-pink-700 font-bold shadow-sm"
                  : "border-gray-200 hover:border-pink-200 text-gray-700"
              )}
            >
              <Star size={14} className="text-pink-500" />
              <span>{t("booking.anyStaff", lang)}</span>
            </button>

            {technicians.map((st) => {
              const isSelected = technicianChoice === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onChangeTechnician(st.id)}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 text-left",
                    isSelected
                      ? "border-pink-500 bg-pink-50 text-pink-700 font-bold shadow-sm"
                      : "border-gray-200 hover:border-pink-200 text-gray-700"
                  )}
                >
                  <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {st.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {st.name}
                    </span>
                    {st.role && (
                      <span className="block truncate text-[11px] text-gray-400">
                        {st.role}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot selection */}
        <div className="pt-2 border-t border-pink-50">
          <p className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-pink-500" />
            <span>
              {t("booking.availableSlots", lang)} {date}
            </span>
          </p>

          {slotNotice && (
            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 font-medium">
              {slotNotice}
            </div>
          )}

          {slotsStatus === "loading" && (
            <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-400 animate-pulse">
              {t("booking.checkingAvailability", lang)}
            </div>
          )}

          {slotsStatus === "failed" && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-700 text-sm">
              {t("booking.cannotReachSalon", lang)}
            </div>
          )}

          {slotsStatus === "ready" && offers.length === 0 && (
            <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
              {t("booking.noSlotsAvailable", lang)}
            </div>
          )}

          {slotsStatus === "ready" && offers.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {offers.map((offer) => {
                const isSelected = selectedTime === offer.time;
                const freeCount = offer.technicianIds.length;
                return (
                  <button
                    key={offer.time}
                    type="button"
                    onClick={() => onSelectTime(offer)}
                    className={cn(
                      "py-3 px-2 rounded-xl text-center transition-all border",
                      isSelected
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md shadow-pink-200"
                        : "bg-white border-pink-100 text-gray-800 hover:border-pink-300 hover:bg-pink-50/50"
                    )}
                  >
                    <span className="block text-sm font-black">
                      {offer.time}
                    </span>
                    {technicianChoice === "any" && (
                      <span
                        className={cn(
                          "block text-[10px] mt-0.5 font-medium truncate",
                          isSelected ? "text-white/80" : "text-gray-400"
                        )}
                      >
                        {freeCount} {t("booking.staffFree", lang)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
