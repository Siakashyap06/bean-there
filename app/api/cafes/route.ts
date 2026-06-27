/**
 * /api/cafes
 *
 * Read from the Supabase master `cafes` table — this is populated by
 * the city crawl (/api/places/city-crawl) and individual nearby/section
 * searches. Serves as the fast cached layer over Google Places.
 *
 * Query params:
 *   featured=true          — only curated/featured cafés
 *   tag=<CategoryTag>      — filter by category_tags
 *   q=<text>               — full-text search on name + address + area
 *   area=<city_area>       — filter by city_area string (partial match)
 *   lat, lng, radius       — spatial filter (approx, using lat/lng box)
 *   limit=<n>              — default 50, max 200
 *   offset=<n>             — for pagination
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const featured = searchParams.get("featured") === "true";
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");
  const area = searchParams.get("area");
  const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
  const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
  const radiusKm = searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) / 1000 : 5;
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ cafes: [], total: 0, source: "no_supabase" });
  }

  try {
    let query = supabase.from("cafes").select("*", { count: "exact" });

    if (featured) query = query.eq("featured", true);
    if (tag) query = query.contains("category_tags", [tag]);

    // Full-text search using the GIN index on the search vector
    if (q) {
      query = query.textSearch(
        "to_tsvector('english', coalesce(display_name,'') || ' ' || coalesce(address,'') || ' ' || coalesce(city_area,''))",
        q,
        { type: "websearch" }
      );
    }

    if (area) {
      query = query.ilike("city_area", `%${area}%`);
    }

    // Approximate spatial filter via bounding box
    if (lat !== null && lng !== null) {
      const latDelta = radiusKm / 111.32;
      const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
      query = query
        .gte("latitude", lat - latDelta)
        .lte("latitude", lat + latDelta)
        .gte("longitude", lng - lngDelta)
        .lte("longitude", lng + lngDelta);
    }

    query = query
      .order("rating", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    console.log(`[Bean There] /api/cafes — returning ${data?.length ?? 0} of ${count ?? 0} total cafés (offset: ${offset})`);

    return NextResponse.json(
      { cafes: data ?? [], total: count ?? 0, offset, limit, source: "supabase" },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("Cafes read failed:", err);
    return NextResponse.json({ cafes: [], total: 0, source: "error" }, { status: 500 });
  }
}
