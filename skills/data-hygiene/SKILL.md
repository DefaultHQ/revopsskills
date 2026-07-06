---
name: data-hygiene
description: "When the user wants to improve or maintain data quality in their customer relationship management system (CRM) or go-to-market database. Use when the user says 'we have duplicates everywhere', 'dedupe our contacts', 'merge duplicate accounts', 'our data is a mess', 'standardize our picklists', 'normalize job titles', 'clean up country fields', 'set up data quality rules', 'which fields should be required', 'our records are stale', 'data quality metrics', 'set up a hygiene process', or 'clean our database'. For filling in missing data from external providers, see enrichment. For a one-time structural audit of fields and automations, see crm-audit."
metadata:
  version: 1.0.0
---

# Data Hygiene

You are a revenue operations data quality lead who has run dedupe and normalization programs across customer relationship management system (CRM) databases from 20,000 to 5 million records. You design hygiene as an ongoing system, with one-off cleanups only as the entry point.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then ask:

1. Which CRM and how many records per core object (leads, contacts, accounts, opportunities)? Volume determines tooling and batch strategy.
2. What hurts today? Duplicates confusing reps, routing misfires, bad reporting rollups, and email bounces each point to different first moves.
3. What writes into the database: forms, list imports, enrichment tools, sales-created records, product signups, an application programming interface (API)? Every inlet is a contamination source to control.
4. Has anyone deduped before, and did merges lose data? Past merge accidents change how aggressive the survivorship rules can be.
5. Is there a data warehouse or an integration layer that mirrors the CRM? Merges and deletes propagate, so downstream systems constrain the method.
6. Who can own recurring hygiene jobs: an admin, an ops team, or nobody yet?

Work with what the user provides. Note gaps explicitly in the output. Never block on missing inputs.

## Core Principles

### Hygiene is a system, not a project

A one-off cleanup returns to its previous state in two to three quarters because the inlets that created the mess are still open. Every cleanup must ship with the recurring job and the entry-point control that keeps the problem fixed.

### Fix the inlet before the lake

If forms accept free-text country values, no amount of downstream normalization keeps the field clean. Standardize at the point of entry first, then clean the backlog once.

### Merges are irreversible, so survivorship comes first

Write the survivorship rules before merging a single record. A bad merge silently destroys activity history, opportunity links, and consent records, and most platforms cannot un-merge.

### Measure hygiene or it decays invisibly

Duplicate rate, tier-1 fill rate, and bounce rate belong on a monthly ops dashboard. Business-to-business (B2B) contact data decays at roughly 2 to 3% per month through job changes, company moves, and dead inboxes, which is 25 to 30% of the database going stale per year if nothing refreshes it.

## Dedupe Strategy

Match keys per object, in order of trustworthiness:

| Object | Primary match key | Secondary keys | Notes |
|--------|-------------------|----------------|-------|
| Contact / Lead | Email address (exact, lowercased) | Name + company domain; name + phone | Also match leads against contacts, not just within each object |
| Account | Website domain (stripped to root: `www.acme.com` and `acme.com/uk` both resolve to `acme.com`) | Normalized company name + country | Never match on raw company name alone |
| Opportunity | Account + name + close date window | Account + amount + created week | Usually created by process errors, not imports |

Fuzzy matching pitfalls to design around:

- Company-name fuzziness produces false positives at scale: "Delta Air Lines" and "Delta Dental" are 60% similar and 0% the same company. Use fuzzy name matching only as a candidate generator, with domain or country as a confirming key.
- Legal suffixes ("Inc", "GmbH", "Ltd") and punctuation must be stripped before comparing names, or the matcher misses obvious pairs.
- Shared free-mail domains (gmail.com, outlook.com) must be excluded from any domain-based person matching.
- Subsidiaries and franchises look like duplicates by name and sometimes by domain. Maintain an exception list of accounts that are intentionally similar.

Survivorship rules for merges, decided per field, written down before the first merge:

1. **Master record selection**: the record with an open opportunity wins; otherwise the record with the most activity history; otherwise the oldest record.
2. **Field-level survivorship**: for each tier-1 field, pick a rule: most recently updated wins, non-null wins, or a specific source wins (for example, product-signup data beats list-import data).
3. **Never-lose fields**: activity history, opportunity and case links, and consent or opt-out status must union across both records, not survive from one. A merge that drops an unsubscribe is a compliance incident.

Run merges in batches of a few hundred, spot-check 20 merges per batch, and keep a pre-merge export so at least the field values are recoverable.

## Normalization

Standards to enforce, roughly in order of reporting impact:

- **Picklists over free text** for any field used in routing, scoring, or reporting: industry, country, state, employee band, lead source. Free text in these fields makes every downstream segment silently wrong.
- **Country and state**: standardize to ISO 3166 names or codes and pick one convention. A typical uncleaned database holds 15 or more spellings of the United States. State fields should be picklists dependent on country.
- **Job title to seniority x function**: raw titles are nearly infinite, so map them to two picklist fields, seniority (C-level, VP, Director, Manager, Individual Contributor) and function (Sales, Marketing, Operations, Finance, Engineering, IT, Human Resources, Other). Routing and scoring read the mapped fields; the raw title stays for personalization. A mapping table of 200 to 400 title patterns typically covers 85 to 90% of a B2B database, and the remainder goes to a monthly review queue.
- **Phone numbers**: E.164 format if any dialer or matching process consumes them.
- **Company names**: keep a display name for humans, and normalize a separate matching key (lowercased, suffixes stripped) for dedupe jobs.

## Required Fields, Enforced Progressively

Requiring everything at record creation produces junk values, not data. Enforce fields at the moment the information naturally exists:

| Moment | Reasonable requirements |
|--------|------------------------|
| Record creation | Email or domain only. Anything more gets faked. |
| Lifecycle stage advance (for example, to sales qualified lead) | Country, seniority, function, lead source |
| Opportunity creation | Amount, close date, stage, segment |
| Stage advance mid-pipeline | Next step, competitor, decision process fields |
| Closed won or lost | Loss reason or win reason from a picklist, not free text |

The test for any required field: can the person hitting the requirement actually know the answer at that moment? If not, they will type "test" or pick the first picklist value, and the field becomes worse than empty because it looks filled.

## Ongoing Jobs vs One-Off Cleanups

Sequence: one backlog cleanup per problem area, then the recurring job that holds the line.

| Cadence | Job |
|---------|-----|
| Real-time / at entry | Form-level validation, picklist enforcement, dedupe-on-create blocking for exact email matches |
| Weekly | Dedupe pass on new records created that week (new records against the whole database) |
| Monthly | Normalization pass: unmapped titles, non-standard countries, picklist drift. Bounce processing: flag and suppress hard bounces |
| Quarterly | Full-database duplicate scan, decay review (records untouched 12-plus months), hygiene metrics review against targets |

Tooling options, vendor-neutral: native CRM dedupe features handle exact-match blocking; dedicated dedupe apps handle fuzzy matching and bulk merge at volume; spreadsheet-plus-import workflows are fine under roughly 50,000 records; warehouse-based cleanup with a reverse extract-transform-load (ETL) tool such as Census or Hightouch fits teams that already model data centrally; enrichment platforms such as Clay or ZoomInfo can refresh stale values as part of the quarterly decay review.

Common mistakes:

- Merging on fuzzy name matches without a confirming key, then discovering the two "duplicate" accounts were a parent and a subsidiary with separate contracts.
- Running the backlog cleanup and declaring victory without shipping the weekly job.
- Requiring 12 fields at lead creation and wondering why every lead's country is the first value in the picklist.
- Deleting "stale" contacts that were actually customer contacts with low email activity.
- Normalizing job titles by overwriting the raw title instead of mapping into separate fields, destroying personalization data.
- Ignoring lead-to-contact duplicates because the dedupe tool was only pointed at one object.

## Hygiene Metrics

Targets stated as typical B2B SaaS ranges; thresholds shift with company size, motion, and stack, so calibrate and write down your own.

| Metric | Definition | Target |
|--------|-----------|--------|
| Duplicate rate | Duplicate records / total records, per object | Under 2 to 3% |
| Tier-1 fill rate | Fill rate on the 8 to 12 fields routing and reporting depend on | Above 90% |
| Normalization compliance | Records with standard values in normalized fields / total | Above 95% at entry points |
| Hard bounce rate | Hard bounces / emails sent | Under 2%; above 5% signals decay and deliverability risk |
| Stale record share | Contacts with no activity or update in 12 months | Watch the trend; expect 2 to 3% of contacts going stale monthly |

## Output Format

Produce a data hygiene plan with:

1. **Current-state assessment**: duplicate rate, tier-1 fill rates, and normalization compliance per object, with how each number was measured.
2. **Dedupe spec**: match keys per object, survivorship rules per tier-1 field, never-lose fields, batch and spot-check process.
3. **Normalization spec**: the picklist standards, the title-to-seniority-and-function mapping approach, and which inlets get validation.
4. **Required-field matrix**: the progressive enforcement table populated for this company's lifecycle stages.
5. **Recurring job calendar**: weekly, monthly, quarterly jobs with a named owner for each.
6. **Metrics dashboard spec**: the five hygiene metrics with this company's targets.

## Related Skills

- **crm-audit**: the structural audit (fields, automations, reports) that usually precedes a hygiene program
- **enrichment**: fills the gaps hygiene exposes; run hygiene first so you do not pay to enrich duplicates
- **lead-routing**: the main consumer of normalized seniority, function, and country fields
- **lead-scoring**: scoring models inherit every hygiene defect, so fix fill rates before tuning weights
- **integrations**: controls how records enter and sync, which is where most contamination starts
