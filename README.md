# Little Chapters - Next.js Heirloom Baby Book

One week. One prompt. Ten photos. A book you'll hold forever.

**Features**
- Landing → Signup (required before Create Book) → Onboarding → App flow
- Email + Password + Passkey + Face ID / Fingerprint mock UI
- Persistence: localStorage per user `lc_weeks_{email}` + `lc_baby_{email}` — survives logout/login + refresh
- Photo capture: Take Photo (capture="environment" back camera) + Choose Library (multiple)
- Photos stored as Data URLs (for MVD), 10 max per week, 8MB guard
- 5 themes (Sage, Blush, Sky, Honey, Noir) + 3 fonts
- Heirloom Book preview + Waitlist $79

## One-click Vercel deploy

1. Push this folder to GitHub
2. Go to https://vercel.com/new → Import your repo
3. Vercel auto-detects Next.js → Deploy
4. Your URL will be https://little-chapters-xxx.vercel.app — open on phone, camera works (HTTPS)

Or drag-drop:

- Build locally: `npm install && npm run build`
- Then `npx vercel --prod`

## Local dev

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Next steps to make real

- Replace localStorage with Supabase Auth + Storage + Postgres (schema in code comment)
- Replace Data URL with upload to Supabase Storage
- Add WebAuthn real passkey via @simplewebauthn/browser
- Add Stripe checkout for $79 hardcover via Lulu / Printful API

## Publishing for real phone testing (camera needs HTTPS)

- Netlify Drop: https://app.netlify.com/drop → drag `out` folder or this repo
- Vercel is easiest for Next.js — HTTPS by default
- For local tunnel: `npx serve out` + `npx ngrok http 3000`

## File structure

- `app/page.tsx` — full app (client component)
- `app/globals.css` — Tailwind
- `app/layout.tsx` — metadata

No env vars needed for MVD.
