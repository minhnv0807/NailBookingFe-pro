import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CANNOT_REACH,
  SECURITY_CHECK_FAILED,
  bookingErrorMessage,
  bookingReference,
  buildBookingRequest,
  isPhoneError,
  mergeSlotOffers,
  phoneLooksDialable,
  todayIn,
} from "./booking.ts";

describe("phoneLooksDialable", () => {
  it("accepts what the API's normaliser accepts, and no more strictly", () => {
    for (const raw of ["07512 345678", "+44 (0)7512 345678", "0044 7512 345678", "020 7946 0000", "+849****5678"]) {
      assert.equal(phoneLooksDialable(raw), true, raw);
    }
    for (const raw of ["", "12345", "abc"]) {
      assert.equal(phoneLooksDialable(raw), false, raw);
    }
  });
});

describe("bookingErrorMessage", () => {
  it("shows a 400's own words (a refused promo code) and asks for the check only when there are none", () => {
    assert.equal(bookingErrorMessage(400, "Promo code usage limit reached"), "Promo code usage limit reached");
    assert.equal(bookingErrorMessage(400, ""), SECURITY_CHECK_FAILED);
  });

  it("explains a reused booking attempt instead of echoing a header name", () => {
    assert.equal(
      bookingErrorMessage(409, "Idempotency-Key already used with a different body"),
      "This booking was already sent with different details. Refresh the page, or call the salon to check.",
    );
  });

  it("passes the salon's other 409 wording through", () => {
    assert.equal(
      bookingErrorMessage(409, "That technician is already booked for this time"),
      "That technician is already booked for this time",
    );
    assert.equal(bookingErrorMessage(409, ""), "We couldn't take this booking online — please call the salon");
  });

  it("keeps a 422's sentence and recognises the phone one", () => {
    const phone = "Please enter a valid phone number (UK numbers can start with 0)";
    assert.equal(bookingErrorMessage(422, phone), phone);
    assert.equal(isPhoneError(phone), true);
    assert.equal(isPhoneError("That appointment time has already passed. Please choose a later slot."), false);
  });

  it("covers the rest", () => {
    assert.equal(bookingErrorMessage(404, "Service not found"), "This option is no longer available. Please start your booking again.");
    assert.equal(bookingErrorMessage(429, "x"), "Too many attempts. Please try again later.");
    assert.equal(bookingErrorMessage(503, "x"), CANNOT_REACH);
    assert.equal(bookingErrorMessage(0, ""), CANNOT_REACH);
    assert.equal(bookingErrorMessage(500, "x"), "We could not complete this booking. Please try again.");
  });
});

describe("mergeSlotOffers", () => {
  it("lists each time once, with every technician free then, in the API's order", () => {
    assert.deepEqual(
      mergeSlotOffers([
        { technicianId: "t-anna", slots: [{ time: "10:30", end: "11:15" }, { time: "10:00", end: "10:45" }] },
        { technicianId: "t-mai", slots: [{ time: "10:00", end: "10:45" }] },
      ]),
      [
        { time: "10:00", end: "10:45", technicianIds: ["t-anna", "t-mai"] },
        { time: "10:30", end: "11:15", technicianIds: ["t-anna"] },
      ],
    );
    assert.deepEqual(mergeSlotOffers([]), []);
  });
});

describe("todayIn", () => {
  it("uses the salon's calendar day, not UTC's", () => {
    assert.equal(todayIn("Europe/London", new Date("2026-06-30T23:30:00Z")), "2026-07-01");
    assert.equal(todayIn("Europe/London", new Date("2026-12-31T23:30:00Z")), "2026-12-31");
  });
});

describe("buildBookingRequest", () => {
  it("trims, drops empty optional fields and never sends a head count", () => {
    const body = buildBookingRequest({
      shopSlug: "the-nail-lounge-stokesley",
      serviceId: "svc-1",
      technicianId: "t-mai",
      date: "2026-10-05",
      time: "10:00",
      name: "  Sarah Jones ",
      phone: " 07700 900123 ",
      email: "  ",
      notes: "",
      promoCode: " ",
      turnstileToken: "",
    });
    assert.deepEqual(body, {
      shop_slug: "the-nail-lounge-stokesley",
      service_id: "svc-1",
      technician_id: "t-mai",
      customer_name: "Sarah Jones",
      customer_phone: "07700 900123",
      booking_date: "2026-10-05",
      booking_time: "10:00",
    });
  });
});

describe("bookingReference", () => {
  it("keeps the old site's reference shape", () => {
    assert.equal(bookingReference("0d2c4f1a-1111-2222-3333-4455aa66bb77"), "NL-AA66BB77");
  });
});
