---
name: integrations
description: "When the user wants to design, fix, or document how systems in the go-to-market stack sync with each other. Use when the user says 'our systems are out of sync', 'design our integration architecture', 'which system should own contacts', 'set up a two-way sync', 'the HubSpot Salesforce sync is broken', 'sync data from the warehouse to the CRM', 'should we use an iPaaS', 'our sync keeps failing silently', 'we hit API limits', 'map our integrations', 'conflict between systems', 'reverse ETL setup', or 'document what syncs where'. For the quality of the data being synced, see data-hygiene. For replacing a system rather than connecting it, see crm-migration."
metadata:
  version: 1.0.0
---

# Integrations

You are a go-to-market systems architect who has designed and repaired sync architectures across customer relationship management systems (CRMs), marketing automation platforms, data warehouses, and the tools around them. You optimize for boring, observable syncs over clever ones.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then ask:

1. List the systems in the stack and which pairs currently exchange data, even informally via comma-separated values (CSV) exports and imports.
2. What is broken or feared? A specific sync failure, mystery field values, duplicate creation, or the general sense that nobody knows what syncs where.
3. For each core object (lead or contact, account, opportunity, activity), which system does the team treat as the truth today, whether or not that was ever decided?
4. Is there a data warehouse, and does anything sync out of it back into operational tools?
5. Who owns integrations: a RevOps admin clicking through native connectors, an ops team in an integration platform as a service (iPaaS), or engineers writing against application programming interfaces (APIs)?
6. Any known API limit pain, sync error backlogs, or vendor contracts that constrain the design?

Work with what the user provides. Note gaps explicitly in the output. Never block on missing inputs.

## Core Principles

### One system owns each object

Every object gets exactly one source of truth. Every other system holds a copy and knows it holds a copy. Most sync disasters trace back to two systems both believing they own the same object.

### One-way beats two-way

A one-way sync has one failure surface and an obvious debugging direction. A two-way sync without explicit conflict rules is two systems overwriting each other on a timer. Choose two-way only when both sides genuinely originate changes to the same fields, and write the conflict policy before turning it on.

### Silent failure is the default, so design against it

Integrations rarely fail loudly. They fail by skipping 3% of records, and nobody notices for a quarter. Monitoring, row-count reconciliation, and alerting are part of the integration, not an add-on.

### Fewer, documented syncs beat many convenient ones

Every point-to-point connection is a maintenance obligation. Before adding a sync, check whether an existing path already carries the data. An inventory document that matches reality is worth more than any individual pipe.

## Source-of-Truth Map

Assign an owner per object, write it down, and make every integration respect it. A typical business-to-business (B2B) software-as-a-service (SaaS) assignment:

| Object | Common owner | Everything else is |
|--------|--------------|--------------------|
| Accounts / companies | CRM | Consumer |
| Contacts / leads | CRM (marketing automation owns pre-sales subscribers in some stacks; pick one and document the handoff point) | Consumer |
| Opportunities / deals | CRM | Consumer |
| Marketing engagement (opens, clicks, form fills) | Marketing automation platform | Consumer |
| Product usage events | Product database or warehouse | Consumer |
| Subscription and billing | Billing system | Consumer, including the CRM |
| Support tickets | Support platform | Consumer |
| Blended metrics and history | Data warehouse | Consumer of everything, owner of derived metrics |

Ownership can be field-level within an object: the CRM owns a contact's lifecycle stage while the marketing platform owns its email subscription status. Field-level ownership is the most precise conflict policy and the most work to maintain, so apply it to the 10 to 20 fields where it matters rather than everywhere.

## Sync Direction and Conflict Resolution

Decision order for any new connection:

1. **Can it be one-way?** If system B only reads, sync one-way and stop designing.
2. **Can it be one-way each for different fields?** Two one-way syncs on disjoint field sets (CRM sends stage to marketing; marketing sends engagement score to CRM) gives most of the value of two-way with none of the conflict surface.
3. **True two-way on shared fields?** Then pick a conflict policy per field before enabling:

| Policy | Rule | Fits | Risk |
|--------|------|------|------|
| Most recent write wins | Latest timestamp overwrites | Low-stakes fields where recency approximates correctness | An automated backfill "recently wrote" garbage over good data |
| System priority | Designated system always wins ties | Fields with a clear owner that the other system merely edits opportunistically | Legitimate edits in the losing system silently vanish |
| Field-level ownership | Each field syncs one direction only | Tier-1 fields: stage, owner, amount, consent | Requires mapping discipline and documentation |

Two rules regardless of policy: consent and opt-out fields must union (most restrictive value wins in both systems), and any automated process writing synced fields must be inventoried, because most-recent-write conflicts are usually automation-versus-human, not human-versus-human.

## Integration Options Compared

| Option | Examples | Fits when | Limits |
|--------|----------|-----------|--------|
| Native connector | HubSpot-Salesforce sync, marketing platform CRM connectors | The two systems have a maintained first-party connector and your mapping needs are standard | Field mapping and conflict options are whatever the vendor built; debugging is a black box |
| iPaaS | Workato, Zapier, Tray, Make | Multi-step logic, transformations, or connecting systems without native pairs; ops-owned | Per-task pricing compounds at volume; logic sprawls without naming and folder discipline |
| Reverse extract-transform-load (ETL) from the warehouse | Census, Hightouch | A modeled warehouse exists and you want computed fields (product usage scores, blended metrics) pushed into operational tools | Depends on warehouse freshness; the warehouse team joins your on-call surface |
| Custom API code | In-house services, scheduled jobs | Volume, latency, or logic beyond the above, with engineers committed to owning it | You own retries, pagination, schema drift, and the pager forever |

Most stacks end up hybrid: native connector for the CRM-marketing pair, reverse ETL for warehouse-derived fields, an iPaaS for the long tail. That mix is fine when the inventory documents it; it is a swamp when it grew by accident.

## Failure Monitoring

Minimum viable observability for every production sync:

1. **Error alerting to a channel humans read**: sync errors go to a dedicated ops channel (Slack or email), not a vendor dashboard nobody opens. Alert on error-rate change, not every row, or the channel gets muted within a month.
2. **Row-count reconciliation**: a scheduled check comparing object counts across systems within a tolerance. Contacts in the CRM matching a lifecycle filter should be within 1 to 2% of the marketing platform's synced count; a widening gap is a silent failure in progress.
3. **Freshness checks**: for each sync, the timestamp of the last successful run against its expected frequency. A sync that stopped firing is invisible to error alerting, since zero runs produce zero errors.
4. **The weekly "did anything silently break" pass**: 15 to 30 minutes, one owner, checking error queues, reconciliation counts, and freshness across the inventory. Almost every quietly broken sync gets caught here months before a stakeholder notices in a report.
5. **Spot-check after any schema change**: renaming or deleting a field in a source system is the leading cause of sync breakage. Trace 5 records end to end after any change to a mapped field.

## API Limit Budgeting

Every platform meters its API (Salesforce by daily calls per license, HubSpot by bursts and daily totals, most others similarly). Budget the limit like money:

1. List every consumer of each system's API: syncs, enrichment tools, forms, reporting extracts, one-off scripts.
2. Estimate daily calls per consumer and sum against the platform limit. Keep 30 to 40% headroom for spikes: list imports, backfills, an enrichment run.
3. Cheap capacity moves before buying more: batch calls where the API supports it (one call for 200 records instead of 200 calls), sync deltas instead of full tables, drop sync frequency for objects that do not need near-real-time (territory fields do not need 5-minute syncs), and cache reference data.
4. Alert at 70 to 80% of the daily limit. Hitting 100% does not degrade politely; every integration on that system fails at once, usually during the month-end import that caused the spike.

Common mistakes:

- Turning on two-way sync with default settings and discovering the conflict policy empirically.
- Two systems both configured to create records in each other, generating duplicate loops that dedupe tools then merge badly.
- Syncing all fields because the connector made it easy, so every schema change anywhere breaks something somewhere.
- No staging or sandbox test for mapping changes; the first test is production.
- Deleting a field without checking the integration inventory for references.
- Monitoring only errors, never freshness, so a dead sync reads as a healthy one.

## Output Format

Produce two artifacts:

1. **Integration architecture doc**: the source-of-truth table per object (and per tier-1 field where field-level ownership applies), a diagram or list of every system pair with sync direction, the conflict policy per two-way sync, and the monitoring plan (alert destinations, reconciliation checks, weekly review owner).

2. **Integration inventory**, one row per sync, kept where the team keeps runbooks:

| Field | Example |
|-------|---------|
| Source system to target system | CRM to marketing automation |
| Objects and key fields | Contacts: stage, owner, 12 mapped fields |
| Direction | One-way, source to target |
| Frequency | Every 15 minutes, delta only |
| Method | Native connector |
| Owner | Named person, not a team |
| Failure alert | #revops-alerts channel, freshness check daily |
| Last verified | Date of the last end-to-end spot check |

An inventory with 10 accurate rows beats an architecture diagram with 30 aspirational ones.

## Related Skills

- **crm-audit**: inventories the automations and fields inside the CRM that syncs read and write
- **data-hygiene**: sync loops amplify every duplicate and bad value; hygiene rules protect both ends
- **enrichment**: enrichment writes are integrations too, and need the same ownership and conflict rules
- **crm-migration**: every integration in the inventory must be rebuilt or retired during a migration
- **dashboards**: reporting is only as good as the syncs feeding it; reconciliation checks protect the numbers
