import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { VitechError, createVitechClient, errorDetail } from "./client.ts";

type Call = { url: string; init: RequestInit };
const CONFIG = { apiUrl: "https://api.example.test", shopSlug: "the-nail-lounge-stokesley" };

function fakeFetch(status: number, body: unknown, calls: Call[]) {
  return async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  };
}

const BOOKING = {
  shop_slug: "the-nail-lounge-stokesley",
  service_id: "svc-1",
  technician_id: "tech-1",
  customer_name: "Sarah Jones",
  customer_phone: "07700 900123",
  booking_date: "2026-10-05",
  booking_time: "10:00",
};

describe("createVitechClient", () => {
  it("reads the shop without credentials or an Authorization header", async () => {
    const calls: Call[] = [];
    await createVitechClient(CONFIG, fakeFetch(200, { shop: {}, services: [], technicians: [] }, calls)).getShop();
    assert.equal(calls[0].url, "https://api.example.test/api/shops/the-nail-lounge-stokesley");
    assert.equal(calls[0].init.credentials, "omit");
    assert.equal(new Headers(calls[0].init.headers).has("Authorization"), false);
  });

  it("asks availability for one service, one day and one technician", async () => {
    const calls: Call[] = [];
    const client = createVitechClient(CONFIG, fakeFetch(200, { available_slots: [], date: "2026-10-05" }, calls));
    await client.getAvailability({ serviceId: "svc-1", date: "2026-10-05", technicianId: "tech-1" });
    assert.equal(
      calls[0].url,
      "https://api.example.test/api/shops/the-nail-lounge-stokesley/availability?service_id=svc-1&date=2026-10-05&technician_id=tech-1",
    );
  });

  it("posts a booking with its Idempotency-Key and nothing else attached", async () => {
    const calls: Call[] = [];
    const client = createVitechClient(CONFIG, fakeFetch(200, { booking: { id: "b-1" }, message: "Booking confirmed!" }, calls));
    await client.createBooking(BOOKING, "3f2b8c1e-aaaa-bbbb-cccc-123456789abc");
    const headers = new Headers(calls[0].init.headers);
    assert.equal(calls[0].url, "https://api.example.test/api/bookings");
    assert.equal(calls[0].init.method, "POST");
    assert.equal(headers.get("Idempotency-Key"), "3f2b8c1e-aaaa-bbbb-cccc-123456789abc");
    assert.equal(headers.get("Content-Type"), "application/json");
    assert.equal(headers.has("Authorization"), false);
    assert.equal(calls[0].init.credentials, "omit");
    assert.deepEqual(JSON.parse(String(calls[0].init.body)), BOOKING);
  });

  it("previews a promo code for this shop", async () => {
    const calls: Call[] = [];
    const client = createVitechClient(CONFIG, fakeFetch(200, { valid: true }, calls));
    await client.validatePromo("NAIL20", "31.00");
    assert.equal(calls[0].url, "https://api.example.test/api/v1/promo-codes/validate");
    assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
      shop_slug: "the-nail-lounge-stokesley",
      code: "NAIL20",
      list_price: "31.00",
    });
  });

  it("lists this shop's public rewards and builds the calendar link", async () => {
    const calls: Call[] = [];
    const client = createVitechClient(CONFIG, fakeFetch(200, { rewards: [] }, calls));
    await client.getPublicRewards();
    assert.equal(calls[0].url, "https://api.example.test/api/v1/loyalty/public/rewards?shop_slug=the-nail-lounge-stokesley");
    assert.equal(
      client.icsUrl("b-1"),
      "https://api.example.test/ics/booking/b-1.ics?shop_slug=the-nail-lounge-stokesley",
    );
  });

  it("turns a refusal into a VitechError with the status and the API's own words", async () => {
    const client = createVitechClient(CONFIG, fakeFetch(409, { detail: "That technician is already booked for this time" }, []));
    await assert.rejects(
      client.createBooking(BOOKING, "3f2b8c1e-aaaa-bbbb-cccc-123456789abc"),
      (error: unknown) =>
        error instanceof VitechError &&
        error.status === 409 &&
        error.message === "That technician is already booked for this time",
    );
  });

  it("reports a dropped connection or a CORS refusal as status 0", async () => {
    const client = createVitechClient(CONFIG, async () => {
      throw new TypeError("Failed to fetch");
    });
    await assert.rejects(client.getShop(), (error: unknown) => error instanceof VitechError && error.status === 0);
  });
});

describe("errorDetail", () => {
  it("reads FastAPI's string detail, its validation list and the platform envelope", () => {
    assert.equal(errorDetail({ detail: "Shop not found" }), "Shop not found");
    assert.equal(errorDetail({ detail: [{ msg: "Field required", loc: ["body", "customer_name"] }] }), "Field required");
    assert.equal(errorDetail({ error: { code: "x", detail: "Nested" } }), "Nested");
    assert.equal(errorDetail(null), "");
  });
});
