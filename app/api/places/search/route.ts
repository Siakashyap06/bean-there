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
  "nextPageToken",
].join(",");

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") || searchParams.get("query") || "specialty cafes Delhi NCR";
  const pageToken = searchParams.get("pageToken") || undefined;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    return NextResponse.json({ error: "API_KEY_NOT_CONFIGURED", places: [] });
  }

  try {
    const body: Record<string, unknown> = {
      textQuery: query,
      includedType: "cafe",
      maxResultCount: 20,
    };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errBody: Record<string, unknown> = {};
      try { errBody = await res.json(); } catch { /* non-JSON */ }
      const googleMsg = (errBody?.error as Record<string, unknown>)?.message ?? JSON.stringify(errBody);
      console.error(`[Bean There] /api/places/search Google ${res.status}:`, googleMsg);
      return NextResponse.json(
        { error: `Google ${res.status}: ${googleMsg}`, googleStatus: res.status, places: [] },
        { status: 200 }
      );
    }

    const data = await res.json();
    const places = data.places ?? [];
    const nextPageToken = data.nextPageToken ?? null;

    console.log(`[Bean There] /api/places/search "${query}" → ${places.length} results`);
    savePlacesToCache(places).catch(console.error);

    return NextResponse.json({ places, nextPageToken }, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[Bean There] /api/places/search crash:", err);
    return NextResponse.json({ error: String(err), places: [] }, { status: 500 });
  }
}
