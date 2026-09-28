import type { VitechConfig } from "./config.ts";

export interface VitechService {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  price: number | string;
  currency?: string;
}

export interface VitechTechnician {
  id: string;
  name: string;
  role: string | null;
}

export interface VitechShopDetail {
  shop: {
    id: string;
    name: string;
    slug: string;
    timezone?: string;
  };
  services: VitechService[];
  technicians: VitechTechnician[];
}

export interface VitechSlot {
  time: string;
  end: string;
}

export interface AvailabilityResponse {
  date: string;
  available_slots: VitechSlot[];
}

export interface BookingRequest {
  shop_slug: string;
  service_id: string;
  technician_id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  customer_email?: string;
  notes?: string;
  turnstile_token?: string;
}

export interface CreatedBooking {
  id: string;
  shop_slug: string;
  service_id: string;
  technician_id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number | string;
  created_at?: string;
}

export interface BookingCreateResponse {
  booking: CreatedBooking;
  message: string;
}

export interface PromoValidationResponse {
  valid: boolean;
  promo?: unknown;
  list_price?: string;
  discount_amount?: string;
  charged_price?: string;
}

export interface PublicRewardsResponse {
  rewards: unknown[];
}

export class VitechError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "VitechError";
    this.status = status;
  }
}

export function errorDetail(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "";
  }
  const obj = body as Record<string, unknown>;
  if (typeof obj.detail === "string") {
    return obj.detail;
  }
  if (Array.isArray(obj.detail) && obj.detail.length > 0) {
    const first = obj.detail[0] as Record<string, unknown> | undefined;
    if (first && typeof first.msg === "string") {
      return first.msg;
    }
  }
  if (obj.error && typeof obj.error === "object") {
    const err = obj.error as Record<string, unknown>;
    if (typeof err.detail === "string") {
      return err.detail;
    }
  }
  return "";
}

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export function createVitechClient(
  config: Pick<VitechConfig, "apiUrl" | "shopSlug">,
  fetchImpl?: FetchLike,
) {
  const { apiUrl, shopSlug } = config;
  const doFetch: FetchLike = fetchImpl ?? ((url, init) => fetch(url, init));

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
      // The salon site never holds a Vi-Tech session; the API allows this origin for public calls only.
      response = await doFetch(`${apiUrl}${path}`, {
        ...init,
        headers,
        credentials: "omit",
        cache: "no-store",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new VitechError(msg, 0);
    }

    if (!response.ok) {
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }
      throw new VitechError(errorDetail(body), response.status);
    }

    return (await response.json()) as T;
  }

  return {
    async getShop(): Promise<VitechShopDetail> {
      return request<VitechShopDetail>(`/api/shops/${encodeURIComponent(shopSlug)}`);
    },

    async getAvailability(params: {
      serviceId: string;
      date: string;
      technicianId: string;
    }): Promise<AvailabilityResponse> {
      const qs = new URLSearchParams({
        service_id: params.serviceId,
        date: params.date,
        technician_id: params.technicianId,
      });
      return request<AvailabilityResponse>(
        `/api/shops/${encodeURIComponent(shopSlug)}/availability?${qs.toString()}`,
      );
    },

    async createBooking(body: BookingRequest, idempotencyKey: string): Promise<BookingCreateResponse> {
      return request<BookingCreateResponse>("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(body),
      });
    },

    async validatePromo(code: string, listPrice: string): Promise<PromoValidationResponse> {
      return request<PromoValidationResponse>("/api/v1/promo-codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shop_slug: shopSlug,
          code,
          list_price: listPrice,
        }),
      });
    },

    async getPublicRewards(): Promise<PublicRewardsResponse> {
      return request<PublicRewardsResponse>(
        `/api/v1/loyalty/public/rewards?shop_slug=${encodeURIComponent(shopSlug)}`,
      );
    },

    icsUrl(bookingId: string): string {
      return `${apiUrl}/ics/booking/${encodeURIComponent(bookingId)}.ics?shop_slug=${encodeURIComponent(shopSlug)}`;
    },
  };
}
