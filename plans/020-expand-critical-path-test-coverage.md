# Plan 020: Close the remaining test-coverage gaps on cart and checkout

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **This plan extends test files created by other plans in this batch**
> (`plans/004-fix-cart-discount-math.md` creates `CartContext.test.tsx`;
> `plans/008-fix-checkout-response-guard.md` creates `checkout.test.tsx`).
> It works whether or not those have executed yet — if the files don't
> exist, this plan creates them; if they do, extend them rather than
> overwriting.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: LOW (test-only additions)
- **Depends on**: none (soft — see note above about extending vs. creating
  `CartContext.test.tsx` and `checkout.test.tsx`)
- **Category**: tests
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

The original audit flagged zero test coverage across every stateful/
critical-path module in this app (`TEST-01`). Plans `002`, `003`, `004`,
`005`, `008`, `010`, and `019` in this batch each add targeted tests as a
side effect of fixing specific bugs — but they don't add *comprehensive*
coverage of two of the highest-value remaining surfaces:

- **`CartContext.tsx`**: plan 004 only adds tests for the discount-math
  bug it's fixing (`applyDiscount`, `cartDiscountTotal`, `cartTotal`).
  `cartContainsItem`, `addToCart`'s duplicate-guard, `removeFromCart`,
  `clearCart`, `cartContainsDiscount`, and `removeDiscount` remain
  completely untested — this is the state powering the entire shopping
  cart, and a regression in any of these functions (e.g. `removeFromCart`
  removing the wrong item, or the duplicate-add guard silently breaking)
  would currently ship undetected.
- **`checkout.tsx`'s PayPal order-creation/capture functions**
  (`createPaypalOrder`, `capturePaypalOrder`, `createDemoOrder`): plan 008
  only tests the discount-code form; plan 018 tests one narrow assertion
  (the request body doesn't include `user_id`). The actual order-creation
  and payment-capture logic — the functions that make this a functioning
  e-commerce checkout — has no test coverage of its success or failure
  paths.

This plan closes both gaps. It deliberately does **not** attempt full
page-level integration coverage of `orders/index.tsx`, `downloads.tsx`,
`profile.tsx`, or the `OrdersColumns`/`DownloadsColumns` column
definitions (date/price formatting, sort/filter functions) — see
"Maintenance notes" for why, and treat those as real, separately-scoped
follow-up work rather than something this plan silently drops.

## Current state

`src/context/CartContext.tsx`, the functions this plan targets that
aren't yet covered by `plans/004-fix-cart-discount-math.md`'s tests:

```ts
const cartContainsItem = (productId: string) => {
  const existingCartItemIndex = cartItems.findIndex(
    (item) => item.product.id === productId,
  );
  return existingCartItemIndex !== -1;
};

const addToCart = (product: Product) => {
  if (cartContainsItem(product.id)) {
    return;
  }
  setCartItems([...cartItems, { product }]);
};

const removeFromCart = (productId: string) => {
  const updatedCartItems = cartItems.filter(
    (item) => item.product.id !== productId,
  );
  setCartItems(updatedCartItems);
};

const clearCart = () => {
  setCartItems([]);
};

const cartContainsDiscount = (discountId: string) => {
  return discountId === cartDiscount?.discount.id;
};

const removeDiscount = (discountId: string) => {
  if (!cartContainsDiscount(discountId)) {
    return;
  }
  setCartDiscount(null);
};
```

`src/pages/checkout.tsx`, the three functions this plan targets (lines
67-131 as of `bb7488e`):

```ts
const createPaypalOrder = async (items: string[], discountId: any) => {
  try {
    const itemIds = items.map((item) => ({ id: item }));
    await csrf();
    const response = await axios.post('/api/order/create', {
      user_id: user?.id,
      discount_id: discountId ?? null,
      order_items: itemIds,
    });
    return response.data.data.id;
  } catch (err) {
    toast.error('An error occurred');
    return null;
  }
};

const capturePaypalOrder = async (paymentId: any) => {
  try {
    if (paymentId == null) throw new Error('Payment id is null');
    await csrf();
    const response = await axios.post('/api/order/capture', {
      transaction_id: paymentId,
    });
    if (response.status === 200) {
      toast.success('Purchase successful');
    }
    form.reset();
    removeDiscount(cartDiscount?.discount.id ?? '');
    return response;
  } catch (err) {
    toast.error('Something went wrong, please try again!');
    return null;
  }
};

const createDemoOrder = async (items: string[], discountId: any) => {
  try {
    const itemIds = items.map((item) => ({ id: item }));
    await csrf();
    const response = await axios.post('/api/order-demo/create', {
      user_id: user?.id,
      discount_id: discountId ?? null,
      order_items: itemIds,
    });
    if (response.status === 200) {
      toast.success('Purchase successful');
    }
    form.reset();
    removeDiscount(cartDiscount?.discount.id ?? '');
    return response;
  } catch (err) {
    toast.error('Something went wrong, please try again!');
    return null;
  }
};
```

**If `plans/018-investigate-order-user-id.md` has already executed**, the
`user_id` field will already be removed from the two request bodies above
— that's fine, this plan's tests don't assert on `user_id` either way (see
Step 3, which asserts on `discount_id`/`order_items` only, deliberately
avoiding overlap with plan 018's own test).

## Commands you will need

| Purpose   | Command                                                      | Expected on success |
|-----------|--------------------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                                | exit 0, no errors    |
| Tests     | `npx jest src/context/CartContext.test.tsx src/pages/checkout.test.tsx` | all pass |
| Lint      | `npx eslint src/context/CartContext.test.tsx src/pages/checkout.test.tsx` | exit 0, no errors |

## Scope

**In scope** (the only files you should modify):
- `src/context/CartContext.test.tsx` (extend if it exists from plan 004;
  create otherwise)
- `src/pages/checkout.test.tsx` (extend if it exists from plan 008 and/or
  018; create otherwise)

**Out of scope** (do NOT touch, even though they look related):
- `src/context/CartContext.tsx`, `src/pages/checkout.tsx` — this plan adds
  tests only; no application code changes.
- `OrdersColumns`/`DownloadsColumns` and their date/price formatting or
  sort/filter functions — a real, separate gap, deliberately not covered
  here (see "Maintenance notes").
- `orders/index.tsx`, `downloads.tsx`, `profile.tsx` page-level tests —
  also deliberately not covered here.

## Git workflow

- Branch: `advisor/020-expand-critical-path-test-coverage`
- Commit message style: Conventional Commits (e.g. `test: add coverage for
  remaining CartContext functions and checkout PayPal order flow`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extend `CartContext.test.tsx` with the remaining untested functions

Add these test cases to the existing `describe('CartContext', ...)` block
(if `plans/004-fix-cart-discount-math.md` has run) — reuse its existing
`wrapper`, `makeProduct`, and `makeDiscount` helpers rather than
redefining them. If plan 004 hasn't run yet, create the file fresh using
the same helper shapes shown in that plan's Step 2.

```tsx
it('cartContainsItem returns false for an empty cart and true after adding', () => {
  const { result } = renderHook(() => useCart(), { wrapper });

  expect(result.current.cartContainsItem('1')).toBe(false);

  act(() => result.current.addToCart(makeProduct(1000)));

  expect(result.current.cartContainsItem('1')).toBe(true);
});

it('addToCart does not add a duplicate item already in the cart', () => {
  const { result } = renderHook(() => useCart(), { wrapper });

  act(() => result.current.addToCart(makeProduct(1000)));
  act(() => result.current.addToCart(makeProduct(1000)));

  expect(result.current.cartItems).toHaveLength(1);
  expect(result.current.cartCount).toBe(1);
});

it('removeFromCart removes only the specified item', () => {
  const { result } = renderHook(() => useCart(), { wrapper });

  const productA = { ...makeProduct(1000), id: 'a' };
  const productB = { ...makeProduct(2000), id: 'b' };

  act(() => result.current.addToCart(productA));
  act(() => result.current.addToCart(productB));
  act(() => result.current.removeFromCart('a'));

  expect(result.current.cartContainsItem('a')).toBe(false);
  expect(result.current.cartContainsItem('b')).toBe(true);
  expect(result.current.cartCount).toBe(1);
});

it('clearCart empties the cart entirely', () => {
  const { result } = renderHook(() => useCart(), { wrapper });

  act(() => result.current.addToCart(makeProduct(1000)));
  act(() => result.current.clearCart());

  expect(result.current.cartItems).toHaveLength(0);
  expect(result.current.cartCount).toBe(0);
});

it('cartContainsDiscount and removeDiscount only act on the currently-applied discount', () => {
  const { result } = renderHook(() => useCart(), { wrapper });

  act(() => result.current.applyDiscount(makeDiscount(500, false)));

  expect(result.current.cartContainsDiscount('d1')).toBe(true);
  expect(result.current.cartContainsDiscount('some-other-id')).toBe(false);

  act(() => result.current.removeDiscount('some-other-id'));
  expect(result.current.cartDiscount).not.toBeNull();

  act(() => result.current.removeDiscount('d1'));
  expect(result.current.cartDiscount).toBeNull();
});
```

Note: `makeDiscount`'s `id` field (from plan 004's helper) is hardcoded to
`'d1'` — confirm this matches when writing the assertions above; if plan
004's helper uses a different literal, use that value instead.

**Verify**: `npx jest src/context/CartContext.test.tsx` → all pass (plan
004's original 3 tests plus these 5 new ones = 8 total).

### Step 2: Set up a PayPal SDK mock for `checkout.test.tsx`

`@paypal/react-paypal-js`'s `PayPalButtons` component takes `createOrder`
and `onApprove` props that this app's `checkout.tsx` wires up to
`createPaypalOrder`/`capturePaypalOrder`. To test those functions without
a real PayPal SDK, mock the package to capture those callbacks so tests
can invoke them directly:

```tsx
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => children,
  PayPalButtons: ({
    createOrder,
    onApprove,
  }: {
    createOrder: () => Promise<string | null>;
    onApprove: (data: { orderID: string }) => Promise<void>;
  }) => {
    (globalThis as any).__paypalCreateOrder = createOrder;
    (globalThis as any).__paypalOnApprove = onApprove;
    return null;
  },
}));
```

If `plans/018-investigate-order-user-id.md` already added a similar mock
to this file, reconcile rather than duplicating — keep one copy of this
mock at the top of the file, extended to also capture `onApprove` if plan
018's version only captured `createOrder`.

### Step 3: Add tests for `createPaypalOrder`

```tsx
describe('Checkout page — PayPal order creation', () => {
  it('createPaypalOrder posts the cart contents and returns the order id on success', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { data: { id: 'ORDER123' } },
    });

    render(<Checkout />);

    const orderId = await (globalThis as any).__paypalCreateOrder();

    expect(orderId).toBe('ORDER123');
    expect(axios.post).toHaveBeenCalledWith(
      '/api/order/create',
      expect.objectContaining({ discount_id: null, order_items: [] }),
    );
  });

  it('createPaypalOrder returns null and shows an error toast on failure', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<Checkout />);

    const orderId = await (globalThis as any).__paypalCreateOrder();

    expect(orderId).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('An error occurred');
  });
});
```

Note: the mocked `useCart()` (established in `plans/008`'s version of
this test file) returns an empty `cartItems: []`, which is why
`order_items: []` is the expected assertion — if you're writing this
plan's tests against a version of the mock with non-empty `cartItems`,
adjust the expected `order_items` array to match.

**Verify**: `npm run check-types` then `npx jest src/pages/checkout.test.tsx` → these two new tests pass (full suite may have more tests from plans 008/018).

### Step 4: Add tests for `capturePaypalOrder`

```tsx
describe('Checkout page — PayPal order capture', () => {
  it('capturePaypalOrder shows a success toast on a 200 response', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: {} });

    render(<Checkout />);

    await (globalThis as any).__paypalOnApprove({ orderID: 'ORDER123' });

    expect(axios.post).toHaveBeenCalledWith('/api/order/capture', {
      transaction_id: 'ORDER123',
    });
    expect(toast.success).toHaveBeenCalledWith('Purchase successful');
  });

  it('capturePaypalOrder shows an error toast and does not throw when the capture request fails', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Capture failed'));

    render(<Checkout />);

    await expect(
      (globalThis as any).__paypalOnApprove({ orderID: 'ORDER123' }),
    ).resolves.not.toThrow();

    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong, please try again!',
    );
  });
});
```

**Verify**: `npx jest src/pages/checkout.test.tsx` → these two new tests pass.

### Step 5: Add a test for `createDemoOrder`

`createDemoOrder` isn't wired to a PayPal callback — it's called directly
from the "Order now" button that only renders when `cartTotal === 0`.
Since the mocked `useCart()` returns `cartTotal: 0` (per plan 008's mock),
that button should already be the one rendering in this test file's
default setup — confirm this by reading the mock before writing the
assertion below (if the mocked `cartTotal` isn't `0` in your version of
the file, adjust the mock so this button is reachable, since it's the
only way to exercise `createDemoOrder` through the real component).

```tsx
describe('Checkout page — demo order (£0 carts)', () => {
  it('shows the "Order now" button and creates a demo order on click', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: {} });

    render(<Checkout />);

    fireEvent.click(screen.getByRole('button', { name: /order now/i }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        '/api/order-demo/create',
        expect.objectContaining({ discount_id: null }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith('Purchase successful');
  });
});
```

**Verify**: `npx jest src/pages/checkout.test.tsx` → this test passes.

### Step 6: Lint

**Verify**: `npx eslint src/context/CartContext.test.tsx src/pages/checkout.test.tsx` → exit 0, no errors.

## Test plan

- `CartContext.test.tsx`: 5 new tests covering `cartContainsItem`,
  `addToCart`'s duplicate guard, `removeFromCart`, `clearCart`,
  `cartContainsDiscount`/`removeDiscount`.
- `checkout.test.tsx`: 5 new tests covering `createPaypalOrder` (success
  and failure), `capturePaypalOrder` (success and failure), and
  `createDemoOrder` (success).
- Verification: `npx jest src/context/CartContext.test.tsx src/pages/checkout.test.tsx` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/context/CartContext.test.tsx src/pages/checkout.test.tsx` exits 0, all tests pass (at least 8 in `CartContext.test.tsx`, at least 5 new ones in `checkout.test.tsx`)
- [ ] `npx eslint src/context/CartContext.test.tsx src/pages/checkout.test.tsx` exits 0
- [ ] No application source files modified (`git status` shows only
      `*.test.tsx` changes)
- [ ] `plans/README.md` status row for plan 020 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The live `CartContext.tsx`/`checkout.tsx` code doesn't match the
  "Current state" excerpts above.
- The existing mock setup in `checkout.test.tsx` (from plans 008/018, if
  they've run) uses a fundamentally different mocking approach than the
  `globalThis.__paypalCreateOrder`/`__paypalOnApprove` pattern this plan
  assumes, in a way that can't be reconciled cleanly — stop and report
  rather than maintaining two parallel, conflicting PayPal mocks in the
  same file.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- **Deliberately not covered by this plan** (real gaps, flagged for
  future work, not silently dropped):
  - `OrdersColumns`/`DownloadsColumns` (in `src/components/Tables/OrdersTable.tsx`/
    `DownloadsTable.tsx`): date formatting (`dayjs` calls), price
    formatting (`/ 100`), the custom `sortingFn`/`filterFn` for order
    status, and `DownloadsTable`'s `SerialKeyCell` reveal/hide toggle are
    all untested.
  - Page-level integration tests for `orders/index.tsx`, `downloads.tsx`,
    and `profile.tsx` (auth gating, SWR loading/error states rendered in
    the actual page, not just the extracted `DataTable` shell from plan
    010).
  - A future plan scoped specifically to "table column definitions and
    page-level table integration" would be the natural next step here.
