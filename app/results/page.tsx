"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import { dnaHeadline, dnaTagline } from "@/lib/dna-engine";
import CoffeeConstellation from "@/components/CoffeeConstellation";
import BottomNav from "@/components/layout/BottomNav";

const DRINK_EMOJI: Record<string, string> = {
  espresso: "⚡", latte: "🥛", cappuccino: "☕",
  "cold-brew": "🧊", "pour-over": "🫗", matcha: "🍵",
};
const ROAST_NOTE: Record<string, string> = {
  light: "bright & fruity", medium: "smooth & balanced", dark: "bold & intense",
};
const MILK_LABEL: Record<string, string> = {
  dairy: "Dairy milk", oat: "Oat milk", almond: "Almond milk", soy: "Soy milk", none: "Black — no milk",
};
const SWEETNESS_LABEL: Record<string, string> = {
  low: "Unsweetened", medium: "Medium sweet", sweet: "Sweet",
};
const VIBE_LABEL: Record<string, { label: string; note: string }> = {
  study: { label: "Study", note: "quiet & focused" },
  work: { label: "Work", note: "laptop-friendly" },
  social: { label: "Social", note: "catching up" },
  date: { label: "Date", note: "cozy & aesthetic" },
  quick: { label: "Quick", note: "grab and go" },
};

function DNARow({ emoji, label, note }: { emoji: string; label: string; note?: string }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--stone)" }}>
      <span className="text-lg w-7 text-center flex-shrink-0">{emoji}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--charcoal)", fontFamily: "var(--font-geist)" }}>{label}</p>
        {note && <p className="text-xs mt-0.5" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>{note}</p>}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { coffeeDNA } = useBeanStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (hydrated && !coffeeDNA) router.replace("/onboarding");
  }, [hydrated, coffeeDNA, router]);

  if (!hydrated || !coffeeDNA) return null;

  const headline = dnaHeadline(coffeeDNA);
  const tagline  = dnaTagline(coffeeDNA);
  const drinkEmoji = DRINK_EMOJI[coffeeDNA.drink] ?? "☕";
  const vibe = VIBE_LABEL[coffeeDNA.vibe] ?? { label: coffeeDNA.vibe, note: "" };

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* ── Hero — Constellation ────────────────────────────────────────────── */}
      <div className="surface-espresso relative overflow-hidden" style={{ paddingTop: "3.5rem", paddingBottom: "2.5rem" }}>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(212,168,83,0.1), transparent)" }} />

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-overline text-center mb-1"
          style={{ color: "rgba(250,246,241,0.45)" }}>
          Your Coffee DNA
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center px-6 mb-1"
          style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem, 8vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#FAF6F1", lineHeight: 1.08 }}>
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="text-center text-sm italic mb-8 px-6"
          style={{ color: "var(--copper-lt)", fontFamily: "var(--font-instrument)" }}>
          {tagline}
        </motion.p>

        {/* Constellation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
          style={{ background: "rgba(0,0,0,0.25)", borderRadius: "1.5rem", margin: "0 1.25rem", padding: "1.5rem 1rem" }}>
          <CoffeeConstellation stars={coffeeDNA.constellation} width={280} height={280} animate />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-xs mt-4"
          style={{ color: "rgba(250,246,241,0.3)", fontFamily: "var(--font-geist)" }}>
          Your constellation updates as you discover more cafés
        </motion.p>
      </div>

      {/* ── DNA Breakdown ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-5 mt-5 rounded-2xl overflow-hidden"
        style={{ background: "#fff", boxShadow: "var(--shadow-md)" }}>
        <div className="px-5 pt-4 pb-1">
          <p className="text-overline" style={{ color: "var(--charcoal-3)" }}>Taste Profile</p>
        </div>
        <div className="px-5 pb-4">
          <DNARow emoji={drinkEmoji} label={coffeeDNA.drink.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())} note="Your go-to drink" />
          <DNARow emoji={coffeeDNA.roast === "light" ? "☀️" : coffeeDNA.roast === "dark" ? "🌑" : "☁️"} label={`${coffeeDNA.roast.charAt(0).toUpperCase() + coffeeDNA.roast.slice(1)} roast`} note={ROAST_NOTE[coffeeDNA.roast]} />
          <DNARow emoji="🥛" label={MILK_LABEL[coffeeDNA.milk] ?? coffeeDNA.milk} />
          <DNARow emoji="🍯" label={SWEETNESS_LABEL[coffeeDNA.sweetness] ?? coffeeDNA.sweetness} />
          <DNARow emoji="✨" label={`${vibe.label} vibes`} note={vibe.note} />
        </div>
      </motion.div>

      {/* ── DNA attribute bars ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-5 mt-4 rounded-2xl overflow-hidden"
        style={{ background: "#fff", boxShadow: "var(--shadow-sm)" }}>
        <div className="px-5 pt-4 pb-1">
          <p className="text-overline" style={{ color: "var(--charcoal-3)" }}>Coffee DNA Scores</p>
        </div>
        <div className="px-5 pb-4 flex flex-col gap-3 mt-2">
          {[
            { label: "Specialty interest", value: coffeeDNA.specialtyInterest, emoji: "✨" },
            { label: "Adventure level",    value: coffeeDNA.adventureLevel,    emoji: "🌍" },
            { label: "Matcha affinity",    value: coffeeDNA.matchaInterest,    emoji: "🍵" },
            { label: "Work-from-café",     value: coffeeDNA.workFromCafe,      emoji: "💻" },
            { label: "Cozy preference",    value: 10 - coffeeDNA.ambienceStyle, emoji: "❤️" },
            { label: "Date spot seeker",   value: coffeeDNA.dateAtCafe,        emoji: "🌹" },
          ].map(({ label, value, emoji }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: "var(--charcoal-2)", fontFamily: "var(--font-geist)" }}>
                  {emoji} {label}
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--copper)", fontFamily: "var(--font-geist)" }}>
                  {value.toFixed(0)}/10
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--stone)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--copper-dk), var(--copper))" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / 10) * 100}%` }}
                  transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Match preview ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mx-5 mt-4 rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--espresso-dk), var(--espresso-md))" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 80% 30%, rgba(212,168,83,0.1), transparent)" }} />
        <p className="text-xs font-semibold mb-1 relative" style={{ color: "rgba(250,246,241,0.45)", fontFamily: "var(--font-geist)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          How matching works
        </p>
        <p className="text-sm leading-relaxed relative" style={{ color: "rgba(250,246,241,0.82)", fontFamily: "var(--font-geist)" }}>
          Cafés are ranked by your Coffee DNA — roast, drink, vibe, specialty interest, and ambience preference all factor in. Match scores are real, not arbitrary.
        </p>
      </motion.div>

      {/* ── CTAs ─────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="mx-5 mt-4">
        <button
          onClick={() => router.push("/card")}
          className="w-full rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1A0E09 0%, #2C1810 60%, #1A0E09 100%)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 80% 30%, rgba(212,168,83,0.18), transparent)" }} />
          <div className="relative px-5 py-4 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-overline mb-1" style={{ color: "rgba(250,246,241,0.35)" }}>Next step</p>
              <p className="text-base font-bold leading-tight" style={{ color: "#FAF6F1", fontFamily: "var(--font-fraunces)" }}>Make Your Coffee Card</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(250,246,241,0.4)", fontFamily: "var(--font-geist)" }}>Share your DNA with the world ↗</p>
            </div>
            <div className="flex-shrink-0 text-3xl">{drinkEmoji}</div>
          </div>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.82 }}
        className="px-5 mt-3 flex flex-col gap-2.5 mb-4">
        <button onClick={() => router.push("/discover")} className="btn-copper w-full py-4 rounded-2xl text-base font-semibold">
          Find matching cafés →
        </button>
        <button
          onClick={() => router.push("/home")}
          className="w-full py-3.5 rounded-2xl text-sm font-medium"
          style={{ background: "var(--cream-deep)", color: "var(--charcoal-2)", fontFamily: "var(--font-geist)" }}>
          Go to home
        </button>
        <button
          onClick={() => router.push("/onboarding")}
          className="text-xs text-center py-2"
          style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
          Retake quiz
        </button>
      </motion.div>

      <BottomNav />
    </div>
  );
}
