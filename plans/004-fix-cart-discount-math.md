# Plan 004: Fix inverted fixed-amount discount math in `CartContext`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/context/CartContext.tsx`
> If this file changed since this plan was written, compare the "Current
> state" excerpt below against the live file before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/context/CartContext.tsx` computes the cart's discount total like this:

```ts
if (cartDiscount) {
  if (cartDiscount.discount.is_percentage) {
    cartDiscountTotal = (cartSubtotal * cartDiscount.discount.amount) / 10000;
  } else {
    cartDiscountTotal = cartSubtotal - cartDiscount.discount.amount;
  }
}

const cartTotal = cartSubtotal - cartDiscountTotal;
```

For a fixed-amount (non-percentage) discount, `cartDiscountTotal` is set to
`cartSubtotal - discount.amount` — i.e. the *discount amount itself* is
being computed as "subtotal minus discount", when it should just be
`discount.amount`. Substituting into `cartTotal = cartSubtotal -
cartDiscountTotal` algebraically gives:

```
cartTotal = cartSubtotal - (cartSubtotal - discount.amount)
          = discount.amount
```

The displayed "Order total" for any fixed-amount discount code becomes the
raw discount amount, completely ignoring what's actually in the cart. If a
customer has a £150 cart and applies a £10 fixed discount code, the
checkout page (`src/pages/checkout.tsx`, which renders `cartDiscountTotal`
and `cartTotal` directly at lines ~327-339) would show a "Discount" of
£140 and an "Order total" of £10 — the opposite of what a £10-off discount
should show. If `discount.amount` happens to exceed the subtotal, the
"Discount" line goes negative, which is visibly broken.

Percentage-based discounts (`is_percentage: true`) are unaffected — their
formula is correct.

The actual PayPal charge is created and validated server-side (a separate
Laravel backend, not in this repo), so no money is lost — but the customer
sees a materially wrong total at the point of payment, which is a
trust-damaging discrepancy regardless of what they're actually charged.

## Current state

`src/context/CartContext.tsx`, full relevant excerpt (lines 110-122):

```ts
110	  // Get cart total, get the discount, - the amount or %.
111	  let cartDiscountTotal = 0;
112	  if (cartDiscount) {
113	    if (cartDiscount.discount.is_percentage) {
114	      cartDiscountTotal = (cartSubtotal * cartDiscount.discount.amount) / 10000;
115	    } else {
116	      cartDiscountTotal = cartSubtotal - cartDiscount.discount.amount;
117	    }
118	  }
119
120	  const cartTotal = cartSubtotal - cartDiscountTotal;
121
122	  const cartCount = cartItems.length;
```

Relevant type, `src/interfaces/Discount.ts`:

```ts
export default interface Discount {
  id: string;
  title: string;
  description?: string;
  code: string;
  amount: number;
  is_percentage: boolean;
  starts_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
```

`amount` is a plain number in the same minor-currency-unit (pence) scale as
`Product.price` — e.g. `checkout.tsx` renders prices via `item.product.price
/ 100`, and the percentage branch above divides by `10000` (100 for the
minor-unit-to-major-unit conversion, times 100 again because the percentage
itself is stored as e.g. `2500` for 25%, not `0.25` or `25` — confirm this
assumption is consistent with the percentage branch's existing, correct
code; do not change the percentage branch).

- No test file exists yet for `CartContext.tsx`. There is no established
  pattern in this repo for testing a React Context provider directly — this
  plan establishes one using `renderHook` with a `wrapper` option, which is
  the standard Testing Library approach for context-dependent hooks.

## Commands you will need

| Purpose   | Command                                                    | Expected on success |
|-----------|-------------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                        | exit 0, no errors   |
| Tests     | `npx jest src/context/CartContext.test.tsx`                 | all pass            |
| Lint      | `npx eslint src/context/CartContext.tsx src/context/CartContext.test.tsx` | exit 0, no errors |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, 15%
coverage gate) — use the targeted commands above.

## Scope

**In scope** (the only files you should modify):
- `src/context/CartContext.tsx`
- `src/context/CartContext.test.tsx` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/pages/checkout.tsx` — it just renders the values this context
  computes; once the context is fixed, checkout's display is correct with
  no changes needed there. Do not touch it.
- The percentage-discount branch (line 114) — it is correct as-is.
- `src/interfaces/Discount.ts` / `src/interfaces/CartDiscount.ts` — no type
  changes needed.

## Git workflow

- Branch: `advisor/004-fix-cart-discount-math`
- Commit message style: Conventional Commits (e.g. `fix: correct
  fixed-amount discount calculation in CartContext`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the fixed-amount discount formula

Replace line 116:

```ts
cartDiscountTotal = cartSubtotal - cartDiscount.discount.amount;
```

with:

```ts
cartDiscountTotal = Math.min(cartDiscount.discount.amount, cartSubtotal);
```

The `Math.min` clamp prevents the "Discount" line from ever exceeding the
subtotal (which would otherwise make `cartTotal` negative) if a fixed
discount amount is misconfigured on the backend to be larger than a given
cart — this is a defensive addition beyond the literal one-line bug, kept
because it's a direct, obvious consequence of the same formula and costs
nothing extra to include.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Add regression tests

Create `src/context/CartContext.test.tsx`:

```tsx
import { act, renderHook } from '@testing-library/react';

import { CartProvider, useCart } from './CartContext';
import type Discount from '@/interfaces/Discount';
import type Product from '@/interfaces/Product';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const makeProduct = (price: number): Product => ({
  id: '1',
  title: 'Test Product',
  url: 'test-product',
  price,
  is_available: true,
  needs_activating: false,
  current_airac: '2601',
});

const makeDiscount = (amount: number, isPercentage: boolean): Discount => ({
  id: 'd1',
  title: 'Test Discount',
  code: 'TESTCODE',
  amount,
  is_percentage: isPercentage,
  starts_at: '2026-01-01',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
});

describe('CartContext', () => {
  it('applies a fixed-amount discount as the discount amount itself, not subtotal-minus-amount', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(makeProduct(15000))); // £150.00
    act(() => result.current.applyDiscount(makeDiscount(1000, false))); // £10.00 off

    expect(result.current.cartDiscountTotal).toBe(1000);
    expect(result.current.cartTotal).toBe(14000); // £140.00
  });

  it('still applies percentage discounts correctly (regression guard)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(makeProduct(10000))); // £100.00
    act(() => result.current.applyDiscount(makeDiscount(2500, true))); // 25% off

    expect(result.current.cartDiscountTotal).toBe(2500);
    expect(result.current.cartTotal).toBe(7500); // £75.00
  });

  it('clamps a fixed-amount discount so it never exceeds the subtotal', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(makeProduct(500))); // £5.00
    act(() => result.current.applyDiscount(makeDiscount(1000, false))); // £10.00 off, exceeds subtotal

    expect(result.current.cartDiscountTotal).toBe(500);
    expect(result.current.cartTotal).toBe(0);
  });
});
```

**Verify**: `npx jest src/context/CartContext.test.tsx` → all pass (3 tests).

### Step 3: Lint

**Verify**: `npx eslint src/context/CartContext.tsx src/context/CartContext.test.tsx` → exit 0, no errors.

## Test plan

- New file: `src/context/CartContext.test.tsx`, covering: a fixed-amount
  discount produces the correct (not inverted) total; the existing
  percentage-discount path still works (regression guard so this fix
  doesn't accidentally break the correct branch); a fixed-amount discount
  larger than the subtotal is clamped instead of producing a negative
  total.
- No existing test file to model directly — this plan establishes the
  `renderHook` + `wrapper` pattern for testing this context; use it as the
  reference for any future `CartContext` tests.
- Verification: `npx jest src/context/CartContext.test.tsx` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/context/CartContext.test.tsx` exits 0, 3 tests pass
- [ ] `npx eslint src/context/CartContext.tsx src/context/CartContext.test.tsx` exits 0
- [ ] `grep -n "cartSubtotal - cartDiscount.discount.amount" src/context/CartContext.tsx` returns no matches
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 004 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at line 116 doesn't match the "Current state" excerpt above.
- The percentage-discount branch (line 114) looks wrong to you on
  inspection — it's marked correct/out-of-scope based on the algebra
  worked out in "Why this matters"; if you find a reason to doubt that,
  stop and report rather than changing it.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If a future change introduces server-driven discount validation at
  checkout (i.e. the backend starts returning a computed total instead of
  a raw discount amount), this client-side calculation should be
  revisited entirely rather than patched further.
- This is the first test file for `CartContext.tsx`; `TEST-01` in the audit
  (zero coverage on stateful/critical-path modules) flagged
  `cartContainsItem`/`addToCart`/`removeFromCart`/`applyDiscount`/
  `removeDiscount` as also untested. Extending this file with tests for
  those functions is reasonable future work but is not required by this
  plan's done criteria.
