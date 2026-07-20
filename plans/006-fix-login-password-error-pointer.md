# Plan 006: Fix login.tsx password field filtering errors by the wrong pointer

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/pages/login.tsx`
> This file is also modified by `plans/002-fix-useauth-missing-await.md`
> (which changes the `onSubmit` function body, not the JSX this plan
> targets). If plan 002 has landed, the file's line numbers will differ
> from the "Current state" excerpt below even though the JSX content this
> plan targets is unaffected — locate the target by matching the code
> content shown below, not by trusting the line numbers literally. If the
> JSX content itself doesn't match (not just the line numbers), treat that
> as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/002-fix-useauth-missing-await.md` (same file,
  different region — see drift check above; this plan can technically run
  independently, but running it after 002 avoids any ambiguity about which
  version of the file you're looking at)
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/pages/login.tsx` renders two `<FormField>` blocks, one for `email` and
one for `password`, each with an `<InputError>` that's supposed to show
only the server-side validation errors relevant to that specific field by
filtering on `error.source?.pointer`. The email field correctly filters for
`'/email'`. The password field — almost certainly a copy-paste from the
email field above it — **also** filters for `'/email'` instead of
`'/password'`. Compare this to `src/pages/register.tsx`, which has the
identical `InputError` pattern done correctly for all four of its fields
(`/name`, `/email`, `/password`, `/password_confirmation`), confirming
`'/password'` is the correct pointer value the backend uses for
password-related validation errors.

Practical effect: if the backend rejects a login attempt with a
password-specific validation error (e.g. "password is required" — as
opposed to an authentication failure, which is a different error shape
entirely), that error is silently filtered out and never shown under the
password field, because the filter is looking for `/email`-pointer errors
in a field's error list, not `/password`-pointer ones.

## Current state

`src/pages/login.tsx`, the two `<FormField>` blocks in question (current
line numbers as of commit `bb7488e`, before plan 002 lands — see drift
check note above for what changes if 002 has already run):

```tsx
98	            <FormField
99	              control={form.control}
100	              name="email"
101	              render={({ field }) => (
102	                <FormItem>
103	                  <FormLabel>Email</FormLabel>
104
105	                  <FormControl>
106	                    <Input type="email" placeholder="Email" {...field} />
107	                  </FormControl>
108
109	                  <FormMessage />
110
111	                  <InputError
112	                    messages={errors?.filter(
113	                      (error: ErrorInput) => error.source?.pointer === '/email',
114	                    )}
115	                    className="mt-2"
116	                  />
117	                </FormItem>
118	              )}
119	            />
120
121	            <FormField
122	              control={form.control}
123	              name="password"
124	              render={({ field }) => (
125	                <FormItem>
126	                  <FormLabel>Password</FormLabel>
127
128	                  <FormControl>
129	                    <Input type="password" placeholder="Password" {...field} />
130	                  </FormControl>
131
132	                  <FormMessage />
133
134	                  <InputError
135	                    messages={errors?.filter(
136	                      (error: ErrorInput) => error.source?.pointer === '/email',
137	                    )}
138	                    className="mt-2"
139	                  />
140	                </FormItem>
141	              )}
142	            />
```

The bug is on line 136 (the *second* occurrence of `error.source?.pointer
=== '/email'`, inside the `password` field's block) — it should read
`'/password'`, matching the field it's actually inside.

Reference for the correct pattern, `src/pages/register.tsx` (lines
151-157, the password field there):

```tsx
                  <InputError
                    messages={errors?.filter(
                      (error: ErrorInput) =>
                        error.source?.pointer === '/password',
                    )}
                    className="mt-2"
                  />
```

## Commands you will need

| Purpose   | Command                                    | Expected on success |
|-----------|-----------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                          | exit 0, no errors   |
| Tests     | `npx jest src/pages/login.test.tsx`            | all pass            |
| Lint      | `npx eslint src/pages/login.tsx`               | exit 0, no errors   |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, 15%
coverage gate) — use the targeted commands above.

## Scope

**In scope** (the only files you should modify):
- `src/pages/login.tsx`
- `src/pages/login.test.tsx` — if `plans/002-fix-useauth-missing-await.md`
  has already landed, this file will already exist (it creates it); add a
  new test to it rather than creating a duplicate file. If it doesn't
  exist yet, create it with just the one test below.

**Out of scope** (do NOT touch, even though they look related):
- The `email` field's `InputError` filter (line 113 above) — it's already
  correct.
- `src/pages/register.tsx` — read-only reference for this plan; do not
  modify it.
- Anything in `login.tsx`'s `onSubmit` function — that's
  `plans/002-fix-useauth-missing-await.md`'s territory, not this plan's.

## Git workflow

- Branch: `advisor/006-fix-login-password-error-pointer`
- Commit message style: Conventional Commits (e.g. `fix: login password
  field now shows its own validation errors instead of the email field's`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the pointer filter

In the `password` field's `<InputError>` block (identified by content
match, not necessarily line 136 — see drift check), change:

```tsx
messages={errors?.filter(
  (error: ErrorInput) => error.source?.pointer === '/email',
)}
```

(the one inside the `password` `<FormField>`, i.e. the *second* occurrence
of this exact text in the file) to:

```tsx
messages={errors?.filter(
  (error: ErrorInput) => error.source?.pointer === '/password',
)}
```

Leave the first occurrence (inside the `email` field) untouched.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Lint

**Verify**: `npx eslint src/pages/login.tsx` → exit 0, no new errors.

### Step 3: Add a regression test

If `src/pages/login.test.tsx` already exists (created by plan 002), add
this test to its `describe('Login page', ...)` block. If it doesn't exist,
create the file with just this one test (mocking `@/lib/axios` the same
way plan 002's version does):

```tsx
it('shows password-specific errors under the password field, not the email field', async () => {
  (axios.post as jest.Mock).mockRejectedValue({
    response: {
      status: 422,
      data: { errors: [{ detail: 'Password is required', source: { pointer: '/password' } }] },
    },
  });

  render(<Login />);

  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'a@a.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() =>
    expect(screen.getByText('Password is required')).toBeInTheDocument(),
  );
});
```

If creating the file fresh (plan 002 hasn't landed yet), use this full
file:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';
import Login from './login';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { get: jest.fn().mockResolvedValue({ data: { data: undefined } }), post: jest.fn() },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  it('shows password-specific errors under the password field, not the email field', async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        status: 422,
        data: { errors: [{ detail: 'Password is required', source: { pointer: '/password' } }] },
      },
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'a@a.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(screen.getByText('Password is required')).toBeInTheDocument(),
    );
  });
});
```

Note: with today's (pre-plan-002) `login.tsx`, `errors` never actually
gets populated before this check runs due to the separate bug plan 002
fixes — if you're executing this plan *before* plan 002, this test may
fail for that unrelated reason. If so, that's expected and is not a
failure of this plan's own fix; note it in your completion report and
either wait for plan 002 or implement this plan's fix first and mark the
test's assertion pending until plan 002 lands. Prefer running plan 002
first to avoid this altogether.

**Verify**: `npx jest src/pages/login.test.tsx` → all pass.

## Test plan

- One new test (added to `login.test.tsx`, shared with or created
  independently of plan 002's file): a 422 response with a
  `/password`-pointer error results in that error's `detail` text being
  rendered on the page.
- Verification: `npx jest src/pages/login.test.tsx` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/pages/login.test.tsx` exits 0, all tests pass
- [ ] `npx eslint src/pages/login.tsx` exits 0
- [ ] The password field's `<InputError>` block filters on
      `'/password'`, confirmed by reading the live file (both
      `'/email'` occurrences should not both exist in the same file
      section any more — there should be exactly one `'/email'` pointer
      filter and one `'/password'` pointer filter)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 006 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The JSX content shown in "Current state" doesn't appear anywhere in the
  live file (not just at a different line number — the content itself is
  missing or has changed shape).
- There are more than two occurrences of `error.source?.pointer ===
  '/email'` in the file — that would mean the file has drifted beyond what
  this plan accounts for.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- This is a narrow, isolated one-line fix. No follow-up work is implied.
- If `plans/002-fix-useauth-missing-await.md` has not yet landed when this
  plan runs, `login.test.tsx` will be created fresh here; when 002 later
  runs, its own test-creation step should detect the file already exists
  and add to it rather than overwrite it — flag this to whoever executes
  002 if you complete this plan first.
