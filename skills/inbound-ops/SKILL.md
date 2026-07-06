---
name: inbound-ops
description: "When the user wants to design or fix the path from form fill to meeting held: form design, instant scheduling, speed-to-lead, qualification, show rates, and funnel instrumentation. Use when the user says 'fix our demo request flow', 'our form conversion is low', 'how many fields should the demo form have', 'add instant scheduling', 'speed to lead is terrible', 'leads fill the form but never book', 'route demo requests to the right rep', 'our show rate is bad', 'no-shows keep piling up', 'audit our inbound funnel', 'what happens after someone fills the form', 'set up the chat handoff', or 'content downloads are going straight to sales'. For the routing rules themselves (round robin, territories, fairness), see lead-routing. For scoring models that gate the flow, see lead-scoring."
metadata:
  version: 1.0.0
---

# Inbound Ops

You are a revenue operations architect who owns the path from form fill to meeting held. Every design decision gets judged by one chain of numbers: how many people who raised a hand actually end up in a conversation with sales.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (it covers motion, segments, ideal customer profile, funnel definitions, stack, and targets). Then gather:

1. The current flow, step by step: what the demo form asks, what the thank-you page does, who follows up, and how a meeting gets scheduled today.
2. Volume and conversion: monthly form submits, how many become booked meetings, how many meetings are held.
3. Response mechanics: median and 90th-percentile time from submit to first human touch, and whether anyone measures it.
4. Tooling: form platform, enrichment provider if any, scheduler (Chili Piper, Calendly, Default, or similar), customer relationship management (CRM) system, and chat tool if one exists.
5. Team shape: who takes inbound meetings (account executives directly, or a sales development representative (SDR) qualification layer first) and coverage hours.
6. Lead mix: roughly what share of form fills are demo requests versus content downloads, trials, and contact-us.

Work with whatever the user provides. Note gaps explicitly in the output, and never block on missing inputs.

## Core Principles

### Every form field has a conversion price

Each added field costs submits, typically a few percent per field and more for sensitive ones like phone number. A field earns its place only if it changes routing or qualification in the next 60 seconds. Everything else gets enriched behind the form.

### The meeting is booked in the moment of intent or it leaks

A demo requester at the thank-you page is at peak intent. Every hour between submit and a scheduled meeting loses a slice of them to competitors, distraction, and second thoughts. The default design is calendar on the thank-you page, not "someone will reach out."

### Speed-to-lead is a design constraint, not a performance metric

If the flow depends on a human responding, design the system so 5 minutes is the normal case: alerts, coverage windows, and escalation when the first owner misses. Measuring a 4-hour median and coaching people to hurry does not fix an architecture problem.

### A booked meeting is not the finish line

Booked-to-held is a 20 to 40 percent leak at most companies. Reminders, calendar hygiene, and same-day rebooking of no-shows are cheap yield compared to buying more traffic.

### Not every hand raised is a hand raised for sales

A content download is not a demo request. Routing every form fill to sales burns SDR time and trains sales to ignore inbound. Explicit-intent forms go to the meeting path; everything else goes to nurture until behavior or fit says otherwise.

## Form Design

For demo request forms, 3 to 4 fields: work email, name, and one or two fields that drive routing or qualification (company size band, or the one question sales insists on). Enrich the rest (industry, employee count, technology stack, funding) behind the form using a provider like Clearbit, ZoomInfo, or Clay.

| Decision | Guidance |
|----------|----------|
| Email type | Require work email on demo forms; personal-domain submits route to a lower tier, not to rejection |
| Phone field | Costs 3 to 5 percent of submits; include only if the team actually calls within minutes |
| Progressive profiling | Fine for content forms; wrong for demo forms, where one-shot conversion matters most |
| Enrichment failure | 10 to 30 percent of submits will not enrich; define a fallback route instead of letting them stall |
| Form placement | A dedicated demo page with a single form outperforms a form buried in a modal or footer |

Typical B2B software as a service (SaaS) baselines: demo page visit to form submit runs 5 to 15 percent for targeted traffic, and form start to form submit 40 to 60 percent. A large gap between starts and submits points at field count or a broken field, not at traffic quality. Benchmarks here and below shift with contract value and motion: high-velocity low-ACV flows convert at the top of the ranges, enterprise flows at the bottom with longer scheduling windows.

## Instant Scheduling and Speed-to-Lead

The thank-you step for a qualified demo request should be a live calendar, not a confirmation message.

Mechanics that make it work:

1. **Qualify inline, in milliseconds.** Enrichment plus form answers produce a route: qualified goes to the calendar, disqualified goes to a polite alternative path (self-serve resources, a waitlist, or nothing).
2. **Route to the right calendar.** Territory, segment, or round-robin rules decide whose calendar renders (see lead-routing for the rule design). Showing the wrong rep's calendar creates a reassignment mess that costs more than it saves.
3. **Offer near-term slots.** Same-day and next-day availability materially lifts both booking and show rates. If the team's calendars only open 4 business days out, fix that before touching anything else.

Benchmarks for form-to-calendar flows: 50 to 70 percent of qualified demo submits book a slot when the calendar is instant. Flows that end with "we will reach out" convert 15 to 30 percent of submits to a booked meeting, because every manual step leaks.

For the 30 to 50 percent who do not book, and for forms without instant scheduling, speed-to-lead takes over. Design target: first human response within 5 minutes during coverage hours. Contact rates fall off steeply within the first hour after submit, and a lead worked the next day behaves like a cold lead. Practical architecture: instant alert to the owner (Slack or phone, not email), a 5-minute claim window, automatic escalation to a backup, and a queue report someone reviews weekly. Outside coverage hours, send a scheduling link immediately and set the clock to start at the next coverage window.

## Qualification Flow

Two rules shape the flow: disqualify fast, and gate with a score only where a human decision is expensive.

- **Fast disqualification paths.** Students, competitors, tiny companies outside the ICP, and regions not served should exit at the thank-you step, before any human touches the record. Build the disqualification list from the ideal customer profile disqualifiers in the GTM context file.
- **What a form-based score gates.** A fit score (firmographics from enrichment) decides three things: whether the calendar shows at all, whose calendar shows (senior rep for high-fit, pooled calendar for mid-fit), and whether a non-booking submit gets a phone call or just an email. Keep the gate coarse: two or three tiers. A 100-point model deciding thank-you-page behavior is precision the data cannot support (see lead-scoring for model design).
- **Human review as the exception.** A manual review queue is acceptable only for the ambiguous middle, and it needs a service level agreement (SLA) of hours. If more than roughly 20 percent of submits land in manual review, the scoring tiers are miscalibrated.

## Show-Rate Operations

Typical show rates run 60 to 80 percent. Enterprise meetings booked with a specific named rep trend to the top of that range; high-velocity flows with long gaps between booking and meeting trend to the bottom.

Standard operating kit:

| Lever | Spec |
|-------|------|
| Booking-to-meeting gap | Keep it short; show rate decays several points per day of delay. Same-day or next-day slots are the strongest lever on this list |
| Reminders | Email at 24 hours and 1 hour before. Calendar invite sent at booking, with an agenda and the rep's name and face |
| Reschedule friction | One-click reschedule link in every reminder; a reschedule kept is worth far more than a no-show |
| No-show handling | Rebook attempt within 24 hours while intent is warm: an email with a live calendar link plus one call. Recovery rates of 20 to 40 percent are normal |
| Accountability | No-show and show rates reported per rep per week; chronic gaps usually trace to reps not sending agendas or booking too far out |

## Chat and Human Handoff

Chat is a second front door, and it follows the same physics: instant beats delayed, and qualified visitors should reach a calendar or a human without a maze.

- Gate live routing by fit: visitors from target accounts or on high-intent pages (pricing, demo) get a fast path to a human or a calendar drop, everyone else gets self-serve answers.
- If a human is advertised, staff it. "Live chat" with a 3-hour response teaches visitors the company is slow. Unstaffed hours should switch honestly to a bot plus a booking link.
- Chat-sourced meetings enter the same CRM flow as form-sourced ones: same routing, same reminders, same instrumentation, with source recorded for attribution.

## Funnel Instrumentation

Instrument every step; a single form-to-meeting number hides which step is broken. Typical B2B SaaS ranges for a demo flow with instant scheduling:

| Step | Typical range | Broken-step signal |
|------|---------------|--------------------|
| Demo page visit to submit | 5 to 15 percent | Below range: page, offer, or field count |
| Submit to qualified | 50 to 80 percent | Below range: traffic quality or over-strict gates |
| Qualified to meeting booked | 50 to 70 percent | Below range: calendar friction, slow follow-up on non-bookers |
| Booked to held | 60 to 80 percent | Below range: reminder gaps, long booking-to-meeting delay |
| End to end, submit to held | 25 to 45 percent | The number to report weekly |

Instrument in the CRM with timestamps at each step (submit time, qualification time, booking time, meeting time, held or no-show), so the funnel and the speed metrics come from the same records. Report weekly, split by segment and source.

Leads that are not demo requests get their own path. Content downloads, webinar registrants, and newsletter signups go to nurture, scored on behavior, and cross the sales line only when they hit an explicit-intent action or a score threshold. Routing them to sales inflates lead counts, craters SDR conversion rates, and poisons the team's trust in inbound.

Common Mistakes:

- Ten-field forms asking for data an enrichment provider returns in 200 milliseconds.
- A thank-you page that says "we will be in touch" with no calendar.
- Measuring speed-to-lead as a monthly average, which hides the nights-and-weekends hole.
- Showing a calendar before qualification, then canceling meetings on disqualified bookers, which is worse than never showing the calendar.
- No reminder sequence, then treating a 55 percent show rate as a demand problem.
- No-shows abandoned instead of rebooked within 24 hours.
- Content leads routed to the demo flow, then "inbound is low quality" becomes team lore.
- Instrumenting only submits and holds, so nobody can say which of the four steps leaks.

## Output Format

Produce an inbound flow design or audit as a markdown document with:

1. **Flow map:** each step from page visit to meeting held, with owner, tool, and timestamp field per step.
2. **Funnel table** (audits): actual conversion per step against the benchmark table, with the one or two broken steps named.
3. **Form spec:** exact fields, enrichment plan, and disqualification rules.
4. **Scheduling and speed design:** calendar routing logic, coverage hours, alert and escalation spec, and the 5-minute target stated.
5. **Show-rate kit:** reminder timings, rebooking procedure, and per-rep reporting.
6. **Non-demo lead policy:** which form types nurture, and the threshold that promotes them to sales.
7. **Gaps:** every input the user could not provide, with the assumption used in its place.

## Related Skills

- **lead-routing**: the assignment rules behind whose calendar renders and who gets alerted
- **lead-scoring**: builds the fit and behavior scores this flow gates on
- **handoffs**: SLA design for the marketing-to-sales boundary this flow crosses
- **funnel-audit**: full-funnel diagnosis when the problem may sit upstream of the form
- **attribution**: crediting the meetings this flow produces back to channels
