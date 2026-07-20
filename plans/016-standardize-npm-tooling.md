# Plan 016: Standardize on npm, remove the stray `yarn.lock`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- package.json yarn.lock`
> If either file changed since this plan was written, compare the
> "Current state" section below against the live files before proceeding;
> on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

Both `package-lock.json` and `yarn.lock` are committed at the repo root.
`.github/workflows/CI.yml` (and `release.yml`, `update-deps.yml`) use `npm
ci` exclusively — nothing in this repo's CI ever reads `yarn.lock`. It's
unverified dead weight: nobody's install is actually reproducible against
it, because nothing enforces it stays in sync with `package.json`, and the
last commit that touched it (`bb7488e`, "updates faq, removes copy and
updates deps") shows an 11,016-line diff, meaning it *is* being
regenerated from time to time (likely by a contributor running `yarn`
locally out of habit) — silently drifting the two lockfiles further apart
each time, with no CI signal either way.

Worse, `package.json`'s `build-stats` script hardcodes a Yarn invocation
(`"build-stats": "cross-env ANALYZE=true yarn build"`) despite every other
script in the file using `npm run <script>` conventions and CI using `npm`
exclusively. A contributor who only has npm installed (reasonably, since
that's what CI and every other script implies) gets a confusing "yarn:
command not found" the one time they try to run bundle analysis.

## Current state

`package.json`, the one Yarn-specific script (full `scripts` block for
context):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "build-stats": "cross-env ANALYZE=true yarn build",
  ...
}
```

`yarn.lock` exists at the repo root (large, generated file — not excerpted
here). `package-lock.json` also exists at the repo root and is what `npm
ci` actually uses in CI.

No `.yarnrc`, `.yarnrc.yml`, or other Yarn-specific configuration exists
anywhere in the repo (confirmed by search) — removing `yarn.lock` doesn't
leave any other Yarn-specific tooling behind.

## Commands you will need

| Purpose   | Command                | Expected on success |
|-----------|----------------------------|---------------------|
| Confirm no other Yarn references | `grep -rn "yarn" package.json .github/workflows/ .husky/ lint-staged.config.js commitlint.config.js` | only the one `build-stats` line, before your fix |
| Verify npm install still works | `npm install` | exit 0 |
| Verify the fixed script | `npm run build-stats` | exit 0, opens/produces the bundle analyzer output (or at minimum runs `next build` with `ANALYZE=true` without a "yarn not found" error) |

## Scope

**In scope** (the only files/paths you should modify):
- `package.json` (the `build-stats` script only)
- `yarn.lock` (delete)

**Out of scope** (do NOT touch, even though they look related):
- `package-lock.json` — this is the lockfile that matters; leave it
  exactly as npm manages it (don't hand-edit it, don't regenerate it
  unless `npm install` naturally updates it as a side effect of nothing
  else changing — if `npm install` reports changes to `package-lock.json`
  beyond what's expected from a no-op install, that's worth noting in
  your completion report but shouldn't happen from this plan's changes
  alone).
- Any CI workflow file — they already use `npm` exclusively; no change
  needed.

## Git workflow

- Branch: `advisor/016-standardize-npm-tooling`
- Commit message style: Conventional Commits (e.g. `fix: remove stray
  yarn.lock and fix build-stats script to use npm`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the scope of Yarn references

**Verify**: `grep -rn "yarn" package.json .github/workflows/ .husky/ lint-staged.config.js commitlint.config.js` → the only match should be the `build-stats` line in `package.json`. If there are others this plan's research missed, stop and report (see STOP conditions) rather than deciding on the spot whether they're safe to change too.

### Step 2: Fix the `build-stats` script

Change:

```json
"build-stats": "cross-env ANALYZE=true yarn build",
```

to:

```json
"build-stats": "cross-env ANALYZE=true npm run build",
```

**Verify**: `npm run build-stats` → exit 0, no "yarn: command not found"
error, and the bundle analyzer runs (it will attempt to open a browser tab
with the analyzer report — if your environment can't open a browser, the
underlying `next build` with `ANALYZE=true` completing successfully is
sufficient verification; the analyzer UI itself isn't something to
validate visually under this plan).

### Step 3: Delete `yarn.lock`

Delete the `yarn.lock` file from the repo root.

**Verify**: `find . -maxdepth 1 -iname "yarn.lock"` (or equivalent) →
no matches.

### Step 4: Confirm npm installs still work cleanly

**Verify**: `npm install` → exit 0. If `package-lock.json` shows
unexpected changes in `git status` beyond what you'd expect from a clean,
no-op install, investigate before proceeding — that would suggest
`package-lock.json` was already out of sync with `package.json` for a
reason unrelated to this plan, and is worth flagging rather than silently
committing.

## Test plan

No new test files — this is dependency-tooling cleanup with no
application logic to test. The verification is: `build-stats` runs
without needing Yarn (Step 2), and `npm install` still works cleanly with
`yarn.lock` gone (Step 4).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "yarn" package.json` returns no matches
- [ ] `yarn.lock` no longer exists in the repo
- [ ] `npm run build-stats` exits 0
- [ ] `npm install` exits 0 with no unexpected `package-lock.json` diff
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 016 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1's grep finds Yarn references beyond the single `build-stats`
  line this plan accounts for.
- `npm install` reports a `package-lock.json` change unrelated to this
  plan's edits (e.g. dependency versions shifting) — that suggests the
  lockfile was already stale independent of this plan; report it rather
  than silently committing an unrelated lockfile update.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If this team ever wants to standardize on Yarn instead of npm going
  forward, that's the opposite of this plan's direction and would need
  its own plan (deleting `package-lock.json` instead, updating all CI
  workflows to use `yarn`, etc.) — not something to reconsider silently
  mid-execution here.
