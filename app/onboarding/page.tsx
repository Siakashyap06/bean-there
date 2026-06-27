"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBeanStore } from "@/lib/store";
import { QUIZ_QUESTIONS, MANDATORY_COUNT } from "@/lib/quiz-data";
import { computeCoffeeDNA } from "@/lib/dna-engine";
import type { QuizAnswer } from "@/lib/types";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0, transition: { duration: 0.22, ease: "easeIn" as const } }),
};

function MidpointScreen({ onContinue, onSkip }: { onContinue: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-7 text-center"
      style={{ background: "linear-gradient(170deg, #F5EDE2 0%, #FAF6F1 60%, #F0E8DC 100%)" }}>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="text-5xl mb-6">☕</motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="text-overline mb-3"
        style={{ color: "var(--copper)" }}>
        Quick heads up
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        style={{ fontFamily: "var(--font-fraunces)", color: "var(--espresso)", fontSize: "clamp(1.4rem, 5.5vw, 1.9rem)", lineHeight: 1.15, fontWeight: 600, marginBottom: "1rem" }}>
        We already know enough to match cafés for you.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.36 }}
        className="text-sm leading-relaxed mb-10"
        style={{ color: "var(--charcoal-2)", fontFamily: "var(--font-geist)", maxWidth: "20rem" }}>
        A few more questions build your full Coffee DNA — sharper matches, better recommendations. Takes 60 seconds.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        className="w-full flex flex-col gap-3">
        <button onClick={onContinue} className="btn-espresso w-full py-4 text-base rounded-2xl">
          Continue — improve my matches
        </button>
        <button
          onClick={onSkip}
          className="w-full py-3.5 text-sm font-medium"
          style={{ color: "var(--charcoal-3)" }}>
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setDNA, setOnboardingComplete } = useBeanStore();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [showMidpoint, setShowMidpoint] = useState(false);

  const totalOptional = QUIZ_QUESTIONS.length - MANDATORY_COUNT;
  const isMandatoryPhase = step < MANDATORY_COUNT;
  const progress = isMandatoryPhase
    ? ((step + 1) / MANDATORY_COUNT) * 50
    : 50 + (((step - MANDATORY_COUNT) + 1) / totalOptional) * 50;

  const currentQ = QUIZ_QUESTIONS[step];

  const finalize = useCallback((currentAnswers: QuizAnswer[]) => {
    const dna = computeCoffeeDNA(currentAnswers);
    setDNA(dna);
    setOnboardingComplete(true);
    router.push("/results");
  }, [setDNA, setOnboardingComplete, router]);

  const commitAnswer = useCallback(() => {
    if (selected === null) return;
    const newAnswer: QuizAnswer = {
      questionIndex: step,
      answerIndex: selected,
      answerText: currentQ.options[selected].label,
    };
    const newAnswers = [...answers.filter((a) => a.questionIndex !== step), newAnswer];
    setAnswers(newAnswers);
    setSelected(null);
    setDirection(1);

    if (step === MANDATORY_COUNT - 1) { setShowMidpoint(true); return; }
    if (step + 1 >= QUIZ_QUESTIONS.length) { finalize(newAnswers); return; }
    setStep((s) => s + 1);
  }, [selected, step, currentQ, answers, finalize]);

  const handleBack = useCallback(() => {
    if (step === 0) return;
    setDirection(-1);
    setSelected(answers.find((a) => a.questionIndex === step - 1)?.answerIndex ?? null);
    setStep((s) => s - 1);
  }, [step, answers]);

  if (showMidpoint) {
    return (
      <MidpointScreen
        onContinue={() => { setShowMidpoint(false); setStep(MANDATORY_COUNT); }}
        onSkip={() => finalize(answers)}
      />
    );
  }

  const progressLabel = isMandatoryPhase
    ? `${step + 1} / ${MANDATORY_COUNT}`
    : `+${step - MANDATORY_COUNT + 1} / ${totalOptional}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(170deg, #F5EDE2 0%, #FAF6F1 60%, #F0E8DC 100%)", userSelect: "none" }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: "rgba(26,14,9,0.07)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="var(--charcoal-2)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--stone)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--espresso)" }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="text-xs font-medium flex-shrink-0" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)", minWidth: "3.2rem", textAlign: "right" }}>
          {progressLabel}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 px-5 pt-5 pb-4 flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col flex-1">

            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.04, type: "spring", stiffness: 220 }}
              className="text-4xl mb-5 block">
              {currentQ.emoji}
            </motion.span>

            <h1 style={{ fontFamily: "var(--font-fraunces)", color: "var(--espresso)", fontSize: "clamp(1.7rem, 7vw, 2.4rem)", lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
              {currentQ.question}
            </h1>

            {currentQ.subtitle && (
              <p className="text-sm mb-6" style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
                {currentQ.subtitle}
              </p>
            )}

            <div className="flex flex-col gap-2.5 mt-auto">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selected === idx;
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + idx * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setSelected(idx)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: isSelected ? "var(--espresso)" : "#FFFFFF",
                      border: `1.5px solid ${isSelected ? "var(--espresso)" : "var(--stone)"}`,
                      borderRadius: "1.25rem",
                      padding: "0.9rem 1.1rem",
                      transition: "all 0.18s cubic-bezier(0.16,1,0.3,1)",
                      cursor: "pointer",
                    }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl flex-shrink-0 w-8 text-center">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.3, fontFamily: "var(--font-geist)", color: isSelected ? "var(--cream)" : "var(--charcoal)" }}>
                          {opt.label}
                        </p>
                        {opt.desc && (
                          <p style={{ fontSize: "0.75rem", marginTop: "0.2rem", lineHeight: 1.4, fontFamily: "var(--font-geist)", color: isSelected ? "rgba(250,246,241,0.6)" : "var(--charcoal-3)" }}>
                            {opt.desc}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(250,246,241,0.22)" }}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* CTA */}
      <div className="px-5 pb-12 pt-2">
        <motion.button
          onClick={commitAnswer}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            background: "var(--espresso)",
            color: "var(--cream)",
            borderRadius: "1rem",
            padding: "1rem",
            fontWeight: 600,
            fontSize: "0.9375rem",
            opacity: selected !== null ? 1 : 0.3,
            pointerEvents: selected !== null ? "auto" : "none",
            transition: "opacity 0.2s ease",
            fontFamily: "var(--font-geist)",
          }}>
          {step === QUIZ_QUESTIONS.length - 1 ? "Reveal my Coffee DNA →" : "Next →"}
        </motion.button>

        {!isMandatoryPhase && (
          <button
            onClick={() => finalize(answers)}
            className="w-full text-center text-xs py-3 mt-1"
            style={{ color: "var(--charcoal-3)", fontFamily: "var(--font-geist)" }}>
            Done — skip the rest
          </button>
        )}
      </div>
    </div>
  );
}
