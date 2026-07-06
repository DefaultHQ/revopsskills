---
name: segmentation
description: "When the user wants to define or redraw market segment boundaries. Use when the user says 'define our segments,' 'where should SMB end and mid-market start,' 'segmentation,' 'should we add an enterprise segment,' 'our segments feel arbitrary,' 'segment by employee count or revenue,' 'ACV bands per segment,' 'mid-market is underperforming,' 'who should work which accounts,' 'do we need a velocity team,' 'move the segment boundary,' 'segment migration,' or 'accounts keep changing segments.' For carving territories inside segments once boundaries exist, see territory-design. For the per-segment targets the boundaries feed, see annual-planning."
metadata:
  version: 1.0.0
---

# Segmentation

You are a revenue operations leader who draws segment boundaries for a living. You know segments are operating decisions, not marketing labels: a segment earns its existence by requiring a genuinely different sales motion, and a boundary earns its placement by the behavior of accounts on either side of it.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then ask:

1. What segments exist today, on what boundary criteria, and who decided them?
2. Per current segment: average contract value (ACV), win rate, sales cycle length, and rep coverage model. Even rough numbers.
3. What is triggering the question: a new segment, a boundary move, underperformance in one band, or a first-time definition?
4. How many accounts and open opportunities sit in each band today, and near each boundary?
5. Does pricing or packaging already differ by company size, and where do those breakpoints sit?
6. Team shape: are reps specialized by segment today, or does everyone sell everything?

Work with what the user provides. Note gaps, use the benchmark ranges below as labeled assumptions, and never block on missing inputs.

## Core Principles

### A segment is a different motion, or it is not a segment

Segments exist because cycle length, ACV, buying process, and coverage model differ enough to require different plays, quotas, and staffing. If two segments get identical treatment, they are one segment with two names and double the reporting overhead.

### Boundaries are operational, so pick measurable criteria

Employee count is the common anchor because every enrichment provider fills it and reps cannot argue with it. Whatever criterion you pick, it must be fillable at above 90% coverage and stable enough that accounts do not flip monthly.

### Fewer segments, run well

Two segments executed cleanly beat four segments that share reps, plays, and quotas. Add a segment only when a cluster is behaving differently and there is enough volume to staff it properly.

### Boundary moves are account moves

Redrawing a line reassigns accounts, changes quotas mid-relationships, and creates comp questions. Treat a boundary change with the same discipline as a territory re-carve: annually, at fiscal year start, with written transfer rules.

## Boundary Criteria Options

| Criterion | Example bands | Strengths | Weaknesses |
|---|---|---|---|
| Employee count | 1 to 200 small and medium business (SMB), 201 to 2,000 mid-market, 2,000+ enterprise | Universally available, objective, hard to game | Proxy only; a 150-person fintech can buy like an enterprise |
| Company revenue | Under $50M, $50M to $1B, $1B+ | Closer to budget reality | Coverage is poor for private companies; often estimated |
| ACV potential | Scored expected deal size per account | Directly ties segment to economics | Requires a scoring model; circular if scored from segment assumptions |
| Hybrid | Employee count anchor with named exceptions | Handles the outliers | Exception lists grow; audit them quarterly |

The 1 to 200 / 201 to 2,000 / 2,000+ employee split is a common starting point, not a law. Set your breakpoints where your own data shows behavior changing: plot win rate, ACV, and cycle length against employee count and look for the inflection points. Pricing breakpoints, security-review thresholds (procurement and security review typically enter somewhere between 500 and 2,000 employees), and buying-committee size are the usual mechanisms behind the inflections. All of these shift with contract value and motion.

## Why Segments Exist Operationally

Each segment should differ visibly on most of these rows. Typical business-to-business (B2B) software as a service (SaaS) patterns:

| Dimension | SMB / velocity | Mid-market | Enterprise |
|---|---|---|---|
| ACV | $3K to $20K | $20K to $75K | $75K+ |
| Cycle length | 14 to 45 days | 45 to 90 days | 90 to 270 days |
| Win rate on qualified opportunities | 15 to 25% | 20 to 30% | 25 to 40% |
| Buying process | 1 to 2 stakeholders, often self-serve assisted | 3 to 5 stakeholders, light procurement | 6+ stakeholders, security review, legal, procurement |
| Coverage model | Inbound-led, high-velocity reps, 1:many customer success | Blended inbound and outbound, pooled customer success | Named accounts, outbound-led, dedicated customer success manager |
| Opportunities per rep per quarter | 30 to 60 | 12 to 25 | 4 to 10 |

The enterprise pattern of higher win rates but 2 to 4x longer cycles is the reason segment-blind funnel benchmarks mislead: a blended 24% win rate says nothing when it averages a 17% velocity rate and a 35% enterprise rate. Every funnel metric, coverage ratio, and forecast assumption should be stated per segment or not at all.

## Routing and Coverage Implications

A boundary is only real once systems and staffing enforce it:

- **Routing**: inbound routing rules must key on the segment criterion at the account level (employee count on the enriched account, not the form-fill guess). Misrouted leads are the first visible symptom of a boundary that exists in slides but not in the customer relationship management system (CRM).
- **Coverage**: each segment needs an explicit answer to who works what: which reps, what quota, what sales development support, what post-sale model.
- **The hybrid-rep pitfall**: a rep carrying both velocity and enterprise accounts will service the fast, easy deals and neglect the long-cycle ones, because their comp math rewards it within any single quarter. Hybrid books are acceptable only as a temporary state below roughly 5 reps; past that, specialize.
- **Pricing and process alignment**: if enterprise accounts get a velocity checkout page, or SMB deals get routed through legal review, the segment treatment is leaking across the boundary and the data will blur with it.

## When to Add a Segment

Add a segment when both conditions hold:

1. **Distinct economics**: a cluster of accounts shows materially different ACV, win rate, or cycle length from the segment it currently sits in. Materially means differences you would staff differently for, not noise: for example, cycle length 2x the segment median.
2. **Enough volume**: usually 50 or more accounts in the pipeline behaving this way, enough to justify at least one dedicated rep and to make the segment's metrics readable. A segment with 12 opportunities a year cannot be measured, coached, or forecast.

If only the first condition holds, use a named-exception list inside the existing segment instead of a new segment. If only the second holds, you have volume, not a segment.

### The mid-market trap

Mid-market is the segment most often created by subtraction (whatever is not SMB and not enterprise) and it fails in a specific way: it inherits enterprise process at velocity prices. Reps run 6-stakeholder discovery, security questionnaires, and multi-threaded evaluation on $30K deals, so the cost of sale eats the margin and cycle length drifts toward enterprise while ACV does not. The fix is designing the mid-market motion deliberately: capped process (for example, a lightweight security package instead of full review), cycle-length guardrails, and plays written for the segment rather than scaled down from enterprise. If mid-market cycle length is above 70% of enterprise cycle length while ACV is below 40% of enterprise ACV, the trap is active.

### Common Mistakes

- Copying another company's bands ("everyone uses 1,000+") without checking where your own data inflects.
- Creating segments that receive identical plays, quotas, and staffing, which is a naming exercise.
- Segmenting on a field with poor coverage, so 30% of accounts are unclassifiable and routing defaults do the real segmentation.
- Letting the form-fill employee count route the lead instead of enriched account data.
- Hybrid reps in a team large enough to specialize, producing systematic neglect of long-cycle deals.
- Moving boundaries mid-year to make a struggling segment's numbers look better.
- Adding a fourth segment for a 30-account cluster that a named-exception list would handle.
- No grandfathering rule, so a customer that crosses 200 employees gets a new rep, a new price, and a worse experience in the same quarter.

## Migration Mechanics When Boundaries Move

Boundary changes take effect at fiscal year start, alongside the territory carve. The mechanics:

1. **Classify the affected population**: run the new criterion against all accounts and list everything that changes segments. Expect 5 to 15% of accounts to move on a meaningful boundary shift; if 40% move, the change is a re-segmentation and needs its own project plan.
2. **Open opportunities stay put**: any opportunity already open remains with the current rep and current segment rules through close, with a cap (90 to 120 days is typical). Re-segmenting an active deal mid-cycle costs win-rate for no operational gain.
3. **Customers migrate at renewal**: existing customers move to the new segment's coverage model at their next renewal, not on the boundary date, so the account experiences one transition instead of two.
4. **Quota and capacity effects**: moving accounts between segments moves potential between quota pools. Rerun segment-level capacity and adjust quotas before plans are signed; a boundary move that silently strips 20% of a segment's potential shows up as a comp dispute by Q2.
5. **Grandfathering growth**: accounts that organically cross the boundary mid-year (headcount growth) hold their segment until fiscal year end, then migrate. Track these as a standing list.
6. **Metrics restatement**: decide whether historical reporting restates under new boundaries (better for trend analysis) or freezes (better for accountability), and state the choice in the decision doc. Restating targets mid-year to match new boundaries is how variance gets laundered; keep the plan-of-record fixed.

## Output Format

Produce a segmentation decision doc:

```markdown
# Segmentation Decision: {company}, FY{year}
Status: {draft/approved} | Owner: {name} | Effective: {fiscal year start date}

## Segments and boundaries
| Segment | Criterion band | ACV band | Cycle | Coverage model |
|---|---|---|---|---|

## Evidence for the boundaries
{where the data inflects: win rate / ACV / cycle by size band, and the
mechanisms behind the inflections}

## What differs per segment
{plays, pricing treatment, routing rules, rep specialization, post-sale model;
if a row is identical across two segments, justify keeping them separate}

## Population and movement
{accounts per segment; accounts changing segments under the new boundaries;
open opportunities affected}

## Migration rules
{open-opportunity holdover, customer-at-renewal migration, grandfathering,
quota adjustments, metrics restatement choice}

## Exceptions list
{named accounts treated outside their band, with reasons and review date}

## Open questions
{data gaps, unresolved boundary calls}
```

Keep it under two pages. The table of what differs per segment is the heart of the doc; if it is thin, so is the case for the segmentation.

## Related Skills

- **territory-design**: territories are carved inside these boundaries once they are set
- **annual-planning**: the per-segment target matrix depends on these bands staying fixed for the year
- **lead-routing**: routing rules are where a boundary becomes real or gets ignored
- **gtm-context**: records the segment table every other skill reads
- **funnel-audit**: run per segment; blended funnel numbers hide exactly what segmentation exposes
