"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/service-utils";
import { bookingReference } from "@/lib/vitech/booking";
import { vitech } from "@/lib/vitech/env";
import type { CreatedBooking } from "@/lib/vitech/client";
import { CheckCircle2, Calendar, Clock, User, Phone, Home, Sparkles } from "lucide-react";

export interface BookingSuccessProps {
  booking: CreatedBooking;
  serviceName: string;
  technicianName: string;
  salonPhone: string;
  hasRewards?: boolean;
}

export default function BookingSuccess({
  booking,
  serviceName,
  technicianName,
  salonPhone,
  hasRewards = false,
}: BookingSuccessProps) {
  const refCode = bookingReference(booking.id);
  const icsDownloadUrl = vitech.icsUrl(booking.id);
  const finalPrice = booking.charged_price ?? booking.list_price ?? 0;

  return (
    <div className="max-w-xl mx-auto py-8 px-4 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-50">
        <CheckCircle2 size={44} />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          You&apos;re booked!
        </h2>
        <p className="text-sm text-gray-500">
          Booking Reference:{" "}
          <span className="font-mono font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full text-base">
            {refCode}
          </span>
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-pink-100 shadow-sm text-left space-y-4">
        <div className="flex justify-between items-start gap-4">
          <span className="text-gray-500 flex items-center gap-1.5 text-sm">
            <Sparkles size={16} className="text-pink-500 shrink-0" />
            Service
          </span>
          <span className="font-bold text-gray-900 text-sm text-right">
            {serviceName}
          </span>
        </div>

        <div className="flex justify-between items-center gap-4 text-sm">
          <span className="text-gray-500 flex items-center gap-1.5">
            <Calendar size={16} className="text-pink-500 shrink-0" />
            Date
          </span>
          <span className="font-semibold text-gray-900">{booking.booking_date}</span>
        </div>

        <div className="flex justify-between items-center gap-4 text-sm">
          <span className="text-gray-500 flex items-center gap-1.5">
            <Clock size={16} className="text-pink-500 shrink-0" />
            Time
          </span>
          <span className="font-semibold text-gray-900">
            {booking.booking_time}
            {booking.end_time ? ` - ${booking.end_time}` : ""}
          </span>
        </div>

        <div className="flex justify-between items-center gap-4 text-sm">
          <span className="text-gray-500 flex items-center gap-1.5">
            <User size={16} className="text-pink-500 shrink-0" />
            Technician
          </span>
          <span className="font-semibold text-gray-900">{technicianName}</span>
        </div>

        <div className="flex justify-between items-center gap-4 pt-3 border-t border-pink-100/70 text-sm font-bold">
          <span className="text-gray-700">Total Price</span>
          <span className="text-pink-600 font-extrabold text-base">
            {formatPrice(finalPrice)}
          </span>
        </div>
      </div>

      {/* Add to Calendar button */}
      <div>
        <a
          href={icsDownloadUrl}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold rounded-2xl transition-all text-sm shadow-sm"
        >
          <Calendar size={18} />
          <span>Add to calendar (.ics)</span>
        </a>
      </div>

      {/* Rewards notice if shop has public loyalty rewards */}
      {hasRewards && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-2xl">
          Check your points at the salon after your visit.
        </div>
      )}

      {/* Modification Notice */}
      <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
        <Phone size={13} className="text-pink-500" />
        <span>Need to change it? Call the salon on {salonPhone}.</span>
      </p>

      {/* Back to Home button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 font-semibold transition-colors"
        >
          <Home size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
