# Plan 021: Fix the "Logout all sessions" button — it currently does nothing

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **This finding was NOT part of the original 7-finding batch or the
> audit's 20-item findings table** — it was discovered while researching
> `plans/017-fix-csrf-consistency.md` (both touch
> `ActiveSessionsForm.tsx`). It's a new, separately-verified bug, flagged
> to the operator when this plan was written rather than silently folded
> into plan 017's smaller CSRF-consistency fix.
>
> **This plan makes an assumption about a backend endpoint that isn't
> visible from this repository** (the Laravel backend is a separate
> repo). Do not skip Step 3's verification — shipping this against a
> nonexistent endpoint would silently fail exactly like the current bug
> does, just with an error toast instead of literally nothing.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: MED — depends on a backend endpoint this plan cannot confirm
  exists from the frontend repo alone (see Step 3).
- **Depends on**: none (soft file-overlap with
  `plans/017-fix-csrf-consistency.md`, which touches the same file's
  `logoutSession` function, not the button this plan fixes)
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/components/ProfileForms/ActiveSessionsForm.tsx` renders a "Logout
all" button that opens a confirmation dialog ("Are you absolutely sure?
This will logout all sessions on all browsers and devices."). The
dialog's confirm button is:

```tsx
<AlertDialogAction>Logout sessions</AlertDialogAction>
```

There is no `onClick` handler at all. Clicking it closes the dialog (Radix
UI's `AlertDialogAction` primitive dismisses the dialog on click by
default, the same as `AlertDialogCancel`) and does nothing else — no
request is sent, no sessions are revoked. A user who clicks "Logout all"
believing they've secured their account (e.g. after noticing a suspicious
session in the list above it) walks away thinking they've logged out every
device, when in fact nothing happened. This is a real, user-facing broken
security feature, not a cosmetic issue.

## Current state

`src/components/ProfileForms/ActiveSessionsForm.tsx`, full current file
(lines 1-50 and 106-135 are the relevant parts; shown in full for
context since this plan both adds a function and wires up a handler):

```tsx
import { Laptop, LogOut } from 'lucide-react';
import router from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type BrowserSession from '@/interfaces/BrowserSession';
import axios, { fetcher } from '@/lib/axios';

const ActiveSessionsForm = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const { data, error } = useSWR('/api/sessions', fetcher);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (error) toast.error('Failed to load sessions. Please try again.');
  }, [error]);

  if (!user) return null;
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

  return (
    ...
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              Logout all
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will logout all sessions on
                all browsers and devices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Logout sessions</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default ActiveSessionsForm;
```

**Assumption this plan makes, requiring backend verification (Step 3)**:
no "logout all other sessions" endpoint is referenced anywhere in this
repository. The single-session revoke uses `DELETE
/api/sessions/${sessionId}`. This plan assumes a bulk equivalent exists at
`DELETE /api/sessions` (no ID — following the same REST resource shape as
the existing endpoint) but **this is a guess based on convention, not
confirmed against the actual Laravel backend**, which is a separate
repository not visible here.

## Commands you will need

| Purpose            | Command                                                                   | Expected on success |
|-----------------------|----------------------------------------------------------------------------|---------------------|
| Typecheck              | `npm run check-types`                                                        | exit 0, no errors    |
| Tests                  | `npx jest src/components/ProfileForms/ActiveSessionsForm.test.tsx`          | all pass             |
| Lint                   | `npx eslint src/components/ProfileForms/ActiveSessionsForm.tsx`             | exit 0, no errors    |
| **Manual backend verification (required, see Step 3)** | Click "Logout all" against a real/staging backend with 2+ active sessions | all non-current sessions are actually revoked |

## Scope

**In scope** (the only files you should modify):
- `src/components/ProfileForms/ActiveSessionsForm.tsx`
- `src/components/ProfileForms/ActiveSessionsForm.test.tsx` (extend if
  `plans/017-fix-csrf-consistency.md` already created it; create fresh
  otherwise)

**Out of scope** (do NOT touch, even though they look related):
- `logoutSession` (the single-session revoke function) — already correct
  in shape; `plans/017-fix-csrf-consistency.md` adds its missing `csrf()`
  call, not this plan.
- The direct SWR-cache mutation (`data.data.splice(...)`) inside
  `logoutSession` — a separate, pre-existing anti-pattern, not part of
  this plan.
- Any backend/Laravel code — not in this repository.

## Git workflow

- Branch: `advisor/021-fix-logout-all-sessions`
- Commit message style: Conventional Commits (e.g. `fix: wire up the
  "Logout all sessions" confirmation button, which previously did
  nothing`)
- Do NOT push or open a PR unless the operator instructed it. **Do not
  consider this plan mergeable until Step 3's manual backend verification
  has actually happened.**

## Steps

### Step 1: Add a `logoutAllSessions` function

Add this function alongside the existing `logoutSession`, following the
same shape (including the same `csrf()` call this file should already
have from `plans/017-fix-csrf-consistency.md` — if that plan hasn't run
yet, add the `csrf` import here too):

```ts
const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

const logoutAllSessions = async () => {
  setIsLoggingOutAll(true);
  await csrf();
  await axios
    .delete('/api/sessions')
    .then(() => {
      toast.success('All other sessions have been logged out!');
    })
    .catch(() => toast.error('Something went wrong'))
    .finally(() => {
      setIsLoggingOutAll(false);
      router.push('/profile#sessions');
    });
};
```

Add `useState` to the existing `import { useEffect, useState } from
'react';` line if `isLoadingSessionId`'s `useState` isn't already imported
from there (it already is, per the current file — just add the new
`isLoggingOutAll` state alongside it, don't add a second `useState`
import).

**Verify**: `npm run check-types` → exit 0, no new errors (an unused-
function warning is expected until Step 2 wires it up).

### Step 2: Wire the function to the confirmation button

Change:

```tsx
<AlertDialogAction>Logout sessions</AlertDialogAction>
```

to:

```tsx
<AlertDialogAction onClick={logoutAllSessions} disabled={isLoggingOutAll}>
  {isLoggingOutAll ? 'Logging out...' : 'Logout sessions'}
</AlertDialogAction>
```

**Verify**: `npm run check-types` → exit 0, no errors.

### Step 3: Manually verify against a real backend — REQUIRED, not optional

With a real or staging backend reachable, log in as a test user with at
least 2 active sessions (e.g. log in from two different browsers, or one
normal + one incognito window). Click "Logout all" and confirm:

- The request actually reaches the backend (check the Network tab for a
  `DELETE /api/sessions` call and its response status).
- If it returns a 404 or another error indicating this endpoint doesn't
  exist, **this plan's core assumption is wrong** — stop, do not ship this
  change, and report back what the actual correct endpoint should be
  (check the backend's routes if you have access to that repo, or
  escalate to whoever does).
- If it succeeds, confirm the *other* session(s) are actually terminated
  (e.g. refreshing the other browser's session should show it logged out)
  and the *current* session remains active (the description text promises
  "all sessions on all browsers and devices" — confirm whether that
  literally includes the current session or, more likely given the
  `is_current_device` distinction already used elsewhere in this same
  file for `logoutSession`, whether "all" here conventionally means "all
  other" sessions; if the backend's actual behavior differs from the
  dialog's copy, note that as a follow-up regardless of what you ship).

**Do not mark this plan done without completing this step.**

### Step 4: Lint

**Verify**: `npx eslint src/components/ProfileForms/ActiveSessionsForm.tsx` → exit 0, no errors.

### Step 5: Add a regression test

Extend (or create, using the mock setup from `plans/017-fix-csrf-consistency.md`)
`src/components/ProfileForms/ActiveSessionsForm.test.tsx`:

```tsx
it('logs out all sessions when "Logout all" is confirmed', async () => {
  (axios.delete as jest.Mock).mockResolvedValue({});

  render(<ActiveSessionsForm />);

  fireEvent.click(screen.getByRole('button', { name: /logout all/i }));
  fireEvent.click(screen.getByRole('button', { name: /logout sessions/i }));

  await waitFor(() =>
    expect(axios.delete).toHaveBeenCalledWith('/api/sessions'),
  );
});
```

**Verify**: `npx jest src/components/ProfileForms/ActiveSessionsForm.test.tsx` → all pass.

## Test plan

- One new test confirming the "Logout all" confirmation flow actually
  calls `DELETE /api/sessions`.
- **The real verification for this plan is Step 3's manual backend
  check**, exactly as with `plans/018-investigate-order-user-id.md` — the
  automated test only proves the frontend sends a request, not that the
  assumed endpoint exists or behaves correctly.

## Done criteria

Machine-checkable + manual, ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/components/ProfileForms/ActiveSessionsForm.test.tsx` exits 0, all tests pass
- [ ] `npx eslint src/components/ProfileForms/ActiveSessionsForm.tsx` exits 0
- [ ] `grep -n "onClick={logoutAllSessions}" src/components/ProfileForms/ActiveSessionsForm.tsx` matches
- [ ] **Step 3's manual backend verification was actually performed and
      succeeded** — must be explicitly confirmed in your completion
      report, not assumed. If it failed because the assumed endpoint
      doesn't exist, set the plan's status to `BLOCKED` with that reason,
      not `DONE`.
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 021 updated

## STOP conditions

Stop and report back (do not improvise) if:

- You have no access to a real or staging backend to perform Step 3 —
  report this as a blocker.
- Step 3 reveals `DELETE /api/sessions` doesn't exist or doesn't behave as
  expected — do not guess at an alternative endpoint URL; report what you
  found and let whoever owns the backend confirm the correct one.
- The live file doesn't match the "Current state" excerpt above.

## Maintenance notes

- If Step 3 reveals the correct endpoint differs from `DELETE
  /api/sessions`, this plan's Step 1 needs updating accordingly once
  that's confirmed — don't consider this plan's approach final until
  backend confirmation lands.
- The dialog's copy ("logout all sessions on all browsers and devices")
  should be double-checked against actual backend behavior regarding
  whether it also terminates the *current* session — if it does, this
  frontend needs to handle that (redirect to `/login` similar to
  `useAuth.ts`'s own `logout()`) rather than just calling `router.push('/profile#sessions')`,
  which assumes the current session survives.
