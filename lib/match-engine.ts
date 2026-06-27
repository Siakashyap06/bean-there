import type {
  GooglePlace,
  Cafe,
  TasteProfile,
  ProcessedReview,
  CuratedCafeRow,
  SpecialtyTag,
  CategoryTag,
} from "./types";

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

export function photoUrl(name: string, w = 800): string {
  return `/api/places/photo?name=${encodeURIComponent(name)}&w=${w}`;
}

function vibeFromTypes(types: string[], summary?: string): string {
  const t = types.join(" ") + " " + (summary ?? "");
  if (textContains(t, ["specialty", "single origin", "third wave", "artisan"])) return "Specialty & Craft";
  if (textContains(t, ["cozy", "cosy", "warm", "intimate"])) return "Cosy & Intimate";
  if (textContains(t, ["modern", "minimalist", "minimal"])) return "Modern & Minimal";
  if (textContains(t, ["outdoor", "garden", "terrace"])) return "Outdoors & Open";
  if (textContains(t, ["quiet", "calm", "serene", "work"])) return "Quiet & Focused";
  if (textContains(t, ["aesthetic", "instagrammable", "stylish"])) return "Aesthetic & Curated";
  if (textContains(t, ["brunch", "bakery", "pastry"])) return "Brunch & Bakes";
  return "Café & Community";
}

function textContains(text: string | undefined, keywords: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function vibeFromSpecialtyTags(tags: SpecialtyTag[]): string {
  if (tags.includes("matcha")) return "Matcha & Mindful";
  if (tags.includes("vietnamese coffee")) return "Vietnamese & Bold";
  if (tags.includes("date spot") || tags.includes("aesthetic")) return "Aesthetic & Curated";
  if (tags.includes("work friendly")) return "Quiet & Focused";
  if (tags.includes("specialty coffee")) return "Specialty & Craft";
  return "Café & Community";
}

function specialtiesFromTypes(types: string[], summary?: string): string[] {
  const result: string[] = [];
  const combined = (types.join(" ") + " " + (summary ?? "")).toLowerCase();
  if (combined.includes("espresso")) result.push("Espresso");
  if (combined.includes("cold brew")) result.push("Cold Brew");
  if (combined.includes("pour over") || combined.includes("filter")) result.push("Filter Coffee");
  if (combined.includes("latte")) result.push("Specialty Lattes");
  if (combined.includes("single origin")) result.push("Single Origin");
  if (combined.includes("brunch")) result.push("All-Day Brunch");
  if (combined.includes("bakery") || combined.includes("pastry")) result.push("Fresh Pastries");
  if (result.length === 0) result.push("House Blend", "Seasonal Drinks");
  return result.slice(0, 3);
}

function specialtiesFromTags(tags: SpecialtyTag[]): string[] {
  const map: Partial<Record<SpecialtyTag, string>> = {
    matcha: "Matcha",
    "vietnamese coffee": "Vietnamese Coffee",
    "tiramisu latte": "Tiramisu Latte",
    "burnt caramel": "Burnt Caramel Latte",
    "flat white": "Flat White",
    "filter coffee": "Filter Coffee",
    "pour over": "Pour Over",
    "single origin": "Single Origin",
    pastries: "Fresh Pastries",
    sandwiches: "Sandwiches",
    brunch: "All-Day Brunch",
  };
  return tags.flatMap((t) => (map[t] ? [map[t]!] : [])).slice(0, 3);
}

function processReviews(raw: GooglePlace["reviews"]): ProcessedReview[] {
  if (!raw) return [];
  return raw
    .filter((r) => r.text?.text && r.rating)
    .slice(0, 5)
    .map((r) => ({
      author: r.authorAttribution?.displayName ?? "Guest",
      authorPhoto: r.authorAttribution?.photoUri,
      rating: r.rating ?? 0,
      text: r.text!.text,
      timeAgo: r.relativePublishTimeDescription ?? "",
    }));
}

// ─── TasteProfile-based match scoring ────────────────────────────────────────

function computeTasteBoost(
  specialtyTags: SpecialtyTag[],
  categoryTags: CategoryTag[],
  taste: TasteProfile
): { boost: number; reasons: string[] } {
  let boost = 0;
  const reasons: string[] = [];

  // Drink match
  if (taste.drink === "matcha" && specialtyTags.includes("matcha")) { boost += 22; reasons.push("matcha"); }
  if (taste.drink === "pour-over" && (specialtyTags.includes("pour over") || specialtyTags.includes("filter coffee"))) { boost += 18; reasons.push("pour over"); }
  if (taste.drink === "espresso" && specialtyTags.includes("specialty coffee")) { boost += 12; reasons.push("espresso"); }
  if (taste.drink === "cold-brew" && specialtyTags.includes("specialty coffee")) { boost += 10; }
  if ((taste.drink === "latte" || taste.drink === "cappuccino") && (specialtyTags.includes("flat white") || specialtyTags.includes("specialty coffee"))) { boost += 10; reasons.push(taste.drink); }

  // Roast match
  if (taste.roast === "light" && (specialtyTags.includes("filter coffee") || specialtyTags.includes("pour over") || specialtyTags.includes("single origin"))) { boost += 14; reasons.push("light roast"); }
  if (taste.roast === "dark" && specialtyTags.includes("specialty coffee")) { boost += 6; }

  // Vibe match
  if ((taste.vibe === "work" || taste.vibe === "study") && (categoryTags.includes("Work Cafés") || specialtyTags.includes("work friendly"))) { boost += 16; reasons.push(taste.vibe === "work" ? "work-friendly" : "study-friendly"); }
  if (taste.vibe === "date" && (categoryTags.includes("Date Spots") || specialtyTags.includes("date spot"))) { boost += 20; reasons.push("date vibes"); }
  if ((taste.vibe === "work" || taste.vibe === "study") && specialtyTags.includes("lowkey")) { boost += 8; }
  if (taste.vibe === "quick" && specialtyTags.includes("grab and go")) { boost += 12; reasons.push("quick stop"); }
  if (taste.vibe === "social" && specialtyTags.includes("aesthetic")) { boost += 10; }

  // Sweetness match
  if (taste.sweetness === "sweet" && (specialtyTags.includes("tiramisu latte") || specialtyTags.includes("burnt caramel") || specialtyTags.includes("vietnamese coffee"))) { boost += 10; reasons.push("sweet drinks"); }
  if (taste.sweetness === "low" && (specialtyTags.includes("filter coffee") || specialtyTags.includes("single origin"))) { boost += 10; }

  // Milk match (when we have data)
  if (taste.milk === "oat" && (specialtyTags.includes("specialty coffee") || specialtyTags.includes("flat white"))) { boost += 6; }

  return { boost: Math.min(28, boost), reasons };
}

function buildMatchReason(taste: TasteProfile, reasons: string[], cafeName: string, score: number): string {
  const top = reasons.slice(0, 2);
  if (top.length === 0) {
    if (score >= 90) return `${cafeName} is a top match for your taste profile.`;
    if (score >= 80) return `Good match for your ${taste.drink} and ${taste.vibe} preferences.`;
    return `Matches your ${taste.vibe} vibe.`;
  }
  return `Matches your preference for ${top.join(" and ")}.`;
}

// ─── Google Place → App Cafe ──────────────────────────────────────────────────

export function googlePlaceToCafe(place: GooglePlace, taste?: TasteProfile): Cafe {
  const photoNames = (place.photos ?? []).slice(0, 6).map((p) => p.name);
  const photoUrls = photoNames.map((n) => photoUrl(n));

  const hours = place.regularOpeningHours;
  const isOpen = place.currentOpeningHours?.openNow ?? place.regularOpeningHours?.openNow ?? true;
  const weekdayHours = hours?.weekdayDescriptions ?? [];
  const todayHours = weekdayHours[new Date().getDay()] ?? "";
  const hoursText = todayHours ? todayHours.replace(/^[^:]+:\s*/, "") : "Hours unavailable";

  const types = place.types ?? [];
  const summary = place.editorialSummary?.text;
  const rating = place.rating ?? 4.0;
  const reviews = place.userRatingCount ?? 0;

  // Base score from rating
  let score = 55;
  if (rating >= 4.8) score += 25;
  else if (rating >= 4.6) score += 20;
  else if (rating >= 4.4) score += 15;
  else if (rating >= 4.2) score += 10;
  else if (rating >= 4.0) score += 5;

  if (reviews >= 2000) score += 8;
  else if (reviews >= 1000) score += 6;
  else if (reviews >= 500) score += 4;
  else if (reviews >= 100) score += 2;

  let matchReason = `${rating.toFixed(1)}★ café`;
  const tasteReasons: string[] = [];

  if (taste) {
    const combined = (place.displayName?.text ?? "" + " " + (summary ?? "") + " " + types.join(" ")).toLowerCase();
    // Infer tags from Google data
    const inferredSpecialty: SpecialtyTag[] = [];
    const inferredCategory: CategoryTag[] = [];
    if (combined.includes("matcha")) inferredSpecialty.push("matcha");
    if (combined.includes("specialty") || combined.includes("artisan")) inferredSpecialty.push("specialty coffee");
    if (combined.includes("pour over") || combined.includes("filter")) inferredSpecialty.push("filter coffee");
    if (combined.includes("single origin")) inferredSpecialty.push("single origin");
    if (combined.includes("work") || combined.includes("wifi") || combined.includes("laptop")) inferredSpecialty.push("work friendly");
    if (combined.includes("cozy") || combined.includes("intimate") || combined.includes("aesthetic")) inferredSpecialty.push("aesthetic");
    if (combined.includes("date") || combined.includes("romantic")) inferredSpecialty.push("date spot");
    if (combined.includes("grab") || combined.includes("takeaway") || combined.includes("quick")) inferredSpecialty.push("grab and go");

    const { boost, reasons } = computeTasteBoost(inferredSpecialty, inferredCategory, taste);
    score += boost;
    tasteReasons.push(...reasons);
    matchReason = buildMatchReason(taste, tasteReasons, place.displayName?.text ?? "This café", Math.min(99, score));
  }

  score = Math.min(99, Math.max(62, Math.round(score)));

  return {
    id: place.id,
    name: place.displayName?.text ?? "Unknown Café",
    address: place.formattedAddress ?? "",
    rating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
    photoNames,
    photoUrls,
    hoursText,
    weekdayHours,
    isOpen,
    priceLevel: PRICE_MAP[place.priceLevel ?? ""] ?? 2,
    matchScore: score,
    matchReason,
    vibe: vibeFromTypes(types, summary),
    specialties: specialtiesFromTypes(types, summary),
    website: place.websiteUri,
    phone: place.internationalPhoneNumber,
    googleMapsUri: place.googleMapsUri,
    lat: place.location?.latitude ?? 28.6,
    lng: place.location?.longitude ?? 77.2,
    types,
    editorialSummary: summary,
    reviews: processReviews(place.reviews),
    matchReasons: tasteReasons,
  };
}

// ─── Supabase master `cafes` row → App Cafe ──────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function masterRowToCafe(row: Record<string, any>, taste?: TasteProfile): Cafe {
  const photoNames: string[] = row.photo_names ?? [];
  const photoUrls = photoNames.map((n: string) => photoUrl(n));

  const weekdayHours: string[] = row.opening_hours ?? [];
  const todayHours = weekdayHours[new Date().getDay()] ?? "";
  const hoursText = todayHours ? todayHours.replace(/^[^:]+:\s*/, "") : "Hours unavailable";

  const specialtyTags: SpecialtyTag[] = (row.specialty_tags ?? []) as SpecialtyTag[];
  const categoryTags: CategoryTag[] = (row.category_tags ?? []) as CategoryTag[];

  let score = 65;
  const ratingBoost = row.rating ? Math.round((row.rating - 3.5) * 6) : 0;
  score += ratingBoost;

  let matchReason = `${row.rating ? `${row.rating}★` : "Curated"} café in ${row.city_area ?? "Delhi NCR"}.`;
  if (taste) {
    const { boost, reasons } = computeTasteBoost(specialtyTags, categoryTags, taste);
    score += boost;
    if (reasons.length > 0) matchReason = buildMatchReason(taste, reasons, row.curated_name ?? "This café", score);
  }

  score = Math.min(99, Math.max(55, Math.round(score)));

  const vibe = specialtyTags.includes("aesthetic") || specialtyTags.includes("date spot")
    ? "Aesthetic & Curated"
    : specialtyTags.includes("work friendly")
    ? "Quiet & Focused"
    : specialtyTags.includes("matcha")
    ? "Matcha & Mindful"
    : specialtyTags.includes("specialty coffee")
    ? "Specialty Coffee"
    : "Local Favourite";

  return {
    id: row.google_place_id ?? `master-${row.id}`,
    name: row.curated_name ?? row.display_name ?? "Unknown Café",
    address: row.address ?? row.city_area ?? "Delhi NCR",
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    photoNames,
    photoUrls,
    hoursText,
    weekdayHours,
    isOpen: true,
    priceLevel: 2,
    matchScore: score,
    matchReason,
    vibe,
    specialties: specialtiesFromTags(specialtyTags).length > 0 ? specialtiesFromTags(specialtyTags) : ["Coffee"],
    website: row.website ?? undefined,
    googleMapsUri: row.maps_url ?? undefined,
    lat: row.latitude ?? 28.55,
    lng: row.longitude ?? 77.2,
    types: row.categories ?? [],
    isCurated: row.featured ?? false,
    curatedName: row.curated_name ?? undefined,
    cityArea: row.city_area ?? undefined,
    categoryTags,
    specialtyTags,
    visitedByMe: row.visited_by_me ?? false,
    matchaAvailable: row.matcha_available ?? false,
    matchReasons: [],
  };
}

// ─── Curated Supabase row → App Cafe ─────────────────────────────────────────

export function curatedRowToCafe(row: CuratedCafeRow, _dna?: unknown, taste?: TasteProfile): Cafe {
  const photoNames = row.photo_names ?? [];
  const photoUrls = photoNames.map((n: string) => photoUrl(n));

  const weekdayHours = row.opening_hours ?? [];
  const todayHours = weekdayHours[new Date().getDay()] ?? "";
  const hoursText = todayHours ? todayHours.replace(/^[^:]+:\s*/, "") : "Hours unavailable";

  const specialtyTags = (row.specialty_tags ?? []) as SpecialtyTag[];
  const categoryTags = (row.category_tags ?? []) as CategoryTag[];

  let score = 70;
  const ratingBoost = row.rating ? Math.round((row.rating - 3.5) * 6) : 0;
  score += ratingBoost;
  if (row.user_rating_count && row.user_rating_count >= 500) score += 4;

  let matchReason = `Curated by Bean There${row.city_area ? ` · ${row.city_area}` : ""}.`;
  if (taste) {
    const { boost, reasons } = computeTasteBoost(specialtyTags, categoryTags, taste);
    score += boost;
    if (reasons.length > 0) matchReason = buildMatchReason(taste, reasons, row.display_name ?? row.curated_name, score);
  }

  score = Math.min(99, Math.max(65, Math.round(score)));

  return {
    id: row.google_place_id ?? `curated-${row.id}`,
    name: row.display_name ?? row.curated_name,
    address: row.formatted_address ?? `${row.city_area ?? "Delhi NCR"}`,
    rating: row.rating ?? 0,
    reviewCount: row.user_rating_count ?? 0,
    photoNames,
    photoUrls,
    hoursText,
    weekdayHours,
    isOpen: true,
    priceLevel: row.price_level ?? 2,
    matchScore: score,
    matchReason,
    vibe: vibeFromSpecialtyTags(specialtyTags),
    specialties: specialtiesFromTags(specialtyTags),
    website: row.website_uri ?? undefined,
    googleMapsUri: row.google_maps_uri ?? undefined,
    lat: row.latitude ?? 28.55,
    lng: row.longitude ?? 77.2,
    types: [],
    isCurated: true,
    curatedName: row.curated_name,
    cityArea: row.city_area ?? undefined,
    categoryTags,
    specialtyTags,
    visitedByMe: row.visited_by_me,
    matchaAvailable: row.matcha_available,
    matchReasons: [],
  };
}
