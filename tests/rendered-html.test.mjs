import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished game", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Kijani Quest \| Better Life Farming Tanzania<\/title>/i);
  assert.match(html, /Kijani Quest/);
  assert.match(html, /Better Life Farming/);
  assert.match(html, /Open the Centre/);
  assert.match(html, /ALP training/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the game content and original map asset in the project", async () => {
  const [page, layout, packageJson, mapStats] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/game-map.png", import.meta.url)),
  ]);

  assert.match(packageJson, /"name": "agribusiness-retailer-game"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(layout, /Kijani Quest \| Better Life Farming Tanzania/);
  assert.match(page, /Stock before the vuli rains/);
  assert.match(page, /Mama Rehema asks for credit/);
  assert.match(page, /The spotted tomato leaf/);
  assert.match(page, /Inventory Management Methods/);
  assert.match(page, /Credit for Customers/);
  assert.match(page, /Customer Care/);
  assert.ok(mapStats.size > 100_000);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../docs/scenario-design.md", import.meta.url));
});
