"use client";

import { useEffect, useState } from "react";
import { fallbackServices } from "@/lib/service-utils";
import { mapServices, mapTechnicians, type CatalogueService, type CatalogueTechnician } from "./catalogue";
import { vitech } from "./env";

export interface ShopCatalogueState {
  status: "loading" | "ready" | "failed";
  shopName: string;
  timezone: string;
  services: CatalogueService[];
  technicians: CatalogueTechnician[];
}

export function useShopCatalogue(): ShopCatalogueState {
  const [state, setState] = useState<ShopCatalogueState>({
    status: "loading",
    shopName: "The Nail Lounge @ Stokesley",
    timezone: "Europe/London",
    services: [],
    technicians: [],
  });

  useEffect(() => {
    let active = true;

    async function fetchCatalogue() {
      try {
        const detail = await vitech.getShop();
        if (!active) return;

        const fallbackMap = new Map<string, string | null>();
        for (const item of fallbackServices()) {
          fallbackMap.set(item.name.toLowerCase().trim(), item.image ?? null);
        }

        const services = mapServices(detail.services, (name: string): string | null => {
          const img = fallbackMap.get(name.toLowerCase().trim());
          return img ?? null;
        });

        const technicians = mapTechnicians(detail.technicians);

        setState({
          status: "ready",
          shopName: detail.shop?.name || "The Nail Lounge @ Stokesley",
          timezone: detail.shop?.timezone || "Europe/London",
          services,
          technicians,
        });
      } catch {
        if (!active) return;
        setState((prev) => ({
          ...prev,
          status: "failed",
        }));
      }
    }

    fetchCatalogue();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
