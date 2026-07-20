# Plan 008: Guard `err.response` access in checkout.tsx's discount-code handler

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/pages/checkout.tsx`
> If this file changed since this plan was written, compare the "Current
> state" excerpt below against the live file before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/pages/checkout.tsx`'s discount-code submit handler (`onSubmit`)
accesses `error.response.status` and `error.response.data.errors[0].detail`
without checking that `error.response` exists first. `useAuth.ts` and the
`ProfileForms` files had the identical pattern and were fixed in
`plans/002-fix-useauth-missing-await.md` and
`plans/003-fix-profileforms-missing-await.md`; this file was intentionally
left out of both of those plans' scope (see each plan's "Out of scope"
section) because it isn't part of the missing-await/stale-closure bug
those plans fix — it just happens to share the same unguarded-access
pattern. This plan closes that last remaining gap.

A network error, timeout, or CORS failure applying a discount code would
currently throw a raw `TypeError: Cannot read properties of undefined
(reading 'status')` from inside the `catch` block itself, instead of
showing the intended "Something went wrong, please try again!" toast —
the worst possible place for this to happen, since it's on the checkout
page.

## Current state

`src/pages/checkout.tsx`, relevant excerpt (lines 133-162):

```tsx
133	  const onSubmit = async (values: z.infer<typeof formSchema>) => {
134	    try {
135	      const response = await axios.get(
136	        `/api/discounts/verify?code=${values.code}`,
137	      );
138
139	      if (cartContainsDiscount(response.data.data.id)) {
140	        form.reset();
141	        toast.error('The discount code has already been applied!');
142	        return;
143	      }
144
145	      applyDiscount(response.data.data);
146
147	      form.reset();
148	      toast.success('The discount has been applied successfully!');
149	    } catch (error: any) {
150	      if (error.response.status === 404) {
151	        toast.error(error.response.data.errors[0].detail);
152	        return;
153	      }
154
155	      if (error.response.status === 422) {
156	        toast.error(error.response.data.errors[0].detail);
157	        return;
158	      }
159	      toast.error('Something went wrong, please try again!');
160	    }
161	  };
```

## Commands you will need

| Purpose   | Command                                          | Expected on success |
|-----------|------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                 | exit 0, no errors   |
| Tests     | `npx jest src/pages/checkout.test.tsx`               | all pass            |
| Lint      | `npx eslint src/pages/checkout.tsx`                  | exit 0, no errors   |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, 15%
coverage gate) — use the targeted commands above.

## Scope

**In scope** (the only files you should modify):
- `src/pages/checkout.tsx`
- `src/pages/checkout.test.tsx` (create)

**Out of scope** (do NOT touch, even though they look related):
- The PayPal `createPaypalOrder`/`capturePaypalOrder`/`createDemoOrder`
  functions in the same file — their `catch` blocks use a simpler
  `catch (err) { toast.error(...); return null; }` pattern that doesn't
  access `err.response` at all, so they're not affected by this bug.
  Don't restructure them.
- `src/hooks/useAuth.ts` and `ProfileForms/*` — already fixed by plans 002
  and 003.

## Git workflow

- Branch: `advisor/008-fix-checkout-response-guard`
- Commit message style: Conventional Commits (e.g. `fix: guard
  err.response access in checkout discount-code handler`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add optional chaining to both `error.response` accesses

Replace lines 149-159:

```tsx
} catch (error: any) {
  if (error.response.status === 404) {
    toast.error(error.response.data.errors[0].detail);
    return;
  }

  if (error.response.status === 422) {
    toast.error(error.response.data.errors[0].detail);
    return;
  }
  toast.error('Something went wrong, please try again!');
}
```

with:

```tsx
} catch (error: any) {
  if (error.response?.status === 404) {
    toast.error(error.response.data.errors[0].detail);
    return;
  }

  if (error.response?.status === 422) {
    toast.error(error.response.data.errors[0].detail);
    return;
  }
  toast.error('Something went wrong, please try again!');
}
```

(Only the `.status` checks need the `?.` — once either check is true, we
already know `error.response` exists, so the `.data.errors[0].detail`
lines below them don't need their own guard.)

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Lint

**Verify**: `npx eslint src/pages/checkout.tsx` → exit 0, no new errors.

### Step 3: Add a regression test

Create `src/pages/checkout.test.tsx`. This page calls `useAuth({
middleware: 'auth' })` and returns `null` until `user` is set, and reads
`useCart()` from context — mock both directly rather than trying to drive
them through their real providers, matching the scoped-mock style used in
`UpdateSettingsForm.test.tsx` (see `plans/003-fix-profileforms-missing-await.md`).

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import axios from '@/lib/axios';
import Checkout from './checkout';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: '1' } }),
}));

jest.mock('@/context/CartContext', () => ({
  useCart: () => ({
    cartItems: [],
    cartTotal: 0,
    cartSubtotal: 0,
    cartDiscount: null,
    cartContainsDiscount: () => false,
    cartDiscountTotal: 0,
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
    applyDiscount: jest.fn(),
    removeDiscount: jest.fn(),
  }),
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// eslint-disable-next-line global-require
const { toast } = jest.requireMock('sonner');

describe('Checkout page — discount code handler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows a generic error toast instead of throwing when the request fails with no response object', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

    render(<Checkout />);

    fireEvent.change(screen.getByPlaceholderText('Discount Code'), {
      target: { value: 'SAVE10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong, please try again!',
      ),
    );
  });

  it('shows the specific error detail on a 404', async () => {
    (axios.get as jest.Mock).mockRejectedValue({
      response: { status: 404, data: { errors: [{ detail: 'Discount code not found' }] } },
    });

    render(<Checkout />);

    fireEvent.change(screen.getByPlaceholderText('Discount Code'), {
      target: { value: 'BADCODE' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Discount code not found'),
    );
  });
});
```

If `check-types` flags the `@/context/CartContext` or `@/hooks/useAuth`
mock shapes against their real return types, narrow with `as unknown as
ReturnType<typeof useCart>` (or the equivalent for `useAuth`) rather than
fully implementing every field — only the fields this page actually reads
need to be present.

**Verify**: `npx jest src/pages/checkout.test.tsx` → all pass (2 tests).

## Test plan

- New file: `src/pages/checkout.test.tsx`, covering: a network error with
  no `response` object shows the generic error toast instead of throwing;
  a 404 response shows the specific server-provided error detail.
- Structural pattern: mock `useAuth`/`useCart`/`@/lib/axios`/`sonner`
  directly rather than driving real providers, per the pattern in
  `plans/003-fix-profileforms-missing-await.md`.
- Verification: `npx jest src/pages/checkout.test.tsx` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/pages/checkout.test.tsx` exits 0, 2 tests pass
- [ ] `npx eslint src/pages/checkout.tsx` exits 0
- [ ] `grep -n "error.response.status ===" src/pages/checkout.tsx` returns
      no matches (both should now read `error.response?.status ===`)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 008 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at lines 149-159 doesn't match the "Current state" excerpt
  above.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- This closes out the last known unguarded `err.response` access site
  from the original audit; no further follow-up implied.
