"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import { fetchDetails } from "@/lib/places-client";
import type { Cafe, PassportStamp, CoffeeMemory } from "@/lib/types";
import BottomNav from "@/components/layout/BottomNav";

function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 12 12"
          fill={s <= Math.round(rating) ? "var(--copper)" : "var(--stone)"}>
          <path d="M6 1l1.3 3.9H11L8.3 7.1l1 3.8L6 9 2.7 10.9l1-3.8L1 4.9h3.7z" />
        </svg>
      ))}
    </div>
  );
}

export default function CafeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { coffeeDNA: tasteProfile, stamps, addStamp, memories, addMemory, collections, addToCollection, removeFromCollection } = useBeanStore();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showMemory, setShowMemory] = useState(false);
  const [stampCelebration, setStampCelebration] = useState(false);
  const [form, setForm] = useState({ drink: "", rating: 5, note: "" });

  useEffect(() => {
    fetchDetails(params.id, tasteProfile ?? undefined).then((data) => {
      if (data) setCafe(data);
      setLoading(false);
    });
  }, [params.id, tasteProfile]);

  const isFav = collections.find((c) => c.id === "favorites")?.cafeIds.includes(params.id) ?? false;
  const hasStamp = stamps.some((s) => s.cafeId === params.id);
  const cafeMemories = memories.filter((m) => m.cafeId === params.id);

  const toggleFav = useCallback(() => {
    isFav ? removeFromCollection("favorites", params.id) : addToCollection("favorites", params.id);
  }, [isFav, params.id, addToCollection, removeFromCollection]);

  const collectStamp = useCallback(() => {
    if (!cafe || hasStamp) return;
    addStamp({
      id: `stamp-${params.id}-${Date.now()}`,
      cafeId: params.id,
      cafeName: cafe.name,
      city: cafe.address.split(",").slice(-2, -1)[0]?.trim() ?? "Unknown",
      date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    } as PassportStamp);
    setStampCelebration(true);
    setTimeout(() => setStampCelebration(false), 2800);
  }, [cafe, hasStamp, params.id, addStamp]);

  const saveMemory = useCallback(() => {
    if (!cafe || !form.drink) return;
    addMemory({
      id: `mem-${Date.now()}`,
      cafeId: params.id,
      cafeName: cafe.name,
      drinkOrdered: form.drink,
      rating: form.rating,
      note: form.note,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    } as CoffeeMemory);
    setShowMemory(false);
    setForm({ drink: "", rating: 5, note: "" });
  }, [cafe, form, params.id, addMemory]);

  // Real photos only — empty array means no photo available
  const photos = cafe?.photoUrls ?? [];
  const hasPhotos = photos.length > 0;

  if (!loading && !cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="text-center px-6">
          <p className="text-2xl mb-3">☕</p>
          <p className="font-semibold" style={{ color: "var(--charcoal)" }}>Café not found</p>
          <button onClick={() => router.back()} className="mt-4 text-sm font-medium"
            style={{ color: "var(--copper)" }}>← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* ── Photo hero ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: 340 }}>
        {loading ? (
          <div className="skeleton w-full h-full" />
        ) : hasPhotos ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={photoIdx}
              src={photos[photoIdx]}
              alt={cafe?.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onLoad={(e) => console.log(`[Bean There] Detail hero "${cafe?.name}" — img: ${(e.target as HTMLImageElement).src.slice(0, 80)}`)}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: "var(--espresso)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="rgba(250,246,241,0.25)" strokeWidth="1.5" />
              <circle cx="8.5" cy="10.5" r="1.5" stroke="rgba(250,246,241,0.25)" strokeWidth="1.2" />
              <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="rgba(250,246,241,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "rgba(250,246,241,0.4)" }}>No photo available</p>
          </div>
        )}

        {/* Gradient layers */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(to bottom, rgba(26,14,9,0.35) 0%, transparent 35%, rgba(26,14,9,0.5) 100%)"
        }} />

        {/* Back */}
        <button onClick={() => router.back()}
          className="absolute top-14 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(250,246,241,0.92)", backdropFilter: "blur(10px)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="var(--espresso)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Fav */}
        <button onClick={toggleFav}
          className="absolute top-14 right-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(250,246,241,0.92)", backdropFilter: "blur(10px)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={isFav ? "var(--copper)" : "none"}
            stroke={isFav ? "var(--copper)" : "var(--espresso)"}
            strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Photo dots */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setPhotoIdx(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === photoIdx ? 18 : 6,
                  height: 6,
                  backgroundColor: i === photoIdx ? "#FAF6F1" : "rgba(250,246,241,0.4)",
                }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Content card pulled up over photo ────────────────────── */}
      <div className="rounded-t-3xl -mt-8 relative z-10 pb-4"
        style={{ background: "var(--cream)" }}>

        {loading ? (
          <div className="px-5 pt-6 space-y-4">
            <div className="skeleton h-7 rounded-xl" style={{ width: "70%" }} />
            <div className="skeleton h-4 rounded-xl" style={{ width: "50%" }} />
            <div className="skeleton h-24 rounded-2xl" />
          </div>
        ) : cafe && (
          <>
            {/* Name + status */}
            <div className="px-5 pt-6 flex items-start justify-between gap-3 mb-2">
              <h1 className="font-display font-bold text-2xl leading-tight flex-1"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                {cafe.name}
              </h1>
              <span className="mt-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
                style={{
                  backgroundColor: cafe.isOpen ? "rgba(139,139,107,0.15)" : "rgba(26,26,26,0.07)",
                  color: cafe.isOpen ? "var(--olive)" : "var(--charcoal-3)",
                }}>
                {cafe.isOpen ? "Open now" : "Closed"}
              </span>
            </div>

            {/* Meta row */}
            <div className="px-5 flex items-center gap-2 mb-5 flex-wrap">
              {cafe.rating > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <Stars rating={cafe.rating} />
                    <span className="text-xs font-semibold ml-0.5" style={{ color: "var(--charcoal)" }}>
                      {cafe.rating.toFixed(1)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--charcoal-3)" }}>
                      ({cafe.reviewCount.toLocaleString()})
                    </span>
                  </div>
                  <span style={{ color: "var(--stone-dark)" }}>·</span>
                </>
              )}
              {cafe.priceLevel > 0 && (
                <>
                  <span className="text-xs" style={{ color: "var(--charcoal-3)" }}>
                    {"₹".repeat(cafe.priceLevel)}
                    <span style={{ opacity: 0.3 }}>{"₹".repeat(4 - cafe.priceLevel)}</span>
                  </span>
                  <span style={{ color: "var(--stone-dark)" }}>·</span>
                </>
              )}
              <span className="text-xs" style={{ color: "var(--charcoal-3)" }}>{cafe.hoursText}</span>
            </div>

            {/* Address + Directions */}
            <div className="px-5 mb-5">
              <div className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: "var(--cream-deep)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    stroke="var(--olive)" strokeWidth="1.5" fill="rgba(139,139,107,0.1)" />
                  <circle cx="12" cy="9" r="2" fill="var(--olive)" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed" style={{ color: "var(--charcoal-2)" }}>
                    {cafe.address}
                  </p>
                  {(cafe.googleMapsUri || (cafe.lat && cafe.lng)) && (
                    <a
                      href={cafe.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold"
                      style={{ color: "var(--copper)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11l3 3L22 4" stroke="var(--copper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="var(--copper)" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Get directions on Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Match explanation */}
            <div className="px-5 mb-5">
              <div className="rounded-2xl p-5 relative overflow-hidden surface-espresso">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: "var(--copper)", color: "#fff" }}>
                      {cafe.matchScore}% match
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(250,246,241,0.75)" }}>
                    {cafe.matchReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Editorial summary */}
            {cafe.editorialSummary && (
              <div className="px-5 mb-5">
                <p className="text-sm italic leading-relaxed"
                  style={{ color: "var(--charcoal-2)", fontFamily: "var(--font-playfair)", borderLeft: "3px solid var(--copper)", paddingLeft: "1rem" }}>
                  {cafe.editorialSummary}
                </p>
              </div>
            )}

            {/* Specialties */}
            <div className="px-5 mb-5">
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: "var(--charcoal-3)" }}>
                Known for
              </h3>
              <div className="flex flex-wrap gap-2">
                {cafe.specialties.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: "rgba(44,24,16,0.07)", color: "var(--espresso)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-5 grid grid-cols-2 gap-3 mb-3">
              <button onClick={collectStamp}
                className="py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  backgroundColor: hasStamp ? "var(--cream-deep)" : "var(--espresso)",
                  color: hasStamp ? "var(--charcoal-3)" : "#FAF6F1",
                  boxShadow: hasStamp ? "none" : "var(--shadow-sm)",
                }}>
                {hasStamp ? "✓ Stamped" : "+ Collect Stamp"}
              </button>
              <button onClick={() => setShowMemory(true)}
                className="py-3.5 rounded-2xl text-sm font-semibold border"
                style={{ borderColor: "var(--stone)", color: "var(--espresso)", backgroundColor: "#fff" }}>
                📔 Log to journal
              </button>
            </div>

            {/* Reviews */}
            {cafe.reviews && cafe.reviews.length > 0 && (
              <div className="px-5 mb-5">
                <h3 className="text-xs font-semibold tracking-widest uppercase mb-4"
                  style={{ color: "var(--charcoal-3)" }}>
                  Recent Reviews
                </h3>
                <div className="flex flex-col gap-3">
                  {cafe.reviews.slice(0, 3).map((r, i) => (
                    <div key={i} className="p-4 rounded-2xl" style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color: "var(--charcoal)" }}>{r.author}</span>
                        <div className="flex items-center gap-1.5">
                          <Stars rating={r.rating} size={9} />
                          <span className="text-[10px]" style={{ color: "var(--charcoal-3)" }}>{r.timeAgo}</span>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--charcoal-2)" }}>
                        {r.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Memories */}
            {cafeMemories.length > 0 && (
              <div className="px-5 mb-5">
                <h3 className="text-xs font-semibold tracking-widest uppercase mb-4"
                  style={{ color: "var(--charcoal-3)" }}>
                  Your Memories Here
                </h3>
                <div className="flex flex-col gap-3">
                  {cafeMemories.map((mem) => (
                    <div key={mem.id} className="p-4 rounded-2xl" style={{ backgroundColor: "#fff" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>
                          {mem.drinkOrdered}
                        </span>
                        <span className="text-xs" style={{ color: "var(--charcoal-3)" }}>{mem.date}</span>
                      </div>
                      <Stars rating={mem.rating} />
                      {mem.note && (
                        <p className="text-sm mt-2 italic leading-relaxed"
                          style={{ color: "var(--charcoal-2)", fontFamily: "var(--font-playfair)" }}>
                          "{mem.note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Stamp celebration ────────────────────────────────────── */}
      <AnimatePresence>
        {stampCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ backgroundColor: "rgba(26,14,9,0.65)" }}>
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--copper)", border: "4px solid #FAF6F1", boxShadow: "0 0 40px rgba(196,132,92,0.5)" }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-semibold" style={{ color: "#FAF6F1", fontFamily: "var(--font-playfair)" }}>
                  Stamp Collected!
                </p>
                <p className="text-sm mt-1" style={{ color: "rgba(250,246,241,0.6)" }}>
                  Added to your passport
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Memory modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showMemory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ backgroundColor: "rgba(26,14,9,0.55)" }}
            onClick={() => setShowMemory(false)}>
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="w-full max-w-[430px] mx-auto rounded-t-3xl px-6 pt-5 pb-8"
              style={{ backgroundColor: "var(--cream)" }}
              onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: "var(--stone)" }} />
              <h3 className="font-display text-xl font-semibold mb-5"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                Save a Memory
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--charcoal-3)" }}>What did you order?</label>
                  <input value={form.drink}
                    onChange={(e) => setForm((f) => ({ ...f, drink: e.target.value }))}
                    placeholder="e.g. Flat White, Cold Brew…"
                    className="w-full px-4 py-3 rounded-xl text-sm border"
                    style={{ borderColor: "var(--stone)", backgroundColor: "#fff", color: "var(--charcoal)" }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--charcoal-3)" }}>Your note</label>
                  <textarea value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="What made this visit memorable?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm border resize-none"
                    style={{ borderColor: "var(--stone)", backgroundColor: "#fff", color: "var(--charcoal)" }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--charcoal-3)" }}>Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} onClick={() => setForm((f) => ({ ...f, rating: r }))}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: form.rating >= r ? "var(--espresso)" : "var(--cream-deep)",
                          color: form.rating >= r ? "#FAF6F1" : "var(--charcoal-3)",
                        }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={saveMemory} disabled={!form.drink}
                  className="btn-espresso w-full py-4 rounded-2xl text-sm mt-1"
                  style={{ opacity: form.drink ? 1 : 0.4 }}>
                  Save Memory
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
