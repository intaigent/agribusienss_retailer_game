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
    next: "The morning continues. At 1:30 PM, Juma hurries in carrying a spotted tomato leaf.",
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
  const adviceTimeCost = (choice: AdviceId) =>
    (choice === "verify" ? 25 : choice === "sell" ? 15 : 20) + adviceEvidenceCount * 10;

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
    setPlayer({ x: customer.x, y: Math.min(84, customer.y + 9) });
    setToast("");
    if (customer.kind === "sale") {
      setSaleQuantity(Math.min(customer.requested, inventory[customer.product]));
    } else if (customer.kind === "credit") {
      setCreditOptionId("staged");
      setCreditChecks({ ledger: false, buyer: false });
    } else {
      setAdviceChecks({ leaf: false, label: false, consultant: false });
    }
    playTone(760);
  };

  const finishEncounter = (customer: Customer, nextImpact: Impact) => {
    setCompletedIds((current) => [...current, customer.id]);
    setSelectedCustomer(null);
    setPlayer(START_POSITION);
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
    const cashChange = choice === "verify" ? -40000 : choice === "sell" ? PRODUCTS.cropCare.price : 0;
    const cropCareChange = choice === "sell" ? -1 : 0;

    setMetrics((current) => applyEffects(current, { cash: cashChange, readiness: choice === "verify" ? 2 : 0 }));
    if (cropCareChange) setInventory((current) => ({ ...current, cropCare: Math.max(0, current.cropCare + cropCareChange) }));
    setMinutes((current) => current + timeCost);
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

    finishEncounter(customer, {
      title: "Cash and time move now; trust returns later",
      summary,
      next: customer.next,
      final: false,
      changes: [
        { icon: "🪙", label: "Centre cash", before: formatCashImpact(beforeCash), after: formatCashImpact(Math.max(0, beforeCash + cashChange)), tone: cashChange > 0 ? "positive" : cashChange < 0 ? "negative" : "neutral" },
        { icon: "🧪", label: "Crop-care stock", before: `${beforeCropCare}`, after: `${Math.max(0, beforeCropCare + cropCareChange)}`, tone: cropCareChange < 0 ? "negative" : "neutral" },
        { icon: "🕒", label: "Time", before: formatTime(minutes), after: formatTime(minutes + timeCost), tone: "neutral" },
        { icon: "💬", label: "Reputation result", before: "Unknown", after: "Returns at demo", tone: "neutral" },
      ],
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
    if (!impact) return;
    if (impact.final) {
      finishDay();
      return;
    }
    const nextCustomer = CUSTOMERS[completedIds.length];
    if (nextCustomer?.id === "juma-advice") setMinutes((current) => Math.max(current, 810));
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
    setPlayer(START_POSITION);
    setToast("");
  };

  const coachCopy = !currentCustomer
    ? "The day is nearly complete. Compare what remains on the shelf with the promises you made."
    : currentCustomer.kind === "sale"
      ? "A cash sale helps today. Also ask what this shelf must still do for the people you already expect."
      : currentCustomer.kind === "credit"
        ? "A good credit decision is not only yes or no. Check the person, buyer, package size, balance, and dates."
        : "You do not need to guess a diagnosis. Separate what you observe from what still needs expert confirmation.";

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
                  <button type="button" onClick={() => setToolPanel("ledger")}><span>📒</span><strong>Ledger</strong><small>{formatCash(ledgerExposure)} owed</small></button>
                  <button type="button" onClick={() => setToolPanel("notebook")}><span>📖</span><strong>Notebook</strong><small>{unlockedNotes.length} notes</small></button>
                  <button type="button" onClick={() => setToolPanel("coach")}><span>📱</span><strong>ALP Coach</strong><small>Optional nudge</small></button>
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
                    {selectedCustomer.kind === "sale" && (
                      <div className="sale-builder">
                        <div className="known-context"><span>📌</span><div><strong>What Amina already knows</strong><p>{selectedCustomer.context}</p></div></div>
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

                    {selectedCustomer.kind === "credit" && (
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

                    {selectedCustomer.kind === "advice" && (
                      <div className="advice-builder">
                        <div className="evidence-desk three">
                          <button type="button" className={adviceChecks.leaf ? "checked" : ""} onClick={() => setAdviceChecks((current) => ({ ...current, leaf: true }))}><span>🍃</span><strong>Inspect the leaf</strong><small>{adviceChecks.leaf ? "The spots may have more than one cause." : "Look before deciding"}</small></button>
                          <button type="button" className={adviceChecks.label ? "checked" : ""} onClick={() => setAdviceChecks((current) => ({ ...current, label: true }))}><span>🧪</span><strong>Read seller&apos;s label</strong><small>{adviceChecks.label ? "Registration and batch details are missing." : "Check the product"}</small></button>
                          <button type="button" className={adviceChecks.consultant ? "checked" : ""} onClick={() => setAdviceChecks((current) => ({ ...current, consultant: true }))}><span>📞</span><strong>Call the agronomist</strong><small>{adviceChecks.consultant ? "She asks for photos and replies before the demo." : "Create a warm referral"}</small></button>
                        </div>
                        <span className="section-label">Choose what Amina does now</span>
                        <div className="advice-actions consequence-actions">
                          <button type="button" onClick={() => completeAdvice("verify")}><strong>Verify before recommending</strong><small>−TSh 40k · +{adviceTimeCost("verify")} min · protects against a wrong sale</small></button>
                          <button type="button" disabled={inventory.cropCare < 1} onClick={() => completeAdvice("sell")}><strong>Sell a product now</strong><small>+TSh 160k · +{adviceTimeCost("sell")} min · reputation result unknown</small></button>
                          <button type="button" onClick={() => completeAdvice("refer")}><strong>Refer Juma</strong><small>No sale · +{adviceTimeCost("refer")} min · stronger if you called first</small></button>
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
                <div className="next-scene"><span>▶</span><p>{impact.next}</p></div>
                <button className="primary-button" type="button" onClick={continueAfterImpact}>{impact.final ? "See how the day ends →" : "Continue the story →"}</button>
              </div>
            </div>
          )}

          {toolPanel && (
            <div className="interaction-scrim">
              <div className="tool-sheet pixel-panel" role="dialog" aria-modal="true" aria-label={`${toolPanel} panel`}>
                <button className="sheet-close" type="button" aria-label="Close tool" onClick={() => setToolPanel(null)}>×</button>

                {toolPanel === "inventory" && <><span className="eyebrow">Fixed stock for today</span><h2>What is actually on the shelf?</h2><p className="sheet-intro">No delivery arrives today. These are the items Amina must allocate across the people who visit.</p><div className="inventory-grid">{(Object.keys(PRODUCTS) as ProductKey[]).map((key) => <div key={key}><span>{PRODUCTS[key].icon}</span><strong>{inventory[key]}</strong><small>{PRODUCTS[key].label}</small></div>)}</div></>}

                {toolPanel === "ledger" && <><span className="eyebrow">Business ledger</span><h2>What has the Centre promised?</h2>{ledgerExposure === 0 ? <p className="empty-state">No customer balance is currently owed.</p> : <div className="pending-list"><div><span>Mama Rehema</span><strong>{formatCash(ledgerExposure)} still owed</strong><p>{flags.creditStructured ? "The balance, buyer, and payment dates were checked and recorded." : "The balance remains, but some supporting information is missing."}</p></div></div>}<div className="ledger-rule"><strong>Stock and credit are connected</strong><p>Products leave the shelf today, while some cash may return later.</p></div></>}

                {toolPanel === "coach" && <><span className="eyebrow">Optional ALP Coach</span><h2>A nudge, not an answer</h2><div className="coach-message"><span>📱</span><p>{coachCopy}</p></div><p className="uncertainty-note">The coach cannot know every farmer&apos;s future result. Use it to ask a better question, not to reveal a perfect choice.</p></>}

                {toolPanel === "notebook" && <><span className="eyebrow">Amina&apos;s field notebook</span><h2>Ideas discovered through play</h2><div className="notebook-list">{unlockedNotes.map((id, index) => <article key={id}><span>{index + 1}</span><div><strong>{NOTEBOOK[id].title}</strong><p>{NOTEBOOK[id].copy}</p></div></article>)}</div></>}
              </div>
            </div>
          )}

          {phase === "ending" && (
            <div className="screen-overlay ending-screen">
              <div className="ending-card pixel-panel">
                <div className="ending-header"><span aria-hidden="true">🌻</span><div><span className="ending-badge">Market day complete</span><h1>The community remembers the whole day</h1><p>The result is not one score. It is the combination of stock, cash, promises, time, and trust.</p></div></div>
                <div className="ending-stats"><div><span>Capital</span><strong>{formatCash(metrics.cash)}</strong></div><div><span>Trust</span><strong>{metrics.trust}%</strong></div><div><span>Stock left</span><strong>{totalInventory}</strong></div><div><span>Credit owed</span><strong>{formatCash(ledgerExposure)}</strong></div></div>
                <div className="community-return">
                  <article><span>🧑🏾‍🌾</span><div><strong>Rashidi</strong><p>{flags.rashidiQuantity === 5 ? "He planted with the full amount he requested, but five packs left the shelf early." : flags.rashidiQuantity ? `He adjusted his plan after receiving ${flags.rashidiQuantity} packs instead of five.` : "He left without seed and may try another retailer next time."}</p></div></article>
                  <article><span>👩🏿‍🌾</span><div><strong>Mama Rehema</strong><p>{creditOutcome}</p></div></article>
                  <article><span>🧑🏾‍🌾</span><div><strong>Juma</strong><p>{adviceOutcome}</p></div></article>
                  <article><span>👩🏾</span><div><strong>Neema and the demo group</strong><p>{flags.neemaQuantity === 2 ? "The two interested farmers leave with seed and a practical connection to the demonstration." : flags.neemaQuantity ? `Only ${flags.neemaQuantity} of the two farmers can take seed today.` : "The demonstration creates interest, but no seed remains for the group."}</p></div></article>
                </div>
                <div className="ending-reflection"><span className="eyebrow">ALP Coach reflection</span><p>Which early choice changed the most later conversations: the first seed sale, the credit package, or the time spent checking Juma&apos;s problem?</p></div>
                <button className="primary-button" type="button" onClick={replay}>Replay the same day differently ↻</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
