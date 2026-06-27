import { NextRequest, NextResponse } from "next/server";

const FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "priceLevel",
  "photos",
  "regularOpeningHours",
  "currentOpeningHours",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "reviews",
  "editorialSummary",
  "types",
  "primaryType",
].join(",");

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing place ID" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    return NextResponse.json({ error: "API_KEY_NOT_CONFIGURED" }, { status: 200 });
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${id}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Place details error:", err);
      return NextResponse.json(
        { error: "Place not found", details: err },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("Details fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 });
  }
}
