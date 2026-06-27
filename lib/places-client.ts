"use client";
import type { GooglePlace, Cafe, TasteProfile, CuratedCafeRow, CuratedTrail } from "./types";
import { googlePlaceToCafe, curatedRowToCafe, masterRowToCafe } from "./match-engine";
import { CURATED_TRAILS } from "./curated-data";

interface PagedResult {
  places: GooglePlace[];
  nextPageToken: string | null;
}

async function fetchPlaces(url: string): Promise<PagedResult> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.warn(`[Bean There] fetchPlaces HTTP ${res.status} for ${url}`);
    return { places: [], nextPageToken: null };
  }
  const data = await res.json();
  if (data.error) {
    // Surface Google API errors in the browser console so users/devs can debug
    if (data.error !== "API_KEY_NOT_CONFIGURED") {
      console.error(`[Bean There] Places API error from ${url}:`, data.error, data.googleError ?? "");
      console.info(
        "[Bean There] Debug tip: open /api/test-places to see a full diagnosis of your Google API key"
      );
    }
    return { places: [], nextPageToken: null };
  }
  if (!data.places) return { places: [], nextPageToken: null };
  return { places: data.places as GooglePlace[], nextPageToken: data.nextPageToken ?? null };
}

export async function fetchNearby(
  lat: number,
  lng: number,
  taste?: TasteProfile
): Promise<Cafe[]> {
  const { places } = await fetchPlaces(
    `/api/places/nearby?lat=${lat}&lng=${lng}&radius=8000`
  );

  if (places.length === 0) return [];

  return places
    .map((p) => googlePlaceToCafe(p, taste))
    .sort((a, b) => b.matchScore - a.matchScore);
}

export async function fetchByText(
  query: string,
  taste?: TasteProfile,
  pageToken?: string
): Promise<{ cafes: Cafe[]; nextPageToken: string | null }> {
  const url = `/api/places/search?q=${encodeURIComponent(query)}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
  const { places, nextPageToken } = await fetchPlaces(url);

  const cafes = places
    .map((p) => googlePlaceToCafe(p, taste))
    .sort((a, b) => b.matchScore - a.matchScore);

  return { cafes, nextPageToken };
}

export async function fetchSection(
  section: string,
  lat?: number,
  lng?: number,
  taste?: TasteProfile,
  pageToken?: string
): Promise<{ cafes: Cafe[]; nextPageToken: string | null }> {
  let url = `/api/places/section?section=${encodeURIComponent(section)}`;
  if (lat !== undefined && lng !== undefined) url += `&lat=${lat}&lng=${lng}`;
  if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

  const { places, nextPageToken } = await fetchPlaces(url);

  const cafes = places
    .map((p) => googlePlaceToCafe(p, taste))
    .sort((a, b) => b.matchScore - a.matchScore);

  return { cafes, nextPageToken };
}

export async function fetchDetails(
  id: string,
  taste?: TasteProfile
): Promise<Cafe | null> {
  const res = await fetch(`/api/places/details/${id}`, { cache: "no-store" });
  if (!res.ok) return null;

  const data: GooglePlace & { error?: string } = await res.json();
  if (data.error) return null;

  return googlePlaceToCafe(data as GooglePlace, taste);
}

export async function fetchCurated(taste?: TasteProfile): Promise<{
  cafes: Cafe[];
  trails: CuratedTrail[];
}> {
  const res = await fetch("/api/places/curated", { cache: "no-store" });
  if (!res.ok) return { cafes: [], trails: [] };

  const data: { cafes: CuratedCafeRow[]; source: string } = await res.json();
  const rows = data.cafes ?? [];

  if (rows.length === 0) return { cafes: [], trails: [] };

  const cafes = rows
    .map((row) => curatedRowToCafe(row, undefined, taste))
    .sort((a, b) => b.matchScore - a.matchScore);

  const seen = new Set<string>();
  const dedupedCafes = cafes.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  const trails: CuratedTrail[] = CURATED_TRAILS.map((trail) => ({
    id: trail.id,
    name: trail.name,
    emoji: trail.emoji,
    description: trail.description,
    cafes: dedupedCafes.filter((c) => c.categoryTags?.includes(trail.tag)),
  })).filter((t) => t.cafes.length > 0);

  return { cafes: dedupedCafes, trails };
}

export async function fetchFromSupabase(
  opts: {
    limit?: number;
    offset?: number;
    lat?: number;
    lng?: number;
    radiusM?: number;
    tag?: string;
    q?: string;
    featured?: boolean;
  } = {},
  taste?: TasteProfile
): Promise<{ cafes: Cafe[]; total: number; nextOffset: number | null }> {
  const { limit = 50, offset = 0, lat, lng, radiusM, tag, q, featured } = opts;

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (featured) params.set("featured", "true");
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  if (lat !== undefined && lng !== undefined) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
    if (radiusM !== undefined) params.set("radius", String(radiusM));
  }

  const res = await fetch(`/api/cafes?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) return { cafes: [], total: 0, nextOffset: null };

  const data: { cafes: Record<string, unknown>[]; total: number } = await res.json();
  const rows = data.cafes ?? [];
  const total = data.total ?? 0;

  const cafes = rows.map((r) => masterRowToCafe(r, taste));
  const nextOffset = offset + rows.length < total ? offset + rows.length : null;

  return { cafes, total, nextOffset };
}

export function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000 }
    );
  });
}
