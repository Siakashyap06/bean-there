"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";
import { computeTasteProfile } from "@/lib/dna-engine";
import { useBeanStore } from "@/lib/store";
import type { QuizAnswer } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { setTasteProfile, setOnboardingComplete } = useBeanStore();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);

  const q = QUIZ_QUESTIONS[currentQ];
  const total = QUIZ_QUESTIONS.length;
  const progress = (currentQ / total) * 100;
  const isLast = currentQ === total - 1;

  const finalize = useCallback((finalAnswers: QuizAnswer[]) => {
    const profile = computeTasteProfile(finalAnswers);
    setTasteProfile(profile);
    setOnboardingComplete(true);
    router.push("/results");
  }, [setTasteProfile, setOnboardingComplete, router]);

  const handleSelect = useCallback((optionIndex: number) => {
    setSelected(optionIndex);
    const newAnswers = [
      ...answers.filter((a) => a.questionIndex !== currentQ),
      { questionIndex: currentQ, answerIndex: optionIndex, answerText: q.options[optionIndex] },
    ];
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelected(null);
      if (isLast) {
        finalize(newAnswers);
      } else {
        setDirection(1);
        setCurrentQ((n) => n + 1);
      }
    }, 280);
  }, [answers, currentQ, q, isLast, finalize]);

  const prevAnswer = answers.find((a) => a.questionIndex === currentQ);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>

      {/* Header */}
      <div className="surface-espresso pt-14 pb-5 px-5">
        <div className="h-0.5 rounded-full overflow-hidden mb-5"
          style={{ backgroundColor: "rgba(250,246,241,0.12)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--copper)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between">
          {currentQ > 0 ? (
            <button
              onClick={() => { setDirection(-1); setCurrentQ((n) => n - 1); setSelected(null); }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(250,246,241,0.1)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#FAF6F1" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          ) : <div className="w-9" />}

          <span className="text-sm font-semibold" style={{ color: "rgba(250,246,241,0.5)" }}>
            {currentQ + 1}
            <span style={{ color: "rgba(250,246,241,0.25)" }}> / {total}</span>
          </span>

          <button onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(250,246,241,0.1)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#FAF6F1" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-5 pt-6 pb-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ}
            custom={direction}
            initial={{ opacity: 0, x: direction * 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -36 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-4xl block mb-4"
            >
              {q.emoji}
            </motion.span>

            <h2 className="text-editorial mb-8 leading-tight" style={{ color: "var(--charcoal)" }}>
              {q.question}
            </h2>

            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, i) => {
                const isSelected = selected === i || prevAnswer?.answerIndex === i;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.055, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => handleSelect(i)}
                    className="w-full text-left rounded-2xl px-5 py-4 transition-all duration-200"
                    style={{
                      backgroundColor: isSelected ? "var(--espresso)" : "#FFFFFF",
                      border: `1.5px solid ${isSelected ? "var(--espresso)" : "var(--stone)"}`,
                      color: isSelected ? "var(--cream)" : "var(--charcoal)",
                      boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-xs)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[15px] font-medium leading-snug flex-1">{opt}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: "var(--copper)" }}
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
