<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/AI-Bluesminds_Gateway-green" alt="Bluesminds AI">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
</p>

<h1 align="center">🦊 NutriFox</h1>

<p align="center">
  <strong>AI-powered nutrition analysis from food photos.</strong><br>
  Upload a photo, get instant calorie & macro breakdown tailored to your goals.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> · <a href="#features">Features</a> · <a href="#deploy-on-vercel-free">Deploy on Vercel (Free)</a> · <a href="#architecture">Architecture</a>
</p>

---

## Demo

Upload any food photo → AI identifies items, estimates portions, calculates macros → see results against your daily goals with allergen warnings.

> **No database required.** All user data stays in the browser (localStorage). Just add an API key and go.

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/mrputra/nutrifox.git
cd nutrifox
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
BLUESMINDS_API_KEY=sk-your-key-here
ANALYSIS_MODEL=gpt-4o-mini
```

Get your API key at [api.bluesminds.com/console/token](https://api.bluesminds.com/console/token).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

- **🧭 Onboarding** — set goal, calorie target, dietary restrictions, allergies
- **📸 Upload** — camera capture, photo upload, drag & drop
- **🧠 AI Analysis** — sends image to Bluesminds vision endpoint with fallback models
- **📊 Results** — detected foods, calories, macros, daily goal %, allergen warnings
- **📜 History** — locally stored scan log with timestamps
- **⚙️ Settings** — edit preferences anytime
- **📱 Mobile-first** — responsive design, PWA-ready manifest

---

## Deploy on Vercel (Free)

Vercel Hobby plan hosts this project **free forever** — no credit card needed.

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mrputra/nutrifox&env=BLUESMINDS_API_KEY,ANALYSIS_MODEL&envDescription=Bluesminds%20API%20Key%20and%20model%20selection)

### Manual deploy

1. **Push to GitHub** (this repo is already set up)

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Vercel auto-detects Next.js — no config needed

3. **Add environment variables** in Vercel dashboard:
   | Variable | Value |
   |----------|-------|
   | `BLUESMINDS_API_KEY` | Your Bluesminds API key |
   | `ANALYSIS_MODEL` | `gpt-4o-mini` (or `gpt-4o`) |

4. **Deploy** — Vercel builds and gives you a live URL in ~30 seconds.

### Why Vercel?

| Feature | Details |
|---------|---------|
| **Cost** | Free forever on Hobby plan |
| **HTTPS** | Automatic SSL |
| **CDN** | Global edge network |
| **CI/CD** | Auto-deploy on `git push` |
| **Preview** | Every PR gets a preview URL |
| **No config** | Zero-config Next.js support |

> **Note:** API keys are stored as Vercel environment variables — never exposed to the client.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, React 18, TypeScript |
| Styling | Tailwind CSS 3, custom CSS animations |
| Backend | Next.js API Routes (`/api/analyze`) |
| AI | Bluesminds API — OpenAI-compatible vision endpoint |
| Fallback | Auto-falls back to `qwen3.6-27b` if primary model fails |
| Storage | localStorage (client-side, no auth required) |
| Fonts | Playfair Display (display), DM Sans (body) via Google Fonts |

---

## API

All AI calls go through a server-side API route at `/api/analyze`.
The Bluesminds API key **never** reaches the client.

- Base URL: `https://api.bluesminds.com`
- Endpoint: `POST /v1/chat/completions`
- Auth: `Authorization: Bearer $BLUESMINDS_API_KEY`
- Model: configurable via env (default: `gpt-4o-mini`)

### Health check

```
GET /api/analyze → { status: "ok", primary: "gpt-4o-mini", primaryOk: true }
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BLUESMINDS_API_KEY` | ✅ | — | Your Bluesminds API token |
| `ANALYSIS_MODEL` | ❌ | `gpt-4o-mini` | Vision model for analysis |
| `BLUESMINDS_BASE_URL` | ❌ | `https://api.bluesminds.com` | API base URL |

---

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts   # Server-side AI analysis endpoint
│   ├── onboarding/page.tsx     # First-time setup
│   ├── settings/page.tsx      # Edit preferences
│   ├── history/page.tsx        # Scan history log
│   ├── layout.tsx              # Root layout + fonts
│   ├── page.tsx                # Home — upload + results
│   └── globals.css             # Tailwind + custom styles
├── components/
│   ├── NavBar.tsx              # Top navigation
│   ├── UploadZone.tsx          # Drag & drop + camera
│   ├── ResultsView.tsx         # Analysis results display
│   ├── CalorieRing.tsx         # SVG calorie progress ring
│   ├── MacroBar.tsx            # Macro breakdown bars
│   ├── PreferencesForm.tsx     # Goal/restriction settings
│   ├── AlertBadge.tsx          # Allergen/restriction warnings
│   └── Skeleton.tsx            # Loading placeholder
├── hooks/
│   └── usePreferences.ts       # localStorage preferences hook
└── lib/
    ├── types.ts                # TypeScript interfaces
    └── storage.ts              # localStorage helpers
```

---

## Tech Stack

- **Next.js 14** — App Router, API Routes, Image Optimization
- **React 18** — Client components with hooks
- **TypeScript** — Full type safety
- **Tailwind CSS 3** — Utility-first styling
- **Bluesminds API** — Unified LLM Gateway (OpenAI-compatible)
- **localStorage** — Zero-cost client-side persistence

---

## Notes

- Images sent as base64 to Bluesminds vision endpoint
- Max upload size: 10 MB
- No user accounts needed — all data in browser
- PWA-ready manifest included (`public/manifest.json`)

---

## License

MIT — use freely, attribution appreciated.

---

<p align="center">
  Built with 🦊 by <a href="https://github.com/mrputra">mrputra</a>
</p>
