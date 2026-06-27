"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useBeanStore } from "@/lib/store";
import { fetchCurated } from "@/lib/places-client";
import type { Cafe, CoffeeMemory } from "@/lib/types";
import BottomNav from "@/components/layout/BottomNav";

type Tab = "been" | "want";

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s)} className="p-0.5">
          <svg width="22" height="22" viewBox="0 0 12 12"
            fill={s <= value ? "var(--copper)" : "var(--stone-dark)"}>
            <path d="M6 1l1.3 3.9H11L8.3 7.1l1 3.8L6 9 2.7 10.9l1-3.8L1 4.9h3.7z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function NoPhotoThumb() {
  return (
    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "var(--cream-deep)" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--stone-dark)" strokeWidth="1.5" />
        <circle cx="8.5" cy="10.5" r="1.5" stroke="var(--stone-dark)" strokeWidth="1.2" />
        <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="var(--stone-dark)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function JournalPage() {
  const { stamps, memories, addMemory, wantToTryIds, toggleWantToTry, collections } = useBeanStore();
  const [tab, setTab] = useState<Tab>("been");
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const [form, setForm] = useState({ drink: "", rating: 5, note: "" });

  const wantToTryFromCollections = collections.find((c) => c.id === "want-to-try")?.cafeIds ?? [];
  const combined = [...wantToTryIds, ...wantToTryFromCollections];
  const allWantIds = combined.filter((id, idx) => combined.indexOf(id) === idx);

  useEffect(() => {
    fetchCurated().then(({ cafes }) => setAllCafes(cafes));
  }, []);

  const visitedCafes = allCafes.filter((c) =>
    stamps.some((s) => s.cafeId === c.id) || c.visitedByMe
  );
  const wantCafes = allCafes.filter((c) =>
    allWantIds.includes(c.id) || (!c.visitedByMe && !stamps.some((s) => s.cafeId === c.id) && c.isCurated)
  ).filter((c) => !visitedCafes.some((v) => v.id === c.id));

  const getMemory = (cafeId: string) => memories.find((m) => m.cafeId === cafeId);

  const saveEntry = useCallback(() => {
    if (!editingCafe || !form.drink) return;
    addMemory({
      id: `mem-${Date.now()}`,
      cafeId: editingCafe.id,
      cafeName: editingCafe.name,
      cafeArea: editingCafe.cityArea ?? editingCafe.address.split(",")[0],
      drinkOrdered: form.drink,
      rating: form.rating,
      note: form.note,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    } as CoffeeMemory);
    setEditingCafe(null);
    setForm({ drink: "", rating: 5, note: "" });
  }, [editingCafe, form, addMemory]);

  const openEdit = (cafe: Cafe) => {
    const existing = getMemory(cafe.id);
    setForm({
      drink: existing?.drinkOrdered ?? "",
      rating: existing?.rating ?? 5,
      note: existing?.note ?? "",
    });
    setEditingCafe(cafe);
  };

  const displayList = tab === "been" ? visitedCafes : wantCafes;

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--cream)" }}>

      {/* Header */}
      <div className="surface-espresso pt-14 pb-6 px-5">
        <h1 className="text-display mb-1" style={{ color: "#FAF6F1" }}>Places I've Bean</h1>
        <p className="text-sm" style={{ color: "rgba(250,246,241,0.55)", fontFamily: "var(--font-playfair)", fontStyle: "italic" }}>
          Your personal coffee journal
        </p>

        {/* Stats row */}
        <div className="flex gap-4 mt-4">
          {[
            { label: "Stamped", value: visitedCafes.length },
            { label: "Want to Try", value: wantCafes.length },
            { label: "Notes", value: memories.length },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center px-3 py-2 rounded-xl"
              style={{ backgroundColor: "rgba(250,246,241,0.08)" }}>
              <span className="text-xl font-bold" style={{ color: "#FAF6F1", fontFamily: "var(--font-playfair)" }}>{s.value}</span>
              <span className="text-[10px] font-medium" style={{ color: "rgba(250,246,241,0.45)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4 pb-2 flex gap-2">
        {(["been", "want"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              backgroundColor: tab === t ? "var(--espresso)" : "#fff",
              color: tab === t ? "#FAF6F1" : "var(--charcoal-2)",
              boxShadow: "var(--shadow-xs)",
            }}>
            {t === "been" ? `✓ Been There (${visitedCafes.length})` : `○ Want to Try (${wantCafes.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-5 pt-2 flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {displayList.map((cafe, i) => {
            const memory = getMemory(cafe.id);
            const isWanted = allWantIds.includes(cafe.id);
            return (
              <motion.div key={cafe.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-sm)" }}>

                {/* Top row */}
                <div className="flex items-center gap-3 p-3">
                  {cafe.photoUrls[0] ? (
                    <img src={cafe.photoUrls[0]} alt={cafe.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : <NoPhotoThumb />}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link href={`/cafe/${cafe.id}`}>
                        <p className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>{cafe.name}</p>
                      </Link>
                      {tab === "been" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: "rgba(139,139,107,0.15)", color: "var(--olive)" }}>
                          BEEN
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "var(--charcoal-3)" }}>
                      {cafe.cityArea ?? cafe.address.split(",")[0]}
                    </p>
                    {memory && (
                      <p className="text-xs mt-0.5 font-medium truncate" style={{ color: "var(--copper)" }}>
                        ☕ {memory.drinkOrdered}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {tab === "been" ? (
                      <button onClick={() => openEdit(cafe)}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-xl"
                        style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal-2)" }}>
                        {memory ? "Edit note" : "+ Add note"}
                      </button>
                    ) : (
                      <button onClick={() => toggleWantToTry(cafe.id)}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all"
                        style={{
                          backgroundColor: isWanted ? "rgba(196,132,92,0.12)" : "var(--cream-deep)",
                          color: isWanted ? "var(--copper)" : "var(--charcoal-2)",
                        }}>
                        {isWanted ? "✓ Saved" : "Save"}
                      </button>
                    )}
                    {cafe.googleMapsUri && (
                      <a href={cafe.googleMapsUri} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-medium" style={{ color: "var(--charcoal-3)" }}>
                        Directions ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Memory note (if exists) */}
                {memory && (
                  <div className="mx-3 mb-3 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "var(--cream-deep)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} width="10" height="10" viewBox="0 0 12 12"
                            fill={s <= memory.rating ? "var(--copper)" : "var(--stone-dark)"}>
                            <path d="M6 1l1.3 3.9H11L8.3 7.1l1 3.8L6 9 2.7 10.9l1-3.8L1 4.9h3.7z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--charcoal-3)" }}>{memory.date}</span>
                    </div>
                    {memory.note && (
                      <p className="text-xs leading-relaxed" style={{ color: "var(--charcoal-2)" }}>
                        "{memory.note}"
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {displayList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">{tab === "been" ? "☕" : "🗺️"}</p>
            <p className="font-semibold text-sm" style={{ color: "var(--charcoal-2)" }}>
              {tab === "been" ? "No visits logged yet" : "Nothing saved yet"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--charcoal-3)" }}>
              {tab === "been"
                ? "Visit a café and stamp your passport"
                : "Explore cafés and save ones you want to visit"}
            </p>
            <Link href="/discover">
              <button className="btn-copper mt-4 px-6 py-2.5 rounded-full text-sm">
                Discover Cafés
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingCafe && (
          <motion.div className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditingCafe(null)} />
            <motion.div
              className="relative w-full max-w-[430px] mx-auto rounded-t-3xl p-6"
              style={{ backgroundColor: "#fff" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5"
                style={{ backgroundColor: "var(--stone)" }} />
              <h3 className="font-semibold text-base mb-1" style={{ color: "var(--charcoal)" }}>
                {editingCafe.name}
              </h3>
              <p className="text-xs mb-5" style={{ color: "var(--charcoal-3)" }}>
                {editingCafe.cityArea ?? editingCafe.address.split(",")[0]}
              </p>

              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal-2)" }}>
                What did you order? *
              </label>
              <input
                className="w-full rounded-xl px-4 py-3 text-sm mb-4"
                style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal)", border: "1.5px solid var(--stone)" }}
                placeholder="e.g. Oat milk latte, matcha, cold brew…"
                value={form.drink}
                onChange={(e) => setForm((f) => ({ ...f, drink: e.target.value }))}
              />

              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--charcoal-2)" }}>
                Your rating
              </label>
              <div className="mb-4">
                <StarPicker value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} />
              </div>

              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal-2)" }}>
                Notes (optional)
              </label>
              <textarea
                className="w-full rounded-xl px-4 py-3 text-sm mb-5 resize-none"
                rows={3}
                style={{ backgroundColor: "var(--cream-deep)", color: "var(--charcoal)", border: "1.5px solid var(--stone)" }}
                placeholder="What made this visit special?"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />

              <button
                onClick={saveEntry}
                disabled={!form.drink}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: form.drink ? "var(--espresso)" : "var(--stone)",
                  color: form.drink ? "#FAF6F1" : "var(--charcoal-3)",
                }}>
                Save to journal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
