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

type StoryLine = { speaker: string; icon: string; text: string };

type SaleCustomer = Position & {
  id: string;
  kind: "sale";
  name: string;
  icon: string;
  product: ProductKey;
  requested: number;
  opening: string;
  context: string;
  next: string;
};

type CreditCustomer = Position & {
  id: string;
  kind: "credit";
  name: string;
  icon: string;
  opening: string;
  next: string;
};

type AdviceCustomer = Position & {
  id: string;
  kind: "advice";
  name: string;
  icon: string;
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
  know: string;
  consider: string;
  record: string;
};

type Impact = {
  title: string;
  summary: string;
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
  { id: "Cash ledger", icon: "🪙", short: "Cash ledger" },
  { id: "Inventory card", icon: "📦", short: "Inventory card" },
  { id: "Customer credit ledger", icon: "🤝", short: "Credit ledger" },
  { id: "Expense ledger", icon: "🧾", short: "Expense ledger" },
  { id: "Follow-up log", icon: "📌", short: "Follow-up log" },
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
    text: "Today is the Centre's vuli market day and the model-farm gathering begins at three o'clock.",
  },
  {
    speaker: "Amina",
    icon: "👩🏾‍💼",
    text: "I counted eight seed packs and four fertilizer bags. No new delivery will arrive today.",
  },
  {
    speaker: "Neema",
    icon: "👩🏾",
    text: "Rashidi is bringing cash for five seed packs, and Mama Rehema asked whether credit might be possible.",
  },
  {
    speaker: "Amina",
    icon: "👩🏾‍💼",
    text: "Every item I give to one farmer will be unavailable to the next, and every conversation uses time.",
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
    opening: "Good morning, Amina. I brought cash for five tomato seed packs. We want to plant before the next rain.",
    context: "Mama Rehema is expected later and may need four seed packs as part of her package.",
    next: "As Rashidi leaves, Mama Rehema arrives with her farm records.",
    x: 36,
    y: 53,
  },
  {
    id: "rehema-credit",
    kind: "credit",
    name: "Mama Rehema",
    icon: "👩🏿‍🌾",
    opening: "I can pay TSh 220,000 today. My vegetable buyer pays next month. Can we agree on a package that my farm and your Centre can both manage?",
    next: "The morning continues. At 2:00 PM, Juma hurries in carrying a spotted tomato leaf.",
    x: 64,
    y: 51,
  },
  {
    id: "juma-advice",
    kind: "advice",
    name: "Juma",
    icon: "🧑🏾‍🌾",
    opening: "These spots appeared after the rain. A travelling seller says his cheap pesticide fixes everything. I need your advice before I spend my money.",
    next: "At 3:00 PM, the model-farm demonstration begins and Neema approaches with the final group request.",
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
    opening: "Two farmers at the demonstration want to try the tomato variety they saw. Do we still have two seed packs for them?",
    context: "This is the final planned seed request of the day.",
    next: "The doors close and the community reflects on how Amina handled the day.",
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
    label: "Starter package",
    explanation: "Covered by today's payment; no balance remains.",
    value: 220000,
    seed: 2,
    fertilizer: 1,
    drip: 0,
  },
  {
    id: "staged",
    label: "Staged package",
    explanation: "Useful now, with a smaller written balance for later.",
    value: 480000,
    seed: 3,
    fertilizer: 2,
    drip: 0,
  },
  {
    id: "large",
    label: "Large package",
    explanation: "More inputs now, but the Centre carries more risk.",
    value: 700000,
    seed: 4,
    fertilizer: 3,
    drip: 1,
  },
];

const NOTEBOOK: Record<string, { title: string; copy: string }> = {
  starting: {
    title: "One shelf serves many farmers",
    copy: "A sale can bring cash now while reducing what remains for the next customer. Known commitments make that trade-off easier to judge.",
  },
  credit: {
    title: "Good credit has boundaries",
    copy: "Past repayment, buyer information, package size, a written balance, and clear dates help both the farmer and the Centre.",
  },
  advice: {
    title: "Trust may require slowing down",
    copy: "Observation, safe products, and a useful referral can protect a farmer when the cause of a crop problem is uncertain.",
  },
};

const splitSentences = (text: string) =>
  text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [text];

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
  const [saleQuantity, setSaleQuantity] = useState(0);
  const [creditOptionId, setCreditOptionId] = useState<CreditOptionId>("staged");
  const [creditChecks, setCreditChecks] = useState({ ledger: false, buyer: false });
  const [adviceChecks, setAdviceChecks] = useState({ leaf: false, label: false, consultant: false });
  const [ledgerExposure, setLedgerExposure] = useState(0);
  const [toolPanel, setToolPanel] = useState<ToolPanel>(null);
  const [unlockedNotes, setUnlockedNotes] = useState<string[]>(["starting"]);
  const [flags, setFlags] = useState<StoryFlags>(INITIAL_FLAGS);
  const [impact, setImpact] = useState<Impact | null>(null);
  const [coachReady, setCoachReady] = useState(false);
  const [coachExpanded, setCoachExpanded] = useState(true);
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
  const totalInventory = Object.values(inventory).reduce((sum, value) => sum + value, 0);
  const creditDeposit = Math.min(220000, selectedCreditOption.value);
  const creditBalance = selectedCreditOption.value - creditDeposit;
  const creditTimeCost = 25 + Number(creditChecks.ledger) * 10 + Number(creditChecks.buyer) * 15;
  const adviceEvidenceCount = Number(adviceChecks.leaf) + Number(adviceChecks.label) + Number(adviceChecks.consultant);
  const adviceTimeCost = (choice: AdviceId) => (choice === "verify" ? 25 : choice === "sell" ? 15 : 20);
  const deadlineLabel = (finish: number) =>
    finish <= DEMO_DEADLINE
      ? `${formatTime(finish)} · ${DEMO_DEADLINE - finish} min early`
      : `${formatTime(finish)} · ${finish - DEMO_DEADLINE} min late`;
  const pendingBookEntry = impact?.bookkeeping[bookkeepingIndex];
  const booksComplete = Boolean(impact && bookkeepingIndex >= impact.bookkeeping.length);

  const guidanceFor = (customer: Customer): CoachGuidance => {
    if (customer.id === "rashidi-sale") {
      return {
        lesson: "BLF · Inventory Recordkeeping + Cash Ledger",
        know: `${inventory.seed} seed packs are on the shelf. Rashidi requests 5, and Rehema may need 4 later.`,
        consider: "Balance stock on hand, known customer demand, and the fact that no supplier delivery will arrive today.",
        record: "A cash sale needs a receipt, cash-ledger entry, and a reduction on the seed inventory card.",
      };
    }
    if (customer.kind === "credit") {
      return {
        lesson: "BLF · Credit for Customers",
        know: `Rehema can pay ${formatCash(220000)} today. The rest of the selected package becomes customer credit.`,
        consider: "Check repayment history and buyer evidence; keep the package, balance, and due dates manageable and written.",
        record: "Record the deposit as cash in, products released on inventory cards, and any unpaid balance in the customer credit ledger.",
      };
    }
    if (customer.kind === "advice") {
      const remaining = Math.max(0, DEMO_DEADLINE - minutes);
      return {
        lesson: "BLF · Managing Risk + Customer Care",
        know: `${remaining} minutes remain before the 3:00 PM demonstration. The cause of the leaf spots and the seller's product are not confirmed.`,
        consider: "Identify, assess, and reduce the highest risk. More evidence protects Juma, but every check uses preparation time.",
        record: "A sale changes cash and stock; an investigation cost changes cash and expenses; a referral creates no cash transaction.",
      };
    }
    return {
      lesson: "BLF · Inventory Reconciliation + Customer Care",
      know: `${inventory.seed} seed packs remain${demoLateMinutes ? `, and the demonstration began ${demoLateMinutes} minutes before Amina arrived` : ", and Amina reached the demonstration on time"}.`,
      consider: "Compare the physical shelf with the inventory card, then explain clearly what the Centre can fulfil.",
      record: inventory.seed > 0
        ? "A final cash sale needs a receipt, cash-ledger entry, and inventory-card reduction before closing the books."
        : "If no cash or stock moves, do not alter the cash or inventory ledgers; note the unfilled request for follow-up.",
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
      setBookkeepingFeedback(`Not this one. ${pendingBookEntry.lesson}`);
      playTone(360, 0.09);
      return;
    }
    setBookEntries((current) =>
      current.some((entry) => entry.id === pendingBookEntry.id) ? current : [...current, pendingBookEntry],
    );
    setBookkeepingIndex((current) => current + 1);
    setBookkeepingFeedback(`Recorded correctly in the ${book}.`);
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
    setCoachReady(false);
    setCoachExpanded(true);
    setPlayer({ x: customer.x, y: Math.min(84, customer.y + 9) });
    setToast("");
    if (customer.kind === "sale") {
      setSaleQuantity(Math.min(customer.requested, inventory[customer.product]));
    } else if (customer.kind === "credit") {
      setCreditOptionId("staged");
      setCreditChecks({ ledger: false, buyer: false });
    }
    playTone(760);
  };

  const finishEncounter = (customer: Customer, nextImpact: Impact) => {
    setCompletedIds((current) => [...current, customer.id]);
    setSelectedCustomer(null);
    setPlayer(START_POSITION);
    setBookkeepingIndex(0);
    setBookkeepingFeedback("");
    setImpact(nextImpact);
  };

  const completeSale = () => {
    if (!selectedCustomer || selectedCustomer.kind !== "sale") return;
    const customer = selectedCustomer;
    const quantity = Math.max(0, Math.min(saleQuantity, inventory[customer.product], customer.requested));
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

    const summary =
      quantity === customer.requested
        ? `${customer.name} receives the full request.`
        : quantity === 0
          ? `${customer.name} leaves without seed.`
          : `${customer.name} accepts ${quantity} of the ${customer.requested} requested packs.`;
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
            lesson: "Actual cash came into the business, so it belongs in the cash ledger.",
          },
          {
            id: `${customer.id}-stock`,
            time: transactionTime,
            book: "Inventory card",
            source: "Stock issue",
            description: `${PRODUCTS[customer.product].shortLabel} released · ${customer.name}`,
            value: `−${quantity} ${quantity === 1 ? "unit" : "units"}`,
            lesson: "Products physically left the shelf, so reduce the product's inventory card.",
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
            lesson: "No cash or stock moved. Note the unmet need for follow-up without changing the cash ledger.",
          },
        ];

    finishEncounter(customer, {
      title: "The shelf changes immediately",
      summary,
      next: customer.next,
      final: customer.id === CUSTOMERS.at(-1)?.id,
      changes: [
        { icon: "🌱", label: `${PRODUCTS[customer.product].shortLabel} on shelf`, before: `${beforeStock}`, after: `${afterStock}`, tone: afterStock < beforeStock ? "negative" : "neutral" },
        { icon: "🪙", label: "Centre cash", before: formatCashImpact(beforeCash), after: formatCashImpact(beforeCash + revenue), tone: revenue > 0 ? "positive" : "neutral" },
        { icon: "🕒", label: "Time", before: formatTime(minutes), after: formatTime(minutes + timeCost), tone: "neutral" },
        { icon: "💚", label: "Farmer trust", before: `${beforeTrust}%`, after: `${Math.max(0, Math.min(100, beforeTrust + trustChange))}%`, tone: trustChange > 0 ? "positive" : trustChange < 0 ? "negative" : "neutral" },
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
        lesson: "Only the money received today is cash inflow. The unpaid amount does not enter the cash ledger yet.",
      },
      {
        id: "rehema-credit-stock",
        time: transactionTime,
        book: "Inventory card",
        source: "Signed stock release",
        description: `Package issued · ${stockDescription}`,
        value: `−${option.seed + option.fertilizer + option.drip} units`,
        lesson: "The full package leaves physical stock today, even though some payment may arrive later.",
      },
      ...(creditBalance > 0
        ? [{
            id: "rehema-credit-balance",
            time: transactionTime,
            book: "Customer credit ledger" as BookKind,
            source: "Written credit agreement",
            description: "Outstanding balance · Mama Rehema",
            value: formatCash(creditBalance),
            lesson: "Customer credit is recorded in the credit ledger until it is repaid; it is not cash inflow today.",
          }]
        : []),
    ];

    finishEncounter(customer, {
      title: "The package affects stock and the ledger",
      summary:
        creditBalance === 0
          ? "Rehema leaves with a smaller package and no debt."
          : structured
            ? "Amina records a manageable package, buyer, balance, and repayment dates."
            : "Rehema receives the package, but the Centre carries an uncertain balance.",
      next: customer.next,
      final: false,
      changes: [
        { icon: "🌱", label: "Seed on shelf", before: `${inventory.seed}`, after: `${inventory.seed - option.seed}`, tone: "negative" },
        { icon: "🪙", label: "Cash received today", before: formatCashImpact(beforeCash), after: formatCashImpact(beforeCash + creditDeposit), tone: "positive" },
        { icon: "📒", label: "Credit still owed", before: formatCash(beforeExposure), after: formatCash(beforeExposure + creditBalance), tone: creditBalance > 0 ? "negative" : "neutral" },
        { icon: "🕒", label: "Time", before: formatTime(minutes), after: formatTime(minutes + creditTimeCost), tone: "neutral" },
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
        ? "Amina delays the sale and gathers evidence before recommending anything."
        : choice === "sell"
          ? "Amina makes a quick sale before confirming what caused the spots."
          : adviceChecks.consultant
            ? "Amina sends Juma's photos directly to the BLF agronomist for follow-up."
            : "Amina tells Juma to seek help elsewhere without arranging the connection.";
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
            lesson: "Juma paid cash, so record the inflow in the cash ledger and issue a receipt.",
          },
          {
            id: "juma-advice-stock",
            time: transactionTime,
            book: "Inventory card",
            source: "Stock issue",
            description: "Crop-care product released · Juma",
            value: "−1 unit",
            lesson: "A product left the shelf, so the crop-care inventory card must also decrease.",
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
              lesson: "Cash left the business, so record the outflow in the cash ledger.",
            },
            {
              id: "juma-advice-expense",
              time: transactionTime,
              book: "Expense ledger",
              source: "Assessment receipt",
              description: "Crop assessment service · Juma",
              value: formatCash(40000),
              lesson: "The assessment is a day-to-day business cost, so classify it in the expense ledger too.",
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
              lesson: "No money or product changed hands. Track the promised follow-up without changing the cash ledger.",
            },
          ];

    finishEncounter(customer, {
      title: lateMinutes > 0 ? "The safer work has a deadline cost" : "The decision protects the demonstration time",
      summary: `${summary} Amina finishes ${deadlineResult}.`,
      next: lateMinutes > 0
        ? `The model-farm demonstration started ${lateMinutes} minutes ago. Neema is already with the waiting group.`
        : customer.next,
      final: false,
      changes: [
        { icon: "🪙", label: "Centre cash", before: formatCashImpact(beforeCash), after: formatCashImpact(Math.max(0, beforeCash + cashChange)), tone: cashChange > 0 ? "positive" : cashChange < 0 ? "negative" : "neutral" },
        { icon: "🧪", label: "Crop-care stock", before: `${beforeCropCare}`, after: `${Math.max(0, beforeCropCare + cropCareChange)}`, tone: cropCareChange < 0 ? "negative" : "neutral" },
        { icon: "🕒", label: "Time", before: formatTime(minutes), after: formatTime(finishTime), tone: lateMinutes > 0 ? "negative" : "neutral" },
        { icon: "⏰", label: "3:00 PM demo", before: `${Math.max(0, DEMO_DEADLINE - minutes)} min left`, after: deadlineResult, tone: lateMinutes > 0 ? "negative" : "positive" },
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
    setSaleQuantity(0);
    setCreditOptionId("staged");
    setCreditChecks({ ledger: false, buyer: false });
    setAdviceChecks({ leaf: false, label: false, consultant: false });
    setLedgerExposure(0);
    setToolPanel(null);
    setUnlockedNotes(["starting"]);
    setFlags(INITIAL_FLAGS);
    setImpact(null);
    setCoachReady(false);
    setCoachExpanded(true);
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
    ? "Trusted Centre Leader"
    : balancedScore >= 75
      ? "Strong Market-Day Manager"
      : balancedScore >= 60
        ? "Developing Agribusiness Retailer"
        : "Another market day recommended";

  const shareScore = async () => {
    const text = `Kijani Centre · ${balancedScore}/100 · ${scoreGrade}\nFarmer value ${farmerScore}/20 · Bookkeeping ${bookkeepingScore}/25 · Stewardship ${stewardshipScore}/20 · Risk ${riskScore}/20 · Time ${timeScore}/15`;
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
      ? "Rehema leaves with a smaller package fully covered by her payment. She knows exactly what she can use now."
      : flags.creditStructured
        ? "Rehema's buyer confirms the staged dates. Both Rehema and Amina leave with a clear written plan."
        : flags.creditOption
          ? "Rehema receives useful inputs, but a large or weakly checked balance remains in Amina's ledger."
          : "Rehema's request was not completed.";

  const adviceOutcome =
    flags.adviceChoice === "verify"
      ? flags.adviceEvidence >= 2
        ? "The agronomist's reply points to nutrient stress, not the disease Juma feared. He avoids an unnecessary pesticide."
        : "Juma appreciates that Amina did not guess, although the final answer still requires follow-up."
      : flags.adviceChoice === "sell"
        ? "At the demonstration, Juma learns the quick pesticide sale did not match the likely problem. Other farmers hear the story."
        : flags.adviceChoice === "refer" && flags.adviceEvidence >= 1
          ? "The warm referral reaches Juma before the demonstration and gives him a practical next step."
          : "Juma was protected from an uncertain sale, but the referral gave him no direct path to help.";

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
                <p className="game-subtitle">Live one connected market day. Serve farmers, manage limited stock and credit, give responsible advice, and see every decision return later.</p>
                <div className="mission-preview">
                  <strong>Today&apos;s goal · build a balanced Centre</strong>
                  <p>Serve farmers responsibly, keep accurate books, manage stock and risk, and reach the 3:00 PM demonstration.</p>
                  <div><span>🤝 Farmer value · 20</span><span>📒 Books · 25</span><span>📦 Stewardship · 20</span><span>🛡️ Risk · 20</span><span>⏰ Time · 15</span></div>
                </div>
                <div className="title-details">
                  <span>🗓️ One market day</span>
                  <span>👥 Four connected encounters</span>
                  <span>⚖️ Visible trade-offs</span>
                </div>
                <button className="primary-button start-button" type="button" onClick={startDay}>Begin market day</button>
                <p className="small-note">There is no perfect route. Try to keep the Centre useful, solvent, and trusted.</p>
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
                <span title="Farmer trust">💚 <strong>{metrics.trust}%</strong></span>
                <span title="Credit still owed">📒 <strong>{formatCash(ledgerExposure)}</strong></span>
              </div>
              <button className="icon-button" type="button" aria-label={soundOn ? "Turn sound off" : "Turn sound on"} onClick={() => setSoundOn((current) => !current)}>{soundOn ? "🔊" : "🔇"}</button>
            </header>
          )}

          {phase === "briefing" && (
            <div className="screen-overlay morning-screen">
              <div className="morning-card pixel-panel">
                <div className="morning-heading">
                  <span className="morning-icon" aria-hidden="true">🌅</span>
                  <div><span className="eyebrow">7:30 AM · Before opening</span><h1>Vuli market day</h1><p>One day · four connected challenges</p></div>
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
                <span className="eyebrow">Today&apos;s story</span>
                <h1>{currentCustomer ? `Chapter ${completedIds.length + 1} of ${CUSTOMERS.length}` : "Market day complete"}</h1>
                <p>{currentCustomer ? "One situation at a time. Listen first, then decide." : "Every planned encounter has been handled."}</p>

                {currentCustomer && (
                  <div className="visitor-list current-visitor">
                    <button type="button" onClick={() => openCustomer(currentCustomer)}>
                      <span>{currentCustomer.icon}</span>
                      <span><strong>{currentCustomer.name}</strong><small>{currentCustomer.kind === "sale" ? "Purchase request" : currentCustomer.kind === "credit" ? "Credit request" : "Crop advice"}</small></span>
                      <b>Talk →</b>
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
                  <button type="button" onClick={() => setToolPanel("coach")}><span>📱</span><strong>ALP Coach</strong><small>Current lesson</small></button>
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
                <div className="conversation-heading"><span>{selectedCustomer.icon}</span><div><span className="eyebrow">At the counter · {formatTime(minutes)}</span><h2>{selectedCustomer.name}</h2><p>{customerLineIndex < customerLines.length ? "Listen to the request before deciding what to do." : "Now choose how Amina will respond."}</p></div></div>

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
                      <section className={`decision-coach ${coachReady && !coachExpanded ? "collapsed" : ""}`} aria-label="ALP Coach decision guide">
                        <div className="coach-heading"><span>📱</span><div><small>{selectedGuidance.lesson}</small><strong>ALP Coach · before you decide</strong></div></div>
                        {coachExpanded ? (
                          <>
                            <div className="coach-checks">
                              <article><b>1</b><div><strong>What you know</strong><p>{selectedGuidance.know}</p></div></article>
                              <article><b>2</b><div><strong>What to consider</strong><p>{selectedGuidance.consider}</p></div></article>
                              <article><b>3</b><div><strong>What to record</strong><p>{selectedGuidance.record}</p></div></article>
                            </div>
                            <button className="coach-ready-button" type="button" onClick={() => { setCoachReady(true); setCoachExpanded(false); playTone(790, 0.08); }}>{coachReady ? "Hide hints and continue" : "I understand · show my choices →"}</button>
                          </>
                        ) : (
                          <button className="coach-review-button" type="button" onClick={() => setCoachExpanded(true)}>📱 Review the three decision checks</button>
                        )}
                      </section>
                    )}

                    {coachReady && selectedCustomer.kind === "sale" && (
                      <div className="sale-builder">
                        <div className="known-context"><span>📌</span><div><strong>What Amina already knows</strong><p>{selectedCustomer.id === "neema-finale" && demoLateMinutes > 0 ? `Amina reached the demonstration ${demoLateMinutes} minutes late. The waiting group noticed, and this is the final seed request today.` : selectedCustomer.context}</p></div></div>
                        <div className="stock-snapshot"><span>{PRODUCTS[selectedCustomer.product].icon}</span><div><small>On the shelf now</small><strong>{inventory[selectedCustomer.product]} {PRODUCTS[selectedCustomer.product].shortLabel.toLowerCase()} units</strong></div><div><small>Requested</small><strong>{selectedCustomer.requested}</strong></div></div>
                        <label htmlFor="sale-quantity">Quantity to sell <strong>{saleQuantity}</strong></label>
                        <input id="sale-quantity" type="range" min="0" max={Math.min(selectedCustomer.requested, inventory[selectedCustomer.product])} value={saleQuantity} onChange={(event) => setSaleQuantity(Number(event.target.value))} />
                        <div className="live-tradeoff">
                          <span><small>Cash received</small><strong>+{formatCash(saleQuantity * PRODUCTS[selectedCustomer.product].price)}</strong></span>
                          <span><small>Stock remaining</small><strong>{inventory[selectedCustomer.product] - saleQuantity}</strong></span>
                          <span className={selectedCustomer.id === "rashidi-sale" && inventory.seed - saleQuantity < 4 ? "warning" : "good"}><small>{selectedCustomer.id === "rashidi-sale" ? "For Rehema later" : "Final shelf result"}</small><strong>{selectedCustomer.id === "rashidi-sale" ? inventory.seed - saleQuantity >= 4 ? "Enough for 4" : `${4 - (inventory.seed - saleQuantity)} short` : `${inventory.seed - saleQuantity} left`}</strong></span>
                          <span><small>Time after sale</small><strong>{formatTime(minutes + 25)}</strong></span>
                        </div>
                        <button className="primary-button" type="button" onClick={completeSale}>{saleQuantity === selectedCustomer.requested ? "Confirm full sale" : saleQuantity === 0 ? "Explain that no stock can be released" : `Offer ${saleQuantity} packs`}</button>
                      </div>
                    )}

                    {coachReady && selectedCustomer.kind === "credit" && (
                      <div className="credit-builder">
                        <div className="evidence-desk">
                          <button type="button" className={creditChecks.ledger ? "checked" : ""} onClick={() => setCreditChecks((current) => ({ ...current, ledger: true }))}><span>📒</span><strong>Check repayment record</strong><small>{creditChecks.ledger ? "Two smaller balances were repaid on time." : "+10 minutes"}</small></button>
                          <button type="button" className={creditChecks.buyer ? "checked" : ""} onClick={() => setCreditChecks((current) => ({ ...current, buyer: true }))}><span>📞</span><strong>Confirm the buyer</strong><small>{creditChecks.buyer ? "The buyer confirms a smaller vegetable order." : "+15 minutes"}</small></button>
                        </div>
                        <span className="section-label">Choose a package—not a random quantity</span>
                        <div className="package-grid simple-packages">
                          {CREDIT_OPTIONS.map((option) => {
                            const feasible = packageIsFeasible(option);
                            return <button key={option.id} type="button" disabled={!feasible} className={creditOptionId === option.id ? "selected" : ""} onClick={() => setCreditOptionId(option.id)}><strong>{option.label}</strong><span>{formatCash(option.value)}</span><small>{option.explanation}</small><em>{option.seed} seed · {option.fertilizer} fertilizer{option.drip ? ` · ${option.drip} drip` : ""}</em>{!feasible && <b>Not enough stock remains</b>}</button>;
                          })}
                        </div>
                        <div className="live-tradeoff">
                          <span><small>Seed after package</small><strong>{inventory.seed - selectedCreditOption.seed}</strong></span>
                          <span><small>Paid today</small><strong>+{formatCash(creditDeposit)}</strong></span>
                          <span className={creditBalance > 300000 ? "warning" : "good"}><small>Credit still owed</small><strong>{formatCash(creditBalance)}</strong></span>
                          <span><small>Time after checks</small><strong>{formatTime(minutes + creditTimeCost)}</strong></span>
                        </div>
                        <button className="primary-button" type="button" disabled={!packageIsFeasible()} onClick={completeCredit}>Agree, write the balance, and release stock</button>
                      </div>
                    )}

                    {coachReady && selectedCustomer.kind === "advice" && (
                      <div className="advice-builder">
                        <div className={`deadline-banner ${minutes >= DEMO_DEADLINE ? "late" : minutes >= DEMO_DEADLINE - 20 ? "warning" : ""}`} role="status">
                          <span>⏰</span><div><strong>Model-farm demonstration · 3:00 PM</strong><p>{minutes < DEMO_DEADLINE ? `${DEMO_DEADLINE - minutes} minutes remain. Every check advances the clock immediately.` : `The group has been waiting for ${minutes - DEMO_DEADLINE} minutes.`}</p></div><b>{formatTime(minutes)}</b>
                        </div>
                        <div className="evidence-desk three">
                          <button type="button" className={adviceChecks.leaf ? "checked" : ""} onClick={() => inspectAdvice("leaf", 10)}><span>🍃</span><strong>Inspect the leaf</strong><small>{adviceChecks.leaf ? "✓ The spots may have more than one cause." : "+10 min · look before deciding"}</small></button>
                          <button type="button" className={adviceChecks.label ? "checked" : ""} onClick={() => inspectAdvice("label", 10)}><span>🧪</span><strong>Read seller&apos;s label</strong><small>{adviceChecks.label ? "✓ Registration and batch details are missing." : "+10 min · check the product"}</small></button>
                          <button type="button" className={adviceChecks.consultant ? "checked" : ""} onClick={() => inspectAdvice("consultant", 20)}><span>📞</span><strong>Call the agronomist</strong><small>{adviceChecks.consultant ? "✓ She asks for photos and replies before the demo." : "+20 min · create a warm referral"}</small></button>
                        </div>
                        <span className="section-label">Choose what Amina does now</span>
                        <div className="advice-actions consequence-actions">
                          <button type="button" onClick={() => completeAdvice("verify")}><strong>Verify before recommending</strong><small>−TSh 40k · +{adviceTimeCost("verify")} min · {deadlineLabel(minutes + adviceTimeCost("verify"))}</small></button>
                          <button type="button" disabled={inventory.cropCare < 1} onClick={() => completeAdvice("sell")}><strong>Sell a product now</strong><small>+TSh 160k · +{adviceTimeCost("sell")} min · {deadlineLabel(minutes + adviceTimeCost("sell"))}</small></button>
                          <button type="button" onClick={() => completeAdvice("refer")}><strong>Refer Juma</strong><small>No sale · +{adviceTimeCost("refer")} min · {deadlineLabel(minutes + adviceTimeCost("refer"))}</small></button>
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
                <span className="eyebrow">Decision made · what changed?</span>
                <h2>{impact.title}</h2>
                <p className="impact-summary">{impact.summary}</p>
                <div className="impact-grid">
                  {impact.changes.map((change) => (
                    <div key={change.label} className={change.tone ?? "neutral"}><span>{change.icon}</span><small>{change.label}</small><div><del>{change.before}</del><b>→</b><strong>{change.after}</strong></div></div>
                  ))}
                </div>
                <section className="bookkeeping-practice" aria-label="Bookkeeping practice">
                  <div className="bookkeeping-heading"><div><span>📒</span><div><small>BLF bookkeeping procedure</small><strong>Close the loop before continuing</strong></div></div><b>{Math.min(bookkeepingIndex + 1, impact.bookkeeping.length)} / {impact.bookkeeping.length}</b></div>
                  {pendingBookEntry ? (
                    <>
                      <p>Where should Amina record this source document?</p>
                      <div className="source-document">
                        <span>{pendingBookEntry.source}</span><strong>{pendingBookEntry.description}</strong><b>{pendingBookEntry.value}</b><small>{pendingBookEntry.time}</small>
                      </div>
                      <div className="book-choices">
                        {BOOKS.map((book) => <button key={book.id} type="button" onClick={() => recordBookEntry(book.id)}><span>{book.icon}</span><strong>{book.short}</strong></button>)}
                      </div>
                      {bookkeepingFeedback && <p className={bookkeepingFeedback.startsWith("Not") ? "book-feedback wrong" : "book-feedback"} role="status">📱 {bookkeepingFeedback}</p>}
                    </>
                  ) : (
                    <div className="books-complete"><span>✓</span><div><strong>Books updated</strong><p>The records now agree with what changed in cash, stock, credit, expenses, or follow-up.</p></div></div>
                  )}
                </section>
                {booksComplete && (
                  <>
                    <div className="next-scene"><span>▶</span><p>{impact.next}</p></div>
                    <button className="primary-button" type="button" onClick={continueAfterImpact}>{impact.final ? "See my Balanced Centre Score →" : "Continue the story →"}</button>
                  </>
                )}
              </div>
            </div>
          )}

          {toolPanel && (
            <div className="interaction-scrim">
              <div className="tool-sheet pixel-panel" role="dialog" aria-modal="true" aria-label={`${toolPanel} panel`}>
                <button className="sheet-close" type="button" aria-label="Close tool" onClick={() => setToolPanel(null)}>×</button>

                {toolPanel === "inventory" && <><span className="eyebrow">Fixed stock for today</span><h2>What is actually on the shelf?</h2><p className="sheet-intro">No delivery arrives today. These are the items Amina must allocate across the people who visit.</p><div className="inventory-grid">{(Object.keys(PRODUCTS) as ProductKey[]).map((key) => <div key={key}><span>{PRODUCTS[key].icon}</span><strong>{inventory[key]}</strong><small>{PRODUCTS[key].label}</small></div>)}</div></>}

                {toolPanel === "ledger" && (
                  <>
                    <span className="eyebrow">Today&apos;s bookkeeping</span><h2>Do the books agree with the Centre?</h2>
                    <div className="books-summary"><div><span>🪙</span><small>Cash balance</small><strong>{formatCash(metrics.cash)}</strong></div><div><span>📦</span><small>Stock on hand</small><strong>{totalInventory} units</strong></div><div><span>🤝</span><small>Credit owed</small><strong>{formatCash(ledgerExposure)}</strong></div><div><span>✓</span><small>Entries posted</small><strong>{bookEntries.length}</strong></div></div>
                    {bookEntries.length === 0 ? <p className="empty-state">Opening cash and stock balances are ready. Completed decisions will create source documents to classify.</p> : <div className="book-entry-list">{bookEntries.map((entry) => <article key={entry.id}><span>{entry.time}</span><div><strong>{entry.book}</strong><p>{entry.description}</p></div><b>{entry.value}</b></article>)}</div>}
                    <div className="ledger-rule"><strong>Reconciliation rule</strong><p>At closing, recorded cash should agree with cash on hand, inventory cards with physical stock, and the credit ledger with balances still owed.</p></div>
                  </>
                )}

                {toolPanel === "coach" && (
                  <>
                    <span className="eyebrow">Guided learning</span><h2>The ALP Coach connects the current choice</h2>
                    {deskGuidance ? <div className="coach-tool-guide"><small>{deskGuidance.lesson}</small><article><b>What you know</b><p>{deskGuidance.know}</p></article><article><b>What to consider</b><p>{deskGuidance.consider}</p></article><article><b>What to record</b><p>{deskGuidance.record}</p></article></div> : <p className="empty-state">The market day is complete. Use the closing scorecard to compare outcomes across the whole day.</p>}
                    <p className="uncertainty-note">The Coach appears automatically after each request. It teaches the decision logic but leaves the trade-off to the player.</p>
                  </>
                )}

                {toolPanel === "notebook" && <><span className="eyebrow">Amina&apos;s field notebook</span><h2>Ideas discovered through play</h2><div className="notebook-list">{unlockedNotes.map((id, index) => <article key={id}><span>{index + 1}</span><div><strong>{NOTEBOOK[id].title}</strong><p>{NOTEBOOK[id].copy}</p></div></article>)}</div></>}
              </div>
            </div>
          )}

          {phase === "ending" && (
            <div className="screen-overlay ending-screen">
              <div className="ending-card pixel-panel">
                <div className="score-hero"><div className="score-seal"><strong>{balancedScore}</strong><span>/ 100</span></div><div><span className="ending-badge">Market day complete</span><h1>{scoreGrade}</h1><p>A balanced result rewards farmer value, accurate books, stewardship, responsible risk decisions, and time—not cash alone.</p></div></div>
                <div className="score-breakdown" aria-label="Balanced Centre Score breakdown">
                  <div><span>🤝</span><small>Farmer value</small><strong>{farmerScore}<em>/20</em></strong></div>
                  <div><span>📒</span><small>Bookkeeping</small><strong>{bookkeepingScore}<em>/25</em></strong></div>
                  <div><span>📦</span><small>Stewardship</small><strong>{stewardshipScore}<em>/20</em></strong></div>
                  <div><span>🛡️</span><small>Risk</small><strong>{riskScore}<em>/20</em></strong></div>
                  <div><span>⏰</span><small>Time</small><strong>{timeScore}<em>/15</em></strong></div>
                </div>
                <div className="closing-books"><span>✓</span><div><strong>Closing reconciliation complete</strong><p>{bookEntries.length} entries posted · {bookkeepingMistakes === 0 ? "Every record matched on the first attempt" : `${mistakenEntryIds.length} ${mistakenEntryIds.length === 1 ? "record needed" : "records needed"} an ALP Coach correction`} · Cash, stock, and customer credit records agree.</p></div></div>
                <div className="achievement-row"><span>📒 Books Balanced</span>{flags.creditStructured && <span>🤝 Fair Credit Partner</span>}{flags.adviceChoice !== "sell" && <span>🌿 Responsible Adviser</span>}{demoLateMinutes === 0 && <span>⏰ On-Time Facilitator</span>}</div>
                <div className="ending-stats"><div><span>Capital</span><strong>{formatCash(metrics.cash)}</strong></div><div><span>Trust</span><strong>{metrics.trust}%</strong></div><div><span>Stock left</span><strong>{totalInventory}</strong></div><div><span>Credit owed</span><strong>{formatCash(ledgerExposure)}</strong></div></div>
                <div className="community-return">
                  <article><span>🧑🏾‍🌾</span><div><strong>Rashidi</strong><p>{flags.rashidiQuantity === 5 ? "He planted with the full amount he requested, but five packs left the shelf early." : flags.rashidiQuantity ? `He adjusted his plan after receiving ${flags.rashidiQuantity} packs instead of five.` : "He left without seed and may try another retailer next time."}</p></div></article>
                  <article><span>👩🏿‍🌾</span><div><strong>Mama Rehema</strong><p>{creditOutcome}</p></div></article>
                  <article><span>🧑🏾‍🌾</span><div><strong>Juma</strong><p>{adviceOutcome}</p></div></article>
                  <article><span>👩🏾</span><div><strong>Neema and the demo group</strong><p>{demoLateMinutes > 0 ? `The group began without Amina and waited ${demoLateMinutes} minutes for her. ` : "Amina welcomed the group on time. "}{flags.neemaQuantity === 2 ? "The two interested farmers also leave with seed." : flags.neemaQuantity ? `Only ${flags.neemaQuantity} of the two farmers can take seed today.` : "No seed remains for the interested farmers."}</p></div></article>
                </div>
                <div className="ending-reflection"><span className="eyebrow">ALP Coach reflection</span><p>Which early choice changed the most later conversations: the first seed sale, the credit package, or the time spent checking Juma&apos;s problem?</p></div>
                <div className="ending-actions"><button className="primary-button share-button" type="button" onClick={shareScore}>{scoreCopied ? "Result ready to share ✓" : "Share my result"}</button><button className="primary-button" type="button" onClick={replay}>Replay differently ↻</button></div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
