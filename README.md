# Kijani Centre

Kijani Centre is a small browser-based agribusiness life simulation. The player is Amina, a fictional Better Life Farming agri-entrepreneur and Agribusiness Leadership Program (ALP) trainee in Tanzania's Lake Zone.

The prototype follows one connected vuli market day rather than several thin course-like episodes. Four characters arrive in sequence, and every choice changes the stock, cash, time, credit exposure, or trust available in the next encounter.

## The market-day story

1. A short sentence-by-sentence briefing establishes Amina's fixed stock and known commitments.
2. Rashidi offers cash for five of the eight seed packs. The player chooses between two visible ways to share the shelf—there is no quantity slider.
3. Rehema asks for credit. The player may check her record and buyer, then choose between two visible baskets; a larger risk stays behind an optional secondary action.
4. Juma arrives at 2:00 PM with an uncertain crop problem. Evidence checks advance the clock toward a real 3:00 PM demonstration deadline.
5. Neema brings the final demonstration-group request, reflecting both earlier stock allocation and whether Amina arrived on time.
6. The community returns at closing, the books reconcile, and a transparent Balanced Centre Score explains the result.

Every decision lands in three short beats: the customer responds in their own voice, the player watches the choice move the shelf, cash tin, clock, or relationship, and then Amina puts the matching paper slip into a physical colour-coded book. The customer reaction comes first so a decision feels human before it becomes a number.

Stock ordering and demand forecasting are intentionally outside this beginner prototype. There is no arbitrary quantity to order: the player allocates a known shelf across known people. Inventory still matters, but as a visible constraint rather than a forecasting calculation.

## Interaction principles

- Context appears one short line at a time.
- Decision controls unlock only after the player hears the request.
- Only the current encounter is revealed; later characters enter through the story.
- After every request, Coach Zawadi offers one curriculum-grounded sentence. “Why?” reveals a short explanation; the full lesson remains in her desk panel.
- Decisions use physical objects and short actions: seed packets on a wooden shelf, notes beside a notebook, evidence objects, and a moving clock.
- A decision screen avoids paragraphs, sliders, and dense forecasts. Detailed consequences appear only after the choice.
- Customers grin, hesitate, redraw plans, ask follow-up questions, or carry worries away according to the player's choice.
- A consequence scene follows the reaction and animates only the cash, stock, time, trust, or credit values that actually changed.
- Each consequence creates source documents that the player classifies into the cash ledger, inventory card, customer credit ledger, expense ledger, or follow-up log.
- Incorrect bookkeeping choices receive an instructional Coach explanation and can be corrected without blocking the learner.
- The 3:00 PM deadline changes the following scene and the closing outcome; elapsed time comes from in-game actions rather than reading speed.
- Characters return at closing, connecting earlier choices to later consequences.
- Course language stays behind the scenes; visible copy favours neighbourly dialogue, physical objects, and small moments of humour.

## Balanced Centre Score

The shareable closing result totals 100 points without treating cash as the sole definition of success:

- Farmer value and trust: 20
- Bookkeeping accuracy: 25
- Stock and cash stewardship: 20
- Credit and product-risk management: 20
- Time and demonstration readiness: 15

Bookkeeping awards first-attempt accuracy as well as complete reconciliation. Multiple responsible routes can score well because safety, service, time, and business sustainability sometimes pull in different directions.

## ALP curriculum alignment

The beginner scenario concentrates on representative retailer topics that can be practised without specialist forecasting knowledge:

- Fundamentals of Retail Management: Customer Care
- Finance and Accounting: Credit for Customers
- Growing Your Business: Managing Risk
- Bookkeeping Essentials: Inventory Ledger
- Bookkeeping Essentials: Cash Ledger and Expense Ledger
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
