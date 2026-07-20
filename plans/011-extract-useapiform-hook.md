# Plan 011: Extract a shared `useApiForm` hook from the ProfileForms

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx`
> **This plan assumes `plans/003-fix-profileforms-missing-await.md` has
> already been executed** — the "Current state" excerpts below show the
> *post-003* code, not the original `bb7488e` code. If plan 003 has not
> run yet, STOP and execute that first; this plan's excerpts will not
> match the live files otherwise.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW — behavior-preserving extraction; the three call sites are
  simple and the resulting hook is small enough to review in full.
- **Depends on**: `plans/003-fix-profileforms-missing-await.md` (hard
  dependency — this plan refactors the fixed version of that code, not
  the buggy original)
- **Category**: tech-debt
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

After `plans/003-fix-profileforms-missing-await.md` lands,
`UpdatePasswordForm.tsx`, `UpdateSettingsForm.tsx`, and
`UpdateProfileInformationForm.tsx` each contain a near-identical
`onSubmit`: clear errors, call `csrf()`, `try` an `axios.put(...)`, show a
success toast, `catch` a 422 into `setErrors` plus an error toast (or
rethrow anything else). The only things that differ between the three are
the endpoint, the request payload, and the two toast message strings. Any
future account-settings form will need to re-derive this same shape by
copy-paste again unless it's extracted once.

This plan extracts a `useApiForm` hook that owns the `errors` state,
`csrf()` call, try/catch, and toast calls — each form is left with just
`useApiForm({...}).submit(() => axios.put(endpoint, payload))`.

**`useAuth.ts`'s methods and the pages that call them (`register.tsx`,
`login.tsx`, `forgot-password.tsx`, `password-reset/[token].tsx`,
`DeleteAccountForm.tsx`, all fixed by
`plans/002-fix-useauth-missing-await.md`) are deliberately NOT folded into
this hook.** Each of those methods has its own distinct side effect beyond
"submit and toast" — `mutate()` (SWR cache revalidation), `router.push`,
`window.location.pathname` navigation, or (for `resetPassword`) building a
redirect URL from the response body. Forcing those into a generic
`useApiForm` would mean the hook either grows options for every one-off
side effect (defeating the point of extracting something simple) or the
call sites end up just as verbose as before, wrapped in an extra layer.
This is a judgment call, not an oversight — documented here so it isn't
silently revisited without the reasoning behind it.

## Current state

**Note again: these excerpts show the state *after*
`plans/003-fix-profileforms-missing-await.md` has been applied — confirm
your live files match this, not the pre-003 `bb7488e` versions, before
proceeding.**

`src/components/ProfileForms/UpdatePasswordForm.tsx`, `onSubmit` after
plan 003:

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

`src/components/ProfileForms/UpdateSettingsForm.tsx`, `onSubmit` after
plan 003:

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

`src/components/ProfileForms/UpdateProfileInformationForm.tsx`, `onSubmit`
after plan 003:

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

All three files also currently have `const [errors, setErrors] =
useState<any>([]);` near the top of the component (before the `form =
useForm(...)` call).

## Commands you will need

| Purpose   | Command                                                                                              | Expected on success |
|-----------|-----------------------------------------------------------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                                                                       | exit 0, no errors   |
| Tests     | `npx jest src/hooks/useApiForm.test.ts src/components/ProfileForms`                                        | all pass            |
| Lint      | `npx eslint src/hooks/useApiForm.ts src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx` | exit 0, no errors |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, 15%
coverage gate) — use the targeted commands above.

## Scope

**In scope** (the only files you should modify):
- `src/hooks/useApiForm.ts` (create)
- `src/hooks/useApiForm.test.ts` (create)
- `src/components/ProfileForms/UpdatePasswordForm.tsx`
- `src/components/ProfileForms/UpdateSettingsForm.tsx`
- `src/components/ProfileForms/UpdateProfileInformationForm.tsx`
- The corresponding `*.test.tsx` files created by
  `plans/003-fix-profileforms-missing-await.md`, **only** if the mock
  shape for `@/lib/axios` needs adjusting because `csrf` is no longer
  called directly from the form component (see Step 5) — do not rewrite
  these tests wholesale, only adjust what's needed for them to keep
  passing.

**Out of scope** (do NOT touch, even though they look related):
- `src/hooks/useAuth.ts` and everything `plans/002-fix-useauth-missing-await.md`
  touches — see "Why this matters" for the reasoning.
- `src/components/ProfileForms/DeleteAccountForm.tsx`,
  `RequestDataForm.tsx`, `ActiveSessionsForm.tsx` — none of these make a
  local `axios.put`/`.post` call matching this hook's shape (`DeleteAccountForm`
  goes through `useAuth`; the other two are out of scope for different
  reasons already noted in plan 003).

## Git workflow

- Branch: `advisor/011-extract-useapiform-hook`
- Commit message style: Conventional Commits (e.g. `refactor: extract
  useApiForm hook from ProfileForms submit handlers`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the `useApiForm` hook

Create `src/hooks/useApiForm.ts`:

```ts
import { useState } from 'react';
import { toast } from 'sonner';

import { csrf } from '@/lib/axios';

interface UseApiFormOptions {
  successMessage: string;
  errorMessage?: string;
}

export function useApiForm({
  successMessage,
  errorMessage = 'Something went wrong, please try again!',
}: UseApiFormOptions) {
  const [errors, setErrors] = useState<any>([]);

  const submit = async (request: () => Promise<unknown>) => {
    setErrors([]);
    await csrf();

    try {
      await request();
      toast.success(successMessage);
    } catch (error: any) {
      if (error.response?.status !== 422) throw error;

      setErrors(error.response.data.errors);
      toast.error(errorMessage);
    }
  };

  return { errors, submit };
}
```

**Verify**: `npm run check-types` → no new errors from this file (errors
from the three form files are expected until Steps 2-4).

### Step 2: Migrate `UpdatePasswordForm.tsx`

Remove the `const [errors, setErrors] = useState<any>([]);` line and the
`csrf` import (no longer called directly). Add `import { useApiForm } from
'@/hooks/useApiForm';`. Add, near the top of the component body (replacing
the removed `useState` line):

```ts
const { errors, submit } = useApiForm({
  successMessage: 'Password updated successfully!',
});
```

Replace the `onSubmit` function with:

```ts
const onSubmit = (values: z.infer<typeof formSchema>) =>
  submit(() =>
    axios.put('/api/password', {
      current_password: values.currentPassword,
      password: values.password,
      password_confirmation: values.passwordConfirmation,
    }),
  );
```

Everything else in the file (the JSX, the `formSchema`, the `useForm`
call) is unchanged.

**Verify**: `npm run check-types` → no new errors from this file.

### Step 3: Migrate `UpdateSettingsForm.tsx`

Same pattern. Remove the local `useState` for `errors`, add the
`useApiForm` import, and:

```ts
const { errors, submit } = useApiForm({
  successMessage: 'Settings updated successfully!',
});

const onSubmit = (values: z.infer<typeof formSchema>) =>
  submit(() =>
    axios.put('/api/settings', {
      emails: {
        communication: values.communication_emails,
        marketing: values.marketing_emails,
        security: true,
      },
    }),
  );
```

Note this file also uses `errors` nowhere else in its JSX (unlike the
other two, it has no `<InputError>` bound to `errors` — confirm this by
reading the file's return statement before assuming it's safe to leave
`errors` unused; if it IS used somewhere this plan's excerpt didn't
capture, keep destructuring it from `useApiForm` regardless — an unused
destructured variable is not a lint error in this repo's config, don't
work around it by dropping the destructure).

**Verify**: `npm run check-types` → no new errors from this file.

### Step 4: Migrate `UpdateProfileInformationForm.tsx`

Same pattern:

```ts
const { errors, submit } = useApiForm({
  successMessage: 'Profile updated successfully!',
});

const onSubmit = (values: z.infer<typeof formSchema>) =>
  submit(() =>
    axios.put('/api/profile', { name: values.name, email: values.email }),
  );
```

**Verify**: `npm run check-types` → exit 0, no errors anywhere in
`src/components/ProfileForms/` or `src/hooks/useApiForm.ts`.

### Step 5: Reconcile with plan 003's existing tests

`plans/003-fix-profileforms-missing-await.md` created
`UpdatePasswordForm.test.tsx`, `UpdateSettingsForm.test.tsx`, and
`UpdateProfileInformationForm.test.tsx`, each mocking `@/lib/axios` with a
`csrf: jest.fn().mockResolvedValue(undefined)` export. Since `csrf` is now
called from inside `useApiForm` (which imports it from the same `@/lib/axios`
module), these existing mocks should continue to work unchanged — `csrf`
is still imported from `@/lib/axios` somewhere in the render tree, just
one level removed. Run the existing tests first before changing anything:

**Verify**: `npx jest src/components/ProfileForms` → if all of plan 003's
existing tests still pass unchanged, skip directly to Step 6. If any fail,
read the failure — it's most likely a mock needing to also cover
`useApiForm`'s import path, which should already resolve correctly through
the same `jest.mock('@/lib/axios', ...)` factory; do not add a *second*,
separate mock for `@/hooks/useApiForm` itself, since that would bypass
testing the real integration this plan is trying to preserve.

### Step 6: Add a unit test for `useApiForm` itself

Create `src/hooks/useApiForm.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react';

import { csrf } from '@/lib/axios';
import { useApiForm } from './useApiForm';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {},
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// eslint-disable-next-line global-require
const { toast } = jest.requireMock('sonner');

describe('useApiForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  it('shows the success toast and clears errors when the request resolves', async () => {
    const { result } = renderHook(() =>
      useApiForm({ successMessage: 'Saved!' }),
    );
    const request = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.submit(request);
    });

    expect(request).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Saved!');
    expect(toast.error).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual([]);
  });

  it('populates errors and shows the error toast on a 422', async () => {
    const { result } = renderHook(() =>
      useApiForm({ successMessage: 'Saved!' }),
    );
    const request = jest.fn().mockRejectedValue({
      response: { status: 422, data: { errors: [{ detail: 'Invalid' }] } },
    });

    await act(async () => {
      await result.current.submit(request);
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong, please try again!',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual([{ detail: 'Invalid' }]);
  });

  it('uses a custom errorMessage when provided', async () => {
    const { result } = renderHook(() =>
      useApiForm({ successMessage: 'Saved!', errorMessage: 'Custom error' }),
    );
    const request = jest.fn().mockRejectedValue({
      response: { status: 422, data: { errors: [] } },
    });

    await act(async () => {
      await result.current.submit(request);
    });

    expect(toast.error).toHaveBeenCalledWith('Custom error');
  });

  it('rethrows non-422 errors without showing the error toast', async () => {
    const { result } = renderHook(() =>
      useApiForm({ successMessage: 'Saved!' }),
    );
    const request = jest.fn().mockRejectedValue({ response: { status: 500 } });

    await expect(
      act(async () => {
        await result.current.submit(request);
      }),
    ).rejects.toBeDefined();

    expect(toast.error).not.toHaveBeenCalled();
  });
});
```

**Verify**: `npx jest src/hooks/useApiForm.test.ts` → all pass (4 tests).

### Step 7: Lint

**Verify**: `npx eslint src/hooks/useApiForm.ts src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx` → exit 0, no errors.

## Test plan

- New file: `src/hooks/useApiForm.test.ts` — success clears errors and
  toasts success; a 422 populates `errors` and toasts the (default or
  custom) error message; a non-422 error rethrows without toasting.
- Existing tests from `plans/003-fix-profileforms-missing-await.md`
  (`UpdatePasswordForm.test.tsx`, etc.) should continue to pass unchanged
  as an integration check that the refactor preserved behavior — if they
  needed modification to pass, note what changed and why in your
  completion report.
- Verification: `npx jest src/hooks/useApiForm.test.ts src/components/ProfileForms` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/hooks/useApiForm.test.ts src/components/ProfileForms` exits 0, all tests pass
- [ ] `npx eslint src/hooks/useApiForm.ts src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx` exits 0
- [ ] `grep -rn "useState<any>(\[\])" src/components/ProfileForms/UpdatePasswordForm.tsx src/components/ProfileForms/UpdateSettingsForm.tsx src/components/ProfileForms/UpdateProfileInformationForm.tsx` returns no matches (the local `errors` state is now owned by `useApiForm`)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 011 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The live files don't match the post-003 "Current state" excerpts above
  — including the case where plan 003 hasn't been executed yet at all.
- Any of the three forms has JSX depending on `errors` in a shape this
  plan's excerpts didn't account for (e.g. per-field `<InputError>`
  filtering, which `UpdatePasswordForm`/`UpdateProfileInformationForm` may
  have and `UpdateSettingsForm` may not — verify by reading each file's
  full JSX before assuming `errors`'s only consumer is the toast).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Any new account-settings form added in the future should use
  `useApiForm` from the start.
- If `DeleteAccountForm.tsx` or another `useAuth`-based flow is ever
  refactored to not need `useAuth`'s side effects, revisit whether it
  could use `useApiForm` too — not applicable today for the reasons in
  "Why this matters".
