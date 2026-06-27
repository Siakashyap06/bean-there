"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import type { Cafe } from "@/lib/types";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";

function MapPin({ cafe, active, onClick }: { cafe: Cafe; active: boolean; onClick: () => void }) {
  const left = Math.min(88, Math.max(4, ((cafe.lng - 76.9) / 0.5) * 100));
  const top  = Math.min(88, Math.max(4, ((28.63 - cafe.lat) / 0.28) * 100));

  return (
    <button onClick={onClick}
      className="absolute transform -translate-x-1/2 -translate-y-full"
      style={{ left: `${left}%`, top: `${top}%`, zIndex: active ? 20 : 10 }}>
      <motion.div animate={{ scale: active ? 1.15 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}>
        <div className="px-2.5 py-1.5 rounded-full flex items-center gap-1.5"
          style={{
            backgroundColor: active ? "var(--espresso)" : "rgba(250,246,241,0.95)",
            color: active ? "#FAF6F1" : "var(--espresso)",
            border: `2px solid ${active ? "var(--copper)" : "rgba(232,224,213,0.8)"}`,
            boxShadow: active ? "var(--shadow-lg)" : "var(--shadow-sm)",
            backdropFilter: "blur(8px)",
          }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "var(--copper)" }} />
          <span className="text-[11px] font-bold">{cafe.matchScore}%</span>
        </div>
        {/* Pin tail */}
        <div className="w-0 h-0 mx-auto" style={{
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `7px solid ${active ? "var(--espresso)" : "rgba(250,246,241,0.95)"}`,
          marginTop: -1,
        }} />
      </motion.div>
    </button>
  );
}

export default function MapPage() {
  const { nearbyPlaces } = useBeanStore();
  const cafes = nearbyPlaces;
  const [selected, setSelected] = useState<Cafe | null>(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>

      {/* Search bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-14 pb-3 max-w-[430px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl glass-cream"
            style={{ boxShadow: "var(--shadow-sm)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="var(--charcoal-3)" strokeWidth="1.5" />
              <path d="M16.5 16.5L21 21" stroke="var(--charcoal-3)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm" style={{ color: "var(--charcoal-3)" }}>
              Search cafés near you…
            </span>
          </div>
          <button className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--espresso)", boxShadow: "var(--shadow-sm)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M7 12h10M10 18h4" stroke="#FAF6F1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Map canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map background */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(rgba(232,224,213,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,224,213,0.4) 1px, transparent 1px),
            linear-gradient(rgba(232,224,213,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,224,213,0.15) 1px, transparent 1px),
            #EDE8DF
          `,
          backgroundSize: "100px 100px, 100px 100px, 25px 25px, 25px 25px",
        }} />

        {/* Roads SVG */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          <path d="M0,38% L100%,34%" stroke="var(--clay)" strokeWidth="3.5" fill="none" />
          <path d="M0,64% L100%,68%" stroke="var(--clay)" strokeWidth="2.5" fill="none" />
          <path d="M33%,0 L36%,100%" stroke="var(--clay)" strokeWidth="3.5" fill="none" />
          <path d="M64%,0 L61%,100%" stroke="var(--clay)" strokeWidth="2.5" fill="none" />
          <path d="M0,18% Q22%,28% 50%,16% T100%,20%" stroke="var(--stone-dark)" strokeWidth="1.5" fill="none" />
          <path d="M0,80% Q28%,73% 58%,80% T100%,76%" stroke="var(--stone-dark)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Green patches */}
        <div className="absolute rounded-2xl" style={{ left: "10%", top: "18%", width: "9%", height: "11%", backgroundColor: "rgba(139,139,107,0.18)" }} />
        <div className="absolute rounded-2xl" style={{ left: "68%", top: "52%", width: "7%", height: "9%", backgroundColor: "rgba(139,139,107,0.18)" }} />

        {/* Pins */}
        <div className="absolute inset-0" style={{ top: "7rem" }}>
          {cafes.map((cafe) => (
            <MapPin key={cafe.id} cafe={cafe}
              active={selected?.id === cafe.id}
              onClick={() => setSelected(selected?.id === cafe.id ? null : cafe)} />
          ))}
          {/* User dot */}
          <div className="absolute" style={{ left: "49%", top: "44%", transform: "translate(-50%, -50%)" }}>
            <div className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: "#4A9EFF", boxShadow: "0 0 12px rgba(74,158,255,0.5)" }} />
            <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
              style={{ backgroundColor: "rgba(74,158,255,0.3)" }} />
          </div>
        </div>

        {/* Bottom panel */}
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="rounded-3xl overflow-hidden"
                style={{ backgroundColor: "#fff", boxShadow: "var(--shadow-xl)" }}>
                <div className="relative h-40 overflow-hidden">
                  {selected.photoUrls[0] ? (
                    <img src={selected.photoUrls[0]} alt={selected.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--cream-deep)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--stone-dark)" strokeWidth="1.5" /><circle cx="8.5" cy="10.5" r="1.5" stroke="var(--stone-dark)" strokeWidth="1.2" /><path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="var(--stone-dark)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(26,14,9,0.65) 0%, transparent 55%)" }} />
                  <div className="absolute bottom-3 left-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ backgroundColor: "var(--copper)", color: "#fff" }}>
                      {selected.matchScore}% match
                    </span>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(250,246,241,0.9)" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="var(--espresso)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-base mb-1"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-playfair)" }}>
                    {selected.name}
                  </h3>
                  <p className="text-xs mb-4" style={{ color: "var(--charcoal-3)" }}>
                    {selected.address.split(",").slice(0, 2).join(",")}
                  </p>
                  <div className="flex gap-3">
                    <Link href={`/cafe/${selected.id}`} className="flex-1">
                      <button className="btn-espresso w-full py-2.5 rounded-xl text-sm">
                        View Details
                      </button>
                    </Link>
                    <a href={selected.googleMapsUri || `https://maps.google.com/?q=${encodeURIComponent(selected.address)}`}
                      target="_blank" rel="noopener noreferrer" className="flex-1">
                      <button className="w-full py-2.5 rounded-xl text-sm font-medium border"
                        style={{ borderColor: "var(--stone)", color: "var(--espresso)" }}>
                        Directions
                      </button>
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl p-4"
                style={{ backgroundColor: "rgba(250,246,241,0.95)", backdropFilter: "blur(20px)", boxShadow: "var(--shadow-md)" }}>
                <p className="text-xs font-semibold mb-3"
                  style={{ color: "var(--charcoal-3)", letterSpacing: "0.05em" }}>
                  {cafes.length} matches near you
                </p>
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                  {cafes.map((c) => ( // ALL cafés shown in scroll strip — no cap
                    <button key={c.id} onClick={() => setSelected(c)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "#fff", border: "1px solid var(--stone)", boxShadow: "var(--shadow-xs)" }}>
                      {c.photoUrls[0] ? (
                        <img src={c.photoUrls[0]} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          alt={c.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "var(--cream-deep)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--stone-dark)" strokeWidth="1.5" /></svg>
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-[11px] font-semibold line-clamp-1 max-w-[72px]"
                          style={{ color: "var(--charcoal)" }}>{c.name}</p>
                        <p className="text-[10px] font-bold" style={{ color: "var(--copper)" }}>
                          {c.matchScore}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
