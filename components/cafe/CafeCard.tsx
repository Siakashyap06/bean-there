"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Cafe } from "@/lib/types";
import { useBeanStore } from "@/lib/store";

interface Props {
  cafe: Cafe;
  index?: number;
  compact?: boolean;
}

function PriceLevel({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="text-xs" style={{ color: "var(--charcoal-3)" }}>
      {"₹".repeat(level)}
      <span style={{ opacity: 0.3 }}>{"₹".repeat(Math.max(0, 4 - level))}</span>
    </span>
  );
}

function MatchBadge({ score }: { score: number }) {
  const high = score >= 90;
  return (
    <div className={high ? "match-badge-high" : "match-badge-mid"}>
      {score}% match
    </div>
  );
}

/** Shown when a place genuinely has no photo from Google Places */
function NoPhoto({ compact }: { compact: boolean }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-1.5"
      style={{ backgroundColor: "var(--cream-deep)" }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--stone-dark)" strokeWidth="1.5" />
        <circle cx="8.5" cy="10.5" r="1.5" stroke="var(--stone-dark)" strokeWidth="1.2" />
        <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="var(--stone-dark)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <p className="text-[10px] font-medium" style={{ color: "var(--stone-dark)" }}>No photo available</p>
      )}
    </div>
  );
}

export default function CafeCard({ cafe, index = 0, compact = false }: Props) {
  const { collections, addToCollection, removeFromCollection } = useBeanStore();
  const isFav = collections.find((c) => c.id === "favorites")?.cafeIds.includes(cafe.id) ?? false;
  const [imgError, setImgError] = useState(false);

  // Determine real photo source — empty array means no real photo exists
  const rawSrc = cafe.photoUrls[0] ?? null;
  const hasPhoto = !!rawSrc && !imgError;

  // Log image source on mount (dev visibility)
  useEffect(() => {
    if (rawSrc) {
      const source = rawSrc.startsWith("/api/places/photo")
        ? `Google Places proxy (${rawSrc.slice(0, 80)}…)`
        : rawSrc.startsWith("http")
        ? `External URL: ${rawSrc.slice(0, 80)}`
        : rawSrc;
      console.log(`[Bean There] CafeCard "${cafe.name}" — image source: ${source}`);
    } else {
      console.log(`[Bean There] CafeCard "${cafe.name}" — NO photo (photoUrls is empty)`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafe.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isFav ? removeFromCollection("favorites", cafe.id) : addToCollection("favorites", cafe.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/cafe/${cafe.id}`}>
        <article className="card-editorial">
          {/* ── Photo / No-photo ──────────────────────────────────── */}
          <div className="relative overflow-hidden"
            style={{ height: compact ? 160 : 220 }}>

            {hasPhoto ? (
              <>
                <img
                  src={rawSrc!}
                  alt={cafe.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(to bottom, rgba(26,14,9,0.2) 0%, transparent 40%, rgba(26,14,9,0.55) 100%)"
                }} />
              </>
            ) : (
              <NoPhoto compact={compact} />
            )}

            {/* Top left: open badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{
                  backgroundColor: cafe.isOpen ? "rgba(139,139,107,0.85)" : "rgba(26,14,9,0.65)",
                  color: "#FAF6F1",
                  backdropFilter: "blur(8px)",
                }}>
                {cafe.isOpen ? "Open" : "Closed"}
              </span>
            </div>

            {/* Top right: fav */}
            <button onClick={toggleFav}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(250,246,241,0.92)", backdropFilter: "blur(8px)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24"
                fill={isFav ? "var(--copper)" : "none"}
                stroke={isFav ? "var(--copper)" : "rgba(26,14,9,0.6)"}
                strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Bottom: match badge */}
            <div className="absolute bottom-3 left-3">
              <MatchBadge score={cafe.matchScore} />
            </div>

            {/* Bottom right: rating */}
            {cafe.rating > 0 && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ backgroundColor: "rgba(250,246,241,0.92)", backdropFilter: "blur(8px)" }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="var(--copper)">
                  <path d="M6 1l1.3 3.9H11L8.3 7.1l1 3.8L6 9 2.7 10.9l1-3.8L1 4.9h3.7z" />
                </svg>
                <span className="text-[11px] font-semibold" style={{ color: "var(--espresso)" }}>
                  {cafe.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* ── Content ─────────────────────────────────────────────── */}
          <div className="p-4">
            <h3 className="font-display font-semibold text-[17px] leading-tight mb-1"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
              {cafe.name}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs" style={{ color: "var(--charcoal-3)" }}>
                {cafe.address.split(",").slice(-2).join(",").trim()}
              </span>
              {cafe.priceLevel > 0 && (
                <>
                  <span style={{ color: "var(--stone-dark)" }}>·</span>
                  <PriceLevel level={cafe.priceLevel} />
                </>
              )}
            </div>

            {!compact && (
              <div className="pt-3 mb-3" style={{ borderTop: "1px solid var(--cream-deep)" }}>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--charcoal-2)" }}>
                  <span style={{ color: "var(--copper)", fontWeight: 600 }}>Why this matches · </span>
                  {cafe.matchReason}
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide"
                style={{ backgroundColor: "rgba(44,24,16,0.07)", color: "var(--espresso)" }}>
                {cafe.vibe}
              </span>
              {cafe.specialties.slice(0, compact ? 1 : 2).map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg text-[10px] font-medium"
                  style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-2)" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────────── */
export function CafeCardSkeleton() {
  return (
    <div className="card-editorial overflow-hidden">
      <div className="skeleton" style={{ height: 220 }} />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 rounded-lg" style={{ width: "65%" }} />
        <div className="skeleton h-3.5 rounded-lg" style={{ width: "45%" }} />
        <div className="skeleton h-3 rounded-lg" style={{ width: "90%" }} />
        <div className="skeleton h-3 rounded-lg" style={{ width: "80%" }} />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-6 rounded-lg" style={{ width: 80 }} />
          <div className="skeleton h-6 rounded-lg" style={{ width: 100 }} />
        </div>
      </div>
    </div>
  );
}
