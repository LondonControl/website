# Plan 012: Remove the broken `next export` build path

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- package.json`
> If this file changed since this plan was written, compare the "Current
> state" excerpt below against the live file before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW — removes a build path that cannot currently succeed
  anyway (see "Why this matters"); nothing that works today stops working.
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`package.json` defines `"export": "next export"` and `"build-prod":
"run-s clean build export"`. Three independent, converging pieces of
evidence show this script cannot succeed as written, and hasn't been the
right build path for this app for a while:

1. **`next export` no longer exists as a standalone CLI subcommand.**
   Next.js removed it starting with the 13.4/14 line in favor of setting
   `output: 'export'` in `next.config.js`. This repo's `next.config.js`
   does not set `output: 'export'` (confirmed by reading the file in
   full). Running `next export` today errors immediately.
2. **Even if that were fixed, static export is architecturally
   incompatible with this app as it exists today**, because
   `src/pages/api/contact.ts` is a Next.js API route, and Next.js
   explicitly disallows API routes when exporting statically — the build
   fails outright with an error to that effect. As long as the contact
   form's backend (`/api/contact`) is a Next.js API route rather than
   being handled by the separate Laravel backend, this app cannot be
   statically exported, independent of the CLI syntax issue.
3. **The actual deploy target is almost certainly Vercel, which doesn't
   use `next export` output at all.** `package.json` depends on
   `@vercel/speed-insights`, a package that only does anything meaningful
   when the app is actually deployed on Vercel's platform — Vercel builds
   and serves the `.next` output directly (SSR/ISR/serverless functions
   included) and has no use for a static `out/` directory. There is no
   `vercel.json`, `netlify.toml`, or other deploy config in the repo, and
   `README.md` is unmodified boilerplate from the original
   `ixartz/Next-js-Boilerplate` template this project started from — its
   "Deploy to Netlify" / static-export instructions were never actually
   adapted to this project and don't reflect how it's really deployed.

Net effect: `npm run build-prod` — the script CI's `build` job actually
invokes (`.github/workflows/CI.yml`, `run: npm run build-prod`) — is
currently guaranteed to fail at the `export` step even after
`plans/001-fix-ci-pipeline.md` fixes the Node version matrix, because the
failure isn't Node-version-related; it's that the `export` step doesn't
work for this app at all. This plan removes it so CI's build job can
actually pass.

## Current state

`package.json`, `scripts` block (relevant lines):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "build-stats": "cross-env ANALYZE=true yarn build",
  "export": "next export",
  "build-prod": "run-s clean build export",
  "clean": "rimraf .next out",
  ...
}
```

`next.config.js`, full current file (confirming no `output: 'export'` is
set):

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

`.github/workflows/CI.yml`'s `build` job (relevant line, after
`plans/001-fix-ci-pipeline.md` has landed — this plan doesn't depend on
001, but both touch CI's build behavior so it's worth having the full
picture):

```yaml
      - run: npm ci
      - run: npm run build-prod
```

## Commands you will need

| Purpose   | Command                | Expected on success |
|-----------|---------------------------|---------------------|
| Build     | `npm run build-prod`       | exit 0               |
| Typecheck | `npm run check-types`      | exit 0, no errors    |

## Scope

**In scope** (the only files you should modify):
- `package.json` (the `export` and `build-prod` scripts only)

**Out of scope** (do NOT touch, even though they look related):
- `next.config.js` — no `output: 'export'` was ever set, so there's
  nothing to remove there; do not add or change any `output` config.
- `.github/workflows/CI.yml` — `plans/001-fix-ci-pipeline.md` owns CI
  changes; this plan's fix to `build-prod` is transparent to CI (it still
  calls `npm run build-prod`, which will just do less after this plan,
  not differently-named).
- `README.md` — it's confirmed-stale boilerplate describing Netlify/static
  export deployment that doesn't reflect this app's real Vercel-based
  deploy. Fixing the README's accuracy is a separate, lower-priority docs
  cleanup, not bundled into this plan.
- `src/pages/api/contact.ts` — not part of this plan; it's cited above only
  as evidence that static export can't work, not as something to change.

## Git workflow

- Branch: `advisor/012-fix-static-export-build`
- Commit message style: Conventional Commits (e.g. `fix: remove broken
  next export build step, app is deployed via Vercel's native Next.js
  build`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove the `export` script and simplify `build-prod`

Change:

```json
"export": "next export",
"build-prod": "run-s clean build export",
```

to:

```json
"build-prod": "run-s clean build",
```

(Delete the `"export"` line entirely rather than leaving it unused — a
script that references a nonexistent CLI subcommand shouldn't remain
callable.)

**Verify**: `grep -n "\"export\":" package.json` → no matches.
`grep -n "\"build-prod\":" package.json` → shows `"run-s clean build"`.

### Step 2: Confirm the build actually succeeds now

**Verify**: `npm run build-prod` → exit 0. This runs `clean` (removes
`.next`/`out`) then `build` (`next build`) — confirm the command
completes without the previous `export` step's failure.

### Step 3: Typecheck

**Verify**: `npm run check-types` → exit 0, no new errors (this step
shouldn't be affected by a `package.json` scripts change, but confirms
nothing else drifted).

## Test plan

No new test files — this is a build-tooling change with no application
logic to unit test. The verification is the build itself succeeding
(Step 2), which is the direct, concrete proof the fix works.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "\"export\":" package.json` returns no matches
- [ ] `grep -n "\"build-prod\": \"run-s clean build\"" package.json` matches exactly once
- [ ] `npm run build-prod` exits 0
- [ ] `npm run check-types` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 012 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `package.json`'s `scripts` block doesn't match the "Current state"
  excerpt above.
- `npm run build-prod` fails for a reason unrelated to the `export` step
  (e.g. a genuine build error in application code) — that's a
  pre-existing issue this plan didn't anticipate; report it rather than
  attempting to fix unrelated build errors under this plan's scope.
- You find evidence contradicting this plan's Vercel-deploy conclusion
  (e.g. a `vercel.json` absence turns out to be because deployment is
  configured entirely through Vercel's dashboard and NOT reflected in the
  repo at all is fine and expected — but if you find an actual
  `netlify.toml`, static hosting CI step, or similar that this plan's
  investigation missed, stop and report rather than proceeding on a
  contradicted assumption).

## Maintenance notes

- `README.md` still describes Netlify one-click deploy and a static
  `out/` folder workflow that no longer applies to this app. A future docs
  pass should rewrite the "Deploy to production" section to describe the
  actual (Vercel) deploy path, and probably remove the "Deploy to Netlify"
  section entirely unless Netlify support is a real, intentional goal —
  not addressed here to keep this plan's scope to the concrete build
  breakage.
- If static export ever becomes a real requirement again in the future
  (e.g. moving off Vercel), `src/pages/api/contact.ts` would need to move
  to a different hosting mechanism first (e.g. a serverless function
  outside Next's page-router API routes, or routing contact submissions
  through the existing Laravel backend instead) — that's a design
  decision for whoever picks that up, not assumed or partially done here.
