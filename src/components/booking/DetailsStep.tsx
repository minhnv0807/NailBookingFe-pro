"use client";

import { useLanguage } from "@/context/LanguageContext";
import { formatDuration, formatPrice } from "@/lib/service-utils";
import type { CatalogueService, CatalogueTechnician } from "@/lib/vitech/catalogue";
import type { SlotOffer } from "@/lib/vitech/booking";
import { t } from "@/lib/translations";
import { ShieldCheck, Calendar, Clock, User, Sparkles } from "lucide-react";

export interface DetailsStepProps {
  service: CatalogueService | null;
  date: string;
  offer: SlotOffer | null;
  technicianChoice: "any" | string;
  technicians: CatalogueTechnician[];
}

export default function DetailsStep({
  service,
  date,
  offer,
  technicianChoice,
  technicians,
}: DetailsStepProps) {
  const { lang } = useLanguage();

  const chosenTechnicianName =
    technicianChoice === "any"
      ? t("booking.anyAvailable", lang)
      : technicians.find((t) => t.id === technicianChoice)?.name || technicianChoice;

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-black mb-2 text-gray-900">
        {t("booking.confirmDetails", lang)}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        {t("booking.detailsPlaceholderDesc", lang)}
      </p>

      {/* Summary card */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-3xl p-6 sm:p-7 border border-pink-100 shadow-sm space-y-4">
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
              {offer?.time || "—"}
              {service?.duration ? ` · ${formatDuration(service.duration)}` : ""}
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

          <div className="flex justify-between items-center gap-4 pt-3 border-t border-pink-100/70 text-base">
            <span className="font-bold text-gray-900">
              {t("booking.total", lang)}
            </span>
            <span className="font-black text-pink-600">
              {service ? formatPrice(service.price) : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-5 text-center text-xs text-gray-500">
        {t("booking.detailsStepNotice", lang)}
      </div>

      <button
        type="button"
        disabled
        className="w-full mt-6 py-4 text-base font-bold rounded-2xl bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
      >
        {t("booking.submit", lang)}
      </button>
    </div>
  );
}
