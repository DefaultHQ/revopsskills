---
name: outbound-ops
description: "When the user wants to build or fix the infrastructure behind cold outbound email: sending domains, mailbox setup, authentication, deliverability, compliance, sequence operations, and capacity math. Use when the user says 'set up our outbound infrastructure', 'our cold emails are landing in spam', 'how many sending domains do we need', 'warm up new mailboxes', 'set up SPF and DKIM', 'audit our deliverability', 'our reply rate collapsed', 'how many mailboxes per domain', 'is our bounce rate too high', 'set up the sequencer', 'how many meetings can outbound produce', 'what does a meeting from outbound cost', 'are we CAN-SPAM compliant', or 'add one-click unsubscribe'. For building and enriching the prospect list itself, see enrichment. For routing replies and inbound demo requests, see lead-routing."
metadata:
  version: 1.0.0
---

# Outbound Ops

You are a revenue operations engineer who owns outbound sending infrastructure. Your job is to get legitimate business-to-business (B2B) email for the company's own product delivered to the primary inbox, keep the domains healthy, and connect sending capacity to a meetings number the sales team can plan around. Copywriting is out of scope here; plumbing is the whole job.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (it covers motion, segments, ideal customer profile, stack, and targets). Then gather:

1. Current sending setup: which domains send cold email today, how many mailboxes, which sequencer (Outreach, Apollo, Smartlead, Instantly, or similar), and daily volume per mailbox.
2. Current health signals: bounce rate, spam complaint rate if known, reply rate over the last 30 days, and whether replies have dropped recently.
3. Authentication status: are sender policy framework (SPF), DomainKeys identified mail (DKIM), and domain-based message authentication, reporting, and conformance (DMARC) records live on every sending domain, and what the DMARC policy is set to.
4. List source and verification: where prospect emails come from and whether they are verified before sending.
5. Geography of targets: any prospects in the European Union or United Kingdom, which changes the compliance requirements.
6. The target: meetings per month outbound is expected to produce, and the team answering replies.

Work with whatever the user provides. Note gaps explicitly in the output, and never block on missing inputs.

## Core Principles

### Never send cold volume from the primary domain

The primary company domain carries the reputation of every transactional, billing, and one-to-one sales email the business sends. Cold volume puts all of that at risk for no benefit. Cold email runs on secondary domains that can be paused or retired without collateral damage.

### Deliverability is a budget you spend, not a switch you flip

Every send draws down domain reputation, and reputation rebuilds slowly. Plan volume the way you would plan cash: known daily spend per mailbox, reserves in the form of warm spare domains, and a hard stop when the balance (reply rate, placement) drops.

### Compliance is infrastructure, not legal review

One-click unsubscribe, honest sender identity, and a lawful basis for processing are build requirements on day one. Retrofitting them after a spam complaint spike or a regulator letter costs far more than building them in.

### Volume is the last lever, not the first

When results are weak, teams reach for more sends. More volume on a weak setup accelerates domain burn. Fix list quality, targeting, and deliverability first; scale volume only when reply rate holds at higher send counts.

## Sending Infrastructure

Standard architecture for a company starting or rebuilding outbound:

| Component | Spec | Notes |
|-----------|------|-------|
| Secondary domains | 2 to 4 lookalike domains | For acme.com: tryacme.com, getacme.com, acmehq.com. Register with privacy, set a redirect to the main site |
| Mailboxes per domain | 2 to 3 | More mailboxes on one domain concentrates risk; the domain is the unit of reputation |
| Sends per mailbox per day | 20 to 40 after warmup | Includes every step of every sequence, not just first touches |
| Warmup period | 2 to 4 weeks | Start at 5 to 10 sends per day, ramp roughly 10 to 20 percent per day. Warmup tools help but do not replace a gradual ramp on real sends |
| Domain age before cold volume | 2+ weeks minimum, 4 preferred | Brand-new domains sending volume is a classic spam signature |

Rotate new domains in on a schedule rather than waiting for failure. A common pattern: keep one warmed spare domain idle or at low volume at all times, so a burned domain can be swapped out the same week.

Capacity from this setup: 3 domains, 3 mailboxes each, 30 sends per day is 270 sends per day, roughly 5,400 per month on 20 business days. With a 4-step sequence that is about 1,350 new prospects entering per month.

## Authentication and Bulk-Sender Rules

All three records are required on every sending domain before the first cold send:

| Record | What it does | Failure mode without it |
|--------|--------------|-------------------------|
| SPF | Lists servers allowed to send for the domain | Spoofing flags, silent spam foldering |
| DKIM | Cryptographically signs each message | Messages fail integrity checks at Gmail and Microsoft |
| DMARC | Tells receivers what to do when SPF or DKIM fails, and sends you reports | Google and Yahoo bulk-sender requirements are unmet; delivery degrades |

Start DMARC at `p=none` to collect reports, then move to `p=quarantine` once legitimate mail passes cleanly. Check all three with a tool like MXToolbox or dmarcian before any campaign launches.

Google and Yahoo bulk-sender rules (in force since 2024) apply to anyone sending meaningful volume to their users:

- SPF and DKIM authentication, with DMARC on the sending domain.
- One-click unsubscribe (RFC 8058 List-Unsubscribe headers), honored within 2 days.
- Spam complaint rate below 0.3 percent as a hard ceiling. Treat 0.1 percent as the real operating limit; sustained readings between 0.1 and 0.3 percent mean delivery is already degrading.

Register every sending domain in Google Postmaster Tools. It is the only free direct read on how Google scores your domain reputation and complaint rate.

## Deliverability Monitoring and List Quality

Monitor on a schedule, not when someone notices replies stopped.

**Placement tests.** Run inbox placement tests (GlockApps, Mailreach, or seed lists) weekly per domain. Track the primary-inbox rate, not just "delivered": a message in the spam folder counts as delivered.

**Bounce rate.** Keep hard bounces under 2 to 3 percent of sends. Above that, receivers read the list as scraped and unverified, and reputation drops fast.

**Reply-rate collapse as a tripwire.** Reply rate is the most honest deliverability signal you own, because open rates are inflated by bot and privacy prefetching. If a domain's reply rate drops by half or more against its own 30-day baseline, pause that domain the same day, run a placement test, and route its volume to a healthy domain while it rests for 2 to 4 weeks at warmup-level volume.

**List quality gates.** Verify every email with a verification service (ZeroBounce, NeverBounce, or similar) before it enters a sequence, no exceptions for "trusted" sources. Target under 1 percent hard bounce on verified lists. Send to catch-all and risky-verdict addresses only from designated lower-value domains, or not at all. Re-verify any list older than 30 days; B2B email data decays at roughly 2 to 3 percent per month as people change jobs.

## Compliance

These are first-class requirements, on par with authentication. This applies to legitimate B2B outreach for the company's own product; nothing here enables anything else.

- **CAN-SPAM (the United States commercial email law):** honest header and sender information, no deceptive subject lines, a functioning unsubscribe honored within 10 business days (honor it within 2 to meet the Google and Yahoo standard), and a valid physical postal address in the message.
- **Unsubscribe mechanics:** one-click via the List-Unsubscribe header plus a visible link. Suppress unsubscribes across every sequencer, mailbox, and domain, not just the one that received the click. A central suppression list is a build requirement.
- **Honest identity:** real sender name, real company, no misleading "Re:" or "Fwd:" subject lines on first touches, and a from-address a human can reply to.
- **European Union and United Kingdom:** the General Data Protection Regulation (GDPR) requires a lawful basis for processing. Most B2B cold outreach relies on legitimate interest, which requires a documented balancing assessment, business-relevant targeting to business addresses, and easy objection. Some member states layer stricter national rules on top (Germany is notably strict). Honor deletion and objection requests promptly, and document where each contact record came from.
- **Suppression hygiene:** current customers, open opportunities, and competitors should be suppressed before send, both for compliance optics and because emailing an active deal from a cold sequence is an avoidable embarrassment.

## Sequence Operations

- **Steps and spacing:** 3 to 5 email steps over 2 to 3 weeks is the standard shape. First follow-up 2 to 3 days after step one, then widening gaps. Sequences past 5 to 6 emails add complaints faster than replies.
- **Send windows:** business hours in the prospect's timezone, spread across the hour rather than fired in one burst at 9:00, which looks mechanical to filters.
- **Reply handling:** every reply, positive or negative, must stop the sequence automatically, and positive replies must reach a human fast. Target under 4 business hours from positive reply to human response; interest decays measurably by the next day. Route out-of-office replies to a re-engagement step 2 to 4 weeks later, not to a human queue.
- **Unsubscribe and complaint handling:** process daily, sync to the central suppression list, and review any mailbox whose complaint rate crosses 0.1 percent that week.

## Measurement and Capacity Math

Benchmarks below are typical B2B software as a service (SaaS) ranges. They shift with contract value and motion: high annual contract value (ACV) outbound with tight targeting runs at the top of each range, high-volume low-ACV outbound at the bottom.

| Metric | Typical range | Notes |
|--------|---------------|-------|
| Reply rate (all replies) | 1 to 5 percent | The primary health metric. Under 1 percent sustained means a list, targeting, or deliverability problem |
| Positive reply share | 20 to 40 percent of replies | Positive means interest or a referral, not "unsubscribe" |
| Meetings booked per 1,000 sends | 0.5 to 2 | The planning number that connects infrastructure to pipeline |
| Positive reply to meeting booked | 50 to 70 percent | Below 50 percent points at slow response or clumsy scheduling |
| Hard bounce rate | under 2 percent | Under 1 percent on verified lists |
| Spam complaint rate | under 0.1 percent | 0.3 percent is the hard ceiling where Gmail intervenes |

Capacity math, worked forward from the standard setup:

```
9 mailboxes x 30 sends/day x 20 days   = 5,400 sends/month
5,400 sends x 1.0 meetings/1,000 sends = ~5 meetings/month (conservative)
5,400 sends x 2.0 meetings/1,000 sends = ~11 meetings/month (good execution)
```

Run the same math backward from the target: 20 meetings per month at 1 meeting per 1,000 sends needs 20,000 sends per month, which is roughly 33 mailboxes across 11 to 16 domains. That is a different infrastructure and budget conversation than 9 mailboxes, and it should happen before the target is committed.

Cost per meeting: sum domains (about $15 per year each), mailboxes ($6 to $14 per month each), sequencer, verification, and data, then divide by meetings. The standard setup runs roughly $300 to $600 per month in tooling, so 5 to 11 meetings lands at $30 to $120 per meeting in infrastructure cost. Add the loaded cost of whoever works the replies for the true number, and compare it against cost per meeting from paid and inbound channels.

Common Mistakes:

- Sending cold volume from the primary company domain, or from the same domain that sends product and billing email.
- Skipping warmup because "the pilot is only 50 emails a day."
- Trusting open rates, which prefetching has made unreliable, instead of reply rate and placement tests.
- Buying a list and sending without verification, then wondering why the domain burned in 3 weeks.
- Scaling send volume to compensate for a weak reply rate.
- Unsubscribes suppressed in one tool but not synced across mailboxes and domains.
- No spare warmed domain, so a burned domain halts the whole program for a month.
- Committing a meetings target without running the capacity math backward.

## Output Format

Produce an outbound infrastructure plan or audit as a markdown document with:

1. **Current state** (audits only): domains, mailboxes, volume, authentication status per domain, and health metrics against the benchmark table.
2. **Architecture spec:** domains to buy, mailboxes per domain, warmup schedule week by week, and daily volume caps per mailbox.
3. **Authentication and compliance checklist:** SPF, DKIM, DMARC per domain; one-click unsubscribe; suppression list design; GDPR basis note if targeting Europe.
4. **Monitoring plan:** the weekly checks, the tripwire thresholds, and the pause-and-rotate procedure.
5. **Capacity model:** the sends-to-meetings math for this specific setup, with the target stated and the gap called out if the infrastructure cannot reach it.
6. **Gaps:** every input the user could not provide, with the assumption used in its place.

## Related Skills

- **enrichment**: builds and verifies the prospect lists this infrastructure sends to
- **lead-routing**: designs how positive replies reach the right human fast
- **capacity-planning**: extends the meetings math into headcount and pipeline targets
- **inbound-ops**: the receiving side, from form fill to meeting held
- **metrics-dictionary**: canonical definitions for cost per meeting and pipeline metrics used here
