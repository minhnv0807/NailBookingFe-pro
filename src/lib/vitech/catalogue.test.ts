import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { categoryKey, mapServices, mapTechnicians } from "./catalogue.ts";

describe("categoryKey", () => {
  it("turns the import script's title case back into this site's keys", () => {
    assert.equal(categoryKey("Extensions Hands"), "extensions_hands");
    assert.equal(categoryKey("Mani Pedi"), "mani_pedi");
    assert.equal(categoryKey("extras"), "extras");
    assert.equal(categoryKey(null), "uncategorized");
    assert.equal(categoryKey("   "), "uncategorized");
  });
});

describe("mapServices", () => {
  it("keeps Vi-Tech's id, name, price and duration, and only borrows a picture", () => {
    const rows = [
      { id: "5b1c0000-0000-0000-0000-000000000001", name: " Gel Polish Hands ", category: "Gel Polish", duration_minutes: 45, price: "25.00", currency: "GBP" },
    ];
    assert.deepEqual(
      mapServices(rows, (name) => (name === "Gel Polish Hands" ? "/images/gallery-1.jpg" : null)),
      [{
        id: "5b1c0000-0000-0000-0000-000000000001",
        name: "Gel Polish Hands",
        category: "gel_polish",
        price: 25,
        duration: 45,
        description: null,
        image: "/images/gallery-1.jpg",
        active: true,
      }],
    );
  });

  it("reads a numeric price as pounds and a missing picture as none", () => {
    const [service] = mapServices([{ id: "s", name: "Wax", category: "Waxing", duration_minutes: 15, price: 31.5, currency: "GBP" }]);
    assert.equal(service.price, 31.5);
    assert.equal(service.image, null);
  });
});

describe("mapTechnicians", () => {
  it("keeps what the public payload carries", () => {
    assert.deepEqual(mapTechnicians([{ id: "t-1", name: "Mai", role: null }]), [{ id: "t-1", name: "Mai", role: null }]);
  });
});
