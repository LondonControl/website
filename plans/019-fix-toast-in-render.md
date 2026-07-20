# Plan 019: Move `toast.error()` calls out of the render body and into `useEffect`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/pages/documents/index.tsx src/pages/downloads.tsx src/pages/orders/index.tsx src/pages/products/index.tsx "src/pages/products/[id].tsx"`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts below against the live files before proceeding;
> on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW (MED for the `products/[id].tsx` crash-guard portion —
  see Step 5)
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

Five pages call `toast.error(...)` directly in the component's render
body, guarded only by `if (error) ...`, instead of inside a `useEffect`:

```tsx
const { data, error, isLoading } = useSWR(endpoint, fetcher);

if (error) toast.error('Something went wrong, please try again!');

return ( ... );
```

Two sibling files in this same codebase — `src/pages/utilities.tsx` and
`src/components/ProfileForms/ActiveSessionsForm.tsx` — already do this
correctly, wrapping the same check in a `useEffect(() => { if (error)
toast.error(...); }, [error])`. That's the converged, correct pattern;
these five files are the stragglers.

**Why it matters**: `error` is a stable SWR value that doesn't change
between re-renders once set — but the component *does* re-render for
other reasons (route changes, parent re-renders, any local state update
elsewhere on the page). Every one of those unrelated re-renders re-executes
the `if (error) toast.error(...)` line, calling `toast.error` again each
time, with no de-duplication. Depending on how long the error condition
persists and how often the page re-renders while it does, a user can see
the same error toast fire repeatedly instead of once. Wrapping it in a
`useEffect` keyed on `[error]` makes it fire exactly once per actual
error, matching `utilities.tsx`'s already-correct behavior.

**`products/[id].tsx` has a second, more serious bug in the same
neighborhood**: immediately after the `useSWR` call, it does:

```tsx
if (!isLoading) {
  data.data.images = Object.values(data.data.images);
}
```

If the fetch fails (`error` is set), `isLoading` becomes `false` but
`data` stays `undefined` — `data.data.images` then throws `Cannot read
properties of undefined (reading 'data')`, a render-time crash. This
crash is currently caught by `MainLayout`'s `ErrorBoundary` (confirmed by
reading `src/layouts/Main/index.tsx`, which wraps `children` in an
`ErrorBoundary`), so it doesn't white-screen the whole app, but it does
mean a failed product fetch shows the generic "Something went wrong" error
boundary fallback instead of this page's own graceful error handling —
and the `toast.error` call never even gets a chance to fire, since the
component throws before returning. This plan fixes both issues together
for this one file since they're directly adjacent and share the same root
cause (the `error`/`isLoading` handling at the top of the component).

## Current state

`src/pages/documents/index.tsx`, lines 18-24:

```tsx
const Documents: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getDocumentsEndpoint('?paginate=none&is_available=1'),
    fetcher,
  );

  if (error) toast.error('Something went wrong, please try again!');
```

`src/pages/downloads.tsx`, lines 19-23:

```tsx
const Downloads: NextPage = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const { data, error, isLoading } = useSWR('/api/user/products', fetcher);

  if (error) toast.error('Something went wrong, please try again!');
```

`src/pages/orders/index.tsx`, lines 15-21:

```tsx
const Orders: NextPage = () => {
  const { data, error, isLoading } = useSWR(
    '/api/user/orders?includes=items,status&sorts=created_at&paginate=none',
    fetcher,
  );

  if (error) toast.error('Something went wrong, please try again!');
```

`src/pages/products/index.tsx`, lines 18-24:

```tsx
const Products: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getProductsEndpoint('?paginate=none&sorts=-price&is_available=1'),
    fetcher,
  );

  if (error) toast.error('Something went wrong, please try again!');
```

`src/pages/products/[id].tsx`, lines 22-33:

```tsx
const IndividualProduct: NextPage<Props> = () => {
  const router = useRouter();
  const { id } = router.query;
  const { setIsOpen, addToCart, removeFromCart, cartContainsItem } = useCart();

  const { data, error, isLoading } = useSWR(`/api/products/${id}`, fetcher);

  if (!isLoading) {
    data.data.images = Object.values(data.data.images);
  }

  if (error) toast.error('Something went wrong, please try again');
```

Reference for the already-correct pattern, `src/pages/utilities.tsx`
(lines 19-27):

```tsx
const Utilities: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getUtilitiesEndpoint('?paginate=none'),
    fetcher,
  );

  useEffect(() => {
    if (error) toast.error('Failed to load utilities. Please try again.');
  }, [error]);
```

## Commands you will need

| Purpose   | Command                                                                                                                                  | Expected on success |
|-----------|------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                                                                                                             | exit 0, no errors    |
| Tests     | `npx jest src/pages/documents src/pages/downloads src/pages/orders src/pages/products` (only ones that exist — many of these pages have no test file yet, which is fine) | all pass (or no tests found) |
| Lint      | `npx eslint src/pages/documents/index.tsx src/pages/downloads.tsx src/pages/orders/index.tsx src/pages/products/index.tsx "src/pages/products/[id].tsx"` | exit 0, no errors |

## Scope

**In scope** (the only files you should modify):
- `src/pages/documents/index.tsx`
- `src/pages/downloads.tsx`
- `src/pages/orders/index.tsx`
- `src/pages/products/index.tsx`
- `src/pages/products/[id].tsx`
- A new or extended test file per page, per Step 6 (only where the
  effort is proportionate — see Step 6 for exactly which pages get a new
  test file under this plan).

**Out of scope** (do NOT touch, even though they look related):
- `src/pages/utilities.tsx`, `src/components/ProfileForms/ActiveSessionsForm.tsx`
  — already correct, reference-only.
- Any other `data.data.X` access pattern in `products/[id].tsx` beyond
  the specific crash this plan fixes (Step 5) — e.g., don't refactor the
  `data.data.images` mutation-during-render pattern itself (see
  "Maintenance notes"); this plan only prevents the crash when `data` is
  undefined, it doesn't eliminate the underlying mutate-in-render style.
- `OrdersTable`/`DownloadsTable`/`ProductCard`/`CardGrid` — unrelated
  rendering components, not touched by this plan.

## Git workflow

- Branch: `advisor/019-fix-toast-in-render`
- Commit message style: Conventional Commits (e.g. `fix: move toast.error
  calls into useEffect to avoid repeated toasts on re-render`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix `documents/index.tsx`

Add `import { useEffect } from 'react';` to the imports (this file
currently has no React import at all — check before assuming it needs
adding to an existing `import React from 'react'` line, since Next.js's
JSX transform may mean there isn't one).

Change:

```tsx
if (error) toast.error('Something went wrong, please try again!');
```

to:

```tsx
useEffect(() => {
  if (error) toast.error('Something went wrong, please try again!');
}, [error]);
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Fix `downloads.tsx`

Same transformation. This file already imports `React` (confirm via its
import block) — add `useEffect` to that same `import React from 'react';`
line if it's already there (`import React, { useEffect } from 'react';`),
or add a fresh import if not.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 3: Fix `orders/index.tsx`

Same transformation, same import consideration as Step 2.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 4: Fix `products/index.tsx`

Same transformation. This file has no existing React import — add
`import { useEffect } from 'react';`.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 5: Fix `products/[id].tsx` — toast placement AND the crash guard

This file needs both fixes together. Add `import { useEffect } from
'react';` to its imports.

Replace lines 27-33:

```tsx
const { data, error, isLoading } = useSWR(`/api/products/${id}`, fetcher);

if (!isLoading) {
  data.data.images = Object.values(data.data.images);
}

if (error) toast.error('Something went wrong, please try again');
```

with:

```tsx
const { data, error, isLoading } = useSWR(`/api/products/${id}`, fetcher);

useEffect(() => {
  if (error) toast.error('Something went wrong, please try again');
}, [error]);

if (error) {
  return (
    <MainLayout
      meta={
        <Meta
          title={`Product | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-12 text-center text-sm text-muted-foreground">
        Something went wrong loading this product. Please try again.
      </div>
    </MainLayout>
  );
}

if (!isLoading) {
  data.data.images = Object.values(data.data.images);
}
```

The early `return` on `error` is what actually prevents the crash — it
means `data.data.images = ...` and every other `data.data.X` access later
in this component's JSX (there are ~10, all inside the `!isLoading`
render branch) only ever execute once `error` is confirmed absent, so
`data` is guaranteed to be defined by the time they run.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 6: Lint everything touched

**Verify**: `npx eslint src/pages/documents/index.tsx src/pages/downloads.tsx src/pages/orders/index.tsx src/pages/products/index.tsx "src/pages/products/[id].tsx"` → exit 0, no errors.

### Step 7: Add a regression test for `products/[id].tsx`'s crash fix

This is the highest-value test in this plan — it locks in the fix for an
actual crash, not just a style improvement. Create
`src/pages/products/[id].test.tsx` (or extend it if a later plan already
created one):

```tsx
import { render, screen } from '@testing-library/react';
import useSWR from 'swr';

import IndividualProduct from './[id]';

jest.mock('swr');

jest.mock('@/context/CartContext', () => ({
  useCart: () => ({
    setIsOpen: jest.fn(),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    cartContainsItem: () => false,
  }),
}));

describe('Product detail page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders a graceful error state instead of crashing when the fetch fails', () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: new Error('Network Error'),
      isLoading: false,
    });

    expect(() => render(<IndividualProduct />)).not.toThrow();
    expect(
      screen.getByText(/something went wrong loading this product/i),
    ).toBeInTheDocument();
  });
});
```

Note: `useRouter` is auto-mocked repo-wide via `__mocks__/next/router.ts`
and returns `query: {}` by default, so `router.query.id` will be
`undefined` in this test — that's fine, the component only uses it to
build the SWR key, which is itself mocked here.

**Verify**: `npx jest src/pages/products/[id].test.tsx` → passes.

For the other four pages (`documents`, `downloads`, `orders`,
`products/index`), a full new test file per page is disproportionate to
this plan's scope (they didn't have crash bugs — only the repeated-toast
style issue) — skip adding new test files for those four unless one
already exists from another plan, in which case a one-line addition
confirming `toast.error` is called at most once per distinct error is a
reasonable, optional addition, not required by this plan's done criteria.

## Test plan

- New file: `src/pages/products/[id].test.tsx` — confirms the page no
  longer throws when the fetch fails, and renders the new graceful error
  message instead.
- The other four files get the same mechanical `useEffect` wrap with no
  new dedicated test (see Step 7's note) — their existing behavior
  (rendering successfully) is unchanged by this plan, only the toast
  timing is.
- Verification: `npx jest src/pages/products/[id].test.tsx` → passes.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/pages/products/[id].test.tsx` exits 0, test passes
- [ ] `npx eslint src/pages/documents/index.tsx src/pages/downloads.tsx src/pages/orders/index.tsx src/pages/products/index.tsx "src/pages/products/[id].tsx"` exits 0
- [ ] `grep -rn "^  if (error) toast" src/pages/documents/index.tsx src/pages/downloads.tsx src/pages/orders/index.tsx src/pages/products/index.tsx "src/pages/products/[id].tsx"` returns no matches (all five now call `toast.error` from inside a `useEffect`, not directly in the render body)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 019 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any of the five files' code doesn't match the "Current state" excerpts
  above.
- `products/[id].tsx` has more `data.data.X` accesses outside the
  `!isLoading` render branch than this plan's investigation found — if
  so, the early-return fix in Step 5 might not fully close off the crash;
  re-check by reading the entire file before concluding the fix is
  complete.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- `products/[id].tsx`'s `data.data.images = Object.values(data.data.images)`
  (still present after this plan, just no longer reachable with `data`
  undefined) mutates the SWR-cached object directly during render — a
  separate anti-pattern from what this plan fixes. A cleaner future fix
  would compute a derived `images` array without mutating `data` at all,
  and update the ~3 JSX call sites that read `data.data.images` to use
  that derived value instead — not done here to keep this plan's blast
  radius to the crash fix and the toast-timing fix specifically.
