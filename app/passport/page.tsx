"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import { fetchCurated } from "@/lib/places-client";
import type { Cafe } from "@/lib/types";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";

const CITIES = ["Delhi", "Gurgaon", "All"];

const ACHIEVEMENTS = [
  { id: "first", icon: "🌱", title: "First Stamp", desc: "Collect your first café stamp", need: 1 },
  { id: "three", icon: "🗺️", title: "Explorer", desc: "Stamp 3 different cafés", need: 3 },
  { id: "five",  icon: "⭐", title: "Regular",  desc: "Build a 5-café passport", need: 5 },
  { id: "ten",   icon: "📚", title: "Collector", desc: "10 stamps across the city", need: 10 },
  { id: "twenty",icon: "👑", title: "Legend",   desc: "20 stamps — you belong here", need: 20 },
];

type Tab = "stamped" | "want-to-try" | "memories";

function StampTile({ name, date, index, area }: { name: string; date: string; index: number; area?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative aspect-square"
    >
      <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden"
        style={{ backgroundColor: "#fff", border: "2px dashed var(--stone)", boxShadow: "var(--shadow-sm)" }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2 flex-shrink-0 relative"
          style={{ backgroundColor: "var(--espresso)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#FAF6F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute inset-0 rounded-full" style={{ border: "2px solid var(--copper)", opacity: 0.5 }} />
        </div>
        <p className="font-semibold text-[11px] text-center leading-tight line-clamp-2"
          style={{ color: "var(--charcoal)" }}>{name}</p>
        {area && <p className="text-[9px] mt-0.5" style={{ color: "var(--charcoal-3)" }}>{area}</p>}
        <p className="text-[10px] mt-0.5" style={{ color: "var(--charcoal-3)" }}>{date}</p>
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--copper)", opacity: 0.5 }} />
      </div>
    </motion.div>
  );
}

function WantToTryCard({ cafe, index, onStamp }: { cafe: Cafe; index: number; onStamp: (cafe: Cafe) => void }) {
  const { toggleWantToTry } = useBeanStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 p-3 rounded-2xl"
      style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: "var(--cream-deep)" }}>
        {cafe.photoUrls[0] ? (
          <img src={cafe.photoUrls[0]}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            alt={cafe.name} className="w-full h-full object-cover" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--stone-dark)" strokeWidth="1.5" /></svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "var(--charcoal)" }}>{cafe.name}</p>
        <p className="text-xs" style={{ color: "var(--charcoal-3)" }}>{cafe.cityArea ?? cafe.address.split(",")[0]}</p>
        <div className="flex gap-1 mt-1">
          {cafe.specialtyTags?.slice(0, 2).map((t) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full capitalize"
              style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-3)" }}>{t}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => onStamp(cafe)}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{ backgroundColor: "var(--espresso)", color: "#FAF6F1" }}>
          Stamp
        </button>
        <button
          onClick={() => toggleWantToTry(cafe.id)}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-3)" }}>
          Remove
        </button>
      </div>
    </motion.div>
  );
}

export default function PassportPage() {
  const { stamps, memories, wantToTryIds, addStamp } = useBeanStore();
  const [city, setCity] = useState("Delhi");
  const [tab, setTab] = useState<Tab>("stamped");
  const [wantToTryCafes, setWantToTryCafes] = useState<Cafe[]>([]);
  const [preVisitedCafes, setPreVisitedCafes] = useState<Cafe[]>([]);

  const cityStamps = stamps.filter((s) =>
    city === "All" || s.city === city || s.cafeName.toLowerCase().includes(city.toLowerCase())
  );
  const earned = ACHIEVEMENTS.filter((a) => stamps.length >= a.need);

  useEffect(() => {
    fetchCurated().then(({ cafes }) => {
      // Pre-visited curated cafés (not yet stamped by user)
      const preVisited = cafes.filter(
        (c) => c.visitedByMe && !stamps.some((s) => s.cafeId === c.id)
      );
      setPreVisitedCafes(preVisited);

      // Want-to-try
      const wanted = cafes.filter((c) => wantToTryIds.includes(c.id));
      setWantToTryCafes(wanted);
    });
  }, [wantToTryIds, stamps]);

  const handleQuickStamp = (cafe: Cafe) => {
    addStamp({
      id: `stamp-${Date.now()}`,
      cafeId: cafe.id,
      cafeName: cafe.name,
      city: cafe.cityArea?.includes("Gurgaon") ? "Gurgaon" : "Delhi",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    });
  };

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* ── Passport hero ────────────────────────────────────────────── */}
      <div className="surface-espresso pt-14 pb-0 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: 80 + (i * 29) % 120,
                height: 80 + (i * 29) % 120,
                left: `${(i * 19) % 110 - 10}%`,
                top: `${(i * 31) % 110 - 10}%`,
                border: "1px solid rgba(250,246,241,0.04)",
              }} />
          ))}
        </div>

        <div className="relative px-5 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase mb-1.5"
                style={{ color: "rgba(250,246,241,0.35)" }}>Coffee Passport</p>
              <h1 className="text-display" style={{ color: "#FAF6F1" }}>{city}</h1>
            </div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: "rgba(250,246,241,0.08)", border: "1px solid rgba(250,246,241,0.1)" }}>
              📔
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 mb-5">
            {[
              { val: stamps.length, label: "Stamped" },
              { val: wantToTryIds.length, label: "Want To Try" },
              { val: earned.length, label: "Badges" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-5">
                {i > 0 && <div className="w-px h-8" style={{ backgroundColor: "rgba(250,246,241,0.1)" }} />}
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#FAF6F1" }}>{s.val}</p>
                  <p className="text-[10px] uppercase tracking-wide mt-0.5"
                    style={{ color: "rgba(250,246,241,0.4)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "rgba(250,246,241,0.4)" }}>Passport Progress</p>
              <p className="text-[10px] font-semibold" style={{ color: "var(--copper-lt)" }}>
                {stamps.length === 0 ? "Start exploring" : `${stamps.length} ${stamps.length === 1 ? "café" : "cafés"} explored`}
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "rgba(250,246,241,0.1)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: stamps.length === 0 ? "0%" : `${Math.min(100, stamps.length * 5)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ backgroundColor: "var(--copper)" }} />
            </div>
          </div>

          {/* City pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CITIES.map((c) => (
              <button key={c} onClick={() => setCity(c)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: city === c ? "var(--copper)" : "rgba(250,246,241,0.1)",
                  color: city === c ? "#fff" : "rgba(250,246,241,0.5)",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex" style={{ borderTop: "1px solid rgba(250,246,241,0.08)" }}>
          {(["stamped", "want-to-try", "memories"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-3.5 text-xs font-semibold capitalize relative"
              style={{ color: tab === t ? "#FAF6F1" : "rgba(250,246,241,0.4)" }}>
              {t === "want-to-try" ? "Want to Try" : t.charAt(0).toUpperCase() + t.slice(1)}
              {tab === t && (
                <motion.div layoutId="passport-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: "var(--copper)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      <div className="px-5 pt-5">

        {/* STAMPED TAB */}
        {tab === "stamped" && (
          <>
            {/* Pre-visited cafés not yet stamped */}
            {preVisitedCafes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 p-3 rounded-2xl"
                  style={{ backgroundColor: "rgba(196,132,92,0.08)", border: "1px solid rgba(196,132,92,0.15)" }}>
                  <span>☕</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: "var(--espresso)" }}>
                      {preVisitedCafes.length} visited cafés waiting to be stamped
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--charcoal-3)" }}>
                      Quick-stamp your past visits
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {preVisitedCafes.map((cafe) => (
                    <button key={cafe.id}
                      onClick={() => handleQuickStamp(cafe)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)", border: "1px solid var(--stone)" }}>
                      <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: "var(--cream-deep)" }}>
                        {cafe.photoUrls[0] ? (
                          <img src={cafe.photoUrls[0]}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            alt={cafe.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--stone-dark)" strokeWidth="1.5" /></svg>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-semibold max-w-[80px] truncate"
                          style={{ color: "var(--charcoal)" }}>{cafe.name}</p>
                        <p className="text-[10px]" style={{ color: "var(--copper)" }}>+ Stamp</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {cityStamps.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📔</p>
                <p className="font-semibold mb-1" style={{ color: "var(--charcoal)" }}>No stamps yet</p>
                <p className="text-sm mb-5" style={{ color: "var(--charcoal-3)" }}>
                  Visit a café and collect your first stamp
                </p>
                <Link href="/discover">
                  <button className="btn-espresso px-6 py-3 rounded-xl text-sm">
                    Discover cafés →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {cityStamps.map((s, i) => (
                  <StampTile key={s.id} name={s.cafeName} date={s.date} index={i} />
                ))}
              </div>
            )}

            {/* Achievements */}
            <h3 className="font-display text-lg font-semibold mb-4"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
              Achievements
            </h3>
            <div className="flex flex-col gap-3 mb-6">
              {ACHIEVEMENTS.map((a) => {
                const done = stamps.length >= a.need;
                return (
                  <div key={a.id}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ backgroundColor: done ? "#fff" : "rgba(255,255,255,0.4)", opacity: done ? 1 : 0.55, boxShadow: done ? "var(--shadow-xs)" : "none" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: done ? "var(--cream-deep)" : "rgba(232,224,213,0.5)", border: done ? "2px solid var(--stone)" : "2px dashed var(--stone)" }}>
                      {done ? a.icon : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>{a.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--charcoal-3)" }}>{a.desc}</p>
                    </div>
                    {done ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: "rgba(139,139,107,0.15)", color: "var(--olive)" }}>Earned</span>
                    ) : (
                      <span className="text-xs font-medium" style={{ color: "var(--charcoal-3)" }}>
                        {stamps.length}/{a.need}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* WANT TO TRY TAB */}
        {tab === "want-to-try" && (
          <div className="flex flex-col gap-3 pb-4">
            {wantToTryCafes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🔖</p>
                <p className="font-semibold mb-1" style={{ color: "var(--charcoal)" }}>Nothing saved yet</p>
                <p className="text-sm mb-5" style={{ color: "var(--charcoal-3)" }}>
                  Bookmark cafés from Discover to build your list
                </p>
                <Link href="/discover">
                  <button className="btn-espresso px-6 py-3 rounded-xl text-sm">
                    Explore curated picks →
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs mb-1" style={{ color: "var(--charcoal-3)" }}>
                  {wantToTryCafes.length} cafés on your list
                </p>
                {wantToTryCafes.map((cafe, i) => (
                  <WantToTryCard key={cafe.id} cafe={cafe} index={i} onStamp={handleQuickStamp} />
                ))}
              </>
            )}
          </div>
        )}

        {/* MEMORIES TAB */}
        {tab === "memories" && (
          <div className="flex flex-col gap-4 pb-4">
            {memories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📝</p>
                <p className="font-semibold mb-1" style={{ color: "var(--charcoal)" }}>No memories yet</p>
                <p className="text-sm" style={{ color: "var(--charcoal-3)" }}>
                  Save moments from your visits
                </p>
              </div>
            ) : memories.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-5 rounded-2xl" style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>{m.cafeName}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "var(--copper)" }}>{m.drinkOrdered}</p>
                  </div>
                  <p className="text-xs" style={{ color: "var(--charcoal-3)" }}>{m.date}</p>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} width="10" height="10" viewBox="0 0 12 12"
                      fill={si < m.rating ? "var(--copper)" : "var(--stone)"}>
                      <path d="M6 1l1.3 3.9H11L8.3 7.1l1 3.8L6 9 2.7 10.9l1-3.8L1 4.9h3.7z" />
                    </svg>
                  ))}
                </div>
                {m.note && (
                  <p className="text-sm italic leading-relaxed pt-2"
                    style={{ color: "var(--charcoal-2)", borderTop: "1px solid var(--cream-deep)", fontFamily: "var(--font-playfair)" }}>
                    "{m.note}"
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
