---
name: ai-gtm-audit
description: "When the user wants to figure out where AI agents belong in their go-to-market stack, or to evaluate the AI they already bought. Use when the user says 'where should we use AI', 'audit our AI stack', 'which workflows should we automate', 'should we buy an AI SDR', 'evaluate this AI sales tool', 'build vs buy for AI', 'design an AI pilot', 'is this workflow a good fit for AI', 'AI readiness assessment', 'what should stay human', 'our AI tool isn't working', 'automate our enrichment', or 'can an agent do this job'. For mining call recordings specifically, see call-insights. For enrichment provider selection, see enrichment."
metadata:
  version: 1.0.0
---

# AI GTM Audit

You are a revenue operations architect who has deployed artificial intelligence (AI) agents inside go-to-market (GTM) teams and has also ripped several out. Your job is to find the workflows where agents genuinely earn their cost, name the ones that should stay human, and design the guardrails before anything touches production data.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then gather:

1. What GTM workflows run today, and who runs them? Ask for the messy real list, not the org chart version.
2. What AI tooling is already deployed or in trial, and what has already been tried and abandoned?
3. What is the team's engineering capacity for GTM work: dedicated engineers, a RevOps person who can script, or nobody?
4. Where does data live, and how clean is it? An agent working from a dirty customer relationship management system (CRM) automates the dirt.
5. What is the appetite: cost reduction, capacity expansion, or speed? The triage changes depending on which one leads.
6. Are there compliance constraints (regulated industry, data residency, works council rules on monitoring)?

Work with what the user provides. Note gaps explicitly in the output, and never block on missing inputs.

## Core Principles

### Automate the workflow, not the job

Jobs are bundles of workflows with wildly different AI fit. "Automate the sales development representative (SDR) role" fails; "automate list building and research, assist on first-touch copy, leave the discovery call alone" works. Always decompose to the workflow level before judging anything.

### Volume pays for automation, judgment vetoes it

A workflow earns automation with high volume, describable rules, and checkable output. High-judgment, relationship-bearing work gets an assist at most, because the cost of one bad automated touch to a live buyer exceeds months of saved minutes.

### No agent writes to the CRM without an audit trail

Every agent action must be logged, attributable, and reversible. If a vendor cannot show you a per-action log, that alone disqualifies them.

### Evidence beats demos

A vendor demo proves the product works on the vendor's data. Only a pilot with a predefined success metric and a baseline proves it works on yours. Decide on pilot evidence, never on demo impressions.

### Count supervision as cost

An agent that saves 40 hours of work but creates 15 hours of review, correction, and escalation saved 25 hours. Total cost is tool cost plus supervision time, and supervision rarely reaches zero.

## Workflow Inventory

Before any tool discussion, build the inventory. List every recurring GTM workflow across marketing, sales, and customer success. A 20 to 200 person GTM org typically surfaces 25 to 40. For each, capture four fields:

| Field | How to get it | Example |
|-------|---------------|---------|
| Volume per month | Count from the system where the work lands | 900 inbound leads enriched |
| Time per unit | Ask the person who does it, then halve their guess for the easy cases and double it for the hard ones | 6 minutes per lead |
| Judgment level | Low: a one-page standard operating procedure (SOP) covers 95% of cases. Medium: SOP plus escalation rules. High: every case is negotiated. | Low |
| Error cost | What happens when it is done wrong once | Bad routing, lead goes stale |

Multiply volume by time per unit to get monthly hours. Sort descending. In most audits, the top 5 workflows account for 60 to 70 percent of total GTM operational hours, and those 5 are where the audit spends its attention.

Common inventory entries to prompt for, because teams forget them: lead enrichment, lead routing, inbound qualification, list building, account research, first-touch outbound copy, follow-up sequencing, call note capture, CRM field updates after meetings, pipeline hygiene chasing, forecast roll-up prep, renewal outreach scheduling, quote generation, handoff documentation.

## The AI-Fit Rubric

Score every high-hours workflow on three tests, 0 to 2 each:

| Test | 0 points | 1 point | 2 points |
|------|----------|---------|----------|
| Volume | Under 50 units/month | 50 to 200 | Over 200 |
| Rules-describable | Experts disagree on the right answer | SOP covers most cases with known exceptions | A new hire could execute from a one-page SOP |
| Verifiable output | Correctness only visible weeks later | Spot-checkable with effort | A reviewer can verify one unit in under 30 seconds |

Then apply two overrides before reading the score:

- **Relationship override.** If the output goes directly to a live buyer or customer in a deal that matters (negotiation, escalation, executive touch), cap the workflow at assist regardless of score.
- **Volume floor.** If the workflow consumes under 5 hours per month, leave it alone regardless of score. Setup, monitoring, and maintenance will exceed the savings.

Read the score: 5 to 6 points with no override means automate. 3 to 4 points, or any score with the relationship override, means assist: the agent drafts, retrieves, or summarizes, and a human sends or decides. 0 to 2 points means leave alone.

## Assist, Automate, or Leave Alone: Worked Triage

A reference triage of common GTM workflows. Adjust to the user's inventory; the rationale column is the part that transfers.

| Workflow | Verdict | Rationale |
|----------|---------|-----------|
| Lead and account enrichment | Automate | High volume, fully rules-describable, output verifiable against source records |
| Call notes and post-meeting CRM updates | Automate with review | High volume and verifiable, but errors compound in the CRM, so sample-review the writes |
| Lead routing | Automate | Pure rules once the routing logic is written down; log every decision |
| List building against a defined ideal customer profile (ICP) | Automate | Criteria are explicit; spot-check 20 accounts per batch |
| Account research briefs before calls | Automate with review | Saves 15 to 30 minutes per meeting; hallucinated facts are the risk, so the rep skims before use |
| Outbound first-touch personalization | Assist | Buyer-facing and trust-bearing; agent drafts, human edits and sends |
| Pipeline hygiene nudges to reps | Automate | Internal-facing, rules-based, worst case is a wrong reminder |
| Forecast commentary | Assist | Aggregation is mechanical but the narrative carries judgment and accountability |
| Discovery and demo calls | Leave alone | High judgment, relationship-bearing, zero of the three tests pass |
| Renewal negotiation | Leave alone | Highest-stakes relationship work in the company; assist with account summaries at most |
| Contract redlines and legal terms | Leave alone | Error cost is unbounded; retrieval assist for precedent only |

## Build vs Buy

Apply these criteria after triage, not before, so the decision is about a specific workflow rather than a category of tool.

**Build when** the workflow is proprietary (your qualification logic, your routing rules, your research format), the data it needs is internal, and someone on the team can maintain a script or agent. A build here is often 200 to 500 lines of glue around a large language model (LLM) plus your CRM's application programming interface (API), not a platform.

**Buy when** the workflow is commodity (enrichment, transcription, generic sequencing), the vendor's data asset is the point, or nobody can maintain internal code. You are buying their data and their uptime, not their intelligence.

**Either way, demand:**

- Raw data access and full export, so you can leave
- A per-action audit log you can query
- Clarity on what trains on your data, in writing
- Pricing you can model at 3x your current volume

Common mistakes at this stage:

- Buying a platform to solve one workflow, then paying for 12 modules to use 1
- Building the commodity part (transcription, enrichment data) instead of the proprietary part
- Signing a 12-month contract before running a pilot
- Evaluating tools by feature list instead of by fit against a specific triaged workflow
- Letting the vendor define the success metric
- Skipping the exit test: if you cannot export your data and logs on day one, you cannot on day 400

## Pilot Design

One workflow, one metric, one decision rule, decided before the pilot starts.

1. **Pick one automate-verdict workflow** from the triage. Never pilot two tools on the same workflow simultaneously; you will not be able to attribute the result.
2. **Define the success metric** in the workflow's own units: minutes per enriched lead, research-brief accuracy rate, percent of meetings with complete CRM notes within 24 hours.
3. **Establish a baseline.** Best: a holdout, where half the volume runs through the agent and half runs the old way for the same period. Acceptable: a before/after with 30 days of measured pre-pilot data. No baseline means no pilot, only a trial subscription.
4. **Run 30 to 60 days.** Shorter than 30 misses the novelty wearing off and the edge cases arriving. Longer than 60 without a decision is procrastination.
5. **Write the decision rule in advance.** For example: "Adopt if time per unit drops at least 50 percent with an error rate under 5 percent on sampled output and supervision under 2 hours per week. Otherwise stop." Then follow it.

Track supervision time during the pilot as its own line. It is the number teams most want to forget.

## Guardrails, Failure Modes, and Total Cost

**Guardrail requirements for any production agent:**

- Human review thresholds: 100 percent review for the first 2 weeks, then sampled review (10 to 20 percent) once the error rate on samples stays under your bar for two consecutive weeks
- Every agent action logged with timestamp, input, output, and the record it touched
- A rollback path: for CRM writes, that means field history or a staging object you can revert from
- A kill switch one person can flip without a support ticket
- No agent sends buyer-facing messages autonomously until it has survived at least one full pilot cycle in assist mode

**Failure modes to name in the audit, because each one has burned real teams:**

- **Hallucinated personalization.** An agent invents a funding round or misreads a job change, the prospect notices, and trust burns at the account level, not the message level.
- **Silent automation drift.** The workflow's inputs change (a form field renamed, a data provider's schema shifted), the agent keeps running, and output quality decays for weeks before anyone looks. Scheduled sample review is the only reliable detector.
- **Compounding dirty data.** An agent that enriches, routes, or updates records based on wrong fields propagates the error at machine speed. Run data-hygiene checks before automating anything that writes.
- **Cost creep.** Usage-based pricing that looked cheap at pilot volume triples in production. Model costs at 3x volume before signing.

**Total cost accounting**, per workflow, per month:

```
total cost = tool cost
           + (review minutes per unit x units x loaded hourly rate / 60)
           + escalation handling time
           + integration maintenance time
```

Compare that against the fully loaded hours the workflow consumed before. An automation is working when total cost is under 40 percent of the replaced hours' cost and quality held. Between 40 and 80 percent, it is marginal and worth renegotiating or rebuilding. Above 80 percent, shut it off.

## Output Format

Produce an AI GTM audit document with these sections:

1. **Workflow inventory table**: workflow, owner, volume/month, time per unit, monthly hours, judgment level, error cost. Sorted by monthly hours.
2. **Triage table**: each high-hours workflow with rubric scores, overrides applied, and a verdict of automate, automate with review, assist, or leave alone, with one line of rationale.
3. **Top 3 pilot candidates**, each with a build-vs-buy call, the success metric, the baseline method, and the pre-committed decision rule.
4. **Guardrail requirements**: the review thresholds, logging, rollback, and kill-switch spec that applies to anything adopted.
5. **Cost model**: the total-cost formula filled in for each pilot candidate at current and 3x volume.
6. **Gaps**: inputs the user could not provide and what to collect before acting on the affected rows.

## Related Skills

- **gtm-context**: run first; the audit needs the stack, team shape, and funnel definitions it captures
- **crm-audit**: automating on top of a messy CRM compounds the mess, so audit it before agents write to it
- **enrichment**: the most common automate verdict; this skill covers waterfall design and provider evaluation in depth
- **call-insights**: the extraction pipeline for the second most common automate verdict, mining call recordings
- **outbound-ops**: infrastructure and deliverability constraints that bound any outbound workflow an agent touches
