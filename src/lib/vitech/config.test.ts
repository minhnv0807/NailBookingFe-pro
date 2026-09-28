import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readVitechConfig } from "./config.ts";

const SLUG = "the-nail-lounge-stokesley";

describe("readVitechConfig", () => {
  it("normalises the API URL and keeps the slug", () => {
    assert.deepEqual(
      readVitechConfig({ NEXT_PUBLIC_VITECH_API_URL: "https://api.vi-tech.uk/", NEXT_PUBLIC_VITECH_SHOP_SLUG: SLUG }),
      { apiUrl: "https://api.vi-tech.uk", shopSlug: SLUG, turnstileSiteKey: "" },
    );
  });

  it("accepts a local API for development", () => {
    assert.equal(
      readVitechConfig({ NEXT_PUBLIC_VITECH_API_URL: "http://127.0.0.1:8020", NEXT_PUBLIC_VITECH_SHOP_SLUG: SLUG }).apiUrl,
      "http://127.0.0.1:8020",
    );
  });

  it("refuses a missing, relative or path-carrying API URL", () => {
    for (const bad of [undefined, "", "/api", "api.vi-tech.uk", "https://api.vi-tech.uk/api", "ftp://api.vi-tech.uk"]) {
      assert.throws(
        () => readVitechConfig({ NEXT_PUBLIC_VITECH_API_URL: bad, NEXT_PUBLIC_VITECH_SHOP_SLUG: SLUG }),
        /NEXT_PUBLIC_VITECH_API_URL/,
        String(bad),
      );
    }
  });

  it("refuses anything that is not a slug", () => {
    for (const bad of [undefined, "", "The Nail Lounge", "-shop", "shop_one"]) {
      assert.throws(
        () => readVitechConfig({ NEXT_PUBLIC_VITECH_API_URL: "https://api.vi-tech.uk", NEXT_PUBLIC_VITECH_SHOP_SLUG: bad }),
        /NEXT_PUBLIC_VITECH_SHOP_SLUG/,
        String(bad),
      );
    }
  });

  it("trims the Turnstile site key", () => {
    assert.equal(
      readVitechConfig({
        NEXT_PUBLIC_VITECH_API_URL: "https://api.vi-tech.uk",
        NEXT_PUBLIC_VITECH_SHOP_SLUG: SLUG,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: " 1x00000000000000000000AA ",
      }).turnstileSiteKey,
      "1x00000000000000000000AA",
    );
  });
});
