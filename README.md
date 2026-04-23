# 🎬 Youtuber

> Like ChatGPT, but instead of text answers — you get videos.

**Youtuber** goes beyond text. Ask any question and instead of a plain text response, it generates a full video-style answer with presentation slides and AI voiceover — just like a YouTuber explaining it to you.

Built with **Next.js 16**, **Gemini 2.5 Flash**, **ElevenLabs Text-to-Speech API**, and **Kiro**.

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
│   │  GEMINI_API_KEY (server-only)    │                       │
│   │       │                          │                       │
│   │       ▼                          │                       │
│   │  Gemini 2.5 Flash                │                       │
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
│           └── route.ts          # ← Gemini API lives here (server)
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
├── .env.local                    # GEMINI_API_KEY (never exposed to browser)
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

# 2. Add your Gemini API key
echo 'GEMINI_API_KEY="your-key-here"' > .env.local

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Get a Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| AI | Google Gemini 2.5 Flash |
| Voice | Web Speech API |
| Images | Wikimedia Commons API |
