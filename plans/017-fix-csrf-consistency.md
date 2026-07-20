# Plan 017: Apply the established `csrf()` pre-fetch pattern consistently

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/hooks/useAuth.ts src/components/ProfileForms/ActiveSessionsForm.tsx`
> `src/hooks/useAuth.ts` is also modified by `plans/002-fix-useauth-missing-await.md`
> (different methods) and `plans/014-fix-useauth-loading-redirect.md`
> (the `useEffect` block). This plan's target (`logout` and
> `resendEmailVerification`) is untouched by either — locate it by content
> match if line numbers have shifted. If the content itself doesn't match,
> treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (soft file-overlap with plans 002 and 014 on
  `useAuth.ts` — see drift check above)
- **Category**: security
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

Every state-changing request this app makes to the Laravel/Sanctum backend
follows an established pattern: call `csrf()` (which fetches Sanctum's
CSRF cookie at `/sanctum/csrf-cookie`) immediately before the actual
mutating request. `useAuth.ts`'s `register`, `login`, `forgotPassword`,
`resetPassword`, and `deleteAccount` all do this. `checkout.tsx` and the
three `ProfileForms` files fixed in `plans/002` and `plans/003` do too.

Three call sites break this pattern:

- `useAuth.ts`'s `logout()` — `POST /logout` with no preceding `csrf()`
  call.
- `useAuth.ts`'s `resendEmailVerification()` — `POST
  /email/verification-notification` with no preceding `csrf()` call.
- `ActiveSessionsForm.tsx`'s `logoutSession()` — `DELETE
  /api/sessions/${sessionId}` with no preceding `csrf()` call.

Live risk today is low — by the time any of these three fire, the user is
already authenticated, meaning an earlier `csrf()`/`login()` call in the
same session has almost certainly already seeded the Sanctum XSRF cookie,
so these requests likely still carry a valid token via `axios.ts`'s
`withXSRFToken: true` default. But that's incidental, not guaranteed — a
future change to session/cookie lifetime, or a flow that reaches one of
these three calls without an earlier `csrf()` call having run first (e.g.
a very long-lived tab, or cookie-clearing browser extensions), would
silently start failing these requests with a 419 (CSRF token mismatch)
with no explicit handling for that case. The fix is cheap and brings these
three in line with the pattern every other mutating call in the app
already follows.

## Current state

`src/hooks/useAuth.ts`, `logout` and `resendEmailVerification` (as of
commit `bb7488e` — unaffected by plans 002/014, so these lines should
still match even if those have landed):

```ts
const resendEmailVerification = (args: ApiRequest) => {
  const { setStatus } = args;

  axios
    .post('/email/verification-notification')
    .then((response) => setStatus(response.data.status));
};

const logout = async () => {
  await axios.post('/logout').then(() => mutate());

  window.location.pathname = '/login';
};
```

`src/components/ProfileForms/ActiveSessionsForm.tsx`, `logoutSession`
(lines 33-50):

```ts
const logoutSession = async (event: any, sessionId: string) => {
  event.preventDefault();
  setLoadingSessionId(sessionId);
  await axios
    .delete(`/api/sessions/${sessionId}`)
    .then(() => {
      const index = data.data.findIndex(
        (item: BrowserSession) => item.id === sessionId,
      );
      if (index !== -1) data.data.splice(index, 1);
      toast.success('Session logged out successfully!');
    })
    .catch(() => toast.error('Something went wrong'))
    .finally(() => {
      setLoadingSessionId(null);
      router.push('/profile#sessions');
    });
};
```

Reference for the established pattern, `src/lib/axios.ts`:

```ts
export const csrf = () => axios.get(`${baseURL}/sanctum/csrf-cookie`);
```

## Commands you will need

| Purpose   | Command                                                                       | Expected on success |
|-----------|------------------------------------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                                                | exit 0, no errors    |
| Tests     | `npx jest src/hooks/useAuth.test.ts src/components/ProfileForms/ActiveSessionsForm.test.tsx` | all pass |
| Lint      | `npx eslint src/hooks/useAuth.ts src/components/ProfileForms/ActiveSessionsForm.tsx` | exit 0, no errors |

If `src/hooks/useAuth.test.ts` already exists (from plan 002 and/or 014),
extend it; don't overwrite.

## Scope

**In scope** (the only files you should modify):
- `src/hooks/useAuth.ts` (`logout` and `resendEmailVerification` only)
- `src/components/ProfileForms/ActiveSessionsForm.tsx` (`logoutSession` only)
- `src/hooks/useAuth.test.ts` (extend, or create if it doesn't exist yet)
- `src/components/ProfileForms/ActiveSessionsForm.test.tsx` (create)

**Out of scope** (do NOT touch, even though they look related):
- Every other method in `useAuth.ts` — already correct (or handled by
  plans 002/014).
- `ActiveSessionsForm.tsx`'s "Logout all" button — it currently has **no
  `onClick` handler at all** (confirmed by reading the file: the
  `<AlertDialogAction>Logout sessions</AlertDialogAction>` inside the
  "Logout all" confirmation dialog has no `onClick`, so confirming it does
  nothing). This is a real, separate, more severe bug than a missing
  `csrf()` call — flagged here so it isn't confused with this plan's
  scope, but **not fixed by this plan**; it needs its own plan, since
  fixing it requires deciding what endpoint "logout all sessions" should
  actually call (no existing pattern in this file to copy — `logoutSession`
  targets a single session by ID, not "all"), which is a design decision
  beyond a CSRF-consistency fix.
- `ActiveSessionsForm.tsx`'s direct mutation of the SWR cache
  (`data.data.splice(...)` inside `logoutSession`) — a separate, real
  anti-pattern (mutating SWR's cached data directly instead of calling
  `mutate()`), also not part of this plan's approved scope.

## Git workflow

- Branch: `advisor/017-fix-csrf-consistency`
- Commit message style: Conventional Commits (e.g. `fix: apply the
  established csrf() pre-fetch pattern to logout, resendEmailVerification,
  and session revocation`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add `csrf()` to `useAuth.ts`'s `logout`

Change:

```ts
const logout = async () => {
  await axios.post('/logout').then(() => mutate());

  window.location.pathname = '/login';
};
```

to:

```ts
const logout = async () => {
  await csrf();

  await axios.post('/logout').then(() => mutate());

  window.location.pathname = '/login';
};
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Add `csrf()` to `useAuth.ts`'s `resendEmailVerification`

Change:

```ts
const resendEmailVerification = (args: ApiRequest) => {
  const { setStatus } = args;

  axios
    .post('/email/verification-notification')
    .then((response) => setStatus(response.data.status));
};
```

to:

```ts
const resendEmailVerification = async (args: ApiRequest) => {
  const { setStatus } = args;

  await csrf();

  axios
    .post('/email/verification-notification')
    .then((response) => setStatus(response.data.status));
};
```

(Note: this makes the function `async` where it wasn't before — check its
call site(s), e.g. `verify-email.tsx`, to confirm nothing depends on it
returning synchronously; per the same investigation `plans/002` did for
the other methods, this function has no caller checking a return value or
relying on synchronous completion, so this change should be safe, but
confirm by reading the call site yourself before proceeding.)

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 3: Add `csrf()` to `ActiveSessionsForm.tsx`'s `logoutSession`

Change:

```ts
const logoutSession = async (event: any, sessionId: string) => {
  event.preventDefault();
  setLoadingSessionId(sessionId);
  await axios
    .delete(`/api/sessions/${sessionId}`)
```

to:

```ts
const logoutSession = async (event: any, sessionId: string) => {
  event.preventDefault();
  setLoadingSessionId(sessionId);
  await csrf();
  await axios
    .delete(`/api/sessions/${sessionId}`)
```

You'll need to add `csrf` to this file's existing `import axios, {
fetcher } from '@/lib/axios';` line — change it to `import axios, { csrf,
fetcher } from '@/lib/axios';`.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 4: Lint

**Verify**: `npx eslint src/hooks/useAuth.ts src/components/ProfileForms/ActiveSessionsForm.tsx` → exit 0, no new errors.

### Step 5: Add regression tests

For `useAuth.ts`, add to (or create) `src/hooks/useAuth.test.ts`:

```ts
it('logout calls csrf() before posting to /logout', async () => {
  (axios.post as jest.Mock).mockResolvedValue({ data: {} });

  const { result } = renderHook(() => useAuth({ middleware: 'auth' }));

  await act(async () => {
    await result.current.logout();
  });

  expect(csrf).toHaveBeenCalled();
  expect(axios.post).toHaveBeenCalledWith('/logout');
});
```

(Adjust the `renderHook`/mock setup to match whatever pattern already
exists in this file from plans 002/014 — use the same `jest.mock('@/lib/axios', ...)`
and `jest.mock('swr', ...)` factories already established there rather
than introducing a third variant.)

Create `src/components/ProfileForms/ActiveSessionsForm.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';
import ActiveSessionsForm from './ActiveSessionsForm';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { delete: jest.fn().mockResolvedValue({}) },
  csrf: jest.fn().mockResolvedValue(undefined),
  fetcher: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: '1' } }),
}));

jest.mock('swr', () =>
  jest.fn(() => ({
    data: {
      data: [
        {
          id: 'session-1',
          agent: 'Chrome on macOS',
          ip_address: '127.0.0.1',
          is_current_device: false,
          last_active: '1 minute ago',
        },
      ],
    },
    error: undefined,
  })),
);

describe('ActiveSessionsForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls csrf() before revoking a session', async () => {
    render(<ActiveSessionsForm />);

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith('/api/sessions/session-1'),
    );
    expect(csrf).toHaveBeenCalled();
  });
});
```

If `check-types` flags the `swr` mock's return shape, narrow it with `as
unknown as ReturnType<typeof useSWR>` rather than fully implementing every
field.

**Verify**: `npx jest src/hooks/useAuth.test.ts src/components/ProfileForms/ActiveSessionsForm.test.tsx` → all pass.

## Test plan

- `useAuth.test.ts`: one new test confirming `logout()` calls `csrf()`
  before `POST /logout`.
- New file, `ActiveSessionsForm.test.tsx`: confirms `logoutSession` calls
  `csrf()` before `DELETE /api/sessions/:id`.
- Verification: `npx jest src/hooks/useAuth.test.ts src/components/ProfileForms/ActiveSessionsForm.test.tsx` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/hooks/useAuth.test.ts src/components/ProfileForms/ActiveSessionsForm.test.tsx` exits 0, all tests pass
- [ ] `npx eslint src/hooks/useAuth.ts src/components/ProfileForms/ActiveSessionsForm.tsx` exits 0
- [ ] `grep -n "await csrf();" src/hooks/useAuth.ts` shows at least 7 matches (5 from before this plan, plus `logout` and `resendEmailVerification`)
- [ ] `grep -n "await csrf();" src/components/ProfileForms/ActiveSessionsForm.tsx` shows at least 1 match
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 017 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The live code at the cited locations doesn't match the "Current state"
  excerpts above.
- `resendEmailVerification`'s call site (find it via `grep -rn
  "resendEmailVerification" src/`) shows it being called in a way that
  depends on synchronous (non-`async`) behavior — that would mean Step 2
  needs a different approach; stop and report rather than guessing.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- The broken "Logout all" button and the direct SWR-cache mutation in
  `ActiveSessionsForm.tsx`, both noted under "Out of scope" above, are
  real issues worth their own future plans — flag them to whoever reviews
  this plan's completion so they aren't lost.
