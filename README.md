# Kijani Centre

Kijani Centre is a small browser-based agribusiness life simulation. The player is Amina, a fictional Better Life Farming agri-entrepreneur and Agribusiness Leadership Program (ALP) trainee in Tanzania's Lake Zone.

This is designed as a game, not a sequence of lessons. Across five shop days, the player decides how to spend the morning, orders stock with limited working capital, serves farmers from real inventory, structures customer credit, responds to an uncertain crop problem, and closes the shop when they choose. Decisions can create consequences several days later.

## Core game loop

1. Read the morning conditions and choose one operational priority.
2. Open the Centre and decide which people and business systems need attention.
3. Compare stock with a beginner-friendly demand range, then sell, negotiate, order, or close early.
4. Review the day's cash, trust, and readiness changes.
5. Carry stock, capital, promises, and delayed outcomes into the next day.
6. Replay with a different rain-and-demand scenario.

The ALP Coach is optional. Learning ideas unlock in Amina's notebook through play instead of interrupting the game with mandatory explanations or quiz feedback.

The stock-order screen follows the ALP Inventory Management Methods material: it uses past sales, demand patterns, seasonality, a possible buffer stock, and regular stock checks. Players see a lower and upper demand estimate, can preserve more cash by covering the lower estimate or add a small safety buffer, and can still adjust every quantity themselves.

## Scenario foundation

The setting is fictional but grounded in the documented Better Life Farming operating model in Tanzania:

- BLF Centres are locally owned rural businesses that provide inputs, agronomic advice, training, model farms, financing linkages, and market connections.
- Tanzania's BLF network includes Centres run by trained agri-entrepreneurs who serve smallholder farmers with seeds, fertilizer, pesticides, and practical advice.
- Documented retailer challenges include limited working capital, costly input transport from Arusha, bookkeeping, inventory supply, customer care, and supplier relationships.
- Agri-entrepreneurs use model farms and demo days as community learning hubs and can consult a bilingual Better Life Farming chatbot as an on-demand coach.

Primary references:

- [IFC: Inspiring a New Generation of Farming Entrepreneurs](https://www.ifc.org/en/stories/2025/inspiring-a-new-generation-of-farming-entrepreneurs)
- [IFC: Turning Tanzania's Farmers into Agri-Entrepreneurs](https://www.ifc.org/en/stories/2025/empowering-tanzania-s-farmers-one-entrepreneur-at-a-time)
- [Bayer: Better Life Farming and sustainable food systems](https://www.bayer.com/en/agriculture/zero-hunger-pledge)

The player, Centre, customer requests, prices, and outcomes are fictional. They do not depict the choices of any named real participant and are not agronomic or financial advice.

## ALP curriculum alignment

The simulation draws on these retailer topics without turning them into separate course screens:

- Bookkeeping Essentials: Inventory Ledger
- Fundamentals of Retail Management: Inventory Management Methods
- Fundamentals of Retail Management: Inventory and Business Cycles
- Fundamentals of Retail Management: Supplier Relationships
- Fundamentals of Retail Management: Customer Care
- Finance and Accounting: Credit for Customers
- Growing Your Business: Managing Risk
- Growing Your Business: Business Relationships

## Play locally

Node.js 20.9 or newer is required.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use the waiting-visitor card or the character markers to talk to farmers. The stockroom, ledger, notebook, supplier, and ALP Coach are available as optional tools.

## Verify and build

```bash
npm test
npm run lint
npm run build
```

The app is a standard Next.js project configured for zero-configuration deployment on Vercel.

## Asset note

The game-map artwork is an original AI-generated pixel-art environment created for this prototype. It contains no third-party game assets, characters, logos, or trademarks.
