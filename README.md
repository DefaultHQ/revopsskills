# RevOps Skills

32 revenue operations skills for AI agents. Works with Claude Code, Grok Build, Cursor, Codex, Windsurf, and any agent that supports the Agent Skills spec.

Each skill is a markdown file that gives an agent the frameworks, benchmarks, and output formats a senior RevOps operator would use, so "audit my funnel" produces a stage-by-stage diagnosis with real conversion benchmarks instead of generic advice.

Corey Haines' [marketingskills](https://github.com/coreyhaines31/marketingskills) covers marketing and includes one revops skill. This library is what that one skill looks like when you unpack it into a whole discipline.

## Install

**CLI (recommended):**

```bash
npx skills add DefaultHQ/revopsskills
```

**Claude Code plugin:**

```
/plugin marketplace add DefaultHQ/revopsskills
/plugin install revops-skills@revopsskills
```

**Grok Build:** Grok Build reads skills from `~/.grok/skills/` (and also from `~/.claude/skills/`), so either clone and copy:

```bash
git clone https://github.com/DefaultHQ/revopsskills.git
cp -r revopsskills/skills/* ~/.grok/skills/
```

or install for Claude Code as above and Grok Build will pick the skills up too. Invoke a skill by name, for example `/crm-health-inspection`.

**Manual:** clone the repo and copy `skills/` into your project's `.claude/skills/` (or your agent's equivalent). Git submodule and forking work the same way they would for any skills repo.

## Start here

Run `gtm-context` first. It interviews you once about your motion, segments, funnel definitions, stack, and targets, and writes `.agents/gtm-context.md`. Every other skill reads that file before asking questions.

## The skills

### Foundation

| Skill | What it does |
|-------|--------------|
| [gtm-context](skills/gtm-context/SKILL.md) | Captures your go-to-market in one file every other skill reads first |

### Funnel and lifecycle

| Skill | What it does |
|-------|--------------|
| [funnel-audit](skills/funnel-audit/SKILL.md) | Stage-by-stage conversion diagnosis, finds where deals die |
| [lifecycle-stages](skills/lifecycle-stages/SKILL.md) | Stage definitions, entry and exit criteria, ownership, service level agreements |
| [lead-scoring](skills/lead-scoring/SKILL.md) | Fit, intent, and negative scoring; building and back-testing a model |
| [lead-routing](skills/lead-routing/SKILL.md) | Speed-to-lead, routing methods, fairness audits |
| [handoffs](skills/handoffs/SKILL.md) | Marketing-to-sales and sales-to-CS handoffs, SLA design, leak measurement |

### Pipeline and forecasting

| Skill | What it does |
|-------|--------------|
| [pipeline-hygiene](skills/pipeline-hygiene/SKILL.md) | Stale deal detection, required fields by stage, close-date discipline |
| [forecasting](skills/forecasting/SKILL.md) | Forecast categories, methodology, accuracy tracking |
| [pipeline-coverage](skills/pipeline-coverage/SKILL.md) | Coverage ratios by segment, pacing against plan, gap-to-target math |
| [deal-inspection](skills/deal-inspection/SKILL.md) | Single-deal risk review from CRM fields and call notes |
| [win-loss](skills/win-loss/SKILL.md) | Program design, interview guides, a loss-reason taxonomy reps will actually use |

### CRM and data

| Skill | What it does |
|-------|--------------|
| [crm-audit](skills/crm-audit/SKILL.md) | Field sprawl, automation debt, permissions, the report graveyard |
| [crm-health-inspection](skills/crm-health-inspection/SKILL.md) | Read-only inspection of Salesforce, HubSpot or Attio data: a 0 to 100 hygiene score, cited violations, and a restaurant-style grade card. Runs a bundled Node 18+ script |
| [data-hygiene](skills/data-hygiene/SKILL.md) | Dedupe strategy, normalization rules, ongoing hygiene jobs |
| [enrichment](skills/enrichment/SKILL.md) | Waterfall design, provider evaluation, coverage and accuracy benchmarks |
| [integrations](skills/integrations/SKILL.md) | Sync architecture, source of truth per object, conflict resolution |
| [crm-migration](skills/crm-migration/SKILL.md) | Migration planning, field mapping, validation checklists |

### Planning and org design

| Skill | What it does |
|-------|--------------|
| [territory-design](skills/territory-design/SKILL.md) | Carving methods, balance scoring, re-carve cadence |
| [capacity-planning](skills/capacity-planning/SKILL.md) | Headcount math from pipeline targets, ramp curves, attrition buffer |
| [quota-comp](skills/quota-comp/SKILL.md) | Quota setting, comp plan design, sanity checks on quota-to-earnings ratios |
| [annual-planning](skills/annual-planning/SKILL.md) | Bottoms-up revenue model, targets by segment and source |
| [segmentation](skills/segmentation/SKILL.md) | Segment boundaries, ACV bands, routing and coverage implications |

### Metrics and reporting

| Skill | What it does |
|-------|--------------|
| [metrics-dictionary](skills/metrics-dictionary/SKILL.md) | Canonical definitions: CAC, NRR, GRR, magic number, pipeline velocity, payback |
| [attribution](skills/attribution/SKILL.md) | Model options, self-reported vs software attribution, when each one lies |
| [dashboards](skills/dashboards/SKILL.md) | Executive vs functional views, dashboards people actually open |
| [board-reporting](skills/board-reporting/SKILL.md) | Board-grade metric prep, cohort tables, narrative framing |

### Motion-specific ops

| Skill | What it does |
|-------|--------------|
| [outbound-ops](skills/outbound-ops/SKILL.md) | Sequencer setup, deliverability, sending domain infrastructure |
| [inbound-ops](skills/inbound-ops/SKILL.md) | Forms, scheduling, qualification flow, form-to-meeting conversion |
| [renewals-expansion](skills/renewals-expansion/SKILL.md) | Renewal pipeline ops, churn forecasting, net revenue retention motion design |
| [deal-desk](skills/deal-desk/SKILL.md) | Approval tiers, discount governance, quote-to-cash |

### AI in RevOps

| Skill | What it does |
|-------|--------------|
| [ai-gtm-audit](skills/ai-gtm-audit/SKILL.md) | Where AI agents fit in a GTM stack, build vs buy, evaluation criteria |
| [call-insights](skills/call-insights/SKILL.md) | Mining call recordings for pipeline risk, objections, and product feedback |

## Usage

Invoke a skill directly (`/funnel-audit`, `/pipeline-coverage`) or just describe the task; agents match skills from the description. Skills are vendor-neutral. They name tools like Salesforce, HubSpot, Gong, and Clay as examples, never as recommendations you have to follow.

## Author

Built by [Stan Rymkiewicz](https://github.com/stan-default), Head of Growth at [Default](https://default.com). MIT licensed. PRs welcome, especially benchmark corrections from people with better data.
