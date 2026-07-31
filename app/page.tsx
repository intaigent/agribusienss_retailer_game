"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Metrics = { cash: number; readiness: number; trust: number };
type Position = { x: number; y: number };

type Hotspot = Position & {
  id: string;
  label: string;
  icon: string;
  speaker: string;
  text: string;
};

type Choice = {
  id: string;
  label: string;
  hint: string;
  consequence: string;
  lesson: string;
  fieldGuide: string;
  effects: Metrics;
  skill: number;
};

type Stage = {
  day: string;
  time: string;
  weather: string;
  title: string;
  quest: string;
  requestSummary: string;
  coach: string;
  customer: string;
  customerIcon: string;
  customerPosition: Position;
  opening: string;
  prompt: string;
  hotspots: Hotspot[];
  choices: Choice[];
};

type Dialogue =
  | { kind: "clue"; speaker: string; icon: string; text: string }
  | { kind: "prompt"; speaker: string; icon: string; text: string }
  | { kind: "decision" }
  | { kind: "outcome"; choice: Choice; before: Metrics; after: Metrics };

type Result = {
  stageTitle: string;
  stageDay: string;
  decision: string;
  fieldGuide: string;
  consequence: string;
  before: Metrics;
  after: Metrics;
  skill: number;
};

type MetricKey = keyof Metrics;

const METRIC_DETAILS: Array<{ key: MetricKey; icon: string; label: string }> = [
  { key: "cash", icon: "🪙", label: "Capital" },
  { key: "readiness", icon: "📦", label: "Readiness" },
  { key: "trust", icon: "💚", label: "Farmer trust" },
];

const INITIAL_METRICS: Metrics = { cash: 4800000, readiness: 52, trust: 70 };
const START_POSITION = { x: 50, y: 78 };

const STAGES: Stage[] = [
  {
    day: "Mon · 2 Oct",
    time: "7:10 AM",
    weather: "☀️ 24°",
    title: "Stock before the vuli rains",
    quest: "Prepare your BLF Centre without locking all your capital in seed.",
    requestSummary: "Neema needs a stock plan before you place today’s costly Arusha order.",
    coach:
      "Start with the stock card, expected demand, delivery lead time, and cash needed for other products. Supplier terms can preserve options—but I will leave the decision to you.",
    customer: "Neema",
    customerIcon: "👩🏾",
    customerPosition: { x: 34, y: 52 },
    opening:
      "Habari, Amina! Sixty-three farmers registered after our model-farm day. Tomato and watermelon seed are selling fast, but the Arusha delivery is expensive and the rain may arrive late.",
    prompt: "How will you stock the Centre?",
    hotspots: [
      {
        id: "stock-card",
        label: "Count stock",
        icon: "📦",
        x: 52,
        y: 38,
        speaker: "Inventory stock card",
        text: "You have 24 tomato seed packs and 12 watermelon packs. Last vuli season you sold 70 packs in the first three weeks.",
      },
      {
        id: "forecast",
        label: "Check forecast",
        icon: "🌦️",
        x: 70,
        y: 36,
        speaker: "Crop calendar",
        text: "The first useful rain is expected 10–16 days late. Demand should come, but later than farmers first expected.",
      },
      {
        id: "supplier",
        label: "Call supplier",
        icon: "☎️",
        x: 43,
        y: 47,
        speaker: "Musa · distributor in Arusha",
        text: "Transport is TSh 320,000 per delivery. I can reserve a second shipment if you pay a 10% deposit today.",
      },
    ],
    choices: [
      {
        id: "reserve",
        label: "Order 35 packs now; reserve 30 more",
        hint: "Cover early buyers and keep a supplier option open.",
        consequence:
          "You serve early farmers and preserve cash for fertilizer and transport. When the rain arrives late, Musa releases your reserved shipment.",
        lesson:
          "Use demand history and the business cycle together. A reservation can reduce both stock-out risk and excess inventory.",
        fieldGuide: "Inventory Management Methods",
        effects: { cash: -2050000, readiness: 20, trust: 5 },
        skill: 3,
      },
      {
        id: "all-in",
        label: "Buy 75 packs in one shipment",
        hint: "Save on a second transport charge and fill the shelves.",
        consequence:
          "The Centre looks well stocked, but delayed planting traps most of your capital just as fertilizer demand begins.",
        lesson:
          "A lower transport cost does not automatically mean a better purchase. Include the cost of cash tied up in slow-moving stock.",
        fieldGuide: "Controlling Costs",
        effects: { cash: -3750000, readiness: 32, trust: 2 },
        skill: 1,
      },
      {
        id: "wait",
        label: "Wait until the rain is confirmed",
        hint: "Protect every shilling until uncertainty clears.",
        consequence:
          "Other retailers order first. Your next delivery will reach Bunda after the first farmers begin planting.",
        lesson:
          "Avoiding a purchase is still a business decision. Compare the cost of waiting with the cost of holding stock.",
        fieldGuide: "Inventory and Business Cycles",
        effects: { cash: 0, readiness: -14, trust: -7 },
        skill: 0,
      },
    ],
  },
  {
    day: "Mon · 9 Oct",
    time: "10:40 AM",
    weather: "⛅ 27°",
    title: "Mama Rehema asks for credit",
    quest: "Help a loyal tomato farmer without creating an unmanaged debt.",
    requestSummary: "Mama Rehema wants TSh 860,000 of inputs and can pay TSh 220,000 today.",
    coach:
      "Customer credit can grow sales, but it also delays your cash. Check repayment history, present capacity to repay, clear payment dates, monitoring cost, and the effect on your own supplier bills.",
    customer: "Mama Rehema",
    customerIcon: "👩🏿‍🌾",
    customerPosition: { x: 36, y: 54 },
    opening:
      "Amina, I need seed, fertilizer, and drip-line parts worth TSh 860,000. My Tarime buyer pays after harvest. I can pay TSh 220,000 today.",
    prompt: "What credit arrangement will you offer?",
    hotspots: [
      {
        id: "credit-ledger",
        label: "Check ledger",
        icon: "📒",
        x: 43,
        y: 45,
        speaker: "Customer credit ledger",
        text: "Rehema repaid two smaller balances on time. This request is almost twice as large as her last credit purchase.",
      },
      {
        id: "farm-plan",
        label: "Review farm plan",
        icon: "🗺️",
        x: 70,
        y: 45,
        speaker: "Mama Rehema",
        text: "I am planting one hectare of tomatoes, but my confirmed buyer contract covers only two-thirds of the harvest.",
      },
      {
        id: "payment-plan",
        label: "Map payments",
        icon: "🗓️",
        x: 54,
        y: 37,
        speaker: "Mama Rehema",
        text: "I can pay TSh 220,000 now, another amount after my first vegetable sale, and the final balance after the tomato buyer pays.",
      },
    ],
    choices: [
      {
        id: "structured",
        label: "Fund the contracted area with staged payments",
        hint: "Match exposure to verified production and payment dates.",
        consequence:
          "Rehema plants the contracted area and signs each credit receipt. Her vegetable sale covers the first payment; the balance is cleared after tomato harvest.",
        lesson:
          "A customer credit ledger protects both parties. Record every purchase, payment, and running balance—and set terms the farm can realistically meet.",
        fieldGuide: "Credit for Customers",
        effects: { cash: -520000, readiness: 0, trust: 11 },
        skill: 3,
      },
      {
        id: "full-credit",
        label: "Provide the full package on trust",
        hint: "Reward loyalty and help her plant the full hectare.",
        consequence:
          "Rehema appreciates the support, but the uncontracted tomatoes sell late. Your supplier invoice is due before her final payment.",
        lesson:
          "Character and past repayment matter, but a larger loan creates new exposure. Assess this season’s cash flow as well.",
        fieldGuide: "Introduction to Credit",
        effects: { cash: -640000, readiness: 0, trust: 7 },
        skill: 1,
      },
      {
        id: "cash-only",
        label: "Sell only what TSh 220,000 can buy",
        hint: "Remove repayment risk for the Centre.",
        consequence:
          "Your cash is protected, but Rehema buys the remaining inputs from a trader who offers a structured plan.",
        lesson:
          "A binary yes-or-no answer can miss safer middle options. Package size, deposits, contracts, and payment stages all manage risk.",
        fieldGuide: "Customer Care",
        effects: { cash: 220000, readiness: 0, trust: -9 },
        skill: 0,
      },
    ],
  },
  {
    day: "Fri · 13 Oct",
    time: "3:15 PM",
    weather: "🌧️ 22°",
    title: "The spotted tomato leaf",
    quest: "Give responsible advice before tomorrow’s model-farm demo day.",
    requestSummary: "Juma wants an immediate answer about a cheap, unfamiliar pesticide for spotted tomatoes.",
    coach:
      "Your Centre is a knowledge hub, not only a shop. Separate observation from diagnosis, verify the product, consult qualified support when uncertain, and give clear safe-use guidance.",
    customer: "Juma",
    customerIcon: "🧑🏾‍🌾",
    customerPosition: { x: 69, y: 54 },
    opening:
      "These spots appeared after the rain. A travelling seller says his cheap pesticide fixes every disease. Should I buy it before tomorrow’s demo day?",
    prompt: "What advice will you give Juma?",
    hotspots: [
      {
        id: "leaf",
        label: "Inspect leaf",
        icon: "🍃",
        x: 66,
        y: 46,
        speaker: "Tomato leaf sample",
        text: "The pattern could be fungal disease, but nutrient stress and water splash can look similar at this stage.",
      },
      {
        id: "label",
        label: "Check product",
        icon: "🧪",
        x: 56,
        y: 38,
        speaker: "Unfamiliar pesticide label",
        text: "The batch number is missing, the instructions are unclear, and the seller cannot show local registration paperwork.",
      },
      {
        id: "consultant",
        label: "Call consultant",
        icon: "📞",
        x: 43,
        y: 40,
        speaker: "Baraka · BLF agri-consultant",
        text: "Send field photos and confirm the diagnosis. If treatment is needed, use a registered product and explain safe handling and disposal.",
      },
    ],
    choices: [
      {
        id: "verify",
        label: "Verify first; recommend only a registered input",
        hint: "Match treatment to evidence and explain safe use.",
        consequence:
          "Photos confirm nutrient stress, not fungal disease. Juma avoids an unnecessary pesticide and shares the lesson at your demo day.",
        lesson:
          "The BLF Centre is a knowledge hub, not only a shop. Diagnosis, product quality, safe-use guidance, and referral build long-term value.",
        fieldGuide: "Customer Care",
        effects: { cash: -40000, readiness: 0, trust: 15 },
        skill: 3,
      },
      {
        id: "cheap-product",
        label: "Sell a cheap pesticide immediately",
        hint: "Act quickly and keep today’s sale.",
        consequence:
          "The pesticide does not address the problem. Juma loses scarce cash and tells farmers your Centre gave poor advice.",
        lesson:
          "A short-term sale can create a much larger cost. Product quality and staff knowledge are pillars of customer satisfaction.",
        fieldGuide: "Managing Risk",
        effects: { cash: 160000, readiness: 0, trust: -20 },
        skill: 0,
      },
      {
        id: "send-away",
        label: "Tell Juma to find an extension officer",
        hint: "Avoid advising outside your certainty.",
        consequence:
          "You avoid a harmful sale, but Juma leaves without a clear next step and misses the chance to bring evidence to the demo day.",
        lesson:
          "A warm referral—with evidence to gather and a follow-up plan—serves the farmer better than dismissal.",
        fieldGuide: "Business Relationships",
        effects: { cash: 0, readiness: 0, trust: -4 },
        skill: 1,
      },
    ],
  },
];

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
const distance = (a: Position, b: Position) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const formatCash = (amount: number) => {
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1000000) return `${sign}TSh ${(absolute / 1000000).toFixed(1)}m`;
  return `${sign}TSh ${Math.round(absolute / 1000)}k`;
};

const metricDelta = (before: Metrics, after: Metrics, key: MetricKey) =>
  after[key] - before[key];

const formatMetricValue = (key: MetricKey, value: number) =>
  key === "cash" ? formatCash(value) : `${value}%`;

const formatMetricDelta = (key: MetricKey, value: number) => {
  if (value === 0) return "No change";
  if (key === "cash") return `${value > 0 ? "+" : ""}${formatCash(value)}`;
  return `${value > 0 ? "+" : ""}${value} pts`;
};

const impactClass = (value: number) =>
  value > 0 ? "impact-positive" : value < 0 ? "impact-negative" : "impact-neutral";

export default function Home() {
  const [screen, setScreen] = useState<"title" | "game" | "end">("title");
  const [stageIndex, setStageIndex] = useState(0);
  const [player, setPlayer] = useState<Position>(START_POSITION);
  const [cluesFound, setCluesFound] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);
  const mapStageRef = useRef<HTMLDivElement | null>(null);

  const stage = STAGES[stageIndex];
  const progress = Math.round((stageIndex / STAGES.length) * 100);

  const playTone = useCallback(
    (frequency = 540, duration = 0.08) => {
      if (!soundOn || typeof window === "undefined") return;
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioContextClass) return;
        const context = audioRef.current ?? new AudioContextClass();
        audioRef.current = context;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "square";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.035, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
      } catch {
        // Decorative audio should never block learning.
      }
    },
    [soundOn],
  );

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (screen !== "game" || dialogue) return;
      setPlayer((current) => ({
        x: Math.max(10, Math.min(90, current.x + dx)),
        y: Math.max(28, Math.min(88, current.y + dy)),
      }));
    },
    [dialogue, screen],
  );

  const openHotspot = useCallback(
    (hotspot: Hotspot) => {
      if (dialogue) return;
      playTone(650);
      setPlayer({ x: hotspot.x, y: Math.min(88, hotspot.y + 7) });
      setCluesFound((current) =>
        current.includes(hotspot.id) ? current : [...current, hotspot.id],
      );
      setDialogue({
        kind: "clue",
        speaker: hotspot.speaker,
        icon: hotspot.icon,
        text: hotspot.text,
      });
    },
    [dialogue, playTone],
  );

  const openCustomer = useCallback(() => {
    if (dialogue) return;
    playTone(720);
    setPlayer({ x: stage.customerPosition.x, y: Math.min(88, stage.customerPosition.y + 8) });
    if (cluesFound.length < 2) {
      setDialogue({
        kind: "prompt",
        speaker: stage.customer,
        icon: stage.customerIcon,
        text: `${stage.opening} Gather at least two useful clues before deciding.`,
      });
      return;
    }
    setDialogue({ kind: "decision" });
  }, [cluesFound.length, dialogue, playTone, stage]);

  const openCoach = useCallback(() => {
    if (dialogue) return;
    playTone(820);
    setDialogue({
      kind: "clue",
      speaker: `ALP Coach · ${stage.title}`,
      icon: "📱",
      text: stage.coach,
    });
  }, [dialogue, playTone, stage]);

  const interactWithNearest = useCallback(() => {
    if (dialogue || screen !== "game") return;
    const targets = [
      ...stage.hotspots.map((hotspot) => ({
        kind: "hotspot" as const,
        position: hotspot,
        hotspot,
      })),
      { kind: "customer" as const, position: stage.customerPosition },
    ];
    const nearest = targets
      .map((target) => ({ ...target, gap: distance(player, target.position) }))
      .sort((a, b) => a.gap - b.gap)[0];
    if (!nearest || nearest.gap > 10) return;
    if (nearest.kind === "hotspot") openHotspot(nearest.hotspot);
    else openCustomer();
  }, [dialogue, openCustomer, openHotspot, player, screen, stage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (screen !== "game") return;
      const key = event.key.toLowerCase();
      const directions: Record<string, [number, number]> = {
        arrowup: [0, -2.5],
        w: [0, -2.5],
        arrowdown: [0, 2.5],
        s: [0, 2.5],
        arrowleft: [-2.5, 0],
        a: [-2.5, 0],
        arrowright: [2.5, 0],
        d: [2.5, 0],
      };
      if (directions[key]) {
        event.preventDefault();
        movePlayer(...directions[key]);
      }
      if (key === "e" || key === "enter") {
        event.preventDefault();
        interactWithNearest();
      }
      if (key === "escape" && dialogue?.kind !== "outcome") setDialogue(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogue?.kind, interactWithNearest, movePlayer, screen]);

  useEffect(() => {
    if (screen === "end" && mapStageRef.current) {
      mapStageRef.current.scrollTop = 0;
    }
  }, [screen]);

  const nearestLabel = useMemo(() => {
    if (dialogue || screen !== "game") return "";
    const targets = [
      ...stage.hotspots.map((item) => ({ label: item.label, position: item })),
      { label: `Talk to ${stage.customer}`, position: stage.customerPosition },
    ];
    const nearest = targets
      .map((item) => ({ ...item, gap: distance(player, item.position) }))
      .sort((a, b) => a.gap - b.gap)[0];
    return nearest && nearest.gap <= 10 ? nearest.label : "";
  }, [dialogue, player, screen, stage]);

  const choose = (choice: Choice) => {
    playTone(choice.skill === 3 ? 880 : 360, 0.14);
    const before = metrics;
    const after = {
      cash: Math.max(0, before.cash + choice.effects.cash),
      readiness: clampPercent(before.readiness + choice.effects.readiness),
      trust: clampPercent(before.trust + choice.effects.trust),
    };
    setMetrics(after);
    setResults((current) => [
      ...current,
      {
        stageTitle: stage.title,
        stageDay: stage.day.replace(/^\w+ · /, ""),
        decision: choice.label,
        fieldGuide: choice.fieldGuide,
        consequence: choice.consequence,
        before,
        after,
        skill: choice.skill,
      },
    ]);
    setDialogue({ kind: "outcome", choice, before, after });
  };

  const advance = () => {
    playTone(760, 0.12);
    if (stageIndex === STAGES.length - 1) {
      setDialogue(null);
      setScreen("end");
      return;
    }
    const nextStage = STAGES[stageIndex + 1];
    setStageIndex((current) => current + 1);
    setCluesFound([]);
    setPlayer(START_POSITION);
    setDialogue({
      kind: "prompt",
      speaker: nextStage.customer,
      icon: nextStage.customerIcon,
      text: nextStage.opening,
    });
  };

  const startGame = () => {
    playTone(620, 0.12);
    setScreen("game");
    setDialogue({
      kind: "prompt",
      speaker: "Neema · BLF agri-consultant",
      icon: "👩🏾",
      text: STAGES[0].opening,
    });
  };

  const replay = () => {
    setStageIndex(0);
    setPlayer(START_POSITION);
    setCluesFound([]);
    setMetrics(INITIAL_METRICS);
    setResults([]);
    setDialogue(null);
    setScreen("title");
  };

  const totalSkill = results.reduce((sum, result) => sum + result.skill, 0);
  const latestResult = results[results.length - 1];
  const weakestResult = results.reduce<Result | null>(
    (weakest, result) => (!weakest || result.skill < weakest.skill ? result : weakest),
    null,
  );

  const ending =
    totalSkill >= 8
      ? {
          badge: "Trusted agri-entrepreneur",
          heading: "Your Centre—and its farmer network—grew stronger.",
          copy: "You applied ALP lessons to balance capital, farmer value, and responsible advice across the vuli season.",
        }
      : totalSkill >= 5
        ? {
            badge: "Promising season",
            heading: "The Centre is viable, with one decision worth replaying.",
            copy: "Some choices protected today while creating avoidable risk later in the season.",
          }
        : {
            badge: "A difficult season",
            heading: "Short-term choices weakened the Centre’s resilience.",
            copy: "Replay the season and look for options that preserve flexibility before committing capital or farmer trust.",
          };

  return (
    <main className="game-page">
      <section className="game-frame" aria-label="Better Life Farming retailer game">
        <div ref={mapStageRef} className={`map-stage weather-${stageIndex}`}>
          <div className="sun-glow" aria-hidden="true" />
          <div className="drifting-cloud cloud-one" aria-hidden="true" />
          <div className="drifting-cloud cloud-two" aria-hidden="true" />

          {screen === "game" && (
            <>
              <header className="hud pixel-panel">
                <div className="hud-date">
                  <span className="hud-day">{stage.day}</span>
                  <span>{stage.time}</span>
                  <span>{stage.weather}</span>
                </div>
                <div className="hud-stats" aria-label="Centre status">
                  {METRIC_DETAILS.map((metric) => {
                    const change = latestResult
                      ? metricDelta(latestResult.before, latestResult.after, metric.key)
                      : 0;
                    return (
                      <span className="hud-stat" title={metric.label} key={metric.key}>
                        <span>{metric.icon} {formatMetricValue(metric.key, metrics[metric.key])}</span>
                        {latestResult && (
                          <em
                            key={`${results.length}-${metric.key}`}
                            className={impactClass(change)}
                          >
                            {formatMetricDelta(metric.key, change)}
                          </em>
                        )}
                      </span>
                    );
                  })}
                </div>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
                  onClick={() => setSoundOn((current) => !current)}
                >
                  {soundOn ? "🔊" : "🔇"}
                </button>
              </header>

              <aside className="quest-card pixel-panel">
                <span className="eyebrow">Current quest</span>
                <h1>{stage.title}</h1>
                <p>{stage.quest}</p>
                <div className="request-brief">
                  <span>Request from {stage.customer}</span>
                  <p>{stage.requestSummary}</p>
                </div>
                <div className="quest-progress" aria-label={`${progress}% season complete`}>
                  <span style={{ width: `${progress}%` }} />
                </div>
                <span className="evidence-label">
                  Evidence to gather <small>Choose any 2</small>
                </span>
                <ul>
                  {stage.hotspots.map((hotspot) => (
                    <li key={hotspot.id} className={cluesFound.includes(hotspot.id) ? "done" : ""}>
                      <button type="button" onClick={() => openHotspot(hotspot)}>
                        <span>{cluesFound.includes(hotspot.id) ? "✓" : "○"}</span>
                        <span>{hotspot.label}</span>
                        <small>{cluesFound.includes(hotspot.id) ? "Review" : "Open →"}</small>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="quest-tip">
                  {cluesFound.length < 2
                    ? `${2 - cluesFound.length} more clue${2 - cluesFound.length === 1 ? "" : "s"} needed`
                    : `Talk to ${stage.customer} to decide`}
                </p>
                <button className="coach-button" type="button" onClick={openCoach}>
                  <span aria-hidden="true">📱</span>
                  <span><strong>ALP Coach</strong><small>Get a nudge, not the answer</small></span>
                </button>
              </aside>

              {results.length > 0 && (
                <aside className="decision-trail pixel-panel" aria-label="Your decision trail">
                  <div className="trail-heading">
                    <span>
                      <span className="eyebrow">Your decision trail</span>
                      <strong>Season impact</strong>
                    </span>
                    <b>{results.length}/{STAGES.length}</b>
                  </div>
                  <div className="trail-list">
                    {results.map((result, index) => (
                      <article className="trail-item" key={result.stageTitle}>
                        <div className="trail-number">{index + 1}</div>
                        <div>
                          <span className="trail-day">{result.stageDay}</span>
                          <strong>{result.decision}</strong>
                          <div className="mini-impact-row">
                            {METRIC_DETAILS.map((metric) => {
                              const change = metricDelta(result.before, result.after, metric.key);
                              return (
                                <span className={impactClass(change)} key={metric.key}>
                                  {metric.icon} {formatMetricDelta(metric.key, change)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </aside>
              )}

              {stage.hotspots.map((hotspot) => (
                <button
                  key={hotspot.id}
                  type="button"
                  className={`world-marker ${cluesFound.includes(hotspot.id) ? "visited" : ""}`}
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  onClick={() => openHotspot(hotspot)}
                  aria-label={`${hotspot.label}${cluesFound.includes(hotspot.id) ? ", clue found" : ""}`}
                >
                  <span className="marker-icon">{hotspot.icon}</span>
                  <span className="marker-label">{hotspot.label}</span>
                </button>
              ))}

              <button
                type="button"
                className={`world-marker customer-marker ${cluesFound.length >= 2 ? "decision-ready" : ""}`}
                style={{ left: `${stage.customerPosition.x}%`, top: `${stage.customerPosition.y}%` }}
                onClick={openCustomer}
                aria-label={`Talk to ${stage.customer}`}
              >
                <span className="npc-sprite" aria-hidden="true">{stage.customerIcon}</span>
                <span className="marker-label">
                  {cluesFound.length >= 2 ? `Decision ready · ${stage.customer}` : `Talk to ${stage.customer}`}
                </span>
              </button>

              <div
                className="player-sprite"
                style={{ left: `${player.x}%`, top: `${player.y}%` }}
                aria-label="Amina, the BLF agri-entrepreneur"
                role="img"
              >
                <span className="player-hat" />
                <span className="player-head" />
                <span className="player-body" />
                <span className="player-legs" />
              </div>

              {nearestLabel && (
                <button className="interact-prompt" type="button" onClick={interactWithNearest}>
                  <kbd>E</kbd> {nearestLabel}
                </button>
              )}

              <div className="mobile-controls" aria-label="Movement controls">
                <button type="button" aria-label="Move up" onClick={() => movePlayer(0, -4)}>▲</button>
                <div>
                  <button type="button" aria-label="Move left" onClick={() => movePlayer(-4, 0)}>◀</button>
                  <button type="button" aria-label="Interact" onClick={interactWithNearest}>E</button>
                  <button type="button" aria-label="Move right" onClick={() => movePlayer(4, 0)}>▶</button>
                </div>
                <button type="button" aria-label="Move down" onClick={() => movePlayer(0, 4)}>▼</button>
              </div>

              {!dialogue && (
                <div className="controls-hint pixel-panel">
                  <span><kbd>WASD</kbd> or arrows to move</span>
                  <span><kbd>E</kbd> to interact</span>
                </div>
              )}

              {dialogue && (
                <div className={`dialogue-box pixel-panel dialogue-${dialogue.kind}`} role="dialog" aria-modal="true">
                  {dialogue.kind === "decision" ? (
                    <>
                      <div className="dialogue-heading">
                        <span className="portrait">{stage.customerIcon}</span>
                        <div>
                          <span className="eyebrow">Decision time</span>
                          <h2>{stage.prompt}</h2>
                        </div>
                      </div>
                      <div className="decision-grid">
                        {stage.choices.map((choice) => (
                          <button key={choice.id} type="button" onClick={() => choose(choice)}>
                            <strong>{choice.label}</strong>
                            <span>{choice.hint}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : dialogue.kind === "outcome" ? (
                    <>
                      <div className="dialogue-heading">
                        <span className="portrait">🌱</span>
                        <div>
                          <span className="eyebrow">Decision {stageIndex + 1} of {STAGES.length} recorded</span>
                          <h2>Your Centre changed</h2>
                        </div>
                      </div>
                      <div className="choice-recap">
                        <span>Your choice</span>
                        <strong>{dialogue.choice.label}</strong>
                      </div>
                      <div className="metric-change-grid" aria-label="Before and after decision impact">
                        {METRIC_DETAILS.map((metric) => {
                          const change = metricDelta(dialogue.before, dialogue.after, metric.key);
                          return (
                            <div className={`metric-change-card ${impactClass(change)}`} key={metric.key}>
                              <span className="metric-change-label">{metric.icon} {metric.label}</span>
                              <div className="metric-values">
                                <span><small>Before</small><strong>{formatMetricValue(metric.key, dialogue.before[metric.key])}</strong></span>
                                <b aria-hidden="true">→</b>
                                <span><small>Now</small><strong>{formatMetricValue(metric.key, dialogue.after[metric.key])}</strong></span>
                              </div>
                              <em>{formatMetricDelta(metric.key, change)}</em>
                            </div>
                          );
                        })}
                      </div>
                      <div className="story-impact">
                        <span className="eyebrow">What happened next</span>
                        <p>{dialogue.choice.consequence}</p>
                      </div>
                      <div className="field-note">
                        <span className="eyebrow">ALP field guide · {dialogue.choice.fieldGuide}</span>
                        <p>{dialogue.choice.lesson}</p>
                      </div>
                      <button className="primary-button" type="button" onClick={advance}>
                        {stageIndex === STAGES.length - 1 ? "Finish the season" : "Close shop & continue"} →
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="dialogue-heading">
                        <span className="portrait">{dialogue.icon}</span>
                        <div>
                          <span className="eyebrow">{dialogue.speaker}</span>
                          <p>{dialogue.text}</p>
                        </div>
                      </div>
                      <div className="dialogue-actions">
                        {dialogue.kind === "prompt" ? (
                          <button
                            className="primary-button"
                            type="button"
                            onClick={() => cluesFound.length >= 2 ? setDialogue({ kind: "decision" }) : setDialogue(null)}
                          >
                            {cluesFound.length >= 2 ? "Make the decision →" : "Let me investigate →"}
                          </button>
                        ) : (
                          <button type="button" onClick={() => setDialogue(null)}>Back to the Centre</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {screen === "title" && (
            <div className="screen-overlay title-screen">
              <div className="title-card pixel-panel">
                <span className="tiny-leaf" aria-hidden="true">🌿</span>
                <p className="game-kicker">Better Life Farming · Tanzania</p>
                <h1>Kijani Quest</h1>
                <p className="game-subtitle">Run a rural BLF Centre. Support farmers. Put your ALP training into practice.</p>
                <div className="title-details">
                  <span>⏱ 10 minutes</span>
                  <span>🌱 3 decisions</span>
                  <span>🔁 Many outcomes</span>
                </div>
                <button className="primary-button start-button" type="button" onClick={startGame}>
                  Open the Centre
                </button>
                <p className="small-note">Inspired by BLF agri-entrepreneurs in Tanzania’s Lake Zone. The player and events are fictional.</p>
              </div>
            </div>
          )}

          {screen === "end" && (
            <div className="screen-overlay ending-screen">
              <div className="ending-card pixel-panel">
                <div className="ending-header">
                  <span className="ending-sprout" aria-hidden="true">🌻</span>
                  <div>
                    <span className="ending-badge">{ending.badge}</span>
                    <h1>{ending.heading}</h1>
                    <p>{ending.copy}</p>
                  </div>
                </div>
                <div className="ending-stats">
                  <div><span>Capital</span><strong>{formatCash(metrics.cash)}</strong></div>
                  <div><span>Readiness</span><strong>{metrics.readiness}%</strong></div>
                  <div><span>Farmer trust</span><strong>{metrics.trust}%</strong></div>
                </div>
                <div className="season-log">
                  {results.map((result) => (
                    <div key={result.stageTitle}>
                      <span className="log-day">{result.stageDay}</span>
                      <div>
                        <strong>{result.decision}</strong>
                        <span>{result.fieldGuide} unlocked</span>
                        <p className="log-consequence">{result.consequence}</p>
                        <div className="mini-impact-row season-impact-row">
                          {METRIC_DETAILS.map((metric) => {
                            const change = metricDelta(result.before, result.after, metric.key);
                            return (
                              <span className={impactClass(change)} key={metric.key}>
                                {metric.icon} {formatMetricDelta(metric.key, change)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalSkill === STAGES.length * 3 ? (
                  <div className="coach-note">
                    <span className="eyebrow">Coach&apos;s reflection</span>
                    <p>
                      Strong season. Which decision required the hardest trade-off—and what evidence gave you confidence?
                    </p>
                  </div>
                ) : weakestResult && (
                  <div className="coach-note">
                    <span className="eyebrow">Coach&apos;s question</span>
                    <p>
                      Revisit <strong>{weakestResult.stageTitle.toLowerCase()}</strong>: what evidence might change your choice on a second playthrough?
                    </p>
                  </div>
                )}
                <button className="primary-button" type="button" onClick={replay}>Play another vuli season ↻</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
