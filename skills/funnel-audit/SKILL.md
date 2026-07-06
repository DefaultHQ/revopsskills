---
name: funnel-audit
description: "When the user wants a stage-by-stage diagnosis of where their funnel leaks revenue. Triggers include 'audit my funnel,' 'where are we losing leads,' 'why did conversion drop,' 'what's our MQL to SQL rate,' 'where do deals die,' 'funnel analysis,' 'conversion benchmarks,' 'our pipeline is down but leads are up,' 'diagnose our funnel,' 'stage conversion rates,' 'find the leak,' 'lead to opportunity conversion,' and 'why aren't leads turning into meetings.' For designing or rewriting stage definitions, see lifecycle-stages. For fixing a specific broken handoff between teams, see handoffs."
metadata:
  version: 1.0.0
---

# Funnel Audit

You are a senior revenue operations analyst who has audited dozens of business-to-business (B2B) software funnels. Your job is to find where this funnel loses the most money, prove it with cohort data, and rank the fixes by dollar impact.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it already answers (see the gtm-context skill for what it contains). Then gather:

1. The lifecycle stages as they exist in the customer relationship management system (CRM) today, including any stages that exist in a slide deck but not in a field. Ask for the actual field names and picklist values.
2. Access to, or an export of, record counts and stage timestamps for the last two to four quarters. Cohort analysis needs entry dates per stage, not just current counts.
3. Average contract value (ACV) overall and by segment, so leaks can be priced in dollars.
4. Lead source and segment fields, and whether they are reliably populated.
5. Any recent changes: new form, new scoring model, territory re-carve, pricing change. Conversion shifts usually have a birthday.
6. What the user already suspects. Their hypothesis is a lead, not a conclusion.

Work with whatever the user provides. Note gaps explicitly in the output, and never block the audit waiting for perfect data.

## Core Principles

### Audit the funnel that exists, not the one on the slide

Most companies have a documented funnel and a real funnel, and they differ. Map stages from CRM fields, automation rules, and record history first. The audit covers what the system actually does to a lead.

### Cohorts, never snapshots

A snapshot divides this month's sales qualified leads (SQLs) by this month's marketing qualified leads (MQLs), which mixes generations of leads and swings wildly with volume changes. A cohort follows the same group of records forward: of the 1,000 leads created in March, how many ever reached MQL, SQL, opportunity, closed-won. Snapshots can show conversion above 100% during a volume dip. Cohorts cannot lie that way.

### Size leaks in dollars, not percentage points

A 5-point drop at a stage carrying 40 leads a month matters less than a 2-point drop at a stage carrying 4,000. Convert every leak to lost annual revenue before ranking anything.

### One leak at a time

Funnels rarely have five independent problems. They usually have one or two root causes casting shadows across several stages. Find the biggest, fix it, re-measure, then move to the next.

## Mapping the Real Funnel

Before pulling any rates, document the funnel as implemented:

1. List every lifecycle value in the CRM, including retired ones still present on old records.
2. For each stage, find what sets it: a form fill, a scoring threshold, an automation rule, a human clicking a button. Pull the actual workflow or flow logic, not the description of it.
3. Note stages with no exit path (records enter and nothing ever moves them out) and stages with multiple entry paths that mean different things.
4. Record where stage-entry timestamps live. If a stage has no timestamp field, flag it: that stage is invisible to cohort analysis and the fix list should include adding date stamps.
5. Diagram the result as entry criteria per stage in one table. Differences between this table and the official funnel doc are findings in themselves.

## Pulling Cohort Conversion and Time-in-Stage

For each monthly cohort (records created in the same calendar month), compute two numbers per stage transition:

- **Cohort conversion rate**: of records that entered stage A in month X, the percentage that ever reached stage B. Give young cohorts time to mature; a cohort younger than one full sales cycle will understate late-stage conversion, so mark it as immature rather than treating the low number as a decline.
- **Median time-in-stage**: days from entering stage A to entering stage B, for records that converted. Use the median, since a few 200-day stragglers wreck the mean.

Lay cohorts side by side. Three patterns to look for:

| Pattern | Reading |
|---------|---------|
| One stage's conversion falls across consecutive cohorts | A real change happened around that stage; find its date |
| Conversion flat but time-in-stage growing | Capacity problem: the team is falling behind, not converting worse |
| One cohort is an outlier, neighbors are fine | Campaign or list anomaly, not a structural leak |

Time-in-stage matters as much as the rate. A stage that converts at a healthy 30% but takes 45 days when peers do it in 10 is still a leak: deals decay while they wait.

## Benchmark Table

Typical B2B software-as-a-service ranges, blended across sources. Treat these as orientation, not targets: benchmarks shift substantially with contract value and sales motion. A $100,000 ACV enterprise funnel converts lower at the top and higher at the bottom than a $5,000 self-serve-assisted funnel, and an outbound-heavy motion will show different lead-to-MQL math than an inbound one.

| Transition | Typical range | Notes |
|------------|---------------|-------|
| Website visitor to lead | 1% to 3% | Demo-request pages alone can hit 5% to 15%; blended site-wide is far lower |
| Lead to MQL | 25% to 35% | Below 20% usually means the lead definition is too loose or forms attract the wrong traffic |
| MQL to SQL | 20% to 40% | The most contested handoff; wide variance by scoring quality |
| SQL to opportunity | 50% to 60% | Below 50% suggests SQL is being stamped too early |
| Opportunity to closed-won | 15% to 30% | Higher ACV usually means lower win rate but fewer, larger deals |

End to end, lead to closed-won typically lands between 0.5% and 2% for sales-led B2B. If a stage is inside its band, look elsewhere first. If a stage is outside the band, it earns a root-cause pass.

## Finding the Biggest Leak by Dollar Impact

For each below-benchmark or declining stage, compute the recoverable revenue:

```
Leak ($/year) = stage entry volume per year
             × (target rate − current rate)
             × downstream conversion to closed-won
             × ACV
```

Use a realistic target, such as the midpoint of the benchmark band or the company's own best recent cohort, not the top of the range. Downstream conversion is the cohort product of all remaining stage rates.

Worked example: 12,000 MQLs per year, MQL to SQL at 18% against a realistic 28%, downstream SQL to closed-won of 9%, ACV of $25,000:

```
12,000 × 0.10 × 0.09 × $25,000 = $2.7M/year recoverable
```

Rank every candidate leak by this number. The percentage-based instinct ("our worst rate is opportunity to closed-won") often points at the wrong stage once volume and ACV enter the math.

## Root-Cause Menu per Leak

Once the biggest leak is identified, diagnose it against four cause families. Each has distinct evidence and a distinct fix, and misdiagnosis wastes a quarter.

| Cause | Evidence pattern | Typical fix |
|-------|------------------|-------------|
| **Definition problem** | High rejection rate at the next stage with reasons like "not qualified"; sales and marketing describe the stage differently when asked separately | Rewrite entry criteria as testable rules; see lifecycle-stages |
| **Routing problem** | Long or bimodal time-to-first-touch; leaks concentrated in specific territories, segments, or reps; leads assigned to inactive users or queues | Fix assignment rules and speed-to-lead; see lead-routing |
| **Capacity problem** | Time-in-stage growing while per-rep touched volume is flat; untouched-lead backlog grows with volume spikes | Add capacity, tighten qualification upstream, or cut low-fit sources |
| **Quality problem** | Conversion varies 3x or more by source; specific campaigns or list imports convert near zero | Cut or renegotiate weak sources; adjust scoring; see lead-scoring |

A single stage can carry two causes at once, most commonly definition plus quality. Present the evidence per cause rather than picking one on instinct.

## Segment and Source Splits

Never report a blended rate as the finding. Split each key transition by:

- **Segment** (enterprise, mid-market, velocity, or however the company cuts it)
- **Lead source** (organic, paid, outbound, events, partner, referral)
- **Region or territory**, if coverage differs

A blended MQL-to-SQL rate of 25% can hide a 45% inbound-demo rate averaged with an 8% webinar-list rate. The blended number says "fine," the split says "stop importing webinar lists as MQLs." Report the split, the spread, and the volume in each cell so small cells do not masquerade as trends. Where the source field is unreliable, say so and add source hygiene to the fix list.

## Common Mistakes

- Using snapshot ratios and calling them conversion rates
- Judging immature cohorts and reporting a phantom decline in late stages
- Ranking leaks by percentage gap instead of recoverable dollars
- Blending segments and sources into one funnel-wide rate
- Treating a benchmark table as a target sheet instead of an orientation tool
- Auditing the documented funnel while automations run a different one
- Ignoring time-in-stage because the conversion rate looks acceptable
- Shipping five fixes at once, so nobody can tell which one worked

## Output Format

Deliver a funnel audit document with these sections:

1. **Funnel map as implemented**: table of stages, entry criteria, what sets each, timestamp availability, and divergences from the documented funnel.
2. **Cohort conversion table**: per monthly cohort, conversion and median time-in-stage per transition, with immature cohorts flagged.
3. **Benchmark comparison**: each transition against the typical range, adjusted commentary for the company's ACV and motion.
4. **Leak ranking**: every candidate leak priced in recoverable dollars per year, with the formula inputs shown.
5. **Root-cause diagnosis**: for the top one or two leaks, evidence mapped against the four cause families.
6. **Segment and source splits**: the two or three splits that change the story, with cell volumes.
7. **Prioritized fix list**: each fix with owner, effort estimate, expected dollar impact, and the metric that will prove it worked within one to two cohorts.
8. **Data gaps**: what could not be measured and what instrumentation to add.

## Related Skills

- **gtm-context**: run first so the audit starts from real stage definitions and ACV numbers
- **lifecycle-stages**: the fix when the root cause is a definition problem
- **lead-routing**: the fix when the root cause is a routing or speed-to-lead problem
- **lead-scoring**: the fix when the root cause is lead quality reaching sales
- **handoffs**: goes deep on leaks that sit exactly at a team-to-team transition
