import { readVitechConfig } from "./config";

// Next inlines NEXT_PUBLIC_* only where the property is written out in full,
// so each one is spelled here instead of handing process.env over.
export const vitechConfig = readVitechConfig({
  NEXT_PUBLIC_VITECH_API_URL: process.env.NEXT_PUBLIC_VITECH_API_URL,
  NEXT_PUBLIC_VITECH_SHOP_SLUG: process.env.NEXT_PUBLIC_VITECH_SHOP_SLUG,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});
