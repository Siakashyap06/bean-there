import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { cafes: [], source: "not-configured", message: "Supabase not configured" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data, error } = await supabase
    .from("curated_cafes")
    .select("*")
    .not("google_place_id", "is", null)
    .order("curated_name");

  if (error) {
    console.error("[Bean There] /api/places/curated — Supabase error:", error.message);
    return NextResponse.json(
      { cafes: [], source: "error", message: error.message },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { cafes: [], source: "empty", message: "No verified cafés yet. Run curated-sync to populate." },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  console.log(`[Bean There] /api/places/curated — ${data.length} verified cafés`);
  return NextResponse.json(
    { cafes: data, source: "supabase" },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
  );
}
