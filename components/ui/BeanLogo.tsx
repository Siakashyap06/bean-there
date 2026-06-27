"use client";

interface BeanLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  dark?: boolean;
}

const sizes = {
  sm: { container: "w-8 h-8", text: "text-xs", dot: "w-1.5 h-1.5" },
  md: { container: "w-12 h-12", text: "text-sm", dot: "w-2 h-2" },
  lg: { container: "w-20 h-20", text: "text-xl", dot: "w-3 h-3" },
  xl: { container: "w-28 h-28", text: "text-3xl", dot: "w-4 h-4" },
};

export default function BeanLogo({ size = "md", className = "", dark = false }: BeanLogoProps) {
  const s = sizes[size];
  const color = dark ? "#FAF6F1" : "#2C1810";
  const accentColor = dark ? "#C4845C" : "#C4845C";

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Logo mark — stylised coffee bean as abstract letterform */}
      <div className={`${s.container} relative flex items-center justify-center`}>
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
          {/* Bean shape */}
          <ellipse cx="40" cy="40" rx="28" ry="22" fill={color} />
          {/* Bean crease */}
          <path
            d="M18 35 Q40 28 62 35 Q40 52 18 45 Q30 40 40 40 Q50 40 62 35"
            fill={color === "#FAF6F1" ? "#2C1810" : "#FAF6F1"}
            opacity="0.15"
          />
          <path
            d="M24 40 Q40 34 56 40"
            stroke={color === "#FAF6F1" ? "#2C1810" : "#FAF6F1"}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Accent dot */}
          <circle cx="56" cy="32" r="5" fill={accentColor} />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col items-center">
        <span
          className={`font-display font-semibold tracking-tight leading-none ${s.text}`}
          style={{ color, fontFamily: "var(--font-playfair)" }}
        >
          Bean There
        </span>
      </div>
    </div>
  );
}
