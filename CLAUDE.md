# RevOps Skills

This repo is a library of revenue operations skills for AI agents. Each skill lives at `skills/<name>/SKILL.md` with frontmatter (`name`, `description`, `metadata.version`) followed by the skill body.

When editing or adding skills, match the house format:

1. **Before Starting**: check for `.agents/gtm-context.md` first, then list the context to gather. Never block on missing inputs.
2. **Core Principles**: 3 to 5 opinionated rules.
3. **Frameworks**: the substance. Tables, formulas, and concrete benchmark numbers. No vague qualifiers where a number can go.
4. **Output Format**: what the deliverable looks like.
5. **Related Skills**: cross-references that resolve to real skills in `skills/`.

Style rules for skill prose:

- No em dashes. Use commas, colons, or separate sentences.
- Spell out an abbreviation at first use in each skill, for example "annual contract value (ACV)".
- Vendor-neutral: name tools as examples, never pitch one.
- Plain sentences over rhetorical patterns. No setup-and-flip lines, no tidy closing restatements.
