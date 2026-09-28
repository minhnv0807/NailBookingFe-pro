"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hand, Footprints, Sparkles, Scissors, Star, Droplets, ChevronDown, ChevronUp, Clock, ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const colors: Record<string, string> = {
  extensions_hands: "bg-pink-50 text-pink-600",
  extensions_feet: "bg-rose-50 text-rose-600",
  gel_polish: "bg-fuchsia-50 text-fuchsia-600",
  mani_pedi: "bg-pink-50 text-pink-600",
  extras: "bg-amber-50 text-amber-600",
  waxing: "bg-cyan-50 text-cyan-600",
};

export default function ServicesPage() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>("extensions_hands");
  const { status, services } = useShopCatalogue();

  const filtered = services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const grouped = groupServices(filtered);
  const cats = orderedCategories(grouped);

  const handleBook = (service: PublicService) => {
    if (typeof window !== "undefined") localStorage.setItem("selectedService", service.id);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gradient-to-b from-pink-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gradient mb-3">{t("servicesPage.title", lang)}</h1>
            <p className="text-gray-500">{t("servicesPage.subtitle", lang)}</p>
          </motion.div>

          <div className="relative max-w-md mx-auto mb-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder={t("servicesPage.search", lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none bg-white"
            />
          </div>

          {status === "loading" && (
            <div className="max-w-4xl mx-auto space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-pink-100 p-6 animate-pulse flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-100" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-pink-100 rounded" />
                      <div className="h-3 w-20 bg-pink-50 rounded" />
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-pink-50" />
                </div>
              ))}
            </div>
          )}

          {status === "failed" && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-pink-100 p-8 text-center text-gray-500 shadow-sm">
              <p className="text-lg">Our price list isn&apos;t available right now — please call the salon on {salonData.salon.phone}</p>
            </div>
          )}

          {status === "ready" && (
          <div className="max-w-4xl mx-auto space-y-3">
            {cats.map((catKey) => {
              const Icon = icons[catKey] || Sparkles;
              const catServices = grouped[catKey] || [];
              const isOpen = search ? true : openCategory === catKey;

              return (
                <motion.div
                  key={catKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl border border-pink-100/80 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => !search && setOpenCategory(isOpen ? null : catKey)}
                    className={`w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors ${search ? "" : "hover:bg-pink-50/30"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colors[catKey] || "bg-pink-50 text-pink-600"} flex items-center justify-center`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{categoryLabels[catKey] || catKey}</h3>
                        <p className="text-sm text-gray-400">{catServices.length} {t("servicesPage.services", lang)}</p>
                      </div>
                    </div>
                    {!search && (
                      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 transition-transform duration-300">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-2">
                          {catServices.map((service, idx) => (
                            <motion.div
                              key={service.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03, duration: 0.25 }}
                              className="flex items-center gap-4 p-3 rounded-xl hover:bg-pink-50/50 transition-colors group"
                            >
                              <div className="w-14 h-14 rounded-xl bg-pink-50 flex items-center justify-center text-pink-400 shrink-0 overflow-hidden">
                                {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover" /> : <ImageIcon size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{service.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <Clock size={12} />
                                  <span>{formatDuration(service.duration)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                <span className="font-bold text-pink-600 text-sm sm:text-base">{formatPrice(service.price)}</span>
                                <Link
                                  href="/booking"
                                  onClick={() => handleBook(service)}
                                  className="btn-primary text-xs sm:text-sm py-2 px-4 flex items-center gap-1 group/btn"
                                >
                                  {t("servicesPage.book", lang)}
                                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400">{t("servicesPage.noResults", lang)}</p>
              </div>
            )}
          </div>
          )}

          <div className="text-center mt-10">
            <Link href="/" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">{t("servicesPage.backToHome", lang)}</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
