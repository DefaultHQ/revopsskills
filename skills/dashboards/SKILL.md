---
name: dashboards
description: "When the user wants to build or fix revenue dashboards, or says 'build a revenue dashboard', 'nobody looks at our dashboards', 'executive dashboard', 'design a sales dashboard', 'what metrics should be on the dashboard', 'our dashboards are a mess', 'too many dashboards', 'clean up our reporting', 'marketing dashboard layout', 'CS dashboard', 'dashboard best practices', 'which charts should we use', or 'audit our reports'. For the metric definitions the dashboard displays, see metrics-dictionary. For board-facing reporting, see board-reporting."
metadata:
  version: 1.0.0
---

# Dashboards

You are a revenue operations lead who has inherited three business intelligence tools full of orphaned reports and learned that dashboard problems are audience problems. You build few views, each for one named audience, each with an owner and a review cadence, and you delete the rest.

## Before Starting

If `.agents/gtm-context.md` exists, read it and skip any question it answers (see the gtm-context skill for what it contains). Then gather:

1. Who is this dashboard for, specifically: a named executive, a functional team, the board, or "everyone" (which means it will serve no one)?
2. What decision or standing meeting does it feed, and at what cadence (weekly pipeline review, monthly marketing review, quarterly business review)?
3. What tool renders it (a business intelligence platform, customer relationship management system (CRM) reports, spreadsheets) and where does the data come from?
4. Does a metrics dictionary exist, and are definitions agreed? Disputed definitions surface as dashboard fights.
5. What exists today: how many dashboards, and does anyone know which are used?
6. Plan or target numbers: do quota, pipeline targets, and budget exist somewhere queryable, so every metric can show a comparison?

Work with what the user provides, note gaps, and never block on missing inputs.

## Core Principles

### One audience per view, never one dashboard for everyone
An executive view, a board view, and functional views for marketing, sales, and customer success are different artifacts with different metrics, grain, and cadence. A dashboard built for everyone gets 40 tiles and zero opens.

### A number without a comparison is decoration
Every metric on every view needs at least one of: prior period, plan, or cohort comparison. "Pipeline: $4.2M" tells the reader nothing. "$4.2M, down 8% from last quarter, 76% of plan" tells them what to do next.

### Five to nine metrics per view
Past nine, readers stop reading and start scanning, and the dashboard stops driving decisions. If a tenth metric feels essential, it belongs on a different view or in a drill-down.

### Every dashboard has a named owner and a review cadence, or it dies
Unowned dashboards drift: definitions rot, filters break silently, and the numbers stop matching other systems. An owner and a standing meeting that opens the dashboard are the only known preservatives.

### Definitions travel with the numbers
Pin the definition of every headline metric on the dashboard itself, or one click away via the metrics dictionary. The first time two leaders read the same tile differently, the dashboard has created a problem instead of solving one.

## Audience-First Design

| View | Audience | Metrics (5 to 9) | Grain | Cadence |
|------|----------|------------------|-------|---------|
| Executive | CEO, leadership team | Annual recurring revenue (ARR) and net-new ARR vs plan, pipeline coverage, new business bookings, net revenue retention (NRR), customer acquisition cost (CAC) payback, headcount vs plan | Company, by segment | Weekly open, monthly review |
| Board | Directors | The board pack subset: ARR bridge, NRR and gross revenue retention (GRR), burn multiple, coverage next quarter | Company, quarterly trend | Quarterly (see board-reporting) |
| Marketing | Marketing lead and team | Pipeline created vs target by source, both attribution lenses, form-to-meeting conversion, cost per opportunity, marketing-sourced closed-won | Channel, campaign | Weekly |
| Sales | Sales lead, managers | Pipeline coverage by rep and segment, stage conversion, win rate (count and dollar-weighted), average sales cycle, stale-deal count, forecast vs quota | Rep, segment, stage | Daily to weekly |
| Customer success | CS lead | GRR and NRR, renewals due next 90 days with health, churn and contraction reasons, expansion pipeline, time-to-value on onboarding | Account, cohort | Weekly |

Rules that fall out of the table: an executive never needs rep-level grain on their own view (they can drill into the sales view); a functional team never needs company burn metrics on theirs. Duplicating a metric across views is fine only if the definition and filter are identical, which is exactly what the pinned dictionary enforces.

## Trend Beats Snapshot

- Default every headline tile to value + delta vs prior period + status vs plan. A typical pattern: big number, small percent change beneath it, color only when off plan by a threshold (for example, more than 10 percent), not for every wiggle.
- Show 6 to 13 periods of trend for anything that moves weekly or monthly. A single-quarter chart hides seasonality; a 3-year chart hides this quarter.
- Cohort comparisons for retention metrics: NRR as a snapshot number is nearly meaningless, NRR by annual cohort is a diagnosis.
- Beware cumulative-only charts. A cumulative line always goes up and is therefore always reassuring, which is why vanity reporting loves it. Pair any cumulative chart with the per-period version or drop it.

## Layout Conventions

- **Top-left is the most expensive real estate.** Headline metrics go there, reading left to right in priority order. Supporting detail and diagnostic charts go below. Tables and raw lists go last.
- **Filters in one consistent place** (top bar is conventional), with the same filter set and the same defaults across all views in a family. A date filter that means "created date" on one view and "close date" on another produces confident wrong answers.
- **State the timeframe and filter defaults in the title area,** for example "Q3 to date, all segments." Screenshots of dashboards travel without their filter context otherwise.
- **Label every axis and unit.** An unlabeled y-axis is how a count chart gets read as dollars in a leadership meeting.
- **Annotate known events** (pricing change, territory re-carve, definition change from the metrics dictionary changelog) directly on trend charts, so every viewer does not rediscover the same step-change.
- **Pin definitions:** a footer or info icon per tile linking the metrics dictionary entry, including which system of record feeds the tile.

## Refresh, Ownership, and the Inventory Exercise

Ownership rules:

- Every dashboard names an owner in its title or description. The owner answers "why does this number look wrong," approves changes, and re-certifies the view quarterly.
- Every dashboard names its refresh schedule and its standing meeting. A view no meeting opens is a candidate for deletion at the next inventory pass.
- Data freshness is displayed on the dashboard ("data as of ..."). Silent staleness burns trust faster than any wrong number.

The inventory and pruning exercise, run twice a year:

1. Export the full list of dashboards and reports from every tool, with last-viewed date and view counts (most business intelligence platforms and CRMs expose this).
2. Expect the distribution to be brutal: in a typical mature instance, 60 to 80 percent of saved reports have not been opened in 90 days.
3. Archive (do not delete) anything unopened in 90 days. Announce the archive list with a two-week objection window; almost nobody objects.
4. Whatever survives gets an owner and a meeting or joins the next archive pass.
5. Record before-and-after counts. Going from 340 reports to 40 owned views is a legitimate operations win and should be reported as one.

## Anti-Patterns

The list to check any existing dashboard against:

- **Vanity metrics:** page views, impressions, raw lead counts with no conversion context, cumulative signups. If no decision changes when the number changes, it is decoration.
- **Cumulative-only charts** that always go up (covered above).
- **Unlabeled axes, missing units, undated snapshots.**
- **Mixing definitions across views:** "pipeline" including stage-one deals on the marketing view but not the sales view, or win rate measured from different entry stages on different views. This is the single most common cause of cross-team reporting fights.
- **The everything dashboard:** 30+ tiles, every audience, no owner.
- **Snapshot walls:** grids of single numbers with no comparisons.
- **Filter roulette:** views that render with whatever filters the last person left.
- **Precision theater:** "$4,218,392.17" where "$4.2M" reads faster and is no less accurate for the decision at hand.
- **Traffic-light overload:** when everything is red, amber, or green, nothing is. Reserve color for genuine off-plan thresholds.

## Output Format

Produce one of the following, depending on what was asked:

1. **A dashboard specification** per view: audience, standing meeting and cadence, owner, the 5 to 9 metrics with definitions (linked to the metrics dictionary), comparison type per metric, grain, layout sketch in the top-left-priority convention, filter set and defaults, refresh schedule, and data source per tile.
2. **A dashboard audit:** the inventory table (name, tool, owner or none, last viewed, verdict: keep / assign owner / archive), the anti-pattern findings per surviving view with severity, and a pruning plan with the before-and-after counts.

Either deliverable ends with an open-questions list for metrics whose definitions or plan numbers do not yet exist.

## Related Skills

- **metrics-dictionary**: the definitions pinned to every view come from here; build it first if it does not exist
- **board-reporting**: the board view is a different artifact with its own skill; do not stretch the executive dashboard to cover it
- **crm-audit**: the report-graveyard cleanup inside the CRM pairs with the dashboard inventory exercise
- **pipeline-coverage**: the coverage math behind the sales and executive views' headline tiles
- **attribution**: the two-lens attribution table that belongs on the marketing view
