import type { QuizAnswer, CoffeeDNA, ConstellationStar, TasteProfile } from "./types";

// Default attribute values — used for skipped questions
const DEFAULTS: Omit<CoffeeDNA, keyof TasteProfile | "constellation"> = {
  matchaInterest:      3,
  specialtyInterest:   5,
  espressoConfidence:  3,
  adventureLevel:      5,
  budgetLevel:         5,
  ambienceStyle:       5,
  noiseTolerance:      5,
  workFromCafe:        5,
  studyAtCafe:         4,
  dateAtCafe:          4,
  morningPerson:       6,
  outdoorSeating:      4,
  chainPreference:     5,
  dessertInterest:     5,
  travelWillingness:   5,
  visitFrequency:      5,
};

function clamp(v: number): number {
  return Math.max(0, Math.min(10, v));
}

// Constellation star layout — irregular, constellation-like
const STAR_POSITIONS: Omit<ConstellationStar, "value">[] = [
  { id: "roast",       label: "Roast",       emoji: "☕", x: 150, y: 42  },
  { id: "work",        label: "Work",         emoji: "💻", x: 58,  y: 88  },
  { id: "matcha",      label: "Matcha",       emoji: "🌱", x: 268, y: 74  },
  { id: "study",       label: "Study",        emoji: "📚", x: 34,  y: 178 },
  { id: "specialty",   label: "Specialty",    emoji: "✨", x: 162, y: 168 },
  { id: "explorer",    label: "Explorer",     emoji: "🌍", x: 286, y: 162 },
  { id: "cozy",        label: "Cozy",         emoji: "❤️", x: 56,  y: 262 },
  { id: "date",        label: "Date Spots",   emoji: "🌇", x: 274, y: 252 },
  { id: "hidden",      label: "Hidden Gems",  emoji: "🏡", x: 158, y: 290 },
];

function buildConstellation(dna: Omit<CoffeeDNA, "constellation">): ConstellationStar[] {
  const roastValue =
    dna.roast === "dark" ? 0.9 :
    dna.roast === "medium" ? 0.6 : 0.3;
  const roastScore = (roastValue * 0.5 + (dna.espressoConfidence / 10) * 0.5);

  const hiddenGemsScore = ((10 - dna.chainPreference) / 10) * 0.6 + (dna.adventureLevel / 10) * 0.4;

  const values: Record<string, number> = {
    roast:     roastScore,
    work:      dna.workFromCafe     / 10,
    matcha:    dna.matchaInterest   / 10,
    study:     dna.studyAtCafe      / 10,
    specialty: dna.specialtyInterest / 10,
    explorer:  dna.adventureLevel   / 10,
    cozy:      (10 - dna.ambienceStyle) / 10,
    date:      dna.dateAtCafe       / 10,
    hidden:    hiddenGemsScore,
  };

  return STAR_POSITIONS.map((pos) => ({
    ...pos,
    value: Math.max(0.05, Math.min(1, values[pos.id] ?? 0.5)),
  }));
}

export function computeCoffeeDNA(answers: QuizAnswer[]): CoffeeDNA {
  const a = (q: number) => answers.find((x) => x.questionIndex === q)?.answerIndex ?? -1;

  // ── Q0: Drink ──────────────────────────────────────────────────────────────
  const drinkMap: CoffeeDNA["drink"][] = [
    "espresso", "latte", "cappuccino", "cold-brew", "pour-over", "matcha"
  ];
  const drinkIdx = a(0);
  const drink: CoffeeDNA["drink"] = drinkMap[drinkIdx] ?? "latte";

  let specialtyInterest = DEFAULTS.specialtyInterest;
  let matchaInterest    = DEFAULTS.matchaInterest;
  let espressoConfidence = DEFAULTS.espressoConfidence;

  if (drinkIdx === 0) { espressoConfidence = clamp(espressoConfidence + 3); specialtyInterest = clamp(specialtyInterest + 1); }
  if (drinkIdx === 4) { specialtyInterest = clamp(specialtyInterest + 3); }
  if (drinkIdx === 5) { matchaInterest = clamp(matchaInterest + 5); }

  // ── Q1: Roast ──────────────────────────────────────────────────────────────
  const roastMap: CoffeeDNA["roast"][] = ["light", "medium", "dark", "medium"];
  const roastIdx = a(1);
  const roast: CoffeeDNA["roast"] = roastMap[roastIdx] ?? "medium";
  if (roastIdx === 0) specialtyInterest = clamp(specialtyInterest + 2);
  if (roastIdx === 3) { /* no pref */ }

  // ── Q2: Milk ───────────────────────────────────────────────────────────────
  const milkMap: CoffeeDNA["milk"][] = ["dairy", "oat", "almond", "soy", "none"];
  const milk: CoffeeDNA["milk"] = milkMap[a(2)] ?? "dairy";
  if (a(2) === 4) espressoConfidence = clamp(espressoConfidence + 2);

  // ── Q3: Sweetness ──────────────────────────────────────────────────────────
  const sweetnessMap: CoffeeDNA["sweetness"][] = ["low", "low", "medium", "sweet"];
  const sweetness: CoffeeDNA["sweetness"] = sweetnessMap[a(3)] ?? "medium";

  // ── Q4: Vibe ───────────────────────────────────────────────────────────────
  const vibeMap: CoffeeDNA["vibe"][] = ["work", "study", "social", "date", "quick", "quick"];
  const vibeIdx = a(4);
  const vibe: CoffeeDNA["vibe"] = vibeMap[vibeIdx] ?? "social";

  let workFromCafe = DEFAULTS.workFromCafe;
  let studyAtCafe  = DEFAULTS.studyAtCafe;
  let dateAtCafe   = DEFAULTS.dateAtCafe;
  let morningPerson = DEFAULTS.morningPerson;

  if (vibeIdx === 0) workFromCafe  = clamp(workFromCafe + 4);
  if (vibeIdx === 1) studyAtCafe   = clamp(studyAtCafe + 4);
  if (vibeIdx === 3) dateAtCafe    = clamp(dateAtCafe + 4);
  if (vibeIdx === 4) morningPerson = clamp(morningPerson + 3);

  // ── Optional questions ────────────────────────────────────────────────────
  let adventureLevel   = DEFAULTS.adventureLevel;
  let budgetLevel      = DEFAULTS.budgetLevel;
  let ambienceStyle    = DEFAULTS.ambienceStyle;
  let noiseTolerance   = DEFAULTS.noiseTolerance;
  let outdoorSeating   = DEFAULTS.outdoorSeating;
  let chainPreference  = DEFAULTS.chainPreference;
  let dessertInterest  = DEFAULTS.dessertInterest;
  let travelWillingness = DEFAULTS.travelWillingness;
  let visitFrequency   = DEFAULTS.visitFrequency;

  // Q5: Adventure
  const advIdx = a(5);
  if (advIdx !== -1) {
    adventureLevel = [2, 5, 8, 10][advIdx] ?? 5;
    if (advIdx === 3) specialtyInterest = clamp(specialtyInterest + 2);
  }

  // Q6: Budget
  const budIdx = a(6);
  if (budIdx !== -1) budgetLevel = [2, 5, 7, 10][budIdx] ?? 5;

  // Q7: Ambience
  const ambIdx = a(7);
  if (ambIdx !== -1) ambienceStyle = [2, 8, 5, 3][ambIdx] ?? 5;

  // Q8: Noise
  const noiseIdx = a(8);
  if (noiseIdx !== -1) noiseTolerance = [1, 4, 7, 10][noiseIdx] ?? 5;

  // Q9: Work
  const workIdx = a(9);
  if (workIdx !== -1) workFromCafe = [10, 6, 2, 0][workIdx] ?? workFromCafe;

  // Q10: Date
  const dateIdx = a(10);
  if (dateIdx !== -1) dateAtCafe = [10, 6, 2][dateIdx] ?? dateAtCafe;

  // Q11: Reading/study
  const readIdx = a(11);
  if (readIdx !== -1) studyAtCafe = [9, 5, 1][readIdx] ?? studyAtCafe;

  // Q12: Time of day
  const timeIdx = a(12);
  if (timeIdx !== -1) morningPerson = [10, 7, 4, 1][timeIdx] ?? morningPerson;

  // Q13: Outdoor
  const outIdx = a(13);
  if (outIdx !== -1) outdoorSeating = [10, 6, 3, 0][outIdx] ?? outdoorSeating;

  // Q14: Chain preference
  const chainIdx = a(14);
  if (chainIdx !== -1) chainPreference = [0, 3, 5, 8][chainIdx] ?? chainPreference;

  // Q15: Dessert
  const desIdx = a(15);
  if (desIdx !== -1) dessertInterest = [10, 7, 4, 1][desIdx] ?? dessertInterest;

  // Q16: Travel
  const travIdx = a(16);
  if (travIdx !== -1) travelWillingness = [1, 4, 7, 10][travIdx] ?? travelWillingness;

  // Q17: Frequency
  const freqIdx = a(17);
  if (freqIdx !== -1) visitFrequency = [20, 15, 8, 2][freqIdx] ?? visitFrequency;

  // Q18: Matcha
  const matchaIdx = a(18);
  if (matchaIdx !== -1) matchaInterest = [10, 6, 3, 0][matchaIdx] ?? matchaInterest;

  // Q19: Espresso knowledge
  const espIdx = a(19);
  if (espIdx !== -1) {
    espressoConfidence = [10, 6, 3, 1][espIdx] ?? espressoConfidence;
    if (espIdx === 0) specialtyInterest = clamp(specialtyInterest + 2);
  }

  const partial: Omit<CoffeeDNA, "constellation"> = {
    drink, roast, milk, sweetness, vibe,
    matchaInterest,
    specialtyInterest,
    espressoConfidence,
    adventureLevel,
    budgetLevel,
    ambienceStyle,
    noiseTolerance,
    workFromCafe,
    studyAtCafe,
    dateAtCafe,
    morningPerson,
    outdoorSeating,
    chainPreference,
    dessertInterest,
    travelWillingness,
    visitFrequency,
  };

  return { ...partial, constellation: buildConstellation(partial) };
}

/** Derive a legacy TasteProfile from CoffeeDNA — for match-engine compat */
export function dnaToTasteProfile(dna: CoffeeDNA): TasteProfile {
  return {
    roast:     dna.roast,
    drink:     dna.drink,
    milk:      dna.milk,
    sweetness: dna.sweetness,
    vibe:      dna.vibe,
  };
}

/** Compute a display headline from the DNA */
export function dnaHeadline(dna: CoffeeDNA): string {
  if (dna.drink === "matcha") return "Matcha Devotee";
  if (dna.specialtyInterest >= 8) return "Specialty Purist";
  if (dna.adventureLevel >= 8) return "Coffee Explorer";
  if (dna.workFromCafe >= 8) return "Café Nomad";
  if (dna.studyAtCafe >= 8) return "The Scholar";
  if (dna.dateAtCafe >= 8) return "The Romantic";
  if (dna.espressoConfidence >= 8) return "Espresso Connoisseur";
  const drinkLabels: Record<CoffeeDNA["drink"], string> = {
    espresso: "Espresso Purist",
    latte: "Latte Loyalist",
    cappuccino: "Cappuccino Fan",
    "cold-brew": "Cold Brew Devotee",
    "pour-over": "Pour Over Pilgrim",
    matcha: "Matcha Devotee",
  };
  return drinkLabels[dna.drink] ?? "Coffee Lover";
}

export function dnaTagline(dna: CoffeeDNA): string {
  const parts: string[] = [];
  if (dna.roast === "light") parts.push("bright origins");
  else if (dna.roast === "dark") parts.push("bold & intense");
  else parts.push("smooth & balanced");

  if (dna.matchaInterest >= 7) parts.push("matcha obsessed");
  else if (dna.specialtyInterest >= 7) parts.push("specialty focused");

  if (dna.workFromCafe >= 7) parts.push("works from cafés");
  else if (dna.studyAtCafe >= 7) parts.push("studies in silence");
  else if (dna.dateAtCafe >= 7) parts.push("cozy date spots");
  else if (dna.adventureLevel >= 7) parts.push("always exploring");

  return parts.slice(0, 3).join(" · ");
}
