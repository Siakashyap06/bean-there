"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import {
  fetchCurated,
  fetchNearby,
  fetchSection,
  fetchByText,
  fetchFromSupabase,
  getUserLocation,
} from "@/lib/places-client";
import { TOTAL_TILES } from "@/lib/delhi-ncr-grid";
import type { Cafe, CuratedTrail } from "@/lib/types";
import CafeCard, { CafeCardSkeleton } from "@/components/cafe/CafeCard";
import BottomNav from "@/components/layout/BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Section {
  id: string;
  title: string;
  emoji: string;
  cafes: Cafe[];
  nextPageToken?: string | null;
  loading: boolean;
}

// ─── Horizontal café row ──────────────────────────────────────────────────────
function CafeRow({
  cafes,
  loading,
  onLoadMore,
  hasMore,
}: {
  cafes: Cafe[];
  loading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2">
      {loading && cafes.length === 0
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44">
              <CafeCardSkeleton />
            </div>
          ))
        : cafes.map((cafe, i) => (
            <div key={cafe.id} className="flex-shrink-0 w-44">
              <CafeCard cafe={cafe} index={i} compact />
            </div>
          ))}
      {hasMore && !loading && (
        <button
          onClick={onLoadMore}
          className="flex-shrink-0 w-20 h-full min-h-[160px] rounded-2xl flex flex-col items-center justify-center gap-1"
          style={{ border: "2px dashed var(--stone)", color: "var(--charcoal-3)" }}
        >
          <span className="text-xl">+</span>
          <span className="text-[10px] font-medium">More</span>
        </button>
      )}
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────
function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="px-5 mb-4">
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <circle cx="11" cy="11" r="8" stroke="var(--stone-dark)" strokeWidth="1.5" />
          <path d="M21 21l-4.35-4.35" stroke="var(--stone-dark)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onSearch(value.trim()); }}
          placeholder="Search cafés, areas, vibes..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--charcoal)" }}
        />
        {value && (
          <button onClick={() => { setValue(""); onSearch(""); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="var(--stone-dark)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const SECTION_DEFS = [
  { id: "matcha", title: "Matcha Trail", emoji: "🍵" },
  { id: "vietnamese", title: "Vietnamese Coffee Trail", emoji: "☕" },
  { id: "work", title: "Work Cafés", emoji: "💻" },
  { id: "date", title: "Date Spots", emoji: "✨" },
  { id: "trending", title: "Trending Now", emoji: "🔥" },
  { id: "hidden", title: "Hidden Gems", emoji: "💎" },
];

export default function DiscoverPage() {
  const { tasteProfile: coffeeDNA } = useBeanStore();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Featured (curated)
  const [featured, setFeatured] = useState<Cafe[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Trails from curated
  const [trails, setTrails] = useState<CuratedTrail[]>([]);

  // Near You
  const [nearYou, setNearYou] = useState<Cafe[]>([]);
  const [nearLoading, setNearLoading] = useState(false);

  // Dynamic sections
  const [sections, setSections] = useState<Section[]>(
    SECTION_DEFS.map((d) => ({ ...d, cafes: [], loading: true, nextPageToken: null }))
  );

  // All Delhi NCR (from Supabase city crawl)
  const [delhiCafes, setDelhiCafes] = useState<Cafe[]>([]);
  const [delhiTotal, setDelhiTotal] = useState(0);
  const [delhiNextOffset, setDelhiNextOffset] = useState<number | null>(null);
  const [delhiLoading, setDelhiLoading] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState<"idle" | "running" | "done">("idle");
  const [crawlProgress, setCrawlProgress] = useState({ done: 0, total: TOTAL_TILES });

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Cafe[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchNextPage, setSearchNextPage] = useState<string | null>(null);

  // Active trail drill-down
  const [activeTrail, setActiveTrail] = useState<CuratedTrail | null>(null);

  // Summary log — fires whenever data updates
  useEffect(() => {
    const sectionTotal = sections.reduce((sum, s) => sum + s.cafes.length, 0);
    const total = featured.length + nearYou.length + sectionTotal;
    if (total > 0) {
      console.log(
        `[Bean There] DISPLAY TOTALS — Featured: ${featured.length} | Near You: ${nearYou.length} | Sections: ${sectionTotal} (${sections.map((s) => `${s.title}: ${s.cafes.length}`).join(", ")}) | GRAND TOTAL: ${total}`
      );
    }
  }, [featured, nearYou, sections]);

  // Load location
  useEffect(() => {
    getUserLocation().then(setLocation);
  }, []);

  // Load first page of All Delhi NCR from Supabase on mount
  useEffect(() => {
    setDelhiLoading(true);
    fetchFromSupabase({ limit: 50, offset: 0 }, coffeeDNA ?? undefined).then(
      ({ cafes, total, nextOffset }) => {
        console.log(`[Bean There] All Delhi NCR — first page: ${cafes.length} cafés, total in DB: ${total}`);
        setDelhiCafes(cafes);
        setDelhiTotal(total);
        setDelhiNextOffset(nextOffset);
        setDelhiLoading(false);
      }
    );
  }, [coffeeDNA]);

  // Load featured (curated)
  useEffect(() => {
    setFeaturedLoading(true);
    fetchCurated(coffeeDNA ?? undefined).then(({ cafes, trails: t }) => {
      console.log(`[Bean There] Curated cafés loaded: ${cafes.length} total`);
      setFeatured(cafes); // show ALL curated cafés, no cap
      setTrails(t);
      setFeaturedLoading(false);
    });
  }, [coffeeDNA]);

  // Load near you when location available
  useEffect(() => {
    if (!location) return;
    setNearLoading(true);
    fetchNearby(location.lat, location.lng, coffeeDNA ?? undefined).then((cafes) => {
      console.log(`[Bean There] Near You: ${cafes.length} cafés fetched`);
      setNearYou(cafes);
      setNearLoading(false);
    });
  }, [location, coffeeDNA]);

  // Load all sections — auto-paginate until exhausted
  useEffect(() => {
    async function loadSection(def: { id: string; title: string; emoji: string }, idx: number) {
      let allCafes: Cafe[] = [];
      let pageToken: string | undefined = undefined;
      let page = 0;

      do {
        const { cafes, nextPageToken } = await fetchSection(
          def.id,
          location?.lat,
          location?.lng,
          coffeeDNA ?? undefined,
          pageToken
        );

        // Deduplicate by id before merging
        const newIds = new Set(allCafes.map((c) => c.id));
        const fresh = cafes.filter((c) => !newIds.has(c.id));
        allCafes = [...allCafes, ...fresh];
        pageToken = nextPageToken ?? undefined;
        page++;

        // Update UI after each page so results appear progressively
        const snapshot = [...allCafes];
        setSections((prev) =>
          prev.map((s, i) =>
            i === idx
              ? { ...s, cafes: snapshot, nextPageToken: nextPageToken, loading: !!nextPageToken }
              : s
          )
        );

        // Google enforces a short delay between paginated requests
        if (pageToken) await new Promise((r) => setTimeout(r, 2000));
      } while (pageToken && page < 3); // max 3 pages (60 results) per section

      console.log(`[Bean There] Section "${def.title}": ${allCafes.length} cafés total (${page} page${page !== 1 ? "s" : ""})`);
      setSections((prev) =>
        prev.map((s, i) =>
          i === idx ? { ...s, cafes: allCafes, nextPageToken: null, loading: false } : s
        )
      );
    }

    SECTION_DEFS.forEach((def, idx) => loadSection(def, idx));
  }, [location, coffeeDNA]);

  const handleLoadMoreSection = useCallback(
    async (idx: number) => {
      const sec = sections[idx];
      if (!sec.nextPageToken || sec.loading) return;
      setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, loading: true } : s)));
      const { cafes: more, nextPageToken } = await fetchSection(
        sec.id,
        location?.lat,
        location?.lng,
        coffeeDNA ?? undefined,
        sec.nextPageToken
      );
      setSections((prev) =>
        prev.map((s, i) =>
          i === idx
            ? { ...s, cafes: [...s.cafes, ...more], nextPageToken, loading: false }
            : s
        )
      );
    },
    [sections, location, coffeeDNA]
  );

  const handleSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
      if (!q) { setSearchResults(null); setSearchNextPage(null); return; }
      setSearchLoading(true);
      const { cafes, nextPageToken } = await fetchByText(q, coffeeDNA ?? undefined);
      setSearchResults(cafes);
      setSearchNextPage(nextPageToken);
      setSearchLoading(false);
    },
    [coffeeDNA]
  );

  const handleSearchLoadMore = useCallback(async () => {
    if (!searchNextPage || !searchQuery) return;
    setSearchLoading(true);
    const { cafes: more, nextPageToken } = await fetchByText(
      searchQuery,
      coffeeDNA ?? undefined,
      searchNextPage
    );
    setSearchResults((prev) => [...(prev ?? []), ...more]);
    setSearchNextPage(nextPageToken);
    setSearchLoading(false);
  }, [searchNextPage, searchQuery, coffeeDNA]);

  // Load more pages from Supabase Delhi NCR
  const handleLoadMoreDelhi = useCallback(async () => {
    if (delhiNextOffset === null || delhiLoading) return;
    setDelhiLoading(true);
    const { cafes: more, total, nextOffset } = await fetchFromSupabase(
      { limit: 50, offset: delhiNextOffset },
      coffeeDNA ?? undefined
    );
    const existingIds = new Set(delhiCafes.map((c) => c.id));
    const fresh = more.filter((c) => !existingIds.has(c.id));
    setDelhiCafes((prev) => [...prev, ...fresh]);
    setDelhiTotal(total);
    setDelhiNextOffset(nextOffset);
    setDelhiLoading(false);
    console.log(`[Bean There] Delhi NCR — loaded more: ${fresh.length} new cafés, total displayed: ${delhiCafes.length + fresh.length} / ${total}`);
  }, [delhiNextOffset, delhiLoading, delhiCafes, coffeeDNA]);

  // Trigger city crawl (requires Google API key + Supabase on the server)
  const handleCrawl = useCallback(async () => {
    if (crawlStatus === "running") return;
    setCrawlStatus("running");
    setCrawlProgress({ done: 0, total: TOTAL_TILES });

    // Split into batches of 10 tiles so we can show progress
    const BATCH = 10;
    for (let start = 0; start < TOTAL_TILES; start += BATCH) {
      const end = Math.min(start + BATCH, TOTAL_TILES);
      try {
        const res = await fetch(`/api/places/city-crawl?start=${start}&end=${end}`, {
          method: "POST",
        });
        const data = await res.json();
        setCrawlProgress({ done: end, total: TOTAL_TILES });
        console.log(`[City Crawl] Tiles ${start}-${end}: ${data.uniqueNewPlaces} new places`);
      } catch (e) {
        console.error(`[City Crawl] Batch ${start}-${end} failed`, e);
      }
    }

    setCrawlStatus("done");
    // Reload Delhi NCR cafés from Supabase
    const { cafes, total, nextOffset } = await fetchFromSupabase({ limit: 50 }, coffeeDNA ?? undefined);
    setDelhiCafes(cafes);
    setDelhiTotal(total);
    setDelhiNextOffset(nextOffset);
    console.log(`[City Crawl] Complete — ${total} total cafés now in Supabase`);
  }, [crawlStatus, coffeeDNA]);

  // ─── Trail drill-down ──────────────────────────────────────────────────────
  if (activeTrail) {
    return (
      <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>
        <div className="pt-14 px-5 pb-4 flex items-center gap-3">
          <button
            onClick={() => setActiveTrail(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(44,24,16,0.07)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="var(--espresso)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <h1
              className="font-display text-2xl font-bold leading-tight"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}
            >
              {activeTrail.emoji} {activeTrail.name}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--charcoal-3)" }}>
              {activeTrail.cafes.length} cafés
            </p>
          </div>
        </div>
        <div className="px-5 flex flex-col gap-3">
          {activeTrail.cafes.map((cafe, i) => (
            <CafeCard key={cafe.id} cafe={cafe} index={i} />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ─── Search results overlay ────────────────────────────────────────────────
  const showSearch = searchQuery.length > 0;

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>
      {/* Header */}
      <div className="pt-14 px-5 pb-4">
        <h1
          className="font-display text-3xl font-bold mb-1"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}
        >
          Discover
        </h1>
        <p className="text-sm" style={{ color: "var(--charcoal-3)" }}>
          Every café, curated and beyond
        </p>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} />

      {/* ── Search results ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--charcoal-3)" }}>
              Results for "{searchQuery}"
            </p>
            {searchLoading && !searchResults && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => <CafeCardSkeleton key={i} />)}
              </div>
            )}
            {searchResults && (
              <>
                <div className="flex flex-col gap-3">
                  {searchResults.map((cafe, i) => (
                    <CafeCard key={cafe.id} cafe={cafe} index={i} />
                  ))}
                </div>
                {searchNextPage && (
                  <button
                    onClick={handleSearchLoadMore}
                    disabled={searchLoading}
                    className="w-full py-3 mt-4 rounded-2xl text-sm font-semibold"
                    style={{ backgroundColor: "rgba(44,24,16,0.07)", color: "var(--espresso)" }}
                  >
                    {searchLoading ? "Loading…" : "Load more results"}
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!showSearch && (
        <>
          {/* ── Featured by Bean There ───────────────────────────────────── */}
          <div className="mb-6">
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-lg font-bold"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                  ⭐ Featured by Bean There
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--charcoal-3)" }}>
                  Hand-picked by our editors
                </p>
              </div>
            </div>
            <CafeRow cafes={featured} loading={featuredLoading} />
          </div>

          {/* ── Curated Trails ───────────────────────────────────────────── */}
          {trails.length > 0 && (
            <div className="mb-6 px-5">
              <h2 className="font-display text-lg font-bold mb-3"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                🗺 Explore Trails
              </h2>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {trails.map((trail) => (
                  <button
                    key={trail.id}
                    onClick={() => setActiveTrail(trail)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
                    style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)", color: "var(--charcoal)" }}
                  >
                    <span>{trail.emoji}</span>
                    <span>{trail.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-3)" }}>
                      {trail.cafes.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Near You ─────────────────────────────────────────────────── */}
          <div className="mb-6">
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-lg font-bold"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                  📍 Near You
                </h2>
                {!location && (
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--charcoal-3)" }}>
                    Detecting your location…
                  </p>
                )}
              </div>
            </div>
            <CafeRow cafes={nearYou} loading={nearLoading || (!location && nearYou.length === 0)} />
          </div>

          {/* ── Dynamic sections ─────────────────────────────────────────── */}
          {sections.map((sec, idx) => (
            <div key={sec.id} className="mb-6">
              <div className="px-5 mb-3">
                <h2 className="font-display text-lg font-bold"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                  {sec.emoji} {sec.title}
                </h2>
              </div>
              <CafeRow
                cafes={sec.cafes}
                loading={sec.loading}
                hasMore={!!sec.nextPageToken}
                onLoadMore={() => handleLoadMoreSection(idx)}
              />
            </div>
          ))}

          {/* ── All Delhi NCR ─────────────────────────────────────────── */}
          <div className="mb-6">
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-lg font-bold"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                  🏙 All Delhi NCR
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--charcoal-3)" }}>
                  {delhiTotal > 0
                    ? `${delhiTotal.toLocaleString()} cafés in the database`
                    : "Run city crawl to load all cafés"}
                </p>
              </div>
              {/* Crawl trigger — only shown when no data yet */}
              {delhiTotal === 0 && (
                <button
                  onClick={handleCrawl}
                  disabled={crawlStatus === "running"}
                  className="px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: crawlStatus === "running" ? "var(--stone)" : "var(--espresso)",
                    color: "#FAF6F1",
                  }}
                >
                  {crawlStatus === "running"
                    ? `Crawling ${crawlProgress.done}/${crawlProgress.total}…`
                    : "Load All Cafés"}
                </button>
              )}
            </div>

            {/* Crawl progress bar */}
            {crawlStatus === "running" && (
              <div className="px-5 mb-3">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--cream-deep)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "var(--copper)" }}
                    animate={{ width: `${(crawlProgress.done / crawlProgress.total) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <p className="text-[10px] mt-1.5 text-center" style={{ color: "var(--charcoal-3)" }}>
                  Scanning {crawlProgress.done} of {crawlProgress.total} areas across Delhi NCR…
                </p>
              </div>
            )}

            {delhiCafes.length > 0 ? (
              <>
                <CafeRow
                  cafes={delhiCafes}
                  loading={delhiLoading && delhiCafes.length === 0}
                  hasMore={delhiNextOffset !== null}
                  onLoadMore={handleLoadMoreDelhi}
                />
                {delhiNextOffset !== null && (
                  <div className="px-5 mt-2">
                    <button
                      onClick={handleLoadMoreDelhi}
                      disabled={delhiLoading}
                      className="w-full py-3 rounded-2xl text-sm font-semibold"
                      style={{ backgroundColor: "rgba(44,24,16,0.07)", color: "var(--espresso)" }}
                    >
                      {delhiLoading
                        ? "Loading…"
                        : `Load more — ${delhiTotal - delhiCafes.length} remaining`}
                    </button>
                  </div>
                )}
              </>
            ) : delhiLoading ? (
              <CafeRow cafes={[]} loading={true} />
            ) : (
              <div className="px-5">
                <div className="rounded-2xl p-6 text-center"
                  style={{ border: "2px dashed var(--stone)" }}>
                  <p className="text-2xl mb-2">🏙</p>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--charcoal)" }}>
                    No cafés loaded yet
                  </p>
                  <p className="text-xs mb-4" style={{ color: "var(--charcoal-3)" }}>
                    Tap "Load All Cafés" above to scan {TOTAL_TILES} areas across Delhi NCR using Google Places
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--charcoal-3)" }}>
                    Requires GOOGLE_PLACES_API_KEY + Supabase in .env.local
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* bottom padding */}
          <div className="h-4" />
        </>
      )}

      <BottomNav />
    </div>
  );
}
