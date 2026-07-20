# Plan 003: Fix missing-await and stale error checks in ProfileForms

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts below against the live files before proceeding;
> on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`UpdatePasswordForm.tsx`, `UpdateSettingsForm.tsx`, and
`UpdateProfileInformationForm.tsx` each submit with this shape:

```ts
const onSubmit = async (values) => {
  setErrors([]);
  await csrf();
  axios
    .put('/api/...', { ... })
    .then(() => toast.success('...'))
    .catch((error) => {
      if (error.response.status !== 422) throw error;
      setErrors(error.response.data.errors);
    });
  if (errors.length > 0) toast.error('Something went wrong, please try again!');
};
```

Two compounding bugs:

1. The `axios.put(...)` chain is never `return`ed or `await`ed, so
   `onSubmit`'s returned promise resolves before the request completes —
   `form.formState.isSubmitting` (which drives any disabled/loading submit
   button state elsewhere in the app) becomes `false` prematurely.
2. `if (errors.length > 0)` reads `errors` — a React state variable — via a
   closure captured when this specific `onSubmit` function was created.
   Calling `setErrors(...)` inside the `.catch` schedules a re-render with
   new state; it does not retroactively change the `errors` binding already
   captured in this currently-executing call. So this check is *always*
   reading stale state, one submission behind, independent of the missing
   `await`. Confirm this yourself by reading the excerpts below: the check
   runs synchronously in the same tick, with nothing (no `useEffect`, no
   re-render) between the `setErrors` call and the check that would let it
   observe the update.

Net effect: password changes, settings changes, and profile changes that
fail server-side validation show **no error feedback at all** — worse, a
failed password change followed immediately by a successful one (or vice
versa) can show the *wrong* toast, since the check is one render behind.
None of these three forms have any test coverage today.

Unlike `useAuth.ts` (see `plans/002-fix-useauth-missing-await.md`), these
three forms don't route through a shared hook — each owns its own request
and its own `onSubmit`. That means the complete fix (await the request,
and replace the stale state check with a `try/catch` that can't be stale)
is fully self-contained to each file. No other files need to change.

## Current state

### `src/components/ProfileForms/UpdatePasswordForm.tsx` (relevant excerpt, lines 43-59)

```ts
43	  const onSubmit = async (values: z.infer<typeof formSchema>) => {
44	    setErrors([]);
45	    await csrf();
46	    axios
47	      .put('/api/password', {
48	        current_password: values.currentPassword,
49	        password: values.password,
50	        password_confirmation: values.passwordConfirmation,
51	      })
52	      .then(() => toast.success('Password updated successfully!'))
53	      .catch((error) => {
54	        if (error.response.status !== 422) throw error;
55	        setErrors(error.response.data.errors);
56	      });
57	    if (errors.length > 0)
58	      toast.error('Something went wrong, please try again!');
59	  };
```

### `src/components/ProfileForms/UpdateSettingsForm.tsx` (relevant excerpt, lines 50-68)

```ts
50	  const onSubmit = async (values: z.infer<typeof formSchema>) => {
51	    setErrors([]);
52	    await csrf();
53	    axios
54	      .put('/api/settings', {
55	        emails: {
56	          communication: values.communication_emails,
57	          marketing: values.marketing_emails,
58	          security: true,
59	        },
60	      })
61	      .then(() => toast.success('Settings updated successfully!'))
62	      .catch((error) => {
63	        if (error.response.status !== 422) throw error;
64	        setErrors(error.response.data.errors);
65	      });
66	    if (errors.length > 0)
67	      toast.error('Something went wrong, please try again!');
68	  };
```

### `src/components/ProfileForms/UpdateProfileInformationForm.tsx` (relevant excerpt, lines 42-54)

```ts
42	  const onSubmit = async (values: z.infer<typeof formSchema>) => {
43	    setErrors([]);
44	    await csrf();
45	    axios
46	      .put('/api/profile', { name: values.name, email: values.email })
47	      .then(() => toast.success('Profile updated successfully!'))
48	      .catch((error) => {
49	        if (error.response.status !== 422) throw error;
50	        setErrors(error.response.data.errors);
51	      });
52	    if (errors.length > 0)
53	      toast.error('Something went wrong, please try again!');
54	  };
```

- Repo convention for tests: no test file exists yet for any `ProfileForms`
  component. Model your tests structurally after
  `src/components/Auth/AuthSessionStatus.test.tsx` (render/screen from
  `@testing-library/react`) combined with the `jest.mock('sonner', ...)`
  and `jest.mock('@/lib/axios', ...)` patterns established in
  `plans/002-fix-useauth-missing-await.md` (read that plan's Step 7 for the
  exact mock shape if useful — you don't need to have executed that plan
  first, this one is independent).

## Commands you will need

| Purpose   | Command                                                                                                                      | Expected on success |
|-----------|--------------------------------------------------------------------------------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                                                                                          | exit 0, no errors   |
| Tests     | `npx jest src/components/ProfileForms`                                                                                        | all pass            |
| Lint      | `npx eslint src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx` | exit 0, no errors |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, 15%
coverage gate) — use the targeted commands above.

## Scope

**In scope** (the only files you should modify):
- `src/components/ProfileForms/UpdatePasswordForm.tsx`
- `src/components/ProfileForms/UpdateSettingsForm.tsx`
- `src/components/ProfileForms/UpdateProfileInformationForm.tsx`
- `src/components/ProfileForms/UpdatePasswordForm.test.tsx` (create)
- `src/components/ProfileForms/UpdateSettingsForm.test.tsx` (create)
- `src/components/ProfileForms/UpdateProfileInformationForm.test.tsx` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/components/ProfileForms/DeleteAccountForm.tsx` and
  `ActiveSessionsForm.tsx` — `DeleteAccountForm` is covered by
  `plans/002-fix-useauth-missing-await.md` (it goes through `useAuth.ts`,
  not a local `axios` call); `ActiveSessionsForm` has a different,
  not-yet-approved finding (missing `csrf()` call) and should not be
  touched here.
- `src/components/ProfileForms/RequestDataForm.tsx` — not part of the
  approved findings for this batch; do not "fix" it even if it looks
  similar.
- `src/hooks/useAuth.ts` — not used by these three forms; nothing here
  should touch it.

## Git workflow

- Branch: `advisor/003-fix-profileforms-missing-await`
- Commit message style: Conventional Commits (e.g. `fix: ProfileForms now
  await their request and surface errors correctly`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix `UpdatePasswordForm.tsx`

Replace lines 43-59 with:

```ts
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setErrors([]);
  await csrf();

  try {
    await axios.put('/api/password', {
      current_password: values.currentPassword,
      password: values.password,
      password_confirmation: values.passwordConfirmation,
    });

    toast.success('Password updated successfully!');
  } catch (error: any) {
    if (error.response?.status !== 422) throw error;

    setErrors(error.response.data.errors);
    toast.error('Something went wrong, please try again!');
  }
};
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Fix `UpdateSettingsForm.tsx`

Replace lines 50-68 with:

```ts
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setErrors([]);
  await csrf();

  try {
    await axios.put('/api/settings', {
      emails: {
        communication: values.communication_emails,
        marketing: values.marketing_emails,
        security: true,
      },
    });

    toast.success('Settings updated successfully!');
  } catch (error: any) {
    if (error.response?.status !== 422) throw error;

    setErrors(error.response.data.errors);
    toast.error('Something went wrong, please try again!');
  }
};
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 3: Fix `UpdateProfileInformationForm.tsx`

Replace lines 42-54 with:

```ts
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setErrors([]);
  await csrf();

  try {
    await axios.put('/api/profile', { name: values.name, email: values.email });

    toast.success('Profile updated successfully!');
  } catch (error: any) {
    if (error.response?.status !== 422) throw error;

    setErrors(error.response.data.errors);
    toast.error('Something went wrong, please try again!');
  }
};
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 4: Lint everything touched

**Verify**: `npx eslint src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx` → exit 0, no new errors.

### Step 5: Add regression tests

Create one test file per form. Each mocks `@/lib/axios` and `sonner`
directly (no shared hook to mock here, unlike plan 002). Use
`UpdatePasswordForm.test.tsx` as the template for the other two, adjusting
the endpoint, payload, and success/error messages to match each form.

`src/components/ProfileForms/UpdatePasswordForm.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';
import UpdatePasswordForm from './UpdatePasswordForm';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { put: jest.fn() },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// eslint-disable-next-line global-require
const { toast } = jest.requireMock('sonner');

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  const fillAndSubmit = () => {
    const [currentPassword, newPassword, confirmPassword] =
      screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(currentPassword!, { target: { value: 'oldpass123' } });
    fireEvent.change(newPassword!, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPassword!, { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
  };

  it('shows a success toast and does not show an error toast on success', async () => {
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });

    render(<UpdatePasswordForm />);
    fillAndSubmit();

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully!'),
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error toast on a 422 and does not show a success toast', async () => {
    (axios.put as jest.Mock).mockRejectedValue({
      response: { status: 422, data: { errors: [{ detail: 'Current password is incorrect' }] } },
    });

    render(<UpdatePasswordForm />);
    fillAndSubmit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong, please try again!',
      ),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});
```

If `screen.getAllByPlaceholderText('••••••••')` doesn't reliably return
elements in DOM order across test runs, use `screen.getAllByLabelText`
matching each field's `FormLabel` text ("Current password", "New
password", "Confirm new password") instead — whichever query the executor
finds more stable is fine, the assertion on `toast.success`/`toast.error`
is what matters, not the exact query strategy.

For `UpdateSettingsForm.test.tsx`, the form has no required text inputs
(only `Switch` toggles with sensible defaults), so you can submit
immediately via `fireEvent.click(screen.getByRole('button', { name: /save changes/i }))`
without filling anything first. `UpdateSettingsForm` also calls
`useAuth({ middleware: 'auth' })` internally — mock `@/hooks/useAuth`
the same way `Main.test.tsx` mocks other dependencies:

```ts
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: '1', settings: { emails: {} } } }),
}));
```

`UpdateProfileInformationForm` also calls `useAuth({ middleware: 'auth' })`
— apply the same mock, with `user: { id: '1', name: 'Test', email: 'test@example.com' }`.

**Verify**: `npx jest src/components/ProfileForms` → all pass (6 new tests across 3 files).

## Test plan

- One test file per form (3 total, 2 tests each): success shows the
  success toast and not the error toast; a 422 shows the error toast (with
  the correct message) and not the success toast.
- Structural pattern: `@testing-library/react` render/screen/fireEvent as
  used in `src/layouts/Main/Main.test.tsx`; `jest.mock('sonner', ...)` and
  `jest.mock('@/lib/axios', ...)` following the shape established in
  `plans/002-fix-useauth-missing-await.md`'s test steps.
- Verification: `npx jest src/components/ProfileForms` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/components/ProfileForms` exits 0, all tests pass
- [ ] `npx eslint src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx` exits 0
- [ ] `grep -n "errors.length > 0" src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx` returns no matches
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 003 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the cited lines doesn't match the "Current state" excerpts
  above.
- Any of the three forms turns out to have logic after the
  `errors.length` check beyond what's shown here — stop and report rather
  than guessing how to fold in the extra logic.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- `plans/002-fix-useauth-missing-await.md` fixes the same class of bug
  where it lives inside `useAuth.ts` (`DeleteAccountForm.tsx`,
  `register.tsx`, `login.tsx`, `forgot-password.tsx`,
  `password-reset/[token].tsx`). Both plans are independent and can run in
  either order.
- A follow-up (not part of this plan, not yet approved) would extract the
  repeated "await request, map 422 to setErrors, show toast" pattern used
  here — the audit flagged this as `TECH-DEBT-02`. This plan's three fixed
  files are reasonable reference implementations for that future work.
