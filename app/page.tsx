"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type Metrics = { cash: number; readiness: number; trust: number };
type ProductKey = "seed" | "fertilizer" | "cropCare" | "drip";
type Inventory = Record<ProductKey, number>;
type DemandRange = { min: number; max: number };
type DemandForecast = Record<ProductKey, DemandRange>;
type Position = { x: number; y: number };
type Phase = "title" | "morning" | "shop" | "evening" | "end";
type FocusId = "stocktake" | "followup" | "modelFarm";
type ToolPanel = "inventory" | "ledger" | "coach" | "notebook" | "supplier" | null;

type SaleCustomer = Position & {
  id: string;
  kind: "sale";
  name: string;
  icon: string;
  product: ProductKey;
  requested: number;
  opening: string;
};

type CreditCustomer = Position & {
  id: string;
  kind: "credit";
  name: string;
  icon: string;
  opening: string;
};

type AdviceCustomer = Position & {
  id: string;
  kind: "advice";
  name: string;
  icon: string;
  opening: string;
};

type Customer = SaleCustomer | CreditCustomer | AdviceCustomer;

type PendingOutcome = {
  id: string;
  dueDay: number;
  title: string;
  copy: string;
  effects: Partial<Metrics>;
};

type DayLog = {
  day: string;
  focus: string;
  served: number;
  missed: number;
  cashDelta: number;
  trustDelta: number;
  readinessDelta: number;
  notes: string[];
};

type CreditPackageId = "starter" | "contracted" | "full";
type AdviceId = "verify" | "sell" | "refer";

const INITIAL_METRICS: Metrics = { cash: 4800000, readiness: 48, trust: 68 };
const INITIAL_INVENTORY: Inventory = { seed: 12, fertilizer: 8, cropCare: 4, drip: 2 };
const START_POSITION: Position = { x: 51, y: 77 };
const PRODUCT_KEYS: ProductKey[] = ["seed", "fertilizer", "cropCare", "drip"];

const PRODUCTS: Record<
  ProductKey,
  { label: string; shortLabel: string; icon: string; cost: number; price: number }
> = {
  seed: { label: "Vegetable seed packs", shortLabel: "Seed", icon: "🌱", cost: 60000, price: 95000 },
  fertilizer: { label: "Fertilizer bags", shortLabel: "Fertilizer", icon: "🧺", cost: 95000, price: 140000 },
  cropCare: { label: "Registered crop-care units", shortLabel: "Crop care", icon: "🧪", cost: 50000, price: 80000 },
  drip: { label: "Drip-line kits", shortLabel: "Drip kits", icon: "💧", cost: 75000, price: 120000 },
};

const DAYS = [
  {
    date: "Mon · 2 Oct",
    time: "7:05 AM",
    weather: "☀️ 24°",
    title: "Opening week",
    briefing: "Registered farmers are preparing for vuli. Rain timing is uncertain and Arusha transport is costly.",
  },
  {
    date: "Wed · 4 Oct",
    time: "7:20 AM",
    weather: "⛅ 26°",
    title: "Credit and cash flow",
    briefing: "A loyal farmer needs a larger input package, while ordinary shop sales continue.",
  },
  {
    date: "Mon · 9 Oct",
    time: "6:55 AM",
    weather: "🌦️ 23°",
    title: "The rain signal",
    briefing: "Farmers react to the latest forecast. Seed demand may surge—or remain cautious.",
  },
  {
    date: "Fri · 13 Oct",
    time: "8:10 AM",
    weather: "🌧️ 22°",
    title: "Advice under pressure",
    briefing: "A crop problem arrives before the model-farm demonstration. A quick sale could be tempting.",
  },
  {
    date: "Sat · 14 Oct",
    time: "7:30 AM",
    weather: "🌤️ 25°",
    title: "Demo and market day",
    briefing: "Promises, credit, and agronomic advice return as community word-of-mouth reaches the Centre.",
  },
];

const SEASONS = [
  {
    name: "Late rain",
    demandBoost: 2,
    reveal: "Useful rain is now expected 10–16 days late. Farmers buy carefully, but demand has not disappeared.",
  },
  {
    name: "Early showers",
    demandBoost: 7,
    reveal: "Two early showers bring planting forward. Farmers arrive quickly and seed demand jumps.",
  },
  {
    name: "Uneven rain",
    demandBoost: 4,
    reveal: "Rain begins unevenly across nearby villages. Demand is strong in some routes and cautious in others.",
  },
];

const MORNING_FOCUSES: Array<{
  id: FocusId;
  icon: string;
  label: string;
  copy: string;
  effect: string;
}> = [
  {
    id: "stocktake",
    icon: "📦",
    label: "Count stock before Musa's truck",
    copy: "Check every shelf and join today's shared delivery route.",
    effect: "Clear stock numbers, lower transport cost; +3 readiness.",
  },
  {
    id: "followup",
    icon: "🤝",
    label: "Call farmer clients",
    copy: "Follow up on plans, buyers, and expected payments.",
    effect: "+3 trust; stronger information for customer credit.",
  },
  {
    id: "modelFarm",
    icon: "🌿",
    label: "Prepare the model farm",
    copy: "Spend the morning checking the demonstration plot.",
    effect: "+5 readiness; stronger evidence for crop advice.",
  },
];

const CREDIT_PACKAGES: Array<{
  id: CreditPackageId;
  label: string;
  value: number;
  seed: number;
  fertilizer: number;
  drip: number;
}> = [
  { id: "starter", label: "Starter package", value: 220000, seed: 2, fertilizer: 1, drip: 0 },
  { id: "contracted", label: "Contracted-area package", value: 540000, seed: 4, fertilizer: 3, drip: 1 },
  { id: "full", label: "Full-hectare package", value: 860000, seed: 6, fertilizer: 5, drip: 2 },
];

const NOTES: Record<string, { title: string; copy: string }> = {
  starting: {
    title: "Stock uses business cash",
    copy: "Stock can serve future customers, but money used for stock cannot pay another bill today.",
  },
  supplier: {
    title: "Use records to decide how much to order",
    copy: "Compare stock on the shelf with recent sales, seasonal demand, and a small buffer. More stock may prevent shortages, but it also uses cash.",
  },
  credit: {
    title: "Customer credit needs a living ledger",
    copy: "Package size, deposits, verified cash flow, payment dates, and follow-up all shape exposure.",
  },
  advice: {
    title: "A trusted retailer sometimes delays a sale",
    copy: "Observation, diagnosis, product quality, safe use, and referral protect both the farmer and the Centre.",
  },
};

const emptyForecast = (): DemandForecast => ({
  seed: { min: 0, max: 0 },
  fertilizer: { min: 0, max: 0 },
  cropCare: { min: 0, max: 0 },
  drip: { min: 0, max: 0 },
});

const addDemand = (
  forecast: DemandForecast,
  key: ProductKey,
  min: number,
  max = min,
) => {
  forecast[key].min += min;
  forecast[key].max += max;
};

function futureDemandAfterDay(
  dayIndex: number,
  demandBoost: number,
  hasFarmerCalls: boolean,
): DemandForecast {
  const forecast = emptyForecast();
  const rainSignalKnown = dayIndex >= 2;
  const rainMin = rainSignalKnown ? demandBoost : hasFarmerCalls ? Math.max(2, demandBoost - 1) : 2;
  const rainMax = rainSignalKnown ? demandBoost : hasFarmerCalls ? Math.min(7, demandBoost + 1) : 7;

  if (dayIndex < 1) {
    addDemand(forecast, "seed", 4);
    addDemand(forecast, "seed", 2, 6);
    addDemand(forecast, "fertilizer", 1, 5);
    addDemand(forecast, "drip", 0, 2);
  }

  if (dayIndex < 2) {
    addDemand(forecast, "seed", 5 + rainMin, 5 + rainMax);
    addDemand(forecast, "fertilizer", 5);
  }

  if (dayIndex < 3) addDemand(forecast, "cropCare", 2);

  if (dayIndex < 4) {
    addDemand(forecast, "seed", 4 + Math.floor(rainMin / 2), 4 + Math.floor(rainMax / 2));
    addDemand(forecast, "fertilizer", 4);
  }

  return forecast;
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const applyEffects = (metrics: Metrics, effects: Partial<Metrics>): Metrics => ({
  cash: Math.max(0, metrics.cash + (effects.cash ?? 0)),
  readiness: clampPercent(metrics.readiness + (effects.readiness ?? 0)),
  trust: clampPercent(metrics.trust + (effects.trust ?? 0)),
});

const formatCash = (amount: number) => {
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1000000) return `${sign}TSh ${(absolute / 1000000).toFixed(1)}m`;
  return `${sign}TSh ${Math.round(absolute / 1000)}k`;
};

const formatDelta = (value: number, cash = false) => {
  if (value === 0) return "No change";
  if (cash) return `${value > 0 ? "+" : ""}${formatCash(value)}`;
  return `${value > 0 ? "+" : ""}${value}`;
};

const formatDemandRange = ({ min, max }: DemandRange) => (min === max ? `${min}` : `${min}–${max}`);

function customersForDay(dayIndex: number, demandBoost: number): Customer[] {
  if (dayIndex === 0) {
    return [
      {
        id: "rashidi-seed",
        kind: "sale",
        name: "Rashidi",
        icon: "🧑🏾‍🌾",
        product: "seed",
        requested: 5,
        opening: "I registered after the model-farm day. Can I take five tomato seed packs today?",
        x: 35,
        y: 52,
      },
      {
        id: "zawadi-fertilizer",
        kind: "sale",
        name: "Zawadi",
        icon: "👩🏿‍🌾",
        product: "fertilizer",
        requested: 3,
        opening: "My vegetable beds are ready. I need three fertilizer bags before I cycle home.",
        x: 69,
        y: 54,
      },
    ];
  }

  if (dayIndex === 1) {
    return [
      {
        id: "rehema-credit",
        kind: "credit",
        name: "Mama Rehema",
        icon: "👩🏿‍🌾",
        opening: "I can pay TSh 220,000 today. My Tarime buyer pays after harvest. Can we build an input package together?",
        x: 36,
        y: 53,
      },
      {
        id: "baraka-seed",
        kind: "sale",
        name: "Baraka",
        icon: "🧑🏾",
        product: "seed",
        requested: 4,
        opening: "Four watermelon seed packs, please. I have cash and need to reach the field before noon.",
        x: 70,
        y: 49,
      },
    ];
  }

  if (dayIndex === 2) {
    return [
      {
        id: "asha-rain-seed",
        kind: "sale",
        name: "Asha",
        icon: "👩🏾",
        product: "seed",
        requested: 5 + demandBoost,
        opening: "Our farmer group pooled cash after the forecast. How many seed packs can you release?",
        x: 34,
        y: 52,
      },
      {
        id: "omari-fertilizer",
        kind: "sale",
        name: "Omari",
        icon: "👨🏿‍🌾",
        product: "fertilizer",
        requested: 5,
        opening: "The soil is prepared and the ox-cart is here. I came for five fertilizer bags.",
        x: 69,
        y: 53,
      },
    ];
  }

  if (dayIndex === 3) {
    return [
      {
        id: "juma-advice",
        kind: "advice",
        name: "Juma",
        icon: "🧑🏾‍🌾",
        opening: "These spots appeared after the rain. A travelling seller says his cheap pesticide fixes everything. What should I do?",
        x: 36,
        y: 52,
      },
      {
        id: "nuru-cropcare",
        kind: "sale",
        name: "Nuru",
        icon: "👩🏽‍🌾",
        product: "cropCare",
        requested: 2,
        opening: "I need two registered crop-care units from your usual supplier, with the safe-use instructions.",
        x: 69,
        y: 52,
      },
    ];
  }

  return [
    {
      id: "halima-seed",
      kind: "sale",
      name: "Halima",
      icon: "👩🏿",
      product: "seed",
      requested: 4 + Math.floor(demandBoost / 2),
      opening: "The demo-day visitors want to plant what they saw. I am collecting seed for our group.",
      x: 35,
      y: 52,
    },
    {
      id: "cooperative-fertilizer",
      kind: "sale",
      name: "Village cooperative",
      icon: "👥",
      product: "fertilizer",
      requested: 4,
      opening: "We have one cart and cash from four members. Can you fill our fertilizer order?",
      x: 69,
      y: 52,
    },
  ];
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("title");
  const [seasonNumber, setSeasonNumber] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [inventory, setInventory] = useState<Inventory>(INITIAL_INVENTORY);
  const [resolvedCustomers, setResolvedCustomers] = useState<string[]>([]);
  const [servedCustomerIds, setServedCustomerIds] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [saleQuantity, setSaleQuantity] = useState(0);
  const [morningFocus, setMorningFocus] = useState<FocusId | null>(null);
  const [activeFocus, setActiveFocus] = useState<FocusId | null>(null);
  const [toolPanel, setToolPanel] = useState<ToolPanel>(null);
  const [dayStartMetrics, setDayStartMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [dayNotes, setDayNotes] = useState<string[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [pendingOutcomes, setPendingOutcomes] = useState<PendingOutcome[]>([]);
  const [morningNews, setMorningNews] = useState<string[]>([]);
  const [farmersServed, setFarmersServed] = useState(0);
  const [player, setPlayer] = useState<Position>(START_POSITION);
  const [toast, setToast] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [orderDraft, setOrderDraft] = useState<Inventory>({ seed: 0, fertilizer: 0, cropCare: 0, drip: 0 });
  const [reserveDraft, setReserveDraft] = useState(false);
  const [reserveStatus, setReserveStatus] = useState<"none" | "held" | "delivered" | "released">("none");
  const [stocktakeActive, setStocktakeActive] = useState(false);
  const [followupDays, setFollowupDays] = useState(0);
  const [modelFarmDays, setModelFarmDays] = useState(0);
  const [creditPackageId, setCreditPackageId] = useState<CreditPackageId>("contracted");
  const [creditTerms, setCreditTerms] = useState<"staged" | "harvest">("staged");
  const [creditChecks, setCreditChecks] = useState({ ledger: false, contract: false });
  const [adviceChecks, setAdviceChecks] = useState({ leaf: false, label: false, consultant: false });
  const [unlockedNotes, setUnlockedNotes] = useState<string[]>(["starting"]);
  const audioRef = useRef<AudioContext | null>(null);

  const season = SEASONS[seasonNumber % SEASONS.length];
  const day = DAYS[dayIndex];
  const customers = useMemo(
    () => customersForDay(dayIndex, season.demandBoost),
    [dayIndex, season.demandBoost],
  );
  const unresolvedCustomers = customers.filter((customer) => !resolvedCustomers.includes(customer.id));
  const selectedCreditPackage = CREDIT_PACKAGES.find((item) => item.id === creditPackageId) ?? CREDIT_PACKAGES[1];
  const transportFee = stocktakeActive ? 240000 : 320000;
  const orderUnits = Object.values(orderDraft).reduce((sum, value) => sum + value, 0);
  const orderProductCost = (Object.keys(orderDraft) as ProductKey[]).reduce(
    (sum, key) => sum + orderDraft[key] * PRODUCTS[key].cost,
    0,
  );
  const orderTotal = orderProductCost + (orderUnits > 0 ? transportFee : 0) + (reserveDraft ? 120000 : 0);
  const todayDemand = emptyForecast();
  unresolvedCustomers.forEach((customer) => {
    if (customer.kind === "sale") addDemand(todayDemand, customer.product, customer.requested);
    if (customer.kind === "credit") {
      addDemand(todayDemand, "seed", 2, 6);
      addDemand(todayDemand, "fertilizer", 1, 5);
      addDemand(todayDemand, "drip", 0, 2);
    }
  });
  const demandForecast = futureDemandAfterDay(dayIndex, season.demandBoost, followupDays > 0);
  PRODUCT_KEYS.forEach((key) => {
    addDemand(demandForecast, key, todayDemand[key].min, todayDemand[key].max);
  });
  const forecastSource = dayIndex >= 2
    ? "The rain signal is now known, so the range is narrower."
    : followupDays > 0
      ? "Farmer calls sharpen the estimate, but rain timing still creates a range."
      : "Based on registrations, recent vuli sales, the waiting queue, and uncertain rain timing.";

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
        // Audio is decorative.
      }
    },
    [soundOn],
  );

  const unlockNote = (id: string) => {
    setUnlockedNotes((current) => (current.includes(id) ? current : [...current, id]));
  };

  const addDayNote = (note: string) => {
    setDayNotes((current) => [...current, note]);
    setToast(note);
  };

  const startSeason = () => {
    playTone(640, 0.12);
    setPhase("morning");
    setMorningNews(["The Centre opens with limited shelf stock and TSh 4.8m in working capital."]);
  };

  const beginDay = () => {
    if (!morningFocus) return;
    if (dayIndex >= 2 && reserveStatus === "held") return;
    playTone(700, 0.1);
    setDayStartMetrics(metrics);
    let nextMetrics = metrics;
    let focusNote = "";

    if (morningFocus === "stocktake") {
      nextMetrics = applyEffects(metrics, { readiness: 3 });
      setStocktakeActive(true);
      focusNote = "Counted every shelf and joined Musa's shared delivery route for a lower transport cost.";
    } else if (morningFocus === "followup") {
      nextMetrics = applyEffects(metrics, { trust: 3 });
      setFollowupDays((current) => current + 1);
      focusNote = "Called farmer clients and clarified plans, buyers, and payment timing.";
    } else {
      nextMetrics = applyEffects(metrics, { readiness: 5 });
      setModelFarmDays((current) => current + 1);
      focusNote = "Prepared the model farm and inspected crop conditions before opening.";
    }

    setMetrics(nextMetrics);
    setDayNotes([focusNote]);
    setActiveFocus(morningFocus);
    setPhase("shop");
    setMorningFocus(null);
    setMorningNews([]);
    setToast("The doors are open. You decide who to serve and when to close.");
  };

  const openCustomer = (customer: Customer) => {
    if (resolvedCustomers.includes(customer.id)) return;
    playTone(760);
    setSelectedCustomer(customer);
    setPlayer({ x: customer.x, y: Math.min(84, customer.y + 9) });
    setToast("");
    if (customer.kind === "sale") {
      setSaleQuantity(Math.min(customer.requested, inventory[customer.product]));
    }
    if (customer.kind === "credit") {
      setCreditPackageId("contracted");
      setCreditTerms("staged");
      setCreditChecks({ ledger: false, contract: false });
    }
    if (customer.kind === "advice") {
      setAdviceChecks({ leaf: false, label: false, consultant: false });
    }
  };

  const markResolved = (customer: Customer, served = true) => {
    setResolvedCustomers((current) => (current.includes(customer.id) ? current : [...current, customer.id]));
    if (served) {
      setServedCustomerIds((current) => (current.includes(customer.id) ? current : [...current, customer.id]));
      setFarmersServed((current) => current + 1);
    }
    setSelectedCustomer(null);
    setPlayer(START_POSITION);
  };

  const completeSale = () => {
    if (!selectedCustomer || selectedCustomer.kind !== "sale") return;
    const customer = selectedCustomer;
    const quantity = Math.max(0, Math.min(saleQuantity, inventory[customer.product], customer.requested));
    const revenue = quantity * PRODUCTS[customer.product].price;
    const trustChange = quantity === customer.requested ? 2 : quantity === 0 ? -3 : 0;

    setInventory((current) => ({ ...current, [customer.product]: current[customer.product] - quantity }));
    setMetrics((current) => applyEffects(current, { cash: revenue, trust: trustChange }));
    const note =
      quantity === customer.requested
        ? `Filled ${customer.name}'s full order: ${quantity} ${PRODUCTS[customer.product].shortLabel.toLowerCase()} units.`
        : quantity === 0
          ? `${customer.name} left without stock.`
          : `Partially served ${customer.name}: ${quantity} of ${customer.requested} units.`;
    addDayNote(note);
    markResolved(customer, quantity > 0);
    playTone(quantity === customer.requested ? 880 : 420, 0.11);
  };

  const packageIsFeasible = (item = selectedCreditPackage) =>
    inventory.seed >= item.seed && inventory.fertilizer >= item.fertilizer && inventory.drip >= item.drip;

  const completeCredit = () => {
    if (!selectedCustomer || selectedCustomer.kind !== "credit" || !packageIsFeasible()) return;
    const customer = selectedCustomer;
    const packageItem = selectedCreditPackage;
    const deposit = Math.min(220000, packageItem.value);
    const exposure = packageItem.value - deposit;
    const wellStructured =
      creditTerms === "staged" &&
      packageItem.id !== "full" &&
      creditChecks.contract &&
      (creditChecks.ledger || followupDays > 0);
    const partlyStructured = creditTerms === "staged" || packageItem.id === "starter";

    setInventory((current) => ({
      ...current,
      seed: current.seed - packageItem.seed,
      fertilizer: current.fertilizer - packageItem.fertilizer,
      drip: current.drip - packageItem.drip,
    }));
    setMetrics((current) => applyEffects(current, { cash: deposit, trust: 3 }));

    const outcome: PendingOutcome = wellStructured
      ? {
          id: "rehema-repayment",
          dueDay: 4,
          title: "Rehema's ledger closes cleanly",
          copy: "Her vegetable sale covers the first stage; the Tarime buyer clears the remaining balance after harvest.",
          effects: { cash: exposure, trust: 6 },
        }
      : partlyStructured
        ? {
            id: "rehema-partial",
            dueDay: 4,
            title: "One credit payment is delayed",
            copy: "Rehema pays most of the balance, but an unverified portion waits on a slower buyer.",
            effects: { cash: Math.round(exposure * 0.72), trust: 1 },
          }
        : {
            id: "rehema-delay",
            dueDay: 4,
            title: "The full credit balance does not arrive",
            copy: "The uncontracted tomatoes sell late, leaving your supplier bill ahead of Rehema's final payment.",
            effects: { cash: Math.round(exposure * 0.4), trust: -4 },
          };

    setPendingOutcomes((current) => [...current, outcome]);
    addDayNote(`Agreed a ${packageItem.label.toLowerCase()} with ${creditTerms === "staged" ? "staged payments" : "one harvest payment"}.`);
    unlockNote("credit");
    markResolved(customer);
    playTone(780, 0.12);
  };

  const completeAdvice = (adviceId: AdviceId) => {
    if (!selectedCustomer || selectedCustomer.kind !== "advice") return;
    const customer = selectedCustomer;
    let immediateEffects: Partial<Metrics> = {};
    let outcome: PendingOutcome;
    let note = "";

    if (adviceId === "verify") {
      immediateEffects = { cash: -40000 };
      const evidenceStrength = Number(adviceChecks.leaf) + Number(adviceChecks.label) + Number(adviceChecks.consultant) + modelFarmDays;
      outcome = {
        id: "juma-verified",
        dueDay: 4,
        title: "Juma shares a useful diagnosis",
        copy:
          evidenceStrength >= 2
            ? "The evidence points to nutrient stress, not fungal disease. Juma avoids an unnecessary pesticide and explains why at demo day."
            : "The sale is delayed while better evidence is gathered. Juma values the caution, though the answer takes longer.",
        effects: { trust: evidenceStrength >= 2 ? 15 : 7, readiness: 2 },
      };
      note = "Delayed the sale and asked Juma to verify the diagnosis first.";
    } else if (adviceId === "sell") {
      immediateEffects = { cash: 160000 };
      outcome = {
        id: "juma-poor-advice",
        dueDay: 4,
        title: "The cheap pesticide fails",
        copy: "The product does not address the problem. Juma loses scarce cash and discusses the advice with other farmers.",
        effects: { trust: -20, readiness: -4 },
      };
      note = "Made a quick pesticide sale before confirming the diagnosis or product.";
    } else {
      const warmReferral = adviceChecks.consultant;
      outcome = {
        id: "juma-referral",
        dueDay: 4,
        title: warmReferral ? "Baraka follows up with Juma" : "Juma continues searching for help",
        copy: warmReferral
          ? "Your agri-consultant receives the photos and gives Juma a clear next step before demo day."
          : "The referral protects Juma from a poor sale, but he leaves without a direct contact or follow-up plan.",
        effects: { trust: warmReferral ? 6 : -4 },
      };
      note = warmReferral ? "Made a warm referral to the BLF agri-consultant." : "Sent Juma away to find outside advice.";
    }

    setMetrics((current) => applyEffects(current, immediateEffects));
    setPendingOutcomes((current) => [...current, outcome]);
    addDayNote(`${note} The result will be known at demo day.`);
    unlockNote("advice");
    markResolved(customer);
    playTone(adviceId === "sell" ? 420 : 800, 0.12);
  };

  const updateOrder = (key: ProductKey, change: number) => {
    setOrderDraft((current) => ({ ...current, [key]: Math.max(0, Math.min(30, current[key] + change)) }));
  };

  const applyDemandPlan = (plan: "lower" | "buffer") => {
    const nextOrder = PRODUCT_KEYS.reduce<Inventory>((draft, key) => {
      const range = demandForecast[key];
      const target = plan === "lower" ? range.min : Math.ceil((range.min + range.max) / 2);
      draft[key] = Math.max(0, Math.min(30, target - inventory[key]));
      return draft;
    }, { seed: 0, fertilizer: 0, cropCare: 0, drip: 0 });
    setOrderDraft(nextOrder);
    setToast(plan === "lower" ? "Draft order now covers the lower demand estimate." : "Draft order now includes a small demand buffer.");
  };

  const openSupplier = () => {
    setOrderDraft({ seed: 0, fertilizer: 0, cropCare: 0, drip: 0 });
    setReserveDraft(false);
    setToolPanel("supplier");
  };

  const placeSupplierOrder = () => {
    if (orderTotal <= 0 || orderTotal > metrics.cash) return;
    setMetrics((current) => applyEffects(current, { cash: -orderTotal }));
    setInventory((current) => ({
      seed: current.seed + orderDraft.seed,
      fertilizer: current.fertilizer + orderDraft.fertilizer,
      cropCare: current.cropCare + orderDraft.cropCare,
      drip: current.drip + orderDraft.drip,
    }));
    if (reserveDraft) setReserveStatus("held");
    const orderCopy = orderUnits > 0 ? `${orderUnits} units delivered` : "No immediate stock";
    addDayNote(`${orderCopy}; supplier cost ${formatCash(orderTotal)}${reserveDraft ? ", including a future seed reservation" : ""}.`);
    unlockNote("supplier");
    setToolPanel(null);
    playTone(670, 0.12);
  };

  const handleReserve = (choice: "deliver" | "release") => {
    if (choice === "deliver" && metrics.cash >= 540000) {
      setMetrics((current) => applyEffects(current, { cash: -540000 }));
      setInventory((current) => ({ ...current, seed: current.seed + 12 }));
      setReserveStatus("delivered");
      setMorningNews((current) => [...current, "Musa delivers the 12 reserved seed packs for the remaining TSh 540,000."]);
      playTone(760, 0.1);
    } else if (choice === "release") {
      setReserveStatus("released");
      setMorningNews((current) => [...current, "You release the reservation. The TSh 120,000 deposit is not returned, but no more cash is committed."]);
      playTone(440, 0.1);
    }
  };

  const closeShop = () => {
    const missed = unresolvedCustomers.length;
    const trustPenalty = missed * -2;
    const finalMetrics = applyEffects(metrics, { trust: trustPenalty });
    const focus = MORNING_FOCUSES.find((item) => item.id === activeFocus)?.label ?? "Open shop";
    const servedToday = servedCustomerIds.length;
    const missedNote = missed > 0 ? `${missed} visitor${missed === 1 ? "" : "s"} left unserved when the doors closed.` : "Every visitor received an answer today.";

    setMetrics(finalMetrics);
    setLogs((current) => [
      ...current,
      {
        day: day.date,
        focus,
        served: servedToday,
        missed,
        cashDelta: finalMetrics.cash - dayStartMetrics.cash,
        trustDelta: finalMetrics.trust - dayStartMetrics.trust,
        readinessDelta: finalMetrics.readiness - dayStartMetrics.readiness,
        notes: [...dayNotes, missedNote],
      },
    ]);
    setDayNotes((current) => [...current, missedNote]);
    setSelectedCustomer(null);
    setToolPanel(null);
    setPhase("evening");
    setToast("");
    playTone(520, 0.12);
  };

  const advanceDay = () => {
    playTone(700, 0.1);
    if (dayIndex === DAYS.length - 1) {
      setPhase("end");
      return;
    }

    const nextDay = dayIndex + 1;
    const due = pendingOutcomes.filter((outcome) => outcome.dueDay === nextDay);
    let nextMetrics = metrics;
    due.forEach((outcome) => {
      nextMetrics = applyEffects(nextMetrics, outcome.effects);
    });
    const news = due.map((outcome) => {
      const impact = [
        outcome.effects.cash ? `${formatDelta(outcome.effects.cash, true)} capital` : "",
        outcome.effects.trust ? `${formatDelta(outcome.effects.trust)} trust` : "",
        outcome.effects.readiness ? `${formatDelta(outcome.effects.readiness)} readiness` : "",
      ].filter(Boolean).join(" · ");
      return `${outcome.title}: ${outcome.copy}${impact ? ` Impact: ${impact}.` : ""}`;
    });
    if (nextDay === 2) news.unshift(season.reveal);

    setMetrics(nextMetrics);
    setPendingOutcomes((current) => current.filter((outcome) => outcome.dueDay !== nextDay));
    setDayIndex(nextDay);
    setResolvedCustomers([]);
    setServedCustomerIds([]);
    setMorningFocus(null);
    setActiveFocus(null);
    setMorningNews(news);
    setStocktakeActive(false);
    setPlayer(START_POSITION);
    setPhase("morning");
  };

  const replay = () => {
    setSeasonNumber((current) => current + 1);
    setDayIndex(0);
    setMetrics(INITIAL_METRICS);
    setInventory(INITIAL_INVENTORY);
    setResolvedCustomers([]);
    setServedCustomerIds([]);
    setSelectedCustomer(null);
    setMorningFocus(null);
    setActiveFocus(null);
    setToolPanel(null);
    setLogs([]);
    setPendingOutcomes([]);
    setMorningNews([]);
    setFarmersServed(0);
    setPlayer(START_POSITION);
    setToast("");
    setReserveStatus("none");
    setStocktakeActive(false);
    setFollowupDays(0);
    setModelFarmDays(0);
    setUnlockedNotes(["starting"]);
    setPhase("title");
  };

  const coachCopy = [
    "A full shelf is not the same as a healthy business. Compare likely demand, transport cost, and the cash another opportunity may need.",
    "Credit is a design problem, not only yes or no. Package size, evidence, deposits, dates, and follow-up can change the risk.",
    "The forecast changed demand, but your earlier inventory choices determine whether that becomes revenue, idle stock, or a stock-out.",
    "A knowledge hub protects trust by separating observation from diagnosis. A quick sale today can return as a reputation cost later.",
    "Today reveals the network effect: customers remember whether the Centre kept promises, offered sound advice, and had stock when it mattered.",
  ][dayIndex];

  const totalInventory = Object.values(inventory).reduce((sum, value) => sum + value, 0);
  const score =
    Number(metrics.cash >= 3000000) +
    Number(metrics.trust >= 78) +
    Number(metrics.readiness >= 65) +
    Number(farmersServed >= 8);
  const ending =
    score >= 4
      ? {
          badge: "Community anchor",
          heading: "The Centre became a trusted part of the farming network.",
          copy: "You balanced service, working capital, evidence, and relationships across an uncertain week.",
        }
      : score >= 2
        ? {
            badge: "Growing enterprise",
            heading: "The Centre made progress, with trade-offs to revisit.",
            copy: "Some systems held while others created pressure. The next season will reveal different demand.",
          }
        : {
            badge: "Tough trading week",
            heading: "The Centre needs a more resilient plan.",
            copy: "Cash, stock, service, and trust interacted in ways that made recovery difficult—but the next season can play differently.",
          };

  return (
    <main className="game-page">
      <section className="game-frame" aria-label="Kijani Centre agribusiness life simulation">
        <div className={`map-stage weather-${dayIndex}`}>
          <div className="sun-glow" aria-hidden="true" />
          <div className="drifting-cloud cloud-one" aria-hidden="true" />
          <div className="drifting-cloud cloud-two" aria-hidden="true" />

          {phase === "title" && (
            <div className="screen-overlay title-screen">
              <div className="title-card pixel-panel">
                <span className="tiny-leaf" aria-hidden="true">🌿</span>
                <p className="game-kicker">Better Life Farming · Tanzania</p>
                <h1>Kijani Centre</h1>
                <p className="game-subtitle">
                  Run the shop for five days. Choose how to spend your morning, manage real stock, serve farmers, and live with consequences that may arrive later.
                </p>
                <div className="title-details">
                  <span>🗓️ 5 shop days</span>
                  <span>🌦️ Uncertain demand</span>
                  <span>🔁 A different next season</span>
                </div>
                <button className="primary-button start-button" type="button" onClick={startSeason}>
                  Begin the vuli week
                </button>
                <p className="small-note">Your goal is not a perfect answer. Keep the Centre useful, solvent, and trusted.</p>
              </div>
            </div>
          )}

          {phase !== "title" && phase !== "end" && (
            <>
              <header className="hud pixel-panel">
                <div className="hud-date">
                  <span className="hud-day">Day {dayIndex + 1}/{DAYS.length}</span>
                  <span>{day.date}</span>
                  <span>{day.time}</span>
                  <span>{day.weather}</span>
                </div>
                <div className="hud-stats" aria-label="Centre status">
                  <span title="Available capital">🪙 <strong>{formatCash(metrics.cash)}</strong></span>
                  <span title="Stock units">📦 <strong>{totalInventory}</strong></span>
                  <span title="Farmer trust">💚 <strong>{metrics.trust}%</strong></span>
                  <span title="Centre readiness">🌿 <strong>{metrics.readiness}%</strong></span>
                </div>
                <button className="icon-button" type="button" aria-label={soundOn ? "Turn sound off" : "Turn sound on"} onClick={() => setSoundOn((current) => !current)}>
                  {soundOn ? "🔊" : "🔇"}
                </button>
              </header>

              {phase === "shop" && (
                <>
                  <aside className="day-card pixel-panel">
                    <span className="eyebrow">Today at the Centre</span>
                    <h1>{day.title}</h1>
                    <p>{day.briefing}</p>
                    <div className="visitor-heading">
                      <span>Waiting visitors</span>
                      <b>{resolvedCustomers.length}/{customers.length}</b>
                    </div>
                    <div className="visitor-list">
                      {customers.map((customer) => {
                        const done = resolvedCustomers.includes(customer.id);
                        return (
                          <button key={customer.id} className={done ? "served" : ""} type="button" disabled={done} onClick={() => openCustomer(customer)}>
                            <span>{done ? "✓" : customer.icon}</span>
                            <span><strong>{customer.name}</strong><small>{customer.kind === "sale" ? `${customer.requested} ${PRODUCTS[customer.product].shortLabel.toLowerCase()} units` : customer.kind === "credit" ? "Credit conversation" : "Crop advice"}</small></span>
                            <b>{done ? "Done" : "Talk →"}</b>
                          </button>
                        );
                      })}
                    </div>
                    <button className="close-shop-button" type="button" onClick={closeShop}>
                      Close shop for the day
                    </button>
                    <small className="close-warning">You may close early. Unserved farmers will remember.</small>
                  </aside>

                  <aside className="tool-dock pixel-panel" aria-label="Centre tools">
                    <span className="eyebrow">Amina&apos;s desk</span>
                    <div className="tool-buttons">
                      <button type="button" onClick={() => setToolPanel("inventory")}><span>📦</span><strong>Stockroom</strong><small>{totalInventory} units</small></button>
                      <button type="button" onClick={() => setToolPanel("ledger")}><span>📒</span><strong>Ledger</strong><small>{pendingOutcomes.length} pending</small></button>
                      <button type="button" onClick={() => setToolPanel("notebook")}><span>📖</span><strong>Notebook</strong><small>{unlockedNotes.length} notes</small></button>
                      <button type="button" onClick={() => setToolPanel("coach")}><span>📱</span><strong>ALP Coach</strong><small>Optional nudge</small></button>
                    </div>
                  </aside>

                  <button className="world-marker supplier-marker" type="button" style={{ left: "54%", top: "38%" }} onClick={openSupplier} aria-label="Call Musa the supplier">
                    <span className="marker-icon">☎️</span>
                    <span className="marker-label">Order stock</span>
                  </button>

                  {customers.map((customer) => {
                    const done = resolvedCustomers.includes(customer.id);
                    return (
                      <button
                        key={customer.id}
                        type="button"
                        className={`world-marker customer-marker ${done ? "served-marker" : ""}`}
                        style={{ left: `${customer.x}%`, top: `${customer.y}%` }}
                        onClick={() => openCustomer(customer)}
                        disabled={done}
                        aria-label={`${done ? "Served" : "Talk to"} ${customer.name}`}
                      >
                        <span className="npc-sprite" aria-hidden="true">{done ? "✅" : customer.icon}</span>
                        <span className="marker-label">{done ? "Served" : customer.name}</span>
                      </button>
                    );
                  })}

                  <div className="player-sprite" style={{ left: `${player.x}%`, top: `${player.y}%` }} aria-label="Amina, the BLF agri-entrepreneur" role="img">
                    <span className="player-hat" />
                    <span className="player-head" />
                    <span className="player-body" />
                    <span className="player-legs" />
                  </div>

                  {toast && <div className="game-toast pixel-panel" role="status">{toast}</div>}
                </>
              )}
            </>
          )}

          {phase === "morning" && (
            <div className="screen-overlay morning-screen">
              <div className="morning-card pixel-panel">
                <div className="morning-heading">
                  <span className="morning-icon" aria-hidden="true">🌅</span>
                  <div><span className="eyebrow">Morning {dayIndex + 1} of {DAYS.length}</span><h1>{day.title}</h1><p>{day.date} · {day.weather}</p></div>
                </div>
                <p className="morning-brief">{day.briefing}</p>
                {morningNews.length > 0 && (
                  <div className="morning-news">
                    <span className="eyebrow">News carried into today</span>
                    {morningNews.map((item) => <p key={item}>• {item}</p>)}
                  </div>
                )}
                {dayIndex >= 2 && reserveStatus === "held" && (
                  <div className="reserve-call">
                    <div><span className="eyebrow">Musa is on the phone</span><strong>Your 12 reserved seed packs are ready.</strong><p>Pay the remaining TSh 540,000 for delivery, or release the option and lose only the deposit.</p></div>
                    <div><button type="button" disabled={metrics.cash < 540000} onClick={() => handleReserve("deliver")}>Take delivery</button><button type="button" onClick={() => handleReserve("release")}>Release reserve</button></div>
                  </div>
                )}
                <span className="section-label">Choose one morning priority</span>
                <div className="focus-grid">
                  {MORNING_FOCUSES.map((focus) => (
                    <button key={focus.id} type="button" className={morningFocus === focus.id ? "selected" : ""} onClick={() => setMorningFocus(focus.id)}>
                      <span>{focus.icon}</span><strong>{focus.label}</strong><p>{focus.copy}</p><small>{focus.effect}</small>
                    </button>
                  ))}
                </div>
                <button className="primary-button open-shop-button" type="button" disabled={!morningFocus || (dayIndex >= 2 && reserveStatus === "held")} onClick={beginDay}>
                  {dayIndex >= 2 && reserveStatus === "held" ? "Answer Musa before opening" : "Open the Centre →"}
                </button>
              </div>
            </div>
          )}

          {phase === "evening" && logs.length > 0 && (
            <div className="screen-overlay evening-screen">
              <div className="evening-card pixel-panel">
                <div className="evening-heading"><span aria-hidden="true">🌙</span><div><span className="eyebrow">Shop closed · {day.date}</span><h1>What changed today?</h1></div></div>
                <div className="evening-metrics">
                  <div className={logs.at(-1)!.cashDelta >= 0 ? "positive" : "negative"}><span>Capital</span><strong>{formatDelta(logs.at(-1)!.cashDelta, true)}</strong><small>Now {formatCash(metrics.cash)}</small></div>
                  <div className={logs.at(-1)!.trustDelta >= 0 ? "positive" : "negative"}><span>Trust</span><strong>{formatDelta(logs.at(-1)!.trustDelta)}</strong><small>Now {metrics.trust}%</small></div>
                  <div className={logs.at(-1)!.readinessDelta >= 0 ? "positive" : "negative"}><span>Readiness</span><strong>{formatDelta(logs.at(-1)!.readinessDelta)}</strong><small>Now {metrics.readiness}%</small></div>
                </div>
                <div className="day-journal"><span className="eyebrow">Amina&apos;s journal</span>{logs.at(-1)!.notes.map((note) => <p key={note}>• {note}</p>)}</div>
                <button className="primary-button" type="button" onClick={advanceDay}>{dayIndex === DAYS.length - 1 ? "Review the vuli week" : "Go to the next morning"} →</button>
              </div>
            </div>
          )}

          {selectedCustomer && (
            <div className="interaction-scrim">
              <div className="interaction-sheet pixel-panel" role="dialog" aria-modal="true" aria-label={`Conversation with ${selectedCustomer.name}`}>
                <button className="sheet-close" type="button" aria-label="Return to the shop" onClick={() => setSelectedCustomer(null)}>×</button>
                <div className="conversation-heading"><span>{selectedCustomer.icon}</span><div><span className="eyebrow">At the counter</span><h2>{selectedCustomer.name}</h2><p>“{selectedCustomer.opening}”</p></div></div>

                {selectedCustomer.kind === "sale" && (
                  <div className="sale-builder">
                    <div className="stock-snapshot"><span>{PRODUCTS[selectedCustomer.product].icon}</span><div><small>On your shelf</small><strong>{inventory[selectedCustomer.product]} {PRODUCTS[selectedCustomer.product].shortLabel.toLowerCase()} units</strong></div><div><small>Requested</small><strong>{selectedCustomer.requested}</strong></div></div>
                    <label htmlFor="sale-quantity">Quantity to sell <strong>{saleQuantity}</strong></label>
                    <input id="sale-quantity" type="range" min="0" max={Math.min(selectedCustomer.requested, inventory[selectedCustomer.product])} value={saleQuantity} onChange={(event) => setSaleQuantity(Number(event.target.value))} />
                    <div className="transaction-preview"><span>Cash received <strong>{formatCash(saleQuantity * PRODUCTS[selectedCustomer.product].price)}</strong></span><span>Stock after sale <strong>{inventory[selectedCustomer.product] - saleQuantity}</strong></span></div>
                    <button className="primary-button" type="button" onClick={completeSale}>{saleQuantity === selectedCustomer.requested ? "Fill the order" : saleQuantity === 0 ? "Send the customer away" : "Offer a partial order"}</button>
                  </div>
                )}

                {selectedCustomer.kind === "credit" && (
                  <div className="credit-builder">
                    <div className="evidence-desk"><button type="button" className={creditChecks.ledger ? "checked" : ""} onClick={() => setCreditChecks((current) => ({ ...current, ledger: true }))}><span>📒</span><strong>Open her ledger</strong><small>{creditChecks.ledger ? "Two smaller balances were repaid on time." : "Optional"}</small></button><button type="button" className={creditChecks.contract ? "checked" : ""} onClick={() => setCreditChecks((current) => ({ ...current, contract: true }))}><span>📄</span><strong>Ask about the buyer</strong><small>{creditChecks.contract ? "The contract covers about two-thirds of a hectare." : "Optional"}</small></button></div>
                    <span className="section-label">Build the package</span>
                    <div className="package-grid">
                      {CREDIT_PACKAGES.map((item) => {
                        const feasible = packageIsFeasible(item);
                        return <button key={item.id} type="button" disabled={!feasible} className={creditPackageId === item.id ? "selected" : ""} onClick={() => setCreditPackageId(item.id)}><strong>{item.label}</strong><span>{formatCash(item.value)}</span><small>{item.seed} seed · {item.fertilizer} fertilizer · {item.drip} drip</small>{!feasible && <em>Not enough stock</em>}</button>;
                      })}
                    </div>
                    <span className="section-label">Choose repayment timing</span>
                    <div className="terms-toggle"><button type="button" className={creditTerms === "staged" ? "selected" : ""} onClick={() => setCreditTerms("staged")}><strong>Staged payments</strong><small>Deposit, vegetable sale, then tomato buyer</small></button><button type="button" className={creditTerms === "harvest" ? "selected" : ""} onClick={() => setCreditTerms("harvest")}><strong>One harvest payment</strong><small>Higher exposure until the buyer pays</small></button></div>
                    <div className="credit-preview"><span>Paid today <strong>{formatCash(Math.min(220000, selectedCreditPackage.value))}</strong></span><span>Balance left in your ledger <strong>{formatCash(selectedCreditPackage.value - Math.min(220000, selectedCreditPackage.value))}</strong></span></div>
                    <button className="primary-button" type="button" disabled={!packageIsFeasible()} onClick={completeCredit}>Agree terms and record the credit</button>
                    <p className="uncertainty-note">You will not know the repayment result until later in the week.</p>
                  </div>
                )}

                {selectedCustomer.kind === "advice" && (
                  <div className="advice-builder">
                    <div className="evidence-desk three"><button type="button" className={adviceChecks.leaf ? "checked" : ""} onClick={() => setAdviceChecks((current) => ({ ...current, leaf: true }))}><span>🍃</span><strong>Inspect leaf</strong><small>{adviceChecks.leaf ? "Spots could be disease, nutrient stress, or water splash." : "Optional"}</small></button><button type="button" className={adviceChecks.label ? "checked" : ""} onClick={() => setAdviceChecks((current) => ({ ...current, label: true }))}><span>🧪</span><strong>Read the label</strong><small>{adviceChecks.label ? "Batch number and local registration details are missing." : "Optional"}</small></button><button type="button" className={adviceChecks.consultant ? "checked" : ""} onClick={() => setAdviceChecks((current) => ({ ...current, consultant: true }))}><span>📞</span><strong>Call Baraka</strong><small>{adviceChecks.consultant ? "He asks for photos and offers a same-day follow-up." : "Optional"}</small></button></div>
                    <span className="section-label">What do you do now?</span>
                    <div className="advice-actions"><button type="button" onClick={() => completeAdvice("verify")}><strong>Verify before recommending</strong><small>Spend TSh 40,000 on follow-up; delay the sale.</small></button><button type="button" onClick={() => completeAdvice("sell")}><strong>Sell the cheap product now</strong><small>Receive TSh 160,000; the product result comes later.</small></button><button type="button" onClick={() => completeAdvice("refer")}><strong>Refer Juma elsewhere</strong><small>The quality of the referral depends on your preparation.</small></button></div>
                    <p className="uncertainty-note">Juma&apos;s crop—and the effect on your reputation—will be visible at demo day.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {toolPanel && (
            <div className="interaction-scrim">
              <div className="tool-sheet pixel-panel" role="dialog" aria-modal="true" aria-label={`${toolPanel} panel`}>
                <button className="sheet-close" type="button" aria-label="Close tool" onClick={() => setToolPanel(null)}>×</button>

                {toolPanel === "inventory" && <><span className="eyebrow">Live stockroom</span><h2>What is actually on the shelf?</h2><div className="inventory-grid">{(Object.keys(PRODUCTS) as ProductKey[]).map((key) => <div key={key}><span>{PRODUCTS[key].icon}</span><strong>{inventory[key]}</strong><small>{PRODUCTS[key].label}</small><em>Buy {formatCash(PRODUCTS[key].cost)} · Sell {formatCash(PRODUCTS[key].price)}</em></div>)}</div><button className="primary-button" type="button" onClick={openSupplier}>Call Musa to order stock</button></>}

                {toolPanel === "supplier" && (
                  <>
                    <span className="eyebrow">Musa · distributor in Arusha</span>
                    <h2>Plan today&apos;s stock order</h2>
                    <p className="sheet-intro">Use the demand estimate below, then decide how much cash you want to keep available. Stock arrives today.</p>

                    <div className="demand-board">
                      <div className="demand-board-heading">
                        <span aria-hidden="true">🧮</span>
                        <div>
                          <strong>Amina&apos;s demand estimate</strong>
                          <small>Expected units from now {dayIndex === DAYS.length - 1 ? "until closing" : "through Saturday"}</small>
                        </div>
                      </div>
                      <p>{forecastSource}</p>
                      <div className="demand-guide">
                        <span><b>Lower number</b> likely demand</span>
                        <span><b>Upper number</b> possible busy-week demand</span>
                      </div>
                    </div>

                    <span className="section-label">Choose a starting plan, or build your own</span>
                    <div className="plan-presets">
                      <button type="button" onClick={() => applyDemandPlan("lower")}>
                        <strong>Cover the lower estimate</strong>
                        <small>Uses less cash, but a busy week may cause a stock-out.</small>
                      </button>
                      <button type="button" onClick={() => applyDemandPlan("buffer")}>
                        <strong>Add a small safety buffer</strong>
                        <small>Uses more cash and aims for the middle of the range.</small>
                      </button>
                    </div>

                    <div className="order-grid">
                      {PRODUCT_KEYS.map((key) => {
                        const stockAfterOrder = inventory[key] + orderDraft[key];
                        const demand = demandForecast[key];
                        let signalClass = "balanced";
                        let signal = "Within the expected range";
                        if (demand.max === 0) {
                          signalClass = stockAfterOrder > 0 ? "extra" : "balanced";
                          signal = stockAfterOrder > 0 ? "No demand signal yet" : "No demand expected";
                        } else if (stockAfterOrder < demand.min) {
                          signalClass = "short";
                          signal = `${demand.min - stockAfterOrder} short of the lower estimate`;
                        } else if (stockAfterOrder > demand.max) {
                          signalClass = "extra";
                          signal = `${stockAfterOrder - demand.max} above the upper estimate`;
                        }

                        return (
                          <div className={`order-line ${signalClass}`} key={key}>
                            <span className="order-product-icon">{PRODUCTS[key].icon}</span>
                            <div className="order-product-main">
                              <div className="order-product-title">
                                <strong>{PRODUCTS[key].shortLabel}</strong>
                                <small>{formatCash(PRODUCTS[key].cost)} each</small>
                              </div>
                              <div className="demand-numbers">
                                <span>On shelf <b>{inventory[key]}</b></span>
                                <span>Waiting today <b>{formatDemandRange(todayDemand[key])}</b></span>
                                <span>Expected {dayIndex === DAYS.length - 1 ? "today" : "this week"} <b>{formatDemandRange(demand)}</b></span>
                              </div>
                              <div className="stock-result">
                                <span>After this order: <b>{stockAfterOrder}</b></span>
                                <strong>{signal}</strong>
                              </div>
                            </div>
                            <div className="order-stepper">
                              <small>Order now</small>
                              <div className="stepper">
                                <button type="button" aria-label={`Remove ${PRODUCTS[key].shortLabel}`} onClick={() => updateOrder(key, -1)}>−</button>
                                <strong>{orderDraft[key]}</strong>
                                <button type="button" aria-label={`Add ${PRODUCTS[key].shortLabel}`} onClick={() => updateOrder(key, 1)}>+</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {reserveStatus === "none" && (
                      <label className="reserve-option">
                        <input type="checkbox" checked={reserveDraft} onChange={(event) => setReserveDraft(event.target.checked)} />
                        <span><strong>Keep an option for 12 more seed packs</strong><small>Pay TSh 120,000 now. After the rain update, choose whether to pay the remaining TSh 540,000.</small></span>
                      </label>
                    )}
                    <div className="order-total">
                      <span>Products <strong>{formatCash(orderProductCost)}</strong></span>
                      <span>Transport {stocktakeActive && <em>shared-route price</em>} <strong>{orderUnits > 0 ? formatCash(transportFee) : formatCash(0)}</strong></span>
                      {reserveDraft && <span>Seed option deposit <strong>{formatCash(120000)}</strong></span>}
                      <b>Total paid today <strong>{formatCash(orderTotal)}</strong></b>
                      <span>Cash left after payment <strong>{formatCash(Math.max(0, metrics.cash - orderTotal))}</strong></span>
                    </div>
                    <button className="primary-button" type="button" disabled={orderTotal <= 0 || orderTotal > metrics.cash} onClick={placeSupplierOrder}>
                      {orderTotal > metrics.cash ? "This order costs more cash than you have" : "Place order and pay"}
                    </button>
                  </>
                )}

                {toolPanel === "ledger" && <><span className="eyebrow">Business ledger</span><h2>Promises still moving through the week</h2>{pendingOutcomes.length === 0 ? <p className="empty-state">No unsettled customer promises yet.</p> : <div className="pending-list">{pendingOutcomes.map((outcome) => <div key={outcome.id}><span>Due Day {outcome.dueDay + 1}</span><strong>{outcome.title}</strong><p>The final amount or relationship effect is still uncertain.</p></div>)}</div>}<span className="section-label">Completed days</span><div className="compact-log">{logs.length === 0 ? <p>No day has closed yet.</p> : logs.map((log) => <div key={log.day}><strong>{log.day}</strong><span>{log.served} served · {log.missed} missed</span><span>{formatDelta(log.cashDelta, true)} cash · {formatDelta(log.trustDelta)} trust</span></div>)}</div></>}

                {toolPanel === "coach" && <><span className="eyebrow">Optional ALP Coach</span><h2>A nudge, not an answer</h2><div className="coach-message"><span>📱</span><p>{coachCopy}</p></div><p className="uncertainty-note">The coach does not know this season&apos;s rainfall or how every customer will respond.</p></>}

                {toolPanel === "notebook" && <><span className="eyebrow">Amina&apos;s field notebook</span><h2>Ideas discovered through play</h2><div className="notebook-list">{unlockedNotes.map((id, index) => <article key={id}><span>{index + 1}</span><div><strong>{NOTES[id].title}</strong><p>{NOTES[id].copy}</p></div></article>)}</div><p className="uncertainty-note">More notes appear when you use supplier, credit, and advice systems.</p></>}
              </div>
            </div>
          )}

          {phase === "end" && (
            <div className="screen-overlay ending-screen">
              <div className="ending-card pixel-panel">
                <div className="ending-header"><span aria-hidden="true">🌻</span><div><span className="ending-badge">{ending.badge}</span><h1>{ending.heading}</h1><p>{ending.copy}</p></div></div>
                <div className="ending-stats"><div><span>Capital</span><strong>{formatCash(metrics.cash)}</strong></div><div><span>Trust</span><strong>{metrics.trust}%</strong></div><div><span>Readiness</span><strong>{metrics.readiness}%</strong></div><div><span>Farmers served</span><strong>{farmersServed}</strong></div></div>
                <div className="season-story"><span className="section-label">Your five-day shop journal</span>{logs.map((log) => <article key={log.day}><div><strong>{log.day}</strong><span>{log.served} served · {log.missed} missed</span></div><div className="log-deltas"><span>{formatDelta(log.cashDelta, true)}</span><span>{formatDelta(log.trustDelta)} trust</span><span>{formatDelta(log.readinessDelta)} readiness</span></div><p>{log.notes.at(-1)}</p></article>)}</div>
                <div className="ending-reflection"><span className="eyebrow">ALP Coach reflection</span><p>Which result came from a decision made days earlier? What would you change if next week&apos;s rain and customer order were different?</p></div>
                <button className="primary-button" type="button" onClick={replay}>Play a different vuli week ↻</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
