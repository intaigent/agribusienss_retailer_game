# Scenario design notes

## Learner role

The player is Amina, a fictional Better Life Farming agri-entrepreneur in Tanzania's Lake Zone. She owns a rural BLF Centre, manages a small model farm, serves a network of smallholder farmers, and is completing ALP training in retail and business management.

This combines two documented roles:

- The BLF agri-entrepreneur is a local business owner, input retailer, farmer adviser, and model-farm demonstrator.
- The ALP participant applies learning to their enterprise with coaching and a business development plan.

## World assumptions

- Place: a fictional village in or near Bunda District in northern Tanzania.
- Season: early October, ahead of the vuli rains.
- Shop: the Centre opens around 7 AM and serves farmers with seed, fertilizer, registered crop-care products, and drip-irrigation parts.
- Constraints: working capital, delivery costs from Arusha, uncertain rain, seasonal demand, customer liquidity, and the reputational responsibility of agronomic advice.
- Network: farmers, a distributor, a BLF agri-consultant, buyers, model farms, demo days, ALP material, and the optional ALP Coach.
- Numbers: prices, stock levels, demand, dates, and financial outcomes are illustrative game values, not field recommendations.

## Simulation model

The game persists four interacting systems across five days:

| System | Player action | State carried forward |
| --- | --- | --- |
| Working capital | Buy stock, make sales, extend credit, pay for follow-up | Available cash and unsettled customer balances |
| Inventory | Order by product, reserve uncertain stock, fill or partially fill orders | Live units of seed, fertilizer, crop care, and drip kits |
| Relationships | Serve, miss, investigate, follow up, or make a weak recommendation | Farmer trust and word-of-mouth outcomes |
| Operational readiness | Stocktake, call farmers, prepare the model farm, use evidence | Ability to respond well to later demand and crop questions |

## Five-day arc

1. **Opening week:** learn the shop through ordinary cash orders and decide whether to restock.
2. **Credit and cash flow:** build a package for Mama Rehema instead of answering a binary credit question.
3. **Rain signal:** earlier inventory and reservation choices meet a revealed demand scenario.
4. **Advice under pressure:** choose how much to investigate and whether to sell, verify, or refer.
5. **Demo and market day:** repayments, advice outcomes, and community word-of-mouth arrive alongside normal demand.

## Game loop

```text
Short morning scene (one line at a time)
      ↓
Choose one operational priority
      ↓
Open shop: hear a request, then use the relevant controls
      ↓
Player decides when the day is over
      ↓
Daily cash / trust / readiness recap
      ↓
Delayed consequences and changed demand enter a later morning
```

There is no mandatory evidence count, multiple-choice “correct answer,” or field-guide completion gate. The loop asks the player to form a plan, operate the business, and adapt after consequences.

## Learning layer

- The ALP Coach is a voluntary nudge and does not reveal a correct answer.
- Amina's notebook unlocks short principles when the player uses the relevant system.
- Day-end recaps show state changes in the business rather than grading the player.
- Replay rotates among late, early, and uneven rain scenarios so the same stock choice can produce a different result.
- Context arrives before controls: morning choices, customer actions, and the supplier order book stay hidden until the player has clicked through the short scene.

## ALP material used to shape the scenarios

The scenario mechanics were checked against the agribusiness-retailer learning path and its beginner short messages. The game uses the following content as behavior to practise, rather than text to recite:

| ALP topic | Learning-material emphasis | Simulation mechanic |
| --- | --- | --- |
| Inventory Management Methods | Use past sales, demand patterns, seasonality, buffer stock, forecasting, and regular stock checks | A visible demand range, live shelf stock, lower-estimate and safety-buffer starting plans, plus manual adjustment |
| Supplier Relationships | Prepare for delays and higher costs; use creative financing and stronger supplier relationships | Arusha transport cost, same-day ordering, and a paid option for later seed stock |
| Credit for Customers | Set limits and terms, use written agreements, monitor borrowers, keep a credit ledger, and assess repayment history | Package sizing, deposit and payment timing, ledger and buyer checks, and delayed repayment results |
| Customer Care | Solve customer problems with empathy; service affects repeat sales and referrals | Full, partial, or missed service changes trust and later community word-of-mouth |
| Controlling Costs | Understand costs before setting prices and committing cash | Product cost, transport, total paid today, and cash remaining are shown together |
| Managing Risk | Identify threats early and take practical steps to reduce exposure | Rain uncertainty, stock options, verified crop advice, and delayed outcomes |

For beginner clarity, the game avoids unexplained inventory jargon. The order screen directly answers: **What is on the shelf? What might farmers need? What will be on the shelf after this order?** The range is intentionally visible; uncertainty comes from the season, not from missing information.

## Content boundary

The game is a learning prototype, not agronomic, financial, or regulatory advice. Product registration, diagnosis, credit terms, local prices, crop calendars, and treatment decisions should be localized and reviewed by Tanzania-based subject-matter experts before learner deployment.
