import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

test("models one connected Tanzania market day", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Better Life Farming · Tanzania/);
  assert.match(page, /One Saturday/);
  assert.match(page, /Four neighbours/);
  assert.match(page, /rashidi-sale/);
  assert.match(page, /rehema-credit/);
  assert.match(page, /juma-advice/);
  assert.match(page, /neema-finale/);
  assert.match(page, /Rashidi parks his bicycle/);
  assert.match(page, /Juma hurries in with a tomato leaf/);
  assert.doesNotMatch(page, /Run the shop for five days|Day \{dayIndex/);
});

test("uses fixed stock allocation instead of stock-order forecasting", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /supplier's truck will not reach us today/);
  assert.match(page, /Shelf and back room/);
  assert.match(page, /Eight packs were counted this morning/);
  assert.match(page, /Rehema may need four/);
  assert.match(page, /No truck is coming to rescue an empty shelf/);
  assert.match(page, /saleChoicesFor/);
  assert.match(page, /Fill his bicycle crate/);
  assert.match(page, /Share the shelf/);
  assert.doesNotMatch(page, /type="range"|sale-quantity/);
  assert.doesNotMatch(page, /Plan today&apos;s stock order|Cover the lower estimate|Add a small safety buffer|openSupplier|orderDraft/);
});

test("reveals conversations before showing decisions", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Briefing line/);
  assert.match(page, /customerLineIndex < customerLines.length/);
  assert.match(page, /First, hear them out/);
  assert.match(page, /Respond to the request/);
  assert.match(page, /Your move/);
  assert.match(page, /scene-setting/);
});

test("lets customers react before revealing the wider trade-off", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /reaction: StoryLine/);
  assert.match(page, /impactStep === 0/);
  assert.match(page, /Right there at the counter/);
  assert.match(page, /customer-reaction/);
  assert.match(page, /Rashidi grins/);
  assert.match(page, /Rehema traces/);
  assert.match(page, /Juma wraps/);
  assert.match(page, /Watch the choice travel/);
  assert.match(page, /The choice travels/);
  assert.match(page, /ripple-track/);
  assert.match(page, /Pick up the paper slip/);
  assert.match(page, /Cash in the tin/);
  assert.match(page, /Rehema still owes/);
});

test("keeps BLF learning available without blocking play", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Check old account/);
  assert.match(page, /Call her buyer/);
  assert.match(page, /Pay for a proper check/);
  assert.match(page, /Count what will remain after his bicycle leaves/);
  assert.match(page, /A promise is safer when both people can see the date/);
  assert.match(page, /Which mistake could hurt Juma most/);
  assert.match(page, /coach-why-button/);
  assert.match(page, />\{coachExpanded \? "Hide" : "Why\?"\}</);
  assert.match(page, /Look at the counter/);
  assert.match(page, /Think one step ahead/);
  assert.match(page, /Leave a paper trail/);
  assert.match(page, /From your BLF training/);
  assert.match(page, /An empty space has a memory/);
  assert.match(page, /A promise needs a shape/);
});

test("connects each consequence to active bookkeeping practice", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /One last job before the next neighbour/);
  assert.match(page, /A paper slip is waiting beside the cash tin/);
  assert.match(page, /Cash ledger/);
  assert.match(page, /Inventory card/);
  assert.match(page, /Customer credit ledger/);
  assert.match(page, /Expense ledger/);
  assert.match(page, /Follow-up log/);
  assert.match(page, /Green cash book/);
  assert.match(page, /Blue stock card/);
  assert.match(page, /Does the paper match the shop/);
  assert.match(page, /The cash tin, shelf, and books agree/);
});

test("makes the demonstration deadline and final score consequential", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /DEMO_DEADLINE = 900/);
  assert.match(page, /Demo at 3:00 PM/);
  assert.match(page, /minutes left/);
  assert.match(page, /inspectAdvice\("consultant", 20\)/);
  assert.match(page, /The model-farm demonstration started/);
  assert.match(page, /Balanced Centre Score breakdown/);
  assert.match(page, /Farmers helped/);
  assert.match(page, /Books kept/);
  assert.match(page, /Share this market day/);
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
