# Plan 007: Fix forgot-password.tsx redirecting to a nonexistent `/dashboard` route

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/pages/forgot-password.tsx`
> This file is also modified by `plans/002-fix-useauth-missing-await.md`
> (which changes the `onSubmit` function body, several lines below the
> `useAuth(...)` call this plan targets). If plan 002 has landed, the
> file's later line numbers will differ from the "Current state" excerpt
> below, but the `useAuth({ middleware: 'guest', redirectUri: '/dashboard'
> })` call this plan targets is near the top of the component and is
> unaffected by plan 002 — locate it by content match. If that content
> itself doesn't match (not just line numbers elsewhere in the file), treat
> that as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (safe to run independently of plan 002; listed as
  informational only in plan 002's maintenance notes because they touch
  the same file in different regions)
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/pages/forgot-password.tsx` calls `useAuth` with `middleware: 'guest'`
and `redirectUri: '/dashboard'`. Per `useAuth.ts`'s guest-middleware
effect, an already-authenticated user visiting this page gets redirected to
`redirectUri`. But there is no `/dashboard` route anywhere in this app —
confirm with `ls src/pages/` or `find src/pages -iname 'dashboard*'`,
neither of which turns up a match. The other three pages that use the same
`middleware: 'guest'` pattern (`login.tsx`, `register.tsx`,
`verify-email.tsx`) all correctly redirect to `'/'`.

Practical effect: an authenticated user who navigates to
`/forgot-password/` (e.g. by clicking an old bookmark, or a stray link) is
sent to a 404 page instead of being redirected home like every other guest
page does.

## Current state

`src/pages/forgot-password.tsx`, relevant excerpt (lines 32-36 as of
commit `bb7488e`):

```tsx
32	const ForgotPassword: NextPage = () => {
33	  const { forgotPassword } = useAuth({
34	    middleware: 'guest',
35	    redirectUri: '/dashboard',
36	  });
```

Reference for the correct pattern, all three sibling guest pages:

```
src/pages/login.tsx:41:    redirectUri: '/',
src/pages/register.tsx:48:    redirectUri: '/',
src/pages/verify-email.tsx:17:    redirectUri: '/',
```

## Commands you will need

| Purpose   | Command                                        | Expected on success |
|-----------|---------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                              | exit 0, no errors   |
| Tests     | `npx jest src/pages/forgot-password.test.tsx`      | all pass            |
| Lint      | `npx eslint src/pages/forgot-password.tsx`         | exit 0, no errors   |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, 15%
coverage gate) — use the targeted commands above.

## Scope

**In scope** (the only files you should modify):
- `src/pages/forgot-password.tsx`
- `src/pages/forgot-password.test.tsx` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/pages/login.tsx`, `register.tsx`, `verify-email.tsx` — read-only
  reference for this plan; their `redirectUri: '/'` values are already
  correct, do not touch them.
- Anything in `forgot-password.tsx`'s `onSubmit` function — that's
  `plans/002-fix-useauth-missing-await.md`'s territory, not this plan's.
- `src/hooks/useAuth.ts` — the redirect *mechanism* (the `useEffect` that
  reads `redirectUri`) is correct; only this one page's *argument* to it is
  wrong.

## Git workflow

- Branch: `advisor/007-fix-forgot-password-redirect`
- Commit message style: Conventional Commits (e.g. `fix: forgot-password
  page now redirects authenticated users to / instead of a dead
  /dashboard route`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the redirect target

Change line 35:

```ts
redirectUri: '/dashboard',
```

to:

```ts
redirectUri: '/',
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Lint

**Verify**: `npx eslint src/pages/forgot-password.tsx` → exit 0, no new errors.

### Step 3: Add a regression test

Create `src/pages/forgot-password.test.tsx`. This test mocks `useAuth`
directly (simpler and more robust than mocking `@/lib/axios` and letting
the real `useAuth` effect run, since the thing under test is purely "what
argument does this page pass to `useAuth`", not `useAuth`'s own behavior —
that's covered separately by `plans/002-fix-useauth-missing-await.md`'s
`useAuth.test.ts`).

```tsx
import { render } from '@testing-library/react';

import { useAuth } from '@/hooks/useAuth';
import ForgotPassword from './forgot-password';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ forgotPassword: jest.fn() })),
}));

describe('ForgotPassword page', () => {
  it('registers with useAuth using redirectUri "/" (not a nonexistent /dashboard route)', () => {
    render(<ForgotPassword />);

    expect(useAuth).toHaveBeenCalledWith(
      expect.objectContaining({ middleware: 'guest', redirectUri: '/' }),
    );
  });
});
```

**Verify**: `npx jest src/pages/forgot-password.test.tsx` → all pass.

## Test plan

- One new file, `src/pages/forgot-password.test.tsx`, with one test
  asserting `useAuth` is called with `redirectUri: '/'`.
- Structural pattern: `@testing-library/react`'s `render`, with `useAuth`
  mocked directly (`jest.mock('@/hooks/useAuth', ...)`) — this is a
  simpler variant of the pattern used in
  `plans/003-fix-profileforms-missing-await.md`'s `UpdateSettingsForm.test.tsx`.
- Verification: `npx jest src/pages/forgot-password.test.tsx` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/pages/forgot-password.test.tsx` exits 0, test passes
- [ ] `npx eslint src/pages/forgot-password.tsx` exits 0
- [ ] `grep -n "dashboard" src/pages/forgot-password.tsx` returns no matches
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 007 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The `useAuth({ middleware: 'guest', redirectUri: '/dashboard' })` call
  doesn't appear in the live file (content mismatch, not just a line
  number difference).
- A `/dashboard` route actually does exist somewhere in `src/pages/` when
  you check (contradicting this plan's "Why this matters") — stop and
  report rather than assuming the plan's premise still holds.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- This is a narrow, isolated one-line fix. No follow-up work is implied.
