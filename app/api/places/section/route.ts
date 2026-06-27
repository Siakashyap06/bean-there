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

const SECTION_QUERIES: Record<string, string> = {
  matcha: "matcha cafe Delhi NCR",
  vietnamese: "vietnamese coffee ca phe Delhi NCR",
  work: "work friendly cafe wifi laptop Delhi NCR",
  date: "aesthetic cozy cafe date spot Delhi NCR",
  trending: "best rated specialty coffee cafe Delhi NCR 2024",
  "newly-opened": "new cafe opened 2024 Delhi NCR",
  hidden: "hidden gem cafe Delhi NCR",
  specialty: "specialty coffee third wave single origin Delhi NCR",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const section = searchParams.get("section");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const pageToken = searchParams.get("pageToken") || undefined;

  if (!section || !SECTION_QUERIES[section]) {
    return NextResponse.json({ error: "Invalid section", places: [] }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    return NextResponse.json({ error: "API_KEY_NOT_CONFIGURED", places: [] });
  }

  try {
    const body: Record<string, unknown> = {
      textQuery: SECTION_QUERIES[section],
      includedType: "cafe",
      maxResultCount: 20,
    };
    if (pageToken) body.pageToken = pageToken;

    // Bias toward user location if provided
    if (lat && lng) {
      body.locationBias = {
        circle: {
          center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          radius: 15000,
        },
      };
    }

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Section error:", err);
      return NextResponse.json({ error: "Google API error", places: [] }, { status: res.status });
    }

    const data = await res.json();
    const places = data.places ?? [];
    const nextPageToken = data.nextPageToken ?? null;

    console.log(`[Bean There] /api/places/section?section=${section} — ${places.length} places${nextPageToken ? " (more pages available)" : " (final page)"}`);

    savePlacesToCache(places).catch(console.error);

    return NextResponse.json({ places, nextPageToken }, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120" },
    });
  } catch (err) {
    console.error("Section fetch failed:", err);
    return NextResponse.json({ error: "Failed", places: [] }, { status: 500 });
  }
}
