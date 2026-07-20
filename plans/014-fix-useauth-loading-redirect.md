# Plan 014: Stop `useAuth` from redirecting to `/login` during its own initial loading state

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/hooks/useAuth.ts`
> This file is also modified by `plans/002-fix-useauth-missing-await.md`,
> in a different region (the five mutation methods, not the `useEffect`
> this plan targets). If plan 002 has landed, locate this plan's target by
> content match (the `useEffect` block), not by trusting the original line
> numbers. If that content itself doesn't match, treat it as a STOP
> condition.
>
> **This finding was rated MED confidence in the original audit** — the
> failure mode is timing-dependent and its real-world frequency depends on
> the backend's response latency, which isn't observable from this repo
> alone. This plan includes a manual verification step for that reason;
> don't skip it.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — touches the route-guarding logic used by every
  `middleware: 'auth'` page in the app (checkout, orders, downloads,
  profile); a mistake here affects all of them at once.
- **Depends on**: none (soft file-overlap with `plans/002-fix-useauth-missing-await.md`, see drift check above)
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`useAuth.ts`'s route-guarding effect includes:

```ts
if (middleware === 'auth' && !user) router.push('/login');
```

`user` comes from `useSWR<User>(...)` and is `undefined` in **two**
different situations: while the initial request to `/api/user` is still in
flight, and once it has resolved and genuinely found no authenticated
user. This line doesn't distinguish between them — it fires on `!user`
alone.

On a hard/full page load of any `middleware: 'auth'` page (`checkout.tsx`,
`orders/index.tsx`, `downloads.tsx`, `profile.tsx`), this effect runs on
the very first render, before the `/api/user` SWR fetch has had a chance
to resolve — `user` is `undefined` at that instant even for a legitimately
logged-in user with a valid session cookie. The effect calls
`router.push('/login')` immediately. A moment later, the real `/api/user`
response arrives and `user` gets populated correctly, but the navigation
to `/login` has already been kicked off — in the best case this is a
visible flash/flicker to `/login` and back; in the worst case (slower
networks, or if `router.push` fully completes before the SWR response
lands) the user actually lands on the login page despite having a valid
session.

The fix: only redirect once the initial fetch has actually settled (SWR's
`isLoading` flag), not on `!user` alone.

## Current state

`src/hooks/useAuth.ts`, full relevant excerpt (as of commit `bb7488e`,
before `plans/002-fix-useauth-missing-await.md` — see drift check above
for what to expect if 002 has landed; that plan doesn't touch this part of
the file, so the lines below should still match verbatim even after 002):

```ts
22	export const useAuth = ({ middleware, redirectUri }: UseAuth) => {
23	  const router = useRouter();
24
25	  const {
26	    data: user,
27	    error,
28	    mutate,
29	  } = useSWR<User>(getUserEndpoint(), () =>
30	    axios
31	      .get(getUserEndpoint())
32	      .then((res) => res.data.data)
33	      .catch((err) => {
34	        if (err.response.status !== 409) throw err;
35
36	        router.push('/verify-email');
37	      }),
38	  );
39	  ...
154	  useEffect(() => {
155	    if (middleware === 'guest' && redirectUri && user) router.push(redirectUri);
156	    if (middleware === 'auth' && !user) router.push('/login');
157	    if (middleware === 'auth' && error) logout();
158
159	    if (window.location.pathname === '/verify-email' && user?.email_verified_at)
160	      router.push(redirectUri ?? '/');
161	  }, [user, error]);
```

`swr` is pinned at `^2.2.4` in `package.json` — SWR v2's `useSWR` return
value includes an `isLoading` boolean (`true` only while there's no
cached/resolved data yet and no error; `false` once either arrives),
distinct from `isValidating` (which is also `true` on revalidation of
already-cached data — not what we want here, since we specifically only
care about the *initial* load with nothing cached yet).

## Commands you will need

| Purpose   | Command                                   | Expected on success |
|-----------|------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                            | exit 0, no errors    |
| Tests     | `npx jest src/hooks/useAuth.test.ts`             | all pass             |
| Lint      | `npx eslint src/hooks/useAuth.ts`                | exit 0, no errors    |

If `plans/002-fix-useauth-missing-await.md` has already landed,
`src/hooks/useAuth.test.ts` already exists — add to it rather than
overwriting. If not, this plan creates it fresh with just the tests below.

## Scope

**In scope** (the only files you should modify):
- `src/hooks/useAuth.ts`
- `src/hooks/useAuth.test.ts` (create, or extend if it already exists)

**Out of scope** (do NOT touch, even though they look related):
- The five mutation methods (`register`, `login`, `forgotPassword`,
  `resetPassword`, `deleteAccount`) — that's
  `plans/002-fix-useauth-missing-await.md`'s territory.
- The `err.response.status !== 409` check inside the SWR fetcher (line 34)
  — it has its own separate, known, unguarded-`err.response` issue folded
  into `plans/002-fix-useauth-missing-await.md`'s Step 2; don't duplicate
  that fix here, and don't change this line's behavior otherwise (see
  "Maintenance notes" for a related, NOT-fixed-here race condition
  involving this exact line).
- Any page that calls `useAuth` — this plan's fix is entirely internal to
  the hook; no caller needs to change.

## Git workflow

- Branch: `advisor/014-fix-useauth-loading-redirect`
- Commit message style: Conventional Commits (e.g. `fix: don't redirect
  to /login while useAuth's initial user fetch is still loading`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Destructure `isLoading` from `useSWR`

Change:

```ts
const {
  data: user,
  error,
  mutate,
} = useSWR<User>(getUserEndpoint(), () =>
```

to:

```ts
const {
  data: user,
  error,
  isLoading,
  mutate,
} = useSWR<User>(getUserEndpoint(), () =>
```

**Verify**: `npm run check-types` → exit 0 (an unused-variable error is
expected until Step 2 uses `isLoading` — if `check-types`/lint complains
at this exact intermediate point, that's fine, resolve it by completing
Step 2 before your next verification).

### Step 2: Guard the auth-redirect check with `!isLoading`

Change line 156:

```ts
if (middleware === 'auth' && !user) router.push('/login');
```

to:

```ts
if (middleware === 'auth' && !isLoading && !user) router.push('/login');
```

Also add `isLoading` to the `useEffect`'s dependency array so the effect
re-runs when loading finishes even if `user`/`error` haven't themselves
changed reference (they will have, in practice, since `isLoading` flipping
to `false` happens alongside `user`/`error` settling — but include it
explicitly for correctness and to satisfy the exhaustive-deps intent, even
though this repo's ESLint config has `react-hooks/exhaustive-deps` turned
off):

```ts
}, [user, error, isLoading]);
```

**Verify**: `npm run check-types` → exit 0, no errors.

### Step 3: Lint

**Verify**: `npx eslint src/hooks/useAuth.ts` → exit 0, no new errors.

### Step 4: Add regression tests

If `src/hooks/useAuth.test.ts` already exists (from plan 002), add these
two tests to its `describe('useAuth', ...)` block, adjusting the shared
`jest.mock('swr', ...)` factory at the top of the file to return a
per-test-configurable `isLoading` value (plan 002's version hardcodes
`{ data: undefined, error: undefined, mutate: jest.fn() }` — extend it to
also return `isLoading: true` by default, and override per-test with
`(useSWR as jest.Mock).mockReturnValue(...)` where needed). If the file
doesn't exist yet, create it fresh with the mock shape below plus these
two tests.

```tsx
import { render } from '@testing-library/react';
import useSWR from 'swr';

import { useAuth } from '@/hooks/useAuth';

jest.mock('swr');

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), query: {} }),
}));

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush, query: {} }),
}));

function TestComponent({ middleware }: { middleware: 'auth' | 'guest' }) {
  useAuth({ middleware });
  return null;
}

describe('useAuth — loading-state redirect guard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not redirect to /login while the initial user fetch is still loading', () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    });

    render(<TestComponent middleware="auth" />);

    expect(mockPush).not.toHaveBeenCalledWith('/login');
  });

  it('redirects to /login once loading has finished and there is still no user', () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<TestComponent middleware="auth" />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
```

Note: if plan 002's existing `useAuth.test.ts` already has a top-level
`jest.mock('swr', () => jest.fn(() => ({...})))` (a factory returning a
fixed object) rather than `jest.mock('swr')` (auto-mock, configured
per-test via `mockReturnValue`), reconcile the two files' mocking styles
rather than having two conflicting `jest.mock('swr', ...)` calls in the
same file — auto-mock plus `mockReturnValue` per test (as shown above) is
more flexible and is what these two new tests need, so prefer converting
plan 002's fixed-factory mock to this style if you're editing an existing
file, updating plan 002's tests' assertions if needed to keep them
passing under the new mock style.

**Verify**: `npx jest src/hooks/useAuth.test.ts` → all pass.

## Test plan

- Two new tests: `isLoading: true` with no `user` does not trigger a
  `/login` redirect; `isLoading: false` with no `user` does.
- If reconciling with plan 002's existing test file, all of that file's
  previously-passing tests must continue to pass after any mock-style
  changes made here.
- Verification: `npx jest src/hooks/useAuth.test.ts` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/hooks/useAuth.test.ts` exits 0, all tests pass
      (including plan 002's tests, if that file already existed)
- [ ] `npx eslint src/hooks/useAuth.ts` exits 0
- [ ] `grep -n "middleware === 'auth' && !isLoading && !user'" src/hooks/useAuth.ts` — approximate check; confirm by reading the file that the redirect condition includes an `isLoading` guard
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 014 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The live file's `useEffect` block doesn't match the "Current state"
  excerpt above.
- `swr@^2.2.4`'s `useSWR` doesn't actually return an `isLoading` field
  when you check it directly (e.g. via the installed package's TypeScript
  types, `node_modules/swr/dist/index.d.ts` or equivalent) — this plan's
  entire fix depends on that field existing; if it's missing or named
  differently, stop and report rather than inventing a substitute.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- **Known, pre-existing, NOT fixed by this plan**: the SWR fetcher's own
  `.catch` (line 34, `if (err.response.status !== 409) throw err; else
  router.push('/verify-email');`) already independently calls
  `router.push('/verify-email')` on a 409 response, resolving `user` as
  `undefined` (not as an error, since the promise doesn't rethrow). After
  this plan's fix, once `isLoading` becomes `false` following that
  resolution, the guarded check `!isLoading && !user` will still be `true`
  and will call `router.push('/login')` — racing with the fetcher's own
  `router.push('/verify-email')` call. This race exists identically before
  and after this plan (this plan only changes *when* the race's second
  push fires, from "immediately" to "once loading settles" — it doesn't
  add or remove the race itself). Fixing that properly means the
  `useEffect`'s `!user` check needs to also account for the 409/unverified-email
  case specifically (e.g. by having the fetcher set a distinguishable
  state rather than silently resolving to `undefined`), which is a
  different, more invasive change than this plan's scope. Flagged here so
  it isn't mistaken for something this plan already handles.
- If SWR is ever upgraded to a major version with a different loading-state
  API, revisit this fix — it depends specifically on v2's `isLoading`
  field.
