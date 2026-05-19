// Single source of truth for the supplement catalog. Stage 3 will enrich each
// entry with an `asin` for affiliate links; the field is optional today.
import type { Supplement } from "@/types/supplements";
export type { Supplement } from "@/types/supplements";

import {
  SUPPLEMENTS as RAW_SUPPLEMENTS,
  RED_FLAG_INGREDIENTS as RAW_RED_FLAGS,
} from "./supplementData";

export interface SupplementCatalogEntry extends Supplement {
  /** Optional Amazon ASIN for affiliate product cards. Populated in Stage 3. */
  asin?: string;
  /** URL-safe slug for the per-supplement detail route. */
  slug: string;
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SUPPLEMENT_CATALOG: SupplementCatalogEntry[] = RAW_SUPPLEMENTS.map((s) => ({
  ...s,
  slug: toSlug(s.name),
}));

export const SUPPLEMENTS = SUPPLEMENT_CATALOG;
export const RED_FLAG_INGREDIENTS = RAW_RED_FLAGS;

export function findSupplementBySlug(slug: string): SupplementCatalogEntry | undefined {
  return SUPPLEMENT_CATALOG.find((s) => s.slug === slug);
}

export function findSupplementById(id: string): SupplementCatalogEntry | undefined {
  return SUPPLEMENT_CATALOG.find((s) => s.id === id);
}
