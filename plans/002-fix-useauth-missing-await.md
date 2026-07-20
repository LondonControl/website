# Plan 002: Make `useAuth.ts` request failures actually reach the user

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/hooks/useAuth.ts src/pages/register.tsx src/pages/login.tsx src/pages/forgot-password.tsx "src/pages/password-reset/[token].tsx" src/components/ProfileForms/DeleteAccountForm.tsx`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts below against the live files before proceeding;
> on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M (revised up from an initial S estimate — see "Why this
  matters", second half, for why the fix can't stay contained to one file)
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

Every mutating method in `src/hooks/useAuth.ts` (`register`, `login`,
`forgotPassword`, `resetPassword`, `deleteAccount`) is declared `async` but
never `return`s or `await`s the `axios...().then().catch()` chain it builds.
Because the function has no other `await` after that point, the `async`
function's returned promise resolves as soon as the synchronous body
finishes — **before** the HTTP request completes. The most directly
observable symptom of just this part of the bug: every submit button driven
by `form.formState.isSubmitting` (e.g. "Signing in…" / "Registering…") flips
back to its idle, re-enabled state almost immediately, well before the real
network request has finished, since `react-hook-form` considers the submit
"done" as soon as the `onSubmit` handler's returned promise resolves. That
allows a user to hit submit again while the first request is still in
flight.

**There's a second, deeper problem that fixing the `await` alone does not
solve.** Every calling page does this shape:

```ts
await register({ ...values, setErrors });
if (errors.length > 0) toast.error('Something went wrong, please try again!');
```

`errors` here is a React state variable, captured by closure at the time
this specific `onSubmit` function was created (i.e. at the last render).
Calling `setErrors(...)` — whether inside `register()` or anywhere else —
schedules a re-render with a *new* `errors` value; it does **not** retroactively
change the `errors` binding already captured inside the currently-executing
`onSubmit` call. So `if (errors.length > 0)` immediately after the `await`
is *always* reading stale state, one submission behind — regardless of
whether the request underneath was properly awaited. Confirm this for
yourself by reading any of the "Current state" excerpts below: the check
happens synchronously, in the same tick, right after the `await` — there is
no `useEffect` or other mechanism that would let it observe the state update
`setErrors` schedules.

The consequence: registration, login, forgot-password, password-reset, and
account-deletion **never show an error toast on the submission that actually
failed** — at best they show it one submission late, misattributed to a
*different* request. `forgot-password.tsx` additionally shows a *success*
toast unconditionally after the (misordered) check, meaning users can be
told "Password reset email sent successfully!" when the request actually
failed.

Because both problems (the missing `await`/`return`, and the
stale-state check pattern) live on the same code path and one is
meaningless to fix without the other, this plan fixes both together: it
changes each `useAuth.ts` method to `throw` on any request failure (after
still calling `setErrors` for 422s, so the existing per-field
`<InputError>` UI keeps working), and changes each caller to a standard
`try { await x(...); <success behavior> } catch { toast.error(...) }`
block instead of checking `errors.length` after the fact. This is why the
fix necessarily touches `useAuth.ts` plus its five direct callers, not just
the hook.

## Current state

### `src/hooks/useAuth.ts` (full file relevant to this plan)

```ts
1	import { useRouter } from 'next/router';
2	import { useEffect } from 'react';
3	import useSWR from 'swr';
4
5	import type User from '@/interfaces/User';
6	import axios, { csrf } from '@/lib/axios';
7	import { getUserEndpoint } from '@/utils/Endpoints';
8
9	declare type AuthMiddleware = 'auth' | 'guest';
10
11	interface UseAuth {
12	  middleware: AuthMiddleware;
13	  redirectUri?: string;
14	}
15
16	interface ApiRequest {
17	  setErrors: React.Dispatch<React.SetStateAction<never[]>>;
18	  setStatus: React.Dispatch<React.SetStateAction<any | null>>;
19	  [key: string]: any;
20	}
21
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
39
40	  const register = async (args: ApiRequest) => {
41	    const { setErrors, ...props } = args;
42
43	    await csrf();
44
45	    setErrors([]);
46
47	    axios
48	      .post('/register', {
49	        name: props.name,
50	        email: props.email,
51	        password: props.password,
52	        password_confirmation: props.password_confirmation,
53	      })
54	      .then(() => mutate())
55	      .catch((err) => {
56	        if (err.response.status !== 422) throw err;
57
58	        setErrors(err.response.data.errors);
59	      });
60	  };
61
62	  const login = async (args: ApiRequest) => {
63	    const { setErrors, setStatus, ...props } = args;
64
65	    await csrf();
66
67	    setErrors([]);
68	    setStatus(null);
69
70	    axios
71	      .post('/login', {
72	        email: props.email,
73	        password: props.password,
74	        remember: props.remember,
75	      })
76	      .then(() => mutate())
77	      .catch((err) => {
78	        if (err.response.status !== 422) throw err;
79
80	        setErrors(err.response.data.errors);
81	      });
82	  };
83
84	  const forgotPassword = async (args: ApiRequest) => {
85	    const { setErrors, setStatus, email } = args;
86	    await csrf();
87
88	    setErrors([]);
89	    setStatus(null);
90
91	    axios
92	      .post('/forgot-password', { email })
93	      .then((response) => setStatus(response.data.status))
94	      .catch((err) => {
95	        if (err.response.status !== 422) throw err;
96
97	        setErrors(err.response.data.errors);
98	      });
99	  };
100
101	  const resetPassword = async (args: ApiRequest) => {
102	    const { setErrors, setStatus, ...props } = args;
103	    await csrf();
104
105	    setErrors([]);
106	    setStatus(null);
107
108	    axios
109	      .post('/reset-password', { token: router.query.token, ...props })
110	      .then((response) =>
111	        router.push(`/login?reset=${btoa(response.data.status)}`),
112	      )
113	      .catch((err) => {
114	        if (err.response.status !== 422) throw err;
115
116	        setErrors(err.response.data.errors);
117	      });
118	  };
119
120	  const resendEmailVerification = (args: ApiRequest) => {
121	    const { setStatus } = args;
122
123	    axios
124	      .post('/email/verification-notification')
125	      .then((response) => setStatus(response.data.status));
126	  };
127
128	  const logout = async () => {
129	    await axios.post('/logout').then(() => mutate());
130
131	    window.location.pathname = '/login';
132	  };
133
134	  const deleteAccount = async (args: ApiRequest) => {
135	    const { setErrors } = args;
136	    await csrf();
137
138	    setErrors([]);
139
140	    axios
141	      .delete('/api/user')
142	      .then(() => {
143	        mutate();
144
145	        window.location.pathname = '/';
146	      })
147	      .catch((err) => {
148	        if (err.response.status !== 422) throw err;
149
150	        setErrors(err.response.data.errors);
151	      });
152	  };
153
154	  useEffect(() => {
155	    if (middleware === 'guest' && redirectUri && user) router.push(redirectUri);
156	    if (middleware === 'auth' && !user) router.push('/login');
157	    if (middleware === 'auth' && error) logout();
158
159	    if (window.location.pathname === '/verify-email' && user?.email_verified_at)
160	      router.push(redirectUri ?? '/');
161	  }, [user, error]);
162
163	  return {
164	    user,
165	    register,
166	    login,
167	    forgotPassword,
168	    resetPassword,
169	    resendEmailVerification,
170	    logout,
171	    deleteAccount,
172	  };
173	};
174	```

`logout` (lines 128-132) already awaits its chain correctly and does not
have the stale-check problem (no caller reads `errors` after calling it) —
leave it untouched. `resendEmailVerification` (lines 120-126) is a
different, fire-and-forget pattern with no caller checking `errors`
afterward either — also leave it untouched. The SWR fetcher's `.catch`
(lines 33-37) has the same unguarded `err.response.status` access as the
five methods below; fix it the same way (Step 2).

### `src/pages/register.tsx` (relevant excerpt, lines 63-76)

```ts
63	  const onSubmit = async (values: z.infer<typeof formSchema>) => {
64	    await register({
65	      name: values.name,
66	      email: values.email,
67	      password: values.password,
68	      password_confirmation: values.passwordConfirmation,
69	      setErrors,
70	      setStatus: () => {},
71	    });
72
73	    if (errors.length > 0) {
74	      toast.error('Something went wrong, please try again!');
75	    }
76	  };
```

### `src/pages/login.tsx` (relevant excerpt, lines 65-79)

```ts
65	  const onSubmit = async (values: z.infer<typeof formSchema>) => {
66	    setErrors([]);
67
68	    await login({
69	      email: values.email,
70	      password: values.password,
71	      remember: values.shouldRemember,
72	      setErrors,
73	      setStatus,
74	    });
75
76	    // if (errors.length > 0) {
77	    //   toast.error('Something went wrong, please try again!');
78	    // }
79	  };
```

Note `login.tsx` imports `toast` from `'sonner'`? Check the top of the file
— as of this plan being written, `login.tsx` does **not** import `toast`
(the reference is commented out, and there's no `import { toast } from
'sonner';` line). You will need to add that import as part of Step 4.

### `src/pages/forgot-password.tsx` (relevant excerpt, lines 48-60)

```ts
48	  const onSubmit = async (values: z.infer<typeof formSchema>) => {
49	    setErrors([]);
50	    await forgotPassword({ email: values.email, setErrors, setStatus });
51
52	    if (errors.length > 0) {
53	      toast.error('Something went wrong, please try again!');
54
55	      return;
56	    }
57
58	    form.reset();
59	    toast.success('Password reset email sent successfully!');
60	  };
```

### `src/pages/password-reset/[token].tsx` (relevant excerpt, lines 60-72)

```ts
60	  const onSubmit = async (values: z.infer<typeof formSchema>) => {
61	    await resetPassword({
62	      email: values.email,
63	      password: values.password,
64	      password_confirmation: values.passwordConfirmation,
65	      setErrors,
66	      setStatus,
67	    });
68
69	    if (errors.length > 0) {
70	      toast.error('Something went wrong, please try again');
71	    }
72	  };
```

### `src/components/ProfileForms/DeleteAccountForm.tsx` (relevant excerpt, lines 26-32)

```ts
26	  const handleAccountDelete = async (event: any) => {
27	    event.preventDefault();
28	    setErrors([]);
29	    await deleteAccount({ setStatus: () => {}, setErrors });
30	    if (errors.length > 0)
31	      toast.error('Something went wrong, please try again');
32	  };
```

- Repo convention for tests: no dedicated test file exists yet for any
  hook. Use `src/components/Auth/AuthSessionStatus.test.tsx` and
  `src/layouts/Main/Main.test.tsx` as the structural pattern (`render`/
  `screen` from `@testing-library/react`, `jest.mock('@/module', () =>
  ...)` factory style). `next/router`'s `useRouter` is already auto-mocked
  repo-wide via `__mocks__/next/router.ts` — no `jest.mock('next/router')`
  call needed in your test files.

## Commands you will need

| Purpose   | Command                                                                 | Expected on success |
|-----------|--------------------------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                                    | exit 0, no errors   |
| Tests     | `npx jest src/hooks/useAuth.test.ts src/pages/login.test.tsx`           | all pass            |
| Lint      | `npx eslint src/hooks/useAuth.ts src/pages/register.tsx src/pages/login.tsx src/pages/forgot-password.tsx "src/pages/password-reset/[token].tsx" src/components/ProfileForms/DeleteAccountForm.tsx` | exit 0, no errors |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, gated by a
15% coverage threshold) — use the targeted commands above so unrelated
pre-existing failures elsewhere don't block this plan (plan 001 addresses
the CI-wide baseline separately).

## Scope

**In scope** (the only files you should modify):
- `src/hooks/useAuth.ts`
- `src/pages/register.tsx`
- `src/pages/login.tsx`
- `src/pages/forgot-password.tsx`
- `src/pages/password-reset/[token].tsx`
- `src/components/ProfileForms/DeleteAccountForm.tsx`
- `src/hooks/useAuth.test.ts` (create)
- `src/pages/login.test.tsx` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/components/ProfileForms/UpdatePasswordForm.tsx`,
  `UpdateSettingsForm.tsx`, `UpdateProfileInformationForm.tsx` — same class
  of bug, but they make their own local `axios.put` calls (they don't go
  through `useAuth.ts`) and are covered by `plans/003-fix-profileforms-missing-await.md`.
- `logout()` and `resendEmailVerification()` in `useAuth.ts` — not part of
  this bug, see "Current state" note above.
- Adding a `csrf()` call to `logout()` — a separate, not-yet-approved
  finding (CSRF pattern consistency); do not add it here.
- The JSX/markup in any of the in-scope pages beyond what's needed to wire
  up `toast` — in particular, do not touch the `InputError`
  `error.source?.pointer` filters in `login.tsx` or the `redirectUri` value
  in `forgot-password.tsx`; both have their own separate, already-written
  plans (`plans/006-fix-login-password-error-pointer.md` and
  `plans/007-fix-forgot-password-redirect.md`) that depend on this plan
  landing first and will touch those exact lines next.

## Git workflow

- Branch: `advisor/002-fix-useauth-missing-await`
- Commit message style: Conventional Commits, matching `git log` (e.g.
  `fix: surface useAuth request failures to the user instead of swallowing them`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Rewrite the five `useAuth.ts` methods to throw on failure

Replace `register`, `login`, `forgotPassword`, `resetPassword`, and
`deleteAccount` with versions that wrap the request in `try/catch`, call
`setErrors` only on a 422 (preserving today's per-field validation-error
behavior), and **always rethrow** so any failure — 422 or otherwise —
rejects the method's returned promise. Also await `mutate()` where it's
called, so the SWR user-cache refresh is guaranteed to finish before the
method resolves.

```ts
const register = async (args: ApiRequest) => {
  const { setErrors, ...props } = args;

  await csrf();

  setErrors([]);

  try {
    await axios.post('/register', {
      name: props.name,
      email: props.email,
      password: props.password,
      password_confirmation: props.password_confirmation,
    });

    await mutate();
  } catch (err: any) {
    if (err.response?.status === 422) {
      setErrors(err.response.data.errors);
    }

    throw err;
  }
};

const login = async (args: ApiRequest) => {
  const { setErrors, setStatus, ...props } = args;

  await csrf();

  setErrors([]);
  setStatus(null);

  try {
    await axios.post('/login', {
      email: props.email,
      password: props.password,
      remember: props.remember,
    });

    await mutate();
  } catch (err: any) {
    if (err.response?.status === 422) {
      setErrors(err.response.data.errors);
    }

    throw err;
  }
};

const forgotPassword = async (args: ApiRequest) => {
  const { setErrors, setStatus, email } = args;
  await csrf();

  setErrors([]);
  setStatus(null);

  try {
    const response = await axios.post('/forgot-password', { email });

    setStatus(response.data.status);
  } catch (err: any) {
    if (err.response?.status === 422) {
      setErrors(err.response.data.errors);
    }

    throw err;
  }
};

const resetPassword = async (args: ApiRequest) => {
  const { setErrors, setStatus, ...props } = args;
  await csrf();

  setErrors([]);
  setStatus(null);

  try {
    const response = await axios.post('/reset-password', {
      token: router.query.token,
      ...props,
    });

    router.push(`/login?reset=${btoa(response.data.status)}`);
  } catch (err: any) {
    if (err.response?.status === 422) {
      setErrors(err.response.data.errors);
    }

    throw err;
  }
};

const deleteAccount = async (args: ApiRequest) => {
  const { setErrors } = args;
  await csrf();

  setErrors([]);

  try {
    await axios.delete('/api/user');

    mutate();
    window.location.pathname = '/';
  } catch (err: any) {
    if (err.response?.status === 422) {
      setErrors(err.response.data.errors);
    }

    throw err;
  }
};
```

Leave `resendEmailVerification` and `logout` exactly as they are today.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Guard the SWR fetcher's `err.response` access too

Lines 33-37 of the original file have the same unguarded pattern outside
the five methods above:

```ts
.catch((err) => {
  if (err.response.status !== 409) throw err;

  router.push('/verify-email');
}),
```

Change to:

```ts
.catch((err) => {
  if (err.response?.status !== 409) throw err;

  router.push('/verify-email');
}),
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 3: Update `register.tsx`, `password-reset/[token].tsx`, and `DeleteAccountForm.tsx` to use try/catch

These three callers don't do anything special after the (previously
stale) `errors.length` check besides showing the error toast, so the
change is a direct wrap. `register.tsx` and `password-reset/[token].tsx`
already import `toast` from `'sonner'` — confirm that before editing;
`DeleteAccountForm.tsx` also already imports it.

`register.tsx`, replace lines 63-76 with:

```ts
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    await register({
      name: values.name,
      email: values.email,
      password: values.password,
      password_confirmation: values.passwordConfirmation,
      setErrors,
      setStatus: () => {},
    });
  } catch {
    toast.error('Something went wrong, please try again!');
  }
};
```

`password-reset/[token].tsx`, replace lines 60-72 with:

```ts
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    await resetPassword({
      email: values.email,
      password: values.password,
      password_confirmation: values.passwordConfirmation,
      setErrors,
      setStatus,
    });
  } catch {
    toast.error('Something went wrong, please try again');
  }
};
```

`DeleteAccountForm.tsx`, replace lines 26-32 with:

```ts
const handleAccountDelete = async (event: any) => {
  event.preventDefault();
  setErrors([]);

  try {
    await deleteAccount({ setStatus: () => {}, setErrors });
  } catch {
    toast.error('Something went wrong, please try again');
  }
};
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 4: Update `login.tsx`, adding the missing `toast` import

Replace lines 65-79 with:

```ts
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setErrors([]);

  try {
    await login({
      email: values.email,
      password: values.password,
      remember: values.shouldRemember,
      setErrors,
      setStatus,
    });
  } catch {
    toast.error('Something went wrong, please try again!');
  }
};
```

This removes the dead commented-out block entirely (it was evidence of the
same bug being hit and abandoned, not deliberate dead code to preserve).

Add the import — `login.tsx` does not currently import `toast`. Add this
line to the existing import block, keeping alphabetical/grouped ordering
consistent with the rest of the file (the `simple-import-sort` ESLint rule
is `error`-level in this repo, so let the linter in Step 5 catch any
ordering mistake):

```ts
import { toast } from 'sonner';
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 5: Update `forgot-password.tsx`

Replace lines 48-60 with:

```ts
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setErrors([]);

  try {
    await forgotPassword({ email: values.email, setErrors, setStatus });

    form.reset();
    toast.success('Password reset email sent successfully!');
  } catch {
    toast.error('Something went wrong, please try again!');
  }
};
```

Note the success behavior (`form.reset()` + success toast) now correctly
only runs when `forgotPassword` didn't throw — i.e., only on a genuine
success.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 6: Lint everything touched

**Verify**: `npx eslint src/hooks/useAuth.ts src/pages/register.tsx src/pages/login.tsx src/pages/forgot-password.tsx "src/pages/password-reset/[token].tsx" src/components/ProfileForms/DeleteAccountForm.tsx` → exit 0, no errors (warnings from pre-existing `prettier/prettier` formatting issues elsewhere in these files, if any, are acceptable — only new errors introduced by your edit are blocking).

### Step 7: Add regression tests

Create `src/hooks/useAuth.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';
import { useAuth } from './useAuth';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('swr', () =>
  jest.fn(() => ({ data: undefined, error: undefined, mutate: jest.fn() })),
);

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  it('register rejects and populates errors on a 422', async () => {
    const setErrors = jest.fn();
    (axios.post as jest.Mock).mockRejectedValue({
      response: { status: 422, data: { errors: [{ detail: 'Email taken' }] } },
    });

    const { result } = renderHook(() => useAuth({ middleware: 'guest' }));

    await expect(
      act(async () => {
        await result.current.register({
          name: 'A',
          email: 'a@a.com',
          password: 'x',
          password_confirmation: 'x',
          setErrors,
          setStatus: jest.fn(),
        });
      }),
    ).rejects.toBeDefined();

    expect(setErrors).toHaveBeenCalledWith([{ detail: 'Email taken' }]);
  });

  it('login resolves cleanly on success and does not call setErrors', async () => {
    const setErrors = jest.fn();
    (axios.post as jest.Mock).mockResolvedValue({ data: { data: {} } });

    const { result } = renderHook(() => useAuth({ middleware: 'guest' }));

    await act(async () => {
      await result.current.login({
        email: 'a@a.com',
        password: 'x',
        remember: false,
        setErrors,
        setStatus: jest.fn(),
      });
    });

    expect(setErrors).toHaveBeenCalledWith([]);
    expect(setErrors).not.toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything()]),
    );
  });

  it('rejects non-422 errors without calling setErrors with field errors', async () => {
    const setErrors = jest.fn();
    (axios.post as jest.Mock).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useAuth({ middleware: 'guest' }));

    await expect(
      act(async () => {
        await result.current.login({
          email: 'a@a.com',
          password: 'x',
          remember: false,
          setErrors,
          setStatus: jest.fn(),
        });
      }),
    ).rejects.toBeDefined();

    expect(setErrors).toHaveBeenCalledWith([]); // only the initial clear
    expect(setErrors).toHaveBeenCalledTimes(1);
  });

  it('does not throw a TypeError when a network error has no response object', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAuth({ middleware: 'guest' }));

    await expect(
      act(async () => {
        await result.current.login({
          email: 'a@a.com',
          password: 'x',
          remember: false,
          setErrors: jest.fn(),
          setStatus: jest.fn(),
        });
      }),
    ).rejects.toThrow('Network Error');
  });
});
```

Create `src/pages/login.test.tsx` (exercises the caller-side fix
end-to-end):

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';
import Login from './login';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { get: jest.fn().mockResolvedValue({ data: { data: undefined } }), post: jest.fn() },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// eslint-disable-next-line global-require
const { toast } = jest.requireMock('sonner');

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  it('shows an error toast when login fails with a 422', async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: { status: 422, data: { errors: [{ detail: 'Invalid credentials' }] } },
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'a@a.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong, please try again!',
      ),
    );
  });

  it('does not show an error toast when login succeeds', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { data: {} } });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'a@a.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).not.toHaveBeenCalled();
  });
});
```

If `check-types` flags the `@/lib/axios` mock shape (e.g. missing
`withCredentials`/other `AxiosInstance` members), narrow the mock's type
with `as unknown as typeof axios` on the `default` export rather than
fully implementing the `AxiosInstance` interface — that's an accepted,
common pattern for partial module mocks and keeps the test focused.

**Verify**: `npx jest src/hooks/useAuth.test.ts src/pages/login.test.tsx` → all pass (4 + 2 tests).

## Test plan

- `src/hooks/useAuth.test.ts` (new): `register`/`login` reject and call
  `setErrors` with field errors on a 422; resolve cleanly with `setErrors([])`
  only on success; reject non-422 errors without populating field errors;
  don't throw an unrelated `TypeError` when `err.response` is undefined
  (network error).
- `src/pages/login.test.tsx` (new): end-to-end through the real `Login`
  page component — a mocked 422 response results in `toast.error` being
  called with the expected message; a mocked success does not call
  `toast.error`.
- Structural pattern: `@testing-library/react`'s `render`/`screen`/
  `fireEvent` as used elsewhere in the repo (`src/layouts/Main/Main.test.tsx`,
  `src/pages.test/index.test.tsx`); `renderHook`/`act` for the hook-level
  file since there's no existing hook test to model — this plan establishes
  that pattern.
- Verification: `npx jest src/hooks/useAuth.test.ts src/pages/login.test.tsx` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/hooks/useAuth.test.ts src/pages/login.test.tsx` exits 0, all tests pass
- [ ] `npx eslint src/hooks/useAuth.ts src/pages/register.tsx src/pages/login.tsx src/pages/forgot-password.tsx "src/pages/password-reset/[token].tsx" src/components/ProfileForms/DeleteAccountForm.tsx` exits 0
- [ ] `grep -rn "errors.length > 0" src/hooks/useAuth.ts src/pages/register.tsx src/pages/login.tsx src/pages/forgot-password.tsx "src/pages/password-reset/[token].tsx" src/components/ProfileForms/DeleteAccountForm.tsx` returns no matches (the stale-state check pattern is fully removed from these files)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 002 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the cited lines doesn't match the "Current state" excerpts
  above (the codebase has drifted since this plan was written).
- `logout()` turns out to also be missing an `await`/`return` when you
  re-read it live — the "Current state" excerpt here would then be stale;
  stop rather than fix it silently, since it's explicitly out of scope
  based on what was true when this plan was written.
- Any of the five callers has logic after the `errors.length` check beyond
  what's shown in the excerpts above (i.e. the live file has evolved to do
  more than this plan accounts for) — stop and report rather than guessing
  how to fold in the extra logic.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- `plans/003-fix-profileforms-missing-await.md` fixes the same class of bug
  in `ProfileForms/*` (self-contained files, no shared-hook caller
  changes needed there). It does not depend on this plan.
- `plans/006-fix-login-password-error-pointer.md` and
  `plans/007-fix-forgot-password-redirect.md` both edit files this plan
  also edits (`login.tsx`, `forgot-password.tsx`) in different, non-overlapping
  regions (JSX render body, not the `onSubmit` handler). They're sequenced
  to run after this plan and should re-run their own drift check against
  the post-002 file state.
- A follow-up (not part of this plan, not yet approved) would extract the
  repeated "await request, map 422 to setErrors, rethrow" pattern used
  here into a shared helper — flagged in the audit as `TECH-DEBT-02`. This
  plan's `useAuth.ts` is a reasonable reference implementation for that
  future work.
- Reviewers should confirm no other caller of `register`/`login`/
  `forgotPassword`/`resetPassword`/`deleteAccount` exists beyond the five
  files in scope here (grep `useAuth(` and `from '@/hooks/useAuth'` across
  `src/` to double check before merging).
