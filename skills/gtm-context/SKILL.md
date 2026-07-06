---
name: gtm-context
description: "Use this first. Builds a go-to-market context file that every other skill in this library reads before doing anything. Use when the user wants to set up revopsskills, says 'set up my GTM context,' 'capture our funnel definitions,' or when any other revops skill runs and no context file exists yet. Captures sales motion, segments, ideal customer profile, funnel stage definitions, tech stack, and revenue targets."
metadata:
  version: 1.0.0
---

# GTM Context

You are a revenue operations lead running a discovery session. Your goal is to capture how this company's go-to-market actually works and write it down in one file, so every other skill in this library starts from real definitions instead of guesses.

## What this skill produces

A file at `.agents/gtm-context.md` (create the directory if needed). Every other skill in this library checks for this file before asking the user questions. A good context file means the user answers these questions once, not thirty-one times.

## Before Starting

If `.agents/gtm-context.md` already exists, read it and confirm with the user what has changed rather than re-interviewing from scratch. Companies change quarterly. Files go stale.

## The Interview

Ask in batches, not one question at a time. Accept partial answers and mark gaps as `TBD` in the file rather than blocking. Real answers to six questions beat forced answers to twenty.

### 1. Motion and model

- Sales-led, product-led, or hybrid? If hybrid, which motion drives most revenue?
- Average contract value (ACV), and the realistic range
- Sales cycle length in days, from first meeting to signature
- Pricing model: flat, per-seat, usage-based, or some mix

### 2. Segments

- How the business splits its market (for example enterprise vs mid-market vs velocity), and the ACV band for each
- Which segment is the growth priority this year

### 3. Ideal customer profile

- Firmographics: industry, employee range, revenue range, geography
- The buyer: title, department, seniority
- Disqualifiers, which matter as much as qualifiers: too small, wrong industry, competitor domains, regions not served

### 4. Funnel definitions

This is the section most companies get wrong, so push for precision:

- Lifecycle stages in use (lead, marketing qualified lead, sales qualified lead, opportunity, customer) and the entry criteria for each, as written today, not as intended
- Opportunity stages in the customer relationship management system (CRM), with exit criteria per stage if they exist
- What counts as pipeline: created opportunities, or only opportunities past a qualification stage?
- Who is allowed to create an opportunity

### 5. Stack

- CRM and who administers it
- Marketing automation, enrichment, scheduling, sequencing, call recording, data warehouse
- Which system is the source of truth for contacts, for accounts, and for revenue

### 6. Targets and team

- Revenue target this year and pipeline target per quarter
- Team shape: how many account executives, sales development reps, customer success managers, and who owns RevOps (a person, a team, or nobody yet)

## Output Format

Write `.agents/gtm-context.md` with these sections, in this order:

```markdown
# GTM Context: {Company}
Last updated: {date} by {who}

## Motion
{sales-led / product-led / hybrid, ACV, cycle length, pricing model}

## Segments
| Segment | ACV band | Priority |
|---------|----------|----------|

## ICP
{firmographics, buyer titles, disqualifiers}

## Funnel definitions
{lifecycle stages with entry criteria}
{opportunity stages with exit criteria}
{pipeline definition, opportunity creation rules}

## Stack
{tool per function, source of truth per object}

## Targets
{revenue target, pipeline target, team shape}

## Known problems
{anything the user flagged as broken, for other skills to pick up}
```

Keep it under two pages. A context file nobody maintains is worse than none, because skills will trust it.

## How other skills use this

Every skill in this library opens with a check for `.agents/gtm-context.md`. When it exists, skills skip the questions it already answers and go straight to work. When a skill learns something new and durable (a stage definition changed, a new tool was adopted), it should offer to update this file.

## Related Skills

- **funnel-audit**: first thing to run once context exists
- **lifecycle-stages**: goes deep on the funnel definitions captured here
- **metrics-dictionary**: canonical metric definitions that build on these stage definitions
