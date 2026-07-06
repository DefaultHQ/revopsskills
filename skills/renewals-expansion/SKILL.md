---
name: renewals-expansion
description: "When the user wants to run revenue after the first close: renewal pipeline, churn forecasting, health scores, expansion motions, and net revenue retention mechanics. Use when the user says 'set up a renewal pipeline', 'forecast our renewals', 'build a health score', 'churn keeps surprising us', 'when should renewal opportunities be created', 'who should own renewals', 'design our expansion motion', 'should CS or sales sell the upsell', 'calculate NRR', 'break down net revenue retention', 'early warning signals for churn', 'our renewal dates in the CRM are wrong', or 'usage-based expansion triggers'. For new-business forecast methodology, see forecasting. For the sales-to-customer-success handoff at closed-won, see handoffs."
metadata:
  version: 1.0.0
---

# Renewals and Expansion

You are a revenue operations lead who treats the installed base as a pipeline, not an afterthought. Renewal and expansion revenue gets the same stage discipline, forecast rigor, and data hygiene as new business, because at most companies past year two it is the larger number.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (it covers motion, segments, average contract value, stack, and team shape). Then gather:

1. Book shape: total annual recurring revenue (ARR), customer count, contract lengths, and whether contracts auto-renew.
2. Current renewal process: when a renewal opportunity is created (if at all), who owns it, and what stages it moves through.
3. Retention history: gross and net retention for the last 4 quarters if known, and the last 5 to 10 churns with reasons.
4. Health signals available: product usage data, support ticket system, and whether champion or executive contacts are tracked in the customer relationship management (CRM) system.
5. Team shape: customer success (CS) headcount, accounts per customer success manager (CSM), and whether account executives (AEs) keep any post-sale role.
6. Renewal-date confidence: where renewal dates live and whether anyone has audited them against contracts.

Work with whatever the user provides. Note gaps explicitly in the output, and never block on missing inputs.

## Core Principles

### A renewal is an opportunity, not a date on a calendar

Renewals get created as opportunities 90 to 120 days out, staged, inspected, and forecast weekly like new business. Companies that discover a renewal 3 weeks before the date have already lost most of their negotiating room and all of their save window.

### A health score is only as good as its back-test

A score that never gets checked against actual churn drifts into a vanity metric that CSMs game and executives ignore. Back-test quarterly: pull last quarter's churns and check what the score said 90 days earlier. If it did not flag most of them, change the inputs.

### Churn is decided months before the renewal date

By the time a renewal conversation starts, usage trends and champion changes have mostly settled the outcome. The operating system for retention is early-warning signals with lead time, not heroic saves at day 30.

### Expansion is a designed motion, not a happy accident

Waiting for customers to ask for more seats leaves the predictable part of the growth on the table. Usage triggers, defined plays, and clear opportunity-creation rules turn expansion into pipeline that can be forecast.

### Wrong renewal dates make everything else fiction

Every framework in this skill keys off the renewal date. If the CRM dates are wrong, the pipeline, the forecast, and the early-warning windows are all wrong with them. Audit the dates first.

## Renewals as Pipeline

Create the renewal opportunity 90 to 120 days before the renewal date (120 to 180 for enterprise deals with procurement cycles), automatically, from the contract record. Amount defaults to current contract value; owner assigned by the ownership model below.

Stage the renewal like a deal:

| Stage | Entry criteria | Target timing before renewal |
|-------|----------------|------------------------------|
| Upcoming | Auto-created from contract | 120 days |
| Engaged | Renewal conversation held with the economic buyer, not just the day-to-day user | 90 days |
| Proposal | Terms and pricing delivered | 60 days |
| Verbal / At risk | Verbal commit, or an explicit risk flag with a named reason | 30 to 45 days |
| Closed won / lost / contracted churn | Signature, non-renewal, or downgrade booked | 0 |

Two rules keep this honest. First, an "at risk" flag requires a named reason from a fixed list (champion left, usage down, budget cut, competitor eval, merger and acquisition activity, sponsor unresponsive), because free-text risk reasons cannot be aggregated. Second, a renewal sitting in "Upcoming" inside 60 days is itself a risk signal and should appear on the weekly inspection list.

## Renewal Forecasting

Forecast renewals by category, the same shape as new-business forecasting, with the health score setting the default category:

| Category | Default rule | Typical weighting |
|----------|--------------|-------------------|
| Commit | Verbal or signature in hand | 95 to 100 percent |
| Best case | Healthy score, engaged, no open risk flag | 80 to 90 percent |
| Watch | Mixed signals or one open risk flag | 50 to 70 percent |
| At risk | Red health score or 2+ risk flags | 10 to 40 percent |

The weighted sum gives the quarter's gross renewal forecast. Owners can override the default category, but every override needs a stated reason, and override accuracy gets tracked per owner per quarter, exactly as forecast discipline works on the new-business side. A well-run renewal forecast lands within 2 to 3 percent of actual by week 4 of the quarter; renewals are far more forecastable than new business because the population is known.

Healthy gross renewal outcomes for business-to-business (B2B) software as a service (SaaS): 85 to 92 percent of dollars up for renewal in mid-market, 90 to 95 percent in enterprise, 75 to 85 percent in small-business books. These shift with contract value and motion; ranges assume annual contracts.

## Health Scoring and Early Warning

Keep the model to 4 to 6 inputs that are actually measurable in the current stack. A typical weighting:

| Input | Weight | What to measure |
|-------|--------|-----------------|
| Usage trend | 30 to 40 percent | 90-day trend in the 1 or 2 actions that correlate with renewal, per licensed seat, not raw logins |
| Breadth of adoption | 15 to 20 percent | Active seats as a share of licensed seats; features adopted beyond the landing use case |
| Champion status | 15 to 20 percent | Champion still employed and active (job-change monitoring plus meeting attendance) |
| Executive engagement | 10 to 15 percent | Economic buyer touched in the last quarter (business review attended, exec thread alive) |
| Support pattern | 10 to 15 percent | Ticket trend and severity mix; a sudden silence after heavy ticketing is as bad as escalations |
| Commercial signals | 0 to 10 percent | Late payments, downgrade inquiries, procurement asking about terms mid-cycle |

Score to red, yellow, and green rather than a false-precision 0 to 100 displayed to executives. Then keep it honest with a quarterly back-test: for every churn in the last 2 quarters, record what the score was at 90 days out. Target catching 70 percent or more of churned dollars in yellow or red at 90 days. Also check the false-alarm side: if more than half of red accounts renew without intervention, the score cries wolf and CSMs will stop responding to it.

Early-warning signals ranked by lead time:

| Signal | Typical lead time before churn |
|--------|-------------------------------|
| Champion departs | 3 to 6 months |
| Usage decline of 30 percent or more sustained over 60 days | 3 to 6 months |
| Executive sponsor disengages (skipped reviews, dead threads) | 3 to 4 months |
| Seat utilization falling below roughly 50 percent | 3+ months |
| Support tone shift: escalations, or abrupt silence | 1 to 3 months |
| Procurement or finance asks about terms, notice periods | 1 to 2 months |

Each signal needs a wired response: champion departure triggers a multi-thread play within a week, not a note in the next business review deck.

## Expansion Motion Design

Design expansion around triggers, plays, and creation rules:

1. **Usage triggers.** Seat utilization above 80 to 90 percent, usage approaching a plan limit, a new team or geography appearing in the account, or adoption of a feature that maps to a higher tier. Each trigger fires a defined play with an owner and a deadline.
2. **Opportunity creation rules.** Create an expansion opportunity when there is a qualified conversation about specific scope, not when a trigger merely fires. Triggers create tasks; conversations create pipeline. This keeps expansion pipeline real enough to forecast.
3. **Timing.** Mid-contract expansions on co-terms keep the renewal date clean. Bundling every expansion into the renewal conversation hands the customer a discount lever; where possible, sell the expansion when the need appears.

Who sells the expansion:

| Model | Works when | Tradeoff |
|-------|-----------|----------|
| CS sells it | Low to mid ACV, expansions are mostly seats and tiers | Cheapest motion, but many CSMs avoid commercial conversations without comp and training changes |
| CS sources, sales closes | Mid ACV, expansions need negotiation | Clean division of labor; requires a crisp handoff rule and split credit, or the sourcing dries up |
| AE or account manager owns it | Enterprise, expansions are new business units or products | Strongest at complex deals, but the AE's attention follows the biggest number, so small expansions stall |

Whichever model is chosen, put a number on it: expansion typically contributes 15 to 30 percent of gross new ARR at healthy mid-market SaaS companies, and whoever owns it needs that number in their compensation plan.

## Net Revenue Retention Mechanics

Net revenue retention (NRR) for a period: take the ARR of a customer cohort at the period start, then measure that same cohort at period end, including expansion and contraction, excluding any new logos added during the period.

```
NRR = (starting ARR + expansion - contraction - churn) / starting ARR
```

Worked example for a 12-month window:

```
Starting ARR (cohort)      $10,000,000
+ Expansion                 $1,500,000
- Contraction                 $400,000
- Churn                       $800,000
= Ending cohort ARR        $10,300,000

NRR  = 10,300,000 / 10,000,000 = 103%
GRR  = (10,000,000 - 400,000 - 800,000) / 10,000,000 = 88%
```

Gross revenue retention (GRR) strips expansion and cannot exceed 100 percent; it is the honest measure of whether customers keep what they bought. Report both, because a 110 percent NRR built on 80 percent GRR is a leaky bucket hidden by a few whales expanding. Typical B2B SaaS ranges: NRR of 100 to 115 percent overall, with small-business books at 85 to 100 percent and enterprise at 105 to 125 percent; GRR of 80 to 90 percent in mid-market and 90 to 95 percent in enterprise. Ranges shift with contract value, pricing model (usage-based pricing inflates both tails), and motion.

## Ownership Models and Renewal-Date Hygiene

Ownership by annual contract value (ACV), as typical breakpoints rather than laws:

| ACV band | Default owner | Notes |
|----------|---------------|-------|
| Under $10k to $15k | Automated or pooled | Auto-renew by default, digital touch, humans only on risk flags. A CSM per account does not pay for itself here |
| $15k to $75k | CS-owned renewals | CSM runs the renewal with deal-desk support on pricing; comp needs a retention component |
| $75k+ or heavy negotiation | Dedicated renewals manager or AE-owned | Dedicated renewal roles typically appear around $5M to $10M of annual renewable ARR, when negotiation volume outgrows CS capacity |

The tradeoff to name explicitly: CS-owned keeps the relationship and the commercial conversation in one seat but asks a service-oriented role to negotiate; a dedicated renewals team negotiates well but adds a handoff; AE-owned works for enterprise repricing but starves renewals of attention whenever new-business quota is behind.

Renewal-date hygiene is the precondition for all of it. Audit before building anything else:

- Reconcile every CRM renewal date against the signed contract (or the billing system) for at least the top 80 percent of ARR. Error rates of 10 to 20 percent are common on a first audit.
- Define one source of truth for the date, usually the contract or billing record, and sync it to the CRM field the automation reads. Two fields with two dates guarantees the wrong one gets used.
- Handle the known offenders: auto-renew clauses with 30, 60, or 90-day notice windows (track the notice deadline as its own date), co-terms and mid-term amendments that moved the date, and multi-year deals where someone entered the signature anniversary instead of the term end.
- Re-audit quarterly with an exception report: renewals inside 90 days with no opportunity, opportunities whose date disagrees with the contract, and contracts with no date at all.

Common Mistakes:

- Renewal opportunities created manually "when the CSM gets to it," which means the risky ones get created last.
- A health score with 15 inputs nobody can explain, never back-tested against actual churn.
- Green scores driven by login counts while the champion has already left.
- Treating auto-renew notice deadlines as the renewal date, and missing the real decision window.
- Expansion pipeline stuffed with fired triggers instead of qualified conversations, so the forecast is fantasy.
- Reporting NRR without GRR, hiding churn under whale expansion.
- CSMs asked to negotiate renewals with no retention component in their comp.
- Building forecast automation on renewal dates nobody has reconciled with contracts.

## Output Format

Produce a renewals and expansion operating plan or audit as a markdown document with:

1. **Date hygiene report:** sample audit results, source-of-truth decision, and the exception report spec.
2. **Renewal pipeline spec:** creation trigger and timing, stages with entry criteria, risk-reason picklist, and weekly inspection list.
3. **Forecast model:** categories, default weightings, override rules, and the accuracy tracking plan.
4. **Health score spec:** inputs, weights, red/yellow/green thresholds, back-test procedure, and the wired response per early-warning signal.
5. **Expansion motion:** triggers, plays, opportunity creation rules, and the ownership recommendation with the tradeoff stated.
6. **NRR baseline:** current NRR and GRR calculated from whatever data exists, with the component breakdown.
7. **Gaps:** every input the user could not provide, with the assumption used in its place.

## Related Skills

- **forecasting**: the category-and-accuracy machinery this skill mirrors for renewals
- **handoffs**: the sales-to-CS handoff that determines what the post-sale team inherits
- **metrics-dictionary**: canonical NRR, GRR, and churn definitions to keep reporting consistent
- **data-hygiene**: the broader cleanup discipline behind the renewal-date audit
- **dashboards**: turning the renewal pipeline and health scores into views people open
