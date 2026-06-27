import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name");
  const maxWidth = searchParams.get("w") || "800";

  if (!name) {
    console.log("[Bean There] /api/places/photo — missing photo name → 400");
    return NextResponse.json({ error: "Missing photo name" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === "your_google_places_api_key_here") {
    console.log(`[Bean There] /api/places/photo — no API key configured → 204 (no photo)`);
    return new NextResponse(null, { status: 204 });
  }

  const googleUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
  console.log(`[Bean There] /api/places/photo — fetching Google photo: ${name.slice(0, 60)}…`);

  try {
    const res = await fetch(googleUrl, { redirect: "follow" });

    if (!res.ok) {
      console.log(`[Bean There] /api/places/photo — Google returned ${res.status} for ${name.slice(0, 40)}… → 204`);
      return new NextResponse(null, { status: 204 });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    console.log(`[Bean There] /api/places/photo — served ${buffer.byteLength} bytes, type: ${contentType}`);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[Bean There] /api/places/photo — fetch error:", err);
    return new NextResponse(null, { status: 204 });
  }
}
