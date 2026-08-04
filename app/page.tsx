"use client";

import { useCallback, useRef, useState } from "react";

type Metrics = { cash: number; readiness: number; trust: number };
type ProductKey = "seed" | "fertilizer" | "cropCare" | "drip";
type Inventory = Record<ProductKey, number>;
type Position = { x: number; y: number };
type Phase = "title" | "briefing" | "shop" | "ending";
type ToolPanel = "inventory" | "ledger" | "coach" | "notebook" | null;
type CreditOptionId = "starter" | "staged" | "large";
type AdviceId = "verify" | "sell" | "refer";
type BookKind = "Cash ledger" | "Inventory card" | "Customer credit ledger" | "Expense ledger" | "Follow-up log";
type SaleChoice = { quantity: number; icon: string; label: string; note: string; tone?: "warm" | "careful" };

type StoryLine = { speaker: string; icon: string; text: string };

type SaleCustomer = Position & {
  id: string;
  kind: "sale";
  name: string;
  icon: string;
  product: ProductKey;
  requested: number;
  arrival: string;
  opening: string;
  context: string;
  next: string;
};

type CreditCustomer = Position & {
  id: string;
  kind: "credit";
  name: string;
  icon: string;
  arrival: string;
  opening: string;
  next: string;
};

type AdviceCustomer = Position & {
  id: string;
  kind: "advice";
  name: string;
  icon: string;
  arrival: string;
  opening: string;
  next: string;
};

type Customer = SaleCustomer | CreditCustomer | AdviceCustomer;

type BookEntry = {
  id: string;
  time: string;
  book: BookKind;
  source: string;
  description: string;
  value: string;
  lesson: string;
};

type CoachGuidance = {
  lesson: string;
  nudge: string;
  know: string;
  consider: string;
  record: string;
};

type Impact = {
  title: string;
  summary: string;
  reaction: StoryLine;
  next: string;
  final: boolean;
  changes: Array<{
    icon: string;
    label: string;
    before: string;
    after: string;
    tone?: "positive" | "negative" | "neutral";
  }>;
  bookkeeping: BookEntry[];
};

type StoryFlags = {
  rashidiQuantity: number | null;
  creditOption: CreditOptionId | null;
  creditStructured: boolean;
  adviceChoice: AdviceId | null;
  adviceEvidence: number;
  neemaQuantity: number | null;
};

const INITIAL_METRICS: Metrics = { cash: 2400000, readiness: 52, trust: 68 };
const INITIAL_INVENTORY: Inventory = { seed: 8, fertilizer: 4, cropCare: 2, drip: 1 };
const START_POSITION: Position = { x: 51, y: 77 };
const DEMO_DEADLINE = 900;
const BOOKS: Array<{ id: BookKind; icon: string; short: string }> = [
  { id: "Cash ledger", icon: "🟢", short: "Green cash book" },
  { id: "Inventory card", icon: "🔵", short: "Blue stock card" },
  { id: "Customer credit ledger", icon: "🟤", short: "Brown credit book" },
  { id: "Expense ledger", icon: "🟠", short: "Orange expense book" },
  { id: "Follow-up log", icon: "📓", short: "Pocket follow-up book" },
];
const INITIAL_FLAGS: StoryFlags = {
  rashidiQuantity: null,
  creditOption: null,
  creditStructured: false,
  adviceChoice: null,
  adviceEvidence: 0,
  neemaQuantity: null,
};

const PRODUCTS: Record<ProductKey, { label: string; shortLabel: string; icon: string; price: number }> = {
  seed: { label: "Vegetable seed packs", shortLabel: "Seed", icon: "🌱", price: 95000 },
  fertilizer: { label: "Fertilizer bags", shortLabel: "Fertilizer", icon: "🧺", price: 140000 },
  cropCare: { label: "Registered crop-care units", shortLabel: "Crop care", icon: "🧪", price: 160000 },
  drip: { label: "Drip-line kits", shortLabel: "Drip kits", icon: "💧", price: 120000 },
};

const BRIEFING: StoryLine[] = [
  {
    speaker: "Amina",
    icon: "👩🏾‍💼",
    text: "The shutters are up. Motorbikes hum along the road, and the model-farm gathering begins at three o'clock.",
  },
  {
    speaker: "Amina",
    icon: "👩🏾‍💼",
    text: "I counted eight tomato seed packs and four fertilizer bags. The supplier's truck will not reach us today.",
  },
  {
    speaker: "Neema",
    icon: "👩🏾",
    text: "Rashidi wants five packs. Rehema is coming about credit. Listen well—and reach the model plot by three.",
  },
];

const CUSTOMERS: Customer[] = [
  {
    id: "rashidi-sale",
    kind: "sale",
    name: "Rashidi",
    icon: "🧑🏾‍🌾",
    product: "seed",
    requested: 5,
    arrival: "Rashidi parks his bicycle and unfolds a bundle of notes.",
    opening: "Habari, Amina! The rain is coming—can I take all five seed packs today?",
    context: "Eight packs were counted this morning. Mama Rehema said she may need four later, and today's delivery truck is not coming.",
    next: "Rashidi pedals toward his farm. A few minutes later, Mama Rehema appears at the doorway with a well-used notebook.",
    x: 36,
    y: 53,
  },
  {
    id: "rehema-credit",
    kind: "credit",
    name: "Mama Rehema",
    icon: "👩🏿‍🌾",
    arrival: "Mama Rehema opens her notebook to two crossed-out balances.",
    opening: "I have TSh 220,000 today, and my buyer pays next month. Can we make an agreement neither of us worries about?",
    next: "The agreement is folded into Rehema's notebook. At 2:00 PM, Juma hurries in with a tomato leaf wrapped in newspaper.",
    x: 64,
    y: 51,
  },
  {
    id: "juma-advice",
    kind: "advice",
    name: "Juma",
    icon: "🧑🏾‍🌾",
    arrival: "Juma unwraps a spotted leaf as the wall clock ticks behind him.",
    opening: "A travelling seller says his bottle fixes these spots. I trust this Centre—what should I do before spending my money?",
    next: "At 3:00 PM, voices rise from the model plot. Neema waves from beside the demonstration bed.",
    x: 37,
    y: 50,
  },
  {
    id: "neema-finale",
    kind: "sale",
    name: "Neema",
    icon: "👩🏾",
    product: "seed",
    requested: 2,
    arrival: "Neema returns with two farmers from the model plot.",
    opening: "They loved today's tomato variety. Is there one seed pack for each of them?",
    context: "The afternoon group is waiting. This is the final seed request before Amina closes the Centre.",
    next: "The sun drops behind the shop roof. Amina pulls the books closer and listens as the day's choices come back to her.",
    x: 66,
    y: 52,
  },
];

const CREDIT_OPTIONS: Array<{
  id: CreditOptionId;
  label: string;
  explanation: string;
  value: number;
  seed: number;
  fertilizer: number;
  drip: number;
}> = [
  {
    id: "starter",
    label: "Pay-today starter",
    explanation: "Fits the notes Rehema brought. No promise follows her home.",
    value: 220000,
    seed: 2,
    fertilizer: 1,
    drip: 0,
  },
  {
    id: "staged",
    label: "Grow in two steps",
    explanation: "Enough to begin now, with one smaller promise written for harvest time.",
    value: 480000,
    seed: 3,
    fertilizer: 2,
    drip: 0,
  },
  {
    id: "large",
    label: "Big harvest bet",
    explanation: "A fuller cart today—and a much heavier promise for both women to carry.",
    value: 700000,
    seed: 4,
    fertilizer: 3,
    drip: 1,
  },
];

const NOTEBOOK: Record<string, { title: string; copy: string }> = {
  starting: {
    title: "An empty space has a memory",
    copy: "Rashidi's cash may land in the tin now, but every packet under his arm leaves a space that Rehema can see later.",
  },
  credit: {
    title: "A promise needs a shape",
    copy: "An old repayment, a known buyer, a package both sides can carry, and a date in ink turn 'later' into something Rehema and Amina can trust.",
  },
  advice: {
    title: "Sometimes the honest answer is 'let me check'",
    copy: "A closer look, a safe product, or a warm introduction can protect Juma better than a confident guess—and the clock still keeps ticking.",
  },
};

const splitSentences = (text: string) =>
  text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [text];

const saleChoicesFor = (customer: SaleCustomer, available: number): SaleChoice[] => {
  const canGive = Math.min(customer.requested, available);
  if (customer.id === "rashidi-sale") {
    return [
      { quantity: canGive, icon: "🚲", label: "Fill his bicycle crate", note: `${canGive} packs · ${available - canGive} stay`, tone: "warm" },
      { quantity: Math.min(4, canGive), icon: "🤝", label: "Share the shelf", note: `4 packs · 4 stay for Rehema`, tone: "careful" },
    ];
  }
  if (canGive === 0) return [{ quantity: 0, icon: "🪵", label: "Explain the empty shelf", note: "Write both names for follow-up", tone: "careful" }];
  if (canGive === 1) {
    return [
      { quantity: 1, icon: "🌱", label: "Offer the last pack", note: "One farmer can begin", tone: "warm" },
      { quantity: 0, icon: "📓", label: "Save it and follow up", note: "Call both farmers later", tone: "careful" },
    ];
  }
  return [
    { quantity: 2, icon: "🧺", label: "Pack one for each", note: "Both farmers leave with seed", tone: "warm" },
    { quantity: 1, icon: "🌱", label: "Offer one pack", note: "They can share the learning", tone: "careful" },
  ];
};

const formatCash = (amount: number) => {
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1000000) return `${sign}TSh ${(absolute / 1000000).toFixed(1)}m`;
  return `${sign}TSh ${Math.round(absolute / 1000)}k`;
};

const formatCashImpact = (amount: number) => {
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1000000) return `${sign}TSh ${(absolute / 1000000).toFixed(2)}m`;
  return `${sign}TSh ${Math.round(absolute / 1000)}k`;
};

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 12 ? hours - 12 : hours}:${mins.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

const applyEffects = (current: Metrics, effects: Partial<Metrics>): Metrics => ({
  cash: Math.max(0, current.cash + (effects.cash ?? 0)),
  trust: Math.max(0, Math.min(100, current.trust + (effects.trust ?? 0))),
  readiness: Math.max(0, Math.min(100, current.readiness + (effects.readiness ?? 0))),
});

export default function Home() {
  const [phase, setPhase] = useState<Phase>("title");
  const [briefingStep, setBriefingStep] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [inventory, setInventory] = useState<Inventory>(INITIAL_INVENTORY);
  const [minutes, setMinutes] = useState(450);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerLineIndex, setCustomerLineIndex] = useState(0);
  const [creditOptionId, setCreditOptionId] = useState<CreditOptionId>("staged");
  const [creditChecks, setCreditChecks] = useState({ ledger: false, buyer: false });
  const [showBigCreditOption, setShowBigCreditOption] = useState(false);
  const [adviceChecks, setAdviceChecks] = useState({ leaf: false, label: false, consultant: false });
  const [ledgerExposure, setLedgerExposure] = useState(0);
  const [toolPanel, setToolPanel] = useState<ToolPanel>(null);
  const [unlockedNotes, setUnlockedNotes] = useState<string[]>(["starting"]);
  const [flags, setFlags] = useState<StoryFlags>(INITIAL_FLAGS);
  const [impact, setImpact] = useState<Impact | null>(null);
  const [impactStep, setImpactStep] = useState<0 | 1 | 2>(0);
  const [coachExpanded, setCoachExpanded] = useState(false);
  const [bookEntries, setBookEntries] = useState<BookEntry[]>([]);
  const [bookkeepingIndex, setBookkeepingIndex] = useState(0);
  const [bookkeepingFeedback, setBookkeepingFeedback] = useState("");
  const [bookkeepingMistakes, setBookkeepingMistakes] = useState(0);
  const [mistakenEntryIds, setMistakenEntryIds] = useState<string[]>([]);
  const [demoLateMinutes, setDemoLateMinutes] = useState(0);
  const [scoreCopied, setScoreCopied] = useState(false);
  const [player, setPlayer] = useState<Position>(START_POSITION);
  const [toast, setToast] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);

  const currentCustomer = CUSTOMERS[completedIds.length];
  const selectedCreditOption = CREDIT_OPTIONS.find((option) => option.id === creditOptionId) ?? CREDIT_OPTIONS[1];
  const customerLines = selectedCustomer ? splitSentences(selectedCustomer.opening) : [];
  const saleChoices = selectedCustomer?.kind === "sale" ? saleChoicesFor(selectedCustomer, inventory[selectedCustomer.product]) : [];
  const totalInventory = Object.values(inventory).reduce((sum, value) => sum + value, 0);
  const creditDeposit = Math.min(220000, selectedCreditOption.value);
  const creditBalance = selectedCreditOption.value - creditDeposit;
  const creditTimeCost = 25 + Number(creditChecks.ledger) * 10 + Number(creditChecks.buyer) * 15;
  const adviceEvidenceCount = Number(adviceChecks.leaf) + Number(adviceChecks.label) + Number(adviceChecks.consultant);
  const adviceTimeCost = (choice: AdviceId) => (choice === "verify" ? 25 : choice === "sell" ? 15 : 20);
  const pendingBookEntry = impact?.bookkeeping[bookkeepingIndex];
  const booksComplete = Boolean(impact && bookkeepingIndex >= impact.bookkeeping.length);

  const guidanceFor = (customer: Customer): CoachGuidance => {
    if (customer.id === "rashidi-sale") {
      return {
        lesson: "From your BLF training · Stock and cash books",
        nudge: "Count what will remain after his bicycle leaves.",
        know: `Count the shelf: ${inventory.seed} seed packs. Rashidi wants 5, and Rehema may return for as many as 4.`,
        consider: "The cash on the counter is real, but so is the next farmer's need. No truck is coming to rescue an empty shelf.",
        record: "If packs and cash cross the counter, leave Rashidi a receipt, put the money in the green cash book, and mark the blue stock card.",
      };
    }
    if (customer.kind === "credit") {
      return {
        lesson: "From your BLF training · Credit for customers",
        nudge: "A promise is safer when both people can see the date.",
        know: `The ${formatCash(220000)} on the counter is cash. Anything beyond it is a promise from Rehema's next harvest.`,
        consider: "A promise feels safer when you know the repayment history, confirm the buyer, and write dates both people can understand.",
        record: "Money received goes in the green cash book. Products leaving go on blue stock cards. The unpaid promise belongs in Rehema's brown credit book.",
      };
    }
    if (customer.kind === "advice") {
      const remaining = Math.max(0, DEMO_DEADLINE - minutes);
      return {
        lesson: "From your BLF training · Risk and customer care",
        nudge: "Which mistake could hurt Juma most?",
        know: `The wall clock leaves ${remaining} minutes before the demonstration. The leaf spots—and the travelling seller's bottle—still hold unanswered questions.`,
        consider: "Ask which mistake could hurt Juma most. Each useful check lowers uncertainty, but the farmers at the model plot will not stop their clocks.",
        record: "A sale moves cash and a bottle. Paying for a proper check creates an expense. A referral moves neither, but Amina should remember the follow-up.",
      };
    }
    return {
      lesson: "From your BLF training · Closing stock and customer care",
      nudge: "Let the shelf—not hope—answer first.",
      know: `Run a hand along the shelf: ${inventory.seed} seed packs remain${demoLateMinutes ? `, and the group has already waited ${demoLateMinutes} minutes` : ", with the demonstration starting on time"}.`,
      consider: "Let the physical shelf—not hope—shape the answer. A clear explanation can protect a relationship even when stock is short.",
      record: inventory.seed > 0
        ? "Before closing, leave a receipt, add the cash to the green book, and make the last mark on the blue seed card."
        : "An empty shelf creates no cash entry. Put the farmers' names in the pocket follow-up book so the Centre can call when seed returns.",
    };
  };

  const selectedGuidance = selectedCustomer ? guidanceFor(selectedCustomer) : null;
  const deskGuidance = currentCustomer ? guidanceFor(currentCustomer) : null;

  const playTone = useCallback(
    (frequency = 560, duration = 0.07) => {
      if (!soundOn || typeof window === "undefined") return;
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const context = audioRef.current ?? new AudioContextClass();
        audioRef.current = context;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "square";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.025, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
      } catch {
        // Sound is decorative.
      }
    },
    [soundOn],
  );

  const inspectAdvice = (key: keyof typeof adviceChecks, timeCost: number) => {
    if (adviceChecks[key]) return;
    setAdviceChecks((current) => ({ ...current, [key]: true }));
    setMinutes((current) => current + timeCost);
    playTone(720, 0.07);
  };

  const recordBookEntry = (book: BookKind) => {
    if (!pendingBookEntry) return;
    if (pendingBookEntry.book !== book) {
      setBookkeepingMistakes((current) => current + 1);
      setMistakenEntryIds((current) =>
        current.includes(pendingBookEntry.id) ? current : [...current, pendingBookEntry.id],
      );
      setBookkeepingFeedback(`Coach Zawadi leans over the desk: “${pendingBookEntry.lesson}”`);
      playTone(360, 0.09);
      return;
    }
    setBookEntries((current) =>
      current.some((entry) => entry.id === pendingBookEntry.id) ? current : [...current, pendingBookEntry],
    );
    setBookkeepingIndex((current) => current + 1);
    const bookName = BOOKS.find((item) => item.id === book)?.short ?? book;
    setBookkeepingFeedback(`Stamp! The ${bookName.toLowerCase()} now tells the same story as the counter.`);
    playTone(880, 0.08);
  };

  const startDay = () => {
    setPhase("briefing");
    setBriefingStep(0);
    playTone(640, 0.12);
  };

  const advanceBriefing = () => {
    if (briefingStep === BRIEFING.length - 1) {
      setPhase("shop");
      setToast("Rashidi is waiting at the counter.");
      playTone(780, 0.1);
      return;
    }
    setBriefingStep((current) => current + 1);
    playTone(700, 0.06);
  };

  const openCustomer = (customer: Customer) => {
    if (!currentCustomer || customer.id !== currentCustomer.id) return;
    setSelectedCustomer(customer);
    setCustomerLineIndex(0);
    setCoachExpanded(false);
    setPlayer({ x: customer.x, y: Math.min(84, customer.y + 9) });
    setToast("");
    if (customer.kind === "credit") {
      setCreditOptionId("staged");
      setCreditChecks({ ledger: false, buyer: false });
      setShowBigCreditOption(false);
    }
    playTone(760);
  };

  const finishEncounter = (customer: Customer, nextImpact: Impact) => {
    setCompletedIds((current) => [...current, customer.id]);
    setSelectedCustomer(null);
    setPlayer(START_POSITION);
    setBookkeepingIndex(0);
    setBookkeepingFeedback("");
    setImpactStep(0);
    setImpact(nextImpact);
  };

  const completeSale = (chosenQuantity: number) => {
    if (!selectedCustomer || selectedCustomer.kind !== "sale") return;
    const customer = selectedCustomer;
    const quantity = Math.max(0, Math.min(chosenQuantity, inventory[customer.product], customer.requested));
    const revenue = quantity * PRODUCTS[customer.product].price;
    const beforeStock = inventory[customer.product];
    const afterStock = beforeStock - quantity;
    const beforeCash = metrics.cash;
    const beforeTrust = metrics.trust;
    const trustChange = quantity === customer.requested ? 2 : quantity === 0 ? -3 : 0;
    const timeCost = 25;

    setInventory((current) => ({ ...current, [customer.product]: current[customer.product] - quantity }));
    setMetrics((current) => applyEffects(current, { cash: revenue, trust: trustChange }));
    setMinutes((current) => current + timeCost);
    setFlags((current) => ({
      ...current,
      ...(customer.id === "rashidi-sale" ? { rashidiQuantity: quantity } : { neemaQuantity: quantity }),
    }));

    const summary = customer.id === "rashidi-sale"
      ? quantity === customer.requested
        ? "Five packets leave with Rashidi. Three remain."
        : quantity === 0
          ? "The shelf stays full. Rashidi leaves without seed."
          : `${quantity} packets go with Rashidi. ${afterStock} stay for Rehema.`
      : quantity === customer.requested
        ? "One packet goes to each farmer."
        : quantity === 0
          ? "The shelf is empty. Their names go into follow-up."
          : "One packet leaves. The farmers will share what they learn.";
    const reactionText = customer.id === "rashidi-sale"
      ? quantity === customer.requested
        ? "Asante! I will tie these to the bicycle and go straight to the nursery."
        : quantity === 0
          ? "I understand. Please send word when seed comes—I do not want to miss the rain."
          : `I can begin with ${quantity}. Let me adjust the nursery beds before the clouds return.`
      : quantity === customer.requested
        ? "Perfect! The two farmers are still by the tomato bed. I will take these to them now."
        : quantity === 0
          ? "Ah, the shelf is empty. I will explain how today's earlier choices used the seed."
          : `One pack is still useful. I will ask the farmers to share what they learn.`;
    const impactTitle = customer.id === "rashidi-sale"
      ? quantity === customer.requested
        ? "Rashidi grins and checks the packets twice"
        : quantity === 0
          ? "Rashidi folds the notes back into his pocket"
          : "Rashidi redraws his nursery plan on the counter"
      : quantity === customer.requested
        ? "Neema hurries the packs back to the model plot"
        : quantity === 0
          ? "Neema looks from the empty shelf to the waiting group"
          : "Neema carries one last packet into the afternoon light";
    const transactionTime = formatTime(minutes + timeCost);
    const bookkeeping: BookEntry[] = quantity > 0
      ? [
          {
            id: `${customer.id}-cash`,
            time: transactionTime,
            book: "Cash ledger",
            source: "Customer receipt",
            description: `Cash sale · ${customer.name}`,
            value: `+${formatCash(revenue)}`,
            lesson: "Follow the notes: real cash entered the tin, so this slip belongs in the green cash book.",
          },
          {
            id: `${customer.id}-stock`,
            time: transactionTime,
            book: "Inventory card",
            source: "Stock issue",
            description: `${PRODUCTS[customer.product].shortLabel} released · ${customer.name}`,
            value: `−${quantity} ${quantity === 1 ? "unit" : "units"}`,
            lesson: "Look at the gap on the shelf. Packets left the shop, so make the same gap on the blue stock card.",
          },
        ]
      : [
          {
            id: `${customer.id}-follow-up`,
            time: transactionTime,
            book: "Follow-up log",
            source: "Unfilled request note",
            description: `${customer.name} · request not fulfilled`,
            value: "No cash transaction",
            lesson: "The cash tin and shelf did not move. Keep the person's name in the pocket follow-up book instead.",
          },
        ];

    finishEncounter(customer, {
      title: impactTitle,
      summary,
      reaction: { speaker: customer.name, icon: customer.icon, text: reactionText },
      next: customer.next,
      final: customer.id === CUSTOMERS.at(-1)?.id,
      changes: [
        { icon: "🌱", label: `${PRODUCTS[customer.product].shortLabel} on shelf`, before: `${beforeStock}`, after: `${afterStock}`, tone: afterStock < beforeStock ? "negative" : "neutral" },
        { icon: "🪙", label: "Cash in the tin", before: formatCashImpact(beforeCash), after: formatCashImpact(beforeCash + revenue), tone: revenue > 0 ? "positive" : "neutral" },
        { icon: "🕒", label: "Wall clock", before: formatTime(minutes), after: formatTime(minutes + timeCost), tone: "neutral" },
        { icon: "💚", label: `${customer.name}'s confidence`, before: `${beforeTrust}%`, after: `${Math.max(0, Math.min(100, beforeTrust + trustChange))}%`, tone: trustChange > 0 ? "positive" : trustChange < 0 ? "negative" : "neutral" },
      ],
      bookkeeping,
    });
    playTone(quantity === customer.requested ? 880 : 430, 0.11);
  };

  const packageIsFeasible = (option = selectedCreditOption) =>
    inventory.seed >= option.seed && inventory.fertilizer >= option.fertilizer && inventory.drip >= option.drip;

  const completeCredit = () => {
    if (!selectedCustomer || selectedCustomer.kind !== "credit" || !packageIsFeasible()) return;
    const customer = selectedCustomer;
    const option = selectedCreditOption;
    const beforeCash = metrics.cash;
    const beforeExposure = ledgerExposure;
    const structured = option.id === "starter" || (creditChecks.ledger && creditChecks.buyer && option.id === "staged");
    const trustChange = structured ? 3 : 1;

    setInventory((current) => ({
      ...current,
      seed: current.seed - option.seed,
      fertilizer: current.fertilizer - option.fertilizer,
      drip: current.drip - option.drip,
    }));
    setMetrics((current) => applyEffects(current, { cash: creditDeposit, trust: trustChange }));
    setLedgerExposure((current) => current + creditBalance);
    setMinutes((current) => current + creditTimeCost);
    setFlags((current) => ({ ...current, creditOption: option.id, creditStructured: structured }));
    setUnlockedNotes((current) => (current.includes("credit") ? current : [...current, "credit"]));

    const transactionTime = formatTime(minutes + creditTimeCost);
    const stockDescription = `${option.seed} seed · ${option.fertilizer} fertilizer${option.drip ? ` · ${option.drip} drip` : ""}`;
    const bookkeeping: BookEntry[] = [
      {
        id: "rehema-credit-cash",
        time: transactionTime,
        book: "Cash ledger",
        source: "Part-payment receipt",
        description: "Deposit received · Mama Rehema",
        value: `+${formatCash(creditDeposit)}`,
        lesson: "Only the notes Rehema placed on the counter belong in today's green cash book. Her future promise is not cash yet.",
      },
      {
        id: "rehema-credit-stock",
        time: transactionTime,
        book: "Inventory card",
        source: "Signed stock release",
        description: `Package issued · ${stockDescription}`,
        value: `−${option.seed + option.fertilizer + option.drip} units`,
        lesson: "Every item is leaving today, even if some money comes later. The blue stock cards should show the whole bundle.",
      },
      ...(creditBalance > 0
        ? [{
            id: "rehema-credit-balance",
            time: transactionTime,
            book: "Customer credit ledger" as BookKind,
            source: "Written credit agreement",
            description: "Outstanding balance · Mama Rehema",
            value: formatCash(creditBalance),
            lesson: "Rehema carries this promise home. Keep its twin in the brown credit book until she pays it.",
          }]
        : []),
    ];
    const reactionText = creditBalance === 0
      ? "This is small enough for today, and I go home owing nothing. That lets me sleep well."
      : structured
        ? `The ${formatCash(creditBalance)} balance matches my buyer's dates. I will keep this page beside my farm records.`
        : "That is a large promise to carry in my head. Please write every date clearly so neither of us remembers it differently.";

    finishEncounter(customer, {
      title: creditBalance === 0
        ? "Rehema closes the notebook with a satisfied nod"
        : structured
          ? "Rehema traces each repayment date with her finger"
          : "Rehema pauses before putting the agreement away",
      summary:
        creditBalance === 0
          ? "A smaller bundle leaves the shelf, fully covered by the money on the counter."
          : structured
            ? "The package, today's deposit, the buyer, and the remaining balance now tell one clear story."
            : "The larger package helps today, but the promise sitting in Amina's book feels less certain.",
      reaction: { speaker: customer.name, icon: customer.icon, text: reactionText },
      next: customer.next,
      final: false,
      changes: [
        { icon: "🌱", label: "Seed on shelf", before: `${inventory.seed}`, after: `${inventory.seed - option.seed}`, tone: "negative" },
        { icon: "🪙", label: "Cash in the tin", before: formatCashImpact(beforeCash), after: formatCashImpact(beforeCash + creditDeposit), tone: "positive" },
        { icon: "📒", label: "Rehema still owes", before: formatCash(beforeExposure), after: formatCash(beforeExposure + creditBalance), tone: creditBalance > 0 ? "negative" : "neutral" },
        { icon: "🕒", label: "Wall clock", before: formatTime(minutes), after: formatTime(minutes + creditTimeCost), tone: "neutral" },
      ],
      bookkeeping,
    });
    playTone(structured ? 820 : 600, 0.12);
  };

  const completeAdvice = (choice: AdviceId) => {
    if (!selectedCustomer || selectedCustomer.kind !== "advice") return;
    const customer = selectedCustomer;
    const evidence = adviceEvidenceCount;
    const beforeCash = metrics.cash;
    const beforeCropCare = inventory.cropCare;
    const timeCost = adviceTimeCost(choice);
    const finishTime = minutes + timeCost;
    const lateMinutes = Math.max(0, finishTime - DEMO_DEADLINE);
    const cashChange = choice === "verify" ? -40000 : choice === "sell" ? PRODUCTS.cropCare.price : 0;
    const cropCareChange = choice === "sell" ? -1 : 0;
    const deadlineTrust = lateMinutes > 0 ? -2 : 1;
    const deadlineReadiness = lateMinutes > 0 ? -6 : 2;

    setMetrics((current) =>
      applyEffects(current, {
        cash: cashChange,
        trust: deadlineTrust,
        readiness: deadlineReadiness + (choice === "verify" ? 2 : 0),
      }),
    );
    if (cropCareChange) setInventory((current) => ({ ...current, cropCare: Math.max(0, current.cropCare + cropCareChange) }));
    setMinutes(finishTime);
    setDemoLateMinutes(lateMinutes);
    setFlags((current) => ({ ...current, adviceChoice: choice, adviceEvidence: evidence }));
    setUnlockedNotes((current) => (current.includes("advice") ? current : [...current, "advice"]));

    const summary =
      choice === "verify"
        ? "The bottle stays on the shelf while Amina pays for a closer look at the leaf."
        : choice === "sell"
          ? "A bottle leaves the shelf before anyone confirms what made the spots."
          : adviceChecks.consultant
            ? "Juma leaves with the agronomist already expecting his photos."
            : "Juma leaves with a name, but nobody has made the introduction for him.";
    const deadlineResult = lateMinutes > 0
      ? `${lateMinutes} ${lateMinutes === 1 ? "minute" : "minutes"} late`
      : `${DEMO_DEADLINE - finishTime} minutes early`;
    const transactionTime = formatTime(finishTime);
    const bookkeeping: BookEntry[] = choice === "sell"
      ? [
          {
            id: "juma-advice-cash",
            time: transactionTime,
            book: "Cash ledger",
            source: "Customer receipt",
            description: "Crop-care cash sale · Juma",
            value: `+${formatCash(PRODUCTS.cropCare.price)}`,
            lesson: "Juma's notes are now in the tin. The receipt belongs beside that movement in the green cash book.",
          },
          {
            id: "juma-advice-stock",
            time: transactionTime,
            book: "Inventory card",
            source: "Stock issue",
            description: "Crop-care product released · Juma",
            value: "−1 unit",
            lesson: "A bottle left an empty space behind. The blue stock card needs the same story.",
          },
        ]
      : choice === "verify"
        ? [
            {
              id: "juma-advice-cash-out",
              time: transactionTime,
              book: "Cash ledger",
              source: "Assessment payment slip",
              description: "Crop assessment cash paid",
              value: `−${formatCash(40000)}`,
              lesson: "This time notes left the tin. The green cash book follows money in both directions.",
            },
            {
              id: "juma-advice-expense",
              time: transactionTime,
              book: "Expense ledger",
              source: "Assessment receipt",
              description: "Crop assessment service · Juma",
              value: formatCash(40000),
              lesson: "The assessment helped today's business and used today's money. Its receipt belongs in the orange expense book.",
            },
          ]
        : [
            {
              id: "juma-advice-follow-up",
              time: transactionTime,
              book: "Follow-up log",
              source: "Farmer service note",
              description: adviceChecks.consultant ? "Warm agronomist referral · Juma" : "Referral advised · Juma",
              value: "No cash transaction",
              lesson: "No notes or bottle crossed the counter. Write the promised handover in the pocket follow-up book.",
            },
          ];
    const reactionText = choice === "verify"
      ? `Good. I would rather wait for the right answer than spray the wrong thing.${lateMinutes ? " I can hear the demo group already—go, Amina!" : ""}`
      : choice === "sell"
        ? "The label is not very clear... but if this is what you recommend, I will take it."
        : adviceChecks.consultant
          ? "You already told the agronomist my name? Asante—now I know she is expecting me."
          : "All right... where exactly should I find her, and will she know why I have come?";

    finishEncounter(customer, {
      title: choice === "verify"
        ? "Juma wraps the leaf again instead of reaching for a bottle"
        : choice === "sell"
          ? "Juma turns the bottle slowly, searching for the missing details"
          : adviceChecks.consultant
            ? "Juma saves the agronomist's number in his phone"
            : "Juma leaves with a name, but no introduction",
      summary: `${summary} Amina finishes ${deadlineResult}.`,
      reaction: { speaker: customer.name, icon: customer.icon, text: reactionText },
      next: lateMinutes > 0
        ? `The model-farm demonstration started ${lateMinutes} minutes ago. Neema is already with the waiting group.`
        : customer.next,
      final: false,
      changes: [
        { icon: "🪙", label: "Cash in the tin", before: formatCashImpact(beforeCash), after: formatCashImpact(Math.max(0, beforeCash + cashChange)), tone: cashChange > 0 ? "positive" : cashChange < 0 ? "negative" : "neutral" },
        { icon: "🧪", label: "Bottles on the shelf", before: `${beforeCropCare}`, after: `${Math.max(0, beforeCropCare + cropCareChange)}`, tone: cropCareChange < 0 ? "negative" : "neutral" },
        { icon: "🕒", label: "Wall clock", before: formatTime(minutes), after: formatTime(finishTime), tone: lateMinutes > 0 ? "negative" : "neutral" },
        { icon: "⏰", label: "Farmers at the demo", before: `${Math.max(0, DEMO_DEADLINE - minutes)} min left`, after: deadlineResult, tone: lateMinutes > 0 ? "negative" : "positive" },
      ],
      bookkeeping,
    });
    playTone(choice === "sell" ? 430 : 800, 0.12);
  };

  const finishDay = () => {
    let trustChange = 0;
    let readinessChange = 0;
    if (flags.creditOption && flags.creditStructured) trustChange += 4;
    if (flags.creditOption === "large" && !flags.creditStructured) trustChange -= 2;
    if (flags.adviceChoice === "verify") {
      trustChange += flags.adviceEvidence >= 2 ? 12 : 6;
      readinessChange += 3;
    } else if (flags.adviceChoice === "sell") {
      trustChange -= 14;
      readinessChange -= 3;
    } else if (flags.adviceChoice === "refer") {
      trustChange += flags.adviceEvidence >= 1 ? 6 : -2;
    }
    setMetrics((current) => applyEffects(current, { trust: trustChange, readiness: readinessChange }));
    setImpact(null);
    setImpactStep(0);
    setPhase("ending");
    playTone(trustChange >= 0 ? 860 : 470, 0.15);
  };

  const continueAfterImpact = () => {
    if (!impact || !booksComplete) return;
    if (impact.final) {
      finishDay();
      return;
    }
    const nextCustomer = CUSTOMERS[completedIds.length];
    if (nextCustomer?.id === "juma-advice") setMinutes((current) => Math.max(current, 840));
    if (nextCustomer?.id === "neema-finale") setMinutes((current) => Math.max(current, 900));
    setToast(impact.next);
    setImpact(null);
    setImpactStep(0);
    playTone(700, 0.07);
  };

  const replay = () => {
    setPhase("title");
    setBriefingStep(0);
    setMetrics(INITIAL_METRICS);
    setInventory(INITIAL_INVENTORY);
    setMinutes(450);
    setCompletedIds([]);
    setSelectedCustomer(null);
    setCustomerLineIndex(0);
    setCreditOptionId("staged");
    setCreditChecks({ ledger: false, buyer: false });
    setAdviceChecks({ leaf: false, label: false, consultant: false });
    setLedgerExposure(0);
    setToolPanel(null);
    setUnlockedNotes(["starting"]);
    setFlags(INITIAL_FLAGS);
    setImpact(null);
    setImpactStep(0);
    setCoachExpanded(false);
    setShowBigCreditOption(false);
    setBookEntries([]);
    setBookkeepingIndex(0);
    setBookkeepingFeedback("");
    setBookkeepingMistakes(0);
    setMistakenEntryIds([]);
    setDemoLateMinutes(0);
    setScoreCopied(false);
    setPlayer(START_POSITION);
    setToast("");
  };

  const farmerScore =
    (flags.rashidiQuantity === 5 ? 5 : flags.rashidiQuantity ? 4 : 0) +
    (flags.creditOption === "staged" && flags.creditStructured ? 6 : flags.creditOption === "starter" ? 5 : flags.creditOption ? 2 : 0) +
    (flags.adviceChoice === "verify" ? (flags.adviceEvidence >= 2 ? 6 : 4) : flags.adviceChoice === "refer" ? (flags.adviceEvidence >= 1 ? 5 : 3) : 0) +
    (flags.neemaQuantity === 2 ? 3 : flags.neemaQuantity ? 2 : 0);
  const bookkeepingScore = Math.max(10, 25 - mistakenEntryIds.length * 3);
  const stewardshipScore =
    (flags.rashidiQuantity && flags.rashidiQuantity <= 3 ? 7 : flags.rashidiQuantity === 4 ? 5 : flags.rashidiQuantity === 5 ? 3 : 2) +
    (flags.creditOption === "staged" ? 7 : flags.creditOption === "starter" ? 5 : flags.creditOption === "large" ? 2 : 0) +
    (flags.neemaQuantity === 2 ? 6 : flags.neemaQuantity ? 3 : 0);
  const riskScore =
    (flags.creditStructured ? 8 : flags.creditOption ? 2 : 0) +
    (flags.adviceChoice === "verify" ? (flags.adviceEvidence >= 2 ? 12 : 8) : flags.adviceChoice === "refer" ? (flags.adviceEvidence >= 1 ? 10 : 4) : 0);
  const timeScore = demoLateMinutes === 0 ? 15 : demoLateMinutes <= 5 ? 12 : demoLateMinutes <= 10 ? 9 : demoLateMinutes <= 20 ? 5 : 0;
  const balancedScore = farmerScore + bookkeepingScore + stewardshipScore + riskScore + timeScore;
  const scoreGrade = balancedScore >= 90
    ? "Kijani's Trusted Hand"
    : balancedScore >= 75
      ? "A Steady Day at the Centre"
      : balancedScore >= 60
        ? "Finding Amina's Rhythm"
        : "Ready for Another Saturday";

  const shareScore = async () => {
    const text = `My Saturday at Kijani Centre · ${balancedScore}/100 · ${scoreGrade}\nFarmers helped ${farmerScore}/20 · Books kept ${bookkeepingScore}/25 · Shop kept steady ${stewardshipScore}/20 · Risks handled ${riskScore}/20 · Made the demo ${timeScore}/15`;
    try {
      if (navigator.share) await navigator.share({ title: "My Kijani Centre market day", text });
      else await navigator.clipboard.writeText(text);
      setScoreCopied(true);
    } catch {
      setScoreCopied(false);
    }
  };

  const creditOutcome =
    flags.creditOption === "starter"
      ? "Rehema starts with a smaller plot and no balance following her home. She says she will return with harvest news."
      : flags.creditStructured
        ? "When the buyer calls again, Rehema opens the same dated page that Amina has. Neither has to argue from memory."
        : flags.creditOption
          ? "The inputs are already in Rehema's field, but the large promise in Amina's book still feels heavier than the deposit."
          : "Rehema's request was not completed.";

  const adviceOutcome =
    flags.adviceChoice === "verify"
      ? flags.adviceEvidence >= 2
        ? "The agronomist's message points to nutrient stress, not the disease Juma feared. He laughs with relief and leaves the pesticide unopened."
        : "Juma is glad Amina did not guess. He keeps the leaf wrapped safely while they wait for the final answer."
      : flags.adviceChoice === "sell"
        ? "At the model plot, Juma hears that the bottle may not match the problem. He goes quiet, and the farmers beside him notice."
      : flags.adviceChoice === "refer" && flags.adviceEvidence >= 1
          ? "The agronomist greets Juma by name. He smiles—the referral feels like a real handover, not directions shouted from a doorway."
          : "Juma avoids an uncertain sale, but spends the afternoon asking which agronomist Amina meant.";

  return (
    <main className="game-page">
      <section className="game-frame" aria-label="Kijani Centre agribusiness life simulation">
        <div className="map-stage weather-0">
          <div className="sun-glow" aria-hidden="true" />
          <div className="drifting-cloud cloud-one" aria-hidden="true" />
          <div className="drifting-cloud cloud-two" aria-hidden="true" />

          {phase === "title" && (
            <div className="screen-overlay title-screen">
              <div className="title-card pixel-panel">
                <span className="tiny-leaf" aria-hidden="true">🌿</span>
                <p className="game-kicker">Better Life Farming · Tanzania</p>
                <h1>Kijani Centre</h1>
                <p className="game-subtitle">Lift the shutters, meet four neighbours, and watch one small choice travel through the whole day.</p>
                <div className="mission-preview">
                  <strong>Can Amina finish a day the whole community trusts?</strong>
                  <p>Help the people at the counter, keep the shop steady, write down what really happened, and reach the model plot by three.</p>
                  <div><span>🤝 Farmers helped · 20</span><span>📒 Books kept · 25</span><span>📦 Shop kept steady · 20</span><span>🛡️ Risks handled · 20</span><span>⏰ Made the demo · 15</span></div>
                </div>
                <div className="title-details">
                  <span>🗓️ One Saturday</span>
                  <span>👥 Four neighbours</span>
                  <span>↪ Every choice returns</span>
                </div>
                <button className="primary-button start-button" type="button" onClick={startDay}>Lift the shutters</button>
                <p className="small-note">Nobody gets everything. Listen well, write it down, and keep an eye on the wall clock.</p>
              </div>
            </div>
          )}

          {phase !== "title" && phase !== "ending" && (
            <header className="hud pixel-panel">
              <div className="hud-date">
                <span className="hud-day">Market day</span>
                <span>Sat · 14 Oct</span>
                <span>{formatTime(minutes)}</span>
                <span>🌤️ 25°</span>
              </div>
              <div className="hud-stats" aria-label="Centre status">
                <span title="Available capital">🪙 <strong>{formatCash(metrics.cash)}</strong></span>
                <span title="Stock units">📦 <strong>{totalInventory}</strong></span>
              </div>
              <button className="icon-button" type="button" aria-label={soundOn ? "Turn sound off" : "Turn sound on"} onClick={() => setSoundOn((current) => !current)}>{soundOn ? "🔊" : "🔇"}</button>
            </header>
          )}

          {phase === "briefing" && (
            <div className="screen-overlay morning-screen">
              <div className="morning-card pixel-panel">
                <div className="morning-heading">
                  <span className="morning-icon" aria-hidden="true">🌅</span>
                  <div><span className="eyebrow">7:30 AM · Before opening</span><h1>A Saturday at Kijani Centre</h1><p>The road is waking up. So is the shop.</p></div>
                </div>
                <div className="story-stage morning-story">
                  <div className="story-speaker"><span aria-hidden="true">{BRIEFING[briefingStep].icon}</span><strong>{BRIEFING[briefingStep].speaker}</strong></div>
                  <p>{BRIEFING[briefingStep].text}</p>
                  <div className="story-footer">
                    <div className="story-progress" aria-label={`Briefing line ${briefingStep + 1} of ${BRIEFING.length}`}>
                      {BRIEFING.map((_, index) => <span key={index} className={`story-dot ${index < briefingStep ? "done" : index === briefingStep ? "current" : ""}`} />)}
                    </div>
                    <button className="primary-button story-next" type="button" onClick={advanceBriefing}>{briefingStep === BRIEFING.length - 1 ? "Open the Centre →" : "Continue →"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === "shop" && (
            <>
              <aside className="day-card pixel-panel">
                <span className="eyebrow">At the shop door</span>
                <h1>{currentCustomer ? `${currentCustomer.name} is here` : "The road is quiet again"}</h1>
                <p>{currentCustomer ? "Open the conversation. The rest of the Centre can wait." : "Amina can finally bring the books together."}</p>

                {currentCustomer && (
                  <div className="visitor-list current-visitor">
                    <button type="button" onClick={() => openCustomer(currentCustomer)}>
                      <span>{currentCustomer.icon}</span>
                      <span><strong>{currentCustomer.name}</strong><small>{currentCustomer.id === "rashidi-sale" ? "Cash folded on the counter" : currentCustomer.id === "neema-finale" ? "Two farmers at the model plot" : currentCustomer.kind === "credit" ? "Farm notebook in hand" : "A spotted tomato leaf"}</small></span>
                      <b>Welcome →</b>
                    </button>
                  </div>
                )}

                <div className="story-trail" aria-label="Market day progress">
                  {CUSTOMERS.map((customer, index) => (
                    <span key={customer.id} className={completedIds.includes(customer.id) ? "done" : index === completedIds.length ? "current" : "locked"}>
                      <b>{completedIds.includes(customer.id) ? "✓" : index + 1}</b>
                      {completedIds.includes(customer.id) ? customer.name : index === completedIds.length ? "Now" : "Later"}
                    </span>
                  ))}
                </div>
              </aside>

              <aside className="tool-dock pixel-panel" aria-label="Centre tools">
                <span className="eyebrow">Amina&apos;s desk</span>
                <div className="tool-buttons">
                  <button type="button" onClick={() => setToolPanel("inventory")}><span>📦</span><strong>Stockroom</strong><small>{totalInventory} units</small></button>
                  <button type="button" onClick={() => setToolPanel("ledger")}><span>📒</span><strong>Today&apos;s books</strong><small>{bookEntries.length} entries</small></button>
                  <button type="button" onClick={() => setToolPanel("notebook")}><span>📖</span><strong>Notebook</strong><small>{unlockedNotes.length} notes</small></button>
                  <button type="button" onClick={() => setToolPanel("coach")}><span>🧑🏾‍🏫</span><strong>Coach Zawadi</strong><small>ALP Coach</small></button>
                </div>
              </aside>

              {currentCustomer && (
                <button className="world-marker customer-marker current-customer-marker" type="button" style={{ left: `${currentCustomer.x}%`, top: `${currentCustomer.y}%` }} onClick={() => openCustomer(currentCustomer)} aria-label={`Talk to ${currentCustomer.name}`}>
                  <span className="npc-sprite" aria-hidden="true">{currentCustomer.icon}</span>
                  <span className="marker-label">{currentCustomer.name}</span>
                </button>
              )}

              <div className="player-sprite" style={{ left: `${player.x}%`, top: `${player.y}%` }} aria-label="Amina, the BLF agri-entrepreneur" role="img">
                <span className="player-hat" />
                <span className="player-head" />
                <span className="player-body" />
                <span className="player-legs" />
              </div>

              {toast && <div className="game-toast pixel-panel" role="status">{toast}</div>}
            </>
          )}

          {selectedCustomer && (
            <div className="interaction-scrim">
              <div className="interaction-sheet pixel-panel" role="dialog" aria-modal="true" aria-label={`Conversation with ${selectedCustomer.name}`}>
                <button className="sheet-close" type="button" aria-label="Return to the shop" onClick={() => setSelectedCustomer(null)}>×</button>
                <div className={`conversation-heading ${customerLineIndex >= customerLines.length ? "deciding" : ""}`}><span>{selectedCustomer.icon}</span><div><span className="eyebrow">At the counter · {formatTime(minutes)}</span><h2>{selectedCustomer.name}</h2><p>{customerLineIndex < customerLines.length ? "First, hear them out." : "Your move."}</p></div></div>
                {customerLineIndex < customerLines.length && <p className="scene-setting">{selectedCustomer.arrival}</p>}

                {customerLineIndex < customerLines.length ? (
                  <div className="story-stage customer-story">
                    <div className="story-speaker"><span aria-hidden="true">{selectedCustomer.icon}</span><strong>{selectedCustomer.name}</strong></div>
                    <p>“{customerLines[customerLineIndex]}”</p>
                    <div className="story-footer">
                      <div className="story-progress" aria-label={`Request line ${customerLineIndex + 1} of ${customerLines.length}`}>
                        {customerLines.map((_, index) => <span key={index} className={`story-dot ${index < customerLineIndex ? "done" : index === customerLineIndex ? "current" : ""}`} />)}
                      </div>
                      <button className="primary-button story-next" type="button" onClick={() => { setCustomerLineIndex((current) => Math.min(customerLines.length, current + 1)); playTone(700, 0.06); }}>{customerLineIndex === customerLines.length - 1 ? "Respond to the request →" : "Continue →"}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedGuidance && (
                      <section className="decision-coach coach-nudge" aria-label="ALP Coach decision guide">
                        <div className="coach-heading"><span>🧑🏾‍🏫</span><div><small>Coach Zawadi</small><strong>“{selectedGuidance.nudge}”</strong></div><button className="coach-why-button" type="button" onClick={() => setCoachExpanded((current) => !current)}>{coachExpanded ? "Hide" : "Why?"}</button></div>
                        {coachExpanded && <div className="coach-more"><small>{selectedGuidance.lesson}</small><p>{selectedGuidance.consider}</p></div>}
                      </section>
                    )}

                    {selectedCustomer.kind === "sale" && (
                      <div className="sale-builder play-choice">
                        <div className="shelf-game" aria-label={`${inventory[selectedCustomer.product]} seed packs on the shelf`}>
                          <div className="shelf-top"><span>Wooden shelf</span><strong>{inventory[selectedCustomer.product]} packs</strong></div>
                          <div className="seed-packets">{Array.from({ length: inventory[selectedCustomer.product] }, (_, index) => <span key={index} className={selectedCustomer.id === "rashidi-sale" && index >= inventory.seed - 4 ? "future-pack" : ""}>🌱</span>)}{inventory[selectedCustomer.product] === 0 && <em>empty</em>}</div>
                          {selectedCustomer.id === "rashidi-sale" && <div className="future-shelf-key"><i /> Rehema may need four</div>}
                          {selectedCustomer.id === "neema-finale" && demoLateMinutes > 0 && <div className="late-chip">⏰ Group waited {demoLateMinutes} min</div>}
                        </div>
                        <span className="choice-question">What does Amina put on the counter?</span>
                        <div className="story-choice-grid">
                          {saleChoices.map((choice) => <button key={`${choice.label}-${choice.quantity}`} className={choice.tone ?? ""} type="button" onClick={() => completeSale(choice.quantity)}><span>{choice.icon}</span><strong>{choice.label}</strong><small>{choice.note}</small></button>)}
                        </div>
                      </div>
                    )}

                    {selectedCustomer.kind === "credit" && (
                      <div className="credit-builder play-choice">
                        <div className="counter-props"><span>💵</span><strong>TSh 220k today</strong><i /> <span>📓</span><strong>A promise for later?</strong></div>
                        <div className="evidence-desk">
                          <button type="button" className={creditChecks.ledger ? "checked" : ""} onClick={() => setCreditChecks((current) => ({ ...current, ledger: true }))}><span>📒</span><strong>Check old account</strong><small>{creditChecks.ledger ? "✓ Paid on time" : "+10 min"}</small></button>
                          <button type="button" className={creditChecks.buyer ? "checked" : ""} onClick={() => setCreditChecks((current) => ({ ...current, buyer: true }))}><span>📞</span><strong>Call her buyer</strong><small>{creditChecks.buyer ? "✓ Order confirmed" : "+15 min"}</small></button>
                        </div>
                        <span className="choice-question">Choose Rehema&apos;s basket</span>
                        <div className="package-grid simple-packages lighter-packages">
                          {CREDIT_OPTIONS.filter((option) => option.id !== "large" || showBigCreditOption).map((option) => {
                            const feasible = packageIsFeasible(option);
                            const balance = Math.max(0, option.value - 220000);
                            return <button key={option.id} type="button" disabled={!feasible} className={creditOptionId === option.id ? "selected" : ""} onClick={() => setCreditOptionId(option.id)}><span className="basket-goods">{"🌱".repeat(option.seed)}{"🧺".repeat(option.fertilizer)}{option.drip ? "💧" : ""}</span><strong>{option.label}</strong><small>{balance ? `${formatCash(balance)} after harvest` : "Nothing owed later"}</small>{!feasible && <b>Not enough on shelf</b>}</button>;
                          })}
                        </div>
                        {!showBigCreditOption && <button className="quiet-option" type="button" onClick={() => setShowBigCreditOption(true)}>Show the bigger, riskier basket</button>}
                        <div className="agreement-strip"><span>💵 Today <b>{formatCash(creditDeposit)}</b></span><span>✍ Later <b>{creditBalance ? formatCash(creditBalance) : "none"}</b></span><span>🕒 <b>+{creditTimeCost} min</b></span></div>
                        <button className="primary-button" type="button" disabled={!packageIsFeasible()} onClick={completeCredit}>Stamp this agreement</button>
                      </div>
                    )}

                    {selectedCustomer.kind === "advice" && (
                      <div className="advice-builder play-choice">
                        <div className={`deadline-banner ${minutes >= DEMO_DEADLINE ? "late" : minutes >= DEMO_DEADLINE - 20 ? "warning" : ""}`} role="status">
                          <span>⏰</span><div><strong>Demo at 3:00 PM</strong><p>{minutes < DEMO_DEADLINE ? `${DEMO_DEADLINE - minutes} minutes left` : `${minutes - DEMO_DEADLINE} minutes late`}</p></div><b>{formatTime(minutes)}</b>
                        </div>
                        <div className="evidence-desk three">
                          <button type="button" className={adviceChecks.leaf ? "checked" : ""} onClick={() => inspectAdvice("leaf", 10)}><span>🍃</span><strong>Inspect leaf</strong><small>{adviceChecks.leaf ? "✓ Several possible causes" : "+10 min"}</small></button>
                          <button type="button" className={adviceChecks.label ? "checked" : ""} onClick={() => inspectAdvice("label", 10)}><span>🧪</span><strong>Read label</strong><small>{adviceChecks.label ? "✓ Details missing" : "+10 min"}</small></button>
                          <button type="button" className={adviceChecks.consultant ? "checked" : ""} onClick={() => inspectAdvice("consultant", 20)}><span>📞</span><strong>Call agronomist</strong><small>{adviceChecks.consultant ? "✓ She expects Juma" : "+20 min"}</small></button>
                        </div>
                        <span className="choice-question">Juma is watching. What does Amina do?</span>
                        <div className="advice-actions consequence-actions">
                          <button type="button" onClick={() => completeAdvice("verify")}><span>🔎</span><strong>Pay for a proper check</strong><small>−TSh 40k · +25 min</small></button>
                          <button type="button" disabled={inventory.cropCare < 1} onClick={() => completeAdvice("sell")}><span>🧪</span><strong>Sell the bottle now</strong><small>+TSh 160k · +15 min</small></button>
                          <button type="button" onClick={() => completeAdvice("refer")}><span>🤝</span><strong>Introduce the agronomist</strong><small>No sale · +20 min</small></button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {impact && (
            <div className="interaction-scrim impact-scrim">
              <div className="impact-sheet pixel-panel" role="dialog" aria-modal="true" aria-label="Decision impact">
                {impactStep === 0 && (
                  <div className="reaction-scene">
                    <span className="eyebrow">Right there at the counter...</span>
                    <h2>{impact.title}</h2>
                    <div className="customer-reaction"><span>{impact.reaction.icon}</span><div><strong>{impact.reaction.speaker}</strong><p>“{impact.reaction.text}”</p></div></div>
                    <button className="primary-button" type="button" onClick={() => { setImpactStep(1); playTone(720, 0.08); }}>Watch the choice travel →</button>
                  </div>
                )}

                {impactStep === 1 && (
                  <div className="consequence-scene">
                    <span className="eyebrow">Watch it happen</span>
                    <h2>The choice travels</h2>
                    <p className="impact-summary">{impact.summary}</p>
                    <div className="ripple-track">
                      {impact.changes.filter((change) => change.before !== change.after).map((change) => (
                        <article key={change.label} className={change.tone ?? "neutral"}><span>{change.icon}</span><div><small>{change.label}</small><p><del>{change.before}</del><b>→</b><strong>{change.after}</strong></p></div></article>
                      ))}
                    </div>
                    <button className="primary-button paper-button" type="button" onClick={() => { setImpactStep(2); playTone(660, 0.08); }}>Pick up the paper slip →</button>
                  </div>
                )}

                {impactStep === 2 && (
                  <>
                    <section className="bookkeeping-practice" aria-label="Bookkeeping practice">
                      <div className="bookkeeping-heading"><div><span>✎</span><div><small>Amina&apos;s counter</small><strong>One last job before the next neighbour</strong></div></div><b>{Math.min(bookkeepingIndex + 1, impact.bookkeeping.length)} / {impact.bookkeeping.length}</b></div>
                      {pendingBookEntry ? (
                        <>
                          <p>A paper slip is waiting beside the cash tin. Which book should Amina open?</p>
                          <div className="source-document">
                            <span>{pendingBookEntry.source}</span><strong>{pendingBookEntry.description}</strong><b>{pendingBookEntry.value}</b><small>{pendingBookEntry.time}</small>
                          </div>
                          <div className="book-choices">
                            {BOOKS.map((book) => <button key={book.id} type="button" onClick={() => recordBookEntry(book.id)}><span>{book.icon}</span><strong>{book.short}</strong></button>)}
                          </div>
                          {bookkeepingFeedback && <p className={bookkeepingFeedback.startsWith("Coach") ? "book-feedback wrong" : "book-feedback"} role="status">{bookkeepingFeedback}</p>}
                        </>
                      ) : (
                        <div className="books-complete"><span>✓</span><div><strong>Stamp, close, done.</strong><p>The shelf, cash tin, and books now tell the same story.</p></div></div>
                      )}
                    </section>
                    {booksComplete && (
                      <>
                        <div className="next-scene"><span>👣</span><p>{impact.next}</p></div>
                        <button className="primary-button" type="button" onClick={continueAfterImpact}>{impact.final ? "See how Amina's whole day went →" : "Open the door for the next neighbour →"}</button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {toolPanel && (
            <div className="interaction-scrim">
              <div className="tool-sheet pixel-panel" role="dialog" aria-modal="true" aria-label={`${toolPanel} panel`}>
                <button className="sheet-close" type="button" aria-label="Close tool" onClick={() => setToolPanel(null)}>×</button>

                {toolPanel === "inventory" && <><span className="eyebrow">Shelf and back room</span><h2>What can Amina actually reach for?</h2><p className="sheet-intro">The supplier&apos;s truck is not coming. When a packet leaves this shelf, the gap stays visible for the rest of the day.</p><div className="inventory-grid">{(Object.keys(PRODUCTS) as ProductKey[]).map((key) => <div key={key}><span>{PRODUCTS[key].icon}</span><strong>{inventory[key]}</strong><small>{PRODUCTS[key].label}</small></div>)}</div></>}

                {toolPanel === "ledger" && (
                  <>
                    <span className="eyebrow">The books on Amina&apos;s desk</span><h2>Does the paper match the shop?</h2>
                    <div className="books-summary"><div><span>🪙</span><small>Notes in cash tin</small><strong>{formatCash(metrics.cash)}</strong></div><div><span>📦</span><small>Items Amina can count</small><strong>{totalInventory} units</strong></div><div><span>🤝</span><small>Rehema&apos;s promise</small><strong>{formatCash(ledgerExposure)}</strong></div><div><span>✓</span><small>Marks made today</small><strong>{bookEntries.length}</strong></div></div>
                    {bookEntries.length === 0 ? <p className="empty-state">The opening balances are written. The next receipt or stock slip will leave a new mark on these pages.</p> : <div className="book-entry-list">{bookEntries.map((entry) => <article key={entry.id}><span>{entry.time}</span><div><strong>{entry.book}</strong><p>{entry.description}</p></div><b>{entry.value}</b></article>)}</div>}
                    <div className="ledger-rule"><strong>Before Amina locks the door</strong><p>The notes in the tin should match the cash book. The packets on the shelf should match the blue cards. Rehema&apos;s promise should match both copies of the agreement.</p></div>
                  </>
                )}

                {toolPanel === "coach" && (
                  <>
                    <span className="eyebrow">A voice from the ALP training</span><h2>Coach Zawadi sees the next connection</h2>
                    {deskGuidance ? <div className="coach-tool-guide"><small>{deskGuidance.lesson}</small><article><b>👀 Look at the counter</b><p>{deskGuidance.know}</p></article><article><b>↪ Think one step ahead</b><p>{deskGuidance.consider}</p></article><article><b>✎ Leave a paper trail</b><p>{deskGuidance.record}</p></article></div> : <p className="empty-state">The road outside is quiet again. Coach Zawadi is waiting in the closing reflection.</p>}
                    <p className="uncertainty-note">Zawadi will point out what matters, but she will not make Amina&apos;s choice for her.</p>
                  </>
                )}

                {toolPanel === "notebook" && <><span className="eyebrow">Amina&apos;s field notebook</span><h2>Things worth remembering tomorrow</h2><div className="notebook-list">{unlockedNotes.map((id, index) => <article key={id}><span>{index + 1}</span><div><strong>{NOTEBOOK[id].title}</strong><p>{NOTEBOOK[id].copy}</p></div></article>)}</div></>}
              </div>
            </div>
          )}

          {phase === "ending" && (
            <div className="screen-overlay ending-screen">
              <div className="ending-card pixel-panel">
                <div className="score-hero"><div className="score-seal"><strong>{balancedScore}</strong><span>/ 100</span></div><div><span className="ending-badge">The shutters are down</span><h1>{scoreGrade}</h1><p>No single number can tell the whole story. This one shows where Amina helped people, kept the shop honest, and carried her promises through the day.</p></div></div>
                <div className="score-breakdown" aria-label="Balanced Centre Score breakdown">
                  <div><span>🤝</span><small>Farmers helped</small><strong>{farmerScore}<em>/20</em></strong></div>
                  <div><span>📒</span><small>Books kept</small><strong>{bookkeepingScore}<em>/25</em></strong></div>
                  <div><span>📦</span><small>Shop kept steady</small><strong>{stewardshipScore}<em>/20</em></strong></div>
                  <div><span>🛡️</span><small>Risks handled</small><strong>{riskScore}<em>/20</em></strong></div>
                  <div><span>⏰</span><small>Made the demo</small><strong>{timeScore}<em>/15</em></strong></div>
                </div>
                <div className="closing-books"><span>✓</span><div><strong>The cash tin, shelf, and books agree</strong><p>{bookEntries.length} marks made today · {bookkeepingMistakes === 0 ? "Amina chose every book on the first try" : `Coach Zawadi helped redirect ${mistakenEntryIds.length} ${mistakenEntryIds.length === 1 ? "paper slip" : "paper slips"}`}.</p></div></div>
                <div className="achievement-row"><span>📒 Honest Books</span>{flags.creditStructured && <span>🤝 Clear Promise</span>}{flags.adviceChoice !== "sell" && <span>🌿 Farmer First</span>}{demoLateMinutes === 0 && <span>⏰ Beat the Bell</span>}</div>
                <div className="ending-stats"><div><span>Notes in cash tin</span><strong>{formatCash(metrics.cash)}</strong></div><div><span>Neighbour trust</span><strong>{metrics.trust}%</strong></div><div><span>Items on shelf</span><strong>{totalInventory}</strong></div><div><span>Rehema owes</span><strong>{formatCash(ledgerExposure)}</strong></div></div>
                <div className="community-return">
                  <article><span>🧑🏾‍🌾</span><div><strong>Rashidi</strong><p>{flags.rashidiQuantity === 5 ? "By sunset, all five packs are beside his nursery beds. He is pleased—but the empty space they left followed Amina into the afternoon." : flags.rashidiQuantity ? `He draws ${flags.rashidiQuantity} nursery beds instead of five and sends Amina a photo before the rain.` : "His folded notes never left his pocket. He asks Amina to call before the next rain if seed returns."}</p></div></article>
                  <article><span>👩🏿‍🌾</span><div><strong>Mama Rehema</strong><p>{creditOutcome}</p></div></article>
                  <article><span>🧑🏾‍🌾</span><div><strong>Juma</strong><p>{adviceOutcome}</p></div></article>
                  <article><span>👩🏾</span><div><strong>Neema and the demo group</strong><p>{demoLateMinutes > 0 ? `The group began without Amina and waited ${demoLateMinutes} minutes for her. ` : "Amina welcomed the group on time. "}{flags.neemaQuantity === 2 ? "The two interested farmers also leave with seed." : flags.neemaQuantity ? `Only ${flags.neemaQuantity} of the two farmers can take seed today.` : "No seed remains for the interested farmers."}</p></div></article>
                </div>
                <div className="ending-reflection"><span className="eyebrow">Coach Zawadi asks</span><p>Which moment stayed with you: Rashidi&apos;s folded notes, Rehema&apos;s written promise, Juma&apos;s wrapped leaf, or the farmers waiting at the model plot?</p></div>
                <div className="ending-actions"><button className="primary-button share-button" type="button" onClick={shareScore}>{scoreCopied ? "Market day ready to share ✓" : "Share this market day"}</button><button className="primary-button" type="button" onClick={replay}>Lift the shutters again ↻</button></div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
