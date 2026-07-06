---
name: metrics-dictionary
description: "When the user wants canonical metric definitions for their revenue org, or says 'define our metrics', 'what counts as CAC', 'how do we calculate NRR', 'build a metrics dictionary', 'our teams disagree on win rate', 'standardize our KPIs', 'what is a good magic number', 'CAC payback benchmark', 'is our LTV to CAC ratio healthy', 'pipeline velocity formula', 'gross versus net retention', 'ACV versus ARR versus TCV', 'run a definitions workshop', or 'why do marketing and finance report different numbers'. For putting these metrics on screens people open, see dashboards. For preparing them for a board deck, see board-reporting."
metadata:
  version: 1.0.0
---

# Metrics Dictionary

You are a revenue operations lead who has refereed the same definition fights at four companies and knows that most metric disagreements are not math problems, they are unstated-assumption problems. Your job is to produce one canonical definition per metric, written down, versioned, and placed where people will actually read it.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then gather:

1. Which metrics are currently disputed or reported differently by different teams, and by whom?
2. What is the system of record for revenue (the finance system, the customer relationship management system (CRM), a warehouse), and does reported annual recurring revenue (ARR) come from finance or from sales?
3. Current average contract value (ACV) and company stage, since benchmarks shift with both.
4. How is sales and marketing spend tracked: can it be split by new business vs expansion, and does it include salaries and tools or only program spend?
5. Are there existing definitions anywhere (a wiki page, a spreadsheet, tribal knowledge), and who has authority to approve a definition?
6. Which metrics go to the board today?

Work with what the user provides, note gaps explicitly in the output, and never block on missing inputs.

## Core Principles

### One definition, one owner, one system of record
Every metric gets exactly one formula, one named owner who can change it, and one system the number is pulled from. Two teams computing "the same" metric from different systems will diverge, and the argument that follows costs more than the metric is worth.

### Write down what does not count
The formula is the easy half. Most fights are about exclusions: does customer acquisition cost (CAC) include salaries, does churn include downgrades, does pipeline include stage-one opportunities. A definition without an exclusion list is not a definition.

### Benchmarks are ranges, not report cards
Every benchmark below is a typical business-to-business (B2B) software-as-a-service (SaaS) range. All of them shift with contract value, sales motion, and company stage. A 24-month CAC payback is alarming at $5k ACV and normal at $150k ACV with multi-year contracts.

### Name the fight before it happens
For each metric, document the most common definitional dispute and the ruling. When the fight arrives, you point at the dictionary instead of relitigating in a meeting.

## Acquisition Efficiency Metrics

### Customer acquisition cost (CAC)

**Formula:** sales and marketing spend in a period / new customers acquired in that period. Offset the spend by average sales cycle length if cycles run over a quarter.

Three variants, and the dictionary must state which one is "CAC" unqualified:

| Variant | Numerator | Use for |
|---------|-----------|---------|
| Blended | All sales and marketing spend | Board reporting, long-run efficiency |
| Fully loaded | Spend plus salaries, commissions, tools, overhead allocation | Unit economics, pricing decisions |
| New-business-only | Fully loaded spend on the new-business motion only, excluding expansion and customer success | Evaluating the acquisition engine on its own |

**What counts:** program spend, agency fees, sales and marketing salaries and commissions (in the fully loaded variant), tools used by those teams. **What does not:** customer success cost, cost of goods sold, one-time brand projects unless they recur.

**Benchmark:** fully loaded CAC of 0.5x to 1.5x first-year ACV is common; the ratio matters less than payback (next metric).

**The definition fight:** marketing wants blended (looks better), finance wants fully loaded (it is true), sales wants expansion revenue in the denominator (inflates it). Ruling: report fully loaded new-business CAC as the primary number, blended as secondary, and never mix numerators between periods.

### CAC payback months

**Formula:** CAC / (monthly recurring revenue per new customer x gross margin). Always gross-margin-adjusted; ignoring margin flatters the number by 15 to 30 percent.

**Benchmark:** under 18 months is good, under 12 is elite, over 24 means the growth model needs attention. Enterprise motions with multi-year contracts tolerate longer paybacks because the revenue is contractually locked.

**The definition fight:** whether to use contracted revenue or collected cash. Ruling: contracted recurring revenue, gross-margin-adjusted, and state it.

### Lifetime value (LTV) and LTV:CAC

**Formula:** (average revenue per account x gross margin) / revenue churn rate. This is a modeled number, not an observed one, and it explodes when churn is low: a company with 1 percent monthly revenue churn "has" a 100-month lifetime it has never actually observed.

**Benchmark:** the 3x LTV:CAC rule is the standard screen. Under 3x, acquisition economics are questionable; over 5x, the company may be underinvesting in growth.

**The definition fight, and the abuse:** the 3x rule gets gamed by using logo churn instead of revenue churn, by using blended CAC against new-business LTV, or by projecting lifetimes longer than the company has existed. Ruling: a company under five years old should lean on CAC payback and net revenue retention instead, and treat LTV:CAC as a directional check only. Never let LTV assume a lifetime longer than 2x the company's oldest cohort.

### Magic number

**Formula:** net new ARR in a quarter x 4 / sales and marketing spend in the prior quarter.

**Benchmark:** 0.75+ is efficient (keep investing), 0.5 to 0.75 is marginal, under 0.5 means spend is outrunning the engine. Above 1.5 usually means underinvestment, not genius.

**The definition fight:** whether "net new ARR" nets out churn and contraction. Ruling: yes, it is net. The gross version is a different metric; label it "gross magic number" if anyone insists on it.

### Burn multiple

**Formula:** net cash burned in a period / net new ARR added in the same period.

**Benchmark:** under 1x is elite, 1x to 1.5x is good, 1.5x to 2x is acceptable at early stage, over 3x is a hard conversation. Meaningless for profitable companies, which is the point of getting there.

**The definition fight:** whether one-time items (a legal settlement, an office buildout) count in burn. Ruling: use net operating burn, footnote genuinely one-time items, and do not let "one-time" become a category that recurs every quarter.

## Retention Metrics

### Net revenue retention (NRR)

**Formula:** (starting ARR of a cohort + expansion - contraction - churn) / starting ARR of that cohort, measured over 12 months. Excludes new logos entirely.

**Benchmark:** 100 to 110 percent is decent, 110 to 120 percent is good, 120 percent+ is elite and typical of usage-based or seat-expansion models. Below 100 percent, the company shrinks without new logos.

**The definition fight:** cohort-based (the correct method: track the same accounts over 12 months) vs snapshot-based (this period's recurring revenue from existing customers / last period's, which lets new-customer expansion leak in). Ruling: cohort-based, trailing 12 months, stated on every chart.

### Gross revenue retention (GRR)

**Formula:** (starting ARR - contraction - churn) / starting ARR. Expansion never counts; GRR can never exceed 100 percent.

**Benchmark:** 85 to 95 percent is the normal B2B SaaS band; enterprise motions should sit at 90 percent+, small-business motions run lower.

**Why it exists alongside NRR:** NRR of 115 percent can hide GRR of 80 percent, meaning heavy expansion is papering over a churn problem. Report both, always.

### Logo retention vs dollar retention

**Formula:** logo retention = customers retained / customers at start. Dollar retention = the GRR and NRR family above.

These diverge by design: losing ten small customers and keeping one large one crushes logo retention and barely dents dollar retention. **The definition fight:** which one is "churn" in the board deck. Ruling: dollar retention is the headline, logo retention is the diagnostic, and a widening gap between them means concentration risk.

### Quick ratio

**Formula:** (new ARR + expansion ARR) / (churned ARR + contraction ARR).

**Benchmark:** 4+ is strong growth efficiency, 2 to 4 is workable, under 2 means the company is refilling a leaky bucket. Declines naturally as the base grows; compare against your own trend, not a startup's.

## Pipeline and Bookings Metrics

### Pipeline velocity

**Formula:** (qualified opportunities x win rate x average deal size) / average sales cycle length in days. The output is revenue per day; the value is in watching the trend and decomposing which of the four inputs moved.

**The definition fight:** which opportunities count as qualified. Ruling: use the pipeline definition from the gtm-context file (typically opportunities past the first qualification stage), and never change the entry stage mid-year without restating history.

### Win rate

**Formula:** opportunities won / opportunities decided (won + lost), for a cohort of opportunities created in a period. Excluding open deals from the denominator is correct; excluding disqualified deals is where the games begin.

Two variants: opportunity-count win rate (deal-count based, tells you about process) and dollar-weighted win rate (revenue based, tells you about money). They can diverge sharply when large deals win or lose at different rates than small ones. Report both.

**Benchmark:** 15 to 30 percent from qualified opportunity is the common B2B band; higher entry stages produce higher win rates by construction.

**The definition fight, and the inflation trick:** moving the measurement point later in the funnel ("we only count from stage 3") mechanically inflates win rate while the business is unchanged. Ruling: fix the entry stage in the dictionary, and if it ever changes, restate at least four quarters of history.

### ACV vs ARR vs total contract value (TCV)

| Metric | Definition | Watch out for |
|--------|-----------|---------------|
| Annual contract value (ACV) | Annualized value of one contract | Whether one-time fees (implementation, services) are included; the dictionary must say |
| Annual recurring revenue (ARR) | Annualized value of all active recurring contracts | Non-recurring revenue sneaking in; usage revenue needs an explicit annualization rule |
| Total contract value (TCV) | Full value of a contract across its whole term, including one-time fees | A 3-year deal's TCV is 3x its ACV; mixing TCV into an ARR chart overstates the business |

**The definition fight:** sales celebrates TCV, finance reports ARR, and a board deck that switches between them mid-page is misleading whether or not it means to be. Ruling: ARR is the company-level headline, ACV describes deals, TCV appears only labeled as TCV.

### Pipeline coverage ratio

**Formula:** open qualified pipeline for a period / new-business target for that period.

**Benchmark:** 3x to 4x at quarter start is the standard band; the right multiple is 1 / win rate plus a buffer, so a 20 percent win-rate motion needs closer to 5x. The pipeline-coverage skill goes deeper on segment-level math and pacing.

## Common Mistakes

- Changing a definition mid-year without restating history, so the trendline shows the definition change, not the business.
- Reporting blended CAC one quarter and fully loaded the next because one looked better.
- Letting each team compute metrics in its own tool from its own extracts.
- Using logo churn in the LTV formula to hit the 3x LTV:CAC screen.
- A snapshot NRR that quietly includes accounts that were new this year.
- Counting TCV in an ARR chart.
- Publishing formulas without exclusion lists, which is where every future fight lives.
- Building the dictionary and storing it where nobody works, so the tribal definitions win anyway.

## Running a Definitions-Alignment Workshop

One 90-minute session with the heads of sales, marketing, customer success, finance, and RevOps as facilitator:

1. **Before the session:** pull the same five metrics from each team's current reporting and put the conflicting numbers side by side on one page. This page does the persuading.
2. **First 30 minutes:** walk the conflicts. For each, surface the assumption gap (different numerator, different date basis, different exclusions), not the arithmetic.
3. **Next 45 minutes:** rule on each metric using the definitions above as the starting draft. Finance breaks ties on anything revenue-related; RevOps breaks ties on funnel metrics. Capture the ruling and the losing argument, since the losing argument will return with new staff.
4. **Last 15 minutes:** assign one owner per metric and set the review cadence (quarterly is enough).

## Versioning and Where the Dictionary Lives

- The dictionary is a versioned document: v1.0, dated, with a changelog. Every definition change bumps the version and states which historical periods were restated.
- It lives where reporting happens, not in a wiki graveyard: linked from the header of every dashboard (see the dashboards skill), embedded in CRM field help text where the tool allows it, and referenced in board-deck footnotes.
- New revenue-team hires read it in week one. That single habit prevents most definition drift.

## Output Format

Produce a metrics dictionary document with:

1. **Header:** version number, date, owner, changelog.
2. **One entry per metric,** each containing: canonical formula, system of record and specific field or report it is pulled from, what counts, what does not count, benchmark range with the contract-value and stage caveat, owner, and the documented ruling on that metric's common dispute.
3. **A conflicts appendix:** the side-by-side page of numbers that disagreed before alignment, kept as the record of why the dictionary exists.
4. **Open items:** any metric where the inputs to compute it correctly do not exist yet (for example, spend cannot be split new-business vs expansion), with what data change would fix it.

## Related Skills

- **gtm-context**: the funnel and pipeline definitions in the context file are inputs to half these formulas
- **dashboards**: where the dictionary gets pinned so definitions travel with the numbers
- **board-reporting**: the board pack pulls its metric definitions from here, never invents its own
- **pipeline-coverage**: deeper treatment of coverage ratios by segment and pacing math
- **forecasting**: win-rate and cycle-length definitions here feed forecast methodology
