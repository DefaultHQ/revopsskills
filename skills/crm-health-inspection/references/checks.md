# Checks, scoring and field maps

## Scoring

- There are 5 stations, each worth 20 points. If a station has no data (e.g. no deals), it is n/a and the remaining stations rescale to 100.
- A station's points are split evenly across its applicable checks.
- Each check: `points = share * max(0, 1 - bad_rate / threshold)`. The threshold is the bad-rate at which the check scores zero.
- Placard: A 90+, B 80-89, C 70-79, CLOSED under 70.
- Severity of a citation: share of the check's points lost. Critical is ≥ 60%, major is ≥ 30%, minor is anything less.
- `[exact]` rates come from full-CRM counts in `raw/counts.json`. `[sample]` rates come from the pulled sample.

| key | station | threshold | bad when |
|---|---|---|---|
| acct_dupes | Dish Pit | 10% | excess records in high/medium account clusters (sample), or full-CRM exact duplicate websites, whichever is worse |
| contact_dupes | Dish Pit | 10% | excess records in high/medium contact clusters (sample), or full-CRM exact duplicate emails, whichever is worse |
| acct_missing_owner | Prep Line | 30% | no owner |
| acct_missing_domain | Prep Line | 40% | no domain or website |
| acct_missing_industry | Prep Line | 60% | no industry |
| acct_missing_employees | Prep Line | 60% | no employee count |
| contact_missing_email | Prep Line | 40% | no email |
| contact_missing_title | Prep Line | 60% | no title |
| opp_missing_amount | Prep Line | 40% | open deal, no amount |
| acct_stale | Walk-in Freezer | 90% | no activity in 365 days (last-modified only when the CRM has no activity field; bulk updates reset it) |
| contact_stale | Walk-in Freezer | 90% | no activity in 365 days |
| opp_past_close | Walk-in Freezer | 30% | open deal, close date in the past |
| opp_no_activity | Walk-in Freezer | 40% | open deal, no activity in 90 days |
| contact_orphan | Front of House | 30% | contact with no account |
| acct_inactive_owner | Front of House | 15% | owner deactivated |
| contact_inactive_owner | Front of House | 15% | owner deactivated |
| invalid_email | Pantry Labels | 5% | malformed email |
| role_email | Pantry Labels | 15% | info@, sales@, support@ ... |
| freemail_account | Pantry Labels | 10% | account domain is gmail.com etc. |
| junk_records | Pantry Labels | 3% | test, asdf, dummy, do not use ... |
| bad_casing | Pantry Labels | 20% | name ALL CAPS or all lowercase |
| domain_mismatch | Pantry Labels | 30% | contact email domain differs from account domain (non-freemail) |

## Matching

**Normalization:**
- Company names: diacritics stripped, `&` becomes `and`, punctuation removed, legal suffixes (inc, llc, ltd, corp, gmbh ...) dropped.
- Domains: lowercased, protocol, `www.` and path removed. The root is the label before the TLD (`acme` for acme.io and acme.co.uk).
- Emails: lowercased, `+tag` removed. Gmail dots are removed.
- Freemail domains never count as a match signal.

**Blocking (accounts):** records are compared only when they share a domain, a domain root, or the first 5 letters of the normalized name. Blocks larger than 200 are skipped.

**Account tiers:**
- **High** needs two signals: same domain plus matching name, or same name plus same domain root with a different TLD.
- **Medium** needs one strong signal: same name with one record missing a domain, or same domain root plus matching name.
- **Review** is a fuzzy-only lookalike name (Jaro-Winkler ≥ 0.93). It is listed but never costs points.
- **Possible subsidiary:** same domain but a different name (e.g. "Acme" vs "Acme Robotics"). It is capped at review and never merged.

**Contact tiers:**
- **High:** same canonical email and same name.
- **Medium:** same canonical email, or same first and last name at the same account or email domain.
- **Review:** lookalike name at the same company.

The duplicate rate is the number of excess records (cluster size minus 1, summed) divided by the sample size.

## Normalized record shape (raw/*.jsonl)

```
accounts.jsonl  {id, name, domain?, website?, owner_id, owner_active (true|false|null), industry, employees, last_activity?, last_modified}
contacts.jsonl  {id, first_name, last_name, email, title, account_id, account_domain?, owner_id, owner_active, last_activity?, last_modified}
opps.jsonl      {id, name, amount, close_date, is_closed, last_activity, last_modified, owner_id}   (open deals only)
counts.json     {crm, path, totals: {accounts, contacts, open_opps}, checks: {<key>: {bad, total}}}
```
Use null for unknown values. Use `owner_active: null` when owner status cannot be read; the inactive-owner checks then drop out instead of scoring as clean.

## MCP path (Default MCP, Salesforce or HubSpot)

1. `crm_schema` for each object (`account`/`company`, `contact`, `opportunity`/`deal`) to confirm field ids. Expected ids:
   - Salesforce: Account `Name, Website, OwnerId, Industry, NumberOfEmployees, LastModifiedDate`. Contact `FirstName, LastName, Email, Title, AccountId, OwnerId, LastModifiedDate`. Opportunity `Name, Amount, CloseDate, IsClosed, LastActivityDate, LastModifiedDate`.
   - HubSpot: company `name, domain, website, hubspot_owner_id, industry, numberofemployees, hs_lastmodifieddate`. contact `firstname, lastname, email, jobtitle, associatedcompanyid, hubspot_owner_id, lastmodifieddate`. deal `dealname, amount, closedate, hs_is_closed, notes_last_updated, hs_lastmodifieddate`.
2. **Totals and exact checks** with `crm_count`:
   - totals: no filter (deals: open only).
   - missing field: `{field, operator: "is_null"}`.
   - stale: activity field (`LastActivityDate` / `notes_last_updated`) `is_null` OR `less_than` <ISO date 365 days ago>. Do not use last-modified: bulk updates reset it.
   - exact dupes (Salesforce): excess = count of non-null Website minus distinct Website, and the same on Contact Email, if `crm_query`/`crm_count` can express it; otherwise rely on `crm_duplicates_scan` group counts.
   - open deals: Salesforce `IsClosed equals false`; HubSpot `hs_is_closed equals false`.
   - past close: open AND close date `less_than` today.
   - no activity: open AND (activity field `is_null` OR `less_than` 90 days ago).
   - orphan: account link `is_null`.

   Write each result into `counts.json` > `checks` as `{bad, total}`, and set `path: "mcp"` and `crm`.
3. **Sample:** `crm_query`, sorted by last-modified desc, limit 100, paged with `cursor` up to 500 accounts and 500 contacts, plus open deals up to 500. Map each row to the normalized shape and write the JSONL files with the Write tool.
4. **Owner status:** if the schema exposes no owner-active field, set `owner_active: null`.
5. `crm_duplicates_scan` (contact, then company, limit 100) gives exact-key groups across the whole CRM. Quote the group count in the Dish Pit narration as "exact duplicate groups across the full CRM". The scored rate still comes from the sample.

## Native path notes

- **Salesforce:** `sf data query --json`; COUNT() SOQL for every exact check; owner status from `Owner.IsActive`.
- **HubSpot:** search API. Totals over 10,000 are capped by HubSpot, so those checks fall back to sample rates. Deactivated owners come from `/crm/v3/owners?archived=true`.
- **Attio:** records query API with an unsorted sample, so every check is `[sample]`. Deals count as closed when their stage name contains won, lost or closed.
