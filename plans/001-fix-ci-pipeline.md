# Plan 001: Get the CI pipeline passing again

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- .github/workflows/CI.yml`
> If this file changed since this plan was written, compare the "Current
> state" excerpt below against the live file before proceeding; on a
> mismatch, treat it as a STOP condition.
>
> **This plan touches CI config, not application code.** It cannot be
> verified by running the app; verification is "does this workflow run
> clean when GitHub Actions executes it," which you can approximate locally
> by running the same commands the workflow runs, on a supported Node
> version, and by confirming no step references a script that doesn't
> exist. You will not be able to trigger an actual GitHub Actions run from
> this environment — that's expected; the done criteria below are designed
> to be checkable without one.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

Every CI run on this repository has failed since at least 2026-05-01 (the
oldest "Update dependencies" run checked), including the most recent run on
`main` at commit `bb7488e`. There is currently no working automated signal
telling anyone whether a change breaks the build, lint, typecheck, or test
suite — every other plan in this batch (and any future change) merges
without that safety net.

Root cause, confirmed directly from the actual GitHub Actions run logs for
the `CI` workflow's most recent execution:

1. The `build` job's matrix includes Node `14.x`. Next.js `14.1.0` (this
   repo's pinned version) does not support Node 14 at all; the `npm ci`
   step itself fails outright on that leg with `npm ERR! Cannot read
   property '@headlessui/react' of undefined`.
2. The `test` job (`Run all tests`) runs on Node `16.x` only. Its `Linter`
   step (`npm run lint`, which runs `next lint`) fails immediately with:
   `You are using Node.js 16.20.2. For Next.js, Node.js version >= v18.17.0
   is required.` — this is not an ESLint rule violation, it's Next.js's own
   CLI refusing to run on an unsupported Node version. Because this step
   fails, every subsequent step in that job (`Type checking`, `Run unit
   tests`, `Run storybook tests`, `Run e2e tests`) is skipped, not run.
3. Independently of the above: the `test` job's `Run storybook tests` step
   runs `npm run test-storybook:ci`. This repository has **no Storybook
   setup at all** — no `.storybook/` directory, no `storybook` dependency
   in `package.json`, and no `test-storybook:ci` script defined. Even once
   the Node-version blocker is fixed, this step would fail immediately
   with an `npm error Missing script: "test-storybook:ci"`. This step is
   leftover from a template/boilerplate this project started from (the
   README still describes "🎉 Storybook for UI development" as a feature)
   and was apparently never actually wired up.

Because matrix jobs in this workflow use GitHub Actions' default
`fail-fast: true` behavior (not explicitly configured, so it's on by
default), the `14.x` build failure also **cancels** the sibling `16.x` and
`18.x` build jobs mid-run — so even the builds that would otherwise have
succeeded never get the chance to report a real result.

## Current state

`.github/workflows/CI.yml`, full current file:

```yaml
1	name: CI
2
3	on:
4	  push:
5	    branches: [main]
6	  pull_request:
7	    branches: [main]
8
9	jobs:
10	  build:
11	    strategy:
12	      matrix:
13	        node-version: [14.x, 16.x, 18.x]
14	        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/
15
16	    name: Build with ${{ matrix.node-version }}
17	    runs-on: ubuntu-latest
18
19	    steps:
20	      - uses: actions/checkout@v3
21	      - name: Use Node.js ${{ matrix.node-version }}
22	        uses: actions/setup-node@v3
23	        with:
24	          node-version: ${{ matrix.node-version }}
25	          cache: "npm"
26	      - run: npm ci
27	      - run: npm run build-prod
28
29	  test:
30	    strategy:
31	      matrix:
32	        node-version: [16.x]
33
34	    name: Run all tests
35	    runs-on: ubuntu-latest
36
37	    steps:
38	      - uses: actions/checkout@v3
39	        with:
40	          fetch-depth: 0 # Retrieve Git history, needed to verify commits
41	      - name: Use Node.js ${{ matrix.node-version }}
42	        uses: actions/setup-node@v3
43	        with:
44	          node-version: ${{ matrix.node-version }}
45	          cache: "npm"
46	      - run: npm ci
47
48	      - if: github.event_name == 'pull_request'
49	        name: Validate all commits from PR
50	        run: npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --verbose
51
52	      - name: Linter
53	        run: npm run lint
54
55	      - name: Type checking
56	        run: npm run check-types
57
58	      - name: Run unit tests
59	        run: npm run test
60
61	      - name: Run storybook tests
62	        run: npm run test-storybook:ci
63
64	      - name: Run e2e tests
65	        run: npx percy exec -- npm run e2e:headless
66	        env:
67	          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
68	```

`package.json`'s `scripts` block (confirming `test-storybook:ci` does not
exist — this is the full list, for reference, do not modify
`package.json` as part of this plan):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "build-stats": "cross-env ANALYZE=true yarn build",
  "export": "next export",
  "build-prod": "run-s clean build export",
  "clean": "rimraf .next out",
  "lint": "next lint",
  "format": "next lint --fix && prettier '**/*.{json,yaml}' --write --ignore-path .gitignore",
  "check-types": "tsc --noEmit --pretty && tsc --project cypress --noEmit --pretty",
  "test": "jest",
  "commit": "cz",
  "cypress": "cypress open",
  "cypress:headless": "cypress run",
  "e2e": "start-server-and-test dev http://localhost:3000 cypress",
  "e2e:headless": "start-server-and-test dev http://localhost:3000 cypress:headless",
  "prepare": "husky install",
  "postbuild": "next-sitemap"
}
```

Next.js's documented minimum Node version for `next@14.1.0`/`14.2.x` is
`^18.17.0 || >=20.0.0` (this is what the CI log's own error message states
directly; you don't need to independently verify Next.js's support matrix
beyond that log line).

## Commands you will need

| Purpose                        | Command                              | Expected on success |
|---------------------------------|----------------------------------------|---------------------|
| Confirm no other npm script references Storybook | `grep -rn "storybook" package.json` | no matches |
| Confirm no Storybook config exists | `find .storybook 2>/dev/null; echo done` (or equivalent — just confirming absence) | no `.storybook` directory |
| YAML sanity check | `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/CI.yml', 'utf8'))"` if the `yaml` package is available, otherwise visually re-read the file for indentation consistency | no parse error |

This plan doesn't have a "run the test suite" verification step in the
traditional sense, because the thing being fixed is the environment the
test suite runs in, not the tests themselves. Your primary verification is
careful, literal re-reading of the YAML you produce against the structure
shown in Step 1-3 below, plus the presence/absence greps above.

## Scope

**In scope** (the only files you should modify):
- `.github/workflows/CI.yml`

**Out of scope** (do NOT touch, even though they look related):
- `.github/workflows/release.yml` and `.github/workflows/update-deps.yml`
  — both also pin `node-version: 16.x` and have the same underlying
  incompatibility (confirmed via `gh run list`: recent "Release" and
  "Update dependencies" runs also failed), but they weren't part of the
  audited finding this plan implements. Flagged in "Maintenance notes"
  below as clear follow-up work, not done here.
- `package.json` — do not add a `test-storybook:ci` script or any
  Storybook dependency; the correct fix here is removing the CI step that
  references a feature this repo never actually adopted, not building out
  Storybook to match it.
- `README.md`'s claim of Storybook as a feature — a docs-accuracy cleanup,
  not part of this plan's scope.
- Any application source code — this plan only touches CI configuration.

## Git workflow

- Branch: `advisor/001-fix-ci-pipeline`
- Commit message style: Conventional Commits (e.g. `fix: repair CI
  pipeline — drop unsupported Node versions and remove dead Storybook step`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Drop unsupported Node versions from the `build` job matrix

Change:

```yaml
  build:
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/
```

to:

```yaml
  build:
    strategy:
      matrix:
        node-version: [18.x, 20.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/
        # Next.js 14 requires Node >= 18.17.0 — see the `test` job's
        # Linter step history for why 14.x/16.x were dropped.
```

**Verify**: re-read the file — the `matrix.node-version` array under
`build` should read exactly `[18.x, 20.x]`.

### Step 2: Fix the `test` job's Node version

Change:

```yaml
  test:
    strategy:
      matrix:
        node-version: [16.x]
```

to:

```yaml
  test:
    strategy:
      matrix:
        node-version: [20.x]
```

**Verify**: re-read the file — the `matrix.node-version` array under
`test` should read exactly `[20.x]`.

### Step 3: Remove the dead Storybook step

Delete this entire step from the `test` job (currently lines 61-62,
between "Run unit tests" and "Run e2e tests"):

```yaml
      - name: Run storybook tests
        run: npm run test-storybook:ci
```

Leave every other step in the `test` job (`Validate all commits from PR`,
`Linter`, `Type checking`, `Run unit tests`, `Run e2e tests`) exactly as
they are — this plan does not change what those steps do, only the
environment they run in (Step 1/2) and removes the one step that was
guaranteed to fail regardless of Node version (this step).

**Verify**: `grep -n "storybook" .github/workflows/CI.yml` → no matches.

### Step 4: Re-read the whole file for YAML correctness

Manually re-read the resulting `.github/workflows/CI.yml` top to bottom.
Confirm:
- Indentation is consistent 2-space YAML throughout (no tabs, no mixed
  indentation introduced by your edits).
- The `test` job still has exactly 6 steps in this order: checkout,
  setup-node, `npm ci`, "Validate all commits from PR" (conditional),
  Linter, Type checking, Run unit tests, Run e2e tests. (Storybook step
  removed per Step 3 — that's 7 named steps plus checkout/setup-node/npm
  ci as unnamed/simply-named steps; count carefully against the "Current
  state" excerpt minus the deleted block.)
- The `build` job still has exactly checkout, setup-node, `npm ci`,
  `npm run build-prod` — unchanged except for the matrix values from
  Step 1.

**Verify**: the resulting file should have exactly 2 fewer lines than the
original (the deleted 2-line Storybook step), plus whatever net line
change comes from the comment added in Step 1 (if you included it) — an
exact line count isn't the point; a careful structural re-read is.

## Test plan

CI configuration has no unit-testable logic in the traditional sense. The
"test" for this plan is:
- `grep -n "storybook" .github/workflows/CI.yml` returns no matches
  (confirms Step 3).
- `grep -n "node-version" .github/workflows/CI.yml` shows exactly `[18.x,
  20.x]` for `build` and `[20.x]` for `test` (confirms Steps 1-2).
- A structural re-read (Step 4) confirms nothing else was accidentally
  altered — YAML is whitespace-sensitive and easy to subtly break.
- If you have the ability to validate the workflow file's syntax
  (e.g. `actionlint` or a YAML parser is available in your environment),
  run it; if not, the manual re-read is the fallback and is sufficient for
  this plan's done criteria.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "storybook" .github/workflows/CI.yml` returns no matches
- [ ] `grep -n "node-version: \[14.x, 16.x, 18.x\]"` and
      `grep -n "node-version: \[16.x\]"` both return no matches in
      `.github/workflows/CI.yml`
- [ ] `grep -n "node-version: \[18.x, 20.x\]"` and
      `grep -n "node-version: \[20.x\]"` each return exactly one match in
      `.github/workflows/CI.yml`
- [ ] The file is still valid YAML (parses without error, or a careful
      manual re-read finds no structural issues)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 001 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The live `.github/workflows/CI.yml` doesn't match the "Current state"
  excerpt above.
- You find evidence Storybook actually *is* used somewhere in this repo
  that this plan's investigation missed (e.g. a `.storybook/` directory
  appears, or a `storybook` dependency is present in `package.json`) —
  that would mean Step 3's premise is wrong; stop and report instead of
  deleting the step.
- You have a way to actually trigger a GitHub Actions run from your
  environment and it still fails after this plan's changes for a reason
  unrelated to Node version or the Storybook step — stop and report the
  new failure rather than continuing to patch CI beyond this plan's scope.

## Maintenance notes

- `.github/workflows/release.yml` and `.github/workflows/update-deps.yml`
  both still pin `node-version: 16.x` and are very likely still broken for
  the same underlying reason (Next.js requiring >=18.17.0) — `gh run list`
  showed recent failures on both "Release" and "Update dependencies"
  workflows. This wasn't part of the audited/approved finding for this
  plan, but whoever picks up CI/DX work next should treat it as an
  obvious, closely-related follow-up.
- The README (`README.md`) still advertises "🎉 Storybook for UI
  development" as a feature of this project, which is no longer (or never
  was, in this fork) accurate — a documentation-accuracy fix, not in scope
  here.
- Once this plan lands, every other plan in this batch
  (`plans/002` through `plans/007`) should get real CI signal on their
  next push — reviewers should treat a still-red CI run after this plan
  merges as a signal to re-open this plan, not silently work around it.
