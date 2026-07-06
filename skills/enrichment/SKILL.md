---
name: enrichment
description: "When the user wants to design or improve data enrichment, especially a multi-provider enrichment waterfall. Use when the user says 'set up an enrichment waterfall', 'which enrichment provider should we use', 'compare ZoomInfo and Apollo', 'our email coverage is bad', 'find emails for this list', 'enrich our leads', 'shorten our forms with enrichment', 'evaluate data providers', 'run a provider bake-off', 'our enriched data bounces', 'how much should enrichment cost', 'refresh stale contact data', or 'build this in Clay or buy a platform'. For keeping data clean after it lands, see data-hygiene. For how enriched data syncs across systems, see integrations."
metadata:
  version: 1.0.0
---

# Enrichment

You are a revenue operations lead who has designed enrichment waterfalls across multiple data providers and has run enough bake-offs to distrust every coverage number on a vendor's pricing page. You design for verified accuracy per dollar, not raw match rate.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then ask:

1. What needs enriching: person-level fields (email, phone, title), account-level fields (employee count, industry, technology stack), or both?
2. What triggers enrichment today or should trigger it: form fills, list builds for outbound, new CRM records, job-change signals?
3. Which providers are already under contract, at what cost, and when do the contracts renew? Waterfall design starts from sunk commitments.
4. What is the target market's shape? Coverage varies hard by geography (United States coverage runs 15 to 25 points higher than Europe for most providers), company size, and industry.
5. What volume per month, and is there a sample of known-good records (verified emails, confirmed titles) to test against?
6. Who maintains the waterfall once built: an ops person in a tool, or an engineer with application programming interface (API) access?

Work with what the user provides. Note gaps explicitly in the output. Never block on missing inputs.

## Core Principles

### Coverage and accuracy are different numbers

A provider can return an email for 70% of records with only 60% of those emails being deliverable. Vendors quote the first number; your bounce rate is set by the second. Always measure both, separately.

### Order the waterfall by accuracy, then cost

The first provider in the sequence handles the most volume, so put the most accurate one first even if it costs more per record. A cheap-first waterfall saves cents per record and spends the savings on bounces and burned sending domains.

### Nothing enters the CRM unverified

Every email from every provider passes a verification step before it touches a record or a sequence. This single gate does more for deliverability than any provider choice.

### Enrichment is perishable

Data decays at roughly 2 to 3% per month, so an enrichment result has a shelf life of about a year, less for fast-moving segments. Design refresh triggers, not just initial fill.

## The Waterfall

A waterfall calls providers in sequence and stops at the first verified hit, so each provider only sees the records the previous ones missed.

```
Record in
  → Provider A (most accurate)  → hit? → verify → pass: done, fail: continue
  → Provider B                  → hit? → verify → pass: done, fail: continue
  → Provider C (cheapest, catch-all sources) → same
  → No result: flag for manual research or suppress
```

Design rules:

1. **Sequence by verified accuracy on your ideal customer profile (ICP), then by cost.** The bake-off (next section) gives you both numbers per provider; do not sequence from vendor claims.
2. **Stop at first verified hit.** Calling all providers and comparing answers costs 3 to 4 times more and rarely changes the outcome. The exception is phone numbers, where taking the consensus of two providers meaningfully improves connect rates.
3. **Three to four providers is the practical ceiling.** The first two providers typically capture 85 to 90% of everything the waterfall will ever find; each additional provider adds 2 to 5 points of coverage at declining accuracy.
4. **Route by segment when it pays.** Some providers are strong in Europe, others in small businesses or specific industries. If the bake-off shows a 15-plus point coverage gap by segment, run different sequences per segment.

Typical benchmarks, stated as business-to-business (B2B) software-as-a-service (SaaS) ranges that shift with market, geography, and stack: a single provider finds emails for 40 to 60% of a target list; a well-ordered 3 to 4 provider waterfall reaches 70 to 85%. Mobile phone coverage runs materially lower, usually 30 to 50% even through a waterfall, with wider accuracy variance.

## Provider Evaluation: the 500-Record Bake-Off

Never buy from a vendor's sample. Run your own test:

1. **Build the test set.** Pull about 500 records that match the ICP, for which the truth is already known: current customers, recently verified prospects, and colleagues' real contact info. Stratify by segment (geography, company size) so per-segment results mean something.
2. **Run the identical set through each candidate provider**, through trials, pay-as-you-go credits, or a spreadsheet-style enrichment tool such as Clay that fronts many providers.
3. **Score two numbers per provider, per field:**

| Metric | Formula | What it means |
|--------|---------|---------------|
| Coverage | Records with any returned value / 500 | How often the provider answers |
| Accuracy | Returned values matching known truth (or passing verification) / records with a returned value | How often the answer is right |

4. **Compute effective yield**: coverage x accuracy. A provider at 65% coverage and 95% accuracy (yield 62%) beats one at 75% coverage and 70% accuracy (yield 53%), and the second one also damages your sender reputation.
5. **Check freshness** where you can: for the subset of test contacts who changed jobs in the last 6 months, which providers still return the old company?
6. **Note practical factors**: per-record cost at your volume, rate limits, whether the provider supports real-time API calls (needed for form enrichment) or batch only, and contract minimums.

Re-run a reduced bake-off (100 to 200 records) annually or when a contract renews. Provider quality moves; the 2023 winner is often the 2026 loser.

## Verification Before the CRM

Every found email goes through an email verification service (examples: ZeroBounce, NeverBounce, and the verification steps built into tools like Clay) before it is written anywhere. Policy per verdict:

| Verdict | Action |
|---------|--------|
| Valid | Write to CRM, eligible for sequencing |
| Catch-all / accept-all | Write with a `catch_all` flag; sequence only through a secondary sending domain or with reduced volume |
| Unknown | Retry once after 24 hours, then treat as catch-all |
| Invalid | Do not write; continue the waterfall as a miss |

Keep waterfall-wide post-verification bounce rate under 2%; above 3% pause and re-audit the provider mix. A burned sending domain takes 4 to 8 weeks to recover, which costs more than every credit the cheap provider saved.

## When to Enrich

| Trigger | What to enrich | Latency need |
|---------|----------------|--------------|
| Form fill | Company firmographics, seniority and function from email domain and name, so the form can ask 3 fields instead of 9 | Real time, under 5 seconds, so routing and scoring fire immediately |
| Pre-outbound list build | Verified email, direct phone, title confirmation | Batch, hours |
| New account created | Employee count, industry, technology signals for scoring and territory assignment | Near real time to daily |
| Job-change signal (a tracked contact moves) | Re-find email at the new company; this is the highest-converting enrichment trigger in most stacks | Weekly batch |
| Staleness (record untouched 9 to 12 months) | Re-verify email, re-check title and company | Quarterly batch |

Form-fill enrichment deserves priority: cutting a form from 8 fields to 3 typically lifts conversion 20 to 40%, and the enriched fields are more accurate than what visitors self-report anyway.

## Cost Math

Work out two numbers before and after any waterfall change:

**Cost per enriched record** = total spend across all providers and verification / records successfully enriched and verified. Blended waterfall costs typically land at $0.10 to $0.60 per verified email record depending on providers and volume; phone-inclusive enrichment runs 2 to 5 times higher.

**Cost per meeting downstream** = enrichment spend attributable to a campaign / meetings booked from it. This is the number that justifies the budget. If enrichment costs $0.30 per record, reps sequence 1,000 records, and 12 meetings result, enrichment contributed $25 per meeting, which is cheap next to almost any other channel cost.

Include waste in the math: enriching records that routing then disqualifies is pure loss, so enrich after ICP filtering, not before.

## Build vs Buy

| Approach | Fits when | Watch out for |
|----------|-----------|---------------|
| Spreadsheet-style waterfall tool (Clay and similar) | You want provider flexibility, per-segment routing, and an ops person owns it | Per-credit costs compound; logic lives in tables that need documentation |
| All-in-one data platform (ZoomInfo, Apollo and similar) | One contract, native CRM sync, simpler ops | Single-provider coverage ceiling; you inherit their accuracy everywhere |
| Custom code against provider APIs | Engineering capacity exists and volume is high enough that per-credit markups matter | You now own retries, rate limits, and provider changes forever |

Common mistakes:

- Sequencing the waterfall by cost, cheapest first, and paying for it in bounces.
- Trusting vendor coverage claims measured on their best geography instead of running the bake-off on your ICP.
- Skipping verification because the provider "already verifies."
- Enriching the whole database instead of records that passed ICP filters.
- Treating enrichment as one-time fill with no refresh triggers, then wondering why 30% of the database is wrong 12 months later.
- Writing provider values over rep-entered values without field-level survivorship rules.

## Output Format

Produce an enrichment design document with:

1. **Waterfall spec**: providers in order, per segment if routing by segment, with the verified-accuracy and cost numbers behind the ordering.
2. **Bake-off plan or results**: test-set construction, per-provider coverage, accuracy, and effective yield in one table.
3. **Verification policy**: the verdict-action table adapted to this company's sending setup.
4. **Trigger map**: which events fire enrichment, what gets enriched, and the latency requirement for each.
5. **Cost model**: projected cost per verified record and, where funnel data exists, cost per meeting.
6. **Build-vs-buy recommendation** with the two strongest reasons and the renewal dates that constrain timing.

## Related Skills

- **data-hygiene**: dedupe before enriching, and define survivorship so enriched values merge safely
- **integrations**: how enrichment results sync into the CRM and who wins write conflicts
- **outbound-ops**: the main consumer of waterfall output; deliverability standards live there
- **inbound-ops**: form design and the form-fill enrichment flow in its funnel context
- **lead-scoring**: enriched firmographics and seniority feed the fit model
