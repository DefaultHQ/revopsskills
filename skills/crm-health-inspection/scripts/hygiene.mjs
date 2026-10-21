#!/usr/bin/env node
// CRM Hygiene Inspection. Read-only. Zero dependencies, Node 18+.
//
//   node hygiene.mjs pull  --crm salesforce|hubspot|attio [--org <sf alias>] [--sample 2000] [--out ./crm-inspection-report]
//   node hygiene.mjs score [--out ./crm-inspection-report]
//   node hygiene.mjs card  [--out ./crm-inspection-report]
//
// Report dir layout:
//   raw/accounts.jsonl, raw/contacts.jsonl, raw/opps.jsonl   normalized records (see references/checks.md)
//   raw/counts.json                                          exact counts that override sample rates
//   score.json, scorecard.html, history.json

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DAY = 86_400_000;

// ---------- normalizers ----------

export const FREEMAIL = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com", "hotmail.com", "hotmail.co.uk",
  "outlook.com", "live.com", "msn.com", "aol.com", "icloud.com", "me.com", "mac.com", "proton.me",
  "protonmail.com", "gmx.com", "gmx.de", "web.de", "mail.com", "yandex.com", "yandex.ru", "zoho.com",
  "qq.com", "163.com", "126.com", "comcast.net", "att.net", "verizon.net", "fastmail.com", "hey.com",
]);

const ROLE_LOCALS = new Set([
  "info", "sales", "support", "admin", "hello", "contact", "marketing", "billing", "office", "team",
  "help", "noreply", "no-reply", "accounts", "finance", "hr", "jobs", "careers", "press", "webmaster",
]);

const LEGAL_SUFFIXES = new Set([
  "inc", "incorporated", "llc", "ltd", "limited", "corp", "corporation", "co", "company", "gmbh", "ag",
  "sa", "sas", "sarl", "bv", "nv", "plc", "pty", "srl", "spa", "oy", "ab", "as", "aps", "kk", "lp", "llp",
  "pllc", "pc", "holdings", "group", "the",
]);

const MULTI_PART_TLDS = new Set(["co.uk", "org.uk", "ac.uk", "com.au", "net.au", "co.nz", "co.jp", "com.br", "co.in", "com.mx", "co.za", "com.sg"]);

const JUNK_RE = /\b(test|testing|asdf|qwerty|dummy|fake|sample|xxx+|delete|do not use|dnu|n\/a|unknown|none)\b/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function normDomain(v) {
  if (!v) return "";
  let d = String(v).trim().toLowerCase();
  if (d.includes("@")) d = d.split("@").pop();
  d = d.replace(/^[a-z]+:\/\//, "").replace(/^www\d?\./, "");
  d = d.split(/[/?#:\s]/)[0];
  return d.includes(".") ? d : "";
}

// "acme" for acme.com, acme.io, acme.co.uk
export function domainRoot(domain) {
  const d = normDomain(domain);
  if (!d) return "";
  const parts = d.split(".");
  const lastTwo = parts.slice(-2).join(".");
  if (MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3) return parts[parts.length - 3];
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
}

export function normName(v) {
  if (!v) return "";
  const words = String(v)
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/).filter(Boolean);
  while (words.length > 1 && LEGAL_SUFFIXES.has(words[words.length - 1])) words.pop();
  while (words.length > 1 && words[0] === "the") words.shift();
  return words.join(" ");
}

export function canonEmail(v) {
  if (!v) return "";
  const e = String(v).trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return "";
  let [local, domain] = [e.slice(0, e.lastIndexOf("@")), e.slice(e.lastIndexOf("@") + 1)];
  local = local.split("+")[0];
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
    domain = "gmail.com";
  }
  return `${local}@${domain}`;
}

export function jaroWinkler(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const range = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const am = new Array(a.length).fill(false);
  const bm = new Array(b.length).fill(false);
  let m = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = Math.max(0, i - range); j < Math.min(b.length, i + range + 1); j++) {
      if (!bm[j] && a[i] === b[j]) { am[i] = bm[j] = true; m++; break; }
    }
  }
  if (!m) return 0;
  let t = 0;
  for (let i = 0, k = 0; i < a.length; i++) {
    if (!am[i]) continue;
    while (!bm[k]) k++;
    if (a[i] !== b[k]) t++;
    k++;
  }
  const jaro = (m / a.length + m / b.length + (m - t / 2) / m) / 3;
  let p = 0;
  while (p < 4 && a[p] === b[p]) p++;
  return jaro + p * 0.1 * (1 - jaro);
}

class UnionFind {
  constructor() { this.p = new Map(); }
  find(x) {
    if (!this.p.has(x)) this.p.set(x, x);
    let r = x;
    while (this.p.get(r) !== r) r = this.p.get(r);
    while (this.p.get(x) !== r) { const n = this.p.get(x); this.p.set(x, r); x = n; }
    return r;
  }
  union(a, b) { this.p.set(this.find(a), this.find(b)); }
}

const MAX_BLOCK = 200;

function blockPairs(records, keyFns) {
  const seen = new Set();
  const pairs = [];
  for (const keyFn of keyFns) {
    const blocks = new Map();
    for (const r of records) {
      const k = keyFn(r);
      if (!k) continue;
      if (!blocks.has(k)) blocks.set(k, []);
      blocks.get(k).push(r);
    }
    for (const group of blocks.values()) {
      if (group.length < 2 || group.length > MAX_BLOCK) continue;
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const key = group[i].id < group[j].id ? `${group[i].id}|${group[j].id}` : `${group[j].id}|${group[i].id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          pairs.push([group[i], group[j]]);
        }
      }
    }
  }
  return pairs;
}

function clustersFrom(edges, byId) {
  const uf = new UnionFind();
  for (const e of edges) uf.union(e.a, e.b);
  const groups = new Map();
  for (const e of edges) {
    const root = uf.find(e.a);
    if (!groups.has(root)) groups.set(root, { ids: new Set(), tier: "medium", reasons: new Set(), possible_subsidiary: false });
    const g = groups.get(root);
    g.ids.add(e.a); g.ids.add(e.b);
    if (e.tier === "high") g.tier = "high";
    e.reasons.forEach((x) => g.reasons.add(x));
  }
  return [...groups.values()].map((g) => ({
    tier: g.tier,
    reasons: [...g.reasons],
    records: [...g.ids].map((id) => byId.get(id)),
  }));
}

// Same company name? Exact after normalization, or a close spelling. A name that is the other
// name plus extra words ("acme" vs "acme robotics") is a subsidiary signal, not a match.
function namesMatch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const ta = a.split(" ");
  const tb = b.split(" ");
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  if (short.length !== long.length && short.every((t) => long.includes(t))) return false;
  return jaroWinkler(a, b) >= 0.92;
}

// Tiers: high = corroborated (two independent signals); medium = one strong exact signal;
// review = fuzzy-only. Review pairs are shown but never cost points. Shared domain with a
// clearly different name is flagged possible_subsidiary and capped at review.
export function matchAccounts(accounts) {
  const recs = accounts.map((a) => {
    const domain = normDomain(a.domain || a.website);
    const free = FREEMAIL.has(domain);
    return { ...a, _domain: free ? "" : domain, _root: free ? "" : domainRoot(domain), _name: normName(a.name) };
  });
  const byId = new Map(recs.map((r) => [r.id, r]));
  const pairs = blockPairs(recs, [
    (r) => r._domain,
    (r) => r._root,
    (r) => (r._name ? r._name.replace(/ /g, "").slice(0, 5) : ""),
  ]);
  const edges = [];
  const review = [];
  for (const [a, b] of pairs) {
    const sameDomain = a._domain && a._domain === b._domain;
    const sameRoot = !sameDomain && a._root && a._root === b._root && a._root.length >= 3;
    const nameExact = a._name && a._name === b._name;
    const sim = jaroWinkler(a._name, b._name);
    const nameMatch = namesMatch(a._name, b._name);
    const reasons = [];
    let tier = null;
    if (sameDomain && nameMatch) { tier = "high"; reasons.push("same domain", "matching name"); }
    else if (sameDomain) { review.push({ a, b, reasons: ["same domain", "different name"], possible_subsidiary: true }); continue; }
    else if (nameExact && sameRoot) { tier = "high"; reasons.push("same name", "same domain root, different TLD"); }
    else if (nameExact && (!a._domain || !b._domain)) { tier = "medium"; reasons.push("same name", "one record missing domain"); }
    else if (sameRoot && nameMatch) { tier = "medium"; reasons.push("same domain root, different TLD", "similar name"); }
    else if (sim >= 0.93) { review.push({ a, b, reasons: [`lookalike name (${sim.toFixed(2)})`] }); continue; }
    if (tier) edges.push({ a: a.id, b: b.id, tier, reasons });
  }
  return { clusters: clustersFrom(edges, byId), review };
}

export function matchContacts(contacts) {
  const recs = contacts.map((c) => {
    const email = canonEmail(c.email);
    const domain = email ? email.split("@")[1] : "";
    return {
      ...c,
      _email: email,
      _domain: FREEMAIL.has(domain) ? "" : domain,
      _first: normName(c.first_name),
      _last: normName(c.last_name),
    };
  });
  const byId = new Map(recs.map((r) => [r.id, r]));
  const pairs = blockPairs(recs, [
    (r) => r._email,
    (r) => (r._last && r._first ? `${r._last}|${r._first[0]}` : ""),
  ]);
  const edges = [];
  const review = [];
  for (const [a, b] of pairs) {
    const sameEmail = a._email && a._email === b._email;
    const sameName = a._first && a._last && a._first === b._first && a._last === b._last;
    const sameOrg = (a.account_id && a.account_id === b.account_id) || (a._domain && a._domain === b._domain);
    if (sameEmail) edges.push({ a: a.id, b: b.id, tier: sameName || !a._last ? "high" : "medium", reasons: ["same email"] });
    else if (sameName && sameOrg) edges.push({ a: a.id, b: b.id, tier: "medium", reasons: ["same name", "same company"] });
    else if (sameOrg && jaroWinkler(`${a._first} ${a._last}`, `${b._first} ${b._last}`) >= 0.93) {
      review.push({ a, b, reasons: ["lookalike name", "same company"] });
    }
  }
  return { clusters: clustersFrom(edges, byId), review };
}

// ---------- scoring ----------

// threshold = the bad-rate at which a check scores zero. Linear in between.
export const CHECKS = [
  { key: "acct_dupes", station: "dish_pit", label: "Duplicate accounts", threshold: 0.1, fix: "Merge the High clusters first; they have two matching signals." },
  { key: "contact_dupes", station: "dish_pit", label: "Duplicate contacts", threshold: 0.1, fix: "Merge same-email contacts; review same-name pairs at the same company." },
  { key: "acct_missing_owner", station: "prep_line", label: "Accounts with no owner", threshold: 0.3, fix: "Assign owners or route them to a holding queue." },
  { key: "acct_missing_domain", station: "prep_line", label: "Accounts with no domain/website", threshold: 0.4, fix: "Backfill domains; they are the key for matching and routing." },
  { key: "acct_missing_industry", station: "prep_line", label: "Accounts with no industry", threshold: 0.6, fix: "Enrich industry so segmentation works." },
  { key: "acct_missing_employees", station: "prep_line", label: "Accounts with no employee count", threshold: 0.6, fix: "Enrich headcount so territories and tiers work." },
  { key: "contact_missing_email", station: "prep_line", label: "Contacts with no email", threshold: 0.4, fix: "Enrich or archive contacts you cannot reach." },
  { key: "contact_missing_title", station: "prep_line", label: "Contacts with no title", threshold: 0.6, fix: "Enrich titles so persona targeting works." },
  { key: "opp_missing_amount", station: "prep_line", label: "Open deals with no amount", threshold: 0.4, fix: "Require amount at the first committed stage." },
  { key: "acct_stale", station: "freezer", label: "Accounts with no activity in 365+ days", threshold: 0.9, fix: "Archive or re-engage; old records dilute every report." },
  { key: "contact_stale", station: "freezer", label: "Contacts with no activity in 365+ days", threshold: 0.9, fix: "Re-verify emails before anyone sequences them." },
  { key: "opp_past_close", station: "freezer", label: "Open deals past their close date", threshold: 0.3, fix: "Push or close them; they inflate the forecast." },
  { key: "opp_no_activity", station: "freezer", label: "Open deals with no activity in 90 days", threshold: 0.4, fix: "Close out zombie deals or log the next step." },
  { key: "contact_orphan", station: "front_of_house", label: "Contacts with no account", threshold: 0.3, fix: "Associate by email domain; orphans break account-level reporting." },
  { key: "acct_inactive_owner", station: "front_of_house", label: "Accounts owned by deactivated users", threshold: 0.15, fix: "Reassign everything owned by people who left." },
  { key: "contact_inactive_owner", station: "front_of_house", label: "Contacts owned by deactivated users", threshold: 0.15, fix: "Reassign everything owned by people who left." },
  { key: "invalid_email", station: "pantry", label: "Malformed emails", threshold: 0.05, fix: "Fix or clear them; they bounce and hurt sender reputation." },
  { key: "role_email", station: "pantry", label: "Role emails (info@, sales@)", threshold: 0.15, fix: "Swap for a named person where you can." },
  { key: "freemail_account", station: "pantry", label: "Accounts keyed on a freemail domain", threshold: 0.1, fix: "Replace gmail.com style domains with the real company domain." },
  { key: "junk_records", station: "pantry", label: "Test and junk records", threshold: 0.03, fix: "Delete test, asdf and dummy records." },
  { key: "bad_casing", station: "pantry", label: "ALL CAPS or lowercase names", threshold: 0.2, fix: "Title-case names before they land in an email greeting." },
  { key: "domain_mismatch", station: "pantry", label: "Contact email domain differs from account domain", threshold: 0.3, fix: "Check for job changers and mis-associated contacts." },
];

export const STATIONS = {
  dish_pit: { name: "Dish Pit", pillar: "Duplicates & matching" },
  prep_line: { name: "Prep Line", pillar: "Completeness" },
  freezer: { name: "Walk-in Freezer", pillar: "Staleness" },
  front_of_house: { name: "Front of House", pillar: "Orphans & ownership" },
  pantry: { name: "Pantry Labels", pillar: "Formatting & validity" },
};

export const ALL_BADGES = [
  { id: "no_rats", name: "No Rats in the Dish Pit", why: "Zero high-confidence duplicates", glyph: "R" },
  { id: "mise_en_place", name: "Mise en Place", why: "Prep Line at full marks", glyph: "M" },
  { id: "spotless_freezer", name: "Spotless Freezer", why: "Walk-in Freezer at full marks", glyph: "F" },
  { id: "every_table_served", name: "Every Table Served", why: "Front of House at full marks", glyph: "T" },
  { id: "labeled_and_dated", name: "Labeled and Dated", why: "Pantry Labels at full marks", glyph: "L" },
  { id: "michelin", name: "Michelin Star CRM", why: "Score 90 or higher", glyph: "*" },
  { id: "comeback_kitchen", name: "Comeback Kitchen", why: "Beat your last inspection", glyph: "+" },
];

export const RANKS = [
  { min: 90, title: "Michelin Kitchen", line: "Frame the grade card. Tell your CEO." },
  { min: 80, title: "Neighborhood Bistro", line: "Solid service. A few citations from a star." },
  { min: 70, title: "Roadside Diner", line: "You're open, but I'd eat before coming here." },
  { min: 50, title: "Greasy Spoon", line: "Stop routing leads in here until we talk." },
  { min: 0, title: "Biohazard Bistro", line: "Please step away from the merge button." },
];

export const STATION_LINES = {
  dish_pit: { good: "Clean plates. One of each. As nature intended.", meh: "Some of these plates are the same plate. Twice.", bad: "Acme Inc, ACME Corp and Acme. That's not a customer, that's a hydra." },
  prep_line: { good: "Every ingredient labeled. I'm almost suspicious.", meh: "Half these accounts don't know what industry they're in.", bad: "No domain, no industry, no headcount. These records are just vibes." },
  freezer: { good: "Everything's fresh. Rotated and dated.", meh: "Some of this has been in here since the last reorg.", bad: "These deals aren't closing. They're fossilizing." },
  front_of_house: { good: "Every table has a server.", meh: "A few contacts are wandering the dining room alone.", bad: "The tables are being served by ghosts." },
  pantry: { good: "Labeled, dated, legible. Chef's kiss.", meh: "Some names are SHOUTING and some are whispering.", bad: "'asdf test' is on the line. Next to the food." },
};

export function rankFor(score) {
  return RANKS.find((r) => score >= r.min);
}

function moodFor(points, max) {
  const share = max ? points / max : 0;
  if (share >= 0.9) return "good";
  if (share >= 0.6) return "meh";
  return "bad";
}

const blank = (v) => v === null || v === undefined || String(v).trim() === "";
const ratio = (bad, total) => ({ bad, total });

function isBadCasing(s) {
  if (!s || !/[a-z]/i.test(s) || s.length < 3) return false;
  return s === s.toUpperCase() || s === s.toLowerCase();
}

// Rates from the sample. counts.json overrides any key with exact numbers.
export function sampleMetrics({ accounts, contacts, opps, now = Date.now() }) {
  const m = {};
  const acctDomain = new Map(accounts.map((a) => [a.id, normDomain(a.domain || a.website)]));
  const openOpps = opps.filter((o) => o.is_closed !== true && o.is_closed !== "true");
  const lastTouch = (r) => ("last_activity" in r ? r.last_activity : r.last_modified);
  const stale = (r) => {
    const d = lastTouch(r);
    return "last_activity" in r ? !d || now - Date.parse(d) > 365 * DAY : Boolean(d) && now - Date.parse(d) > 365 * DAY;
  };
  const hasTouch = (r) => "last_activity" in r || Boolean(r.last_modified);

  if (accounts.length) {
    const n = accounts.length;
    m.acct_missing_owner = ratio(accounts.filter((a) => blank(a.owner_id)).length, n);
    m.acct_missing_domain = ratio(accounts.filter((a) => !normDomain(a.domain || a.website)).length, n);
    m.acct_missing_industry = ratio(accounts.filter((a) => blank(a.industry)).length, n);
    m.acct_missing_employees = ratio(accounts.filter((a) => blank(a.employees)).length, n);
    if (accounts.some(hasTouch)) m.acct_stale = ratio(accounts.filter(stale).length, n);
    if (accounts.some((a) => a.owner_active !== undefined && a.owner_active !== null)) {
      m.acct_inactive_owner = ratio(accounts.filter((a) => a.owner_active === false).length, n);
    }
    m.freemail_account = ratio(accounts.filter((a) => FREEMAIL.has(normDomain(a.domain || a.website))).length, n);
  }
  if (contacts.length) {
    const n = contacts.length;
    const withEmail = contacts.filter((c) => !blank(c.email));
    m.contact_missing_email = ratio(n - withEmail.length, n);
    m.contact_missing_title = ratio(contacts.filter((c) => blank(c.title)).length, n);
    m.contact_orphan = ratio(contacts.filter((c) => blank(c.account_id)).length, n);
    if (contacts.some(hasTouch)) m.contact_stale = ratio(contacts.filter(stale).length, n);
    if (contacts.some((c) => c.owner_active !== undefined && c.owner_active !== null)) {
      m.contact_inactive_owner = ratio(contacts.filter((c) => c.owner_active === false).length, n);
    }
    if (withEmail.length) {
      m.invalid_email = ratio(withEmail.filter((c) => !EMAIL_RE.test(String(c.email).trim())).length, withEmail.length);
      m.role_email = ratio(withEmail.filter((c) => ROLE_LOCALS.has(String(c.email).trim().toLowerCase().split("@")[0])).length, withEmail.length);
    }
    const comparable = contacts.filter((c) => {
      const cd = normDomain(c.email);
      const ad = c.account_domain ? normDomain(c.account_domain) : acctDomain.get(c.account_id);
      return cd && ad && !FREEMAIL.has(cd) && !FREEMAIL.has(ad);
    });
    if (comparable.length) {
      m.domain_mismatch = ratio(comparable.filter((c) => {
        const cd = normDomain(c.email);
        const ad = c.account_domain ? normDomain(c.account_domain) : acctDomain.get(c.account_id);
        return domainRoot(cd) !== domainRoot(ad);
      }).length, comparable.length);
    }
    const names = contacts.flatMap((c) => [c.first_name, c.last_name]).filter((s) => !blank(s));
    if (names.length) m.bad_casing = ratio(names.filter(isBadCasing).length, names.length);
  }
  const all = [...accounts.map((a) => a.name), ...contacts.map((c) => `${c.first_name ?? ""} ${c.last_name ?? ""} ${c.email ?? ""}`)];
  if (all.length) m.junk_records = ratio(all.filter((s) => s && JUNK_RE.test(s)).length, all.length);
  if (openOpps.length) {
    const n = openOpps.length;
    m.opp_missing_amount = ratio(openOpps.filter((o) => blank(o.amount)).length, n);
    if (openOpps.some((o) => o.close_date)) m.opp_past_close = ratio(openOpps.filter((o) => o.close_date && Date.parse(o.close_date) < now - DAY).length, n);
    m.opp_no_activity = ratio(openOpps.filter((o) => {
      const d = o.last_activity || null;
      return !d || now - Date.parse(d) > 90 * DAY;
    }).length, n);
  }
  return m;
}

function excess(clusters, tiers) {
  return clusters.filter((c) => tiers.includes(c.tier)).reduce((s, c) => s + c.records.length - 1, 0);
}

function gradeFor(score) {
  if (score >= 90) return { grade: "A", verdict: "PASS" };
  if (score >= 80) return { grade: "B", verdict: "PASS WITH NOTES" };
  if (score >= 70) return { grade: "C", verdict: "CONDITIONAL PASS" };
  return { grade: "CLOSED", verdict: "CLOSED BY ORDER OF THE REVOPS DEPT" };
}

function severity(lost, max) {
  const share = lost / max;
  if (share >= 0.6) return "critical";
  if (share >= 0.3) return "major";
  return "minor";
}

export function score({ accounts = [], contacts = [], opps = [], counts = {}, history = [], now = Date.now() }) {
  const acct = matchAccounts(accounts);
  const cont = matchContacts(contacts);
  const metrics = sampleMetrics({ accounts, contacts, opps, now });
  if (accounts.length) metrics.acct_dupes = ratio(excess(acct.clusters, ["high", "medium"]), accounts.length);
  if (contacts.length) metrics.contact_dupes = ratio(excess(cont.clusters, ["high", "medium"]), contacts.length);
  const exact = counts.checks || {};
  const source = {};
  for (const k of Object.keys(metrics)) source[k] = "sample";
  for (const [k, v] of Object.entries(exact)) {
    if (!(v && Number.isFinite(v.bad) && Number.isFinite(v.total) && v.total > 0)) continue;
    const isDupes = k === "acct_dupes" || k === "contact_dupes";
    if (isDupes && metrics[k] && metrics[k].bad / metrics[k].total >= v.bad / v.total) continue;
    metrics[k] = { bad: v.bad, total: v.total };
    source[k] = "exact";
  }

  const stationKeys = Object.keys(STATIONS);
  const activeStations = stationKeys.filter((s) => CHECKS.some((c) => c.station === s && metrics[c.key]?.total > 0));
  const perStation = activeStations.length ? 100 / activeStations.length : 0;

  const checks = [];
  const stations = {};
  for (const s of stationKeys) {
    const list = CHECKS.filter((c) => c.station === s && metrics[c.key]?.total > 0);
    if (!list.length) { stations[s] = { ...STATIONS[s], points: null, max: 0, applicable: false }; continue; }
    const each = perStation / list.length;
    let pts = 0;
    for (const c of list) {
      const { bad, total } = metrics[c.key];
      const rate = bad / total;
      const got = each * Math.max(0, 1 - rate / c.threshold);
      pts += got;
      checks.push({
        key: c.key, station: s, label: c.label, fix: c.fix, bad, total,
        rate: +rate.toFixed(4), points: +got.toFixed(2), max: +each.toFixed(2),
        lost: +(each - got).toFixed(2), source: source[c.key], severity: severity(each - got, each),
      });
    }
    const mood = moodFor(pts, perStation);
    stations[s] = { ...STATIONS[s], points: +pts.toFixed(1), max: +perStation.toFixed(1), applicable: true, mood, line: STATION_LINES[s][mood] };
  }
  const total = Math.round(Object.values(stations).reduce((s, x) => s + (x.points || 0), 0));
  const violations = checks.filter((c) => c.lost >= 0.5).sort((a, b) => b.lost - a.lost);

  const badges = [];
  const full = (s) => stations[s].applicable && stations[s].points >= stations[s].max - 0.05;
  if (full("freezer")) badges.push({ id: "spotless_freezer", name: "Spotless Freezer", why: "No stale records or zombie deals" });
  if (accounts.length && !acct.clusters.some((c) => c.tier === "high") && !cont.clusters.some((c) => c.tier === "high")) {
    badges.push({ id: "no_rats", name: "No Rats in the Dish Pit", why: "Zero high-confidence duplicates" });
  }
  if (full("prep_line")) badges.push({ id: "mise_en_place", name: "Mise en Place", why: "Every core field filled" });
  if (full("front_of_house")) badges.push({ id: "every_table_served", name: "Every Table Served", why: "No orphans, no ghost owners" });
  if (full("pantry")) badges.push({ id: "labeled_and_dated", name: "Labeled and Dated", why: "Clean, valid formatting" });
  if (total >= 90) badges.push({ id: "michelin", name: "Michelin Star CRM", why: "Scored 90+" });
  const prev = history.length ? history[history.length - 1] : null;
  if (prev && total > prev.score) badges.push({ id: "comeback_kitchen", name: "Comeback Kitchen", why: `Up ${total - prev.score} since last inspection` });

  const earned = new Set(badges.map((b) => b.id));
  const badgeCase = ALL_BADGES.map((b) => ({ ...b, earned: earned.has(b.id), why: badges.find((x) => x.id === b.id)?.why ?? b.why }));

  const topClusters = (clusters) => clusters
    .sort((a, b) => (a.tier === b.tier ? b.records.length - a.records.length : a.tier === "high" ? -1 : 1))
    .slice(0, 10)
    .map((c) => ({ tier: c.tier, reasons: c.reasons, records: c.records.map((r) => ({ id: r.id, name: r.name || [r.first_name, r.last_name].filter(Boolean).join(" "), domain: r._domain || undefined, email: r.email || undefined })) }));

  return {
    inspected_at: new Date(now).toISOString(),
    crm: counts.crm || "unknown",
    path: counts.path || "unknown",
    totals: counts.totals || { accounts: accounts.length, contacts: contacts.length, open_opps: opps.length },
    sample: { accounts: accounts.length, contacts: contacts.length, opps: opps.length },
    score: total,
    ...gradeFor(total),
    rank: rankFor(total),
    previous_score: prev ? prev.score : null,
    delta: prev ? total - prev.score : null,
    stations,
    checks,
    violations: violations.slice(0, 5),
    badges,
    badge_case: badgeCase,
    history: [...history.slice(-9).map((h) => ({ at: h.at, score: h.score })), { at: new Date(now).toISOString(), score: total }],
    duplicates: {
      accounts: { high: acct.clusters.filter((c) => c.tier === "high").length, medium: acct.clusters.filter((c) => c.tier === "medium").length, review: acct.review.length, possible_subsidiaries: acct.review.filter((r) => r.possible_subsidiary).length, examples: topClusters(acct.clusters) },
      contacts: { high: cont.clusters.filter((c) => c.tier === "high").length, medium: cont.clusters.filter((c) => c.tier === "medium").length, review: cont.review.length, examples: topClusters(cont.clusters) },
    },
    cta: { label: "Book a demo", url: "https://www.default.com/book-a-demo" },
  };
}

// ---------- io ----------

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
}

function writeJsonl(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) { out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true; }
    else out._.push(argv[i]);
  }
  return out;
}

const log = (...a) => console.error(...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- salesforce (sf CLI) ----------

function sfQuery(soql, org) {
  const args = ["data", "query", "--query", soql, "--json"];
  if (org) args.push("--target-org", org);
  const raw = execFileSync("sf", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  const res = JSON.parse(raw);
  if (res.status !== 0) throw new Error(res.message || "sf query failed");
  return res.result;
}

function sfCount(soql, org) {
  try { return sfQuery(soql, org).totalSize; } catch (e) { log(`  count skipped (${e.message.split("\n")[0]})`); return null; }
}

async function pullSalesforce({ org, sample }) {
  const q = (s) => sfQuery(s, org).records;
  log("Pulling Salesforce sample via sf CLI (read-only)...");
  const accounts = q(`SELECT Id, Name, Website, OwnerId, Owner.IsActive, Industry, NumberOfEmployees, LastActivityDate, LastModifiedDate FROM Account ORDER BY LastModifiedDate DESC LIMIT ${sample}`)
    .map((r) => ({ id: r.Id, name: r.Name, website: r.Website, owner_id: r.OwnerId, owner_active: r.Owner ? r.Owner.IsActive : null, industry: r.Industry, employees: r.NumberOfEmployees, last_activity: r.LastActivityDate, last_modified: r.LastModifiedDate }));
  const contacts = q(`SELECT Id, FirstName, LastName, Email, Title, AccountId, Account.Website, OwnerId, Owner.IsActive, LastActivityDate, LastModifiedDate FROM Contact ORDER BY LastModifiedDate DESC LIMIT ${sample}`)
    .map((r) => ({ id: r.Id, first_name: r.FirstName, last_name: r.LastName, email: r.Email, title: r.Title, account_id: r.AccountId, account_domain: r.Account ? r.Account.Website : null, owner_id: r.OwnerId, owner_active: r.Owner ? r.Owner.IsActive : null, last_activity: r.LastActivityDate, last_modified: r.LastModifiedDate }));
  const opps = q(`SELECT Id, Name, Amount, CloseDate, IsClosed, LastActivityDate, LastModifiedDate, OwnerId FROM Opportunity WHERE IsClosed = false ORDER BY LastModifiedDate DESC LIMIT ${sample}`)
    .map((r) => ({ id: r.Id, name: r.Name, amount: r.Amount, close_date: r.CloseDate, is_closed: r.IsClosed, last_activity: r.LastActivityDate, last_modified: r.LastModifiedDate, owner_id: r.OwnerId }));

  log("Counting exact totals...");
  const c = (soql) => sfCount(soql, org);
  const acctN = c("SELECT COUNT() FROM Account");
  const contN = c("SELECT COUNT() FROM Contact");
  const oppN = c("SELECT COUNT() FROM Opportunity WHERE IsClosed = false");
  const pair = (bad, total) => (bad === null || !total ? undefined : { bad, total });
  const checks = {
    acct_missing_domain: pair(c("SELECT COUNT() FROM Account WHERE Website = null"), acctN),
    acct_missing_industry: pair(c("SELECT COUNT() FROM Account WHERE Industry = null"), acctN),
    acct_missing_employees: pair(c("SELECT COUNT() FROM Account WHERE NumberOfEmployees = null"), acctN),
    acct_stale: pair(c("SELECT COUNT() FROM Account WHERE LastActivityDate = null OR LastActivityDate < LAST_N_DAYS:365"), acctN),
    acct_inactive_owner: pair(c("SELECT COUNT() FROM Account WHERE Owner.IsActive = false"), acctN),
    contact_missing_email: pair(c("SELECT COUNT() FROM Contact WHERE Email = null"), contN),
    contact_missing_title: pair(c("SELECT COUNT() FROM Contact WHERE Title = null"), contN),
    contact_orphan: pair(c("SELECT COUNT() FROM Contact WHERE AccountId = null"), contN),
    contact_stale: pair(c("SELECT COUNT() FROM Contact WHERE LastActivityDate = null OR LastActivityDate < LAST_N_DAYS:365"), contN),
    contact_inactive_owner: pair(c("SELECT COUNT() FROM Contact WHERE Owner.IsActive = false"), contN),
    opp_missing_amount: pair(c("SELECT COUNT() FROM Opportunity WHERE IsClosed = false AND Amount = null"), oppN),
    opp_past_close: pair(c("SELECT COUNT() FROM Opportunity WHERE IsClosed = false AND CloseDate < TODAY"), oppN),
    opp_no_activity: pair(c("SELECT COUNT() FROM Opportunity WHERE IsClosed = false AND (LastActivityDate = null OR LastActivityDate < LAST_N_DAYS:90)"), oppN),
  };
  const excessOf = (soql) => {
    try {
      const row = sfQuery(soql, org).records[0];
      return row.t - row.d;
    } catch (e) { log(`  dupe count skipped (${e.message.split("\n")[0]})`); return null; }
  };
  checks.acct_dupes = pair(excessOf("SELECT COUNT(Website) t, COUNT_DISTINCT(Website) d FROM Account"), acctN);
  checks.contact_dupes = pair(excessOf("SELECT COUNT(Email) t, COUNT_DISTINCT(Email) d FROM Contact"), contN);
  return { accounts, contacts, opps, counts: { crm: "salesforce", path: "native", totals: { accounts: acctN, contacts: contN, open_opps: oppN }, checks } };
}

// ---------- hubspot (private app token) ----------

async function hubspot(pathname, body, token, method = "POST") {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://api.hubapi.com${pathname}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) { await sleep(1000 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`HubSpot ${res.status} on ${pathname}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }
  throw new Error(`HubSpot rate limited on ${pathname}`);
}

async function hsSearchAll(object, properties, sample, token, filterGroups = []) {
  const out = [];
  let after;
  while (out.length < sample) {
    const body = { limit: Math.min(100, sample - out.length), properties, sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }], filterGroups };
    if (after) body.after = after;
    const res = await hubspot(`/crm/v3/objects/${object}/search`, body, token);
    out.push(...res.results);
    after = res.paging?.next?.after;
    if (!after) break;
    await sleep(220);
  }
  return out;
}

async function hsCount(object, filterGroups, token) {
  try {
    await sleep(220);
    const res = await hubspot(`/crm/v3/objects/${object}/search`, { limit: 1, filterGroups, properties: ["hs_object_id"] }, token);
    return res.total;
  } catch (e) { log(`  count skipped (${e.message})`); return null; }
}

async function pullHubspot({ sample }) {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error("Set HUBSPOT_TOKEN (private app token with crm.objects.*.read and crm.objects.owners.read scopes).");
  log("Pulling HubSpot sample (read-only)...");
  let archivedOwners = [];
  try {
    const res = await hubspot("/crm/v3/owners?archived=true&limit=500", null, token, "GET");
    archivedOwners = (res.results || []).map((o) => String(o.id));
  } catch (e) { log(`  owner lookup skipped (${e.message})`); }
  const inactive = new Set(archivedOwners);
  const ownerActive = (id) => (blank(id) ? null : archivedOwners.length ? !inactive.has(String(id)) : null);

  const companies = await hsSearchAll("companies", ["name", "domain", "website", "hubspot_owner_id", "industry", "numberofemployees", "notes_last_updated", "hs_lastmodifieddate"], sample, token);
  const accounts = companies.map((r) => ({ id: r.id, name: r.properties.name, domain: r.properties.domain, website: r.properties.website, owner_id: r.properties.hubspot_owner_id, owner_active: ownerActive(r.properties.hubspot_owner_id), industry: r.properties.industry, employees: r.properties.numberofemployees, last_activity: r.properties.notes_last_updated ?? null, last_modified: r.properties.hs_lastmodifieddate }));
  const people = await hsSearchAll("contacts", ["firstname", "lastname", "email", "jobtitle", "associatedcompanyid", "hubspot_owner_id", "notes_last_updated", "lastmodifieddate"], sample, token);
  const contacts = people.map((r) => ({ id: r.id, first_name: r.properties.firstname, last_name: r.properties.lastname, email: r.properties.email, title: r.properties.jobtitle, account_id: r.properties.associatedcompanyid, owner_id: r.properties.hubspot_owner_id, owner_active: ownerActive(r.properties.hubspot_owner_id), last_activity: r.properties.notes_last_updated ?? null, last_modified: r.properties.lastmodifieddate }));
  const openFilter = [{ propertyName: "hs_is_closed", operator: "EQ", value: "false" }];
  const deals = await hsSearchAll("deals", ["dealname", "amount", "closedate", "hs_is_closed", "notes_last_updated", "hs_lastmodifieddate", "hubspot_owner_id"], sample, token, [{ filters: openFilter }]);
  const opps = deals.map((r) => ({ id: r.id, name: r.properties.dealname, amount: r.properties.amount, close_date: r.properties.closedate, is_closed: r.properties.hs_is_closed === "true", last_activity: r.properties.notes_last_updated, last_modified: r.properties.hs_lastmodifieddate, owner_id: r.properties.hubspot_owner_id }));

  log("Counting exact totals (HubSpot search totals cap at 10,000)...");
  const now = Date.now();
  const missing = (p) => [{ filters: [{ propertyName: p, operator: "NOT_HAS_PROPERTY" }] }];
  const older = (p, days) => [{ filters: [{ propertyName: p, operator: "LT", value: String(now - days * DAY) }] }, { filters: [{ propertyName: p, operator: "NOT_HAS_PROPERTY" }] }];
  const acctN = await hsCount("companies", [], token);
  const contN = await hsCount("contacts", [], token);
  const oppN = await hsCount("deals", [{ filters: openFilter }], token);
  const pair = (bad, total) => (bad === null || !total || total >= 10000 ? undefined : { bad, total });
  const inOwners = (obj) => (archivedOwners.length ? hsCount(obj, [{ filters: [{ propertyName: "hubspot_owner_id", operator: "IN", values: archivedOwners.slice(0, 100) }] }], token) : Promise.resolve(null));
  const checks = {
    acct_missing_owner: pair(await hsCount("companies", missing("hubspot_owner_id"), token), acctN),
    acct_missing_domain: pair(await hsCount("companies", missing("domain"), token), acctN),
    acct_missing_industry: pair(await hsCount("companies", missing("industry"), token), acctN),
    acct_missing_employees: pair(await hsCount("companies", missing("numberofemployees"), token), acctN),
    acct_stale: pair(await hsCount("companies", older("notes_last_updated", 365), token), acctN),
    acct_inactive_owner: pair(await inOwners("companies"), acctN),
    contact_missing_email: pair(await hsCount("contacts", missing("email"), token), contN),
    contact_missing_title: pair(await hsCount("contacts", missing("jobtitle"), token), contN),
    contact_orphan: pair(await hsCount("contacts", missing("associatedcompanyid"), token), contN),
    contact_stale: pair(await hsCount("contacts", older("notes_last_updated", 365), token), contN),
    contact_inactive_owner: pair(await inOwners("contacts"), contN),
    opp_missing_amount: pair(await hsCount("deals", [{ filters: [...openFilter, { propertyName: "amount", operator: "NOT_HAS_PROPERTY" }] }], token), oppN),
    opp_past_close: pair(await hsCount("deals", [{ filters: [...openFilter, { propertyName: "closedate", operator: "LT", value: String(now - DAY) }] }], token), oppN),
    opp_no_activity: pair(await hsCount("deals", [
      { filters: [...openFilter, { propertyName: "notes_last_updated", operator: "LT", value: String(now - 90 * DAY) }] },
      { filters: [...openFilter, { propertyName: "notes_last_updated", operator: "NOT_HAS_PROPERTY" }] },
    ], token), oppN),
  };
  return { accounts, contacts, opps, counts: { crm: "hubspot", path: "native", totals: { accounts: acctN, contacts: contN, open_opps: oppN }, checks } };
}

// ---------- attio (API key) ----------
// Attio has no count endpoint, so every rate comes from an unsorted sample (unsorted keeps
// staleness honest; a most-recent sample would hide old records).

async function attio(pathname, body, token, method = "POST") {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://api.attio.com${pathname}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) { await sleep(1000 * (attempt + 1)); continue; }
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Attio ${res.status} on ${pathname}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }
  throw new Error(`Attio rate limited on ${pathname}`);
}

async function attioAll(object, sample, token) {
  const out = [];
  while (out.length < sample) {
    const res = await attio(`/v2/objects/${object}/records/query`, { limit: Math.min(500, sample - out.length), offset: out.length }, token);
    if (!res) return null;
    out.push(...res.data);
    if (res.data.length === 0) break;
    await sleep(150);
  }
  return out;
}

const av = (rec, slug) => (rec.values?.[slug] || [])[0];
const lastTouch = (rec) => {
  const times = Object.values(rec.values || {}).flat().map((v) => v?.active_from).filter(Boolean);
  return times.length ? times.sort().pop() : rec.created_at;
};

async function pullAttio({ sample }) {
  const token = process.env.ATTIO_API_KEY;
  if (!token) throw new Error("Set ATTIO_API_KEY (read-only access token from Attio workspace settings > Developers).");
  log("Pulling Attio sample (read-only)...");
  let activeMembers = null;
  try {
    const res = await attio("/v2/workspace_members", null, token, "GET");
    if (res?.data) activeMembers = new Set(res.data.filter((m) => m.access_level !== "suspended").map((m) => m.id?.workspace_member_id));
  } catch (e) { log(`  member lookup skipped (${e.message})`); }
  const ownerOf = (rec) => {
    const o = av(rec, "owner") || av(rec, "team");
    return o?.referenced_actor_id || o?.target_record_id || null;
  };

  const companies = (await attioAll("companies", sample, token)) || [];
  const accounts = companies.map((r) => {
    const owner = ownerOf(r);
    return {
      id: r.id.record_id,
      name: av(r, "name")?.value,
      domain: av(r, "domains")?.domain,
      owner_id: owner,
      owner_active: owner && activeMembers ? activeMembers.has(owner) : null,
      industry: av(r, "categories")?.option?.title ?? av(r, "industry")?.option?.title ?? null,
      employees: av(r, "employee_range")?.option?.title ?? null,
      last_modified: lastTouch(r),
    };
  });
  const people = (await attioAll("people", sample, token)) || [];
  const contacts = people.map((r) => {
    const n = av(r, "name");
    return {
      id: r.id.record_id,
      first_name: n?.first_name,
      last_name: n?.last_name,
      email: av(r, "email_addresses")?.email_address,
      title: av(r, "job_title")?.value,
      account_id: av(r, "company")?.target_record_id || null,
      last_modified: lastTouch(r),
    };
  });
  const dealRecs = (await attioAll("deals", sample, token)) || [];
  const opps = dealRecs.map((r) => {
    const stage = av(r, "stage")?.status?.title || "";
    return {
      id: r.id.record_id,
      name: av(r, "name")?.value,
      amount: av(r, "value")?.currency_value ?? null,
      close_date: av(r, "close_date")?.value ?? null,
      is_closed: /won|lost|closed/i.test(stage),
      last_activity: lastTouch(r),
    };
  }).filter((o) => !o.is_closed);
  return { accounts, contacts, opps, counts: { crm: "attio", path: "native", totals: { accounts: accounts.length, contacts: contacts.length, open_opps: opps.length }, checks: {} } };
}

// ---------- html card ----------

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => Number(n ?? 0).toLocaleString("en-US");
const pct = (r) => `${(r * 100).toFixed(1)}%`;

const MOOD_STAMP = { good: "PASS", meh: "WATCH", bad: "FAIL" };
const CRM_NAMES = { salesforce: "Salesforce", hubspot: "HubSpot", attio: "Attio" };

const INSPECTOR_SVG = `<svg viewBox="0 0 120 120" class="inspector" aria-hidden="true">
  <ellipse cx="60" cy="112" rx="34" ry="5" fill="var(--shadow)"/>
  <path d="M28 108 Q30 80 60 78 Q90 80 92 108 Z" fill="var(--uniform)"/>
  <rect x="54" y="80" width="12" height="16" fill="#fff" opacity=".9"/>
  <path d="M60 82 L57 96 L60 100 L63 96 Z" fill="var(--grade)"/>
  <circle cx="60" cy="56" r="22" fill="#f2c7a5"/>
  <rect x="34" y="30" width="52" height="8" rx="3" fill="var(--uniform)"/>
  <path d="M40 31 Q42 12 60 12 Q78 12 80 31 Z" fill="var(--uniform)"/>
  <rect x="54" y="18" width="12" height="8" rx="2" fill="#ffd34d"/>
  <g class="eyes"><circle cx="52" cy="54" r="2.6" fill="#222"/><circle cx="68" cy="54" r="2.6" fill="#222"/></g>
  <path d="M47 48 L56 50 M64 50 L73 48" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M48 64 Q54 60 60 64 Q66 60 72 64 Q66 69 60 66 Q54 69 48 64 Z" fill="#5a3a22"/>
  <rect x="86" y="72" width="22" height="30" rx="3" fill="#c79a5b" transform="rotate(12 97 87)"/>
  <rect x="90" y="78" width="14" height="20" fill="#fffdf5" transform="rotate(12 97 87)"/>
</svg>`;

const SIGNATURE_SVG = `<svg viewBox="0 0 200 50" class="signature" aria-hidden="true"><path d="M6 36 C 20 6, 30 46, 42 22 S 60 10, 66 30 S 84 44, 92 18 C 96 8, 104 40, 116 26 S 140 14, 150 30 C 156 40, 170 20, 194 24" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/></svg>`;

function historyChart(history) {
  if (!history || history.length < 2) {
    return `<p class="muted">First inspection on file. Fix a few citations and run <code>/crm-health-inspection</code> again: the inspector remembers.</p>`;
  }
  const w = 560;
  const h = 160;
  const pad = 26;
  const step = (w - pad * 2) / (history.length - 1);
  const lo = Math.max(0, Math.floor((Math.min(...history.map((p) => p.score)) - 10) / 10) * 10);
  const y = (s) => h - pad - ((s - lo) / (100 - lo)) * (h - pad * 2);
  const pts = history.map((p, i) => [pad + i * step, y(p.score)]);
  const bands = [[90, "A"], [80, "B"], [70, "C"]].filter(([v]) => v > lo).map(([v, g]) => `<line x1="${pad}" x2="${w - pad}" y1="${y(v)}" y2="${y(v)}" class="band"/><text x="${w - pad + 4}" y="${y(v) + 4}" class="band-label">${g}</text>`).join("");
  const dots = pts.map(([px, py], i) => `<circle cx="${px}" cy="${py}" r="${i === pts.length - 1 ? 6 : 4}" class="${i === pts.length - 1 ? "dot now" : "dot"}"><title>${esc(new Date(history[i].at).toLocaleDateString())}: ${history[i].score}</title></circle><text x="${px}" y="${py - 11}" class="dot-label">${history[i].score}</text>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" class="history" role="img" aria-label="Score history">${bands}<polyline points="${pts.map((p) => p.join(",")).join(" ")}" class="trend"/>${dots}</svg>`;
}

export function gradeCardHtml(r, establishment) {
  const date = esc(new Date(r.inspected_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }));
  const head = `<div class="gc-head"><span class="gc-seal">DRO</span><div><b>DEPT. OF REVENUE OPERATIONS</b><small>BUREAU OF CRM SANITATION</small></div></div>`;
  if (r.grade === "CLOSED") {
    return `<div class="gradecard closed" role="img" aria-label="Closed by order of the Dept. of Revenue Operations">${head}<div class="gc-closed"><strong>CLOSED</strong><span>BY ORDER OF THE<br>DEPT. OF REVENUE OPERATIONS</span><span>Do not route leads to this CRM.</span></div><div class="gc-foot"><b>${esc(establishment)} CRM</b>Inspected ${date}</div></div>`;
  }
  if (r.grade === "PENDING") {
    return `<div class="gradecard" role="img" aria-label="Grade pending">${head}<div class="gc-pending">GRADE<br>PENDING</div><div class="gc-foot"><b>${esc(establishment)} CRM &middot; ${date}</b>Inspection scheduled. Run the skill to get graded</div></div>`;
  }
  const letter = esc(r.grade);
  return `<div class="gradecard g-${letter.toLowerCase()}" role="img" aria-label="Sanitary inspection grade ${letter}">${head}<div class="gc-label">SANITARY INSPECTION GRADE</div><div class="gc-letter">${letter}</div><div class="gc-foot"><b>${esc(establishment)} CRM &middot; ${date}</b>This grade card must be posted in the window</div></div>`;
}

export function renderCard(r) {
  const gradeKey = r.grade === "CLOSED" ? "closed" : r.grade.toLowerCase();
  const closed = r.grade === "CLOSED";
  const rank = r.rank || rankFor(r.score);
  const nextRank = [...RANKS].reverse().find((x) => x.min > r.score);
  const rankFloor = rank.min;
  const rankCeil = nextRank ? nextRank.min : 100;
  const rankProgress = Math.round(((r.score - rankFloor) / Math.max(1, rankCeil - rankFloor)) * 100);
  const crmName = CRM_NAMES[r.crm] || r.crm;
  const totals = r.totals || {};
  const earnedCount = (r.badge_case || []).filter((b) => b.earned).length;

  const stations = Object.entries(r.stations).map(([key, s]) => {
    if (!s.applicable) {
      return `<article class="station na"><header><h3>${esc(s.name)}</h3><span class="pillar">${esc(s.pillar)}</span></header><p class="quote">Nothing on the premises to inspect. Waived.</p></article>`;
    }
    const share = s.max ? s.points / s.max : 0;
    const rows = r.checks.filter((c) => c.station === key).map((c) => `
        <li><div class="check-top"><span>${esc(c.label)}</span><span class="nums">${fmt(c.bad)} / ${fmt(c.total)} <em>${pct(c.rate)}</em> <i class="src ${c.source}">${c.source}</i></span></div>
        <div class="mini"><span class="fill" style="--w:${Math.round((c.points / Math.max(c.max, 0.01)) * 100)}%"></span></div></li>`).join("");
    return `<article class="station ${s.mood}">
      <header><h3>${esc(s.name)}</h3><span class="pillar">${esc(s.pillar)}</span><span class="mood-stamp">${MOOD_STAMP[s.mood]}</span></header>
      <div class="thermo" title="${s.points} of ${s.max}"><span class="bulb"></span><span class="tube"><span class="mercury" style="--w:${Math.round(share * 100)}%"></span></span><b>${s.points}<small>/${s.max}</small></b></div>
      <p class="quote">"${esc(s.line || "")}"</p>
      <ul class="checks">${rows}</ul>
    </article>`;
  }).join("");

  const tickets = r.violations.length ? r.violations.map((v, i) => `
    <li class="ticket ${v.severity}" style="--i:${i}">
      <div class="stub"><span>No.</span><b>${String(i + 1).padStart(3, "0")}</b></div>
      <div class="body"><span class="sev">${esc(v.severity)}</span><h4>${esc(v.label)}</h4>
      <p class="count"><b>${fmt(v.bad)}</b> of ${fmt(v.total)} (${pct(v.rate)}) &middot; cost you ${v.lost} pts</p>
      <p class="fix">Fix: ${esc(v.fix)}</p></div>
    </li>`).join("") : `<li class="ticket none"><div class="body"><h4>No citations issued.</h4><p class="fix">The inspector is visibly disappointed to have nothing to write.</p></div></li>`;

  const badges = (r.badge_case || []).map((b) => `
    <li class="badge ${b.earned ? "earned" : "locked"}" title="${esc(b.why)}">
      <div class="medal"><span>${b.earned ? esc(b.glyph) : "?"}</span></div>
      <b>${esc(b.name)}</b><small>${b.earned ? esc(b.why) : `Locked: ${esc(b.why)}`}</small>
    </li>`).join("");

  const dupeExamples = [...(r.duplicates.accounts.examples || []).slice(0, 3), ...(r.duplicates.contacts.examples || []).slice(0, 3)]
    .map((c) => `<li><span class="tier ${c.tier}">${esc(c.tier)}</span> ${c.records.map((x) => `<code>${esc(x.name || x.email || x.id)}</code>`).join(" = ")} <small>${esc(c.reasons.join(", "))}</small></li>`).join("");

  const delta = r.delta === null || r.delta === undefined ? "" : `<span class="delta ${r.delta >= 0 ? "up" : "down"}">${r.delta >= 0 ? "▲ +" : "▼ "}${r.delta} since last inspection</span>`;
  const brag = `My ${crmName} CRM just got inspected: ${r.score}/100, ${closed ? "CLOSED by order of the RevOps dept" : `grade ${r.grade}`} (${rank.title}). Get yours inspected: default.com/crm-inspection`;
  const tape = closed ? `<div class="tape" aria-hidden="true"><div>${"CLOSED BY ORDER OF THE REVOPS DEPT &nbsp;&#9888;&nbsp; DO NOT ROUTE LEADS &nbsp;&#9888;&nbsp; ".repeat(6)}</div></div>` : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>CRM Inspection: ${esc(String(r.score))}/100</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bungee&family=Special+Elite&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  :root {
    --tile-a:#eef3f2; --tile-b:#e2eae8; --paper:#fffdf6; --paper-line:#e9e3d2; --ink:#1d1f24; --muted:#6d6a62; --shadow:rgba(0,0,0,.12);
    --dept:#1f4fbf; --uniform:#24427a; --good:#1f8a4c; --meh:#d99a00; --bad:#d4392b; --chip:#f4efe2;
    --grade-a:#1b5fae; --grade-b:#23964a; --grade-c:#ef8a0c; --grade-closed:#d4202a;
  }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
    --tile-a:#14181a; --tile-b:#191f21; --paper:#20211f; --paper-line:#2f2f2a; --ink:#f2eee4; --muted:#a6a196; --shadow:rgba(0,0,0,.45); --chip:#2b2b27; --uniform:#3b5fa3;
  } }
  :root { --grade: var(--grade-${gradeKey}); }
  * { box-sizing:border-box; }
  body { margin:0; color:var(--ink); font:15px/1.5 Inter, ui-sans-serif, system-ui, sans-serif; background-color:var(--tile-a);
    background-image: linear-gradient(45deg, var(--tile-b) 25%, transparent 25%, transparent 75%, var(--tile-b) 75%), linear-gradient(45deg, var(--tile-b) 25%, transparent 25%, transparent 75%, var(--tile-b) 75%);
    background-size:48px 48px; background-position:0 0, 24px 24px; padding:56px 16px 48px; }
  .tape { position:absolute; top:22px; left:-5%; width:110%; transform:rotate(-2deg); z-index:20; overflow:hidden; pointer-events:none;
    background:repeating-linear-gradient(-45deg, #ffd200 0 26px, #111 26px 52px); padding:6px 0; box-shadow:0 6px 18px var(--shadow); }
  .tape div { white-space:nowrap; font:400 15px/1 Bungee, Impact, sans-serif; color:#111; background:#ffd200; display:inline-block; padding:6px 0; animation:marquee 30s linear infinite; }
  @keyframes marquee { to { transform:translateX(-50%); } }

  .board { position:relative; max-width:880px; margin:0 auto; background:var(--paper); border-radius:18px; padding:46px 34px 30px;
    box-shadow:0 1px 0 var(--paper-line), 0 30px 60px var(--shadow); border:10px solid #b8874b; border-top-width:14px;
    background-image:repeating-linear-gradient(transparent 0 31px, var(--paper-line) 31px 32px); }
  .clip { position:absolute; top:-30px; left:50%; transform:translateX(-50%); width:170px; height:48px; border-radius:10px 10px 6px 6px;
    background:linear-gradient(#d9dde2, #9aa1a9); box-shadow:inset 0 2px 0 #fff8, 0 4px 10px var(--shadow); }
  .clip::after { content:""; position:absolute; left:50%; top:10px; transform:translateX(-50%); width:46px; height:14px; border-radius:7px; background:var(--paper); box-shadow:inset 0 2px 4px #0004; }

  .dept { display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; border-bottom:3px double var(--ink); padding-bottom:14px; }
  .dept .seal { display:flex; gap:12px; align-items:center; }
  .seal-ring { width:54px; height:54px; border-radius:50%; border:3px solid var(--dept); display:grid; place-items:center; color:var(--dept); font:400 13px/1 Bungee, sans-serif; transform:rotate(-8deg); }
  .dept h1 { margin:0; font:400 22px/1.1 Bungee, Impact, sans-serif; letter-spacing:.02em; }
  .dept .sub { font:13px/1.3 "Special Elite", ui-monospace, monospace; color:var(--muted); }
  .form-no { font:12px "Special Elite", monospace; color:var(--muted); text-align:right; }
  .fields { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px 18px; margin:16px 0 4px; font:14px "Special Elite", ui-monospace, monospace; }
  .fields div { border-bottom:1px dashed var(--muted); padding:2px 0; } .fields span { color:var(--muted); margin-right:6px; }

  .verdict { display:grid; grid-template-columns:220px 1fr; gap:28px; align-items:center; margin:30px 0 10px; }
  .gradecard { position:relative; width:100%; aspect-ratio:3/4; background:#fff; color:#111; border:2px solid #111; border-radius:6px; padding:12px 12px 10px;
    display:flex; flex-direction:column; box-shadow:0 2px 0 #0003, 0 18px 30px var(--shadow); animation:stamp .7s cubic-bezier(.2,1.6,.4,1) .2s both; }
  .gradecard::before { content:""; position:absolute; top:-9px; left:50%; width:14px; height:14px; margin-left:-7px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #fff, #9aa1a9 60%, #555); box-shadow:0 2px 3px #0005; }
  .gc-head { display:flex; gap:8px; align-items:center; border-bottom:2px solid #111; padding-bottom:7px; }
  .gc-seal { width:30px; height:30px; flex:none; border-radius:50%; border:2px solid #111; display:grid; place-items:center; font:700 9px/1 Inter, sans-serif; letter-spacing:.02em; }
  .gc-head b { display:block; font:800 10.5px/1.15 Inter, sans-serif; letter-spacing:.04em; }
  .gc-head small { display:block; font:600 8.5px/1.2 Inter, sans-serif; letter-spacing:.08em; color:#444; margin-top:2px; }
  .gc-label { text-align:center; font:800 10px/1 Inter, sans-serif; letter-spacing:.18em; margin-top:10px; }
  .gc-letter { flex:1; display:grid; place-items:center; color:var(--grade); font:900 148px/0.8 "Arial Black", Inter, Helvetica, sans-serif; letter-spacing:-.04em; }
  .gc-foot { border-top:2px solid #111; padding-top:6px; font:600 8.5px/1.35 Inter, sans-serif; text-align:center; color:#333; }
  .gc-foot b { display:block; font-size:9.5px; color:#111; letter-spacing:.06em; }
  .gradecard.closed { background:var(--grade-closed); color:#fff; border-color:#7a0f14; }
  .gradecard.closed .gc-head, .gradecard.closed .gc-foot { border-color:#fff; } .gradecard.closed .gc-seal { border-color:#fff; }
  .gradecard.closed .gc-head small, .gradecard.closed .gc-foot { color:#ffe1e1; } .gradecard.closed .gc-foot b { color:#fff; }
  .gc-closed { flex:1; display:flex; flex-direction:column; justify-content:center; text-align:center; gap:6px; }
  .gc-closed strong { font:900 38px/0.9 "Arial Black", Inter, sans-serif; letter-spacing:-.02em; }
  .gradecard.g-a { --grade:var(--grade-a); } .gradecard.g-b { --grade:var(--grade-b); } .gradecard.g-c { --grade:var(--grade-c); }
  .gc-pending { flex:1; display:grid; place-content:center; text-align:center; font:900 30px/1 "Arial Black", Inter, sans-serif; color:#6b6b6b; letter-spacing:-.01em; }
  .gc-closed span { font:700 10px/1.3 Inter, sans-serif; letter-spacing:.08em; }
  @keyframes stamp { 0% { transform:scale(2.6) rotate(-14deg); opacity:0; } 60% { opacity:1; } 100% { transform:scale(1) rotate(-3deg); } }

  .score-line { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
  .score { font:400 76px/1 Bungee, Impact, sans-serif; color:var(--grade); }
  .score small { font-size:26px; color:var(--muted); }
  .rank { font:800 22px/1.2 Inter, sans-serif; margin:4px 0 2px; }
  .rank-line { color:var(--muted); margin:0 0 12px; }
  .xp { height:14px; border-radius:99px; background:var(--chip); overflow:hidden; border:2px solid var(--ink); }
  .xp span { display:block; height:100%; width:0; background:repeating-linear-gradient(-45deg, var(--grade) 0 10px, color-mix(in srgb, var(--grade) 75%, #fff) 10px 20px); transition:width 1.4s cubic-bezier(.2,.8,.2,1) .6s; }
  .loaded .xp span { width:var(--w); }
  .xp-label { font:12px "Special Elite", monospace; color:var(--muted); margin-top:6px; }
  .delta { display:inline-block; padding:3px 10px; border-radius:99px; font-weight:700; font-size:13px; }
  .delta.up { background:color-mix(in srgb, var(--good) 18%, transparent); color:var(--good); }
  .delta.down { background:color-mix(in srgb, var(--bad) 18%, transparent); color:var(--bad); }

  .bubble-row { display:flex; gap:14px; align-items:flex-end; margin-top:18px; }
  .inspector { width:92px; flex:none; } .inspector .eyes { animation:blink 4s infinite; transform-origin:60px 54px; }
  @keyframes blink { 0%,92%,100% { transform:scaleY(1); } 95% { transform:scaleY(.1); } }
  .bubble { position:relative; background:var(--chip); border:2px solid var(--ink); border-radius:16px; padding:10px 14px; font:15px/1.4 "Special Elite", monospace; }
  .bubble::before { content:""; position:absolute; left:-12px; bottom:18px; border:10px solid transparent; border-right-color:var(--ink); }

  h2 { font:400 18px/1 Bungee, Impact, sans-serif; margin:40px 0 14px; display:flex; align-items:center; gap:10px; }
  h2::after { content:""; flex:1; border-bottom:3px dotted var(--muted); opacity:.5; }

  .stations { display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:16px; }
  .station { position:relative; background:var(--paper); border:2px solid var(--ink); border-radius:14px; padding:16px; box-shadow:4px 4px 0 var(--ink); }
  .station header { display:flex; flex-direction:column; gap:2px; padding-right:74px; }
  .station h3 { margin:0; font:800 17px Inter, sans-serif; } .pillar { color:var(--muted); font-size:13px; }
  .mood-stamp { position:absolute; top:12px; right:12px; font:400 13px/1 Bungee, sans-serif; padding:5px 8px; border:2px solid currentColor; border-radius:6px; transform:rotate(8deg); }
  .station.good .mood-stamp { color:var(--good); } .station.meh .mood-stamp { color:var(--meh); } .station.bad .mood-stamp { color:var(--bad); }
  .station.na { opacity:.6; box-shadow:none; border-style:dashed; }
  .thermo { display:flex; align-items:center; gap:8px; margin:14px 0 8px; }
  .thermo .bulb { width:18px; height:18px; border-radius:50%; border:2px solid var(--ink); background:var(--c); flex:none; }
  .thermo .tube { flex:1; height:12px; border:2px solid var(--ink); border-left:0; border-radius:0 99px 99px 0; margin-left:-6px; overflow:hidden; background:var(--chip); }
  .thermo .mercury { display:block; height:100%; width:0; background:var(--c); transition:width 1.2s cubic-bezier(.2,.8,.2,1) .4s; }
  .loaded .thermo .mercury, .loaded .mini .fill { width:var(--w); }
  .thermo b { font:400 18px Bungee, sans-serif; } .thermo small { color:var(--muted); font-size:12px; }
  .station.good { --c:var(--good); } .station.meh { --c:var(--meh); } .station.bad { --c:var(--bad); }
  .quote { font:14px/1.4 "Special Elite", monospace; margin:6px 0 10px; }
  .checks { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  .check-top { display:flex; flex-direction:column; gap:1px; font-size:12.5px; }
  .check-top .nums { color:var(--muted); } .check-top em { font-style:normal; font-weight:700; color:var(--ink); }
  .src { font-style:normal; font-size:10px; padding:1px 5px; border-radius:4px; background:var(--chip); }
  .mini { height:5px; border-radius:3px; background:var(--chip); overflow:hidden; margin-top:3px; }
  .mini .fill { display:block; height:100%; width:0; background:var(--c); transition:width 1s ease .8s; }

  .tickets { list-style:none; padding:0; margin:0; display:grid; gap:12px; }
  .ticket { display:flex; background:#fff8e1; color:#2a2416; border-radius:10px; overflow:hidden; box-shadow:0 3px 0 #0002;
    opacity:0; transform:translateY(10px) rotate(-.6deg); animation:drop .45s ease forwards; animation-delay:calc(1s + var(--i, 0) * .18s); }
  .ticket:nth-child(even) { transform:rotate(.5deg); }
  @keyframes drop { to { opacity:1; transform:none; } }
  .ticket .stub { width:74px; flex:none; display:grid; place-content:center; text-align:center; border-right:3px dashed #2a241633; background:#f6e7b5; font:12px "Special Elite", monospace; }
  .ticket .stub b { font:400 20px Bungee, sans-serif; }
  .ticket .body { padding:12px 16px; position:relative; flex:1; }
  .ticket h4 { margin:0 0 2px; font:800 16px Inter, sans-serif; }
  .ticket .count { margin:0; font-size:14px; } .ticket .fix { margin:6px 0 0; font:13.5px/1.4 "Special Elite", monospace; }
  .sev { position:absolute; right:12px; top:10px; font:400 12px Bungee, sans-serif; padding:3px 7px; border:2px solid currentColor; border-radius:5px; transform:rotate(-6deg); }
  .critical .sev { color:#c62828; } .major .sev { color:#d35400; } .minor .sev { color:#a77d00; }

  .badges { list-style:none; padding:0; margin:0; display:grid; grid-template-columns:repeat(auto-fill, minmax(118px, 1fr)); gap:14px; text-align:center; }
  .badge b { display:block; font-size:13px; margin-top:8px; } .badge small { display:block; color:var(--muted); font-size:11.5px; line-height:1.3; }
  .medal { width:74px; height:74px; margin:0 auto; border-radius:50%; display:grid; place-items:center; font:400 28px Bungee, sans-serif; position:relative; }
  .earned .medal { background:radial-gradient(circle at 35% 30%, #fff6c9, #f2c230 45%, #b88a12); color:#5b4100; border:3px solid #8a6508; box-shadow:0 4px 0 #8a6508; animation:shine 3s ease-in-out infinite; }
  @keyframes shine { 0%,100% { filter:brightness(1); } 50% { filter:brightness(1.18); } }
  .locked .medal { background:var(--chip); color:var(--muted); border:3px dashed var(--muted); }
  .locked b { color:var(--muted); }

  .history { width:100%; height:auto; } .trend { fill:none; stroke:var(--grade); stroke-width:3; stroke-linejoin:round; }
  .band { stroke:var(--muted); stroke-dasharray:4 5; opacity:.5; } .band-label { fill:var(--muted); font:11px Bungee, sans-serif; }
  .dot { fill:var(--paper); stroke:var(--grade); stroke-width:3; } .dot.now { fill:var(--grade); } .dot-label { fill:var(--ink); font:600 11px Inter, sans-serif; text-anchor:middle; }

  .dupes { list-style:none; padding:0; margin:0; display:grid; gap:6px; font-size:13.5px; }
  .dupes code { background:var(--chip); padding:1px 6px; border-radius:5px; } .dupes small { color:var(--muted); }
  .tier { font:400 10px Bungee, sans-serif; padding:2px 6px; border-radius:4px; color:#fff; } .tier.high { background:var(--bad); } .tier.medium { background:var(--meh); }
  .muted { color:var(--muted); }

  footer { margin-top:40px; padding-top:18px; border-top:3px double var(--ink); display:flex; justify-content:space-between; align-items:flex-end; gap:18px; flex-wrap:wrap; }
  .signature { width:170px; display:block; } .sig-label { font:12px "Special Elite", monospace; color:var(--muted); border-top:1px solid var(--ink); padding-top:4px; }
  .actions { display:flex; gap:10px; flex-wrap:wrap; }
  .btn { font:700 14px Inter, sans-serif; padding:11px 16px; border-radius:10px; border:2px solid var(--ink); cursor:pointer; text-decoration:none; box-shadow:3px 3px 0 var(--ink); transition:transform .1s; }
  .btn:active { transform:translate(2px,2px); box-shadow:1px 1px 0 var(--ink); }
  .btn.primary { background:var(--ink); color:var(--paper); } .btn.ghost { background:var(--paper); color:var(--ink); }
  .fine { font-size:12px; color:var(--muted); margin-top:12px; }
  canvas#confetti { position:fixed; inset:0; pointer-events:none; z-index:30; }

  @media (max-width:640px) {
    .fields { grid-template-columns:1fr; }
    body { padding:48px 10px 32px; } .board { padding:40px 16px 22px; border-width:6px; border-top-width:10px; }
    .verdict { grid-template-columns:1fr; justify-items:center; text-align:center; } .gradecard { width:210px; }
    .score-line { justify-content:center; } .bubble-row { text-align:left; }
  }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation:none !important; transition:none !important; } .ticket { opacity:1; transform:none; } }
</style></head>
<body>
${tape}
<main class="board">
  <div class="clip"></div>
  <header class="dept">
    <div class="seal"><div class="seal-ring">CRM</div><div><h1>CRM Health Inspection</h1><div class="sub">Department of Revenue Operations &middot; Food (data) safety division</div></div></div>
    <div class="form-no">Form 42-B<br>Inspector #0042</div>
  </header>
  <div class="fields">
    <div><span>Establishment:</span>${esc(crmName)} CRM</div>
    <div><span>Date:</span>${esc(new Date(r.inspected_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }))}</div>
    <div><span>Method:</span>${esc(r.path === "mcp" ? "Default MCP" : "Native API")}</div>
    <div><span>On premises:</span>${fmt(totals.accounts)} accts, ${fmt(totals.contacts)} contacts, ${fmt(totals.open_opps)} open deals</div>
  </div>

  <section class="verdict">
    ${gradeCardHtml(r, crmName)}
    <div>
      <div class="score-line"><div class="score"><span id="score" data-to="${r.score}">${r.score}</span><small>/100</small></div>${delta}</div>
      <div class="rank">Rank: ${esc(rank.title)}</div>
      <p class="rank-line">${esc(rank.line)}</p>
      <div class="xp"><span style="--w:${Math.max(4, Math.min(100, rankProgress))}%"></span></div>
      <div class="xp-label">${nextRank ? `${nextRank.min - r.score} pts to ${esc(nextRank.title)}` : "Max rank. Nowhere left to climb."}</div>
      <div class="bubble-row">${INSPECTOR_SVG}<div class="bubble">${esc(r.violations[0] ? `Top citation: ${r.violations[0].label.toLowerCase()}. ${fmt(r.violations[0].bad)} of them. I'm going to need a minute.` : "Honestly? Spotless. I'm a little unsettled.")}</div></div>
    </div>
  </section>

  <h2>Station by station</h2>
  <div class="stations">${stations}</div>

  <h2>Citations issued</h2>
  <ul class="tickets">${tickets}</ul>

  <h2>Badge case &middot; ${earnedCount}/${(r.badge_case || []).length}</h2>
  <ul class="badges">${badges}</ul>

  <h2>Re-inspection log</h2>
  ${historyChart(r.history)}

  ${dupeExamples ? `<h2>Duplicates spotted</h2><ul class="dupes">${dupeExamples}</ul><p class="fine">Accounts: ${r.duplicates.accounts.high} high, ${r.duplicates.accounts.medium} medium, ${r.duplicates.accounts.review} lookalikes to review, ${r.duplicates.accounts.possible_subsidiaries} possible subsidiaries (not cited). Contacts: ${r.duplicates.contacts.high} high, ${r.duplicates.contacts.medium} medium. Matching sample: ${fmt(r.sample.accounts)} accounts, ${fmt(r.sample.contacts)} contacts.</p>` : ""}

  <footer>
    <div>${SIGNATURE_SVG}<div class="sig-label">Inspector #0042, CRM Health Unit</div></div>
    <div class="actions">
      <button class="btn ghost" id="brag" type="button">Copy brag text</button>
      <a class="btn primary" href="${esc(r.cta.url)}">${esc(r.cta.label)}</a>
    </div>
  </footer>
  <p class="fine">Read-only inspection. Nothing was changed in your CRM and nothing left your machine. <span class="src exact">exact</span> = full-CRM count, <span class="src sample">sample</span> = most recent records.</p>
</main>
${r.grade === "A" ? '<canvas id="confetti"></canvas>' : ""}
<script>
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  requestAnimationFrame(() => document.body.classList.add("loaded"));
  const el = document.getElementById("score");
  const to = Number(el.dataset.to);
  if (!reduce) {
    const start = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - start) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    el.textContent = "0"; requestAnimationFrame(tick);
  }
  const brag = ${JSON.stringify(brag)};
  document.getElementById("brag").addEventListener("click", (e) => {
    const b = e.currentTarget;
    const done = () => { b.textContent = "Copied. Go brag."; setTimeout(() => (b.textContent = "Copy brag text"), 2200); };
    try { navigator.clipboard.writeText(brag).then(done, () => prompt("Copy this:", brag)); } catch { prompt("Copy this:", brag); }
  });
  const c = document.getElementById("confetti");
  if (c && !reduce) {
    const ctx = c.getContext("2d"); const W = (c.width = innerWidth), H = (c.height = innerHeight);
    const colors = ["#1f8a4c", "#f2c230", "#1f4fbf", "#d4392b", "#ffffff"];
    const bits = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H, r: 4 + Math.random() * 6, v: 2 + Math.random() * 3, s: Math.random() * 6, c: colors[(Math.random() * colors.length) | 0] }));
    let f = 0;
    const draw = () => { ctx.clearRect(0, 0, W, H); for (const b of bits) { b.y += b.v; b.x += Math.sin((f + b.s * 20) / 20); ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, b.r, b.r * 0.6); } if (++f < 260) requestAnimationFrame(draw); else c.remove(); };
    setTimeout(draw, 700);
  }
})();
</script>
</body></html>`;
}

// ---------- cli ----------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const out = path.resolve(args.out || "./crm-inspection-report");
  const raw = path.join(out, "raw");

  if (cmd === "pull") {
    const crm = String(args.crm || "").toLowerCase();
    const sample = Math.min(Number(args.sample) || 2000, 2000);
    const pullers = { salesforce: pullSalesforce, sf: pullSalesforce, hubspot: pullHubspot, attio: pullAttio };
    if (!pullers[crm]) throw new Error("--crm must be salesforce, hubspot or attio");
    const data = await pullers[crm]({ org: args.org, sample });
    writeJsonl(path.join(raw, "accounts.jsonl"), data.accounts);
    writeJsonl(path.join(raw, "contacts.jsonl"), data.contacts);
    writeJsonl(path.join(raw, "opps.jsonl"), data.opps);
    fs.writeFileSync(path.join(raw, "counts.json"), JSON.stringify(data.counts, null, 2));
    console.log(JSON.stringify({ ok: true, crm: data.counts.crm, sample: { accounts: data.accounts.length, contacts: data.contacts.length, opps: data.opps.length }, totals: data.counts.totals, exact_checks: Object.keys(data.counts.checks).filter((k) => data.counts.checks[k]) }));
    return;
  }

  if (cmd === "score") {
    const historyFile = path.join(out, "history.json");
    const history = readJson(historyFile, []);
    const result = score({
      accounts: readJsonl(path.join(raw, "accounts.jsonl")),
      contacts: readJsonl(path.join(raw, "contacts.jsonl")),
      opps: readJsonl(path.join(raw, "opps.jsonl")),
      counts: readJson(path.join(raw, "counts.json"), {}),
      history,
    });
    fs.writeFileSync(path.join(out, "score.json"), JSON.stringify(result, null, 2));
    history.push({ at: result.inspected_at, score: result.score, grade: result.grade, crm: result.crm });
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === "card") {
    const result = readJson(path.join(out, "score.json"), null);
    if (!result) throw new Error("Run `score` first.");
    const file = path.join(out, "scorecard.html");
    fs.writeFileSync(file, renderCard(result));
    console.log(JSON.stringify({ ok: true, file }));
    return;
  }

  console.error("usage: hygiene.mjs pull --crm salesforce|hubspot|attio | score | card  [--out dir]");
  process.exit(2);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(`ERROR: ${e.message}`); process.exit(1); });
}
