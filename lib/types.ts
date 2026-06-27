export interface QuizAnswer {
  questionIndex: number;
  answerIndex: number;
  answerText: string;
}

// Legacy simple profile — kept for match-engine backward compat
export interface TasteProfile {
  roast: "light" | "medium" | "dark";
  drink: "latte" | "cappuccino" | "espresso" | "cold-brew" | "pour-over" | "matcha";
  milk: "dairy" | "oat" | "almond" | "soy" | "none";
  sweetness: "low" | "medium" | "sweet";
  vibe: "study" | "work" | "social" | "date" | "quick";
}

// Full attribute-based profile — superset of TasteProfile
export interface CoffeeDNA extends TasteProfile {
  // Flavour scores 0–10
  matchaInterest: number;
  specialtyInterest: number;
  espressoConfidence: number;

  // Personality 0–10
  adventureLevel: number;

  // Café preferences 0–10
  budgetLevel: number;       // 0=budget, 10=premium
  ambienceStyle: number;     // 0=cozy/moody, 10=minimal/modern
  noiseTolerance: number;    // 0=silent, 10=buzzy
  outdoorSeating: number;    // 0=don't care, 10=essential
  chainPreference: number;   // 0=indie only, 10=chains fine

  // Use-case scores 0–10
  workFromCafe: number;
  studyAtCafe: number;
  dateAtCafe: number;

  // Habits
  morningPerson: number;     // 0=evening, 10=morning
  dessertInterest: number;
  travelWillingness: number; // 0=5 min walk, 10=anywhere
  visitFrequency: number;    // approx visits per month

  // Computed
  constellation: ConstellationStar[];
}

export interface ConstellationStar {
  id: string;
  label: string;
  emoji: string;
  value: number; // 0–1 normalised
  x: number;    // SVG canvas x
  y: number;    // SVG canvas y
}

// Raw shape returned by Google Places API
export interface GooglePlace {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  photos?: Array<{ name: string; widthPx?: number; heightPx?: number }>;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
    openNow?: boolean;
    periods?: unknown[];
  };
  currentOpeningHours?: { openNow?: boolean };
  types?: string[];
  primaryType?: string;
  editorialSummary?: { text: string };
  reviews?: GoogleReview[];
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
}

export interface GoogleReview {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text: string; languageCode?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
}

export type SpecialtyTag =
  | "matcha"
  | "vietnamese coffee"
  | "tiramisu latte"
  | "burnt caramel"
  | "flat white"
  | "specialty coffee"
  | "filter coffee"
  | "pour over"
  | "single origin"
  | "healthy bowls"
  | "sandwiches"
  | "pastries"
  | "cozy"
  | "aesthetic"
  | "lowkey"
  | "work friendly"
  | "date spot"
  | "grab and go"
  | "brunch"
  | "rooftop"
  | "japanese"
  | "italian"
  | "french";

export type CategoryTag =
  | "Matcha Trail"
  | "Vietnamese Coffee Trail"
  | "Hidden Gems"
  | "Date Spots"
  | "Work Cafés"
  | "Weekend Coffee Crawl"
  | "South Delhi Staples"
  | "Gurgaon Coffee Map"
  | "New To Try"
  | "Visited By Me"
  | "Coffee Passport";

export interface Cafe {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  photoNames: string[];
  photoUrls: string[];
  hoursText: string;
  weekdayHours: string[];
  isOpen: boolean;
  priceLevel: number;
  matchScore: number;
  matchReason: string;
  matchReasons: string[];    // array of individual reasons
  vibe: string;
  specialties: string[];
  website?: string;
  phone?: string;
  googleMapsUri?: string;
  lat: number;
  lng: number;
  types: string[];
  editorialSummary?: string;
  reviews?: ProcessedReview[];
  isCurated?: boolean;
  curatedName?: string;
  cityArea?: string;
  categoryTags?: CategoryTag[];
  specialtyTags?: SpecialtyTag[];
  visitedByMe?: boolean;
  matchaAvailable?: boolean;
}

export interface ProcessedReview {
  author: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  timeAgo: string;
}

export interface PassportStamp {
  id: string;
  cafeId: string;
  cafeName: string;
  city: string;
  date: string;
  drinkOrdered?: string;
  rating?: number;
  note?: string;
  photo?: string;
}

export interface CoffeeMemory {
  id: string;
  cafeId: string;
  cafeName: string;
  cafeArea?: string;
  drinkOrdered: string;
  rating: number;
  note: string;
  date: string;
  photo?: string;
}

export interface FavoriteCollection {
  id: string;
  name: string;
  emoji: string;
  cafeIds: string[];
}

export interface CuratedCafeRow {
  id: number;
  created_at: string;
  curated_name: string;
  search_query: string;
  google_place_id: string | null;
  display_name: string | null;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  user_rating_count: number | null;
  price_level: number | null;
  photo_names: string[] | null;
  opening_hours: string[] | null;
  google_maps_uri: string | null;
  website_uri: string | null;
  category_tags: CategoryTag[];
  specialty_tags: SpecialtyTag[];
  visited_by_me: boolean;
  matcha_available: boolean;
  coffee_available: boolean;
  notes: string | null;
  city_area: string | null;
  synced_at: string | null;
}

export interface CuratedTrail {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cafes: Cafe[];
}
