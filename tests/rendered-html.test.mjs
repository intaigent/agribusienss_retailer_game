import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

test("models a five-day Tanzania retailer week instead of a lesson sequence", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Kijani Centre/);
  assert.match(page, /Better Life Farming · Tanzania/);
  assert.match(page, /Run the shop for five days/);
  assert.match(page, /Opening week/);
  assert.match(page, /Credit and cash flow/);
  assert.match(page, /The rain signal/);
  assert.match(page, /Advice under pressure/);
  assert.match(page, /Demo and market day/);
  assert.doesNotMatch(page, /Choose any 2|Decision ready|Your decision trail/);
});

test("lets the player operate the Centre and make trade-offs", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Count stock before Musa's truck/);
  assert.match(page, /Call farmer clients/);
  assert.match(page, /Prepare the model farm/);
  assert.match(page, /Plan today&apos;s stock order/);
  assert.match(page, /Amina&apos;s demand estimate/);
  assert.match(page, /Cover the lower estimate/);
  assert.match(page, /Add a small safety buffer/);
  assert.match(page, /Waiting today/);
  assert.match(page, /After this order/);
  assert.match(page, /Quantity to sell/);
  assert.match(page, /Build the package/);
  assert.match(page, /Choose repayment timing/);
  assert.match(page, /Verify before recommending/);
  assert.match(page, /Close shop for the day/);
});

test("carries delayed consequences into later days and supports replay", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /PendingOutcome/);
  assert.match(page, /dueDay: 4/);
  assert.match(page, /News carried into today/);
  assert.match(page, /You will not know the repayment result until later in the week/);
  assert.match(page, /What changed today\?/);
  assert.match(page, /Play a different vuli week/);
  assert.match(page, /Late rain/);
  assert.match(page, /Early showers/);
  assert.match(page, /Uneven rain/);
});

test("keeps learning support optional and contextual", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Optional ALP Coach/);
  assert.match(page, /A nudge, not an answer/);
  assert.match(page, /Ideas discovered through play/);
  assert.match(page, /More notes appear when you use supplier, credit, and advice systems/);
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
