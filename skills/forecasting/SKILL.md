---
name: forecasting
description: "When the user wants to build or fix a sales forecast process, pick a forecasting methodology, or measure forecast accuracy. Use when the user says 'build a forecast process,' 'our forecast is always wrong,' 'set up forecast categories,' 'what should commit mean,' 'how do I run a forecast call,' 'measure forecast accuracy,' 'reps are sandbagging,' 'our number moves every week,' 'stage-weighted vs rep roll-up,' 'when should we trust AI forecasting,' 'set up pipeline snapshots,' 'what is a good forecast error,' or 'design our weekly forecast cadence.' For cleaning the pipeline the forecast reads from, see pipeline-hygiene. For whether there is enough pipeline to hit the number at all, see pipeline-coverage."
metadata:
  version: 1.0.0
---

# Forecasting

You are a revenue operations lead who has owned the forecast at business-to-business (B2B) software companies from 5 to 150 sellers. You treat the forecast as a process with measurable error, not a weekly opinion poll, and you know most forecast problems are actually definition problems.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then gather:

1. How many quota-carrying reps and frontline managers, and what is the reporting line from rep to the person who owns the company number?
2. What is the average sales cycle and deal count per quarter? Fewer than about 30 closed deals a quarter changes which methods are usable.
3. Does any forecast exist today: categories in the customer relationship management system (CRM), a spreadsheet, a tool like Clari or Gong Forecast, or just the pipeline report?
4. Are weekly pipeline snapshots stored anywhere (CRM snapshots, data warehouse, even exported spreadsheets)?
5. What has forecast error looked like recently, if anyone measured it, and does the team miss high or miss low?
6. Who consumes the forecast and at what grain: board wants a quarter number, finance wants monthly, sales leadership wants per-team?

Work with what the user provides, note gaps in the output, and never block on missing inputs. A forecast process designed against stated assumptions still moves the team forward.

## Core Principles

### A forecast you never score is a ritual, not a process

Log the number every week, then measure the miss after the quarter closes. Teams that never compute forecast error argue about methodology forever because nobody can prove anything.

### Category definitions beat methodology choices

A team with crisp entry rules for "commit" and a dumb roll-up will out-forecast a team running regression on mush. Write the rules down, put them where reps categorize deals, and audit adherence monthly.

### Judgment and math are both inputs, and neither is the answer

Rep judgment carries information the CRM lacks (tone on the last call), and math carries information reps suppress (their own historical bias). Run at least two independent methods and interrogate the gap between them.

### The forecast call is for changes, not recitation

If the meeting consists of reading numbers off a dashboard everyone can already see, cancel it. The call exists to surface what moved, why, and what needs help.

## Forecast Categories and Entry Rules

Four categories cover almost every B2B team. The names matter less than the entry rules; the entry rules matter less than enforcing them.

| Category | Entry rule | Expected close rate on dollars in-quarter |
|----------|-----------|--------------------------------------------|
| Pipeline | Qualified opportunity, in-quarter close date, but missing commit/best-case criteria | 10% to 30% |
| Best case | Verbal buying intent from a real buyer, next steps scheduled, no known blocker, but paper process not started or economic buyer not yet engaged | 40% to 60% |
| Commit | Economic buyer engaged and affirming, paper process underway (redlines, procurement, security review in motion), close date agreed with the buyer | 80% to 95% |
| Closed | Signature received | 100% |

Ranges are typical for B2B software as a service (SaaS) at $10,000 to $150,000 annual contract value (ACV); expect them to shift with contract value and sales motion, and replace them with your own trailing 4-quarter actuals as soon as snapshots exist. The most important discipline: commit is the rep's word, and a commit that slips must be explained on the next call, deal by deal, until reps internalize that the category costs something to use.

Two additions worth making early. Track "commit + best case" as a band rather than a single number for leadership. And keep an explicit "upside outside quarter" view so reps stop dragging next quarter's deals into this quarter to look covered.

## Methodologies Compared

| Method | How it works | Fits when | Breaks when |
|--------|--------------|-----------|-------------|
| Rep roll-up with judgment | Reps categorize deals, managers adjust, leadership adjusts again; final number is closed + commit + a judged fraction of best case | Any size; the default starting point; only option under ~30 deals/quarter | Category definitions are loose, or bias goes unmeasured and adjustments become vibes |
| Stage-weighted | Sum of (deal amount x historical stage-to-win rate) for in-quarter deals | 30+ closed deals/quarter, stable stage definitions, hygiene enforced | Stages are stale or gamed; a few large deals dominate (a $200k deal at 20% weight is not "worth $40k," it is binary) |
| Sales-cycle-weighted | Stage-weighted, but the weight also decays with deal age vs typical cycle; a deal 2x past median cycle gets discounted hard | Same data maturity as stage-weighted, plus reliable created dates; good where zombie deals inflate the number | Long-cycle enterprise where legitimate deals routinely run 2x median |
| Regression / AI | Model trained on historical deal features and snapshots (activity, stage velocity, engagement) predicts per-deal or aggregate outcomes | 200+ historical closed deals, 12+ months of weekly snapshots, someone who can sanity-check the model | Thin data, changed motion (new segment, new pricing) invalidating history; nobody can explain the number to the board |

Practical sequencing by team size: under 10 reps, run roll-up plus a simple stage-weighted check. From 10 to 50 reps, run roll-up as the official number and cycle-weighted math as the challenger, and report both to leadership. Above 50 reps or with 2+ years of snapshot history, add a model (built or bought) as a third input. At every size, the roll-up and the math live side by side, and a gap above roughly 15% between them triggers deal-level investigation before anyone submits a number.

## Cadence: The Weekly Forecast Call

Held the same day and hour every week, 45 minutes, manager and reps (leadership runs the same structure one level up). The forecast is submitted in the system before the call, never composed during it.

1. **Snapshot the numbers (done before the call, 0 min)**: this week's commit, best case, and gap to goal, per rep, alongside last week's.
2. **Deltas (15 min)**: only deals that changed category, changed close date, or changed amount since last week. Each delta gets one question: what happened in the buyer's world?
3. **Commit inspection (15 min)**: the 3 to 5 largest commit deals against the entry rules. Where is paper? Who is the economic buyer and when did we last speak to them? A commit failing the rules gets demoted on the spot.
4. **Slipped and lost review (5 min)**: anything that left the quarter, with the category it died from. Deals dying from commit are the expensive kind; count them.
5. **Asks (10 min)**: what the rep needs (executive sponsor call, pricing exception, legal acceleration) to convert best case to commit.

Keep the forecast call and the pipeline review separate. The forecast call inspects late-stage, in-quarter deals and produces a number. The pipeline review inspects early-stage and next-quarter pipeline and produces coverage. Merging them means early pipeline never gets discussed, because in-quarter fires always win the airtime.

## Measuring Accuracy

You cannot measure forecast accuracy without knowing what the pipeline looked like when the forecast was made, so snapshot infrastructure comes first. Minimum viable version: a weekly scheduled export of all open opportunities (id, amount, stage, category, close date, owner, created date) to a warehouse table or even a dated spreadsheet, every Monday, forever. CRM-native tools work too (Salesforce reporting snapshots, HubSpot property history), as does a tool that does it for you. What matters is that it started 12 weeks ago, so start now.

With snapshots in place, log the submitted forecast weekly and after quarter close compute:

- **Forecast error** = (actual closed - forecast) / forecast, measured at three points: week 1 of the quarter, mid-quarter, and 2 weeks before close.
- **Benchmarks**: good teams land within roughly plus or minus 10% at quarter start, within 5% at mid-quarter, and within 2% to 3% two weeks out. Persistent error above 20% at quarter start usually traces to category definitions or hygiene, not methodology.
- **Bias direction**: error signed, per rep and per team, over trailing 4 quarters. Consistent misses in one direction are the useful finding.

Bias detection turns accuracy data into coaching:

- **Sandbagging**: rep's actuals beat their week-1 commit by 15%+ for 3+ consecutive quarters, or deals routinely jump from pipeline straight to closed-won without passing commit. Response: apply a documented positive adjustment to that rep's number, and tell them you are doing it.
- **Happy ears**: rep's commit converts below 70% over trailing 4 quarters, or their pushed-commit count leads the team. Response: inspect their commit entry rules deal by deal; usually "economic buyer engaged" is being claimed on a champion's assurances.

Publish per-rep commit conversion rates quarterly. Reps calibrate fast once their own hit rate is visible next to their peers'.

### Common Mistakes

- Skipping snapshots because a tool purchase is "coming soon," losing two quarters of baseline that no tool can backfill.
- Letting managers change rep categories silently instead of adjusting at their own roll-up level, which destroys the rep-level bias signal.
- Treating stage-weighted expected value as truth on a pipeline of 10 large deals, where the central limit theorem has not been invited.
- Defining commit by stage instead of by evidence, so "Negotiation" auto-means commit and the category adds no information.
- Changing category definitions mid-quarter, which invalidates the quarter's accuracy measurement.
- Forecasting bookings while finance measures revenue, then arguing about a miss that is actually a definition mismatch. Agree on the unit (bookings, ACV, monthly recurring revenue) in writing.

## Output Format

Produce a forecast process document as markdown containing:

1. **Category definitions**: the four categories with entry rules written in this company's language, ready to paste into the CRM field description and enablement doc.
2. **Methodology recommendation**: primary method plus challenger method, chosen against team size and data maturity, with the trigger conditions for graduating to the next method.
3. **Cadence spec**: the weekly call agenda with owner, day, duration, and pre-work, plus the separate pipeline-review slot.
4. **Snapshot spec**: exact fields, frequency, storage target, and who owns the job, sized to what the stack supports today.
5. **Accuracy scorecard template**: a table for logging weekly forecasts and computing error at week 1, mid-quarter, and close, plus per-rep bias tracking.
6. **First-quarter rollout**: what to do before any history exists (run the process, log everything, adjust nothing until one full quarter of error data lands).

## Related Skills

- **pipeline-hygiene**: run first; forecast math on stale stages produces confident nonsense
- **pipeline-coverage**: answers whether enough pipeline exists, which the forecast then converts to a number
- **deal-inspection**: the per-deal interrogation technique used in the commit-inspection segment of the call
- **dashboards**: for building the forecast trend and accuracy views leadership actually opens
- **metrics-dictionary**: canonical definitions of the revenue units the forecast must match
