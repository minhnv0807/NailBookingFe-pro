import type { BookingRequest, VitechSlot } from "./client.ts";

export const SECURITY_CHECK_FAILED = "Please complete the security check and try again.";
export const CANNOT_REACH = "We couldn't reach the salon's booking system — try again or call the salon";
export const IDEMPOTENCY_CONFLICT = "Idempotency-Key already used with a different body";
export const PHONE_ERROR_PREFIX = "Please enter a valid phone number";

export function phoneLooksDialable(raw: string): boolean {
  const digits = raw.replace(/[^\d*]/g, "");
  return digits.length >= 8 && digits.length <= 17;
}

export function isPhoneError(detail: string): boolean {
  return detail.startsWith(PHONE_ERROR_PREFIX);
}

export function bookingErrorMessage(status: number, detail: string): string {
  // A refused promo code is a 400 too (shop_promo.consume), so the API's own
  // sentence wins; the security-check wording is for a 400 that says nothing.
  if (status === 400) return detail || SECURITY_CHECK_FAILED;
  if (status === 404) return "This option is no longer available. Please start your booking again.";
  if (status === 409) {
    if (detail === IDEMPOTENCY_CONFLICT) {
      return "This booking was already sent with different details. Refresh the page, or call the salon to check.";
    }
    return detail || "We couldn't take this booking online — please call the salon";
  }
  if (status === 422) return detail || "Please check your details and try again.";
  if (status === 429) return "Too many attempts. Please try again later.";
  if (status === 503 || status === 0) return CANNOT_REACH;
  return "We could not complete this booking. Please try again.";
}

export function bookingReference(id: string): string {
  return `NL-${id.slice(-8).toUpperCase()}`;
}

export interface SlotOffer {
  time: string;
  end: string;
  technicianIds: string[];
}

export function mergeSlotOffers(
  perTechnician: ReadonlyArray<{ technicianId: string; slots: ReadonlyArray<VitechSlot> }>,
): SlotOffer[] {
  const slotMap = new Map<string, { end: string; technicianIds: string[] }>();

  for (const { technicianId, slots } of perTechnician) {
    for (const slot of slots) {
      const existing = slotMap.get(slot.time);
      if (existing) {
        if (!existing.technicianIds.includes(technicianId)) {
          existing.technicianIds.push(technicianId);
        }
      } else {
        slotMap.set(slot.time, {
          end: slot.end,
          technicianIds: [technicianId],
        });
      }
    }
  }

  const times = Array.from(slotMap.keys()).sort();
  return times.map((time) => {
    const data = slotMap.get(time)!;
    return {
      time,
      end: data.end,
      technicianIds: [...data.technicianIds],
    };
  });
}

export function todayIn(timeZone: string, now?: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export interface BookingDraft {
  shopSlug: string;
  serviceId: string;
  technicianId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  promoCode?: string;
  turnstileToken?: string;
}

export function buildBookingRequest(draft: BookingDraft): BookingRequest {
  const req: BookingRequest = {
    shop_slug: draft.shopSlug.trim(),
    service_id: draft.serviceId.trim(),
    technician_id: draft.technicianId.trim(),
    customer_name: draft.name.trim(),
    customer_phone: draft.phone.trim(),
    booking_date: draft.date.trim(),
    booking_time: draft.time.trim(),
  };

  const email = draft.email?.trim();
  if (email) {
    req.customer_email = email;
  }

  const notes = draft.notes?.trim();
  if (notes) {
    req.notes = notes;
  }

  const promoCode = draft.promoCode?.trim();
  if (promoCode) {
    req.promo_code = promoCode;
  }

  const turnstileToken = draft.turnstileToken?.trim();
  if (turnstileToken) {
    req.turnstile_token = turnstileToken;
  }

  return req;
}
