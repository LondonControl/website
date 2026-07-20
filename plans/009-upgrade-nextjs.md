# Plan 009: Upgrade Next.js to close known high-severity advisories

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- package.json`
> If `next`'s pinned version in `package.json` has already changed since
> this plan was written, re-run `npm audit --omit=dev` before proceeding
> and treat a materially different advisory list as a STOP condition (the
> version targets below may already be stale).
>
> **This plan runs `npm install`, which is normally a mutating operation
> outside this workflow's read-only default — that's expected and required
> here** (dependency upgrades cannot be done any other way); the isolated
> worktree this plan executes in is exactly what that mutation is scoped
> to.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — a framework major-version bump touches the entire app's
  request/render pipeline even when no source changes are required; the
  risk is regressions that only show up at runtime, not at typecheck/build
  time.
- **Depends on**: `plans/001-fix-ci-pipeline.md` (soft — this plan's own
  verification doesn't require CI, but you want a working CI pipeline to
  catch anything this plan's local verification misses, and the new Next
  version's Node engine requirement, `^18.18.0 || >=20.0.0`, only has real
  CI coverage after plan 001 drops the Node 14.x/16.x matrix legs)
- **Category**: migration
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`package.json` pins `"next": "^14.1.0"`; the installed version resolved by
that range at audit time was `14.2.35`. Running `npm audit --omit=dev`
against the installed tree reported 6 high-severity and 1 moderate
advisory directly against `next`, including:

- `GHSA-h25m-26qc-wcjf` — HTTP request deserialization DoS via insecure
  React Server Components (range `>=13.0.0 <15.0.8`)
- `GHSA-q4gf-8mx6-v5v3` — Denial of Service with Server Components (high)
- `GHSA-9g9p-9gw9-jx7f` — DoS via Image Optimizer `remotePatterns`
  configuration (range `>=10.0.0 <15.5.10`)
- `GHSA-ggv3-7p47-pfv8` — HTTP request smuggling in rewrites (range
  `>=9.5.0 <15.5.13`)
- `GHSA-3x4c-7xq6-9pq8` — unbounded `next/image` disk cache growth (range
  `>=10.0.0 <15.5.14`)

None of these are fully closed by any `14.x` patch release — the fix
floors are all in the `15.x` line. This app is publicly reachable (it's a
commercial storefront), so DoS-class advisories against the framework
serving every page are a real production concern, not a theoretical one.

The good news, confirmed by checking the npm registry directly rather than
assuming: **this upgrade does not require a React major-version bump.**
`next@15.5.20`'s `peerDependencies` accept `react: '^18.2.0 || ...^19.0.0'`
— this repo's installed `react@18.3.1`/`react-dom@18.3.1` already satisfy
that range as-is. Every other `next`-adjacent dependency in this repo
(`next-seo`, `next-sitemap`, `next-themes`, `@vercel/speed-insights`)
declares a peer range that also already accepts Next 15 and React 18 —
confirmed via `npm view <pkg> peerDependencies` against the registry, not
assumed from changelogs. `@next/bundle-analyzer` and `eslint-config-next`
both publish a `15.5.20` release matching the `next` version this plan
targets, so all four `next`-published packages in this repo move together
cleanly.

This app is Pages Router only (no `app/` directory exists in this repo —
confirm with `find src/app 2>/dev/null` returning nothing) — the App
Router / Server Components changes that make up most of Next 15's
breaking-change surface (async `cookies()`/`headers()`, caching default
changes, etc.) don't apply here. The realistic regression surface for this
upgrade is narrower than a typical Next 14→15 migration.

## Current state

`package.json`, relevant lines:

```json
"dependencies": {
  ...
  "next": "^14.1.0",
  ...
},
"devDependencies": {
  ...
  "@next/bundle-analyzer": "^14.1.0",
  ...
  "eslint-config-next": "^14.1.0",
  ...
}
```

Installed versions at audit time (`npm ls next`): `next@14.2.35` (resolved
from the `^14.1.0` range — the range itself is what needs to change, not
just what happens to be installed).

`next.config.js`, full current file:

```js
/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  eslint: {
    dirs: ['.'],
  },
  images: {
    domains: ['placehold.co'],
  },
  poweredByHeader: false,
  trailingSlash: true,
  basePath: '',
  reactStrictMode: true,
  webpack: (config) => {
    // eslint-disable-next-line no-param-reassign
    config.resolve.alias.canvas = false;

    return config;
  },
});
```

The `images.domains` array-of-strings form has been soft-deprecated since
Next 14 in favor of `images.remotePatterns` (deprecation warning at build
time, not a hard error in the 15.x line) — this repo doesn't use
`next/image` anywhere (confirmed via the repo-wide
`@next/next/no-img-element: 'off'` ESLint override and its comment "We
currently not using next/image"), so this config key is effectively unused
dead configuration already. Migrating it is low-risk cleanup bundled into
this plan since you'll be touching this exact file anyway.

## Commands you will need

| Purpose            | Command                                              | Expected on success |
|----------------------|----------------------------------------------------------|---------------------|
| Install              | `npm install`                                              | exit 0               |
| Typecheck            | `npm run check-types`                                      | exit 0, no errors    |
| Lint                 | `npm run lint`                                              | exit 0, no errors    |
| Unit tests            | `npm run test`                                             | all pass              |
| Production build      | `npm run build`                                            | exit 0, build succeeds |
| Audit (verify the fix)| `npm audit --omit=dev`                                     | 0 advisories against `next` |
| Dev server smoke test  | `npm run dev` (start, then manually verify `/`, `/login`, `/products/`, `/checkout/` render — see Step 5) | pages render without a Next.js error overlay |

This is the one plan in this batch where running the full, repo-wide
`npm run lint`/`npm run test` (not scoped to a subset of files) is
correct and expected — the change touches the framework every page and
build depends on, so partial verification isn't meaningful here. If `npm
run lint`/`npm run test` fail for reasons clearly unrelated to this
upgrade (i.e. failures you can confirm also exist on the `bb7488e`
baseline before your changes), note them in your completion report rather
than treating them as blocking — but if you can't clearly attribute a
failure to a pre-existing issue, treat it as this plan's problem to fix or
a STOP condition.

## Scope

**In scope** (the only files you should modify):
- `package.json` (the `next`, `@next/bundle-analyzer`,
  `eslint-config-next` version specifiers)
- `package-lock.json` (regenerated by `npm install`)
- `next.config.js` (the `images.domains` → `images.remotePatterns`
  migration described in Step 3)
- Any application file that a build or typecheck failure after the
  upgrade points you to directly — see Step 4 and the STOP conditions
  before touching anything not already listed here.

**Out of scope** (do NOT touch, even though they look related):
- `yarn.lock` — `plans/016-standardize-npm-tooling.md` handles the
  npm/yarn lockfile question; don't delete or regenerate it here even
  though `npm install` will make it further out of sync.
- `react`/`react-dom` versions — no change needed (see "Why this
  matters").
- Any `app/` directory or App Router migration — this repo is Pages
  Router only; do not introduce App Router files as part of this plan.
- Upgrading to Next 16 — evaluated and rejected for this plan (see
  "Maintenance notes"); stay on the `15.x` line.

## Git workflow

- Branch: `advisor/009-upgrade-nextjs`
- Commit message style: Conventional Commits (e.g. `fix: upgrade Next.js
  to 15.5.20 to close known high-severity advisories`) — note `fix:` not
  `chore:`/`build:`, since the motivating reason is security advisories,
  matching this repo's semantic-release convention where `fix:` triggers
  a patch release.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Bump the version specifiers

In `package.json`, change:

```json
"next": "^14.1.0",
```

to:

```json
"next": "^15.5.20",
```

And in `devDependencies`:

```json
"@next/bundle-analyzer": "^14.1.0",
...
"eslint-config-next": "^14.1.0",
```

to:

```json
"@next/bundle-analyzer": "^15.5.20",
...
"eslint-config-next": "^15.5.20",
```

**Verify**: `npm install` → exit 0. Then `npm ls next` → shows
`next@15.x.x` (not `14.x.x`).

### Step 2: Confirm the advisories are closed

**Verify**: `npm audit --omit=dev` → the `next` package should no longer
appear in the vulnerability list at all. If `tar`/`@mapbox/node-pre-gyp`
advisories are still present, that's expected and out of scope — those
are unrelated to `next` and not part of this plan (see "Findings
considered but not planned" in `plans/README.md` if present, or otherwise
leave them for a separate audit item).

### Step 3: Migrate `images.domains` to `images.remotePatterns`

In `next.config.js`, replace:

```js
images: {
  domains: ['placehold.co'],
},
```

with:

```js
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
},
```

**Verify**: `npm run build` (Step 5) completes without an `images.domains
is deprecated` warning in the output.

### Step 4: Typecheck, lint, and build

Run each in order, fixing anything that surfaces as a **direct
consequence of the Next.js 15 upgrade** (e.g. a changed exported type from
`next`, a `next.config.js` option that's now invalid). Do not fix
unrelated pre-existing issues you happen to notice — note them instead and
move on.

**Verify**:
1. `npm run check-types` → exit 0, no errors.
2. `npm run lint` → exit 0, no errors (this is `next lint`, so it also
   exercises the new `next` binary directly).
3. `npm run test` → all existing tests pass (this upgrade should not
   require test changes; if it does, that's a signal something broke —
   investigate before "fixing" a test to match new behavior).
4. `npm run build` → exit 0, production build succeeds, no new warnings
   about deprecated config options.

### Step 5: Manual smoke test via the dev server

Start the dev server (`npm run dev`) and manually load these routes in a
browser, confirming each renders without a Next.js error overlay and
without new console errors compared to what you'd see on the `bb7488e`
baseline:

- `/` (marketing homepage — exercises static rendering, `framer-motion`,
  fonts)
- `/login/` (client-fetched auth page)
- `/products/` (SWR data fetching)
- `/checkout/` (PayPal SDK integration — the most likely place a subtle
  Next.js behavior change would surface, given it embeds a third-party
  script)
- `/news/` (uses `getStaticProps`, the one page in this repo that does)

Stop the dev server when done. This step has no automated "expected
output" beyond "no error overlay, no new console errors" — use your
judgment, and if anything looks wrong, treat it as this plan's problem to
either fix (if small and clearly caused by the upgrade) or escalate via
the STOP conditions (if not small/clear).

## Test plan

No new test files are required by this plan — the existing test suite
(`npm run test`) is the regression guard, on the theory that this is a
dependency-version change, not a behavior change; if the existing suite
was adequate before, it's the right bar to hold this upgrade to as well.
If any existing test needs to change to keep passing, that's a signal
worth flagging in your completion report even if you do fix it, since it
means the upgrade changed *something* observable.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm ls next` shows a `15.x.x` version
- [ ] `npm audit --omit=dev` shows zero advisories for the `next` package
- [ ] `npm run check-types` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run test` exits 0, all existing tests pass
- [ ] `npm run build` exits 0
- [ ] `grep -n "images.domains" next.config.js` returns no matches (now
      `images.remotePatterns`)
- [ ] Manual smoke test of the five routes in Step 5 completed with no
      Next.js error overlay
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 009 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm install` reports a peer dependency conflict that contradicts this
  plan's "Why this matters" research (i.e. something *does* require a
  React major bump) — the registry check backing this plan may be stale.
- `npm run build` fails with an error that isn't a small, mechanical fix
  (e.g. it points at a genuine App-Router-only API being used somewhere,
  which would mean this repo isn't as purely Pages-Router as this plan
  assumed).
- The manual smoke test in Step 5 shows the PayPal button failing to
  render or a checkout-flow error — do not attempt to debug PayPal SDK
  integration issues under this plan; report back with what you observed.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- This plan deliberately targets the `15.x` line, not the latest major
  (`16.x`, which requires Node `>=20.9.0` and has a narrower/unclear React
  18 support story at the time this plan was written) — re-evaluate a
  Next 16 upgrade as its own future plan once this one has been stable in
  production for a while, not bundled here.
- `plans/012-fix-static-export-build.md` investigates whether this repo's
  `next export`-based build pipeline is even the right deploy target
  going forward; if that investigation concludes the app should move to
  `output: 'standalone'` or a different deploy model, revisit
  `next.config.js` again as part of that work rather than assuming this
  plan's `next.config.js` changes are the final word.
- Once Next 15 is confirmed stable, `images.remotePatterns` (Step 3) sets
  this repo up to safely adopt `next/image` in the future if that's ever
  revisited — not required by this plan, just a side benefit of doing the
  migration now instead of leaving deprecated config in place.
