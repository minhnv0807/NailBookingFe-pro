import type { VitechService, VitechTechnician } from "./client.ts";

export interface CatalogueService {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string | null;
  image: string | null;
  active: boolean;
}

export interface CatalogueTechnician {
  id: string;
  name: string;
  role: string | null;
}

export function categoryKey(raw: string | null | undefined): string {
  if (raw == null) {
    return "uncategorized";
  }
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleaned.length > 0 ? cleaned : "uncategorized";
}

export function mapServices(
  rows: VitechService[],
  imageFor?: (name: string) => string | null,
): CatalogueService[] {
  return rows.map((row) => {
    const trimmedName = row.name.trim();
    const parsedPrice = Number(row.price);
    const safePrice = Number.isFinite(parsedPrice) ? Number(parsedPrice.toFixed(2)) : 0;

    return {
      id: row.id,
      name: trimmedName,
      category: categoryKey(row.category),
      price: safePrice,
      duration: row.duration_minutes,
      description: null,
      image: imageFor ? imageFor(trimmedName) : null,
      active: true,
    };
  });
}

export function mapTechnicians(rows: VitechTechnician[]): CatalogueTechnician[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role ?? null,
  }));
}
