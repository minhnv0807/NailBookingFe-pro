"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Footprints, Sparkles, Scissors, Star, Droplets, ChevronDown, Clock, ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import { categoryLabels, formatDuration, formatPrice, groupServices, orderedCategories, type PublicService } from "@/lib/service-utils";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import { useShopCatalogue } from "@/lib/vitech/useShopCatalogue";
import salonData from "@/data/salon-data.json";

const icons: Record<string, React.ElementType> = {
  extensions_hands: Hand,
  extensions_feet: Footprints,
  gel_polish: Sparkles,
  mani_pedi: Scissors,
  extras: Star,
  waxing: Droplets,
};

const gradients = [
  "from-pink-500 to-rose-400", "from-violet-500 to-purple-400", "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400", "from-sky-500 to-cyan-400", "from-fuchsia-500 to-pink-400",
];

export default function Services() {
  const { lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);
  const { status, services } = useShopCatalogue();

  const grouped = groupServices(services);
  const cats = orderedCategories(grouped);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? -1 : i);
  const handleBook = (service: PublicService) => {
    if (typeof window !== "undefined") localStorage.setItem("selectedService", service.id);
  };

  return (
    <section id="services" className="section-padding bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-pink-500 font-semibold mb-3">{t("services.badge", lang)}</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gradient">{t("services.title", lang)}</h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto">{t("services.subtitle", lang)}</p>
        </motion.div>

        {status === "loading" && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-pink-100/60 p-5 animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-pink-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-pink-100 rounded" />
                    <div className="h-3 w-20 bg-pink-50 rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-pink-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {status === "failed" && (
          <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center text-gray-500 shadow-sm">
            <p className="text-lg">Our price list isn&apos;t available right now — please call the salon on {salonData.salon.phone}</p>
          </div>
        )}

        {status === "ready" && (
        <div className="space-y-3">
          {cats.map((catKey, i) => {
            const Icon = icons[catKey] || Sparkles;
            const catServices = grouped[catKey] || [];
            const isOpen = openIndex === i;
            const minPrice = Math.min(...catServices.map((service) => service.price));
            return (
              <div key={catKey} className="bg-white rounded-2xl border border-pink-100/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button onClick={() => toggle(i)} className="w-full flex items-center justify-between p-5 text-left">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white shadow-sm`}><Icon size={20} /></div>
                    <div><p className="font-bold text-gray-900 text-lg">{categoryLabels[catKey] || catKey}</p><p className="text-sm text-gray-400">{catServices.length} {t("services.serviceCount", lang)}{catServices.length !== 1 ? "s" : ""}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-medium">{t("services.from", lang)} {formatPrice(minPrice || 0)}</span>
                    <div className={`w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}><ChevronDown size={18} /></div>
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="border-t border-pink-50 px-5 pb-5 pt-2 space-y-2">
                        {catServices.map((service) => (
                          <div key={service.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-pink-50/50 transition-colors group">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-pink-50 flex items-center justify-center text-pink-400">
                              {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover" /> : <ImageIcon size={18} />}
                            </div>
                            <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm truncate">{service.name}</p><div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5"><Clock size={12} /><span>{formatDuration(service.duration)}</span></div></div>
                            <p className="font-bold text-pink-600 text-sm shrink-0">{formatPrice(service.price)}</p>
                            <Link href="/booking" onClick={() => handleBook(service)} className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-pink-200/50 transition-all hover:-translate-y-0.5">{t("services.book", lang)} <ArrowRight size={14} /></Link>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
