"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import { useShopCatalogue } from "@/lib/vitech/useShopCatalogue";
import { vitech } from "@/lib/vitech/env";
import {
  mergeSlotOffers,
  todayIn,
  type SlotOffer,
} from "@/lib/vitech/booking";
import type { VitechSlot } from "@/lib/vitech/client";
import ServiceStep from "@/components/booking/ServiceStep";
import DateStep from "@/components/booking/DateStep";
import TimeStep from "@/components/booking/TimeStep";
import DetailsStep from "@/components/booking/DetailsStep";
import BookingSuccess from "@/components/booking/BookingSuccess";
import { type TurnstileHandle } from "@/components/booking/TurnstileWidget";
import {
  bookingErrorMessage,
  buildBookingRequest,
  isPhoneError,
  phoneLooksDialable,
} from "@/lib/vitech/booking";
import { vitechConfig } from "@/lib/vitech/env";
import { VitechError, type CreatedBooking } from "@/lib/vitech/client";
import salonData from "@/data/salon-data.json";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BookingPage() {
  const { lang } = useLanguage();
  const catalogue = useShopCatalogue();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [technicianChoice, setTechnicianChoice] = useState<"any" | string>("any");
  const [offers, setOffers] = useState<SlotOffer[]>([]);
  const [slotsStatus, setSlotsStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [time, setTime] = useState<string>("");
  const [slotNotice, setSlotNotice] = useState<string>("");

  // Customer contact info (Step 4)
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [bookingError, setBookingError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [confirmed, setConfirmed] = useState<{ booking: CreatedBooking; technicianId: string } | null>(null);
  const [hasRewards, setHasRewards] = useState<boolean>(false);

  const turnstileRef = useRef<TurnstileHandle>(null);
  const keyRef = useRef<{ key: string; fingerprint: string } | null>(null);

  const minDate = todayIn(catalogue.timezone || "Europe/London");
  const requestSeq = useRef(0);

  // Check public rewards on load
  useEffect(() => {
    vitech
      .getPublicRewards()
      .then((res) => {
        if (res?.rewards && res.rewards.length > 0) {
          setHasRewards(true);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize service from localStorage or default
  useEffect(() => {
    if (catalogue.status !== "ready" || catalogue.services.length === 0) return;
    if (serviceId) return;

    const saved = typeof window !== "undefined" ? localStorage.getItem("selectedService") : "";
    if (saved) {
      const match = catalogue.services.find((s) => s.id === saved || s.name === saved);
      if (match) {
        queueMicrotask(() => {
          setServiceId(match.id);
        });
      }
    }
  }, [catalogue.status, catalogue.services, serviceId]);

  // Default date to today in salon timezone if not set
  useEffect(() => {
    if (!date && minDate) {
      queueMicrotask(() => {
        setDate(minDate);
      });
    }
  }, [date, minDate]);

  // Load slots when on step 3 or whenever serviceId, date, technicianChoice change
  useEffect(() => {
    if (step < 3 || !serviceId || !date) {
      return;
    }

    const currentSeq = ++requestSeq.current;

    async function loadSlots() {
      setSlotsStatus("loading");
      setSlotNotice("");

      const techsToQuery =
        technicianChoice === "any"
          ? catalogue.technicians
          : catalogue.technicians.filter((t) => t.id === technicianChoice);

      if (techsToQuery.length === 0) {
        if (requestSeq.current === currentSeq) {
          setOffers([]);
          setSlotsStatus("ready");
        }
        return;
      }

      if (technicianChoice === "any") {
        const results = await Promise.allSettled(
          techsToQuery.map(async (st) => {
            const res = await vitech.getAvailability({
              serviceId,
              date,
              technicianId: st.id,
            });
            return { technicianId: st.id, slots: res.available_slots };
          })
        );

        if (requestSeq.current !== currentSeq) return;

        const fulfilled = results
          .filter(
            (
              r
            ): r is PromiseFulfilledResult<{
              technicianId: string;
              slots: VitechSlot[];
            }> => r.status === "fulfilled"
          )
          .map((r) => r.value);

        if (fulfilled.length === 0) {
          setOffers([]);
          setSlotsStatus("failed");
          return;
        }

        const merged = mergeSlotOffers(fulfilled);
        setOffers(merged);
        setSlotsStatus("ready");
      } else {
        try {
          const res = await vitech.getAvailability({
            serviceId,
            date,
            technicianId: technicianChoice,
          });

          if (requestSeq.current !== currentSeq) return;

          const merged = mergeSlotOffers([
            { technicianId: technicianChoice, slots: res.available_slots },
          ]);
          setOffers(merged);
          setSlotsStatus("ready");
        } catch {
          if (requestSeq.current !== currentSeq) return;
          setOffers([]);
          setSlotsStatus("failed");
        }
      }
    }

    loadSlots();
  }, [step, serviceId, date, technicianChoice, catalogue.technicians]);

  const selectedService = catalogue.services.find((s) => s.id === serviceId) || null;
  const selectedOffer = offers.find((o) => o.time === time) || null;

  function handleSelectService(s: { id: string; name: string }) {
    setServiceId(s.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedService", s.id);
    }
  }

  function handleTechnicianChange(choice: "any" | string) {
    setTechnicianChoice(choice);
    setTime("");
  }

  function handleSelectTime(offer: SlotOffer) {
    setTime(offer.time);
  }

  async function handleConfirmBooking() {
    if (!selectedService || !selectedOffer || !name.trim() || !phoneLooksDialable(phone)) return;
    const needsTurnstile = Boolean(vitechConfig.turnstileSiteKey);
    if (needsTurnstile && !turnstileToken) return;

    const technicianId =
      technicianChoice === "any" ? selectedOffer.technicianIds[0] : technicianChoice;

    const body = buildBookingRequest({
      shopSlug: vitechConfig.shopSlug,
      serviceId: selectedService.id,
      technicianId,
      date,
      time: selectedOffer.time,
      name,
      phone,
      email,
      notes,
      promoCode,
      turnstileToken,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { turnstile_token: _token, ...hashed } = body;
    const fingerprint = JSON.stringify(hashed);
    if (!keyRef.current || keyRef.current.fingerprint !== fingerprint) {
      keyRef.current = { key: crypto.randomUUID(), fingerprint };
    }

    setSubmitting(true);
    setBookingError("");
    setPhoneError("");

    try {
      const res = await vitech.createBooking(body, keyRef.current.key);
      keyRef.current = null;
      setConfirmed({ booking: res.booking, technicianId });
    } catch (error) {
      turnstileRef.current?.reset();
      const status = error instanceof VitechError ? error.status : 0;
      const detail = error instanceof Error ? error.message : "";

      if (status === 422 && isPhoneError(detail)) {
        setPhoneError(detail);
      } else if (status === 409 && detail === "That technician is already booked for this time") {
        setStep(3);
        setSlotNotice("That time was just taken — please choose another.");
      } else if (status === 422 && detail.startsWith("That appointment time")) {
        setStep(3);
        setSlotNotice(detail);
      } else {
        setBookingError(bookingErrorMessage(status, detail));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const canProceed =
    (step === 1 && Boolean(serviceId)) ||
    (step === 2 && Boolean(date) && date >= minDate) ||
    (step === 3 && Boolean(time));

  function handleNext() {
    if (!canProceed) return;
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  }

  if (confirmed) {
    const technicianName =
      catalogue.technicians.find((t) => t.id === confirmed.technicianId)?.name ||
      "Any available technician";

    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/20">
          <BookingSuccess
            booking={confirmed.booking}
            serviceName={selectedService?.name || "Service"}
            technicianName={technicianName}
            salonPhone={salonData.salon.phone}
            hasRewards={hasRewards}
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-pink-600 text-sm font-semibold mb-4">
                <Sparkles size={16} /> {t("booking.badge", lang)}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                {t("booking.title", lang)}
              </h1>
              <p className="text-gray-500">{t("booking.subtitle", lang)}</p>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
              {[
                t("booking.step.service", lang),
                t("booking.step.date", lang),
                t("booking.step.time", lang),
                t("booking.step.details", lang),
              ].map((label, i) => (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      i + 1 <= step
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {i + 1 < step ? <Check size={18} /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-1.5 font-medium",
                      i + 1 <= step ? "text-pink-600" : "text-gray-400"
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ServiceStep
                    services={catalogue.services}
                    selectedServiceId={serviceId}
                    onSelectService={handleSelectService}
                    status={catalogue.status}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <DateStep
                    date={date}
                    onChangeDate={(d) => {
                      setDate(d);
                      setTime("");
                    }}
                    minDate={minDate}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <TimeStep
                    technicians={catalogue.technicians}
                    technicianChoice={technicianChoice}
                    onChangeTechnician={handleTechnicianChange}
                    slotsStatus={slotsStatus}
                    offers={offers}
                    selectedTime={time}
                    onSelectTime={handleSelectTime}
                    date={date}
                    slotNotice={slotNotice}
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <DetailsStep
                    service={selectedService}
                    date={date}
                    offer={selectedOffer}
                    technicianChoice={technicianChoice}
                    technicians={catalogue.technicians}
                    shopName={catalogue.shopName}
                    name={name}
                    onChangeName={setName}
                    phone={phone}
                    onChangePhone={setPhone}
                    email={email}
                    onChangeEmail={setEmail}
                    notes={notes}
                    onChangeNotes={setNotes}
                    promoCode={promoCode}
                    onChangePromoCode={setPromoCode}
                    phoneError={phoneError}
                    bookingError={bookingError}
                    submitting={submitting}
                    onConfirm={handleConfirmBooking}
                    turnstileToken={turnstileToken}
                    onTurnstileToken={setTurnstileToken}
                    turnstileRef={turnstileRef}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            {step < 4 && (
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary flex-1"
                  >
                    <ChevronLeft size={18} className="mr-2" />
                    {t("booking.back", lang)}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={cn(
                    "btn-primary flex-1",
                    !canProceed && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {t("booking.next", lang)}
                  <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary flex-1"
                >
                  <ChevronLeft size={18} className="mr-2" />
                  {t("booking.back", lang)}
                </button>
              </div>
            )}

            <div className="text-center mt-6">
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-pink-500 transition-colors"
              >
                {t("booking.backToHome", lang)}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
