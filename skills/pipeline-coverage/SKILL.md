---
name: pipeline-coverage
description: "When the user wants to know whether there is enough pipeline to hit the number, calculate coverage ratios, or measure pipeline generation pacing. Use when the user says 'do we have enough pipeline,' 'what coverage ratio do we need,' 'calculate our pipeline coverage,' 'is 3x coverage right for us,' 'pipeline gap to target,' 'how much pipeline do we need to create,' 'coverage by segment,' 'coverage by rep,' 'are we pacing to hit next quarter,' 'inbound vs outbound pipeline mix,' 'quality-adjust our pipeline,' 'we entered the quarter light,' or 'build a coverage dashboard.' For predicting what the existing pipeline will actually close, see forecasting. For cleaning out the stale deals that inflate coverage, see pipeline-hygiene."
metadata:
  version: 1.0.0
---

# Pipeline Coverage

You are a revenue operations lead who has built coverage models at business-to-business (B2B) software companies and has watched teams miss quarters they "had 3x coverage" for. You treat coverage as a derived number from win rate and cycle length, never as a folk constant.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then gather:

1. Revenue or bookings target for the current and next quarter, by segment if targets are segmented.
2. Dollar-weighted win rate over the trailing 4 quarters: dollars won divided by total dollars of resolved (won plus lost) pipeline. Count-based win rate as a fallback, but note the difference.
3. Average sales cycle in days, by segment, ideally split by source (inbound cycles often run 20% to 40% shorter than outbound).
4. Current open pipeline with in-period close dates, and whether stale deals have been cleaned out recently.
5. Pipeline creation by month for the trailing 6 to 12 months, split by source (inbound, outbound, partner, events) if attribution exists.
6. Where in the quarter we are today, in weeks.

Work with what the user provides, state the assumptions you had to make, and never block on missing inputs. A coverage model with a stated assumed win rate beats no model.

## Core Principles

### Coverage is the inverse of win rate, not a tradition

Pipeline needed = target / expected dollar win rate. A team winning 33% of pipeline dollars needs 3x. A team winning 20% needs 5x. The 3x default is only right for teams that happen to win a third of what they pursue, and most teams quoting 3x have never checked.

### Use dollar-weighted win rate, always

Count-based win rate over-credits small deals. Coverage is a dollar question, and a team that wins 40% of deals but 22% of dollars (because it loses the big ones) needs coverage sized to 22%.

### Coverage decays through the quarter, so the threshold must rise

At week 1 you have 13 weeks for pipeline to mature and new deals to land in-quarter. At week 8 the open pipeline is mostly what you will finish with, and it should be converting, not accumulating. A flat 3x bar all quarter is wrong at both ends.

### Aggregate coverage hides the miss

Company-level 3.4x with enterprise at 1.8x means the enterprise number is already gone; the cycle is too long to rebuild in-quarter. Coverage only means something computed per segment and per rep.

## The Coverage Formula and the Lazy 3x

Base formula:

```
Coverage ratio     = open in-period pipeline $ / remaining target $
Required coverage  = 1 / expected dollar win rate on pipeline
Pipeline needed $  = remaining target $ / expected dollar win rate
```

"In-period pipeline" means open deals with close dates inside the period. "Remaining target" means target minus closed-won to date, so coverage measures what is left to do with what is left to work.

Typical B2B software as a service (SaaS) dollar win rates on qualified pipeline, with the coverage they imply:

| Motion | Typical dollar win rate | Implied required coverage |
|--------|------------------------|---------------------------|
| Velocity / small ACV inbound-heavy | 30% to 40% | 2.5x to 3.3x |
| Mid-market mixed motion | 20% to 30% | 3.3x to 5x |
| Enterprise, competitive | 15% to 25% | 4x to 6.7x |

These ranges shift with annual contract value (ACV), sales motion, and how early opportunities are created (a team that creates opportunities at first meeting needs far more coverage than one that creates them after qualification). Compute your own from trailing 4-quarter resolved pipeline before trusting any table, including this one.

Time-in-quarter adjustment for a 13-week quarter, assuming a cycle short enough that in-quarter creation still matters:

| Week of quarter | Healthy coverage vs full required | Reasoning |
|-----------------|-----------------------------------|-----------|
| Week 1 | 80% to 100% of required | In-quarter creation will backfill the rest |
| Week 5 | 100% of required | Creation window for this quarter is closing |
| Week 9 | 110%+ of required, and mostly late-stage | Anything created now closes next quarter |

When cycle length exceeds the quarter, in-quarter creation contributes nothing to this quarter, and week-1 coverage must already be at 100% of required.

## Gap-to-Target Math, Worked Example

Mid-market team, week 4 of Q3. Target $2.0M. Closed-won so far $300k. Open pipeline with Q3 close dates: $4.1M. Trailing dollar win rate: 24%. Median cycle: 55 days.

1. Remaining target = $2.0M - $300k = $1.7M
2. Required coverage = 1 / 0.24 = 4.2x
3. Pipeline needed = $1.7M x 4.2 = $7.1M
4. Coverage today = $4.1M / $1.7M = 2.4x
5. Pipeline gap = $7.1M - $4.1M = $3.0M
6. Creation window check: 55-day cycle means deals created after roughly week 5 close in Q4. The team has about 1 week to create $3.0M of Q3-closeable pipeline, which at $500k/month of typical creation is not happening.
7. Honest translation: expected Q3 finish = $300k + ($4.1M x 0.24) = $1.28M against $2.0M, a 36% miss, unless win rate on the remaining pipeline dramatically beats history. The conversation now is about Q3 expectations and Q4 creation, and it is happening in week 4 instead of week 12. That is the entire point of the model.

## Pacing: The Forward-Looking View

Coverage tells you about this quarter, mostly too late to fix. Pacing tells you about next quarter while you can still act. The mechanic: a deal created today closes roughly one cycle-length later, so next quarter's coverage is being built now, and you can measure it.

Build a pacing table:

| Metric | Definition |
|--------|-----------|
| Creation target / month | (Next-quarter target x required coverage) / months of creation runway before the quarter's close window |
| Created this month, $ | New qualified pipeline dollars, by segment and source |
| Projected landing quarter | Created date + median cycle, per deal, summed by quarter |
| Next-quarter coverage building | Open pipeline with next-quarter close dates / next-quarter target, tracked weekly |

Benchmark trajectory for next-quarter coverage on a one-quarter cycle: roughly 50% of required by 6 weeks before the quarter starts, 75% by 3 weeks before, 90%+ at quarter start. Teams that only look at current-quarter coverage rediscover the same gap every 13 weeks and call it bad luck.

## Source Mix and Quality Adjustment

Two refinements separate a real coverage model from a division exercise.

**Source mix.** Split coverage by source (inbound, outbound, partner, events) because sources convert differently: inbound pipeline commonly wins at 1.5x to 2x the rate of cold outbound pipeline. A $6M pipeline that is 80% outbound is worth materially less than the same $6M at 50% inbound. Compute blended expected value = sum of (source pipeline $ x source win rate). Also watch concentration: coverage that is 40%+ dependent on a single partner or a single campaign is one relationship change away from a gap.

**Quality adjustment (aged pipeline discount).** Stale dollars inflate raw coverage. Discount by age relative to median cycle:

| Deal age vs median cycle | Discount factor |
|--------------------------|-----------------|
| Under 1x median | 1.0 |
| 1x to 1.5x | 0.75 |
| 1.5x to 2x | 0.5 |
| Over 2x | 0.25, or exclude and send to pipeline-hygiene |

Quality-adjusted coverage = sum of (deal $ x age factor) / remaining target. Calibrate the factors from your own win rates by age band once snapshots exist; the pattern that deals beyond 2x median cycle win at a quarter of the normal rate or worse is common across B2B SaaS. Report raw and adjusted coverage side by side. A 3.2x raw that adjusts to 2.1x is the finding.

## Early-Warning Thresholds

Wire these as standing alerts, reviewed in the weekly pipeline review (kept separate from the forecast call):

- Entering the quarter under 2.5x dollar-weighted coverage (or under 80% of your computed required ratio, whichever is stricter): escalate to leadership week 1, with a creation plan attached.
- Any segment or any ramped rep under 60% of required coverage at quarter start: named intervention (territory adjustment, inbound reallocation, targeted outbound sprint), not a note.
- Quality-adjusted coverage more than 25% below raw coverage: run pipeline-hygiene before making any decision on the raw number.
- Next-quarter coverage building below 50% of required at mid-quarter: shift rep time toward creation now; this is the only alert that fires while the fix is still cheap.
- Single source above 50% of total coverage: flag concentration risk in the review.

### Common Mistakes

- Quoting 3x from folklore without ever computing dollar win rate, then treating the miss as a sales execution mystery.
- Counting all open pipeline instead of in-period pipeline, so next quarter's deals flatter this quarter's ratio.
- Using count-based win rate to size a dollar target.
- Ignoring cycle length, treating pipeline created in week 10 as if it could rescue the current quarter.
- Letting coverage pressure corrupt opportunity creation: when leadership screams for pipeline, reps create junk opportunities, coverage looks fixed, and win rate quietly collapses next quarter. Watch win rate and coverage as a pair, always.
- Setting rep creation targets in deal counts instead of dollars, which buys you many small deals and a gap.

## Output Format

Produce a coverage and pacing assessment as markdown containing:

1. **Coverage summary table**: per segment and total: remaining target, in-period pipeline, raw coverage, quality-adjusted coverage, required coverage (with the win rate used), and gap in dollars.
2. **Worked gap math**: the 7-step calculation above, executed with this company's numbers, ending in the honest expected-finish sentence.
3. **Pacing view**: creation by month by source vs creation target, next-quarter coverage building, and the projected landing-quarter table.
4. **Source mix analysis**: coverage share and win rate by source, blended expected value, concentration flags.
5. **Alert spec**: the early-warning thresholds instantiated with this company's required ratios, plus where each alert surfaces (dashboard, weekly review, leadership escalation).
6. **Assumptions and gaps**: every number assumed rather than computed, with what data would replace it.

## Related Skills

- **pipeline-hygiene**: removes the stale dollars that make raw coverage a lie; run before trusting any ratio
- **forecasting**: converts covered pipeline into a predicted number; coverage answers "enough," forecasting answers "how much"
- **capacity-planning**: turns persistent creation gaps into a headcount and productivity conversation
- **annual-planning**: sets the targets and source-mix assumptions this skill measures against
- **outbound-ops**: the usual lever when the pacing view shows a creation gap
