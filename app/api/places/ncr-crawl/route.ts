/**
 * GET /api/places/ncr-crawl
 *
 * Exhaustive Delhi NCR café crawler.
 * Searches 25 curated zones across Delhi / Gurgaon / Noida using:
 *   1. searchNearby  (types: cafe, coffee_shop)      — 1 call/zone
 *   2. searchText "specialty coffee <zone>"          — 1 call/zone
 *   3. searchText "coffee roasters <zone>"           — 1 call/zone
 *   4. searchText "matcha cafe <zone>"               — 1 call/zone
 *   5. searchText "cafe <zone>"                      — 1 call/zone
 * = 5 calls × 25 zones = 125 total API calls, deduped by place_id.
 *
 * Optional query params:
 *   ?region=Delhi|Gurgaon|Noida  — restrict to one region
 *   ?zone=Hauz+Khas              — restrict to one zone (exact name)
 *   ?radius=1500                 — search radius in metres per zone (default 1500)
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Vercel Pro: 300 s; Hobby plan is capped at 60 s

// ── Field mask ──────────────────────────────────────────────────────────────
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.photos",
  "places.regularOpeningHours",
  "places.currentOpeningHours",
  "places.types",
  "places.primaryType",
  "places.editorialSummary",
  "places.googleMapsUri",
  "places.websiteUri",
].join(",");

// ── Zone definitions ─────────────────────────────────────────────────────────
type Region = "Delhi" | "Gurgaon" | "Noida";

interface Zone {
  name: string;
  lat: number;
  lng: number;
  region: Region;
}

const ZONES: Zone[] = [
  // ── Delhi ─────────────────────────────────────────────────────────────────
  { name: "Defence Colony",   lat: 28.5741, lng: 77.2313, region: "Delhi" },
  { name: "GK 1",             lat: 28.5466, lng: 77.2330, region: "Delhi" },
  { name: "GK 2",             lat: 28.5390, lng: 77.2425, region: "Delhi" },
  { name: "Lodhi Colony",     lat: 28.5908, lng: 77.2232, region: "Delhi" },
  { name: "Khan Market",      lat: 28.5994, lng: 77.2278, region: "Delhi" },
  { name: "Hauz Khas",        lat: 28.5508, lng: 77.2009, region: "Delhi" },
  { name: "Shahpur Jat",      lat: 28.5439, lng: 77.2100, region: "Delhi" },
  { name: "Safdarjung",       lat: 28.5699, lng: 77.2090, region: "Delhi" },
  { name: "Saket",            lat: 28.5244, lng: 77.2167, region: "Delhi" },
  { name: "Vasant Kunj",      lat: 28.5218, lng: 77.1563, region: "Delhi" },
  { name: "Green Park",       lat: 28.5591, lng: 77.2048, region: "Delhi" },
  { name: "Panchsheel Park",  lat: 28.5382, lng: 77.2195, region: "Delhi" },
  { name: "Nehru Place",      lat: 28.5477, lng: 77.2512, region: "Delhi" },
  { name: "Connaught Place",  lat: 28.6317, lng: 77.2195, region: "Delhi" },
  // ── Gurgaon ───────────────────────────────────────────────────────────────
  { name: "Galleria",         lat: 28.4575, lng: 77.0728, region: "Gurgaon" },
  { name: "DLF Phase 1",      lat: 28.4748, lng: 77.0982, region: "Gurgaon" },
  { name: "DLF Phase 4",      lat: 28.4595, lng: 77.0780, region: "Gurgaon" },
  { name: "Cyber Hub",        lat: 28.4954, lng: 77.0889, region: "Gurgaon" },
  { name: "Golf Course Road", lat: 28.4359, lng: 77.1021, region: "Gurgaon" },
  { name: "Sector 29",        lat: 28.4589, lng: 77.0511, region: "Gurgaon" },
  { name: "MG Road",          lat: 28.4767, lng: 77.0637, region: "Gurgaon" },
  // ── Noida ─────────────────────────────────────────────────────────────────
  { name: "Sector 18",        lat: 28.5703, lng: 77.3218, region: "Noida" },
  { name: "Sector 62",        lat: 28.6253, lng: 77.3649, region: "Noida" },
  { name: "Sector 104",       lat: 28.5295, lng: 77.3698, region: "Noida" },
  { name: "Sector 132",       lat: 28.5028, lng: 77.4073, region: "Noida" },
];

const TEXT_QUERIES = [
  "specialty coffee",
  "coffee roasters",
  "matcha cafe",
  "cafe",
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface RawPlace {
  id?: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  photos?: Array<{ name: string }>;
  types?: string[];
  primaryType?: string;
  editorialSummary?: { text: string };
  googleMapsUri?: string;
  websiteUri?: string;
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
}

interface SearchResult {
  places: RawPlace[];
  zone: string;
  region: Region;
  query: string;
  ok: boolean;
  rawCount: number;
}

// ── Search helpers ────────────────────────────────────────────────────────────
async function doNearby(
  apiKey: string,
  zone: Zone,
  radius: number
): Promise<SearchResult> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: ["cafe", "coffee_shop"],
        maxResultCount: 20,
        locationRestriction: {
          circle: { center: { latitude: zone.lat, longitude: zone.lng }, radius },
        },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[NCR Crawl] searchNearby ${zone.name} ${res.status}:`, JSON.stringify(err).slice(0, 200));
      return { places: [], zone: zone.name, region: zone.region, query: "nearby:cafe+coffee_shop", ok: false, rawCount: 0 };
    }
    const data = await res.json();
    const places: RawPlace[] = data.places ?? [];
    return { places, zone: zone.name, region: zone.region, query: "nearby:cafe+coffee_shop", ok: true, rawCount: places.length };
  } catch (e) {
    console.error(`[NCR Crawl] searchNearby ${zone.name} threw:`, e);
    return { places: [], zone: zone.name, region: zone.region, query: "nearby:cafe+coffee_shop", ok: false, rawCount: 0 };
  }
}

async function doText(
  apiKey: string,
  zone: Zone,
  textQuery: string,
  radius: number
): Promise<SearchResult> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: `${textQuery} ${zone.name}`,
        maxResultCount: 20,
        locationBias: {
          circle: { center: { latitude: zone.lat, longitude: zone.lng }, radius },
        },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[NCR Crawl] searchText "${textQuery}" ${zone.name} ${res.status}:`, JSON.stringify(err).slice(0, 200));
      return { places: [], zone: zone.name, region: zone.region, query: textQuery, ok: false, rawCount: 0 };
    }
    const data = await res.json();
    const places: RawPlace[] = data.places ?? [];
    return { places, zone: zone.name, region: zone.region, query: textQuery, ok: true, rawCount: places.length };
  } catch (e) {
    console.error(`[NCR Crawl] searchText "${textQuery}" ${zone.name} threw:`, e);
    return { places: [], zone: zone.name, region: zone.region, query: textQuery, ok: false, rawCount: 0 };
  }
}

// Controlled-concurrency executor
async function runConcurrent<T>(
  tasks: Array<() => Promise<T>>,
  concurrency = 10
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map((fn) => fn()))));
  }
  return results;
}

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    return NextResponse.json({ ok: false, error: "API_KEY_NOT_CONFIGURED" }, { status: 400 });
  }

  const { searchParams } = request.nextUrl;
  const regionFilter = searchParams.get("region") as Region | null;
  const zoneFilter = searchParams.get("zone");
  const radius = Math.min(3000, Math.max(500, parseInt(searchParams.get("radius") || "1500")));

  // Filter zones
  let zones = ZONES;
  if (regionFilter) zones = zones.filter((z) => z.region === regionFilter);
  if (zoneFilter) zones = zones.filter((z) => z.name.toLowerCase() === zoneFilter.toLowerCase());

  if (zones.length === 0) {
    return NextResponse.json({ ok: false, error: "No zones matched the filter" }, { status: 400 });
  }

  const startTime = Date.now();
  console.log(`[NCR Crawl] Starting — ${zones.length} zones × 5 queries = ${zones.length * 5} API calls, radius ${radius}m`);

  // Build all tasks
  const tasks: Array<() => Promise<SearchResult>> = [];
  for (const zone of zones) {
    tasks.push(() => doNearby(apiKey, zone, radius));
    for (const q of TEXT_QUERIES) {
      tasks.push(() => doText(apiKey, zone, q, radius));
    }
  }

  // Execute with concurrency = 10 (safe for Google's 10 req/s per key limit)
  const results = await runConcurrent(tasks, 10);

  // Deduplicate by place id — first occurrence wins (keeps zone attribution)
  const seen = new Map<string, string>(); // placeId → zone
  const seenRegion = new Map<string, Region>();
  const allCafes: Array<{
    placeId: string;
    name: string;
    address: string;
    location: { lat: number; lng: number } | null;
    rating: number | null;
    userRatingCount: number | null;
    priceLevel: string | null;
    photos: string[];
    area: string;
    region: Region;
    types: string[];
    primaryType: string | null;
    summary: string | null;
    googleMapsUri: string | null;
    websiteUri: string | null;
    openNow: boolean | null;
  }> = [];

  let rawTotal = 0;
  const zoneRawCounts: Record<string, number> = {};
  const zoneUniqueCounts: Record<string, number> = {};
  let apiCallsMade = 0;
  let failedCalls = 0;

  for (const result of results) {
    rawTotal += result.rawCount;
    if (result.ok) apiCallsMade++; else failedCalls++;
    zoneRawCounts[result.zone] = (zoneRawCounts[result.zone] ?? 0) + result.rawCount;

    for (const p of result.places) {
      const id = p.id;
      if (!id || seen.has(id)) continue;

      seen.set(id, result.zone);
      seenRegion.set(id, result.region);
      zoneUniqueCounts[result.zone] = (zoneUniqueCounts[result.zone] ?? 0) + 1;

      allCafes.push({
        placeId: id,
        name: p.displayName?.text ?? "Unknown",
        address: p.formattedAddress ?? "",
        location: p.location
          ? { lat: p.location.latitude, lng: p.location.longitude }
          : null,
        rating: p.rating ?? null,
        userRatingCount: p.userRatingCount ?? null,
        priceLevel: p.priceLevel ?? null,
        photos: (p.photos ?? []).slice(0, 3).map((ph) => ph.name),
        area: result.zone,
        region: result.region,
        types: p.types ?? [],
        primaryType: p.primaryType ?? null,
        summary: p.editorialSummary?.text ?? null,
        googleMapsUri: p.googleMapsUri ?? null,
        websiteUri: p.websiteUri ?? null,
        openNow: p.regularOpeningHours?.openNow ?? null,
      });
    }
  }

  // Sort by rating desc, then name
  allCafes.sort((a, b) => {
    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    if (rb !== ra) return rb - ra;
    return a.name.localeCompare(b.name);
  });

  const uniqueCount = allCafes.length;
  const duplicateCount = rawTotal - uniqueCount;
  const elapsed = Date.now() - startTime;

  // Per-region breakdown
  const byRegion: Record<string, number> = { Delhi: 0, Gurgaon: 0, Noida: 0 };
  for (const c of allCafes) byRegion[c.region] = (byRegion[c.region] ?? 0) + 1;

  const topCafes = allCafes
    .filter((c) => c.rating && c.rating >= 4.5 && (c.userRatingCount ?? 0) >= 50)
    .slice(0, 20)
    .map((c) => ({ name: c.name, area: c.area, rating: c.rating!, reviews: c.userRatingCount }));

  console.log(`[NCR Crawl] Done in ${elapsed}ms — ${uniqueCount} unique / ${rawTotal} raw / ${duplicateCount} dupes`);

  return NextResponse.json(
    {
      ok: true,
      stats: {
        elapsedMs: elapsed,
        apiCallsMade,
        failedCalls,
        totalRawCount: rawTotal,
        uniqueCount,
        duplicateCount,
        zonesSearched: zones.map((z) => z.name),
        radius,
        byRegion,
        byZone: Object.fromEntries(
          zones.map((z) => [
            z.name,
            { raw: zoneRawCounts[z.name] ?? 0, unique: zoneUniqueCounts[z.name] ?? 0 },
          ])
        ),
        topRatedCafes: topCafes,
      },
      cafes: allCafes,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    }
  );
}
