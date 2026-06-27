import { NextRequest, NextResponse } from "next/server";
import { savePlacesToCache } from "@/lib/supabase-cafes";

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

// Google Nearby Search is capped at 20 per request with no pagination token.
// We tile the search area into sub-circles to cover more ground and merge + deduplicate.
// 4 tiles: centre + N/S/E/W offsets at ~60% of the radius
function getTileOffsets(lat: number, lng: number, radius: number) {
  const latDelta = (radius * 0.6) / 111320;
  const lngDelta = (radius * 0.6) / (111320 * Math.cos((lat * Math.PI) / 180));
  return [
    { latitude: lat, longitude: lng },                          // centre
    { latitude: lat + latDelta, longitude: lng },               // north
    { latitude: lat - latDelta, longitude: lng },               // south
    { latitude: lat, longitude: lng + lngDelta },               // east
    { latitude: lat, longitude: lng - lngDelta },               // west
  ];
}

async function searchTile(
  apiKey: string,
  center: { latitude: number; longitude: number },
  radius: number
): Promise<{ places: Record<string, unknown>[]; error?: string }> {
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
      locationRestriction: { circle: { center, radius } },
    }),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    let errBody: Record<string, unknown> = {};
    try { errBody = await res.json(); } catch { /* non-JSON body */ }
    const msg = `Google ${res.status}: ${JSON.stringify(errBody?.error ?? errBody)}`;
    console.error(`[Bean There] searchNearby tile failed — ${msg}`);
    return { places: [], error: msg };
  }

  const data = await res.json();
  return { places: data.places ?? [] };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") || "8000");
  const tiled = searchParams.get("tiled") !== "false"; // default true

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Missing lat/lng", places: [] }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    return NextResponse.json({ error: "API_KEY_NOT_CONFIGURED", places: [] });
  }

  try {
    let allPlaces: Record<string, unknown>[] = [];
    const tileErrors: string[] = [];

    if (tiled) {
      const tiles = getTileOffsets(lat, lng, radius);
      const tileRadius = radius * 0.65;
      const results = await Promise.all(
        tiles.map((center) => searchTile(apiKey, center, tileRadius))
      );

      const seen = new Set<string>();
      for (const result of results) {
        if (result.error) tileErrors.push(result.error);
        for (const p of result.places) {
          const id = p.id as string;
          if (id && !seen.has(id)) {
            seen.add(id);
            allPlaces.push(p);
          }
        }
      }

      console.log(
        `[Bean There] /api/places/nearby — ${tiles.length} tiles, ${allPlaces.length} unique places, ${tileErrors.length} errors`
      );
      if (tileErrors.length > 0) {
        console.error("[Bean There] Tile errors:", tileErrors);
      }
    } else {
      const result = await searchTile(apiKey, { latitude: lat, longitude: lng }, radius);
      if (result.error) tileErrors.push(result.error);
      allPlaces = result.places;
      console.log(`[Bean There] /api/places/nearby — single tile: ${allPlaces.length} places`);
    }

    // If ALL tiles errored and we got nothing, surface the error to the client
    if (allPlaces.length === 0 && tileErrors.length > 0) {
      return NextResponse.json(
        { error: tileErrors[0], googleError: tileErrors, places: [] },
        { status: 200 }
      );
    }

    savePlacesToCache(allPlaces as never[]).catch(console.error);

    return NextResponse.json({ places: allPlaces }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[Bean There] /api/places/nearby crash:", err);
    return NextResponse.json({ error: String(err), places: [] }, { status: 500 });
  }
}
