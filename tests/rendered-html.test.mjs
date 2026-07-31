import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

test("keeps the complete Tanzania scenario in the game", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Kijani Quest/);
  assert.match(page, /Stock before the vuli rains/);
  assert.match(page, /Mama Rehema asks for credit/);
  assert.match(page, /The spotted tomato leaf/);
  assert.match(page, /Inventory Management Methods/);
  assert.match(page, /Credit for Customers/);
  assert.match(page, /Customer Care/);
});

test("starts every day with the request and keeps ALP Coach available", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /requestSummary/);
  assert.match(page, /Request from \{stage\.customer\}/);
  assert.match(page, /text: nextStage\.opening/);
  assert.match(page, /Let me investigate/);
  assert.match(page, /Get a nudge, not the answer/);
  assert.match(page, /Decision ready/);
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
  assert.match(layout, /Kijani Quest \| Better Life Farming Tanzania/);
  assert.ok(mapStats.size > 100_000);

  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
  await access(new URL("../docs/scenario-design.md", import.meta.url));
});
