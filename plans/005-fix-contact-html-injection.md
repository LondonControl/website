# Plan 005: Escape and validate contact-form input before it reaches the email

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/pages/api/contact.ts`
> If this file changed since this plan was written, compare the "Current
> state" excerpt below against the live file before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/pages/api/contact.ts` is the **only** server-side Node API route in
this repository (everything else the frontend does goes through a separate
Laravel backend). It builds an HTML email from the raw request body:

```ts
const htmlData = Object.entries(data).reduce((str, [key, val]) => {
  let temp = str;
  temp += `<h3 class="form-heading" align="left">${CONTACT_MESSAGE_FIELDS[key]}</h3><p class="form-answer" align="left">${val}</p>`;
  return temp;
}, '');
```

Every field value (`val`) — including `firstName`, `secondName`, `email`,
`addons`, `subject`, and `message`, all directly from `req.body` — is
interpolated into the HTML email body with **no escaping**. `data.subject`
is also passed straight into `sendMail`'s `subject` field with no
sanitization of newlines. The only validation in the handler
(`handler`, lines 32-44) is a truthy-presence check — it doesn't verify
field types, lengths, or content.

The client-side form (`src/pages/contact.tsx`) does validate with a `zod`
schema before submitting, but that's a UX convenience only — nothing stops
a direct `POST /api/contact` request (this is a public, unauthenticated
route) from sending arbitrary HTML/script markup in any field, or an
oversized payload. Since the resulting HTML is emailed to whoever owns the
`MAIL_USERNAME` inbox and rendered in their mail client, this is a
real content-injection vector — a submission could embed a fake "This
message is from PayPal" banner, a disguised link, or other rendered HTML the
recipient wouldn't expect.

## Current state

`src/pages/api/contact.ts`, full current file:

```ts
1	import type ContactMessage from '@/interfaces/ContactMessage';
2	import { mailOptions, transporter } from '@/lib/nodemailer';
3
4	const CONTACT_MESSAGE_FIELDS: ContactMessage = {
5	  firstName: 'First Name',
6	  secondName: 'Second Name',
7	  email: 'Email',
8	  addons: 'Addons',
9	  subject: 'Subject',
10	  message: 'Message',
11	};
12
13	const generateEmailContent = (data: any) => {
14	  const stringData = Object.entries(data)
15	    .map(([key, val]) => `${CONTACT_MESSAGE_FIELDS[key]}: \n${val} \n \n`)
16	    .join('');
17
18	  const htmlData = Object.entries(data).reduce((str, [key, val]) => {
19	    let temp = str;
20	    temp += `<h3 class="form-heading" align="left">${CONTACT_MESSAGE_FIELDS[key]}</h3><p class="form-answer" align="left">${val}</p>`;
21
22	    return temp;
23	  }, '');
24
25	  return {
26	    text: stringData,
27	    html: `<!DOCTYPE html>...` /* full HTML email shell, unchanged by this plan — see live file for the complete string */,
28	  };
29	};
30
31	const handler = async (req: any, res: any) => {
32	  if (req.method === 'POST') {
33	    const data = req.body;
34	    if (
35	      !data ||
36	      !data.firstName ||
37	      !data.secondName ||
38	      !data.email ||
39	      !data.addons ||
40	      !data.subject ||
41	      !data.message
42	    ) {
43	      return res.status(400).send({ message: 'Bad request' });
44	    }
45
46	    try {
47	      await transporter.sendMail({
48	        ...mailOptions,
49	        ...generateEmailContent(data),
50	        subject: data.subject,
51	      });
52
53	      return res.status(200).json({ success: true });
54	    } catch (err: any) {
55	      return res.status(400).json({ message: err.message });
56	    }
57	  }
58
59	  return res.status(400).json({ message: 'Bad request' });
60	};
61
62	export default handler;
```

The `html:` template literal in `generateEmailContent` (line 27 above) is a
long, single-line HTML email shell — it is unchanged by this plan except
for how `${htmlData}` (already embedded inside it) is built. Do not
reformat or rewrite the surrounding HTML shell; only change how field
values are escaped before being placed into `htmlData`.

The matching **client-side** validation schema, `src/pages/contact.tsx`
lines 43-52, defines the shape this plan's server-side schema should
mirror (defense in depth — never rely on the client check alone since this
is a public, unauthenticated route):

```ts
const formSchema = z.object({
  firstName: z.string().min(2).max(50),
  secondName: z.string().min(2).max(50),
  email: z.string().email(),
  addons: z.string().refine((value) => ['no', 'yes'].includes(value), {
    message: "Please select either 'No' or 'Yes'",
  }),
  subject: z.string().min(2).max(250),
  message: z.string().min(2),
});
```

`zod` is already a direct dependency (`package.json`) and used exactly
this way elsewhere in the repo — use it here too rather than hand-rolling
validation, for consistency with the rest of the codebase.

## Commands you will need

| Purpose   | Command                                              | Expected on success |
|-----------|--------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                   | exit 0, no errors   |
| Tests     | `npx jest src/pages/api/contact.test.ts`                | all pass            |
| Lint      | `npx eslint src/pages/api/contact.ts src/pages/api/contact.test.ts` | exit 0, no errors |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, 15%
coverage gate) — use the targeted commands above.

## Scope

**In scope** (the only files you should modify):
- `src/pages/api/contact.ts`
- `src/pages/api/contact.test.ts` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/pages/contact.tsx` — the client-side form and its existing zod
  schema are correct as-is; do not change them.
- `src/lib/nodemailer.ts` — the transporter/credential configuration is
  not part of this finding.
- The HTML email shell's markup/styling inside the template literal — only
  change how field *values* are escaped, not the surrounding HTML.

## Git workflow

- Branch: `advisor/005-fix-contact-html-injection`
- Commit message style: Conventional Commits (e.g. `fix: escape and
  validate contact form input before building the notification email`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add an HTML-escaping helper and apply it to every interpolated value

Add near the top of `src/pages/api/contact.ts` (after the imports):

```ts
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
```

Update `generateEmailContent`'s `htmlData` reduction to escape `val`
before interpolating it (the plain-text `stringData` branch does not need
escaping — it's not rendered as HTML — leave it as-is):

```ts
const htmlData = Object.entries(data).reduce((str, [key, val]) => {
  let temp = str;
  temp += `<h3 class="form-heading" align="left">${CONTACT_MESSAGE_FIELDS[key]}</h3><p class="form-answer" align="left">${escapeHtml(String(val))}</p>`;

  return temp;
}, '');
```

**Verify**: `npm run check-types` → exit 0, no new errors.

### Step 2: Validate the request body with a zod schema before use

Replace the manual truthy-checks in `handler` with a zod schema mirroring
`src/pages/contact.tsx`'s client-side schema (see "Current state" above).
Add near the top of the file, after the `escapeHtml` helper:

```ts
import { z } from 'zod';

const contactSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  secondName: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  addons: z.enum(['no', 'yes']),
  subject: z
    .string()
    .trim()
    .min(2)
    .max(250)
    .transform((value) => value.replace(/[\r\n]+/g, ' ')),
  message: z.string().trim().min(2).max(5000),
});
```

The `subject` field's `.transform` strips CR/LF before the value is ever
used, closing off any header-injection surface regardless of what
`nodemailer`'s own escaping does internally — treat this as defense in
depth, not a statement that `nodemailer` is currently vulnerable.

Replace the handler's validation block:

```ts
const data = req.body;
if (
  !data ||
  !data.firstName ||
  !data.secondName ||
  !data.email ||
  !data.addons ||
  !data.subject ||
  !data.message
) {
  return res.status(400).send({ message: 'Bad request' });
}
```

with:

```ts
const parseResult = contactSchema.safeParse(req.body);

if (!parseResult.success) {
  return res.status(400).json({ message: 'Bad request' });
}

const data = parseResult.data;
```

Update the `sendMail` call to use the validated `data.subject` (it already
does — `subject: data.subject` — but `data` now refers to the parsed,
sanitized object rather than the raw `req.body`, so no further change is
needed there beyond what Step 1/Step 2 already produce).

**Verify**: `npm run check-types` → exit 0, no new errors (note:
`generateEmailContent`'s `data: any` parameter can stay `any` since it's
also used for the plain-text branch which iterates arbitrary keys — do not
over-tighten its type as part of this plan).

### Step 3: Lint

**Verify**: `npx eslint src/pages/api/contact.ts` → exit 0, no new errors.

### Step 4: Add regression tests

Create `src/pages/api/contact.test.ts`. Mock `@/lib/nodemailer`'s
`transporter.sendMail` and call the handler directly with mock
`req`/`res` objects (the repo has no existing API-route test to model —
this plan establishes the pattern).

```ts
import handler from './contact';
import { transporter } from '@/lib/nodemailer';

jest.mock('@/lib/nodemailer', () => ({
  transporter: { sendMail: jest.fn().mockResolvedValue(undefined) },
  mailOptions: { from: 'test@example.com', to: 'test@example.com' },
}));

const buildRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const validBody = {
  firstName: 'Jane',
  secondName: 'Doe',
  email: 'jane@example.com',
  addons: 'no',
  subject: 'Hello',
  message: 'This is a test message.',
};

describe('POST /api/contact', () => {
  beforeEach(() => jest.clearAllMocks());

  it('escapes HTML in submitted fields before emailing', async () => {
    const req: any = {
      method: 'POST',
      body: { ...validBody, message: '<img src=x onerror=alert(1)>' },
    };
    const res = buildRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const sentMail = (transporter.sendMail as jest.Mock).mock.calls[0][0];
    expect(sentMail.html).not.toContain('<img src=x onerror=alert(1)>');
    expect(sentMail.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('strips newlines from the subject before sending', async () => {
    const req: any = {
      method: 'POST',
      body: { ...validBody, subject: 'Hello\r\nBcc: attacker@example.com' },
    };
    const res = buildRes();

    await handler(req, res);

    const sentMail = (transporter.sendMail as jest.Mock).mock.calls[0][0];
    expect(sentMail.subject).not.toMatch(/[\r\n]/);
  });

  it('rejects a request with an invalid addons value', async () => {
    const req: any = { method: 'POST', body: { ...validBody, addons: 'maybe' } };
    const res = buildRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it('rejects a request missing required fields', async () => {
    const req: any = { method: 'POST', body: { firstName: 'Jane' } };
    const res = buildRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it('accepts a valid submission', async () => {
    const req: any = { method: 'POST', body: validBody };
    const res = buildRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
  });
});
```

**Verify**: `npx jest src/pages/api/contact.test.ts` → all pass (5 tests).

## Test plan

- New file: `src/pages/api/contact.test.ts`, covering: HTML in a field is
  escaped before being emailed; CR/LF in the subject is stripped; an
  invalid `addons` value is rejected with 400; missing required fields are
  rejected with 400; a fully valid submission succeeds and calls
  `sendMail` exactly once.
- No existing API-route test to model in this repo — this plan establishes
  the "mock the transporter, call the handler with fake req/res" pattern
  for any future API route tests.
- Verification: `npx jest src/pages/api/contact.test.ts` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/pages/api/contact.test.ts` exits 0, 5 tests pass
- [ ] `npx eslint src/pages/api/contact.ts` exits 0
- [ ] `grep -n "escapeHtml" src/pages/api/contact.ts` shows the helper defined and used inside `generateEmailContent`
- [ ] `grep -n "contactSchema.safeParse" src/pages/api/contact.ts` shows validation wired into `handler`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for plan 005 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code doesn't match the "Current state" excerpt above (note: the full
  HTML shell string is abbreviated in this plan's excerpt — that's
  expected, not drift; only treat a mismatch in the parts shown in full as
  drift).
- `data` (the object passed to `generateEmailContent`) needs to support
  keys beyond `firstName`/`secondName`/`email`/`addons`/`subject`/`message`
  in the live code — the schema above is exhaustive for what's in
  `CONTACT_MESSAGE_FIELDS` today; if the live file has more fields, stop
  and report rather than silently dropping or guessing validation rules
  for them.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If a new field is ever added to the contact form, both
  `src/pages/contact.tsx`'s client schema and this route's `contactSchema`
  need to be updated together — there's no shared schema file today. A
  future refactor could extract a single shared zod schema imported by
  both, but that's out of scope here.
- `mailOptions`/`transporter` credentials in `src/lib/nodemailer.ts` are
  unrelated to this fix and were not flagged as a finding — no action
  needed there.
