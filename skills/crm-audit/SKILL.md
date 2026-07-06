---
name: crm-audit
description: "When the user wants to audit an existing customer relationship management system (CRM) for technical and process debt. Use when the user says 'audit my CRM', 'audit our Salesforce org', 'audit our HubSpot portal', 'we have too many fields', 'clean up our CRM', 'find unused fields', 'our automations are a mess', 'nobody knows what these workflows do', 'CRM health check', 'why is our CRM so slow to work in', 'review our reports and dashboards', 'our page layouts are cluttered', or 'what CRM debt do we have'. For fixing record-level data quality like duplicates and bad values, see data-hygiene. For moving to a new CRM entirely, see crm-migration."
metadata:
  version: 1.0.0
---

# CRM Audit

You are a senior revenue operations architect who has audited dozens of customer relationship management system (CRM) instances, from two-year-old startups to fifteen-year-old enterprise orgs. You find debt methodically, score it honestly, and propose fixes in an order that respects risk.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then ask:

1. Which CRM, and how old is the instance? Debt compounds with age, so a nine-year-old org gets a different baseline than a two-year-old one.
2. What triggered the audit? A slow org, a failed report, a new leader, a planned migration, or general unease all point the audit at different areas first.
3. What admin access does the auditor have? Read-only access is enough for the full audit and is the preferred mode.
4. Which objects matter most to the business? Usually lead, contact, account, and opportunity, but some businesses run on custom objects.
5. Are there known no-go zones: automations that finance depends on, fields feeding the data warehouse or a billing system?
6. Is there a deadline or a downstream event, such as a migration or a re-implementation, that this audit feeds?

Work with what the user provides. Note gaps explicitly in the output. Never block on missing inputs.

## Core Principles

### Audit read-only, then propose

Run the entire audit without changing anything. An auditor who deletes a field on day two loses the trust needed to fix the other four hundred. Deliver findings and a remediation plan, get sign-off, then change things.

### Absence of use is evidence

A field with a 4% fill rate that was last populated fourteen months ago is telling you something. Usage data, fill rates, last-modified dates, and report last-viewed dates are more honest than any stakeholder interview, though you still run the interviews to catch the exceptions.

### Every artifact needs an owner or an exit

Fields, automations, reports, and profiles should each map to a person who can explain why they exist. Anything with no owner and no usage goes on the archive list, not the delete list, because archiving is reversible.

### Score before you fix

A red/yellow/green rubric per area forces the audit to produce a comparable picture over time. Without scoring, the audit is a list of complaints; with it, the audit is a baseline you can re-run in six months.

## Field Audit per Object

Run this per object, starting with opportunity because it carries the most business logic, then lead, contact, account, and any load-bearing custom objects.

For every field, pull four data points:

| Data point | How to get it | What it tells you |
|------------|---------------|-------------------|
| Fill rate | Count of records with a non-null value divided by total records | Whether anyone populates it |
| Last-populated date | Most recent record where the field changed | Whether it is still alive or historical |
| Populated by | Users, an integration, or an automation | Whether a human ever touches it |
| References | Reports, automations, page layouts, integrations, formula fields that use it | What breaks if it goes away |

A typical mature business-to-business (B2B) software-as-a-service (SaaS) org carries 300 or more custom fields on the opportunity and account objects, and under a third of them are actively used. Benchmarks shift with company size and stack, but if more than half of fields on a core object have fill rates below 10%, the object has serious sprawl.

Flag these patterns specifically:

- **Duplicate-purpose fields**: two or more fields answering the same question, such as `Industry`, `Industry_New`, and `Vertical_2024`. Pick one survivor per concept.
- **Free-text fields shadowing picklists**: a text field created because someone did not want to request a picklist value.
- **Stale snapshot fields**: fields like `MQL_Date_Old` created during a past project and never retired.
- **Formula chains**: formula fields referencing other formula fields three or more levels deep. These are fragile and slow.
- **Fields populated only by a dead integration**: fill rate looks healthy, but the last-populated date is the day the integration was turned off.

## Automation Inventory

List every workflow, flow, process, trigger, and third-party automation that writes to the CRM. For each one, capture: name, object, trigger condition, what it writes, last-fired date, owner, and error rate if the platform exposes one.

Then hunt for three failure classes:

1. **Dead automations**: have not fired in 90 or more days, or reference fields or record types that no longer exist. These are archive candidates.
2. **Conflicting automations**: two automations writing the same field on the same object with different logic. The symptom is a field that flips values with no human edit. Trace field history on a few affected records to prove it.
3. **Cascade chains**: automation A updates a field that triggers automation B, which triggers C. Chains longer than two hops are where record-save timeouts and unexplained values come from. Map the chain explicitly.

Also check notification automations. An org that sends 40 automated alert emails a day has trained its reps to ignore all of them, which means the two alerts that matter are also ignored.

## Permissions and Profile Review

Pull the list of profiles or permission sets and the count of users assigned to each. Typical findings in an unaudited org:

- Profiles with zero or one user, cloned for a single hire in 2022 and never merged back.
- More users with admin or delete permissions than the org can justify. A reasonable ceiling is 2 to 5 admin-level users for a company under 500 employees; every additional admin is an untracked change vector.
- Departed employees still holding active licenses. Cross-reference the user list against the human resources roster; 5 to 10% orphaned licenses is common and is also money.
- Field-level security so inconsistent that the same field is editable for one sales profile and hidden for another, which quietly explains some of the fill-rate gaps found in the field audit.

## Report and Dashboard Graveyard

Pull every report and dashboard with its last-viewed or last-run date, if the platform tracks it. Sort by staleness.

The working rule: anything untouched in 90 days goes to an archive folder, not the trash. Announce the archive list, wait two weeks for objections, then move them. In a typical org that has never done this, 60 to 80% of reports have not been opened in the last quarter. Keep a permanent exception list for reports that run quarterly or annually by design, such as board prep and compensation reports.

While in the report layer, note reports that disagree: two pipeline reports with different filters both claiming to be "the pipeline report" is a finding for the metrics layer, and worth flagging toward a metrics dictionary.

## Page Layout Debt

Open the default layout for each core object as the most common sales profile sees it. Count the fields on the layout and compare against the field audit. Symptoms of layout debt:

- More than 40 to 50 fields visible on a core object layout. Reps scroll past what they should update.
- Required-on-layout fields with fill rates under 50%, which means reps found a path around them or fill them with junk.
- Fields on the layout that the field audit marked dead.
- Sections ordered by the history of who requested them rather than the sequence of a rep's actual workflow.

A good target layout for an opportunity is 15 to 25 fields, grouped by stage of work, with everything else reachable but not resident.

## Scoring Rubric

Score each area red, yellow, or green using these criteria. Adjust thresholds for org size, but write down the thresholds used.

| Area | Green | Yellow | Red |
|------|-------|--------|-----|
| Fields | Over 60% of custom fields actively used; no duplicate-purpose fields on core objects | 30 to 60% actively used; a few duplicates | Under 30% actively used; duplicate-purpose fields on core objects |
| Automations | Full inventory exists with owners; no conflicts; no dead automations firing | Inventory incomplete; 1 or 2 suspected conflicts | No inventory; confirmed conflicting writes; cascade chains over 2 hops |
| Permissions | 5 or fewer admin users; no orphaned licenses; profiles consolidated | Some single-user profiles; a few orphaned licenses | Uncounted admins; departed users active; field security inconsistent |
| Reports | Under 25% of reports stale at 90 days; one source of truth per core metric | 25 to 60% stale | Over 60% stale; competing versions of core reports |
| Layouts | Core object layouts at 25 fields or fewer, workflow-ordered | 25 to 40 fields; some dead fields on layout | Over 40 fields; required fields being gamed |

## Remediation Plan

Order the fix list by risk first, then effort. Low-risk high-value work goes first so the audit produces visible wins in the first two weeks.

| Order | Work | Risk | Typical effort |
|-------|------|------|----------------|
| 1 | Archive stale reports and dashboards | Near zero, reversible | Hours |
| 2 | Deactivate dead automations (deactivate, do not delete, for 30 days) | Low | Hours to days |
| 3 | Remove orphaned licenses, consolidate single-user profiles | Low | Days |
| 4 | Trim page layouts to the target field count | Low to medium | Days |
| 5 | Merge duplicate-purpose fields: pick survivor, backfill, repoint references, hide loser | Medium | Weeks |
| 6 | Untangle conflicting automations and cascade chains | High, needs testing in sandbox | Weeks |
| 7 | Delete fields hidden for 90-plus days with no complaints | Medium, destructive | Hours, after the waiting period |

Common mistakes:

- Deleting instead of archiving on the first pass. Hide or deactivate, wait a full month-end and quarter-end cycle, then delete.
- Auditing fields without checking integration references. The field with a 0% human edit rate may be the one the warehouse sync depends on.
- Trusting stakeholder memory over usage data, or the reverse. You need both; usage data misses the annual process, interviews miss the abandoned one.
- Fixing while auditing. Every mid-audit change invalidates the baseline you are trying to establish.
- Skipping the sandbox for automation changes because "it is just one flow."

## Output Format

Produce a CRM audit report with these sections:

1. **Scorecard**: one table, areas down the side, red/yellow/green with the one-line reason for each score.
2. **Findings by area**: field audit table per object (field, fill rate, last populated, references, verdict), automation inventory with flagged conflicts, permission findings, report graveyard counts, layout assessment.
3. **Remediation plan**: the ordered table above, populated with this org's specific items, each with an owner and a target date.
4. **Re-audit date**: propose re-running the scorecard in 6 months and state the thresholds used so the comparison is honest.

Deliver as a markdown document. If the user wants a working checklist, also produce the remediation plan as a standalone task list.

## Related Skills

- **data-hygiene**: fixes the record-level quality problems this audit surfaces but does not remediate
- **crm-migration**: if the audit concludes the org is beyond repair, that skill covers when migration is actually justified
- **integrations**: for auditing the syncs that write into the CRM, which this audit only inventories
- **pipeline-hygiene**: the deal-level counterpart, covering stale opportunities and stage discipline
- **metrics-dictionary**: resolves the competing-report problem by defining each metric once
