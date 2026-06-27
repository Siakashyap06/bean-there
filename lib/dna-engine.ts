import type { QuizAnswer, TasteProfile } from "./types";

export function computeTasteProfile(answers: QuizAnswer[]): TasteProfile {
  const a = (q: number) => answers.find((x) => x.questionIndex === q)?.answerIndex ?? 0;

  const roastMap: TasteProfile["roast"][] = ["light", "medium", "dark"];
  const drinkMap: TasteProfile["drink"][] = ["latte", "cappuccino", "espresso", "cold-brew", "pour-over", "matcha"];
  const milkMap: TasteProfile["milk"][] = ["dairy", "oat", "almond", "soy", "none"];
  const sweetnessMap: TasteProfile["sweetness"][] = ["low", "medium", "sweet"];
  const vibeMap: TasteProfile["vibe"][] = ["study", "work", "social", "date", "quick"];

  return {
    roast: roastMap[a(0)] ?? "medium",
    drink: drinkMap[a(1)] ?? "latte",
    milk: milkMap[a(2)] ?? "dairy",
    sweetness: sweetnessMap[a(3)] ?? "medium",
    vibe: vibeMap[a(4)] ?? "work",
  };
}
