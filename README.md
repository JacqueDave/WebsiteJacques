# Leverage in the Game Funnel

Three-page course sales funnel for serious basketball players:

- `index.html` (Landing / lead capture)
- `thank-you.html` (Thank-you / video)
- `checkout.html` (Sales + Stripe checkout)

## Local setup

1. Copy `.env.example` to `.env` and fill in values.
2. Generate the runtime config file:

```bash
node build-config.js
```

3. Start a local server:

```bash
python -m http.server 3050 --bind 0.0.0.0
```

Open:

- http://localhost:3050/index.html
- http://localhost:3050/thank-you.html
- http://localhost:3050/checkout.html

## Environment variables

Client-safe keys (exposed to the browser via `config.js`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_CHECKOUT_URL`

Server-only keys (never expose in client code):

- `RESEND_API_KEY`

Only the keys listed in `build-config.js` are exported to `config.js`. Update
that allowlist if you need additional client-safe variables.

## How config works

- `build-config.js` reads `.env` and writes `config.js`.
- `config.js` sets `window.RUNTIME_CONFIG` for the frontend.
- `script.js` reads `window.RUNTIME_CONFIG` to populate Stripe checkout links.

## Security note

Resend API keys must stay server-side. Use a secure backend (e.g., Supabase
Edge Functions) for sending transactional emails.

Never deploy `.env` to a public web root. Generate `config.js` during build or
deploy and keep `.env` out of the published folder.
