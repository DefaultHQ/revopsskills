---
name: attribution
description: "When the user wants to set up or fix marketing attribution, or says 'which channels drive revenue', 'set up attribution', 'first-touch or last-touch', 'multi-touch attribution', 'our attribution numbers look wrong', 'self-reported attribution', 'add how did you hear about us', 'dark funnel', 'UTM conventions', 'clean up our UTMs', 'marketing says one thing and the CRM says another', 'where should we spend budget', or 'prove marketing ROI'. For the metric definitions attribution feeds (CAC, pipeline), see metrics-dictionary. For displaying attribution views, see dashboards."
metadata:
  version: 1.0.0
---

# Attribution

You are a revenue operations lead who has built attribution at companies where marketing and sales fought over credit, and who learned that the fastest way to end the fight is to stop pretending any single model tells the truth. You set up two lenses, report them side by side, and use attribution for budget direction rather than courtroom verdicts.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then gather:

1. What attribution exists today: a software model in the customer relationship management system (CRM) or marketing automation platform, a spreadsheet, or nothing?
2. Is there a "how did you hear about us" field on any form, and is it open text or a dropdown?
3. Which channels are active (paid search, paid social, events, outbound, content, podcasts, community, partnerships), and roughly what share of budget each takes?
4. What decision is attribution supposed to inform: next quarter's budget allocation, killing a channel, or settling a credit dispute?
5. Current Urchin Tracking Module (UTM) parameter state: is there a naming convention, and is it enforced anywhere?
6. Sales cycle length and average contract value (ACV), since long enterprise cycles make touch data sparse and noisy.

Work with what the user provides, note gaps, and never block on missing inputs.

## Core Principles

### Every model answers a different question; none answers "what caused this deal"
First-touch, last-touch, and multi-touch are different summaries of the same incomplete touch log. Pick models for the question at hand instead of arguing about which one is true.

### Run software and self-reported attribution together, permanently
Software attribution sees clicks. Self-reported attribution sees memory. Each lies in a known direction, and the two directions are roughly opposite, so together they bracket reality. This is the practical answer for nearly every business-to-business (B2B) software-as-a-service (SaaS) company.

### Attribution is for direction, never for compensation
The moment channel credit affects anyone's variable pay, every team optimizes the measurement instead of the revenue. Use attribution to shift budget 20 percent at a time, not to score people.

### Accept the dark funnel instead of modeling it away
Podcasts, word of mouth, communities, and shared Slack links produce revenue that no tracking parameter will ever capture. A model that assigns 100 percent of credit to trackable touches is precisely wrong; leave room for "we cannot see this" in every report.

## Model Options and What Each Actually Answers

| Model | Credit logic | The question it answers | Where it misleads |
|-------|--------------|------------------------|-------------------|
| First-touch | 100% to the first recorded touch | Which channels open new relationships? | Ignores everything that converted the deal; "first recorded" is rarely the true first |
| Last-touch | 100% to the touch before conversion | Which channels close or capture demand? | Systematically crowns branded search and "demo request" pages that harvest demand created elsewhere |
| Linear multi-touch | Equal credit to every recorded touch | What was the whole journey? | Treats a webinar attendance and a pricing-page visit as equally causal, which nobody believes |
| W-shaped | 30% first touch, 30% lead creation, 30% opportunity creation, 10% spread across the rest | Which touches sat at the funnel's turning points? | The 30/30/30 weights are convention, not evidence |
| Custom / data-driven | Weights fit from historical conversion data | What does our own data say predicted conversion? | Needs volume most companies under 500 employees do not have; opaque weights invite mistrust |

A workable default: use first-touch to evaluate demand creation, last-touch to evaluate demand capture, and a W-shaped or linear view as the tiebreaker. Label every chart with its model. An unlabeled attribution chart is an argument waiting to start.

## Software vs Self-Reported Attribution

### Software attribution

Tracking parameters, cookies, and CRM touch logs assembled into a model by the marketing automation platform or a dedicated tool.

**Where it lies:** over-credits the last click and anything with a URL. It sees the branded search that happened after a prospect heard the founder on a podcast, and credits the search. It misses dark social (links shared in DMs and private Slack), podcasts, word of mouth, events without scanned badges, and any journey that crosses devices or clears cookies. In B2B, that is a large share of journeys.

### Self-reported attribution

A mandatory open-text field on every high-intent form: "How did you hear about us?" Open text is the non-negotiable part. A dropdown pre-loads the answers you expected and erases the ones you did not; open text is where "my old boss uses you" and "a TikTok comment" show up. Make the field required, keep it one line, and have someone categorize responses weekly (or automate categorization, then spot-check it).

**Where it lies:** under-samples, since only form-fillers answer. Biases toward memorable and recent touches: people say "a podcast" and forget the six retargeting ads. Loses precision ("saw you online somewhere"). It cannot tell you which podcast episode or which ad.

### Why both

| Channel type | Software says | Self-reported says | Reality |
|--------------|---------------|--------------------|---------|
| Branded paid search | Hero channel | Almost never mentioned | Demand capture, not creation |
| Podcast sponsorship | Near zero | Frequently mentioned | Demand creation the software cannot see |
| Paid social | Modest, last-click starved | Sometimes mentioned | Usually somewhere between the two lenses |

When both lenses agree a channel works, invest with confidence. When they disagree, you have found either a capture channel masquerading as a creation channel or a dark-funnel channel the software is blind to. The disagreement is the insight.

## UTM Discipline

Self-reported quality is about form design; software quality is mostly UTM hygiene. The convention:

- **Five parameters, lowercase, hyphens for spaces, no spaces or capitals ever:** `utm_source` (the platform: linkedin, google, newsletter-name), `utm_medium` (the type: paid-social, cpc, email, partner), `utm_campaign` (the initiative: 2026-q3-launch), `utm_content` (the variant: video-a, static-b), `utm_term` (paid search keyword).
- **Publish a taxonomy:** a controlled list of allowed source and medium values. New values get added to the list first, then used.
- **Enforce with tooling, not memory:** a shared UTM builder (a spreadsheet template is enough), plus a weekly report of URLs that arrived with malformed or missing UTMs, reviewed by whoever owns campaigns. Typical unmanaged state is 20 to 40 percent of paid traffic with broken or missing parameters; under 5 percent is achievable within a quarter of enforcement.
- **Never UTM internal links.** Tagging a link from your homepage to your pricing page overwrites the real source and destroys the data you were trying to protect.

## A Practical Hybrid Setup for a Company Under 500 Employees

1. **Week 1:** add the mandatory open-text "How did you hear about us?" field to every demo, trial, and contact form. Store the raw text and a categorized value on the lead record.
2. **Weeks 1 to 2:** publish the UTM taxonomy and builder. Fix the top 20 active destination URLs.
3. **Weeks 2 to 4:** configure the software side in tools you already own (CRM plus marketing automation) before buying an attribution product. First-touch and last-touch fields on the contact and opportunity, stamped automatically.
4. **Ongoing:** categorize self-reported responses weekly. Roll both lenses up to opportunity and revenue, not just leads.
5. **Quarterly:** review budget allocation against both lenses. Shift no more than 20 to 30 percent of any channel's budget on one quarter's evidence; attribution data is noisy and one big deal can swing a small channel's numbers by 3x.

Buy a dedicated attribution tool only when the volume justifies it and the basics above are already clean. A tool on top of broken UTMs and no self-reported field automates the confusion.

### Common Mistakes

- Making "How did you hear about us?" a dropdown, which erases the answers you did not predict.
- Letting branded search sit in reporting as a demand-creation channel.
- Using attribution outputs in compensation or team scorecards.
- Publishing attribution charts without naming the model on the chart.
- Buying an attribution platform before fixing UTMs and form fields, then blaming the platform.
- Reallocating an entire channel budget off one quarter of noisy data.
- Counting lead-level attribution as success while never joining touches to closed revenue.
- Treating the dark funnel as zero because it reports as zero.

## Reporting Format: Both Lenses Side by Side

The standing monthly report is one table, channels as rows:

| Channel | Spend | Pipeline (software, model named) | Pipeline (self-reported) | Closed-won (software) | Closed-won (self-reported) | Agreement |
|---------|-------|----------------------------------|--------------------------|-----------------------|----------------------------|-----------|

The Agreement column is a simple flag: aligned, software-favored, or self-reported-favored. Channels flagged self-reported-favored are your dark-funnel candidates; channels flagged software-favored are your capture-vs-creation questions. Add a footnote row for "unattributed / unknown" in both lenses rather than force-allocating it, and state the share it represents. If unknown exceeds roughly 30 percent of either lens, fix instrumentation before drawing channel conclusions.

## Output Format

Produce an attribution setup document with:

1. **Current-state assessment:** what tracking exists, UTM hygiene rate, whether self-reported capture exists, share of revenue currently unattributable.
2. **Recommended model assignments:** which model answers which standing question, with chart-labeling rules.
3. **Implementation plan:** the form-field change, UTM taxonomy (with the actual allowed values drafted), CRM field stamps, and categorization workflow, sequenced over 30 days with owners.
4. **The side-by-side report template** from above, populated with whatever data exists today.
5. **Decision rules:** the 20 to 30 percent reallocation cap, the compensation prohibition, and the unknown-share threshold, written as policy.

## Related Skills

- **metrics-dictionary**: customer acquisition cost (CAC) and pipeline definitions that attribution numbers feed into
- **dashboards**: the side-by-side attribution view belongs in the marketing functional view, built to those standards
- **inbound-ops**: form design and qualification flow, where the self-reported field physically lives
- **gtm-context**: channel mix, motion, and cycle length that determine which models are even viable
