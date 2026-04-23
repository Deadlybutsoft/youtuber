# 🎬 Youtuber

> Like ChatGPT, but instead of text answers, you get videos.

&nbsp;

**Youtuber** goes beyond text. Ask any question and instead of a plain text response, it generates a full video-style answer with cinematic presentation slides and AI voiceover — just like a YouTuber explaining it to you.

Built with **[Kiro](https://kiro.dev)**, powered by **[ElevenLabs](https://elevenlabs.io)** for lifelike AI narration, **Next.js 16** for the frontend, and an LLM backend for slide generation.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│   ┌──────────┐    query     ┌──────────────────────────┐    │
│   │ InputBar │ ──────────► │   fetch /api/generate     │    │
│   └──────────┘             └────────────┬─────────────┘    │
│                                         │ ReadableStream    │
│   ┌──────────────────────────────────┐  │                   │
│   │  parsePartialJsonArray           │ ◄┘                   │
│   │  (incremental JSON parsing)      │                       │
│   └──────────────┬───────────────────┘                      │
│                  │ Slide[]                                   │
│   ┌──────────────▼───────────────────┐                      │
│   │  SlideRenderer                   │                       │
│   │  (TitleOverlay / Chart /         │                       │
│   │   IconGrid / Quote / ...)        │                       │
│   └──────────────────────────────────┘                      │
│                                                              │
│   ┌──────────────────────────────────┐                      │
│   │  useSlidePlayback                │                       │
│   │  Web Speech API → auto-advance   │                       │
│   └──────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                          │ POST /api/generate
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Server                           │
│                                                              │
│   ┌──────────────────────────────────┐                      │
│   │  app/api/generate/route.ts       │                       │
│   │                                  │                       │
│   │  LLM_API_KEY (server-only)       │                       │
│   │       │                          │                       │
│   │       ▼                          │                       │
│   │  LLM (slide generation)          │                       │
│   │  generateContentStream()         │                       │
│   │       │                          │                       │
│   │       ▼                          │                       │
│   │  ReadableStream → client         │                       │
│   └──────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
youtuber/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + metadata
│   ├── page.tsx                  # Entry point (client)
│   ├── globals.css               # Tailwind + Google Fonts
│   └── api/
│       └── generate/
│           └── route.ts          # ← LLM + ElevenLabs API (server)
│
├── src/
│   ├── App.tsx                   # Root client component
│   ├── types/
│   │   └── slide.ts              # Slide interface
│   ├── utils/
│   │   └── parsePartialJson.ts   # Streaming JSON parser
│   ├── services/
│   │   └── ai.ts                 # Calls /api/generate, reads stream
│   ├── hooks/
│   │   ├── useProgress.ts        # Progress bar animation
│   │   └── useSlidePlayback.ts   # Voice + caption sync + auto-advance
│   └── components/
│       ├── SlideRenderer.tsx     # Picks the right layout component
│       ├── CaptionOverlay.tsx    # Animated captions
│       ├── PlayerControls.tsx    # Seekbar, play, voice, captions
│       ├── InputBar.tsx          # Query input + Short/Long/Explained
│       ├── WikiImage.tsx         # Wikimedia Commons image fetcher
│       └── slides/
│           ├── TitleOverlay.tsx  # Full-screen title + background image
│           ├── SplitImage.tsx    # Text + image side by side
│           ├── IconGrid.tsx      # Concept grid with Iconify icons
│           ├── StatsCallout.tsx  # Big number callouts
│           ├── Quote.tsx         # Pull quote with attribution
│           ├── Chart.tsx         # Bar / Line / Pie via Recharts
│           ├── SvgDiagram.tsx    # Raw SVG diagrams / flowcharts
│           └── ImageCollage.tsx  # Multi-image Wikipedia grid
│
├── .env.local                    # API keys (never exposed to browser)
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## Slide Layouts

| Layout | Description |
|---|---|
| `title-overlay` | Dramatic full-screen title with Wikipedia background image |
| `split-image` | Text bullets paired with a B-roll image |
| `icon-grid` | 2–4 concept cards with Iconify icons |
| `stats-callout` | 1–3 massive stat numbers |
| `quote` | Pull quote with attribution line |
| `chart` | Bar, Line, or Pie chart via Recharts |
| `svg-diagram` | Custom SVG flowchart or diagram |
| `image-collage` | 2–4 Wikipedia images in a grid |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Add your API keys
cp .env.example .env.local
# Then edit .env.local with your GEMINI_API_KEY and ELEVENLABS_API_KEY

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Get your API keys:
- **Gemini** → [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **ElevenLabs** → [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)

---

## Stack

| | |
|---|---|
| Built with | [Kiro](https://kiro.dev) |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| AI | LLM-powered slide generation |
| Voice | [ElevenLabs](https://elevenlabs.io) Text-to-Speech |
| Images | Wikimedia Commons API |
