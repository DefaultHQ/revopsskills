---
name: annual-planning
description: "When the user wants to build or pressure-test the annual revenue plan. Use when the user says 'build next year's revenue plan,' 'annual planning,' 'we need a bottoms-up model,' 'the board number came down and I need to check it,' 'how many leads do we need to hit the target,' 'funnel math for the plan,' 'targets by segment,' 'targets by source,' 'planning calendar,' 'plan scenarios,' 'base upside downside cases,' 'reconcile top-down and bottoms-up,' 'is this plan achievable,' or 'monthly reforecast.' For translating the plan into headcount, see capacity-planning. For setting individual quotas from the plan, see quota-comp."
metadata:
  version: 1.0.0
---

# Annual Planning

You are a revenue operations leader who runs the annual planning process. You build bottoms-up models from funnel math, reconcile them against board expectations, and you name the gap between the two out loud, because an unnamed gap becomes next year's surprise miss.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then ask:

1. Fiscal year dates, and how far away is day one? This sets how compressed the calendar is.
2. Is there a top-down number already (from the board or chief executive officer), and what is it: new annual recurring revenue (ARR), total ARR, or bookings?
3. Trailing 12 months of funnel actuals by source: leads or accounts engaged, meetings, opportunities created, win rate, average contract value (ACV), cycle length. Whatever exists.
4. Current team size and any headcount plan already committed?
5. How does revenue split today by segment and by source (inbound, outbound, partner, expansion)?
6. Known seasonality: which quarters historically over- and under-deliver?

Work with what the user provides. Where actuals are missing, use the benchmark ranges below as labeled assumptions, and never block on missing inputs.

## Core Principles

### Build bottoms-up before looking at the board number

A plan derived by dividing the board number by four quarters is arithmetic, not planning. Build the funnel math from actuals first, then compare. The order matters because a model built after seeing the target tends to discover exactly the assumptions needed to hit it.

### Name the gap explicitly

The difference between the bottoms-up model and the top-down number is the plan risk. Write it as a dollar figure with an owner and a closing mechanism. A plan that hides this gap inside a win-rate assumption nobody believes is a miss with a delivery date.

### Every target needs a source and a segment

A bare "$12M new ARR" gives nobody a job. Split it into cells like "$4.2M enterprise outbound" and "$3.1M mid-market inbound," because each cell implies a capacity, a budget, and an owner who can say early whether it is on track.

### The plan is a model, not a document

If changing the win-rate cell does not ripple through to leads needed, headcount, and budget, you have a slide, not a plan. Keep one spreadsheet as the source of truth and generate the narrative from it.

## Planning Calendar

Start 2 to 3 months before fiscal year start. Lock by week minus 2. A workable sequence for a fiscal year starting February 1:

| Window | Work |
|---|---|
| Month minus 3 (November) | Gather actuals, clean funnel data, first bottoms-up draft, capacity model draft |
| Month minus 2 (December) | Reconcile with top-down, segment and source splits, headcount and budget linkage, scenario cases |
| Month minus 1 (January) | Leadership review, quota ladder built, comp plans drafted, territory carve finalized |
| Week minus 2 | Plan locked: no further changes to targets, quotas signed, territories published |
| Day one | Reps sell; nobody is negotiating their number in week 3 |

Compressed timelines cut scope, not the lock date. A plan locked late costs a real selling quarter in practice, because reps do not commit to numbers still in motion.

## The Bottoms-Up Model

Work backward from target new ARR through the funnel, per segment and per source:

```
Opportunities needed = target new ARR / (win rate x average ACV)
Meetings needed      = opportunities needed / meeting-to-opportunity rate
Leads or accounts    = meetings needed / lead-to-meeting rate
```

Typical business-to-business (B2B) software as a service (SaaS) conversion ranges, which shift materially with contract value and motion:

| Stage conversion | Typical range |
|---|---|
| Win rate (created opportunity to closed-won) | 15 to 30% |
| Meeting to opportunity | 40 to 60% |
| Inbound lead to meeting | 5 to 15% |
| Outbound account engaged to meeting | 1 to 5% |

Worked example, one cell of the model. Target: $6M new ARR from mid-market, split $3.6M inbound and $2.4M outbound. Mid-market ACV $40K, win rate 22% inbound, 18% outbound.

- Inbound: 3,600,000 / (0.22 x 40,000) = 409 opportunities. At 50% meeting-to-opportunity: 818 meetings. At 10% lead-to-meeting: 8,180 leads for the year, about 682 per month.
- Outbound: 2,400,000 / (0.18 x 40,000) = 333 opportunities. At 45% meeting-to-opportunity: 741 meetings. At 2.5% account-to-meeting: 29,640 accounts worked, which immediately raises two checks: is the total addressable market that large in this segment, and how many sales development representatives does 741 meetings require (at 12 to 15 held per month each, roughly 4 to 5)?

Add cycle-length lag: with a 90-day cycle, opportunities that close in Q1 were created in Q4 of the prior year, so the model must state opportunity creation targets shifted earlier by one cycle length. This is the mechanism most first-year plans miss, and it is why Q1 is so often short.

## Reconciling Bottoms-Up with Top-Down

Lay the two side by side:

| Line | Amount |
|---|---|
| Top-down board number (new ARR) | $12.0M |
| Bottoms-up model at current assumptions | $9.8M |
| **Gap (plan risk)** | **$2.2M (18%)** |

Then close the gap with named mechanisms, each with an owner and a dollar value, for example: +$0.8M from two additional enterprise hires (owner: sales leadership, requires requisitions by month minus 2), +$0.6M from win-rate improvement 18% to 20% via deal-inspection program (owner: RevOps, evidence required by end of Q1), +$0.4M from a new partner source (owner: partnerships, explicitly speculative), leaving $0.4M unclosed and stated as residual risk. A gap of 10 to 20% closed by named mechanisms is normal planning. A gap closed by silently raising every conversion rate 3 points is fiction.

## Targets by Segment, Source, and Season

Publish the plan as a matrix, with quarterly phasing that reflects real seasonality rather than 25/25/25/25. Typical B2B pattern: Q1 soft (pipeline built during the holidays closes slowly), Q4 heavy (budget-flush and comp-deadline dynamics), something like 20/24/26/30. Use your own trailing two years if available.

Example structure:

| Segment x Source | Q1 | Q2 | Q3 | Q4 | FY |
|---|---|---|---|---|---|
| Enterprise outbound | 0.7 | 0.9 | 1.1 | 1.5 | $4.2M |
| Enterprise inbound | 0.3 | 0.4 | 0.5 | 0.6 | $1.8M |
| Mid-market inbound | 0.7 | 0.9 | 0.9 | 1.1 | $3.6M |
| Mid-market outbound | 0.5 | 0.6 | 0.6 | 0.7 | $2.4M |
| **Total new ARR** | **2.2** | **2.8** | **3.1** | **3.9** | **$12.0M** |

Each row must trace to a funnel cell in the bottoms-up model and to capacity: a row without reps or budget behind it is decoration.

## Linking Plan to Capacity and Budget

The revenue plan, headcount plan, and program budget are one system:

- **Capacity link**: run the capacity model against the phased targets. Every quarter's target must be covered by ramped-rep-equivalents times quota times expected attainment (60 to 80%). Where it is not, the hiring plan or the phasing changes now, in planning, not in the quarter itself.
- **Budget link**: each source row implies spend. Inbound rows imply program spend at a target cost per opportunity; outbound rows imply SDR headcount and tooling; partner rows imply margin. A rough efficiency screen: many teams plan marketing program spend such that fully loaded customer acquisition cost (CAC) pays back inside 12 to 24 months, tighter for velocity motions.
- **Circularity check**: headcount added to close the top-down gap must also appear in the comp budget and the quota ladder. Plans routinely add capacity in the revenue tab and forget it in operating expenses.

### Common Mistakes

- Starting from the board number and reverse-engineering assumptions to hit it.
- Flat 25% quarterly phasing that ignores both seasonality and ramp.
- Ignoring cycle-length lag, so Q1 targets assume pipeline that was never created in prior Q4.
- Raising every conversion assumption a few points at once, compounding into a 40% improbable plan.
- Planning new-business targets without separating expansion, then double-counting expansion when new business misses.
- No named owner on gap-closing mechanisms, so the gap belongs to everyone and no one.
- Locking the plan after the fiscal year starts, burning weeks of selling time on renegotiation.
- Treating the plan as done at lock: no re-forecast rhythm, so the first honest look at the year happens in July.

## Scenario Cases and the Re-forecast Rhythm

Build three cases at roughly these levels:

| Case | Level | Purpose |
|---|---|---|
| Base | 100% of plan | The commit; quotas and budgets key off this |
| Upside | ~115% | What must go right; pre-approves accelerated hiring or spend triggers |
| Downside | ~85% | Pre-agreed trims: which requisitions pause, which program spend cuts first |

The value of the downside case is deciding the cuts in November with clear heads instead of in May under pressure. Attach explicit triggers: for example, "if Q1 lands below 85% of target, requisitions 7 through 9 pause."

Once the year starts, re-forecast monthly: actuals versus plan by segment and source, pipeline coverage against the next two quarters, and a refreshed full-year landing estimate. The annual plan stays fixed as the measuring stick; the forecast moves. Do not restate the plan mid-year to make variance disappear.

## Output Format

Produce the plan as a model plus a one-page summary:

**The model (spreadsheet spec):** an assumptions tab (conversion rates, ACV, cycle length, attainment, seasonality curve, every number in one place), a funnel tab per segment x source with the walk-back math, a phasing tab (the quarterly matrix), a reconciliation tab (top-down vs bottoms-up with named gap mechanisms), and a scenarios tab (base/upside/downside with triggers).

**One-page plan summary template:**

```markdown
# FY{year} Revenue Plan
Locked: {date} | Owner: {name}

## The number
New ARR target: ${X}M (base) | Upside ${X}M | Downside ${X}M

## Where it comes from
{segment x source matrix, quarterly}

## What must be true
{3 to 5 load-bearing assumptions: win rate, ACV, hires by date, leads per month}

## Plan risk
Bottoms-up supports ${X}M. Gap to target: ${X}M, closed by: {mechanisms with owners}. Residual risk: ${X}M.

## Triggers
{downside trigger and pre-agreed response; upside trigger and response}

## Rhythm
Monthly re-forecast on {day}; plan itself does not restate.
```

## Related Skills

- **capacity-planning**: converts this plan's targets into a headcount and ramp schedule
- **quota-comp**: builds the quota ladder that sums to this plan plus overassignment buffer
- **pipeline-coverage**: the in-year check that pipeline supply is pacing to the plan
- **segmentation**: the segment boundaries the target matrix is built on
- **forecasting**: the monthly landing estimate once the year is underway
