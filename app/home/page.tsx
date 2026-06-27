"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBeanStore } from "@/lib/store";
import { fetchCurated, fetchNearby, getUserLocation } from "@/lib/places-client";
import type { Cafe, CuratedTrail } from "@/lib/types";
import BottomNav from "@/components/layout/BottomNav";
import { CURATED_TRAILS } from "@/lib/curated-data";

// Trail cards use emoji + gradient — no hardcoded images

// Trail cards use no photos — emoji + gradient only (no hardcoded images)
function TrailCard({ trail, index }: { trail: typeof CURATED_TRAILS[0]; index: number }) {
  return (
    <Link href={`/discover?trail=${trail.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
        className="relative flex-shrink-0 w-40 h-48 rounded-2xl overflow-hidden flex flex-col items-center justify-center"
        style={{ boxShadow: "var(--shadow-md)", backgroundColor: "var(--espresso)" }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(196,132,92,0.18), transparent)" }} />
        <div className="relative flex flex-col items-center gap-2 px-3 text-center">
          <p className="text-4xl">{trail.emoji}</p>
          <p className="font-display font-semibold text-sm leading-tight"
            style={{ color: "#FAF6F1", fontFamily: "var(--font-playfair)" }}>
            {trail.name}
          </p>
          <p className="text-[10px]" style={{ color: "rgba(250,246,241,0.5)" }}>
            {trail.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

function CafeRow({ cafe, index }: { cafe: Cafe; index: number }) {
  const { stamps, wantToTryIds, toggleWantToTry } = useBeanStore();
  const isStamped = stamps.some((s) => s.cafeId === cafe.id);
  const isWanted = wantToTryIds.includes(cafe.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3"
    >
      <Link href={`/cafe/${cafe.id}`} className="flex-1">
        <div className="flex items-center gap-3 p-3 rounded-2xl"
          style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}>
          {/* Thumbnail — real photo or "no photo" placeholder */}
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: "var(--cream-deep)" }}>
            {cafe.photoUrls[0] ? (
              <img src={cafe.photoUrls[0]}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                alt={cafe.name} className="w-full h-full object-cover"
                onLoad={(e) => { console.log(`[Bean There] Home CafeRow "${cafe.name}" — img: ${(e.target as HTMLImageElement).src.slice(0, 80)}`); }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--stone-dark)" strokeWidth="1.5" />
                <circle cx="8.5" cy="10.5" r="1.5" stroke="var(--stone-dark)" strokeWidth="1.2" />
                <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="var(--stone-dark)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-sm truncate" style={{ color: "var(--charcoal)" }}>{cafe.name}</p>
              {isStamped && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ backgroundColor: "rgba(139,139,107,0.15)", color: "var(--olive)" }}>Stamped</span>}
            </div>
            <p className="text-xs truncate" style={{ color: "var(--charcoal-3)" }}>{cafe.cityArea ?? cafe.address.split(",")[0]}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold" style={{ color: "var(--copper)" }}>{cafe.matchScore}% match</span>
              {cafe.specialtyTags?.slice(0, 1).map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-3)" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>
      <button
        onClick={() => toggleWantToTry(cafe.id)}
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isWanted ? "var(--copper)" : "var(--cream-deep)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isWanted ? "#fff" : "none"}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
            stroke={isWanted ? "#fff" : "var(--charcoal-3)"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { coffeeDNA, stamps, memories, collections, wantToTryIds, hasCompletedOnboarding } = useBeanStore();
  const [trails, setTrails] = useState<CuratedTrail[]>([]);
  const [newToTry, setNewToTry] = useState<Cafe[]>([]);
  const [featuredCafe, setFeaturedCafe] = useState<Cafe | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyCafes, setNearbyCafes] = useState<Cafe[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    fetchCurated(coffeeDNA ?? undefined).then(({ cafes, trails: t }) => {
      console.log(`[Bean There] Home — curated loaded: ${cafes.length} total`);
      setTrails(t);
      const unvisited = cafes.filter((c) => !c.visitedByMe);
      console.log(`[Bean There] Home — New to Try: ${unvisited.length} unvisited cafés (showing all)`);
      setNewToTry(unvisited); // ALL unvisited — no cap
      if (cafes.length > 0) setFeaturedCafe(cafes[0]);
    });
  }, [coffeeDNA]);

  useEffect(() => {
    if (!coffeeDNA) return;
    setNearbyLoading(true);
    getUserLocation().then((loc) => {
      if (!loc) { setNearbyLoading(false); return; }
      fetchNearby(loc.lat, loc.lng, coffeeDNA ?? undefined).then((cafes) => {
        console.log(`[Bean There] Home — Near You: ${cafes.length} cafés fetched (showing all)`);
        setNearbyCafes(cafes); // ALL nearby — no cap
        setNearbyLoading(false);
      });
    });
  }, [coffeeDNA]);

  const visitedCount = stamps.length;
  const savedCount = collections.reduce((sum, c) => sum + c.cafeIds.length, 0) + wantToTryIds.length;
  const journalCount = memories.length;

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* ── Hero header ──────────────────────────────────────────────── */}
      <div className="surface-espresso px-5 pt-14 pb-7 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 60% at 85% 30%, rgba(196,132,92,0.12), transparent)" }} />

        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{ color: "rgba(250,246,241,0.35)" }}>
              {greeting}
            </p>
            <h1 className="text-display leading-tight" style={{ color: "#FAF6F1" }}>
              Bean There
            </h1>
            {coffeeDNA && (
              <p className="text-sm mt-1" style={{ color: "var(--copper-lt)", fontStyle: "italic", fontFamily: "var(--font-instrument)" }}>
                {coffeeDNA.drink} · {coffeeDNA.roast} roast
              </p>
            )}
          </div>
          {coffeeDNA ? (
            <Link href="/results">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mt-1"
                style={{ backgroundColor: "var(--copper)", color: "#fff" }}>
                ☕
              </div>
            </Link>
          ) : (
            <Link href="/onboarding">
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold mt-1"
                style={{ backgroundColor: "var(--copper)", color: "#fff" }}>
                Take quiz
              </div>
            </Link>
          )}
        </div>

        {/* Passport card */}
        <div className="relative rounded-2xl p-4"
          style={{ backgroundColor: "rgba(250,246,241,0.06)", border: "1px solid rgba(250,246,241,0.08)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: "rgba(250,246,241,0.6)" }}>
              My Coffee Passport
            </p>
            <p className="text-xs font-bold" style={{ color: "var(--copper-lt)" }}>
              {visitedCount > 0 ? `${visitedCount} café${visitedCount === 1 ? "" : "s"} explored` : "Start your coffee journey"}
            </p>
          </div>
          <div className="flex gap-4">
            {[
              { label: "Visited", val: visitedCount },
              { label: "Saved", val: savedCount },
              { label: "Notes", val: journalCount },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-base font-bold leading-none" style={{ color: "#FAF6F1" }}>{s.val}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(250,246,241,0.35)" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <Link href="/journal">
            <button className="mt-3 text-[11px] font-semibold" style={{ color: "rgba(250,246,241,0.45)" }}>
              View journal →
            </button>
          </Link>
        </div>
      </div>

      {/* ── Coffee DNA prompt (if no quiz) ─────────────────────────── */}
      {!coffeeDNA && (
        <div className="px-5 pt-5">
          <div className="rounded-3xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, var(--espresso-dk) 0%, var(--espresso-md) 100%)" }}>
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(196,132,92,0.15), transparent)" }} />
            <div className="relative p-6">
              <p className="text-[10px] tracking-[0.2em] uppercase mb-2"
                style={{ color: "rgba(250,246,241,0.35)" }}>
                Personalise Bean There
              </p>
              <h3 className="font-display text-2xl font-semibold mb-2 leading-tight"
                style={{ color: "#FAF6F1", fontFamily: "var(--font-playfair)" }}>
                Discover your Coffee DNA
              </h3>
              <p className="text-sm mb-5 leading-relaxed"
                style={{ color: "rgba(250,246,241,0.5)" }}>
                A 5-minute quiz that reveals which cafés were made for you.
              </p>
              <Link href="/onboarding">
                <button className="btn-copper px-5 py-2.5 rounded-xl text-sm">
                  Take the quiz →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Today's Pick ─────────────────────────────────────────────── */}
      {featuredCafe && (
        <div className="px-5 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-semibold"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
              Today's Pick
            </h2>
            <Link href="/discover">
              <span className="text-xs font-semibold" style={{ color: "var(--copper)" }}>See all</span>
            </Link>
          </div>
          <Link href={`/cafe/${featuredCafe.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl overflow-hidden relative"
              style={{ height: 220, boxShadow: "var(--shadow-lg)" }}>
              {featuredCafe.photoUrls[0] ? (
                <img
                  src={featuredCafe.photoUrls[0]}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  onLoad={(e) => { console.log(`[Bean There] Today's Pick "${featuredCafe.name}" — img: ${(e.target as HTMLImageElement).src.slice(0, 80)}`); }}
                  alt={featuredCafe.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2"
                  style={{ backgroundColor: "var(--espresso)" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="rgba(250,246,241,0.3)" strokeWidth="1.5" />
                    <circle cx="8.5" cy="10.5" r="1.5" stroke="rgba(250,246,241,0.3)" strokeWidth="1.2" />
                    <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="rgba(250,246,241,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-xs" style={{ color: "rgba(250,246,241,0.35)" }}>No photo available</p>
                </div>
              )}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(26,14,9,0.85) 0%, rgba(26,14,9,0.1) 50%)" }} />
              <div className="absolute top-4 left-4 flex gap-2">
                {featuredCafe.visitedByMe ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: "rgba(139,139,107,0.85)", color: "#fff" }}>
                    Visited ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: "var(--copper)", color: "#fff" }}>
                    {featuredCafe.matchScore}% match
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[10px] tracking-[0.15em] uppercase mb-1"
                  style={{ color: "rgba(250,246,241,0.5)" }}>
                  {featuredCafe.cityArea ?? "Delhi NCR"}
                </p>
                <h3 className="font-display text-xl font-semibold mb-1"
                  style={{ color: "#FAF6F1", fontFamily: "var(--font-playfair)" }}>
                  {featuredCafe.name}
                </h3>
                <div className="flex gap-1.5 flex-wrap">
                  {featuredCafe.specialtyTags?.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(250,246,241,0.15)", color: "rgba(250,246,241,0.75)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      )}

      {/* ── Sia's Picks ──────────────────────────────────────────────── */}
      {newToTry.length > 0 && (
        <div className="pt-6">
          <div className="px-5 flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-xl font-semibold"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                Sia's Recommendations
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--charcoal-3)" }}>
                Personal picks — tried & loved
              </p>
            </div>
            <Link href="/discover?trail=visited">
              <span className="text-xs font-semibold" style={{ color: "var(--copper)" }}>All picks</span>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2">
            {newToTry.filter((c) => c.visitedByMe !== false).concat(
              newToTry.filter((c) => c.visitedByMe === false)
            ).slice(0, 8).map((cafe, i) => (
              <Link key={cafe.id} href={`/cafe/${cafe.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  className="flex-shrink-0 w-36 rounded-2xl overflow-hidden"
                  style={{ boxShadow: "var(--shadow-sm)", backgroundColor: "#fff" }}>
                  <div className="w-full h-28 overflow-hidden"
                    style={{ backgroundColor: "var(--cream-deep)" }}>
                    {cafe.photoUrls[0] ? (
                      <img src={cafe.photoUrls[0]} alt={cafe.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--espresso)" }}>
                        <span className="text-2xl">☕</span>
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--charcoal)" }}>
                      {cafe.name}
                    </p>
                    <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--charcoal-3)" }}>
                      {cafe.cityArea ?? cafe.address.split(",")[0]}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(196,132,92,0.12)", color: "var(--copper)" }}>
                      {cafe.matchScore}% match
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Trails ────────────────────────────────────────────────────── */}
      <div className="pt-6">
        <div className="px-5 flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-semibold"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
            Explore Trails
          </h2>
          <Link href="/discover">
            <span className="text-xs font-semibold" style={{ color: "var(--copper)" }}>All</span>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-5">
          {CURATED_TRAILS.map((trail, i) => ( // ALL trails — no cap
            <TrailCard key={trail.id} trail={trail} index={i} />
          ))}
        </div>
      </div>

      {/* ── New to Try ────────────────────────────────────────────────── */}
      {newToTry.length > 0 && (
        <div className="px-5 pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-xl font-semibold"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                New to Try
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--charcoal-3)" }}>
                Not yet in your passport
              </p>
            </div>
            <Link href="/discover?trail=new-to-try">
              <span className="text-xs font-semibold" style={{ color: "var(--copper)" }}>See all</span>
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {newToTry.map((cafe, i) => (
              <CafeRow key={cafe.id} cafe={cafe} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Nearby (if DNA set) ───────────────────────────────────────── */}
      {coffeeDNA && (
        <div className="px-5 pt-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-semibold"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
              Near You Now
            </h2>
            <Link href="/discover">
              <span className="text-xs font-semibold" style={{ color: "var(--copper)" }}>Explore</span>
            </Link>
          </div>
          {nearbyLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-2xl skeleton" />
              ))}
            </div>
          ) : nearbyCafes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {nearbyCafes.map((cafe, i) => (
                <CafeRow key={cafe.id} cafe={cafe} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: "var(--charcoal-3)" }}>
              Enable location for nearby cafés
            </p>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
