"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBeanStore } from "@/lib/store";
import BeanLogo from "@/components/ui/BeanLogo";

export default function SplashPage() {
  const router = useRouter();
  const { hasCompletedOnboarding } = useBeanStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBegin = () => {
    if (hasCompletedOnboarding) {
      router.push("/home");
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-16 px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1A0E09 0%, #2C1810 60%, #1A0E09 100%)" }}
    >
      {/* Grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }} />

      {/* Ambient copper glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(196,132,92,0.08), transparent)" }} />

      <div />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(250,246,241,0.07)", border: "1px solid rgba(250,246,241,0.12)" }}>
            <BeanLogo size="lg" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="text-hero mb-3"
          style={{ color: "#FAF6F1" }}
        >
          Bean<br />There
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg"
          style={{ color: "var(--copper-lt)", fontFamily: "var(--font-instrument)", fontStyle: "italic" }}
        >
          Find your perfect cup.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
        transition={{ delay: 0.75, duration: 0.6 }}
        className="w-full flex flex-col gap-3"
      >
        <button
          onClick={handleBegin}
          className="btn-copper w-full py-4 rounded-2xl text-base font-semibold"
        >
          {hasCompletedOnboarding ? "Continue exploring" : "Begin your journey"}
        </button>

        {!hasCompletedOnboarding && (
          <button
            onClick={() => router.push("/home")}
            className="w-full py-4 rounded-2xl text-sm font-medium"
            style={{
              backgroundColor: "rgba(250,246,241,0.06)",
              color: "rgba(250,246,241,0.5)",
              border: "1px solid rgba(250,246,241,0.1)",
            }}
          >
            Skip for now
          </button>
        )}

        <p className="text-center text-[10px] tracking-[0.2em] uppercase mt-2"
          style={{ color: "rgba(250,246,241,0.2)" }}>
          Coffee, curated for you
        </p>
      </motion.div>
    </div>
  );
}
