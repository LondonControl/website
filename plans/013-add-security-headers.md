# Plan 013: Add CSP and response-hardening headers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- next.config.js`
> If this file changed since this plan was written, compare the "Current
> state" excerpt below against the live file before proceeding; on a
> mismatch, treat it as a STOP condition.
>
> **This plan carries real risk of silently breaking the PayPal checkout
> embed if the CSP is too strict.** The steps below build in a
> report-only verification pass before enforcing anything, specifically to
> catch that before it ships. Do not skip Step 2.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — an overly strict CSP can silently break the PayPal
  button/checkout iframe, which is revenue-critical; the report-only step
  and manual checkout test in this plan exist specifically to catch that
  before enforcement.
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`next.config.js` sets `poweredByHeader: false` but defines no `headers()`
function at all — there is no `Content-Security-Policy`,
`X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, or
`X-Content-Type-Options` anywhere in this app's response headers. Pages
handling login, password reset, account management, and PayPal checkout
have no defense-in-depth against clickjacking (embedding this site in a
malicious iframe) or script-injection exfiltration if an XSS is ever
introduced elsewhere in the app (e.g. a future regression of the class
`plans/005-fix-contact-html-injection.md` just fixed). This app also
embeds PayPal's JS SDK and checkout iframe (`@paypal/react-paypal-js`,
used in `src/pages/checkout.tsx`) with zero CSP constraining what it — or
anything else — is allowed to load or connect to.

## Current state

`next.config.js`, full current file:

```js
/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  eslint: {
    dirs: ['.'],
  },
  images: {
    domains: ['placehold.co'],
  },
  poweredByHeader: false,
  trailingSlash: true,
  basePath: '',
  reactStrictMode: true,
  webpack: (config) => {
    // eslint-disable-next-line no-param-reassign
    config.resolve.alias.canvas = false;

    return config;
  },
});
```

Third-party origins this app actually loads content from or connects to,
gathered by reading the code (not guessed) — every CSP directive below
must accommodate all of these or checkout/pages will break:

- **PayPal SDK/checkout** (`src/pages/checkout.tsx`, via
  `@paypal/react-paypal-js`'s `PayPalScriptProvider`/`PayPalButtons`):
  loads a script from `https://www.paypal.com`, and the buttons/checkout
  flow render content in iframes from PayPal's domains
  (`https://www.paypal.com`, and `https://www.sandbox.paypal.com` if this
  app is ever pointed at PayPal's sandbox — check
  `NEXT_PUBLIC_PAYPAL_CLIENT_ID`'s configured environment before assuming
  production-only).
- **Backend API** (`src/lib/axios.ts`): `NEXT_PUBLIC_BACKEND_URL`, an
  environment-configured origin (e.g. `http://localhost:8000` in dev per
  `.env.local.example`; a real API host in production) — the CSP's
  `connect-src` must allow this origin, but since it's configured via
  environment variable rather than a fixed literal, the header value
  itself needs to be built dynamically (or scoped broadly enough to cover
  whatever `NEXT_PUBLIC_BACKEND_URL` is set to in each environment — see
  Step 1).
- **Fonts**: self-hosted (`public/assets/fonts/`, loaded via
  `src/lib/fonts.ts` and `public/assets/fonts/*/stylesheet.css`) — no
  external font origin needed.
- **`placehold.co`**: used as a fallback image source (`src/pages/checkout.tsx`
  and elsewhere render `https://placehold.co/200x200?text=LC` when a
  product has no image) — needs to be in `img-src`.
- No analytics/tracking scripts beyond `@vercel/speed-insights`, which
  Vercel injects at its edge (not a `<script src>` this app renders
  itself) — if `@vercel/speed-insights`'s `<SpeedInsights />` component is
  mounted anywhere (check `src/pages/_app.tsx`), it may need
  `https://va.vercel-scripts.com` or similar in `script-src`; confirm by
  reading `_app.tsx` before finalizing the policy in Step 1.

## Commands you will need

| Purpose            | Command                                    | Expected on success |
|-----------------------|------------------------------------------------|---------------------|
| Typecheck              | `npm run check-types`                           | exit 0, no errors    |
| Dev server smoke test  | `npm run dev`, then manually load pages per Step 3 | headers present, no console CSP violations, checkout works |

This plan has no automated test for HTTP response headers (there's no
existing pattern for testing `next.config.js` headers in this repo, and
building one is disproportionate to this plan's scope) — verification is
manual, via browser DevTools' Network tab and Console, against a running
dev server. Be thorough; this is the step most likely to hide a real
regression if rushed.

## Scope

**In scope** (the only files you should modify):
- `next.config.js`

**Out of scope** (do NOT touch, even though they look related):
- `src/pages/_app.tsx` — read-only, to confirm what scripts/components are
  mounted (Step 1); do not modify it as part of this plan.
- `src/pages/checkout.tsx` and the PayPal integration itself — if the CSP
  breaks PayPal, the fix is adjusting the CSP (this file), not changing
  how the app integrates with PayPal.
- Any inline `<script>` or `style` attribute usage — if the CSP's
  `script-src`/`style-src` ends up needing `'unsafe-inline'` because of
  something found during Step 3's testing, that's an acceptable, common
  real-world compromise for a Next.js Pages Router app using styled-jsx
  (Next.js's built-in CSS-in-JS, used internally for scroll-restoration
  and a few framework behaviors) — don't attempt to remove
  `'unsafe-inline'` by hunting down and rewriting inline styles across the
  app; that's a much larger, separate effort.

## Git workflow

- Branch: `advisor/013-add-security-headers`
- Commit message style: Conventional Commits (e.g. `fix: add CSP and
  response-hardening headers`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the third-party origin list, then add a report-only CSP

First, read `src/pages/_app.tsx` in full to confirm exactly what's
mounted (in particular, check for `<SpeedInsights />` from
`@vercel/speed-insights/next` or similar, and any other third-party
script/component). Update the origin list below if you find anything this
plan's research missed — but if you find something that changes the
picture substantially (e.g. an analytics or chat-widget script this plan
didn't anticipate at all), treat it as a STOP condition rather than
guessing at its CSP requirements.

Add a `headers()` async function to the `next.config.js` module.exports
object, initially using `Content-Security-Policy-Report-Only` (not
`Content-Security-Policy`) so nothing is actually blocked yet — this
step's entire purpose is to observe real violations in Step 2 before
committing to enforcement in Step 4:

```js
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.paypalobjects.com https://placehold.co",
  "font-src 'self'",
  `connect-src 'self' ${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''} https://www.paypal.com https://api.paypal.com`,
  "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

async function headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy-Report-Only', value: cspDirectives },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    },
  ];
}
```

Add `headers,` to the exported config object (as a property alongside
`eslint`, `images`, etc.).

`script-src`/`style-src` include `'unsafe-inline'` from the start — Next.js
Pages Router relies on inline styles for some built-in behaviors
(styled-jsx), and removing it is out of scope per this plan's "Out of
scope" section. This is a standard, documented tradeoff for Pages
Router apps, not a mistake.

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Observe report-only violations against a running dev server

Start the dev server (`npm run dev`). Open a browser to `/`, then
navigate through: `/login/`, `/register/`, `/products/`, and `/checkout/`
(with at least one item in the cart, so the PayPal buttons actually
render). With DevTools' Console open, look for any `Content-Security-Policy-Report-Only`
violation messages (they print to console without blocking anything,
since this is report-only mode).

- If there are **no violations**: proceed to Step 3.
- If there **are violations**: read each one — it names the exact
  directive and blocked-URI. Adjust the `cspDirectives` array in
  `next.config.js` to accommodate legitimate origins (e.g. if PayPal loads
  a script from a subdomain this plan's research didn't anticipate, add
  it to `script-src`). Do not add a wildcard (`*`) to work around a
  violation you don't understand — identify the specific origin and add
  only that.
- If a violation comes from something that looks unexpected/unrelated to
  this app's known third-party origins (e.g. a browser extension
  injecting a script — common in real DevTools sessions and not a real
  finding), disregard it; use judgment, but note anything ambiguous in
  your completion report rather than silently guessing.

Stop the dev server when done.

### Step 3: Manually verify the PayPal checkout flow end-to-end

Still against the dev server (or restart it if you stopped it in Step 2),
with at least one product in the cart, walk through `/checkout/`:

- The PayPal buttons render visibly (not a blank space where they should
  be).
- Clicking a PayPal button opens PayPal's popup/iframe checkout flow
  (you don't need to complete a real payment — confirming the button
  click successfully opens PayPal's UI is sufficient).
- No new console errors appear compared to testing this same flow before
  your `next.config.js` changes (a quick `git stash` and reload, then
  `git stash pop`, is a reasonable way to compare if you want a clean
  before/after).

This is the step most likely to catch a CSP misconfiguration that Step
2's Console-only check might miss (e.g. a blocked iframe that fails
silently rather than logging a clear CSP violation in every browser).

### Step 4: Switch from report-only to enforcing

Once Steps 2-3 show no problems, change the header key in the `headers`
array from `Content-Security-Policy-Report-Only` to
`Content-Security-Policy`:

```js
{ key: 'Content-Security-Policy', value: cspDirectives },
```

**Verify**: `npm run check-types` → exit 0, no new errors. Re-run Step 3's
manual checkout walkthrough one more time with the now-enforcing header —
this is the real test; report-only mode never actually blocks anything,
so this is the first time you're confirming the policy works under
enforcement, not just observing what it *would* block.

### Step 5: Verify headers are actually present on responses

With the dev server running, open DevTools' Network tab, reload `/`, and
inspect the response headers for the document request. Confirm
`content-security-policy`, `x-content-type-options`, `referrer-policy`,
and `x-frame-options` are all present with the values set in Step 1/4.

## Test plan

No automated tests — see "Commands you will need" for why. The
verification is entirely the manual Steps 2, 3, and 5 above, which must
all be completed and their outcomes reported honestly (including any CSP
adjustments made along the way) as part of this plan's completion report.

## Done criteria

Machine-checkable + manual, ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `grep -n "Content-Security-Policy'" next.config.js` shows the
      enforcing header (not `-Report-Only`) after Step 4
- [ ] Step 2's report-only pass showed zero unresolved violations (or all
      violations were investigated and either fixed in the policy or
      explained as unrelated/browser-extension noise)
- [ ] Step 3's manual PayPal checkout walkthrough succeeded under the
      enforcing header (Step 4's re-test)
- [ ] Step 5 confirmed all four headers are present on an actual response
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 013 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `src/pages/_app.tsx` mounts a third-party script/component this plan's
  origin research didn't account for and you're not confident you know
  its CSP requirements.
- The PayPal checkout flow breaks under the enforcing CSP (Step 4) and
  you can't identify why from the browser console within a reasonable
  effort — revert to `Content-Security-Policy-Report-Only` (not delete
  the header entirely) and report back with what you observed, rather
  than shipping a broken checkout or an empty policy.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If `NEXT_PUBLIC_BACKEND_URL` ever changes shape (e.g. multiple API
  origins, or a CDN-fronted API domain different from the app origin),
  `connect-src` needs to be revisited — it's currently built from that one
  env var directly.
- If PayPal changes their integration and starts loading from additional
  origins in the future, expect a Content-Security-Policy violation in
  production logs/browser reports (if the report-only-first pattern in
  this plan is repeated for future CSP changes) rather than a silent
  breakage — that's the intended benefit of having a CSP at all.
- If this app ever adds first-party analytics, chat widgets, or other
  third-party embeds, `script-src`/`connect-src`/`frame-src` will need
  updating — treat any of those as requiring the same report-only-first
  verification process this plan established.
