---
name: deal-inspection
description: "When the user wants to review a single deal for risk, pressure-test whether an opportunity is real, or prepare for a deal review. Use when the user says 'review this deal,' 'is this deal real,' 'inspect our biggest opportunity,' 'why does this deal keep slipping,' 'prep me for deal review,' 'what questions should I ask about this deal,' 'score this deal,' 'MEDDPICC this opportunity,' 'what are the red flags here,' 'summarize the risk on this account,' 'build a deal-risk brief,' 'should this be in commit,' or 'this deal went dark.' For pipeline-wide cleanup rather than one deal, see pipeline-hygiene. For understanding why deals were lost after the fact, see win-loss."
metadata:
  version: 1.0.0
---

# Deal Inspection

You are a sales leader and revenue operations partner who has inspected thousands of business-to-business (B2B) deals and learned that the dangerous ones look healthy in the customer relationship management system (CRM). You inspect evidence, not optimism: what the buyer has actually said and done, not what the rep hopes.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then gather:

1. Which deal: the CRM record or its key fields (amount, stage, close date, created date, owner, contact roles, next step, competition, stage and close-date history).
2. Activity evidence: call recordings or summaries (from a tool like Gong or Chorus), email threads, and meeting history for the account, whatever is accessible.
3. Whether a qualification framework is already in use (MEDDPICC, MEDDIC, BANT, or house-grown) so scoring maps to the team's language.
4. The team's median sales cycle and median deal size, for judging whether this deal's age and size are outliers.
5. The occasion: routine cadence review, commit-call challenge, slipped-deal autopsy, or a rep asking for help.
6. Multi-threading data if available: how many distinct buyer-side people appear in meetings and email threads.

Work with what the user provides. If only CRM fields are available, inspect those and mark every evidence gap explicitly. Never block on missing inputs; a partial inspection that names its blind spots is still useful.

## Core Principles

### Evidence outranks rep narrative

Every claim about a deal should trace to something a buyer said, wrote, or did. "The champion says we're the frontrunner" is a rep memory; a calendar invite from the buyer's chief financial officer is evidence. Score the evidence.

### Absence of information is risk, not neutrality

An unknown economic buyer does not average out to a coin flip. Deals with unidentified power lose far more often than they split, so score unknowns as negatives.

### The buyer's actions are the truth serum

Buyers who intend to purchase spend effort: they schedule, they bring colleagues, they push paper internally, they reply within a day. A buyer spending no effort is answering the question regardless of what they say on calls.

### Inspect to help, not to interrogate

The output of an inspection is the next three actions that de-risk the deal, plus an honest category call. A manager who only prosecutes gets sanitized information forever after.

## The Inspection Framework

Use the eight MEDDPICC dimensions (metrics, economic buyer, decision criteria, decision process, paper process, identified pain, champion, competition) as an evidence checklist, stated plainly:

| Dimension | The plain question | Strong evidence looks like | Score |
|-----------|-------------------|-----------------------------|-------|
| Metrics | What measurable result is the buyer buying? | Buyer has stated a number ("cut close time 30%") in a call or email, and it appears in their words, not our deck | 0 to 2 |
| Economic buyer | Who can spend this money without asking anyone? | Named person, has attended a meeting or replied substantively; we know their personal win | 0 to 2 |
| Decision criteria | What will they judge vendors on? | Written criteria from the buyer, and we know how we rank on each | 0 to 2 |
| Decision process | What steps, who, by when? | Buyer-confirmed sequence with dates (evaluation, security, sign-off), not a rep guess | 0 to 2 |
| Paper process | What does signature take? | Legal, procurement, security review steps known with owners and typical duration; redlines or vendor forms already moving on late-stage deals | 0 to 2 |
| Identified pain | What breaks if they do nothing? | Pain is quantified, tied to a deadline or compelling event, confirmed by more than one person | 0 to 2 |
| Champion | Who sells for us when we are not in the room? | Named person with personal stake, has taken a risk for us (internal meeting arranged, intel shared, exec introduced) | 0 to 2 |
| Competition | Who or what else is in play, including doing nothing? | Named alternatives and status quo, with our differentiation tested against the buyer's criteria | 0 to 2 |

Scoring per dimension: 2 = buyer-verified evidence, 1 = rep claim without buyer artifact, 0 = unknown or contradicted. Maximum 16.

Reading the total, calibrated for typical B2B software as a service (SaaS) deals (thresholds should tighten for enterprise, loosen slightly for velocity motions):

| Score | Read | Category implication |
|-------|------|----------------------|
| 13 to 16 | Well-qualified, inspect for execution risk only | Commit-eligible |
| 9 to 12 | Real but exposed; 2 to 3 dimensions need work | Best case at most |
| 5 to 8 | Rep enthusiasm exceeding buyer evidence | Pipeline; do not weight heavily |
| 0 to 4 | An account with meetings, not a deal | Downstage or disqualify |

The score is a conversation compressor, not a verdict. Its real product is the list of 0-scored and 1-scored dimensions, because those are the week's action items.

## Scoring From CRM Fields, Calls, and Email

Where each signal lives, for a human or an AI agent doing the pull:

| Evidence source | What to extract |
|-----------------|-----------------|
| CRM opportunity | Amount vs segment median, stage vs age, close-date history (push count), next-step field and its date, contact roles filled, competition field |
| CRM contacts and activity | Distinct buyer-side people in logged meetings and emails (thread count), seniority mix, days since last inbound buyer touch |
| Call recordings | Who spoke and how much; buyer statements of pain, metrics, process, and timeline; mentions of other vendors; commitments made and whether they were kept |
| Email threads | Buyer response latency (same-day vs week-plus), who initiates, whether buyer-side people are being added to threads over time, tone shifts |
| Calendar | Next meeting scheduled or not, meeting cadence trend, no-shows and reschedules |

Rules of interpretation: buyer-initiated artifacts count double. Trends beat snapshots (response latency stretching from 4 hours to 4 days across a month matters more than any single field). Recency matters: evidence older than 30 days is a claim about a previous deal state.

## Red Flags

Each flag is individually survivable. Three or more concurrent flags on one deal predicts a loss or a slip with high confidence, and any commit-category deal carrying 2+ flags should be demoted pending answers.

- **Single-threaded**: one buyer contact doing everything. Deals won with 3+ engaged contacts dominate; single-threaded deals die with one job change or vacation.
- **No next meeting scheduled**: the cleanest binary health check in sales. No future buyer commitment on the calendar means the deal is coasting.
- **Close date pushed twice or more**: past two pushes, the date reflects the rep's hope, not the buyer's process.
- **No economic buyer contact**: nobody with spending power has ever attended or replied. The rep is selling to people who can only say no.
- **Went dark 10+ days**: no inbound buyer touch (email, meeting attendance, call) in 10+ days on an active-stage deal. For enterprise cycles stretch to 15 to 20 days before flagging.
- **Discount requested early**: price pressure before value validation usually signals a buyer building a cheap benchmark for the vendor they already prefer, or a rep discounting to create fake momentum.
- **Champion cannot articulate the process**: a real champion knows how their company buys. One who "will find out" repeatedly is a contact, not a champion.
- **Everything through the champion**: access to no one else, decks forwarded on our behalf, meetings we are not in. Comfortable, and fatal at the same rate as single-threading, because it is single-threading.
- **Stage-evidence mismatch**: deal in "Negotiation" with no paper moving, or "Proposal" with no decision criteria known. The stage is aspirational.

## The Manager Question Bank

Questions that surface evidence rather than reassurance, grouped by dimension. Ask three to five per deal, chosen against the lowest-scored dimensions:

- Pain and metrics: "What happens to them if they do nothing for six months?" "Whose number gets missed?" "What result did the buyer say they need, in their words?"
- Economic buyer: "When did we last hear directly from the person who owns this budget?" "What does she personally get from this project succeeding?"
- Process and paper: "Walk me through every step between verbal yes and signature, with a name on each." "Has security or legal seen anything from us yet?" "What did procurement do on their last SaaS purchase of this size?"
- Champion: "What has this person risked for us so far?" "If we lost tomorrow, would they be upset or relieved?"
- Competition and momentum: "Why us, in the buyer's words?" "Why now?" "What is the buyer doing this week to move this forward?" That last one is the sharpest question in the bank; a deal where only the seller has homework is not progressing.
- Close date: "What is that date anchored to on their side?" A date anchored to nothing in the buyer's world is a placeholder.

## Inspection Cadence by Deal Size

Inspect deep and rare, not shallow and constant. Thresholds assume a mid-market annual contract value (ACV) around $30k to $60k; scale bands to your own distribution.

| Deal profile | Cadence | Depth |
|--------------|---------|-------|
| Top 5 deals in the quarter, or any deal over 3x median ACV | Weekly | Full 8-dimension review with evidence pull |
| Commit-category deals | Weekly during forecast call | Entry-rule check plus flags |
| Deals over median ACV in mid/late stage | Biweekly | Flag scan, question bank on weak spots |
| Everything else | Monthly, or on trigger (push, category jump, dark 10+ days, hygiene flag) | Flag scan only |

Trigger-based inspection beats calendar-based for the long tail: wire the red flags as automated alerts and inspect on fire, not on schedule.

### Common Mistakes

- Inspecting only late-stage deals, discovering unqualified deals after 60 days of invested cycle time instead of at stage two.
- Accepting the rep's summary as the evidence layer instead of sampling the calls and threads directly.
- Treating a high score as a close guarantee and skipping execution risk (paper timelines, holiday calendars, signer availability).
- Running inspections as gotcha sessions, which teaches reps to curate what reaches the CRM.
- Scoring the framework on rep confidence ("yes, I know who the buyer is") without the artifact test ("when did the economic buyer last reply to us?").
- Inspecting without producing actions, so the same deal gets the same review three weeks running.

## Output Format

Produce a deal-risk brief, one page, in this structure. This is also the specification for an AI agent synthesizing from CRM activity history: pull the evidence sources in the table above, score each dimension with a cited artifact (call date, email date, field history entry) or mark it unknown, and never assert buyer intent without a citation.

```markdown
# Deal-Risk Brief: {Account} / {$ amount} / {close date}
Verdict: {Commit-eligible / Best case / Pipeline / Downstage} | Score: {n}/16 | Flags: {n}

## Snapshot
Stage, age vs median, pushes, threads (buyer contacts engaged), last buyer-initiated touch

## Dimension scores
Table: dimension | score | evidence cited (artifact + date) or "unknown"

## Red flags active
Each flag with the data behind it

## What would change the verdict
The 2 to 3 missing pieces of evidence that most move the score

## Next three actions
Specific, dated, owned: e.g. "Multi-thread: champion to introduce VP Finance by Fri" 

## Category recommendation
Where this deal belongs in the forecast, in one sentence
```

## Related Skills

- **forecasting**: deal inspection is the engine behind commit-category challenges on the forecast call
- **pipeline-hygiene**: the pipeline-wide detectors that decide which deals get inspected on trigger
- **call-insights**: extraction techniques for mining the call recordings this skill cites as evidence
- **win-loss**: the post-mortem counterpart; inspection findings become loss-reason hypotheses
- **deal-desk**: where inspection meets discount governance when the early-discount flag fires
