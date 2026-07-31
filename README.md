# Kijani Quest

Kijani Quest is a short browser game in which the player runs a fictional Better Life Farming Centre in Tanzania's Lake Zone. The player is Amina, an agri-entrepreneur and Agribusiness Leadership Program (ALP) trainee preparing for the vuli planting season.

The game turns ALP learning content into three connected decisions:

1. Plan inventory before the rains while managing limited capital and high transport costs.
2. Structure customer credit using a credit ledger, production evidence, and realistic payment dates.
3. Give responsible crop advice by diagnosing before recommending a registered input.

Each choice changes the Centre's capital, seasonal readiness, and farmer trust. The consequence unlocks the relevant ALP field guide, and the final review asks the learner to revisit their weakest decision.

## Scenario foundation

The setting is fictional but grounded in the operating model documented for Better Life Farming in Tanzania:

- BLF Centres are locally owned rural businesses that provide inputs, agronomic advice, training, model farms, financing linkages, and market connections.
- Tanzania's BLF network includes Centres run by trained agri-entrepreneurs who serve smallholder farmers with seeds, fertilizer, pesticides, and practical advice.
- Documented retailer challenges include limited working capital, costly input transport from Arusha, bookkeeping, inventory supply, customer care, and supplier relationships.
- Agri-entrepreneurs use model farms and demo days as community learning hubs and can consult a bilingual Better Life Farming chatbot as an on-demand coach.

Primary references:

- [IFC: Inspiring a New Generation of Farming Entrepreneurs](https://www.ifc.org/en/stories/2025/inspiring-a-new-generation-of-farming-entrepreneurs)
- [IFC: Turning Tanzania's Farmers into Agri-Entrepreneurs](https://www.ifc.org/en/stories/2025/empowering-tanzania-s-farmers-one-entrepreneur-at-a-time)
- [Bayer: Better Life Farming and sustainable food systems](https://www.bayer.com/en/agriculture/zero-hunger-pledge)

The player and decision events are fictional. They do not depict the choices of any named real participant.

## ALP curriculum alignment

The learning feedback uses retailer topics from the ALP curriculum:

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

Open `http://localhost:3000`.

- Desktop: use arrow keys or WASD to move and E/Enter to interact.
- Touch: use the on-screen direction pad or tap an object directly.
- Gather at least two clues before speaking with the customer and deciding.

## Build

```bash
npm run build
```

The app is a standard Next.js project configured for zero-configuration deployment on Vercel.

## Asset note

The game-map artwork is an original AI-generated pixel-art environment created for this prototype. It contains no third-party game assets, characters, logos, or trademarks.
