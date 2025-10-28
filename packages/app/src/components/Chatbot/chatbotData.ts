export interface ChatbotOption {
  key: string;
  label: string;
  next: string;
}

export interface ChatbotQuestion {
  id: string;
  text: string;
  options: ChatbotOption[];
}

export interface ChatbotAnswer {
  questionId: string;
  answerKey: string;
  answerLabel: string;
}

export interface ChatbotEndpoint {
  message: string;
  actions?: Array<{
    type: string;
    label: string;
    href?: string;
  }>;
  options?: Array<{
    key: string;
    label: string;
    action: string;
  }>;
}

export const chatbotQuestions: ChatbotQuestion[] = [
  {
    id: "Q1",
    text: "Hi! Want me to quickly pick a design based on a story? (takes 1 minute)",
    options: [
      { key: "A", label: "Yes — let's go!", next: "Q2" },
      { key: "B", label: "Not now", next: "END_NO" }
    ]
  },
  {
    id: "Q2",
    text: "What kind of story should the design capture?",
    options: [
      { key: "A", label: "Travel memory", next: "Q3" },
      { key: "B", label: "Milestone (graduation, wedding)", next: "Q3" },
      { key: "C", label: "Inside joke / friendship", next: "Q3" },
      { key: "D", label: "Personal brand / aesthetic", next: "Q3" }
    ]
  },
  {
    id: "Q3",
    text: "Which product are you thinking of?",
    options: [
      { key: "A", label: "T-shirt", next: "Q4" },
      { key: "B", label: "Hoodie", next: "Q4" },
      { key: "C", label: "Tote", next: "Q4" },
      { key: "D", label: "Mug", next: "Q4" }
    ]
  },
  {
    id: "Q4",
    text: "Pick a design vibe",
    options: [
      { key: "A", label: "Minimal & typographic", next: "Q5" },
      { key: "B", label: "Photographic / travel collage", next: "Q5" },
      { key: "C", label: "Illustrative / playful", next: "Q5" },
      { key: "D", label: "Premium / monogram style", next: "Q5" }
    ]
  },
  {
    id: "Q5",
    text: "Color family preference?",
    options: [
      { key: "A", label: "Muted neutrals (beige, grey)", next: "Q6" },
      { key: "B", label: "Bold & vibrant (reds, teal)", next: "Q6" },
      { key: "C", label: "Pastels", next: "Q6" },
      { key: "D", label: "Black & White (monochrome)", next: "Q6" }
    ]
  },
  {
    id: "Q6",
    text: "Preferred placement on the product?",
    options: [
      { key: "A", label: "Center chest / main canvas", next: "Q7" },
      { key: "B", label: "Left chest / subtle", next: "Q7" },
      { key: "C", label: "Full-front print", next: "Q7" },
      { key: "D", label: "Back print / large", next: "Q7" }
    ]
  },
  {
    id: "Q7",
    text: "Choose a production style (affects pricing)",
    options: [
      { key: "A", label: "Express — AI only (cheaper)", next: "COMPLETE" },
      { key: "B", label: "Story — AI + designer review (recommended)", next: "COMPLETE" },
      { key: "C", label: "Signature — priority designer (premium)", next: "COMPLETE" }
    ]
  }
];

export const chatbotEndpoints: Record<string, ChatbotEndpoint> = {
  END_NO: {
    message: "No worries — tap the chat anytime to start. Meanwhile, check our bestsellers.",
    actions: [
      { type: "link", label: "View Bestsellers", href: "/products/bestsellers" }
    ]
  },
  COMPLETE: {
    message: "Thanks — I've prepared a brief. Want me to email it to you or start the studio now?",
    options: [
      { key: "A", label: "Start Studio (open editor)", action: "open_studio" },
      { key: "B", label: "Email brief to me", action: "ask_for_email" },
      { key: "C", label: "Save & continue later", action: "save_session" }
    ]
  }
};

// Answer mapping for summary generation
export const answerLabels: Record<string, Record<string, string>> = {
  Q2: {
    A: "Travel memory",
    B: "Milestone (graduation, wedding)",
    C: "Inside joke / friendship",
    D: "Personal brand / aesthetic"
  },
  Q3: {
    A: "T-shirt",
    B: "Hoodie",
    C: "Tote",
    D: "Mug"
  },
  Q4: {
    A: "Minimal & typographic",
    B: "Photographic / travel collage",
    C: "Illustrative / playful",
    D: "Premium / monogram style"
  },
  Q5: {
    A: "Muted neutrals (beige, grey)",
    B: "Bold & vibrant (reds, teal)",
    C: "Pastels",
    D: "Black & White (monochrome)"
  },
  Q6: {
    A: "Center chest / main canvas",
    B: "Left chest / subtle",
    C: "Full-front print",
    D: "Back print / large"
  },
  Q7: {
    A: "Express",
    B: "Story",
    C: "Signature"
  }
};
