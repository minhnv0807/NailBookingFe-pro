/** Build-time settings for talking to Vi-Tech: read once, validated, never guessed.
 *
 * A wrong or missing API URL must fail the build rather than ship a site that
 * quietly books into the wrong system (Vi-Tech's own web once called its
 * staging API from production for exactly this reason).
 */
export interface VitechConfig {
  apiUrl: string;
  shopSlug: string;
  turnstileSiteKey: string;
}

export type VitechEnv = {
  NEXT_PUBLIC_VITECH_API_URL?: string;
  NEXT_PUBLIC_VITECH_SHOP_SLUG?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
};

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

function originOnly(raw: string): URL | null {
  try {
    const url = new URL(raw);
    const okScheme = url.protocol === "https:" || url.protocol === "http:";
    return okScheme && url.pathname === "/" && !url.search && !url.hash ? url : null;
  } catch {
    return null;
  }
}

export function readVitechConfig(env: VitechEnv): VitechConfig {
  const apiUrl = (env.NEXT_PUBLIC_VITECH_API_URL ?? "").trim().replace(/\/+$/, "");
  if (!originOnly(apiUrl)) {
    throw new Error("NEXT_PUBLIC_VITECH_API_URL must be an origin such as https://api.vi-tech.uk");
  }
  const shopSlug = (env.NEXT_PUBLIC_VITECH_SHOP_SLUG ?? "").trim();
  if (!SLUG.test(shopSlug)) {
    throw new Error("NEXT_PUBLIC_VITECH_SHOP_SLUG must be the shop's Vi-Tech slug");
  }
  return { apiUrl, shopSlug, turnstileSiteKey: (env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim() };
}
