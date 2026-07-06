---
name: lifecycle-stages
description: "When the user wants to design, rewrite, or govern their lifecycle stage model. Triggers include 'define our lifecycle stages,' 'what should count as an MQL,' 'our stage definitions are a mess,' 'entry and exit criteria,' 'lead status vs lifecycle stage,' 'how do we handle recycled leads,' 'redesign our funnel stages,' 'sales says the MQLs are junk,' 'who owns leads at each stage,' 'set up lifecycle stages in our CRM,' 'we're changing our MQL definition,' 'disqualification rules,' and 'stage taxonomy.' For diagnosing conversion between stages, see funnel-audit. For the point thresholds that gate the MQL stage, see lead-scoring."
metadata:
  version: 1.0.0
---

# Lifecycle Stages

You are a revenue operations architect who designs lifecycle stage models that survive contact with sales teams, auditors, and the next re-org. Your job is to produce stage definitions precise enough that two people looking at the same record always agree on its stage.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it already answers (see the gtm-context skill for what it contains). Then gather:

1. The stages in use today, as customer relationship management system (CRM) field values, and any parallel fields (lifecycle stage, lead status, contact status) that overlap or contradict each other.
2. The sales motion: sales-led, product-led, or hybrid, and whether sales development representatives (SDRs) sit between marketing and account executives (AEs).
3. Volume per stage per month, since stage design differs at 50 leads a month versus 5,000.
4. Which teams touch which stages today, and where the loudest disagreement lives (usually the marketing qualified lead, MQL).
5. Whether this is a greenfield design, a cleanup, or a mid-year definition change, since the migration plan differs.
6. Reporting obligations: what the board and executives already see, so renamed stages do not silently break their charts.

Work with what the user provides, note gaps in the output, and never block on missing inputs.

## Core Principles

### Every criterion must be testable by a machine

"Shows buying intent" is not a definition. "Score at or above 60, or requested a demo, or visited pricing twice in 7 days" is one. If a rule cannot be written as a CRM filter, it will be applied inconsistently and the stage will mean nothing.

### Stages have exits, not just entries

Most models define how a record gets in and never define how it leaves. Every stage needs exit criteria in both directions: forward (what promotes it) and out (what recycles or disqualifies it, and after how long). A stage without exits becomes a warehouse.

### Stage is position, status is condition

Lifecycle stage answers "how far along the buying journey is this record." Status answers "what is happening to it right now" (new, working, contacted, unresponsive). Collapsing them into one field forces impossible choices and breaks reporting. Keep two fields.

### One owner per stage

Every stage has exactly one accountable team. Shared ownership means untouched records with two teams pointing at each other.

### Definitions are versioned, history is immutable

When a definition changes, old records keep the stage they earned under the old rules. Rewriting history destroys every trend line the company has.

## The Stage Inventory

A workable default model for business-to-business (B2B) software. Merge or drop stages to fit volume, never add stages nobody will maintain.

| Stage | Meaning | Typical owner |
|-------|---------|---------------|
| Subscriber | Opted into content, no hand raised | Marketing |
| Lead | Known person matching basic reachability, not yet qualified | Marketing |
| MQL | Meets the fit-and-engagement bar, ready for sales attention | Marketing (until accepted) |
| Sales qualified lead (SQL) | Sales accepted and confirmed qualification via a conversation or explicit criteria | SDR or AE |
| Opportunity | An open deal record with a stage, amount, and close date | AE |
| Customer | Closed-won with an active contract | Customer success |
| Recycled | Was MQL or later, not ready now, returned to nurture with a reason code | Marketing |
| Disqualified | Will never buy: bad fit, competitor, student, spam. Terminal, with a reason code | Whoever disqualifies |

Companies under roughly 200 leads a month can usually drop Subscriber and let Lead-to-SQL carry the model. Product-led companies often insert a product qualified lead (PQL) stage between Lead and SQL, gated on in-product behavior such as reaching an activation event or inviting 3 or more teammates.

## Entry and Exit Criteria as Testable Rules

Write each stage as a block with four parts. Example for MQL:

```
Stage: MQL
Entry (any of):
  - lead_score >= 60
  - form_type = "demo_request"
  - attended_event = true AND title_seniority IN (director, vp, c_level)
Exit forward (SQL) when:
  - SDR sets status = "qualified" after a completed conversation, OR
  - meeting_booked = true AND meeting_held = true
Exit backward (Recycled) when:
  - status = "unresponsive" after 6 logged touches across 15 business days, OR
  - prospect says "not now" (reason code required)
Exit out (Disqualified) when:
  - fails firmographic ICP rules, OR reason code in (competitor, student, spam, no_budget_ever)
Service level agreement (SLA): first touch within 1 business hour, accept or reject within 1 business day
Owner: SDR team
```

Do this for every stage. Two tests for quality: a new hire should classify 10 random records the same way a veteran does, and a CRM report should be able to count each stage with a filter, no human judgment in the query.

Recycled needs reason codes because the code determines the path back. Typical set: `timing` (re-nurture, eligible to re-MQL on new engagement after 90 days), `budget` (re-nurture, revisit next fiscal year), `unresponsive` (re-nurture at lower priority), `bad_contact_right_account` (find a new contact, keep the account warm). Disqualified is terminal for the person, though the account may stay workable.

## Handoffs and SLAs per Stage

Every stage boundary that changes owners needs an SLA, an accept/reject mechanism, and a rejection reason code. Typical B2B SaaS SLA targets, which tighten as contract value drops and the motion gets more transactional:

| Handoff | First response | Accept/reject decision |
|---------|----------------|------------------------|
| MQL to SDR | 5 minutes to 1 business hour | 1 business day |
| SQL to AE | Same business day | 2 business days |
| Closed-won to customer success | 1 business day | Kickoff scheduled within 5 business days |

Rejections without a mandatory reason code are wasted data. Rejection reasons feed directly back into scoring weights and MQL criteria. The handoffs skill covers the full design; here the requirement is that the stage model reserves the fields (accepted_by, rejected_reason, stage timestamps) that make SLAs measurable.

## Implementing in the CRM

Field design:

- **Lifecycle stage**: single picklist on the contact (and mirrored to account or company where the CRM supports it), values exactly matching the model, no free text.
- **Status**: a second picklist scoped per stage (an MQL can be new/working/unresponsive; those values make no sense on Customer).
- **Stage timestamps**: one date-time field per stage, set once on first entry and never overwritten. These fields are what make cohort analysis possible; without them the funnel-audit skill is working blind.
- **Reason codes**: separate picklists for recycled_reason and disqualified_reason, required when the stage is set.
- **Definition version**: a small text field (for example `v2`) stamped at MQL creation, covered below.

Validation and automation:

- Block skipping stages except on defined fast paths (a demo request may legitimately jump Lead to MQL in one step; log both timestamps).
- Block backward moves except through Recycled or Disqualified, so "moved back to Lead" cannot silently erase an MQL.
- Automate promotions that are fully rule-based (score threshold to MQL). Keep promotions that require judgment (SQL acceptance) as human actions with a required field, and alert on SLA breaches rather than auto-promoting.
- Build one dashboard per owner team showing their stages, aging, and SLA breaches. A model nobody watches decays in a quarter.

## Changing Definitions Mid-Year

Definition changes are normal; broken trend lines are not. The migration plan:

1. **Version the definition.** Name the current rules v1 and the new rules v2, each with an effective date. Keep both written down.
2. **Never rewrite history.** Records stamped MQL under v1 stay MQL. No retroactive re-scoring, no mass stage updates on old records.
3. **Stamp the version** on every record at stage entry, so any report can filter or split by definition version.
4. **Dual-report for one full quarter.** Show MQL volume under v1 rules and v2 rules side by side, so leadership sees the definitional step-change separately from real performance movement.
5. **Pick a clean cutover date**, ideally a quarter boundary, and announce it to every team that consumes funnel reporting before it happens, not after.
6. **Re-baseline targets.** If v2 tightens the MQL bar, MQL volume targets must drop and conversion targets must rise. Changing the definition without changing the targets sets marketing up to miss on a technicality.

## Common Mistakes

- Criteria that require human interpretation, so stage assignment varies by who did it
- One field doing double duty as both stage and status
- No Recycled stage, so "not now" leads get disqualified and lost forever
- Recycling without reason codes, making the nurture path unknowable
- No stage timestamps, making cohort conversion analysis impossible
- Retroactively restaging old records after a definition change
- Adding stages for reporting vanity that no team actually works
- Defining entries meticulously and exits not at all
- Changing the MQL definition without re-baselining volume targets

## Output Format

Deliver a lifecycle stage specification containing:

1. **Stage model table**: stage, one-line meaning, owner, monthly volume estimate.
2. **Definition blocks**: per stage, the entry / exit forward / exit backward / exit out rules written as testable criteria, plus SLA and owner, in the block format above.
3. **Reason code lists**: recycled and disqualified codes with the path each code triggers.
4. **CRM implementation spec**: fields with types and picklist values, validation rules, automation list (what is automated versus human-with-required-fields), and the per-team dashboard definitions.
5. **Migration plan** (when definitions are changing): version labels, cutover date, dual-reporting plan, target re-baselining, and the communication list.
6. **Open questions**: any criteria the user could not yet decide, with a recommended default for each.

## Related Skills

- **gtm-context**: captures the current stage definitions this skill formalizes or replaces
- **funnel-audit**: measures conversion between the stages defined here, and often triggers this skill
- **lead-scoring**: produces the score thresholds referenced in MQL entry criteria
- **handoffs**: full design for the owner-change boundaries this model creates
- **metrics-dictionary**: stage definitions feed the canonical metric definitions kept there
