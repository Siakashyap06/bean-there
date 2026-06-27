"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import { fetchCurated, fetchNearby, fetchSection, fetchByText, fetchFromSupabase, getUserLocation } from "@/lib/places-client";
import type { Cafe, CuratedTrail } from "@/lib/types";
import CafeCard, { CafeCardSkeleton } from "@/components/cafe/CafeCard";
import BottomNav from "@/components/layout/BottomNav";

interface Section {
  id: string;
  title: string;
  emoji: string;
  cafes: Cafe[];
  nextPageToken?: string | null;
  loading: boolean;
}

const SECTION_DEFS = [
  { id: "matcha",       title: "Matcha Trail",         emoji: "🍵" },
  { id: "study",        title: "Study Cafés",           emoji: "📚" },
  { id: "date",         title: "Date Spots",            emoji: "✨" },
  { id: "work",         title: "Work-From-Café",        emoji: "💻" },
  { id: "vietnamese",   title: "Vietnamese Coffee",     emoji: "☕" },
  { id: "trending",     title: "Trending Now",          emoji: "🔥" },
  { id: "hidden",       title: "Hidden Gems",           emoji: "💎" },
];

const CITY_PRESETS: Record<string, { lat: number; lng: number; label: string }> = {
  delhi:   { lat: 28.6139, lng: 77.2090, label: "Delhi" },
  gurgaon: { lat: 28.4595, lng: 77.0266, label: "Gurgaon" },
  noida:   { lat: 28.5355, lng: 77.3910, label: "Noida" },
};

function CafeRow({ cafes, loading, onLoadMore, hasMore }: {
  cafes: Cafe[]; loading: boolean; onLoadMore?: () => void; hasMore?: boolean;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2">
      {loading && cafes.length === 0
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44"><CafeCardSkeleton /></div>
          ))
        : cafes.map((cafe, i) => (
            <div key={cafe.id} className="flex-shrink-0 w-44">
              <CafeCard cafe={cafe} index={i} compact />
            </div>
          ))}
      {hasMore && !loading && (
        <button
          onClick={onLoadMore}
          className="flex-shrink-0 w-20 min-h-[160px] rounded-2xl flex flex-col items-center justify-center gap-1"
          style={{ border: "2px dashed var(--stone)", color: "var(--charcoal-3)" }}>
          <span className="text-xl">+</span>
          <span className="text-[10px] font-medium">More</span>
        </button>
      )}
    </div>
  );
}

function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="px-5 mb-4">
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}>
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
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-geist)" }}
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

function CityPicker({ onSelect }: { onSelect: (city: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  function pick(city: string) {
    setSelected(city);
    onSelect(city);
  }
  return (
    <div className="mx-5 rounded-2xl p-5" style={{ background: "var(--cream-deep)" }}>
      <p className="text-xs font-semibold mb-1" style={{ color: "var(--charcoal-2)", fontFamily: "var(--font-geist)" }}>
        Which city are you in?
      </p>
      <p className="text-xs mb-4" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
        We'll show cafés near you without needing GPS.
      </p>
      <div className="flex gap-2">
        {Object.entries(CITY_PRESETS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => pick(key)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: selected === key ? "var(--espresso)" : "#fff",
              color: selected === key ? "var(--cream)" : "var(--charcoal)",
              border: "1.5px solid var(--stone)",
              fontFamily: "var(--font-geist)",
            }}>
            {val.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const { coffeeDNA } = useBeanStore();

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "detecting" | "granted" | "denied">("idle");

  const [featured, setFeatured]           = useState<Cafe[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [trails, setTrails]               = useState<CuratedTrail[]>([]);
  const [nearYou, setNearYou]             = useState<Cafe[]>([]);
  const [nearLoading, setNearLoading]     = useState(false);
  const [sections, setSections]           = useState<Section[]>(
    SECTION_DEFS.map((d) => ({ ...d, cafes: [], loading: true, nextPageToken: null }))
  );
  const [allCafes, setAllCafes]           = useState<Cafe[]>([]);
  const [allNextOffset, setAllNextOffset] = useState<number | null>(null);
  const [allLoading, setAllLoading]       = useState(false);

  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<Cafe[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchNextPage, setSearchNextPage] = useState<string | null>(null);

  const [activeTrail, setActiveTrail]     = useState<CuratedTrail | null>(null);

  // Detect location
  useEffect(() => {
    setLocationStatus("detecting");
    getUserLocation().then((loc) => {
      if (loc) { setLocation(loc); setLocationStatus("granted"); }
      else     { setLocationStatus("denied"); }
    });
  }, []);

  const retryLocation = useCallback(() => {
    setLocationStatus("detecting");
    getUserLocation().then((loc) => {
      if (loc) { setLocation(loc); setLocationStatus("granted"); }
      else     { setLocationStatus("denied"); }
    });
  }, []);

  const pickCity = useCallback((city: string) => {
    const preset = CITY_PRESETS[city];
    if (preset) setLocation({ lat: preset.lat, lng: preset.lng });
  }, []);

  // Curated / featured
  useEffect(() => {
    setFeaturedLoading(true);
    fetchCurated(coffeeDNA ?? undefined).then(({ cafes, trails: t }) => {
      setFeatured(cafes);
      setTrails(t);
      setFeaturedLoading(false);
    });
  }, [coffeeDNA]);

  // Near You
  useEffect(() => {
    if (!location) return;
    setNearLoading(true);
    fetchNearby(location.lat, location.lng, coffeeDNA ?? undefined).then((cafes) => {
      setNearYou(cafes);
      setNearLoading(false);
    });
  }, [location, coffeeDNA]);

  // Sections — auto-paginate up to 3 pages each
  useEffect(() => {
    async function loadSection(def: typeof SECTION_DEFS[0], idx: number) {
      let all: Cafe[] = [];
      let pageToken: string | undefined;
      let page = 0;
      do {
        const { cafes, nextPageToken } = await fetchSection(def.id, location?.lat, location?.lng, coffeeDNA ?? undefined, pageToken);
        const seen = new Set(all.map((c) => c.id));
        all = [...all, ...cafes.filter((c) => !seen.has(c.id))];
        pageToken = nextPageToken ?? undefined;
        page++;
        const snap = [...all];
        setSections((prev) => prev.map((s, i) => i === idx ? { ...s, cafes: snap, nextPageToken, loading: !!nextPageToken } : s));
        if (pageToken) await new Promise((r) => setTimeout(r, 2000));
      } while (pageToken && page < 3);
      setSections((prev) => prev.map((s, i) => i === idx ? { ...s, cafes: all, nextPageToken: null, loading: false } : s));
    }
    SECTION_DEFS.forEach((def, idx) => loadSection(def, idx));
  }, [location, coffeeDNA]);

  // All NCR cafés from Supabase (silent, no developer UI)
  useEffect(() => {
    setAllLoading(true);
    fetchFromSupabase({ limit: 40, offset: 0 }, coffeeDNA ?? undefined).then(({ cafes, nextOffset }) => {
      setAllCafes(cafes);
      setAllNextOffset(nextOffset);
      setAllLoading(false);
    });
  }, [coffeeDNA]);

  const handleLoadMoreSection = useCallback(async (idx: number) => {
    const sec = sections[idx];
    if (!sec.nextPageToken || sec.loading) return;
    setSections((prev) => prev.map((s, i) => i === idx ? { ...s, loading: true } : s));
    const { cafes: more, nextPageToken } = await fetchSection(sec.id, location?.lat, location?.lng, coffeeDNA ?? undefined, sec.nextPageToken);
    setSections((prev) => prev.map((s, i) => i === idx ? { ...s, cafes: [...s.cafes, ...more], nextPageToken, loading: false } : s));
  }, [sections, location, coffeeDNA]);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q) { setSearchResults(null); setSearchNextPage(null); return; }
    setSearchLoading(true);
    const { cafes, nextPageToken } = await fetchByText(q, coffeeDNA ?? undefined);
    setSearchResults(cafes);
    setSearchNextPage(nextPageToken);
    setSearchLoading(false);
  }, [coffeeDNA]);

  const handleSearchMore = useCallback(async () => {
    if (!searchNextPage || !searchQuery) return;
    setSearchLoading(true);
    const { cafes: more, nextPageToken } = await fetchByText(searchQuery, coffeeDNA ?? undefined, searchNextPage);
    setSearchResults((prev) => [...(prev ?? []), ...more]);
    setSearchNextPage(nextPageToken);
    setSearchLoading(false);
  }, [searchNextPage, searchQuery, coffeeDNA]);

  const handleLoadMoreAll = useCallback(async () => {
    if (allNextOffset === null || allLoading) return;
    setAllLoading(true);
    const { cafes: more, nextOffset } = await fetchFromSupabase({ limit: 40, offset: allNextOffset }, coffeeDNA ?? undefined);
    const seen = new Set(allCafes.map((c) => c.id));
    setAllCafes((prev) => [...prev, ...more.filter((c) => !seen.has(c.id))]);
    setAllNextOffset(nextOffset);
    setAllLoading(false);
  }, [allNextOffset, allLoading, allCafes, coffeeDNA]);

  // Trail drill-down
  if (activeTrail) {
    return (
      <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>
        <div className="pt-14 px-5 pb-4 flex items-center gap-3">
          <button onClick={() => setActiveTrail(null)} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(44,24,16,0.07)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="var(--espresso)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.5rem", fontWeight: 700, color: "var(--charcoal)", lineHeight: 1.1 }}>
              {activeTrail.emoji} {activeTrail.name}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
              {activeTrail.cafes.length} cafés
            </p>
          </div>
        </div>
        <div className="px-5 flex flex-col gap-3">
          {activeTrail.cafes.map((cafe, i) => <CafeCard key={cafe.id} cafe={cafe} index={i} />)}
        </div>
        <BottomNav />
      </div>
    );
  }

  const showSearch = searchQuery.length > 0;

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* Header */}
      <div className="pt-14 px-5 pb-4">
        <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(1.9rem, 7.5vw, 2.6rem)", fontWeight: 700, color: "var(--espresso)", lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: "0.2rem" }}>
          Discover
        </h1>
        <p className="text-sm" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
          Every café, curated and beyond
        </p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {/* Search results */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="px-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
              Results for "{searchQuery}"
            </p>
            {searchLoading && !searchResults && (
              <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <CafeCardSkeleton key={i} />)}</div>
            )}
            {searchResults && (
              <>
                <div className="flex flex-col gap-3">
                  {searchResults.map((cafe, i) => <CafeCard key={cafe.id} cafe={cafe} index={i} />)}
                </div>
                {searchNextPage && (
                  <button onClick={handleSearchMore} disabled={searchLoading}
                    className="w-full py-3 mt-4 rounded-2xl text-sm font-semibold"
                    style={{ backgroundColor: "rgba(44,24,16,0.07)", color: "var(--espresso)", fontFamily: "var(--font-geist)" }}>
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
          {/* Featured */}
          <div className="mb-6">
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.125rem", fontWeight: 700, color: "var(--charcoal)" }}>
                  ⭐ Featured
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
                  Hand-picked by our editors
                </p>
              </div>
            </div>
            <CafeRow cafes={featured} loading={featuredLoading} />
          </div>

          {/* Trails */}
          {trails.length > 0 && (
            <div className="mb-6 px-5">
              <h2 className="mb-3" style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.125rem", fontWeight: 700, color: "var(--charcoal)" }}>
                🗺 Explore Trails
              </h2>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {trails.map((trail) => (
                  <button key={trail.id} onClick={() => setActiveTrail(trail)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
                    style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)", color: "var(--charcoal)", fontFamily: "var(--font-geist)" }}>
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

          {/* Near You */}
          <div className="mb-6">
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.125rem", fontWeight: 700, color: "var(--charcoal)" }}>
                  📍 Near You
                </h2>
                {locationStatus === "detecting" && (
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
                    Detecting your location…
                  </p>
                )}
                {locationStatus === "denied" && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[11px]" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
                      Location access off
                    </p>
                    <button onClick={retryLocation}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--copper)", color: "#fff", fontFamily: "var(--font-geist)" }}>
                      Allow →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {locationStatus === "denied" && nearYou.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                <CityPicker onSelect={pickCity} />
              </motion.div>
            )}

            {locationStatus !== "denied" && (
              <CafeRow cafes={nearYou} loading={nearLoading || (locationStatus === "detecting" && nearYou.length === 0)} />
            )}
            {locationStatus === "denied" && nearYou.length > 0 && (
              <CafeRow cafes={nearYou} loading={false} />
            )}
          </div>

          {/* Dynamic sections */}
          {sections.map((sec, idx) => (
            <div key={sec.id} className="mb-6">
              <div className="px-5 mb-3">
                <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.125rem", fontWeight: 700, color: "var(--charcoal)" }}>
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

          {/* All Delhi NCR — shown only when we have data, no dev UI */}
          {(allCafes.length > 0 || allLoading) && (
            <div className="mb-6">
              <div className="px-5 mb-3">
                <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.125rem", fontWeight: 700, color: "var(--charcoal)" }}>
                  🏙 All Delhi NCR
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
                  Cafés across the city
                </p>
              </div>
              <CafeRow cafes={allCafes} loading={allLoading && allCafes.length === 0} hasMore={allNextOffset !== null} onLoadMore={handleLoadMoreAll} />
              {allNextOffset !== null && allCafes.length > 0 && (
                <div className="px-5 mt-2">
                  <button onClick={handleLoadMoreAll} disabled={allLoading}
                    className="w-full py-3 rounded-2xl text-sm font-semibold"
                    style={{ backgroundColor: "rgba(44,24,16,0.07)", color: "var(--espresso)", fontFamily: "var(--font-geist)" }}>
                    {allLoading ? "Loading…" : "See more cafés"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="h-4" />
        </>
      )}

      <BottomNav />
    </div>
  );
}
