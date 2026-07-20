# Plan 018: Stop sending client-supplied `user_id` on order-creation requests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **This is a LOW-confidence finding wearing a fix plan.** The audit
> flagged this pattern but could not confirm whether the backend (a
> separate Laravel repo, not visible here) actually trusts the
> client-supplied `user_id` or safely ignores/re-derives it from the
> session. This plan's code change is safe *if* the backend already
> derives identity from the authenticated session (the overwhelmingly
> likely case, and the only safe way to build this kind of endpoint) — but
> it **requires coordination with whoever owns the backend**, and the
> "Commands you will need" section includes a manual verification step
> against a real backend that is not optional.

## Status

- **Priority**: P3
- **Effort**: S (the code change) — but do not treat this as "done" until
  the manual backend verification in Step 2 has actually happened.
- **Risk**: MED — if the backend genuinely requires `user_id` in the
  request body for some reason this plan's investigation couldn't see,
  removing it will break order creation (checkout) entirely. This is
  exactly why Step 2 exists and is not skippable.
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/pages/checkout.tsx`'s `createPaypalOrder` and `createDemoOrder`
functions both send `user_id: user?.id` — taken from the client-side SWR
`user` object — as part of the request body to `/api/order/create` and
`/api/order-demo/create`, alongside the authenticated Sanctum session
cookie (every `axios` request in this app carries `withCredentials: true`
per `src/lib/axios.ts`).

If the Laravel backend's order-creation endpoint derives the acting user
from `auth()->user()` (the session) rather than trusting the request
body's `user_id` field, this field is harmless but redundant — the
backend already knows who's asking. If, instead, the backend does
something like `Order::create($request->all())` or otherwise reads
`$request->user_id` to decide who the order belongs to, a modified request
(same session, different `user_id` in the body) could create an order
attributed to a different account — a mass-assignment/IDOR-shaped bug.
This can't be confirmed from this repository alone; the backend code isn't
here.

The safe, unilateral action available from this repo: **stop sending the
field at all.** The session cookie is already sufficient for the backend
to identify the user; there's no legitimate reason the client needs to
also assert its own identity in the request body. Removing it doesn't
change any correct backend behavior (a backend that already ignores/
re-derives `user_id` is unaffected) and closes the door on the incorrect
behavior (a backend that trusts it) — but only if a correctly-implemented
backend is actually what's running, which is exactly what Step 2 must
confirm before this is considered done.

## Current state

`src/pages/checkout.tsx`, `createPaypalOrder` (lines 67-83) and
`createDemoOrder` (lines 108-131):

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
```

```ts
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

## Commands you will need

| Purpose            | Command                                          | Expected on success |
|-----------------------|--------------------------------------------------------|---------------------|
| Typecheck              | `npm run check-types`                                    | exit 0, no errors    |
| Tests                  | `npx jest src/pages/checkout.test.tsx`                   | all pass             |
| Lint                   | `npx eslint src/pages/checkout.tsx`                      | exit 0, no errors    |
| **Manual backend verification (required, see Step 2)** | Full checkout flow against a real/staging backend, both the PayPal path and the £0 demo-order path | both create an order successfully and attribute it to the logged-in user |

## Scope

**In scope** (the only files you should modify):
- `src/pages/checkout.tsx`
- `src/pages/checkout.test.tsx` (extend if `plans/008-fix-checkout-response-guard.md`
  already created it; create fresh otherwise)

**Out of scope** (do NOT touch, even though they look related):
- Any backend/Laravel code — not in this repository. This plan's scope is
  strictly the client-side request payload.
- `discount_id` and `order_items` in the same request bodies — those are
  legitimate request data (which discount to apply, which items to buy),
  not an identity assertion; leave them exactly as they are.

## Git workflow

- Branch: `advisor/018-investigate-order-user-id`
- Commit message style: Conventional Commits (e.g. `fix: stop sending
  client-supplied user_id on order-creation requests`)
- Do NOT push or open a PR unless the operator instructed it. **Do not
  merge or deploy this change without Step 2's manual backend
  verification having actually happened** — flag this explicitly in
  whatever review/handoff process the operator uses.

## Steps

### Step 1: Remove `user_id` from both request payloads

In `createPaypalOrder`, change:

```ts
const response = await axios.post('/api/order/create', {
  user_id: user?.id,
  discount_id: discountId ?? null,
  order_items: itemIds,
});
```

to:

```ts
const response = await axios.post('/api/order/create', {
  discount_id: discountId ?? null,
  order_items: itemIds,
});
```

In `createDemoOrder`, change:

```ts
const response = await axios.post('/api/order-demo/create', {
  user_id: user?.id,
  discount_id: discountId ?? null,
  order_items: itemIds,
});
```

to:

```ts
const response = await axios.post('/api/order-demo/create', {
  discount_id: discountId ?? null,
  order_items: itemIds,
});
```

**Verify**: `npm run check-types` → exit 0, no new errors (the `user`
variable itself is still used elsewhere in this file — e.g. the `if
(!user) return null;` guard near the top — so removing these two usages
should not produce an unused-variable error; if it does, that means
`user` truly has no other use in the file, which would be surprising and
worth stopping to double check rather than silently accepting).

### Step 2: Manually verify against a real backend — REQUIRED, not optional

This is the step that determines whether this plan's change is actually
safe to ship. With a real (or staging) instance of the Laravel backend
running and reachable at whatever `NEXT_PUBLIC_BACKEND_URL` your
environment is configured with:

1. Log in as a test user.
2. Add an item to the cart and go through `/checkout/` with the PayPal
   flow (a sandbox PayPal account is fine) — confirm the order is created
   successfully and shows up under that user's `/orders/` page.
3. If a £0 / demo-order path is reachable in your test environment (a
   free product or a discount code that zeroes out the cart), confirm the
   demo-order path also succeeds and attributes the order to the correct
   user.

If either path fails specifically because the backend now rejects the
request or can't determine the acting user, **that confirms the backend
does rely on the client-supplied `user_id`** — revert this plan's change
(re-add `user_id: user?.id` to both payloads) and escalate to whoever owns
the backend instead: the fix in that case needs to happen server-side
(derive the user from the session, stop trusting the request body), and
this repository's frontend should keep sending `user_id` only until that
backend fix ships, to avoid a period where checkout is broken.

If you have no way to reach a real/staging backend from your environment,
**do not mark this plan done** — stop and report that Step 2 could not be
completed, rather than shipping an unverified change to a payment flow.

### Step 3: Lint

**Verify**: `npx eslint src/pages/checkout.tsx` → exit 0, no new errors.

### Step 4: Update/add a test confirming the payload shape

If `plans/008-fix-checkout-response-guard.md` already created
`src/pages/checkout.test.tsx`, add this test to it. Otherwise create the
file using the mock setup from that plan (`jest.mock('@/lib/axios', ...)`,
`jest.mock('@/hooks/useAuth', ...)`, `jest.mock('@/context/CartContext',
...)`).

```tsx
it('does not include user_id in the order-creation request body', async () => {
  (axios.post as jest.Mock).mockResolvedValue({ data: { data: { id: 'order-1' } } });

  // Exercise createPaypalOrder via whatever the test's cart/PayPal mock
  // setup allows triggering it — the exact trigger depends on how
  // plans/008's test file drives the PayPal button mock, if present.
  // At minimum, assert on the call shape once triggered:

  await waitFor(() => expect(axios.post).toHaveBeenCalled());

  const [, body] = (axios.post as jest.Mock).mock.calls[0];
  expect(body).not.toHaveProperty('user_id');
});
```

Adapt the trigger mechanism to whatever `@paypal/react-paypal-js` mocking
approach `plans/008` established (mocking `PayPalButtons`'s `createOrder`
callback directly is the most reliable way to invoke `createPaypalOrder`
in a test without a real PayPal SDK) — if plan 008 hasn't been executed
yet and no such mock exists, mock `@paypal/react-paypal-js` minimally:

```tsx
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => children,
  PayPalButtons: ({ createOrder }: { createOrder: () => Promise<string | null> }) => {
    // Expose a way to trigger createOrder from the test
    (globalThis as any).__triggerCreateOrder = createOrder;
    return null;
  },
}));
```

then in the test, call `await (globalThis as any).__triggerCreateOrder();`
before asserting on `axios.post`'s call shape.

**Verify**: `npx jest src/pages/checkout.test.tsx` → all pass.

## Test plan

- One new/extended test asserting the order-creation request body does
  not include a `user_id` field.
- **The real verification for this plan is Step 2's manual backend check,
  not the automated test** — the automated test only proves the frontend
  stopped sending the field, not that the backend still works correctly
  without it.

## Done criteria

Machine-checkable + manual, ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx eslint src/pages/checkout.tsx` exits 0
- [ ] `grep -n "user_id: user" src/pages/checkout.tsx` returns no matches
- [ ] `npx jest src/pages/checkout.test.tsx` exits 0, includes a passing
      test confirming `user_id` is absent from the request body
- [ ] **Step 2's manual backend verification was actually performed**,
      and both the PayPal and (if reachable) demo-order paths succeeded —
      this must be explicitly confirmed in your completion report, not
      assumed
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 018 updated — if Step 2
      couldn't be completed, set status to `BLOCKED` with the reason,
      not `DONE`

## STOP conditions

Stop and report back (do not improvise) if:

- You have no access to a real or staging backend to perform Step 2 —
  report this as a blocker, don't skip verification and mark the plan
  done anyway.
- Step 2 reveals the backend does depend on the client-supplied `user_id`
  — revert the code change (Step 1) and escalate to the backend owner
  instead of proceeding.
- The code at the cited lines doesn't match the "Current state" excerpts
  above.

## Maintenance notes

- If Step 2 confirms the backend is safe and this plan ships, this
  closes out the finding entirely — no further action needed on the
  frontend.
- If Step 2 reveals the backend issue, track the backend-side fix
  separately (outside this repo) and revisit re-removing `user_id` here
  once that lands.
