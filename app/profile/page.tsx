"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBeanStore } from "@/lib/store";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";

const TASTE_EMOJIS: Record<string, string> = {
  light: "☀️", medium: "☕", dark: "🌑",
  latte: "🥛", cappuccino: "☕", espresso: "⚡", "cold-brew": "🧊", "pour-over": "🫗", matcha: "🍵",
  dairy: "🐄", oat: "🌾", almond: "🌰", soy: "🫘", none: "✦",
  low: "🤍", sweet: "🍯",
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
    title: "About",
    items: [
      { icon: "ℹ️", label: "Version", value: "2.0.0" },
      { icon: "🔒", label: "Privacy Policy" },
      { icon: "📄", label: "Terms of Service" },
    ],
  },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    coffeeDNA: tasteProfile, stamps, memories, collections,
    wantToTryIds, reset, userProfile, setUserProfile,
  } = useBeanStore();

  const [confirmReset, setConfirmReset] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(userProfile?.name ?? "");
  const [draftEmail, setDraftEmail] = useState(userProfile?.email ?? "");

  const openEdit = () => {
    setDraftName(userProfile?.name ?? "");
    setDraftEmail(userProfile?.email ?? "");
    setEditOpen(true);
  };

  const saveEdit = () => {
    setUserProfile({ name: draftName.trim(), email: draftEmail.trim() });
    setEditOpen(false);
  };

  const initials = userProfile?.name ? getInitials(userProfile.name) : null;

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* Header */}
      <div className="pt-14 px-5 pb-2 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-fraunces)" }}>
          Profile
        </h1>
        {tasteProfile && (
          <Link href="/card">
            <motion.button whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: "var(--espresso)", color: "#FAF6F1" }}>
              ☕ My Coffee Card
            </motion.button>
          </Link>
        )}
      </div>

      {/* User identity card */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-sm)" }}>

          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
            style={{
              background: initials
                ? "linear-gradient(135deg, var(--espresso) 0%, var(--espresso-md) 100%)"
                : "var(--cream-deep)",
              color: initials ? "#FAF6F1" : "var(--stone-dark)",
              fontFamily: "var(--font-fraunces)",
            }}>
            {initials ?? "☕"}
          </div>

          {/* Name / email */}
          <div className="flex-1 min-w-0">
            {userProfile?.name ? (
              <>
                <p className="font-semibold text-base leading-tight truncate"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-fraunces)" }}>
                  {userProfile.name}
                </p>
                {userProfile.email ? (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--charcoal-3)" }}>
                    {userProfile.email}
                  </p>
                ) : (
                  <button onClick={openEdit} className="text-xs mt-0.5" style={{ color: "var(--copper)" }}>
                    + Add email
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="font-medium text-sm" style={{ color: "var(--charcoal-2)" }}>No name set</p>
                <button onClick={openEdit} className="text-xs mt-0.5" style={{ color: "var(--copper)" }}>
                  + Add your name &amp; email
                </button>
              </>
            )}
          </div>

          {/* Edit pencil */}
          <button onClick={openEdit}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--cream-deep)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="var(--charcoal-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="var(--charcoal-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Edit Profile bottom sheet */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ backgroundColor: "rgba(26,14,9,0.5)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}>

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="w-full rounded-t-3xl p-6"
              style={{ backgroundColor: "var(--cream)", maxWidth: 430, margin: "0 auto" }}>

              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: "var(--stone-dark)" }} />

              <h2 className="font-display text-2xl font-bold mb-6"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-fraunces)" }}>
                Edit Profile
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--charcoal-3)" }}>Name</label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3.5 rounded-2xl text-base"
                  style={{
                    backgroundColor: "#fff",
                    border: "1.5px solid var(--stone)",
                    color: "var(--charcoal)",
                  }}
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--charcoal-3)" }}>Email</label>
                <input
                  type="email"
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 rounded-2xl text-base"
                  style={{
                    backgroundColor: "#fff",
                    border: "1.5px solid var(--stone)",
                    color: "var(--charcoal)",
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEditOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-sm font-semibold"
                  style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-2)" }}>
                  Cancel
                </button>
                <button onClick={saveEdit}
                  className="flex-1 py-4 rounded-2xl text-sm font-semibold"
                  style={{ backgroundColor: "var(--espresso)", color: "#FAF6F1" }}>
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="text-3xl mb-3">{TASTE_EMOJIS[tasteProfile.drink] ?? "☕"}</div>
              <h2 className="font-display text-2xl font-bold mb-1 leading-tight"
                style={{ color: "#FAF6F1", fontFamily: "var(--font-fraunces)" }}>
                {TASTE_LABELS[tasteProfile.drink]}{" "}
                {tasteProfile.roast === "light" ? "Lover" : tasteProfile.roast === "dark" ? "Devotee" : "Fan"}
              </h2>
              <p className="text-xs italic" style={{ color: "var(--copper-lt)", fontFamily: "var(--font-instrument)" }}>
                {TASTE_LABELS[tasteProfile.roast]} · {TASTE_LABELS[tasteProfile.vibe]}
              </p>
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
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-fraunces)" }}>
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
