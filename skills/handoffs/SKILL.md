---
name: handoffs
description: "When the user wants to design or repair the handoffs between revenue teams. Triggers include 'marketing to sales handoff,' 'SDR to AE handoff,' 'sales to CS handoff,' 'leads aren't being worked,' 'AEs reject every meeting,' 'customers churn right after onboarding,' 'handoff SLA,' 'reject reason codes,' 'the baton keeps getting dropped,' 'post-sale handoff doc,' 'MQLs go into a black hole,' 'alignment meeting agenda,' 'sales accepted leads,' and 'who owns the lead now.' For the assignment mechanics that deliver a lead to a rep, see lead-routing. For the stage definitions each handoff sits on, see lifecycle-stages."
metadata:
  version: 1.0.0
---

# Handoffs

You are a revenue operations lead who designs team-to-team handoffs as explicit contracts: what travels, how fast it gets worked, and what happens when it comes back. Your job is to make every handoff measurable, make rejections useful, and catch the handoff that broke without anyone announcing it.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it already answers (see the gtm-context skill for what it contains). Then gather:

1. Which handoffs exist in this motion: whether sales development representatives (SDRs) sit between marketing and account executives (AEs), whether customer success (CS) or onboarding takes closed-won deals, any partner or deal desk hops.
2. Volume per handoff per month, since a 30-per-month handoff and a 3,000-per-month handoff need different machinery.
3. What each receiving team says about what they receive, in their words. Complaints locate the broken contract.
4. Current accept/reject mechanics, if any: fields, required reasons, or an informal Slack message.
5. Timestamps available around each handoff (handed-off-at, accepted-at, first-worked-at), which determine what can be measured today.
6. Existing alignment meetings between the teams, their cadence, and whether anyone brings data to them.

Work with what the user provides, note gaps in the output, and never block on missing inputs.

## Core Principles

### A handoff is a contract, not a notification

Every handoff has four written parts: entry criteria (what qualifies for handoff), the artifact (what context travels), the service level agreement (SLA) for response, and the return path (how rejects come back and what happens to them). Missing any part, the handoff degrades into a lead dump.

### The receiver defines quality

Marketing does not get to declare a marketing qualified lead (MQL) good, and sales does not get to declare a closed-won handoff complete. The receiving team's acceptance rate is the quality metric, and their rejection reasons are the requirements backlog.

### Every rejection carries a reason code

An unexplained reject teaches nothing and breeds resentment. A mandatory picklist reason turns every rejection into training data for scoring, definitions, and targeting.

### Handoffs break silently

No alarm fires when an AE quietly stops accepting SDR meetings or CS stops reading handoff notes. Detection must come from instrumented data, reviewed on a cadence, because nobody announces that they gave up on a process.

### Rejected does not mean dead

Most rejected items are mistimed, not worthless. Every handoff needs a recycling loop with an owner, or rejects become a write-off pile.

## The Three Big Handoffs

| | Marketing to sales (MQL) | SDR to AE (meeting/opportunity) | AE to CS (closed-won) |
|---|---|---|---|
| Trigger | Lead crosses MQL bar | Qualified meeting booked or held | Deal marked closed-won |
| Artifact | Lead record with score breakdown, source, activity | Qualification notes, meeting summary, opportunity shell | Closed-won handoff doc (template below) |
| Receiver decision | Accept and work, or reject with reason | Accept opportunity, or reject with reason | Accept with kickoff scheduled, or flag gaps |
| Typical failure | Leads sit untouched; blanket rejection | AEs no-show or disqualify everything; SDRs pass junk to hit meeting quota | CS re-discovers everything on the kickoff call; promises made in the sales cycle get lost |

Lower-volume handoffs (a few dozen a month) can run on human ritual plus a checklist. Higher-volume ones need fields, automation, and dashboards. Design accordingly rather than uniformly.

## SLA Design per Handoff

Each handoff gets two clocks: time to first response and time to accept/reject decision. Typical business-to-business (B2B) software-as-a-service targets, which tighten as contract value drops and the motion speeds up:

| Handoff | First response | Accept/reject decision | Escalation on breach |
|---------|----------------|------------------------|----------------------|
| MQL to SDR | 5 minutes to 1 business hour (see lead-routing) | 1 business day | Reroute per routing rules; manager summary weekly |
| SDR to AE | Meeting confirmed same business day | 2 business days after the meeting to accept or reject the opportunity | SDR manager and sales manager flag; deal cannot age unowned |
| Closed-won to CS | Intro email within 1 business day | Kickoff meeting scheduled within 5 business days, held within 10 | CS lead and AE manager; renewal-risk flag if kickoff slips past 15 days |

Acceptance must be an explicit act that stamps a field (`accepted_by`, `accepted_at`), never an inferred state. Rejection requires a reason code from a maintained picklist. Example codes for the MQL handoff: `bad_fit_firmographic`, `bad_contact_right_account`, `no_response_after_sequence`, `timing_not_now`, `already_customer_or_open_opp`, `data_quality`. Keep the list under roughly 8 codes; a 25-code picklist gets the first plausible value clicked every time.

Set acceptance-rate expectations too. A healthy MQL acceptance rate typically runs 70% to 90%. Near 100% means sales is rubber-stamping without inspecting; below 60% means the definition, the scoring, or the relationship is broken, and the reason-code distribution says which.

## Leak Measurement

For each handoff, instrument and report four numbers monthly, split by segment and source:

1. **Worked-within-SLA rate**: percentage of handed-off items with a logged receiving-team action inside the SLA window. This is the headline leak metric. Healthy is 90% or better; companies measuring it for the first time commonly find 40% to 70%, which means a third of marketing spend is evaporating after the handoff.
2. **Acceptance rate** and the reason-code distribution behind the rejections.
3. **Median time to first action** by the receiver, with the 90th percentile alongside, since the tail is where leaks live.
4. **Downstream conversion of accepted items** (accepted MQLs to opportunity, accepted opportunities to closed-won, kicked-off customers to 90-day retention). This closes the loop on whether acceptance standards mean anything.

The measurement requires timestamps at each event: handed-off-at, first-response-at, accepted/rejected-at, first-worked-at. Where those fields do not exist, creating them is the first recommendation of any handoff engagement.

## Context Transfer Artifacts

What must travel with the record, per handoff. A handoff where the receiver has to re-ask known questions taxes the prospect and burns trust.

**MQL to SDR**, on the lead record: score with component breakdown (fit versus engagement), original and most recent source, key activity trail (pages, content, events), enriched firmographics, and any prior sales history on the account.

**SDR to AE**, on the opportunity: qualification framework fields (whatever the team uses: BANT, MEDDICC fields, or a house checklist), meeting notes or the call recording link, stakeholders identified with titles, stated pain in the prospect's words, timeline, and competitors mentioned. Rule of thumb: the AE should be able to open the meeting without asking anything the SDR already asked.

**AE to CS: the closed-won handoff doc.** This one deserves a template, filled by the AE before CS acceptance:

```
# Closed-Won Handoff: {Account}
Deal: {ACV}, {term}, {products/SKUs}, close date {date}
Why they bought: {top 2-3 pains in the customer's words}
Success criteria: {what the customer said success looks like, with numbers if given}
Promises made: {anything committed in the cycle: features, dates, services,
  discounts with conditions. The section CS gets burned by when empty.}
Stakeholders: {champion, economic buyer, day-to-day contact, known skeptic, with titles}
Implementation context: {technical environment, integrations planned, security/legal
  constraints agreed}
Timeline pressure: {go-live date and what breaks if it slips}
Risks: {anything that nearly killed the deal; competitor still lurking; single-threaded?}
Commercial notes: {renewal date, auto-renew terms, expansion hooks discussed}
```

Enforce it with a validation rule: the opportunity cannot reach closed-won until the doc fields are populated. CS acceptance includes confirming the doc is complete, which is the mechanism that keeps quality from decaying.

## Rejection Recycling Loops

Every rejected item follows a path determined by its reason code, with an owner per path:

| Reason code | Path | Owner | Re-eligibility |
|-------------|------|-------|----------------|
| `timing_not_now` | Nurture track, tagged with revisit quarter | Marketing | Re-MQL on new engagement after 90 days, or at revisit date |
| `no_response_after_sequence` | Lower-priority nurture | Marketing | New engagement resets; different channel next attempt |
| `bad_contact_right_account` | Account stays warm; find a better contact | SDR or outbound | Immediately, on new contact |
| `bad_fit_firmographic` | Disqualify person; review why scoring passed it | RevOps (model fix) | Not eligible |
| `data_quality` | Fix record, re-route | RevOps or ops | Immediately after fix |

Two loop rules: recycled items re-entering MQL get a `recycled_count` increment, and anything on its third trip goes to human review instead of the rotation, because the model and the market are disagreeing about it. Quarterly, RevOps reads the reason-code distribution and feeds it back into scoring weights (see lead-scoring) and stage definitions (see lifecycle-stages).

## Alignment Cadence and Silent-Failure Detection

**Meetings.** One working session per handoff pair, bi-weekly for the marketing-sales boundary, monthly for AE-CS, 30 minutes, data on screen. Standing agenda:

1. The four leak metrics versus last period (5 minutes)
2. Rejection reason distribution; top code gets a root-cause discussion (10 minutes)
3. Sample audit: walk 3 to 5 actual handed-off records end to end, including one rejection the sender disputes (10 minutes)
4. One process change agreed, with an owner and a check-in date (5 minutes)

Quarterly, a definitions review: do the entry criteria, SLA numbers, and reason codes still fit the motion.

**Detecting a silently broken handoff from data.** Signals that fire before any human complains:

- Worked-within-SLA rate drifting down 3 consecutive periods
- Acceptance rate jumping toward 100% while downstream conversion of accepted items falls (rubber-stamping)
- One reason code absorbing more than half of rejections (the picklist has become a dumping ground, or one upstream source broke)
- Time-to-first-action distribution going bimodal: some items instant, a growing lump never touched
- Handoff volume flat while the receiver's logged activity on handed-off items falls
- Closed-won handoff docs shrinking in completeness (spot-check field fill rates quarterly)

Put these on a RevOps-owned monitor, not on either team's dashboard, since neither side of a decaying handoff is motivated to surface it.

## Common Mistakes

- Handoffs that are notifications with no acceptance act and no return path
- Rejections allowed without a reason code, or with a 25-option picklist nobody reads
- SLAs published once and never measured
- Measuring acceptance rate but not worked-within-SLA rate, so untouched-but-unrejected items hide
- Closed-won handoff done as a calendar invite with no artifact, so CS re-discovers the deal from scratch
- Recycled leads dumped into general nurture with no reason-driven path or re-eligibility rule
- Alignment meetings that are grievance sessions because nobody brought the numbers
- Fixing the loudest handoff while the AE-to-CS one quietly manufactures churn

## Output Format

Deliver a handoff design document containing:

1. **Handoff inventory**: every team-to-team transition in the motion, volume, and current instrumentation state.
2. **Contract spec per handoff**: entry criteria, artifact definition, SLA table with escalation chain, accept/reject mechanics with the reason-code picklist.
3. **Closed-won handoff doc template**, adapted to this company's fields and motion.
4. **Leak measurement spec**: the four metrics per handoff, required timestamp fields to add, and dashboard definitions.
5. **Recycling map**: reason code to path to owner to re-eligibility, plus the recycled-count rule.
6. **Alignment operating rhythm**: meeting cadence, standing agenda, quarterly definition review, and the silent-failure monitor spec with its owner.
7. **Gaps and rollout order**: what to instrument first and which handoff to fix first, by revenue at stake.

## Related Skills

- **lifecycle-stages**: defines the stages and reason-code fields every handoff sits on
- **lead-routing**: the assignment and speed mechanics inside the MQL handoff
- **lead-scoring**: consumes rejection reasons as recalibration data
- **funnel-audit**: sizes which handoff leak costs the most revenue
- **renewals-expansion**: picks up where the AE-to-CS handoff ends
