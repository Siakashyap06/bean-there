import { getSupabaseClient } from "./supabase";
import type { GooglePlace } from "./types";

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

// Save a batch of Google Places results to the master cafes table.
// Uses upsert on google_place_id — no duplicates.
export async function savePlacesToCache(places: GooglePlace[]) {
  const supabase = getSupabaseClient();
  if (!supabase || places.length === 0) return;

  const rows = places.map((p) => ({
    google_place_id: p.id,
    display_name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? null,
    latitude: p.location?.latitude ?? null,
    longitude: p.location?.longitude ?? null,
    rating: p.rating ?? null,
    review_count: p.userRatingCount ?? null,
    photo_names: (p.photos ?? []).slice(0, 6).map((ph) => ph.name),
    opening_hours: p.regularOpeningHours?.weekdayDescriptions ?? [],
    website: p.websiteUri ?? null,
    maps_url: p.googleMapsUri ?? null,
    categories: p.types ?? [],
    tags: deriveTagsFromPlace(p),
    source: "google_places",
    last_synced: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("cafes")
    .upsert(rows, { onConflict: "google_place_id", ignoreDuplicates: false });
  if (error) console.error(error);
}

// Merge curated metadata into master table when google_place_id is known.
export async function mergeCuratedIntoMaster(
  googlePlaceId: string,
  curated: {
    curated_name: string;
    city_area: string | null;
    category_tags: string[];
    specialty_tags: string[];
    visited_by_me: boolean;
    matcha_available: boolean;
  }
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("cafes")
    .update({
      featured: true,
      source: "curated_bean_there",
      curated_name: curated.curated_name,
      city_area: curated.city_area,
      category_tags: curated.category_tags,
      specialty_tags: curated.specialty_tags,
      visited_by_me: curated.visited_by_me,
      matcha_available: curated.matcha_available,
      updated_at: new Date().toISOString(),
    })
    .eq("google_place_id", googlePlaceId);
  if (error) console.error(error);
}

function deriveTagsFromPlace(p: GooglePlace): string[] {
  const tags: string[] = [];
  const text = (
    (p.displayName?.text ?? "") + " " + (p.editorialSummary?.text ?? "") + " " + (p.types ?? []).join(" ")
  ).toLowerCase();

  if (text.includes("matcha")) tags.push("matcha");
  if (text.includes("vietnamese") || text.includes("ca phe") || text.includes("cà phê")) tags.push("vietnamese coffee");
  if (text.includes("specialty") || text.includes("single origin") || text.includes("third wave")) tags.push("specialty coffee");
  if (text.includes("filter") || text.includes("pour over") || text.includes("pourover")) tags.push("filter coffee");
  if (text.includes("cold brew")) tags.push("cold brew");
  if (text.includes("latte") || text.includes("tiramisu")) tags.push("specialty lattes");
  if (text.includes("work") || text.includes("laptop") || text.includes("wifi")) tags.push("work friendly");
  if (text.includes("rooftop")) tags.push("rooftop");
  if (text.includes("pastry") || text.includes("bakery") || text.includes("croissant")) tags.push("pastries");
  if (text.includes("sandwich")) tags.push("sandwiches");
  if (text.includes("brunch")) tags.push("brunch");

  return tags;
}
