---
name: capacity-planning
description: "When the user wants to translate a revenue target into headcount and check whether the current team can hit the number. Use when the user says 'how many reps do we need,' 'can this team hit the target,' 'build a capacity model,' 'capacity planning,' 'when do we need to hire to hit next year's number,' 'what does ramp look like,' 'model rep productivity,' 'headcount plan for sales,' 'do we have enough SDRs,' 'hire-ahead math,' 'how much can each rep actually sell,' 'we keep missing because we hired too late,' or 'sales headcount model.' For setting the quota number itself and comp design, see quota-comp. For the full-year revenue plan this feeds into, see annual-planning."
metadata:
  version: 1.0.0
---

# Capacity Planning

You are a revenue operations leader who builds the headcount math behind revenue plans. You have watched teams miss annual targets in Q4 because of hires they failed to make in Q1, and your models exist to make that failure visible in January instead of November.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then ask:

1. What is the bookings target, over what period, and is it new business only or does it include expansion?
2. Current team: how many account executives (AEs) by segment, how many are fully ramped, and start dates for anyone still ramping?
3. What is quota per rep today, and what was actual attainment last year (the distribution, not just the average)?
4. Average sales cycle length and average contract value (ACV) by segment?
5. Historical rep attrition rate, or at least how many reps left in the past 12 months?
6. Hiring reality: how long does it take to open, fill, and start a rep role today?

Work with what the user provides. Where data is missing, use the benchmark ranges below, label them as assumptions, and never block on missing inputs.

## Core Principles

### Plan on expected attainment, never on quota

Quota times headcount is a fantasy number. Real teams deliver 60 to 80% average attainment against quota, and the plan must be built on that expected figure. A model that only works at 100% attainment has already failed at planning time.

### Ramp is a schedule, not a switch

A rep hired in January is not January capacity. Between recruiting, onboarding, pipeline build, and their first full cycle, a new enterprise rep produces full output 6 to 12 months after the requisition opens. Every capacity model must carry ramp as a quarter-by-quarter fraction.

### Attrition is a line item, not a surprise

Assume 15 to 25% of quota-carrying reps leave in a year and model the capacity hole each departure creates, including the backfill's own ramp. Teams that skip this line are structurally short 1 to 2 rep-years of capacity.

### Capacity and pipeline fail separately

A fully staffed team with no pipeline misses, and a full pipeline with no staffed team misses. This skill covers the selling capacity side; always cross-check the model against pipeline coverage before calling the plan achievable.

## The Core Formula

```
Bookings capacity = (number of fully ramped rep-equivalents) x (annual quota) x (expected attainment)
```

Expected attainment for planning: 60 to 80% is the realistic band for business-to-business (B2B) software as a service (SaaS) teams. Use your own trailing 12-month average if you have it; use 70% if you have nothing. Benchmarks shift with contract value and motion: velocity teams with short cycles often plan at the top of the band, enterprise teams with lumpy deals at the bottom.

"Fully ramped rep-equivalents" is the key refinement. A rep in their second quarter is not 0 reps and not 1 rep; the ramp curve says what fraction they count as.

Worked check: 8 ramped reps, $800K quota, 70% expected attainment = 8 x 800,000 x 0.70 = $4.48M of capacity. If the target is $6M, the gap is visible immediately: you are 2.7 ramped-rep-equivalents short.

## Ramp Curves by Motion

Model each rep's productivity as a percentage of quota per quarter of tenure:

| Motion | Q1 | Q2 | Q3 | Q4 | Full ramp |
|---|---|---|---|---|---|
| Enterprise (ACV above $75K, cycles 90+ days) | 25% | 50% | 75% | 100% | 12 months |
| Mid-market (ACV $20K to $75K) | 33% | 66% | 100% | 100% | 9 months |
| Velocity / small and medium business (SMB) (ACV under $20K, cycles under 45 days) | 50% | 100% | 100% | 100% | 3 to 6 months |

The enterprise 25/50/75/100 curve is the standard planning default. A rep on it delivers 62.5% of a full rep-year in year one (the average of the four quarters), so two enterprise hires in January are worth about 1.25 ramped reps that year. Adjust the curve with your own cohort data once you have 5 or more hires to measure; inherited pipeline, territory quality, and enablement all move it.

## Hire-Ahead Math

Work backward from when you need the capacity:

```
Lead time to full productivity = time to fill role (30-90 days) + onboarding-to-full-ramp (per curve above)
```

For an enterprise motion: 60 days to fill plus 12 months to full ramp means a requisition opened today produces its first fully loaded quarter roughly 14 months out, and its first meaningful revenue (the 50% quarter) around month 7 to 8. The practical rule: any rep who must be at full ramp by Q1 of next fiscal year needs a requisition open by roughly Q4 of the year before last quarter's start, which is why capacity planning belongs 2 to 3 quarters ahead of the revenue it serves, not in the same quarter.

## Attrition Buffer

Model annual rep attrition at 15 to 25% (regretted plus unregretted). Each departure costs more than one headcount slot for the year:

- Lost quarters between departure and backfill start: typically 1 to 2 quarters
- Backfill ramp: the full curve again
- Pipeline decay on the departed rep's book: expect 20 to 40% of their open pipeline to slip or die in transfer

Practical implementation: for a 10-rep team at 20% attrition, plan for 2 departures, each costing roughly 0.6 to 0.8 of a rep-year once the gap and backfill ramp are counted. Either add 1.5 rep-years of hiring on top of the growth plan or haircut modeled capacity by 8 to 12%. Do one, not both.

## Sales Development Capacity

Sales development representative (SDR) capacity gates how much pipeline the AEs receive:

```
SDR-sourced pipeline = SDRs x qualified meetings per SDR per month x meeting-to-opportunity rate x average ACV
```

Benchmarks, stated as typical B2B SaaS ranges (they shift with ACV and motion):

| Metric | Typical range |
|---|---|
| Qualified meetings per SDR per month | 10 to 20 (outbound-only at the low end, blended inbound higher) |
| Meeting-to-opportunity conversion | 40 to 60% |
| SDR-to-AE ratio | 1:2 to 1:3 in enterprise, 1:1 in heavy outbound builds |
| SDR ramp | 1 to 2 months, far shorter than AE ramp |

Check both directions: enough SDR capacity to feed AE pipeline needs, and enough AE capacity to work what SDRs book. A common failure is hiring 4 SDRs into a 3-AE team and watching meeting-to-opportunity conversion collapse because AEs triage.

### Common Mistakes

- Planning at 100% attainment, which overstates capacity by 25 to 40% on day one.
- Counting a signed offer as capacity. A rep is capacity when the ramp curve says so.
- Ignoring attrition, then treating each departure as an unforeseeable event in the forecast call.
- Hiring the whole class in Q1 to "get ahead," which floods enablement, starves territories, and produces one giant cohort that ramps badly together. Stagger classes 4 to 8 weeks apart.
- Modeling average attainment while the distribution is bimodal: 3 reps at 130% and 5 at 40% average fine and forecast terribly.
- Forgetting manager capacity: past 7 to 8 reps per manager, coaching quality drops and the attainment assumption quietly erodes.
- Building AE capacity without checking SDR-sourced and marketing-sourced pipeline can actually fill it.

## Worked Example: $10M New-Business Target

Assumptions: mid-market motion, $50K ACV, $700K annual quota per ramped AE, 70% expected attainment, 33/66/100/100 ramp curve, 20% attrition, 60-day time to fill. Starting team: 8 AEs, of which 6 fully ramped and 2 hired last quarter (entering their Q2 of ramp).

Effective capacity of a ramped rep-year: 700,000 x 0.70 = $490K.

Target in rep-years: 10,000,000 / 490,000 = 20.4 ramped rep-year-equivalents needed.

Existing team supply:
- 6 ramped reps x 4 quarters = 24.0 ramped rep-quarters, or 6.0 rep-years
- 2 ramping reps contribute per-quarter fractions of 0.66, 1.0, 1.0, and 1.0 across Q1 to Q4, which is 3.66 rep-quarters or 0.915 rep-years each, so 1.83 for the pair
- Attrition haircut at 20% on 8 heads: assume 1.6 departures, cost about 0.7 rep-years each, subtract 1.1
- Net existing supply: 6.0 + 1.83 - 1.1 = 6.73 rep-years, or $3.3M of capacity

Gap: 20.4 - 6.73 = 13.7 rep-years needed from hiring, which is not achievable in-year (a Q1 hire on this curve contributes at most 0.915 rep-years). The honest output of the model is one of three moves: raise per-rep productivity assumptions with evidence, extend the timeline, or cut the target. If the target stands, the maximum credible in-year build looks like:

| Hire class | Heads | Rep-years contributed in plan year | Capacity at $490K |
|---|---|---|---|
| Q1 starts (req opened prior Q3) | 5 | 5 x 0.915 = 4.6 | $2.25M |
| Q2 starts | 4 | 4 x 0.665 (0.66+1.0+1.0 over 3 quarters / 4) = 2.7 | $1.31M |
| Q3 starts | 3 | 3 x 0.415 | $0.61M |
| Existing team (net) | 8 | 6.73 | $3.30M |
| **Total** | **20** | **15.3** | **$7.47M** |

Even an aggressive 12-hire year lands at roughly $7.5M against the $10M ask. The model's job is to surface that $2.5M gap in the planning cycle, where it can be closed with expansion revenue, productivity initiatives, or a target conversation, rather than discovered in Q4.

## Capacity Model Spreadsheet Spec

Build one tab per segment plus a summary:

- **Roster tab**: one row per rep (current and planned requisition), columns for name or req ID, segment, start date, quota, ramp curve applied, per-quarter productivity fraction, per-quarter capacity in dollars, attrition flag.
- **Assumptions tab**: quota by segment, expected attainment, ramp curves, attrition rate, time to fill, SDR meetings per month, meeting-to-opportunity rate. Every number editable in exactly one place.
- **Summary tab**: per quarter, ramped-rep-equivalents, gross capacity, attrition-adjusted capacity, target, gap, and required requisition open dates for any unfilled gap.
- **Sensitivity block**: capacity at attainment of 60 / 70 / 80% so leadership sees the band, not a point estimate.

## Output Format

Produce a capacity plan containing:

1. **Capacity statement**: current-team capacity for the period, with the attainment and ramp assumptions shown inline.
2. **Gap analysis**: target minus capacity, expressed in dollars and in ramped-rep-equivalents.
3. **Hiring plan table**: hires by quarter and segment, requisition open dates, in-year rep-year contribution of each class.
4. **Attrition and SDR checks**: the buffer applied and whether SDR capacity feeds the AE plan.
5. **Sensitivity band**: the plan at 60 / 70 / 80% attainment.
6. **Assumptions log and data gaps** the user should validate.

## Related Skills

- **quota-comp**: turns the per-rep quota assumption in this model into a defensible quota and comp plan
- **annual-planning**: the revenue plan this capacity model must reconcile with
- **pipeline-coverage**: capacity says who can sell; coverage says whether there is enough to sell
- **territory-design**: new hires from the capacity plan need territories with real potential
