# Kijani Centre

Kijani Centre is a small browser-based agribusiness life simulation. The player is Amina, a fictional Better Life Farming agri-entrepreneur and Agribusiness Leadership Program (ALP) trainee in Tanzania's Lake Zone.

The prototype follows one connected vuli market day rather than several thin course-like episodes. Four characters arrive in sequence, and every choice changes the stock, cash, time, credit exposure, or trust available in the next encounter.

## The market-day story

1. A short sentence-by-sentence briefing establishes Amina's fixed stock and known commitments.
2. Rashidi offers cash for five of the eight seed packs. The interface shows how many would remain for Mama Rehema.
3. Rehema asks for credit. The player may check her record and buyer, then choose one of three understandable packages.
4. Juma asks for advice about an uncertain crop problem. Amina may investigate, make a quick sale, or create a referral.
5. Neema brings the final demonstration-group request, revealing how earlier stock decisions affect the afternoon.
6. The community returns at closing so consequences become part of one coherent story.

Stock ordering and demand forecasting are intentionally outside this beginner prototype. There is no arbitrary quantity to order: the player allocates a known shelf across known people. Inventory still matters, but as a visible constraint rather than a forecasting calculation.

## Interaction principles

- Context appears one short line at a time.
- Decision controls unlock only after the player hears the request.
- Only the current encounter is revealed; later characters enter through the story.
- A “what changed?” screen follows every decision and shows before-and-after cash, stock, time, trust, or credit.
- The ALP Coach remains optional and offers a question rather than a correct answer.
- Characters return at closing, connecting earlier choices to later consequences.

## ALP curriculum alignment

The beginner scenario concentrates on representative retailer topics that can be practised without specialist forecasting knowledge:

- Fundamentals of Retail Management: Customer Care
- Finance and Accounting: Credit for Customers
- Growing Your Business: Managing Risk
- Bookkeeping Essentials: Inventory Ledger
- Fundamentals of Retail Management: Inventory and Business Cycles
- Growing Your Business: Business Relationships

The mechanics draw on the local ALP curriculum materials: listening and finding a customer solution, checking creditworthiness, setting limits and terms, recording balances, monitoring stock, protecting trust, and referring uncertain agronomic problems responsibly.

## Scenario boundary

The player, Centre, requests, prices, and outcomes are fictional. They do not depict the choices of a named participant and are not agronomic or financial advice. Product safety, crop diagnosis, credit terms, and local prices require review by Tanzania-based subject-matter experts before learner deployment.

## Play locally

Node.js 20.9 or newer is required.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify and build

```bash
npm test
npm run lint
npm run build
```

The app is a standard Next.js project configured for Vercel deployment.

## Asset note

The game-map artwork is an original AI-generated pixel-art environment. It contains no third-party game assets, characters, logos, or trademarks.
