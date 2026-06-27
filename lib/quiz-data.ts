export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  emoji: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 0,
    question: "What roast do you prefer?",
    options: [
      "Light — bright, fruity, complex",
      "Medium — smooth, balanced, familiar",
      "Dark — bold, rich, intense",
    ],
    emoji: "☀️",
  },
  {
    id: 1,
    question: "What's your go-to order?",
    options: [
      "Latte",
      "Cappuccino",
      "Espresso",
      "Cold Brew",
      "Pour Over",
      "Matcha",
    ],
    emoji: "☕",
  },
  {
    id: 2,
    question: "Which milk do you prefer?",
    options: [
      "Dairy",
      "Oat milk",
      "Almond milk",
      "Soy milk",
      "None — black",
    ],
    emoji: "🥛",
  },
  {
    id: 3,
    question: "How sweet do you like your coffee?",
    options: [
      "Low — unsweetened",
      "Medium — a little",
      "Sweet",
    ],
    emoji: "🍯",
  },
  {
    id: 4,
    question: "What's your coffee vibe?",
    options: [
      "Study — focused, quiet",
      "Work — laptop friendly",
      "Social — catching up",
      "Date — cozy & aesthetic",
      "Quick Coffee — grab and go",
    ],
    emoji: "✨",
  },
];
