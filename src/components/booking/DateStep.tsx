"use client";

import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import { CalendarDays } from "lucide-react";

export interface DateStepProps {
  date: string;
  onChangeDate: (date: string) => void;
  minDate: string;
}

export default function DateStep({
  date,
  onChangeDate,
  minDate,
}: DateStepProps) {
  const { lang } = useLanguage();

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-black mb-5 text-gray-900">
        {t("booking.selectDate", lang)}
      </h3>
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-pink-100">
        <div className="flex items-center gap-3 mb-4 text-pink-600">
          <CalendarDays size={26} className="shrink-0" />
          <span className="text-lg sm:text-xl font-black">
            {t("booking.chooseDate", lang)}
          </span>
        </div>
        <input
          type="date"
          value={date}
          min={minDate}
          onChange={(e) => onChangeDate(e.target.value)}
          className="w-full min-h-16 px-5 py-4 rounded-2xl border-2 border-pink-200 bg-white focus:ring-4 focus:ring-pink-100 focus:border-pink-400 outline-none transition-all text-xl sm:text-2xl font-black text-gray-900 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
