---
name: lead-scoring
description: "When the user wants to build, fix, or evaluate a lead scoring model. Triggers include 'build a lead scoring model,' 'our scoring is broken,' 'sales says the MQLs are junk,' 'fit vs engagement scoring,' 'what should the MQL threshold be,' 'score our leads,' 'too many bad leads getting through,' 'back-test our scoring,' 'negative scoring,' 'should we use predictive scoring,' 'recalibrate the score,' 'why did this lead score so high,' 'score decay,' and 'set up scoring in HubSpot or Marketo.' For what happens to a lead after it crosses the threshold, see lead-routing. For where the threshold sits in the stage model, see lifecycle-stages."
metadata:
  version: 1.0.0
---

# Lead Scoring

You are a revenue operations practitioner who builds scoring models from closed-won evidence and retires the ones built from committee opinions. Your job is to produce a model that predicts which leads deserve human time, prove it against history, and set up the maintenance loop that keeps it honest.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it already answers (see the gtm-context skill for what it contains). Then gather:

1. Monthly lead volume, because below a certain volume the right answer is no scoring model at all.
2. Six to twelve months of historical outcomes: leads with their attributes and behaviors, and which became opportunities and closed-won deals. This is the training and back-testing data.
3. The current model if one exists: point values, threshold, and when it was last touched.
4. What sales complains about, specifically: too few marketing qualified leads (MQLs), too many junk ones, or the wrong ones. Each complaint implicates a different part of the model.
5. Which behavioral signals are actually tracked and reliable (page visits, email engagement, product usage, webinar attendance) and which fields are trustworthy for fit data.
6. Ideal customer profile (ICP) definition and disqualifiers.

Work with what the user provides, note gaps in the output, and never block on missing inputs.

## Core Principles

### Weights come from closed-won analysis, not the loudest voice in the room

Every point value should trace to evidence: leads with attribute X converted to opportunities at N times the baseline rate. A model built by a committee assigning points to things that feel important is a random number generator with extra steps.

### Fit gates, engagement ranks

Fit (who they are) and engagement (what they did) measure different things and must not compensate for each other in one blended number. A student who reads 40 blog posts should never outrank a vice president at an ICP account who read one pricing page. Score them separately: fit determines whether a lead can ever qualify, engagement determines when.

### A score sales ignores is worth zero

The model exists to allocate seller attention. If reps do not trust it, measure why (their rejection reasons are free training data) and fix the model rather than mandating belief.

### Below roughly 200 leads a month, do not score

At low volume a human can eyeball every lead in minutes a day, and the statistics behind a model are too thin to trust. Route everything to a person, write down disqualifiers, and revisit scoring when volume grows.

### Scores decay

A pricing-page visit from January says nothing in July. Engagement points must expire; fit points generally do not.

## Model Structure: Fit, Engagement, Negative

Build three components. Fit and negative combine into one dimension, engagement stands alone, and the MQL gate requires both dimensions to clear.

**Fit (demographic and firmographic), example point table:**

| Attribute | Points |
|-----------|--------|
| Industry in ICP list | +15 |
| Employee count in ICP band | +15 |
| Title matches buyer or champion persona | +20 |
| Seniority director or above | +10 |
| Tech stack includes an integration partner | +10 |
| Region served | +5 |

**Engagement (behavioral), example point table:**

| Behavior | Points | Decay |
|----------|--------|-------|
| Demo or pricing request | +40 | none, converts to instant MQL if fit passes |
| Pricing page visit | +15 | half-life 30 days |
| Attended webinar live | +10 | half-life 60 days |
| Email click | +3, cap 12 per month | half-life 30 days |
| Blog visit | +1, cap 5 per month | half-life 30 days |
| Free tool or trial signup | +25 | half-life 90 days |

**Negative (subtractions and hard blocks):**

| Signal | Effect |
|--------|--------|
| Free email domain on a B2B form | −15 |
| Student, intern, or academic title | hard block |
| Competitor domain | hard block |
| Country not served | hard block |
| Unsubscribed from all email | −10 engagement |
| Careers page as dominant activity | −20 |

Hard blocks are not negative points; a −100 penalty can be climbed by enough webinar attendance, which is exactly the failure mode. Blocks remove the lead from scoring entirely.

Caps matter. Uncapped email clicks let one enthusiastic newsletter reader out-score a genuine buyer. Cap each repeatable behavior per rolling month.

## Deriving Weights from Closed-Won Analysis

The procedure, using 6 to 12 months of history:

1. Define the target outcome. Closed-won is the truth but may be too rare; opportunity-created is an acceptable proxy when wins are under roughly 50 in the window.
2. For each candidate attribute or behavior, compute the conversion rate of leads with the signal versus leads without it, and the lift: `rate_with / rate_without`.
3. Keep signals with lift at or above roughly 1.5x and enough volume to trust (at least 30 to 50 converted records carrying the signal). Discard the rest regardless of how intuitive they feel.
4. Set points roughly proportional to lift. A signal with 4x lift should carry about twice the points of a 2x signal. Exact calibration matters less than rank order.
5. Sanity-check for confounds: "visited the integrations page" may just proxy for "already talking to sales." Signals that fire after sales contact must be excluded, or the model predicts the past.

Typical finding: 3 to 6 signals carry almost all the predictive power, and half the current model's point entries have lift near 1.0. Deleting dead weight is most of the value of this exercise.

## Back-Testing and Threshold Setting

Before the model touches a live lead, replay it against history:

1. Score every historical lead using only data available at the time it would have been scored.
2. For a candidate threshold, compute **capture rate** (what percentage of eventual closed-won deals scored at or above the threshold) and **efficiency** (what percentage of leads above the threshold converted).
3. Sweep the threshold and tabulate:

| Threshold | % of leads flagged | Capture rate of wins | Precision |
|-----------|--------------------|----------------------|-----------|
| 40 | 35% | 92% | 4% |
| 60 | 18% | 81% | 7% |
| 80 | 8% | 55% | 11% |

4. Pick the threshold with capacity math, not aesthetics. If sales development representatives (SDRs) can work 600 leads a month and the threshold produces 1,400, either raise the bar or accept a routing queue that silently ages. A healthy target: capture 70% to 85% of historical wins while flagging a volume the team can actually touch within the service level agreement (SLA).
5. A model that would have captured under roughly 60% of past wins at any workable threshold is not ready to gate anything. Ship it as a prioritization hint (sort order for SDRs) rather than an MQL gate until it improves.

Report the back-test result with the model. "This model would have flagged 78% of last year's wins while cutting worked-lead volume 40%" is the sentence that earns sales trust.

## Decay and Recalibration

**Decay:** apply a half-life to engagement points (30 days is a reasonable default for web activity, 60 to 90 for higher-commitment actions). Where the marketing automation platform cannot do true decay, approximate it: expire points 90 days after the activity, or run a monthly job that decrements aged scores. Fit points persist, but re-verify fit data yearly since people change jobs.

**Recalibration, quarterly:**

1. Re-run the closed-won lift analysis on a rolling 12-month window.
2. Compare MQL-to-opportunity conversion for the recent quarter against the back-test expectation. Drift beyond about 20% relative means weights need updating.
3. Read every sales rejection reason from the quarter; recurring reasons are missing negative signals or overweighted positives.
4. Version the model (v1, v2) and stamp the version on each lead at scoring time, so conversion reporting can split by model version. Never re-score historical records in place.

## Predictive Scoring vs Rules-Based

Rules-based models (the point tables above) are transparent, debuggable, and adequate for most companies. Machine-learned predictive scoring, whether built in-house or bought, earns its complexity only when all of these hold:

- Volume: roughly 1,000 or more leads per month, and at least 300 to 500 closed-won outcomes in the training window; below that the model overfits.
- Data breadth: behavioral and firmographic features beyond what a human would hand-weight, such as product usage telemetry.
- Someone owns it: a predictive model without an owner degrades invisibly, and unlike a points table, nobody can read it to notice.

Even with predictive scoring in place, keep the hard blocks and disqualifiers as explicit rules layered on top. A vendor model that cannot explain why a lead scored 91 still has to obey "we do not sell to competitors." When volume is between 200 and 1,000 leads a month, a well-back-tested rules model almost always beats a starved predictive one.

## Common Mistakes

- Assigning points by intuition and never back-testing against real outcomes
- One blended score, letting high engagement mask disqualifying fit
- Negative points where hard blocks are needed
- No caps on repeatable behaviors
- No decay, so the database inflates and stale leads cross the threshold months late
- Including post-sales-contact signals in training data, which makes the model look brilliant and predict nothing
- Setting the threshold without capacity math
- Re-scoring history after a model change, destroying trend lines
- Building any model at all under roughly 200 leads a month
- Treating the model as finished; unmaintained models drift within two quarters

## Output Format

Deliver a scoring model specification containing:

1. **Volume verdict**: whether scoring is warranted at current volume, and the routing alternative if not.
2. **Point tables**: fit, engagement (with decay and caps), and negative (points versus hard blocks), each row annotated with its evidence (lift and sample size) or marked as assumption.
3. **Back-test report**: threshold sweep table, chosen threshold, capture rate and precision at that threshold, capacity math.
4. **Threshold and gate logic**: the MQL rule combining fit gate and engagement bar, plus fast paths (demo request).
5. **Implementation notes**: where each component lives (marketing automation platform, customer relationship management system, warehouse), decay mechanism, model version field.
6. **Maintenance loop**: quarterly recalibration checklist and the drift metrics to watch.
7. **Data gaps**: signals worth tracking that are not instrumented today.

## Related Skills

- **lifecycle-stages**: defines the MQL stage this model gates, and the reason codes that feed recalibration
- **lead-routing**: what happens to a lead the moment it crosses the threshold
- **funnel-audit**: detects when scoring is the root cause of an MQL-to-SQL leak
- **enrichment**: fit scoring is only as good as the firmographic data enrichment provides
- **inbound-ops**: form design determines which fit fields exist to score on
