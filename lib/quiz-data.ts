export interface QuizOption {
  label: string;
  emoji: string;
  desc?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  emoji: string;
  options: QuizOption[];
  mandatory: boolean;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ── Mandatory (0–4) ────────────────────────────────────────────────────────
  {
    id: 0,
    question: "What's your usual order?",
    subtitle: "Be honest — what do you actually drink most days?",
    emoji: "☕",
    mandatory: true,
    options: [
      { label: "Espresso",           emoji: "⚡", desc: "Bold, concentrated, no nonsense" },
      { label: "Latte",              emoji: "🥛", desc: "Smooth, milky, reliable" },
      { label: "Cappuccino",         emoji: "☕", desc: "Balanced, a little frothy" },
      { label: "Cold Brew",          emoji: "🧊", desc: "Chill, smooth, slow-sipped" },
      { label: "Pour Over / Filter", emoji: "🫗", desc: "Bright, nuanced, deliberate" },
      { label: "Matcha Latte",       emoji: "🍵", desc: "Earthy, green, a little different" },
    ],
  },
  {
    id: 1,
    question: "How dark do you take your roast?",
    subtitle: "Light roasts are fruity and bright. Dark roasts are bold and intense.",
    emoji: "🌑",
    mandatory: true,
    options: [
      { label: "Light",  emoji: "☀️", desc: "Bright, fruity, complex — I like tasting the origin" },
      { label: "Medium", emoji: "🌤", desc: "Smooth and balanced — the comfortable middle" },
      { label: "Dark",   emoji: "🌑", desc: "Bold, rich, a little bitter — classic" },
      { label: "No preference", emoji: "🎲", desc: "Whatever the barista recommends" },
    ],
  },
  {
    id: 2,
    question: "What goes in your cup?",
    subtitle: "Milk makes a difference.",
    emoji: "🥛",
    mandatory: true,
    options: [
      { label: "Dairy milk",   emoji: "🐄", desc: "Classic, creamy, works with everything" },
      { label: "Oat milk",     emoji: "🌾", desc: "Smooth, slightly sweet, current favourite" },
      { label: "Almond milk",  emoji: "🌰", desc: "Light, nutty, lower cal" },
      { label: "Soy milk",     emoji: "🫘", desc: "Old faithful plant-based" },
      { label: "Nothing — black", emoji: "✦", desc: "Pure. Unapologetic." },
    ],
  },
  {
    id: 3,
    question: "How sweet?",
    subtitle: "No judgement either way.",
    emoji: "🍯",
    mandatory: true,
    options: [
      { label: "Unsweetened",    emoji: "🤍", desc: "Let the coffee speak for itself" },
      { label: "Just a touch",   emoji: "✦",  desc: "Barely there sweetness" },
      { label: "Medium sweet",   emoji: "🍬", desc: "Balanced — pleasant but not overpowering" },
      { label: "Quite sweet",    emoji: "🍯", desc: "I like it sweet, don't hold back" },
    ],
  },
  {
    id: 4,
    question: "Why do you usually visit a café?",
    subtitle: "Your real reason, not the aspirational one.",
    emoji: "✨",
    mandatory: true,
    options: [
      { label: "Getting work done",       emoji: "💻", desc: "Laptop, headphones, do not disturb" },
      { label: "Studying",                emoji: "📚", desc: "Notes, books, a long Americano" },
      { label: "Catching up with someone",emoji: "💬", desc: "Good conversation, good coffee" },
      { label: "A date",                  emoji: "🌹", desc: "Cozy, aesthetic, slightly nervous" },
      { label: "Morning ritual",          emoji: "🌅", desc: "The quiet start before the day begins" },
      { label: "Quick caffeine fix",      emoji: "⚡", desc: "In and out, no time for menus" },
    ],
  },

  // ── Optional (5–19) ────────────────────────────────────────────────────────
  {
    id: 5,
    question: "How do you order at a new café?",
    subtitle: "New place, new menu in front of you.",
    emoji: "🗺",
    mandatory: false,
    options: [
      { label: "My usual, always",                emoji: "🔁", desc: "Consistency is comfort" },
      { label: "Their signature drink",           emoji: "⭐", desc: "Trust the house special" },
      { label: "Whatever sounds interesting",     emoji: "👀", desc: "Something I haven't tried before" },
      { label: "Ask the barista what's best",    emoji: "🗣", desc: "The expert knows better than the menu" },
    ],
  },
  {
    id: 6,
    question: "What's your usual spend per café visit?",
    subtitle: "Including your drink, any food.",
    emoji: "💸",
    mandatory: false,
    options: [
      { label: "Under ₹200",  emoji: "🪙", desc: "Budget-conscious" },
      { label: "₹200–400",    emoji: "💵", desc: "Reasonable" },
      { label: "₹400–700",    emoji: "💳", desc: "Premium but worth it" },
      { label: "₹700+",       emoji: "✨", desc: "I invest in good coffee" },
    ],
  },
  {
    id: 7,
    question: "Which café feels like home?",
    subtitle: "Close your eyes and picture it.",
    emoji: "🏡",
    mandatory: false,
    options: [
      { label: "Dark wood, warm lights, leather",  emoji: "🕯",  desc: "Moody, intimate, cinematic" },
      { label: "White walls, plants, minimalist",  emoji: "🌿",  desc: "Airy, calm, Scandinavian" },
      { label: "Exposed brick, records, eclectic", emoji: "🎵",  desc: "Artsy, a little chaotic, full of character" },
      { label: "Grand, chandeliers, European",     emoji: "🏛",  desc: "Dramatic, heritage, elevated" },
    ],
  },
  {
    id: 8,
    question: "How much noise can you handle?",
    subtitle: "Your ideal café soundscape.",
    emoji: "🔊",
    mandatory: false,
    options: [
      { label: "Library quiet",            emoji: "🤫", desc: "I can hear my own thoughts" },
      { label: "Soft background music",    emoji: "🎶", desc: "Ambient, low-key, pleasant" },
      { label: "A pleasant buzz",          emoji: "🔊", desc: "Lively but not overwhelming" },
      { label: "The louder the better",   emoji: "🎉", desc: "Energy and chaos are the vibe" },
    ],
  },
  {
    id: 9,
    question: "Do you work from cafés?",
    subtitle: "Honestly.",
    emoji: "💻",
    mandatory: false,
    options: [
      { label: "Yes, I'm basically remote",  emoji: "🏠", desc: "The café is my office" },
      { label: "Sometimes for a few hours",  emoji: "⏱",  desc: "When I need a change of scene" },
      { label: "Rarely",                     emoji: "🤷", desc: "Occasional but not intentional" },
      { label: "Never",                      emoji: "✕",  desc: "Cafés are for switching off" },
    ],
  },
  {
    id: 10,
    question: "Would you take a date to a café?",
    subtitle: "First date, third date — doesn't matter.",
    emoji: "🌹",
    mandatory: false,
    options: [
      { label: "It's my go-to first date",    emoji: "❤️", desc: "Low pressure, high atmosphere" },
      { label: "Sure, for something casual",  emoji: "😊", desc: "Works as a chill option" },
      { label: "Probably a restaurant instead",emoji: "🍽", desc: "More appropriate for dates" },
    ],
  },
  {
    id: 11,
    question: "Do you read or journal at cafés?",
    subtitle: "Books, notebooks, or just scrolling counts.",
    emoji: "📚",
    mandatory: false,
    options: [
      { label: "Yes — it's one of my favourites", emoji: "📖", desc: "A book and a coffee is a perfect afternoon" },
      { label: "Sometimes, if the vibe is right",  emoji: "📓", desc: "Depends on the café" },
      { label: "Not really my thing",              emoji: "📵", desc: "I prefer talking or working" },
    ],
  },
  {
    id: 12,
    question: "When do you usually go?",
    subtitle: "Think of a typical week.",
    emoji: "🕐",
    mandatory: false,
    options: [
      { label: "First thing in the morning", emoji: "🌅", desc: "Before most people are awake" },
      { label: "Mid-morning",                emoji: "☀️", desc: "10–12am, the sweet spot" },
      { label: "Afternoon",                  emoji: "🌤", desc: "Post-lunch, 2–5pm" },
      { label: "Evening only",               emoji: "🌙", desc: "After 6pm, unwinding" },
    ],
  },
  {
    id: 13,
    question: "How important is outdoor seating?",
    subtitle: "Delhi winters, Gurgaon rooftops.",
    emoji: "🌳",
    mandatory: false,
    options: [
      { label: "Essential — I only sit outside", emoji: "🌞", desc: "Fresh air is non-negotiable" },
      { label: "Nice to have",                   emoji: "🌿", desc: "I'll use it if it's there" },
      { label: "Doesn't matter",                 emoji: "😐", desc: "Whatever's available" },
      { label: "I prefer indoors",               emoji: "🏠", desc: "AC and good lighting please" },
    ],
  },
  {
    id: 14,
    question: "Independent café or reliable chain?",
    subtitle: "Be honest about your actual preference.",
    emoji: "🏪",
    mandatory: false,
    options: [
      { label: "Always independent, always local", emoji: "🫶", desc: "Supporting the community" },
      { label: "Mostly independent",               emoji: "☕", desc: "With the occasional chain" },
      { label: "Either is great",                  emoji: "⚖️", desc: "Quality matters more than ownership" },
      { label: "I love a reliable chain",          emoji: "🔵", desc: "Consistent, comfortable, quick" },
    ],
  },
  {
    id: 15,
    question: "How important are the pastries?",
    subtitle: "Croissants, cakes, sandwiches.",
    emoji: "🥐",
    mandatory: false,
    options: [
      { label: "I come for the food, coffee is secondary", emoji: "🍰", desc: "The pastry case is the first thing I check" },
      { label: "Love a good croissant alongside",          emoji: "🥐", desc: "The perfect pairing" },
      { label: "Nice if they have it",                     emoji: "🤌", desc: "Not a dealbreaker though" },
      { label: "Just the coffee",                          emoji: "☕", desc: "Nothing else needed" },
    ],
  },
  {
    id: 16,
    question: "How far would you go for a great café?",
    subtitle: "Real willingness, not aspirational.",
    emoji: "🗺",
    mandatory: false,
    options: [
      { label: "5 minutes walking only",  emoji: "👣", desc: "Hyper-local, near me" },
      { label: "15–20 minutes away",      emoji: "🚶", desc: "Reasonable distance" },
      { label: "30–45 minutes away",      emoji: "🚗", desc: "If it's worth it" },
      { label: "Anywhere in the city",    emoji: "🗺",  desc: "Great coffee justifies the commute" },
    ],
  },
  {
    id: 17,
    question: "How often do you visit cafés?",
    subtitle: "On average, in a typical week.",
    emoji: "📅",
    mandatory: false,
    options: [
      { label: "Multiple times a day",    emoji: "⚡", desc: "I live here practically" },
      { label: "Once a day",              emoji: "☕", desc: "Part of the daily routine" },
      { label: "A few times a week",      emoji: "📅", desc: "Regular but not daily" },
      { label: "Once a week or less",     emoji: "🗓", desc: "An occasional treat" },
    ],
  },
  {
    id: 18,
    question: "How do you feel about matcha?",
    subtitle: "Matcha lattes, matchas on ice, matcha everything.",
    emoji: "🍵",
    mandatory: false,
    options: [
      { label: "Obsessed — my alternative to coffee", emoji: "🍵", desc: "Ceremonial grade please" },
      { label: "Love it as an occasional treat",      emoji: "💚", desc: "A nice change" },
      { label: "I've had it once or twice",           emoji: "🤔", desc: "Open to it" },
      { label: "Not really interested",               emoji: "👋", desc: "Sticking to coffee" },
    ],
  },
  {
    id: 19,
    question: "How well do you know your espresso?",
    subtitle: "No wrong answers — coffee knowledge isn't gatekept here.",
    emoji: "⚡",
    mandatory: false,
    options: [
      { label: "I know my ristretto from my lungo", emoji: "🎓", desc: "The technicals matter to me" },
      { label: "I understand the basics",           emoji: "📗", desc: "Enough to order confidently" },
      { label: "Still learning, enjoying the ride", emoji: "🌱", desc: "Getting curious about it" },
      { label: "I just want it to taste good",      emoji: "😋", desc: "Vibes over knowledge" },
    ],
  },
];

export const MANDATORY_COUNT = 5;
export const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;
