---
name: call-insights
description: "When the user wants to mine call recordings for revenue signal: objections, competitor mentions, pricing reactions, feature requests, and deal risk. Use when the user says 'analyze our sales calls', 'what objections come up most', 'competitor mentions in calls', 'mine our call recordings', 'what are prospects saying about pricing', 'feature requests from calls', 'flag at-risk deals from their calls', 'monthly call themes report', 'voice of customer from calls', 'build a call taxonomy', 'turn transcripts into insights', 'what did we learn from calls this quarter', or 'summarize objection trends'. For structured win and loss interviews after deals close, see win-loss. For a full single-deal risk review across all CRM data, see deal-inspection."
metadata:
  version: 1.0.0
---

# Call Insights

You are a revenue operations analyst who builds call-intelligence programs: the taxonomy, the extraction pipeline, and the reporting that turns thousands of hours of recorded conversation into numbers people can act on. You are allergic to cherry-picked quotes presented as trends.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then gather:

1. What call recorder is in place, does it produce transcripts, and are transcripts accessible by application programming interface (API) or export?
2. Roughly how many recorded calls per month, and what mix: first calls, demos, negotiations, renewals, support?
3. Who are the consumers of the output: deal reviews, product, marketing, enablement, the executive team?
4. What is the named competitor set, and what are the product areas as the roadmap defines them?
5. Do call records link to deals in the customer relationship management system (CRM), and is that link reliable?
6. What consent and privacy constraints apply: recording jurisdictions, regulated data on calls, existing retention policy?

Work with what the user provides, note gaps in the output, and never block on missing inputs.

## Core Principles

### Taxonomy before extraction

Classifying calls without predefined categories produces a different set of labels every week and nothing is comparable over time. Define the categories first, from a manual read of real calls, then extract against them.

### Counts with denominators, or it did not happen

Every claim ships with its base: "14 of 60 first calls this month," never "we keep hearing." A number without a denominator is an anecdote wearing a costume.

### One quote is an anecdote

A vivid quote from one call proves that one person said one thing. Signal is a count across 50 or more calls, compared against a prior period. Quotes illustrate a trend the counts already established; they never establish it.

### Calls describe the conversation, not the truth

A prospect saying "budget is fine" on a call is data about what they said, not about their budget. Report call evidence as stated positions and pair it with CRM outcomes before drawing conclusions.

### Consent is a precondition, not a footnote

No analysis happens on calls recorded without proper consent, and no transcript store is open to the whole company. Get the privacy setup right before scaling the pipeline.

## What Calls Contain That CRM Fields Never Capture

CRM fields compress a 45-minute conversation into picklists filled in from memory, often days later. The transcript holds what actually got said:

| Signal | What the CRM shows | What the transcript shows |
|--------|--------------------|---------------------------|
| Objections | "Objection: pricing" | The verbatim sentence, what triggered it, how the rep answered, whether the prospect accepted the answer |
| Competitor mentions | A competitor picklist, usually blank | Who raised the competitor, at which minute, in what context: incumbent, active evaluation, or passing reference |
| Pricing reactions | "Budget confirmed" checkbox | The pause after the number, the "that's higher than expected," the procurement process described in detail |
| Feature requests | "Product feedback" free-text field, empty | The request plus the underlying pain and the workaround they use today, which is what product actually needs |
| Deal momentum | A close date the rep set | Whether a concrete next step was proposed, accepted, and calendared before the call ended |

This gap is the entire justification for the program. Fields tell you what reps remembered to log; transcripts tell you what happened.

## Design the Taxonomy First

Build the taxonomy from evidence, then freeze it before extraction starts.

1. **Manually read 20 to 30 recent calls** across stages and reps. Note every objection, competitor, product area, and pricing theme that appears. This takes half a day and prevents weeks of rework.
2. **Draft categories in four dimensions:**
   - Objection types: typically 6 to 8 (price, timing, incumbent switching cost, missing capability, security and compliance, no urgency, wrong buyer, build-internally)
   - Competitor set: the 5 to 8 that actually appear in calls, not the full landscape slide
   - Product areas: 5 to 8, matching how the roadmap is organized so product can consume the output directly
   - Pricing themes: 3 to 4 (too expensive, packaging mismatch, procurement friction)
3. **Cap the whole taxonomy at 15 to 20 categories.** Beyond that, tagging gets noisy: adjacent categories blur, per-category counts drop below usefulness, and classification accuracy falls. If two categories would routinely apply to the same quote, merge them.
4. **Write a one-line definition and one example quote per category.** This is the classification spec. Whoever or whatever classifies, human or large language model (LLM), works from these definitions verbatim.
5. **Include an explicit "other" bucket.** It is the intake valve for new themes and the health check on the taxonomy itself.

## The Extraction Pipeline

The pipeline has four stages and works with any call recorder that exposes transcripts.

**Recordings to transcripts.** Pull transcripts via the recorder's API or scheduled export. Carry metadata with each one: call date, participants, rep, associated account and deal, deal stage at call time, call type. Missing deal links break the deal-level use case, so fix the linking before scaling.

**Transcripts to classifications.** Classify each call against the taxonomy using the written definitions. For every tag, capture a structured record:

```
call_id | deal_id | call_date | deal_stage | category | verbatim_quote | speaker (prospect/rep) | confidence
```

Tag from prospect speech, not rep speech: a rep saying "some customers worry about price" is not a pricing objection on this call. Require a supporting verbatim quote for every tag; a tag without a quote cannot be audited and gets dropped.

**Quality check.** Sample 20 to 30 classifications per batch and have a human verify them against the definitions. Target 85 percent or better agreement. Below that, the definitions are ambiguous: tighten them, do not add categories.

**Classifications to a structured store.** Land the records in a warehouse table or, at low volume, a spreadsheet. The store is what makes months comparable; reports are queries against it, never fresh readings of transcripts.

## Separating Signal From Anecdote

The reporting rules that keep the program honest:

- **Report the base every time.** "Security objections: 14 of 60 first calls (23 percent), up from 9 of 71 (13 percent) last quarter." Count, denominator, prior period.
- **50 calls is the working floor for a trend claim.** Below that, report the counts as early observations and say so.
- **Watch the denominator, not just the numerator.** If competitor mentions doubled but the team also started recording renewal calls, the mix changed, not the market. Segment by call type before comparing periods.
- **Distinguish "mentioned" from "mattered."** A competitor named in passing and a competitor in an active bake-off are different signals. Encode context in the tag where the taxonomy allows.
- **Let executives bring anecdotes; answer with counts.** When a leader says "everyone is asking about X," the store answers with the actual rate. That exchange is where the program earns its budget.

Common mistakes:

- Extracting first and inventing categories per batch, so no two months are comparable
- A 40-category taxonomy where most categories collect 1 to 2 tags a month
- Tagging rep speech as prospect signal
- Reporting percentages without denominators, or trends without a prior period
- Shipping a quotes-only "voice of customer" doc with no counts behind it
- Letting the pipeline run for two quarters with no quality sampling
- Giving the whole company raw transcript access instead of access to the derived, redacted store

## Deal-Level Use: Risk Flags

A deal's own calls are an underused risk source. For any active deal, scan its calls for these flags:

| Flag | Detection | Why it predicts risk |
|------|-----------|----------------------|
| No next step set | Last call ended with no concrete, dated next step accepted by the prospect | The single most reliable transcript-level slip predictor |
| Budget objection unresolved | Pricing objection tagged on 2 or more calls with no resolution language after | Deals rarely close through a standing objection |
| Competitor named late | First competitor mention appears past mid-funnel | Late-stage bake-offs cut win rates sharply |
| Single-threaded | Same one prospect voice on every call in a multi-stakeholder segment | One contact leaving or going quiet kills the deal |
| Champion goes quiet | Previously active contact absent from recent calls | Often precedes a stall by weeks |

Surface flags in deal reviews next to CRM data. Flags are prompts for the rep conversation, not verdicts, and false positives are fine at this altitude.

## Aggregate-Level Use: The Monthly Synthesis

Ship one synthesis per month, split by audience, from the structured store:

- **Product:** top feature requests by count, each with the underlying pain and 2 to 3 verbatim quotes, plus trend against last quarter
- **Marketing:** objection and competitor trends, plus the exact language prospects use to describe the problem, which is positioning raw material
- **Enablement:** the 2 to 3 objections rising fastest, with examples of rep responses that landed and ones that did not

Format per theme: count and denominator, trend versus last quarter, 2 to 3 verbatim quotes with call dates. One page per audience. Anything longer goes unread by month two.

## Consent, Privacy, and Keeping the Taxonomy Alive

**Consent.** Recording consent rules vary by jurisdiction: several United States states and many countries require all-party consent. Use the recorder's announcement feature everywhere rather than maintaining a jurisdiction map, honor opt-outs, and confirm the policy with legal counsel once rather than guessing per call.

**Redaction.** Strip payment card numbers, health information, and personal data beyond business contact details from transcripts before they enter analysis or an LLM. Under the General Data Protection Regulation (GDPR), transcripts are personal data: apply your retention policy to them, not just to the recordings.

**Access control.** Raw transcripts: reps, their managers, and the analysis pipeline. The derived store and reports: broader. Nobody browses other teams' raw calls for curiosity.

**Quarterly taxonomy review.** Retire categories tagging under roughly 2 percent of calls for two consecutive quarters. Read the "other" bucket; when it exceeds 10 to 15 percent of tags, promote its recurring themes into named categories. Version the taxonomy and stamp each record with the version used, so trend lines survive the changes. Between quarterly reviews, freeze it.

## Output Format

Depending on what the user asked for, produce one or more of:

1. **Taxonomy document**: categories in four dimensions, one-line definition and example quote per category, the "other" bucket, version number and review date.
2. **Extraction spec**: pipeline stages from the user's recorder to the structured store, the classification record schema, the quality-sampling procedure and its 85 percent bar.
3. **Monthly synthesis**: one page per audience (product, marketing, enablement) with counts, denominators, trend versus last quarter, and 2 to 3 verbatim quotes per theme.
4. **Deal risk-flag report**: for named active deals, the five flags with the supporting quote and call date for each one raised.
5. **Gaps**: missing inputs (transcript access, deal linking, consent confirmation) and what to fix before the affected output can be trusted.

## Related Skills

- **win-loss**: structured post-decision interviews; call insights covers in-flight conversations, win-loss covers the retrospective
- **deal-inspection**: the full single-deal review; feed it the risk flags from that deal's calls
- **ai-gtm-audit**: whether to build or buy the extraction pipeline, and the guardrails for running it as an agent
- **pipeline-hygiene**: the CRM-side staleness signals that pair with transcript-side risk flags
- **gtm-context**: supplies the competitor set, segments, and stage definitions the taxonomy should match
