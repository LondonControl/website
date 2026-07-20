# Plan 015: Remove dead `OrderCard`/`DownloadCard` components

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/components/OrderCard/index.tsx src/components/DownloadCard/index.tsx src/pages/orders/index.tsx src/pages/downloads.tsx`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts below against the live files before proceeding;
> on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW — removing genuinely unreferenced code.
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/components/OrderCard/index.tsx` and
`src/components/DownloadCard/index.tsx` are full React components with no
live usage anywhere in the app. They're referenced only inside
commented-out JSX blocks in `src/pages/orders/index.tsx` and
`src/pages/downloads.tsx` — leftovers from the large table-based UI
refactor (commit `e871120`) that replaced the card-based rendering with
`OrdersTable`/`DownloadsTable`. Neither page even has a live `import`
statement for `OrderCard` or `DownloadCard` — confirmed by reading both
files' full import blocks; the only remaining trace is the dead comment
text.

Shipping dead components (and their associated dead JSX comments) costs
nothing at runtime, but it's a maintenance trap: a future contributor
searching for "where are orders rendered as cards" will find this
component and reasonably assume it's live, wasting time investigating (or
worse, "fixing" a bug in it) before discovering it's unreachable.

## Current state

`src/pages/orders/index.tsx`, relevant excerpt (lines 79-88):

```tsx
79	        ) : (
80	          <div className="mt-8 tablet:mt-12">
81	            <div className="mx-auto">
82	              {/* {data.data.map((order: Order) => (
83	                <OrderCard order={order} key={order.id} />
84	              ))} */}
85	              <OrdersTable columns={OrdersColumns} data={data.data} />
86	            </div>
87	          </div>
88	        )}
```

`src/pages/downloads.tsx`, relevant excerpt (lines 81-94):

```tsx
81	        ) : (
82	          <div className="mt-8 tablet:mt-12">
83	            <div className="mx-auto">
84	              {/* {data?.data.map((userProduct: UserProduct) => (
85	                <DownloadCard
86	                  key={userProduct.id}
87	                  product={userProduct.product}
88	                  serialKey={userProduct.serial_key}
89	                />
90	              ))} */}
91	              <DownloadsTable columns={DownloadsColumns} data={data?.data} />
92	            </div>
93	          </div>
94	        )}
```

**Important**: `src/components/OrderCard/` also contains
`OrderStatusBadge.tsx`, which is a **separate, live** component imported
by `src/components/Tables/OrdersTable.tsx` (`import OrderStatusBadge from
'@/components/OrderCard/OrderStatusBadge';`) and, currently, also by
`OrderCard/index.tsx` itself. **Only delete `OrderCard/index.tsx` — do
not delete the `OrderCard/` directory or `OrderStatusBadge.tsx`.**
Confirm this with `grep -rn "OrderStatusBadge" src/` before deleting
anything — it should show `OrderCard/index.tsx` (about to be deleted),
`OrderCard/OrderStatusBadge.tsx` (the definition, to keep), and
`Tables/OrdersTable.tsx` (a live consumer, to keep) as the only matches.

## Commands you will need

| Purpose   | Command                                                           | Expected on success |
|-----------|------------------------------------------------------------------------|---------------------|
| Confirm no other importers | `grep -rn "OrderCard'" src/` and `grep -rn "DownloadCard'" src/` (note the trailing quote, to match the import path ending, not `OrderCard.test.tsx` or similar) | only the files this plan removes/edits |
| Typecheck | `npm run check-types`                                                    | exit 0, no errors    |
| Tests     | `npx jest src/pages/orders src/pages/downloads`                        | all pass (or "no tests found" if neither page has a test file yet — that's fine, not a failure) |
| Lint      | `npx eslint src/pages/orders/index.tsx src/pages/downloads.tsx`        | exit 0, no errors    |

## Scope

**In scope** (the only files you should modify/delete):
- `src/components/OrderCard/index.tsx` (delete)
- `src/components/DownloadCard/index.tsx` (delete)
- `src/pages/orders/index.tsx` (remove the dead comment block only)
- `src/pages/downloads.tsx` (remove the dead comment block only)

**Out of scope** (do NOT touch, even though they look related):
- `src/components/OrderCard/OrderStatusBadge.tsx` — live, keep it, and
  keep the `OrderCard/` directory itself (don't delete a directory that
  still contains a live file).
- `src/components/Tables/OrdersTable.tsx`, `DownloadsTable.tsx` — not
  modified by this plan (they're the live replacements, already correct).
- The `if (error) toast.error(...)` pattern visible in both page files
  above — that's a separate finding
  (`plans/019-fix-documents-toast-render.md`, which also covers these two
  files); don't fix it here.

## Git workflow

- Branch: `advisor/015-remove-dead-card-components`
- Commit message style: Conventional Commits (e.g. `fix: remove dead
  OrderCard/DownloadCard components and their commented-out references`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm there are no other importers

**Verify**: `grep -rn "from '@/components/OrderCard'" src/` and
`grep -rn "from '@/components/DownloadCard'" src/` (or equivalent
relative-import forms) → no matches anywhere in `src/` (the commented-out
JSX text doesn't count as a match since it's not a valid `import`
statement — these greps are checking for real imports specifically).

### Step 2: Delete the two dead component files

Delete `src/components/OrderCard/index.tsx` and
`src/components/DownloadCard/index.tsx`. Do not delete
`src/components/OrderCard/OrderStatusBadge.tsx` or the `OrderCard/`
directory itself (it still contains that file).

**Verify**: `find src/components/OrderCard src/components/DownloadCard -type f` (or equivalent) shows only `src/components/OrderCard/OrderStatusBadge.tsx` remaining; `src/components/DownloadCard/` should now be empty or gone entirely (delete the empty directory too, if your tooling leaves it behind).

### Step 3: Remove the dead commented-out JSX in both pages

In `src/pages/orders/index.tsx`, replace lines 79-88 with:

```tsx
        ) : (
          <div className="mt-8 tablet:mt-12">
            <div className="mx-auto">
              <OrdersTable columns={OrdersColumns} data={data.data} />
            </div>
          </div>
        )}
```

In `src/pages/downloads.tsx`, replace lines 81-94 with:

```tsx
        ) : (
          <div className="mt-8 tablet:mt-12">
            <div className="mx-auto">
              <DownloadsTable columns={DownloadsColumns} data={data?.data} />
            </div>
          </div>
        )}
```

**Verify**: `grep -n "OrderCard\|DownloadCard" src/pages/orders/index.tsx src/pages/downloads.tsx` → no matches in either file.

### Step 4: Typecheck and lint

**Verify**:
1. `npm run check-types` → exit 0, no errors.
2. `npx eslint src/pages/orders/index.tsx src/pages/downloads.tsx` → exit 0, no errors.

### Step 5: Run whatever tests exist for the touched pages

**Verify**: `npx jest src/pages/orders src/pages/downloads` → all pass (or
reports no test files found, which is an acceptable outcome here — these
pages had no dedicated test file as of this plan being written; if
`plans/020-expand-critical-path-test-coverage.md` has since added one,
those tests must pass).

## Test plan

No new tests — this plan removes dead code and a dead comment; there's no
new behavior to cover. The existing (if any) tests for `orders/index.tsx`
and `downloads.tsx` are the regression guard that nothing live broke.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `src/components/OrderCard/index.tsx` no longer exists
- [ ] `src/components/DownloadCard/index.tsx` no longer exists
- [ ] `src/components/OrderCard/OrderStatusBadge.tsx` still exists,
      unmodified
- [ ] `grep -rn "OrderCard\|DownloadCard" src/pages/orders/index.tsx src/pages/downloads.tsx` returns no matches
- [ ] `npm run check-types` exits 0
- [ ] `npx eslint src/pages/orders/index.tsx src/pages/downloads.tsx` exits 0
- [ ] `npx jest src/pages/orders src/pages/downloads` exits 0 (pass, or no tests found)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 015 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `grep -rn "from '@/components/OrderCard'"` or the `DownloadCard`
  equivalent finds a real (non-commented) importer this plan's research
  missed.
- The live files don't match the "Current state" excerpts above.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- None — this is a straightforward dead-code removal with no follow-up
  implied.
