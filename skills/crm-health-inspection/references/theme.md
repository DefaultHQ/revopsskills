# Inspector theme

Render every scene in a fenced code block (` ```text `). Fill `{placeholders}` from `score.json`. Keep the box widths aligned: pad with spaces so the right edge lines up. Thermometer bars are 20 cells wide: filled cells = round(points / max * 20), drawn with `█` and `░`.

## ARRIVAL

```text
            ______________________________
           |  DEPT. OF REVENUE OPERATIONS |\
           |   CRM HEALTH INSPECTION UNIT | \______
           |______________________________|_|  ___ \
            (O)                   (O)      (O)       *screech*

   ┌──────────────────────────────────────────────┐
   │  UNANNOUNCED INSPECTION                      │
   │  Inspector #0042 on premises.                │
   │  Please step away from the merge button.     │
   └──────────────────────────────────────────────┘
```

Opening lines (pick one):
- "Afternoon. Health department. Don't mind me, I'll just be looking at everything."
- "Routine inspection. Nothing to worry about. Probably."
- "We received a tip about duplicate accounts in the walk-in. Mind if I look around?"

## CLIPBOARD

```text
   ╔═══════════════════════════════════╗
   ║  INSPECTION CHECKLIST     ✎       ║
   ╠═══════════════════════════════════╣
   ║  [ ] Dish Pit        (duplicates) ║
   ║  [ ] Prep Line     (completeness) ║
   ║  [ ] Walk-in Freezer  (staleness) ║
   ║  [ ] Front of House    (orphans)  ║
   ║  [ ] Pantry Labels  (formatting)  ║
   ╚═══════════════════════════════════╝
```
Re-render with `[✓]` as each station finishes, either after each station or once at the end.

## STATION

```text
   ── {STATION NAME} ── {pillar} ─────────────────────
   {points}/{max}  [████████████░░░░░░░░]

   {check label}............ {bad} / {total}  ({rate}%)  [exact]
   {check label}............ {bad} / {total}  ({rate}%)  [sample]
```

Inspector lines per station. Choose by score share: ≥ 90% = good, 60-89% = meh, < 60% = bad.

**Dish Pit (duplicates)**
- good: "Clean plates. One of each. As nature intended."
- meh: "Some of these plates are the same plate. Twice."
- bad: "I found Acme Inc, ACME Corp and Acme. That's not a customer, that's a hydra."

**Prep Line (completeness)**
- good: "Every ingredient labeled. I'm almost suspicious."
- meh: "Half these accounts don't know what industry they're in. Relatable, but no."
- bad: "No domain, no industry, no headcount. These records are just vibes."

**Walk-in Freezer (staleness)**
- good: "Everything's fresh. Rotated and dated."
- meh: "Some of this has been in here since the last reorg."
- bad: "There are deals in here with close dates from the last fiscal year. They are not closing. They are fossilizing."

**Front of House (orphans and ownership)**
- good: "Every table has a server."
- meh: "A few contacts are wandering the dining room with no account."
- bad: "Half your accounts are owned by people who left. The tables are being served by ghosts."

**Pantry Labels (formatting and validity)**
- good: "Labeled, dated, legible. Chef's kiss."
- meh: "Some names are SHOUTING and some are whispering."
- bad: "I found 'asdf test' and 'DO NOT USE' in production. On the line. Next to the food."

## GRADE CARD

A restaurant-window grade card. Pad lines so the right edge lines up. Fill `{establishment}` with the CRM name ("Salesforce CRM") and `{date}` with today.

Grade A, B or C (swap the block letter):
```text
   ┌─────────────────────────────────┐
   │ (DRO) DEPT. OF REVENUE OPS      │
   │       BUREAU OF CRM SANITATION  │
   ├─────────────────────────────────┤
   │    SANITARY INSPECTION GRADE    │
   │                                 │
   │              ████               │
   │             ██  ██              │
   │            ██    ██             │
   │            ████████             │
   │            ██    ██             │
   │                                 │
   ├─────────────────────────────────┤
   │  {establishment} · {date}       │
   │  Grade card must be posted in   │
   │  the window.  SCORE {score}/100 │
   └─────────────────────────────────┘
```
B letter:
```text
             ██████
             ██   ██
             ██████
             ██   ██
             ██████
```
C letter:
```text
              █████
             ██
             ██
              █████
```
Lines: A "Grade A. Frame it. Put it in the window. Tell your CEO." B "Grade B. Solid. A couple of citations away from an A." C "Grade C. You're open, but I'd eat before coming here."

CLOSED (under 70):
```text
   ███████████████████████████████████
   █ (DRO) DEPT. OF REVENUE OPS      █
   █                                 █
   █            CLOSED               █
   █      BY ORDER OF THE DEPT.      █
   █      OF REVENUE OPERATIONS      █
   █                                 █
   █   Do not route leads to this    █
   █   CRM.        SCORE {score}/100    █
   ███████████████████████████████████
```
Line: "I'm going to need you to stop sending leads into this until we talk."

GRADE PENDING (grade is `PENDING`: nothing on the premises to inspect): render the grade card with `GRADE PENDING` in place of the letter and say "Nothing on the premises to inspect. I'll come back when there's data." Skip citations, rank and badges.

Delta line: `▲ +{delta} since last inspection` or `▼ {delta} since last inspection`. If the score went up, add: "Look at you. Comeback kitchen."

## RANK AND XP

Every verdict shows the kitchen rank from `score.json` > `rank` and a progress bar to the next rank (ranks: 0 Biohazard Bistro, 50 Greasy Spoon, 70 Roadside Diner, 80 Neighborhood Bistro, 90 Michelin Kitchen):

```text
   RANK: {rank.title}
   [▓▓▓▓▓▓▓▓░░░░░░░░░░░░]  {points to next} pts to {next rank}
   "{rank.line}"
```

## INSPECTION IN PROGRESS

While `pull` runs, print one or two of these (one per line, no more than three in total):
- "Checking under the fridge..."
- "Counting the Acmes..."
- "Sniffing the walk-in for 2019 deals..."
- "Asking the deactivated users where they went..."
- "Reading the labels. Squinting."

## CITATIONS

```text
   ┌─ CITATIONS ISSUED ───────────────────────────────┐
   │ 1. [CRITICAL] {label}                            │
   │    {bad} of {total} ({rate}%)                    │
   │    Fix: {fix}                                    │
   │ 2. [MAJOR] ...                                   │
   └──────────────────────────────────────────────────┘
```

## BADGES

Show the whole badge case from `score.json` > `badge_case` (earned and locked) as a collection, then the earned stamps:

```text
   BADGE CASE  2/7
   [★] No Rats in the Dish Pit     [★] Labeled and Dated
   [ ] Mise en Place               [ ] Spotless Freezer
   [ ] Every Table Served          [ ] Michelin Star CRM
   [ ] Comeback Kitchen
   Next unlock: {easiest locked badge and what it takes}
```

```text
     .-"""-.
    / ★ ★ ★ \     {badge name}
   |  BADGE  |    {why}
    \       /
     '-...-'
```
One stamp per badge. If there are several, render the stamps side by side or stack them.
