"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  {
    href: "/home",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"
          stroke={active ? "var(--espresso)" : "var(--charcoal-3)"}
          strokeWidth={active ? "2" : "1.5"}
          fill={active ? "rgba(44,24,16,0.08)" : "none"} />
        <path d="M9 22V13h6v9"
          stroke={active ? "var(--copper)" : "var(--charcoal-3)"}
          strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/discover",
    label: "Discover",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7.5"
          stroke={active ? "var(--espresso)" : "var(--charcoal-3)"}
          strokeWidth={active ? "2" : "1.5"} />
        <path d="M16.5 16.5L21 21"
          stroke={active ? "var(--copper)" : "var(--charcoal-3)"}
          strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
        <circle cx="11" cy="11" r="2.5"
          fill={active ? "var(--copper)" : "transparent"} />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "Journal",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="3"
          stroke={active ? "var(--espresso)" : "var(--charcoal-3)"}
          strokeWidth={active ? "2" : "1.5"}
          fill={active ? "rgba(44,24,16,0.07)" : "none"} />
        <path d="M8 8h8M8 12h5"
          stroke={active ? "var(--copper)" : "var(--charcoal-3)"}
          strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17" cy="17" r="4"
          fill={active ? "var(--copper)" : "var(--stone-dark)"}
          stroke="white" strokeWidth="1.5" />
        <path d="M17 15v2l1 1"
          stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5"
          stroke={active ? "var(--espresso)" : "var(--charcoal-3)"}
          strokeWidth={active ? "2" : "1.5"}
          fill={active ? "rgba(44,24,16,0.07)" : "none"} />
        <path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7"
          stroke={active ? "var(--espresso)" : "var(--charcoal-3)"}
          strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div
        className="glass-cream mx-3 mb-3 rounded-2xl"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-around px-2 pt-3 pb-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href === "/home" && pathname === "/") || (item.href === "/journal" && pathname === "/passport");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-4 py-1 relative rounded-xl"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "rgba(44,24,16,0.07)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{item.icon(active)}</span>
                <span
                  className="relative z-10 text-[10px] font-semibold tracking-wide"
                  style={{ color: active ? "var(--espresso)" : "var(--charcoal-3)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
