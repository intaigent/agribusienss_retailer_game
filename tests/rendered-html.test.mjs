import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

test("models one connected Tanzania market day", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Better Life Farming · Tanzania/);
  assert.match(page, /One market day/);
  assert.match(page, /Four connected encounters/);
  assert.match(page, /rashidi-sale/);
  assert.match(page, /rehema-credit/);
  assert.match(page, /juma-advice/);
  assert.match(page, /neema-finale/);
  assert.doesNotMatch(page, /Run the shop for five days|Day \{dayIndex/);
});

test("uses fixed stock allocation instead of stock-order forecasting", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /No new delivery will arrive today/);
  assert.match(page, /Fixed stock for today/);
  assert.match(page, /Mama Rehema is expected later and may need four seed packs/);
  assert.match(page, /For Rehema later/);
  assert.doesNotMatch(page, /Plan today&apos;s stock order|Cover the lower estimate|Add a small safety buffer|openSupplier|orderDraft/);
});

test("reveals conversations before showing decisions", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Briefing line/);
  assert.match(page, /customerLineIndex < customerLines.length/);
  assert.match(page, /Listen to the request before deciding what to do/);
  assert.match(page, /Respond to the request/);
  assert.match(page, /One situation at a time\. Listen first, then decide/);
});

test("shows immediate trade-offs after every decision", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Decision made · what changed/);
  assert.match(page, /The shelf changes immediately/);
  assert.match(page, /The package affects stock and the ledger/);
  assert.match(page, /The safer work has a deadline cost/);
  assert.match(page, /Continue the story/);
  assert.match(page, /Time after sale/);
  assert.match(page, /Credit still owed/);
});

test("keeps representative BLF learning inside the story", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Check repayment record/);
  assert.match(page, /Confirm the buyer/);
  assert.match(page, /Verify before recommending/);
  assert.match(page, /ALP Coach · before you decide/);
  assert.match(page, /What you know/);
  assert.match(page, /What to consider/);
  assert.match(page, /What to record/);
  assert.match(page, /BLF · Inventory Recordkeeping \+ Cash Ledger/);
  assert.match(page, /Ideas discovered through play/);
  assert.match(page, /A balanced result rewards farmer value/);
});

test("connects each consequence to active bookkeeping practice", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Close the loop before continuing/);
  assert.match(page, /Where should Amina record this source document/);
  assert.match(page, /Cash ledger/);
  assert.match(page, /Inventory card/);
  assert.match(page, /Customer credit ledger/);
  assert.match(page, /Expense ledger/);
  assert.match(page, /Follow-up log/);
  assert.match(page, /Do the books agree with the Centre/);
  assert.match(page, /Closing reconciliation complete/);
});

test("makes the demonstration deadline and final score consequential", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /DEMO_DEADLINE = 900/);
  assert.match(page, /Every check advances the clock immediately/);
  assert.match(page, /inspectAdvice\("consultant", 20\)/);
  assert.match(page, /The model-farm demonstration started/);
  assert.match(page, /Balanced Centre Score breakdown/);
  assert.match(page, /Farmer value/);
  assert.match(page, /Bookkeeping/);
  assert.match(page, /Share my result/);
});

test("is a standard Next.js project ready for Vercel", async () => {
  const [layout, packageJson, mapStats] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/game-map.png", import.meta.url)),
  ]);

  assert.match(packageJson, /"dev": "next dev"/);
  assert.match(packageJson, /"build": "next build"/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|cloudflare/i);
  assert.match(layout, /Kijani Centre \| An Agribusiness Life Simulation/);
  assert.ok(mapStats.size > 100_000);

  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
  await access(new URL("../docs/scenario-design.md", import.meta.url));
});
