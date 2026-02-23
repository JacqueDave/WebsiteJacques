# Leverage in the Game Funnel

Two-page course sales funnel for serious basketball players:

- `index.html` (Landing / lead capture)
- `thank-you.html` (Thank-you / video + payment CTA)

## Local setup

1. Copy `.env.example` to `.env` and fill in values.
2. Generate runtime config:

```bash
npm run build
```

3. Start a local server:

```bash
./run.sh
```

Open:

- http://localhost:3050/index.html
- http://localhost:3050/thank-you.html

## Environment variables

Client-safe keys (exposed to the browser via `js/config.js`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_CHECKOUT_URL`

Server-only keys (never expose in client code):

- `RESEND_API_KEY`

Only the keys listed in `build-config.js` are exported to `js/config.js`. Update
that allowlist if you need additional client-safe variables.

## How config works

- `build-config.js` reads `.env` and writes `js/config.js`.
- `js/config.js` sets `window.RUNTIME_CONFIG` for the frontend.
- `js/script.js` reads `window.RUNTIME_CONFIG` for Supabase and Stripe values.

## Security note

Resend API keys must stay server-side. Use a secure backend (e.g., Supabase
Edge Functions) for sending transactional emails.

Never deploy `.env` to a public web root. Generate `js/config.js` during build or
deploy and keep `.env` out of the published folder.

## Vercel deploy checklist

1. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `STRIPE_CHECKOUT_URL` in Vercel project environment variables.
2. Ensure build command is `npm run build`.
3. Deploy.
4. Submit a lead form and confirm redirect to `thank-you.html`.
5. Confirm a new row is inserted into `public.leads`.
6. Confirm `js/config.js` is available in deployed output.

## Supabase setup checklist

1. Run `setup_leads_table.sql` in the target Supabase project.
2. Confirm `public.leads` exists, RLS is enabled, and insert policy `leads_insert_anon_authenticated` is present.
