"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
// Legacy constellation component — superseded by CoffeeConstellation.tsx

interface ConstellationData {
  sweetness?: number;
  adventure?: number;
  atmosphere?: number;
  socialness?: number;
  caffeineDependency?: number;
  routine?: number;
}

interface Props {
  data: ConstellationData;
  size?: number;
  animate?: boolean;
}

const AXES = [
  { key: "sweetness" as const, label: "Sweet", color: "#C4845C" },
  { key: "adventure" as const, label: "Adventurous", color: "#B8906A" },
  { key: "atmosphere" as const, label: "Atmosphere", color: "#8B8B6B" },
  { key: "socialness" as const, label: "Social", color: "#C4845C" },
  { key: "caffeineDependency" as const, label: "Caffeine", color: "#2C1810" },
  { key: "routine" as const, label: "Routine", color: "#8B8B6B" },
];

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

export default function TasteConstellation({ data, size = 240, animate = true }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const [revealed, setRevealed] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setRevealed(true), 600);
      return () => clearTimeout(t);
    }
  }, [animate]);

  const points = AXES.map((axis, i) => {
    const r = (data[axis.key] ?? 0) * maxR;
    return polarToCartesian(cx, cy, r, i, AXES.length);
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const polyPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {gridLevels.map((level, li) => {
          const gridPoints = AXES.map((_, i) => polarToCartesian(cx, cy, level * maxR, i, AXES.length));
          const gridPath = gridPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
          return (
            <path
              key={li}
              d={gridPath}
              fill="none"
              stroke="#E8E0D5"
              strokeWidth="1"
              opacity={0.6}
            />
          );
        })}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const end = polarToCartesian(cx, cy, maxR, i, AXES.length);
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={end.x} y2={end.y}
              stroke="#E8E0D5"
              strokeWidth="1"
              opacity={0.6}
            />
          );
        })}

        {/* Filled constellation */}
        {revealed && (
          <motion.path
            d={polyPath}
            fill="rgba(196,132,92,0.15)"
            stroke="#C4845C"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        )}

        {/* Constellation dots */}
        {revealed && points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={AXES[i].color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
          />
        ))}

        {/* Center point */}
        <circle cx={cx} cy={cy} r={3} fill="#2C1810" opacity={0.3} />

        {/* Labels */}
        {AXES.map((axis, i) => {
          const labelPt = polarToCartesian(cx, cy, maxR + 18, i, AXES.length);
          return (
            <text
              key={i}
              x={labelPt.x}
              y={labelPt.y + 4}
              textAnchor="middle"
              fontSize="9"
              fontFamily="var(--font-inter)"
              fontWeight="500"
              fill="#8B8B6B"
              letterSpacing="0.5"
            >
              {axis.label.toUpperCase()}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
