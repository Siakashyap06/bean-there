"use client";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import type { CoffeeDNA } from "@/lib/types";
import BottomNav from "@/components/layout/BottomNav";

// ─── Label maps ──────────────────────────────────────────────────────────────

const DRINK_LABEL: Record<CoffeeDNA["drink"], string> = {
  latte: "Latte", cappuccino: "Cappuccino", espresso: "Espresso",
  "cold-brew": "Cold Brew", "pour-over": "Pour Over", matcha: "Matcha",
};
const MILK_LABEL: Record<CoffeeDNA["milk"], string> = {
  dairy: "Dairy", oat: "Oat Milk", almond: "Almond Milk", soy: "Soy Milk", none: "Black",
};
const ROAST_LABEL: Record<CoffeeDNA["roast"], string> = {
  light: "Light Roast", medium: "Medium Roast", dark: "Dark Roast",
};
const SWEETNESS_LABEL: Record<CoffeeDNA["sweetness"], string> = {
  low: "Minimal Sugar", medium: "A Little Sweet", sweet: "Sweet",
};
const VIBE_LABEL: Record<CoffeeDNA["vibe"], string> = {
  study: "Study Café Dweller", work: "Work-From-Café Type", social: "Social Café Hopper",
  date: "Date Café Romantic", quick: "Quick Coffee Person",
};

function personalityTitle(t: CoffeeDNA): string {
  if (t.drink === "matcha") return "The Matcha Minimalist";
  if (t.drink === "pour-over" && t.roast === "light") return "The Light Roast Explorer";
  if (t.drink === "espresso" && t.roast === "dark") return "The Espresso Purist";
  if (t.drink === "cold-brew") return "The Cold Brew Adventurer";
  if (t.roast === "light") return "The Specialty Seeker";
  if (t.roast === "dark") return "The Bold Devotee";
  if (t.vibe === "date") return "The Aesthetic Café Lover";
  if (t.vibe === "work" || t.vibe === "study") return "The Focused Café Regular";
  return "The Coffee Connoisseur";
}

function favouriteStyle(t: CoffeeDNA): string {
  const parts: string[] = [ROAST_LABEL[t.roast]];
  if (t.sweetness === "low") parts.push("Minimal");
  else if (t.sweetness === "sweet") parts.push("Sweet");
  if (t.drink === "pour-over" || t.drink === "espresso") parts.push("Specialty");
  else if (t.drink === "matcha") parts.push("Wellness");
  else parts.push("Smooth");
  return parts.join(" · ");
}

// ─── The card itself ──────────────────────────────────────────────────────────

function CoffeeCard({ name, personality, drink, style, spot, roast, milk, sweetness, vibe, explored, quote }: {
  name: string; personality: string; drink: string; style: string; spot: string;
  roast: string; milk: string; sweetness: string; vibe: string; explored: number; quote: string;
}) {
  return (
    <div style={{
      width: 380,
      background: "linear-gradient(145deg, #1A0E09 0%, #2C1810 40%, #1A0E09 100%)",
      borderRadius: 28, padding: "36px 32px 28px",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      position: "relative", overflow: "hidden", boxSizing: "border-box",
    }}>
      {/* Grain texture */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 28, opacity: 0.04, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />
      <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,132,92,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,132,92,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ color: "rgba(250,246,241,0.35)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4, fontFamily: "'Helvetica Neue', sans-serif" }}>Bean There ☕</p>
          <h2 style={{ color: "#FAF6F1", fontSize: 24, fontWeight: "bold", margin: 0, lineHeight: 1.2 }}>{name || "Coffee Lover"}&apos;s</h2>
          <p style={{ color: "#FAF6F1", fontSize: 20, fontWeight: "bold", margin: "2px 0 0", lineHeight: 1.2 }}>Coffee Card</p>
        </div>
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <ellipse cx="24" cy="24" rx="18" ry="22" fill="rgba(196,132,92,0.15)" stroke="rgba(196,132,92,0.4)" strokeWidth="1.5" />
            <ellipse cx="24" cy="24" rx="12" ry="16" fill="rgba(196,132,92,0.08)" stroke="rgba(196,132,92,0.3)" strokeWidth="1" />
            <path d="M24 8 C18 16 18 32 24 40" stroke="rgba(196,132,92,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="24" cy="24" rx="5" ry="7" fill="rgba(196,132,92,0.2)" />
          </svg>
        </div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(196,132,92,0.4), rgba(196,132,92,0.1), transparent)", marginBottom: 20 }} />

      {/* Personality */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ color: "rgba(250,246,241,0.35)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 5, fontFamily: "'Helvetica Neue', sans-serif" }}>Coffee Personality</p>
        <p style={{ color: "#C4845C", fontSize: 16, fontWeight: "bold", margin: 0, fontFamily: "'Helvetica Neue', sans-serif" }}>{personality}</p>
      </div>

      {/* 2-col details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: 18 }}>
        {[
          { label: "Favourite Drink", value: `${milk !== "Black" ? milk + " " : ""}${drink}` },
          { label: "Preferred Roast", value: roast },
          { label: "Sweetness", value: sweetness },
          { label: "Café Vibe", value: vibe },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ color: "rgba(250,246,241,0.3)", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 3, fontFamily: "'Helvetica Neue', sans-serif" }}>{label}</p>
            <p style={{ color: "rgba(250,246,241,0.85)", fontSize: 12, margin: 0, fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Style chips */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ color: "rgba(250,246,241,0.3)", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 5, fontFamily: "'Helvetica Neue', sans-serif" }}>Coffee Style</p>
        <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          {style.split(" · ").map((s) => (
            <span key={s} style={{ background: "rgba(196,132,92,0.15)", border: "1px solid rgba(196,132,92,0.3)", borderRadius: 20, padding: "3px 10px", color: "rgba(250,246,241,0.7)", fontSize: 10, fontFamily: "'Helvetica Neue', sans-serif" }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Spot + count */}
      <div style={{ display: "grid", gridTemplateColumns: spot ? "1fr auto" : "1fr", gap: 16, alignItems: "end", marginBottom: 20 }}>
        {spot && (
          <div>
            <p style={{ color: "rgba(250,246,241,0.3)", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 3, fontFamily: "'Helvetica Neue', sans-serif" }}>Favourite Spot</p>
            <p style={{ color: "rgba(250,246,241,0.85)", fontSize: 12, margin: 0, fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif" }}>{spot}</p>
          </div>
        )}
        {explored > 0 && (
          <div style={{ textAlign: spot ? "right" : "left" }}>
            <p style={{ color: "#C4845C", fontSize: 22, fontWeight: "bold", margin: 0, lineHeight: 1, fontFamily: "'Helvetica Neue', sans-serif" }}>{explored}</p>
            <p style={{ color: "rgba(250,246,241,0.3)", fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", margin: "2px 0 0", fontFamily: "'Helvetica Neue', sans-serif" }}>cafés explored</p>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(196,132,92,0.1), rgba(196,132,92,0.4), transparent)", marginBottom: 16 }} />

      <p style={{ color: "rgba(250,246,241,0.5)", fontSize: 11, fontStyle: "italic", margin: "0 0 16px", lineHeight: 1.5, fontFamily: "'Georgia', serif" }}>
        &ldquo;{quote || "Always chasing the perfect cup"}&rdquo;
      </p>

      <p style={{ color: "rgba(250,246,241,0.2)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, textAlign: "center", fontFamily: "'Helvetica Neue', sans-serif" }}>
        Find your coffee personality on Bean There
      </p>
    </div>
  );
}

// ─── Spot picker (verified from stamps + saved) ───────────────────────────────

function SpotPicker({ stamps, selectedId, onSelect }: {
  stamps: { cafeId: string; cafeName: string; city?: string }[];
  selectedId: string;
  onSelect: (cafeId: string, cafeName: string) => void;
}) {
  if (stamps.length === 0) {
    return (
      <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "var(--cream-deep)" }}>
        <p className="text-sm" style={{ color: "var(--charcoal-3)" }}>
          Visit a café and stamp your passport — it'll appear here as a verified option.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onSelect("", "")}
        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
        style={{
          backgroundColor: !selectedId ? "var(--espresso)" : "#fff",
          border: `1.5px solid ${!selectedId ? "var(--espresso)" : "var(--stone)"}`,
          color: !selectedId ? "#FAF6F1" : "var(--charcoal-3)",
        }}>
        No favourite spot yet
      </button>
      {stamps.map((s) => (
        <button
          key={s.cafeId}
          onClick={() => onSelect(s.cafeId, s.cafeName)}
          className="w-full text-left px-4 py-3 rounded-xl transition-all"
          style={{
            backgroundColor: selectedId === s.cafeId ? "var(--espresso)" : "#fff",
            border: `1.5px solid ${selectedId === s.cafeId ? "var(--espresso)" : "var(--stone)"}`,
          }}>
          <p className="text-sm font-semibold leading-snug" style={{ color: selectedId === s.cafeId ? "#FAF6F1" : "var(--charcoal)" }}>
            {s.cafeName}
          </p>
          {s.city && (
            <p className="text-xs mt-0.5" style={{ color: selectedId === s.cafeId ? "rgba(250,246,241,0.5)" : "var(--charcoal-3)" }}>
              {s.city}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardPage() {
  const router = useRouter();
  const { coffeeDNA: tasteProfile, stamps, cardProfile, setCardProfile } = useBeanStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);
  const [form, setForm] = useState({ name: "", favSpotCafeId: "", favSpotCafeName: "", quote: "" });

  // Deduplicated visited cafés (source of truth for favourite spot)
  const visitedCafes = useMemo(() => {
    const seen = new Set<string>();
    return stamps
      .filter((s) => { if (seen.has(s.cafeId)) return false; seen.add(s.cafeId); return true; })
      .map((s) => ({ cafeId: s.cafeId, cafeName: s.cafeName, city: s.city }));
  }, [stamps]);

  useEffect(() => {
    setHydrated(true);
    if (cardProfile) {
      setForm({
        name: cardProfile.name,
        favSpotCafeId: cardProfile.favSpotCafeId,
        favSpotCafeName: cardProfile.favSpotCafeName,
        quote: cardProfile.quote,
      });
    }
  }, [cardProfile]);

  useEffect(() => {
    if (hydrated && !tasteProfile) router.replace("/onboarding");
  }, [hydrated, tasteProfile, router]);

  const handleSave = useCallback(() => {
    setCardProfile(form);
    setEditing(false);
  }, [form, setCardProfile]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, scale: 3, useCORS: true, logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.name || "my"}-coffee-card.png`;
      a.click();
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  }, [form.name]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, scale: 3, useCORS: true, logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "coffee-card.png", { type: "image/png" });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${form.name || "My"} Coffee Card`,
            text: "Find your coffee personality on Bean There ☕",
            files: [file],
          });
        } else {
          setShared(true);
          setTimeout(() => setShared(false), 2500);
        }
      }, "image/png");
    } catch (e) {
      console.error("Share failed:", e);
    }
  }, [form.name]);

  if (!hydrated || !tasteProfile) return null;

  const personality = personalityTitle(tasteProfile);
  const style = favouriteStyle(tasteProfile);
  const cardProps = {
    name: form.name,
    personality,
    drink: DRINK_LABEL[tasteProfile.drink],
    style,
    spot: form.favSpotCafeName,
    roast: ROAST_LABEL[tasteProfile.roast],
    milk: MILK_LABEL[tasteProfile.milk],
    sweetness: SWEETNESS_LABEL[tasteProfile.sweetness],
    vibe: VIBE_LABEL[tasteProfile.vibe],
    explored: stamps.length,
    quote: form.quote,
  };

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* Header */}
      <div className="surface-espresso px-5 pt-14 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(250,246,241,0.1)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#FAF6F1" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight"
              style={{ color: "#FAF6F1", fontFamily: "var(--font-playfair)" }}>
              My Coffee Card
            </h1>
            <p className="text-[11px]" style={{ color: "rgba(250,246,241,0.4)" }}>
              Share your coffee personality with friends
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 flex flex-col items-center gap-5">

        {/* Card preview */}
        <div style={{ filter: "drop-shadow(0 20px 40px rgba(26,14,9,0.35))" }}>
          <div ref={cardRef}>
            <CoffeeCard {...cardProps} />
          </div>
        </div>

        {/* Personalise nudge — shown if no card profile saved yet */}
        {!cardProfile && !editing && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full w-full justify-center"
            style={{ backgroundColor: "rgba(196,132,92,0.1)", border: "1px solid rgba(196,132,92,0.25)" }}>
            <span className="text-sm">✏️</span>
            <p className="text-xs font-medium" style={{ color: "var(--copper)" }}>
              Add your name & favourite spot to personalise
            </p>
          </motion.button>
        )}

        {/* Edit panel */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden">
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-md)" }}>
                <p className="text-sm font-semibold mb-4" style={{ color: "var(--charcoal)" }}>
                  Personalise your card
                </p>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal-3)" }}>
                    Your name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.slice(0, 24) }))}
                    placeholder="e.g. Sia"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#fff", border: "1.5px solid var(--stone)", color: "var(--charcoal)" }}
                  />
                </div>

                {/* Favourite spot — verified from stamps */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal-3)" }}>
                    Favourite café
                    {visitedCafes.length > 0 && (
                      <span className="ml-1.5 text-[10px] font-normal px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(196,132,92,0.12)", color: "var(--copper)" }}>
                        from your visits
                      </span>
                    )}
                  </label>
                  <SpotPicker
                    stamps={visitedCafes}
                    selectedId={form.favSpotCafeId}
                    onSelect={(id, name) => setForm((f) => ({ ...f, favSpotCafeId: id, favSpotCafeName: name }))}
                  />
                </div>

                {/* Quote */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal-3)" }}>
                    Personal coffee quote
                  </label>
                  <input
                    value={form.quote}
                    onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value.slice(0, 60) }))}
                    placeholder="Always chasing the perfect cup"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#fff", border: "1.5px solid var(--stone)", color: "var(--charcoal)" }}
                  />
                  <p className="text-[10px] mt-1 text-right" style={{ color: "var(--charcoal-3)" }}>
                    {form.quote.length}/60
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-2)" }}>
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "var(--espresso)", color: "#FAF6F1" }}>
                    Save Card
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--espresso)", color: "#FAF6F1", opacity: downloading ? 0.7 : 1 }}>
            {downloading ? <><span className="animate-spin inline-block">⏳</span> Generating…</> : <>⬇️ Download My Coffee Card</>}
          </button>

          <button
            onClick={handleShare}
            className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--copper)", color: "#fff" }}>
            ☕ {shared ? "Copied to clipboard!" : "Share My Coffee Profile"}
          </button>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-2)" }}>
              ✏️ {cardProfile ? "Edit card details" : "Add name & favourite spot"}
            </button>
          )}
        </div>

        <p className="text-center text-[11px] pb-2" style={{ color: "var(--charcoal-3)" }}>
          Your cafés explored count updates as you stamp more visits.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
