"use client";

import { useLanguage } from "@/context/LanguageContext";
import { formatDuration, formatPrice, groupServices, orderedCategories, categoryLabels } from "@/lib/service-utils";
import type { CatalogueService } from "@/lib/vitech/catalogue";
import { t } from "@/lib/translations";
import { Clock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ServiceStepProps {
  services: CatalogueService[];
  selectedServiceId: string;
  onSelectService: (service: CatalogueService) => void;
  status: "loading" | "ready" | "failed";
}

export default function ServiceStep({
  services,
  selectedServiceId,
  onSelectService,
  status,
}: ServiceStepProps) {
  const { lang } = useLanguage();

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-8 text-center text-gray-400">
        {t("booking.loadingServices", lang)}
      </div>
    );
  }

  if (status === "failed" && services.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
        {t("booking.servicesFailed", lang)}
      </div>
    );
  }

  const grouped = groupServices(services);
  const categories = orderedCategories(grouped);

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-black mb-2 text-gray-900">
        {t("booking.selectService", lang)}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        {t("booking.selectServiceDesc", lang)}
      </p>

      <div className="space-y-8">
        {categories.map((catKey) => {
          const list = grouped[catKey] || [];
          if (list.length === 0) return null;
          const label = categoryLabels[catKey] || catKey;

          return (
            <div key={catKey}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-pink-600 mb-3">
                {label}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {list.map((s) => {
                  const isSelected = s.id === selectedServiceId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onSelectService(s as CatalogueService)}
                      className={cn(
                        "text-left p-4 rounded-2xl border transition-all flex items-center gap-3",
                        isSelected
                          ? "border-pink-500 bg-pink-50/80 shadow-md shadow-pink-100 ring-2 ring-pink-400"
                          : "border-gray-100 bg-white hover:border-pink-200 hover:shadow-sm"
                      )}
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-500 font-bold text-lg shrink-0 overflow-hidden">
                        {s.image ? (
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          s.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <Clock size={12} />
                          {formatDuration(s.duration)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-pink-600 text-sm">
                          {formatPrice(s.price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
