"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBeanStore } from "@/lib/store";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";

const TASTE_EMOJIS: Record<string, string> = {
  // roast
  light: "☀️", medium: "☕", dark: "🌑",
  // drink
  latte: "🥛", cappuccino: "☕", espresso: "⚡", "cold-brew": "🧊", "pour-over": "🫗", matcha: "🍵",
  // milk
  dairy: "🐄", oat: "🌾", almond: "🌰", soy: "🫘", none: "✦",
  // sweetness
  low: "🤍", sweet: "🍯",
  // vibe
  study: "📚", work: "💻", social: "💬", date: "🌹", quick: "⚡",
};

const TASTE_LABELS: Record<string, string> = {
  light: "Light Roast", medium: "Medium Roast", dark: "Dark Roast",
  latte: "Latte", cappuccino: "Cappuccino", espresso: "Espresso",
  "cold-brew": "Cold Brew", "pour-over": "Pour Over", matcha: "Matcha",
  dairy: "Dairy milk", oat: "Oat milk", almond: "Almond milk", soy: "Soy milk", none: "Black",
  low: "Low sweetness", sweet: "Sweet",
  study: "Study vibes", work: "Work vibes", social: "Social vibes", date: "Date vibes", quick: "Quick Coffee",
};

const SETTINGS = [
  {
    title: "Preferences",
    items: [
      { icon: "🔔", label: "Notifications", value: "On" },
      { icon: "📍", label: "Location", value: "While using" },
      { icon: "🌍", label: "City", value: "Delhi NCR" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "👤", label: "Edit Profile" },
      { icon: "🔗", label: "Share Profile" },
      { icon: "📤", label: "Export Passport" },
    ],
  },
  {
    title: "About",
    items: [
      { icon: "ℹ️", label: "Version", value: "2.0.0" },
      { icon: "🔒", label: "Privacy Policy" },
      { icon: "📄", label: "Terms of Service" },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { coffeeDNA: tasteProfile, stamps, memories, collections, wantToTryIds, reset } = useBeanStore();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* Header */}
      <div className="pt-14 px-5 pb-5 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
          Profile
        </h1>
        {tasteProfile && (
          <Link href="/card">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: "var(--espresso)", color: "#FAF6F1" }}>
              ☕ My Coffee Card
            </motion.button>
          </Link>
        )}
      </div>

      {/* Taste Profile card */}
      <div className="px-5 mb-5">
        {tasteProfile ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden surface-espresso relative"
            style={{ boxShadow: "var(--shadow-lg)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 50% 60% at 85% 40%, rgba(196,132,92,0.15), transparent)" }} />

            <div className="relative p-6">
              <p className="text-[10px] tracking-[0.22em] uppercase mb-2"
                style={{ color: "rgba(250,246,241,0.35)" }}>Your Taste Profile</p>

              <div className="text-3xl mb-3">
                {TASTE_EMOJIS[tasteProfile.drink] ?? "☕"}
              </div>

              <h2 className="font-display text-2xl font-bold mb-1 leading-tight"
                style={{ color: "#FAF6F1", fontFamily: "var(--font-playfair)" }}>
                {TASTE_LABELS[tasteProfile.drink]}{" "}
                {tasteProfile.roast === "light" ? "Lover" : tasteProfile.roast === "dark" ? "Devotee" : "Fan"}
              </h2>
              <p className="text-xs italic" style={{ color: "var(--copper-lt)", fontFamily: "var(--font-playfair)" }}>
                {TASTE_LABELS[tasteProfile.roast]} · {TASTE_LABELS[tasteProfile.vibe]}
              </p>

              {/* Mini tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[tasteProfile.milk, tasteProfile.sweetness].map((key) => (
                  <span key={key} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "rgba(250,246,241,0.1)", color: "rgba(250,246,241,0.65)" }}>
                    {TASTE_EMOJIS[key] ?? ""} {TASTE_LABELS[key] ?? key}
                  </span>
                ))}
              </div>
            </div>

            <Link href="/results">
              <button className="relative w-full py-3 text-xs font-semibold flex items-center justify-center gap-1"
                style={{ color: "rgba(250,246,241,0.45)", borderTop: "1px solid rgba(250,246,241,0.08)" }}>
                View full profile
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="rounded-3xl p-6 flex items-center gap-4"
            style={{ border: "2px dashed var(--stone)" }}>
            <div className="flex-1">
              <p className="font-semibold mb-1" style={{ color: "var(--charcoal)" }}>Discover your Coffee Profile</p>
              <p className="text-sm" style={{ color: "var(--charcoal-3)" }}>Take the quiz for personalised matches</p>
            </div>
            <Link href="/onboarding">
              <button className="btn-espresso px-4 py-2.5 rounded-xl text-sm flex-shrink-0">Start →</button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "📔", label: "Stamps", val: stamps.length },
            { emoji: "📝", label: "Memories", val: memories.length },
            { emoji: "🔖", label: "Want to Try", val: wantToTryIds.length },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}>
              <p className="text-2xl mb-1">{s.emoji}</p>
              <p className="font-bold text-xl" style={{ color: "var(--charcoal)" }}>{s.val}</p>
              <p className="text-[10px] uppercase tracking-wide mt-0.5"
                style={{ color: "var(--charcoal-3)" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div className="px-5 mb-5">
        <h3 className="font-display text-lg font-semibold mb-3"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
          Collections
        </h3>
        <div className="flex flex-col gap-2">
          {collections.map((col, i) => (
            <motion.div key={col.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: "var(--cream-deep)" }}>
                {col.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>{col.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--charcoal-3)" }}>
                  {col.cafeIds.length} {col.cafeIds.length === 1 ? "café" : "cafés"}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="var(--stone-dark)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings */}
      {SETTINGS.map((section) => (
        <div key={section.title} className="px-5 mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2 px-1"
            style={{ color: "var(--charcoal-3)" }}>
            {section.title}
          </p>
          <div className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xs)" }}>
            {section.items.map((item, i) => (
              <button key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderTop: i > 0 ? "1px solid var(--cream-deep)" : "none" }}>
                <span className="text-base w-6 flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-sm font-medium" style={{ color: "var(--charcoal)" }}>
                  {item.label}
                </span>
                {"value" in item && item.value && (
                  <span className="text-xs" style={{ color: "var(--charcoal-3)" }}>{item.value}</span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path d="M9 18l6-6-6-6" stroke="var(--stone-dark)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Retake quiz */}
      {tasteProfile && (
        <div className="px-5 mb-3">
          <button onClick={() => router.push("/onboarding")}
            className="w-full py-4 rounded-2xl text-sm font-semibold"
            style={{ backgroundColor: "rgba(44,24,16,0.07)", color: "var(--espresso)" }}>
            Retake Coffee Quiz
          </button>
        </div>
      )}

      {/* Reset */}
      <div className="px-5 mb-8">
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)}
            className="w-full py-4 rounded-2xl text-sm"
            style={{ color: "rgba(176,96,96,0.8)", backgroundColor: "rgba(176,96,96,0.05)" }}>
            Reset all data
          </button>
        ) : (
          <div className="p-5 rounded-2xl"
            style={{ backgroundColor: "rgba(176,96,96,0.06)", border: "1px solid rgba(176,96,96,0.15)" }}>
            <p className="text-sm font-medium text-center mb-5" style={{ color: "var(--charcoal)" }}>
              This will erase all your stamps, memories, and taste profile. Continue?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--stone)", color: "var(--espresso)" }}>
                Cancel
              </button>
              <button onClick={() => { reset(); router.push("/"); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "rgba(176,96,96,0.9)", color: "#fff" }}>
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
