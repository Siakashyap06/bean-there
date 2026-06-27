"use client";
import { motion } from "framer-motion";
import type { ConstellationStar } from "@/lib/types";

// Lines connecting logically related stars
const CONSTELLATION_LINES: [string, string][] = [
  ["roast",     "specialty"],
  ["specialty", "explorer"],
  ["specialty", "matcha"],
  ["work",      "study"],
  ["study",     "cozy"],
  ["cozy",      "hidden"],
  ["hidden",    "date"],
  ["date",      "explorer"],
  ["work",      "roast"],
];

interface Props {
  stars: ConstellationStar[];
  width?: number;
  height?: number;
  animate?: boolean;
}

export default function CoffeeConstellation({ stars, width = 320, height = 320, animate = true }: Props) {
  const starMap = Object.fromEntries(stars.map((s) => [s.id, s]));

  // Scale canvas positions from 300×300 design to actual width/height
  const sx = (x: number) => (x / 300) * width;
  const sy = (y: number) => (y / 300) * height;

  return (
    <div style={{ width, height, position: "relative" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ overflow: "visible" }}>

        {/* Background glow — subtle radial */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(196,132,92,0.08)" />
            <stop offset="100%" stopColor="rgba(26,14,9,0)" />
          </radialGradient>
          <filter id="starGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="labelGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <ellipse cx={width / 2} cy={height / 2} rx={width * 0.45} ry={height * 0.45} fill="url(#bgGlow)" />

        {/* Constellation lines */}
        {CONSTELLATION_LINES.map(([fromId, toId], i) => {
          const from = starMap[fromId];
          const to   = starMap[toId];
          if (!from || !to) return null;
          const opacity = Math.min(from.value, to.value) * 0.35;
          return (
            <motion.line
              key={i}
              x1={sx(from.x)}
              y1={sy(from.y)}
              x2={sx(to.x)}
              y2={sy(to.y)}
              stroke="rgba(212,168,83,0.5)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeDasharray="600"
              initial={{ strokeDashoffset: 600, opacity: 0 }}
              animate={animate ? { strokeDashoffset: 0, opacity } : { strokeDashoffset: 0, opacity }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 + i * 0.08 }}
            />
          );
        })}

        {/* Stars */}
        {stars.map((star, i) => {
          const minR = 4;
          const maxR = 16;
          const r = minR + star.value * (maxR - minR);
          const glowR = r * 2.4;
          const coreOpacity = 0.5 + star.value * 0.5;

          return (
            <g key={star.id}>
              {/* Glow halo */}
              <motion.circle
                cx={sx(star.x)}
                cy={sy(star.y)}
                r={glowR}
                fill="rgba(212,168,83,0.12)"
                initial={{ scale: 0, opacity: 0 }}
                animate={animate ? { scale: 1, opacity: star.value * 0.8 } : { scale: 1, opacity: star.value * 0.8 }}
                transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 + i * 0.1 }}
                style={{ transformOrigin: `${sx(star.x)}px ${sy(star.y)}px` }}
              />

              {/* Star body */}
              <motion.circle
                cx={sx(star.x)}
                cy={sy(star.y)}
                r={r}
                fill={star.value > 0.6 ? "#D4A853" : star.value > 0.3 ? "#C4845C" : "rgba(196,132,92,0.5)"}
                opacity={coreOpacity}
                filter="url(#starGlow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={animate ? { scale: 1, opacity: coreOpacity } : { scale: 1, opacity: coreOpacity }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.25 + i * 0.1 }}
                style={{ transformOrigin: `${sx(star.x)}px ${sy(star.y)}px` }}
              />

              {/* Emoji label */}
              <motion.text
                x={sx(star.x)}
                y={sy(star.y) - r - 6}
                textAnchor="middle"
                fontSize="13"
                initial={{ opacity: 0 }}
                animate={animate ? { opacity: 1 } : { opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}>
                {star.emoji}
              </motion.text>

              {/* Text label */}
              {star.value > 0.4 && (
                <motion.text
                  x={sx(star.x)}
                  y={sy(star.y) + r + 14}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="600"
                  letterSpacing="0.06em"
                  fill="rgba(212,168,83,0.75)"
                  fontFamily="var(--font-geist)"
                  initial={{ opacity: 0 }}
                  animate={animate ? { opacity: 1 } : { opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 + i * 0.08 }}>
                  {star.label.toUpperCase()}
                </motion.text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
