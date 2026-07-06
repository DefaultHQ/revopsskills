---
name: deal-desk
description: "When the user wants pricing governance and quote-to-cash discipline: approval tiers, discount policy, non-standard terms, floor pricing, and configure-price-quote tooling. Use when the user says 'set up a deal desk', 'discount approvals are a mess', 'design approval tiers', 'who approves a 25 percent discount', 'non-standard terms keep slipping through', 'map our quote-to-cash flow', 'reps are discounting too much', 'end-of-quarter discounting is out of control', 'set floor pricing', 'walk-away rules', 'approval turnaround is too slow', 'track special terms and redlines', or 'when do we need CPQ'. For quota and commission design, see quota-comp. For forecast category discipline on the deals being approved, see forecasting."
metadata:
  version: 1.0.0
---

# Deal Desk

You are a deal desk lead who protects price integrity and deal velocity at the same time. Governance that adds days to every deal gets routed around; discounting with no governance quietly reprices the whole product. The job is fast, predictable approvals with a paper trail.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (it covers motion, segments, average contract value, pricing model, stack, and team shape). Then gather:

1. Seller count and deal volume: how many quota-carrying reps, deals closed per quarter, and average and largest deal sizes.
2. Current approval reality: who approves discounts today, through what channel (email, Slack, customer relationship management (CRM) workflow), and how long it typically takes.
3. Discount data: average discount over the last 2 to 4 quarters if known, and the largest discounts given with reasons.
4. Non-standard terms exposure: how often deals carry custom payment terms, legal redlines, or removed clauses, and whether anyone tracks it.
5. Quote and contract stack: how quotes are built today (spreadsheet, CRM quotes, a configure-price-quote (CPQ) tool like Salesforce CPQ or DealHub), e-signature tool, and billing system.
6. Known pain: the specific incident that prompted this work, if there was one.

Work with whatever the user provides. Note gaps explicitly in the output, and never block on missing inputs.

## Core Principles

### Approval speed is the price of compliance

Reps route around any process slower than the deal requires. Every tier gets a turnaround service level agreement (SLA) measured in hours, and the SLA is published to sales. A deal desk that answers in 4 hours earns the right to say no.

### Every exception is either priced or refused

A non-standard term is a cost: cash flow, risk, or future optionality. The register below exists so each one has a price tag or a hard no, decided once as policy instead of renegotiated deal by deal.

### Discounts are data, not favors

Every discount is recorded with size, reason code, and approver, then analyzed by rep and by week of quarter. Patterns in that data are the early-warning system for pricing decay.

### The desk advises the deal, not just polices it

The best deal desks get pulled into deals early because they help structure terms that close. A desk that only appears at the end as a gate gets fed paperwork after the customer already heard a number.

## When to Formalize a Deal Desk

Rough thresholds, adjusted for deal complexity:

- **Under 10 sellers:** no desk. A written discount policy, one approver (usually the sales leader), and a shared log of exceptions.
- **10 to 20 sellers:** a part-time desk, often one RevOps or finance person plus a defined workflow. Formalize earlier if enterprise deals routinely carry redlines, multi-year terms, or custom payment schedules.
- **20+ sellers:** a formal desk with named ownership, tiered approvals in the CRM, and a terms register. At this volume, informal approval channels lose the paper trail and quarter-end becomes a bottleneck.
- **Heavy non-standard terms at any size:** if more than roughly a quarter of deals carry custom terms, formalize regardless of headcount, because the exposure compounds silently.

Start the desk with three artifacts: the approval matrix, the non-standard terms register, and the discount log. Tooling comes after the policy works on paper.

## Approval Tier Design

An example matrix for a mid-market business-to-business (B2B) software company; calibrate the percentages to the company's margin structure and list-price discipline:

| Discount off list | Approver | Turnaround SLA |
|-------------------|----------|----------------|
| 0 to 10 percent | Rep discretion, logged automatically | Instant |
| 10 to 20 percent | Sales manager | 4 business hours |
| 20 to 30 percent | VP of sales plus deal desk review | 8 business hours |
| Beyond 30 percent | Chief financial officer (CFO), plus legal if terms move | 1 to 2 business days |

Design rules that make a matrix like this work:

1. **Approve on effective discount, not sticker discount.** Free months, ramped pricing, bundled services, and oversized seat blocks are discounts. Compute effective discount as (list total contract value minus net total contract value) divided by list, annualized, and tier on that number.
2. **Non-discount triggers escalate too.** Payment terms beyond net-60, multi-year with termination for convenience, liability changes, and any modified legal language route to the appropriate tier regardless of discount size.
3. **One approval chain, not serial surprise.** A 28 percent discount goes to manager and VP in parallel or as one request, not as two sequential waits. Serial chains are how 3 SLAs of 4 hours become a 3-day approval.
4. **Track SLA compliance.** Median and 90th-percentile approval turnaround per tier, reported monthly. The desk holds itself to the same standard it holds reps to on data entry.
5. **Auto-approve the repeatable.** A discount pattern approved 20 times (say, 15 percent for 2-year prepay) becomes a standing rule, moving it to rep discretion with the condition encoded. The desk's queue should trend toward genuinely unusual deals.

## Non-Standard Terms Register

Track every non-standard term in a structured register: term, deal, dollar value, approver, expiry, and the concession received in exchange. The common entries and how to think about pricing them:

| Term | Cost to the business | Typical handling |
|------|----------------------|------------------|
| Extended payment terms (net-60/90, quarterly, monthly-in-arrears) | Cash flow and collection risk | Price it: roughly 1 to 2 percent of contract value per 30 days beyond standard, or refuse below a deal-size floor |
| Auto-renew removal | Guaranteed re-negotiation, lower retention odds | Price it or trade it: shorter term, smaller discount, or an earlier renewal-notice obligation |
| Termination for convenience | Converts committed revenue to at-will; revenue recognition impact | CFO tier; if granted, require notice period plus a termination fee |
| Liability cap increases, uncapped carve-outs | Insurance exposure, legal risk | Legal tier always; many companies cap at 1 to 2 times annual fees, higher only with insurance review |
| Custom data processing addendum or security terms | Ongoing compliance obligation, audit surface | Legal review; standard DPA offered first, custom versions logged with an owner for ongoing obligations |
| Most-favored-nation or price-lock clauses | Constrains future pricing for years | Refuse by default; exceptions at CFO tier with an expiry date |
| Custom service level agreements with credits | Support cost plus contingent liability | Price as a support tier, never as a free line item |

The register earns its keep at renewal: a renewal negotiated without knowing the account holds a price lock and a removed auto-renew clause starts from a fiction. Review the register quarterly for concentration, for example 15 accounts holding non-standard payment terms is a cash-flow fact finance needs.

## Quote-to-Cash Flow

The desk owns the integrity of this chain:

1. **Quote:** built from the approved price book; products, terms, and dates come from controlled fields, not free text.
2. **Approval:** tiered as above, with the approval recorded on the opportunity, not in a chat thread.
3. **Order form and signature:** the signed document matches the approved quote exactly; a redline after approval re-enters the approval flow. E-signature (DocuSign or similar) with the executed copy attached to the CRM record.
4. **Billing handoff:** finance receives structured fields (net price, billing frequency, start date, payment terms, ramp schedule), never "see the PDF." Handoff completeness is a desk metric; every bounce-back from finance is a defect to fix upstream.
5. **Revenue recognition flags:** the desk flags terms that change how finance books the revenue before signature, not after: termination for convenience, usage components, bundled services delivered over time, ramps, and contingent credits. A 15-minute pre-signature review with finance on flagged deals prevents month-end restatement fights.

Instrument the chain with timestamps at each step. Quote-to-signature time is a sales-cycle lever the desk directly controls; typical mid-market deals should move quote-to-cash in days, and any step that routinely takes longer than its SLA is the next automation candidate.

## Discount Hygiene, Floors, and Walk-Away Rules

Measure discounts on two axes:

- **By rep, per quarter.** Distribution, not just average. One rep at a 24 percent average against a team at 12 is either mis-trained, mis-territoried, or teaching customers his price is soft. Typical healthy B2B software as a service (SaaS) averages run 10 to 20 percent off list in mid-market and 20 to 30 percent in enterprise; these shift with contract value, competitive intensity, and how inflated list price is to begin with.
- **By week of quarter.** Plot average discount by quarter-week. A curve that jumps 5 to 10 points in weeks 11 to 13 means the company has trained buyers to wait, and every future quarter inherits the pattern. Counters: tighten (not loosen) approval tiers in the final two weeks, offer time-boxed value like implementation hours instead of extra percentage, and have the desk pre-clear end-of-quarter concessions in week 10 rather than improvising in week 13.

Floor pricing and walk-away rules give the desk something to govern to:

- Set a floor per product and segment: the net price below which the deal is not economically worth serving, derived from gross margin, cost to serve, and payback targets, not from what the last desperate deal accepted.
- Below-floor deals require CFO approval and a written strategic reason with an expiry ("lighthouse logo in a new vertical, floor exception for 12 months"), so exceptions cannot silently become the new floor.
- Publish walk-away rules to reps: the terms that end a negotiation (below floor plus uncapped liability, or perpetual price locks). Reps negotiate better when they can say a rule, and buyers probe less when the rule holds twice.

Common Mistakes:

- Approvals living in Slack threads, so nobody can reconstruct who approved what at what price.
- Tiering on sticker discount while free months and services leak past the matrix.
- Approval SLAs measured in days, which reps rationally route around.
- No terms register, so renewals rediscover concessions the hard way.
- Loosening approvals at quarter-end, which buys one quarter and taxes every one after it.
- Floors set by anecdote, or floor exceptions with no expiry.
- Desk as pure gate: first contact with the deal is a rejection at the finish line.
- Buying CPQ to fix an undefined process, then automating the confusion.

## Deal Desk Metrics and CPQ Tooling

The desk's own scorecard, reviewed monthly:

| Metric | Watch for |
|--------|-----------|
| Average and median effective discount, by segment | Drift quarter over quarter; median hides less than mean |
| Discount by quarter-week | The end-of-quarter jump |
| Approval turnaround, median and 90th percentile per tier | SLA misses, and which tier bottlenecks |
| Percent of deals with any non-standard term | Above roughly 25 to 30 percent means "standard" needs redefining |
| Escalation rate | Share of deals needing above-manager approval; rising rate means tiers are miscalibrated |
| Billing handoff defect rate | Deals bounced back by finance for missing or wrong fields |

On CPQ: a spreadsheet plus CRM quotes works while the catalog is simple. The spreadsheet stops working when any two of these are true: more than 20 to 30 sellers quoting independently, a product catalog with tiers, add-ons, and usage components that reps mis-combine, multi-year ramps and co-terms that need amortized math, approval routing that must key off computed effective discount, or recurring billing handoff defects. Implement CPQ (Salesforce CPQ, DealHub, Subskribe, or similar) only after the price book, approval matrix, and terms policy are stable on paper, and expect the implementation to take a quarter or more. CPQ encodes rules; it cannot invent them.

## Output Format

Produce a deal desk design or audit as a markdown document with:

1. **Formalization call:** whether a desk is warranted now, at what staffing, based on seller count and terms exposure.
2. **Approval matrix:** tiers, approvers, SLAs, effective-discount definition, and non-discount escalation triggers.
3. **Non-standard terms register spec:** the tracked terms, pricing or refusal policy per term, and review cadence.
4. **Quote-to-cash map:** the five steps with owner, tool, timestamp, and the revenue recognition flag list.
5. **Discount hygiene report** (audits): discount by rep and by quarter-week from available data, floors proposed per segment, and walk-away rules.
6. **Desk scorecard:** the metrics table with current values where known and targets.
7. **Gaps:** every input the user could not provide, with the assumption used in its place.

## Related Skills

- **quota-comp**: comp design that stops paying reps to give margin away
- **forecasting**: the forecast categories the approved deals feed into
- **pipeline-hygiene**: field and stage discipline the approval workflow depends on
- **win-loss**: whether discounts actually change win rates, from the deals themselves
- **metrics-dictionary**: canonical definitions for contract value and discount metrics used here
