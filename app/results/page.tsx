"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import type { TasteProfile } from "@/lib/types";
import BottomNav from "@/components/layout/BottomNav";

const ROAST_LABELS: Record<TasteProfile["roast"], { label: string; emoji: string; note: string }> = {
  light: { label: "Light Roast", emoji: "☀️", note: "bright, fruity, complex" },
  medium: { label: "Medium Roast", emoji: "☕", note: "smooth, balanced" },
  dark: { label: "Dark Roast", emoji: "🌑", note: "bold, rich, intense" },
};

const DRINK_LABELS: Record<TasteProfile["drink"], { label: string; emoji: string }> = {
  latte: { label: "Latte", emoji: "🥛" },
  cappuccino: { label: "Cappuccino", emoji: "☕" },
  espresso: { label: "Espresso", emoji: "⚡" },
  "cold-brew": { label: "Cold Brew", emoji: "🧊" },
  "pour-over": { label: "Pour Over", emoji: "🫗" },
  matcha: { label: "Matcha", emoji: "🍵" },
};

const MILK_LABELS: Record<TasteProfile["milk"], { label: string; emoji: string }> = {
  dairy: { label: "Dairy milk", emoji: "🐄" },
  oat: { label: "Oat milk", emoji: "🌾" },
  almond: { label: "Almond milk", emoji: "🌰" },
  soy: { label: "Soy milk", emoji: "🫘" },
  none: { label: "Black — no milk", emoji: "✦" },
};

const SWEETNESS_LABELS: Record<TasteProfile["sweetness"], { label: string; emoji: string }> = {
  low: { label: "Low sweetness", emoji: "🤍" },
  medium: { label: "Medium sweetness", emoji: "🍬" },
  sweet: { label: "Sweet", emoji: "🍯" },
};

const VIBE_LABELS: Record<TasteProfile["vibe"], { label: string; emoji: string; note: string }> = {
  study: { label: "Study", emoji: "📚", note: "quiet, focused" },
  work: { label: "Work", emoji: "💻", note: "laptop-friendly" },
  social: { label: "Social", emoji: "💬", note: "catching up" },
  date: { label: "Date", emoji: "🌹", note: "cozy & aesthetic" },
  quick: { label: "Quick Coffee", emoji: "⚡", note: "grab and go" },
};

function ProfileRow({ emoji, label, note }: { emoji: string; label: string; note?: string }) {
  return (
    <div className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid var(--stone)" }}>
      <span className="text-xl w-7 text-center">{emoji}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--charcoal)" }}>{label}</p>
        {note && <p className="text-xs" style={{ color: "var(--charcoal-3)" }}>{note}</p>}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { tasteProfile } = useBeanStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !tasteProfile) router.replace("/onboarding");
  }, [hydrated, tasteProfile, router]);

  if (!hydrated || !tasteProfile) return null;

  const roast = ROAST_LABELS[tasteProfile.roast];
  const drink = DRINK_LABELS[tasteProfile.drink];
  const milk = MILK_LABELS[tasteProfile.milk];
  const sweetness = SWEETNESS_LABELS[tasteProfile.sweetness];
  const vibe = VIBE_LABELS[tasteProfile.vibe];

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* Hero */}
      <div className="surface-espresso px-6 pt-16 pb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(196,132,92,0.12), transparent)" }} />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-5xl mb-4">
          {drink.emoji}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-[10px] tracking-[0.22em] uppercase mb-2"
          style={{ color: "rgba(250,246,241,0.4)" }}>
          Your Coffee Profile
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-display leading-tight mb-2"
          style={{ color: "#FAF6F1" }}>
          {drink.label} {roast.label === "Light Roast" ? "Lover" : roast.label === "Dark Roast" ? "Devotee" : "Fan"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm italic"
          style={{ color: "var(--copper-lt)", fontFamily: "var(--font-playfair)" }}>
          {roast.note} · {vibe.note}
        </motion.p>
      </div>

      {/* Profile breakdown */}
      <div className="mx-5 mt-5 rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-md)" }}>
        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] tracking-[0.2em] uppercase font-semibold mb-1"
            style={{ color: "var(--charcoal-3)" }}>
            Your Taste Profile
          </p>
        </div>
        <div className="px-5 pb-4">
          <ProfileRow emoji={roast.emoji} label={roast.label} note={roast.note} />
          <ProfileRow emoji={drink.emoji} label={drink.label} />
          <ProfileRow emoji={milk.emoji} label={milk.label} />
          <ProfileRow emoji={sweetness.emoji} label={sweetness.label} />
          <ProfileRow emoji={vibe.emoji} label={`${vibe.label} vibes`} note={vibe.note} />
        </div>
      </div>

      {/* Match preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-5 mt-4 rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--espresso-dk), var(--espresso-md))" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 80% 30%, rgba(196,132,92,0.12), transparent)" }} />
        <p className="text-xs font-semibold mb-1 relative" style={{ color: "rgba(250,246,241,0.5)" }}>
          Bean There Match Score
        </p>
        <p className="text-sm leading-relaxed relative" style={{ color: "rgba(250,246,241,0.8)" }}>
          Cafés are ranked by how well they match your{" "}
          <span style={{ color: "var(--copper-lt)" }}>
            {tasteProfile.drink}, {tasteProfile.roast} roast
          </span>{" "}
          preference and{" "}
          <span style={{ color: "var(--copper-lt)" }}>{tasteProfile.vibe} vibe</span>.
        </p>
      </motion.div>

      {/* Coffee Card CTA — natural next step */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mx-5 mt-4">
        <button
          onClick={() => router.push("/card")}
          className="w-full rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1A0E09 0%, #2C1810 60%, #1A0E09 100%)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 80% at 80% 30%, rgba(196,132,92,0.2), transparent)" }} />
          <div className="relative px-5 py-4 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[10px] tracking-[0.18em] uppercase font-semibold mb-1"
                style={{ color: "rgba(250,246,241,0.35)" }}>Next step</p>
              <p className="text-base font-bold leading-tight" style={{ color: "#FAF6F1", fontFamily: "var(--font-playfair)" }}>
                Make Your Coffee Card
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(250,246,241,0.45)" }}>
                Share your personality with friends ↗
              </p>
            </div>
            <div className="flex-shrink-0 text-3xl">☕</div>
          </div>
        </button>
      </motion.div>

      {/* Secondary CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-5 mt-3 flex flex-col gap-2.5">
        <button
          onClick={() => router.push("/discover")}
          className="btn-copper w-full py-4 rounded-2xl text-base font-semibold">
          Find matching cafés →
        </button>
        <button
          onClick={() => router.push("/home")}
          className="w-full py-3.5 rounded-2xl text-sm font-medium"
          style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-2)" }}>
          Go to home
        </button>
        <button
          onClick={() => router.push("/onboarding")}
          className="text-xs text-center py-2"
          style={{ color: "var(--charcoal-3)" }}>
          Retake quiz
        </button>
      </motion.div>

      <BottomNav />
    </div>
  );
}
