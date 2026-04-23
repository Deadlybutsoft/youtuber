---
name: youtuber-architecture
description: Architecture overview of the Youtuber app. Use when making structural changes, adding features, or onboarding.
---

# Youtuber - Architecture

A Gemini AI-powered cinematic slide presentation generator with voice narration.

## Tech Stack
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 (via @tailwindcss/postcss)
- Framer Motion (animations)
- Recharts (charts)
- Google Gemini API (`@google/genai`) — server-side only
- Web Speech API (voice narration)

## Project Structure

```
app/
├── layout.tsx                 # Root layout with metadata
├── page.tsx                   # Client entry — re-exports src/App
├── globals.css                # Tailwind imports + custom font classes
└── api/
    └── generate/
        └── route.ts           # Server-side Gemini streaming endpoint (POST)

src/
├── types/
│   └── slide.ts               # Slide interface
├── utils/
│   └── parsePartialJson.ts    # Streaming JSON parser
├── services/
│   └── ai.ts                  # Client-side: calls /api/generate, reads stream
├── hooks/
│   ├── useProgress.ts         # Streaming progress animation
│   └── useSlidePlayback.ts    # Voice synthesis, caption sync, auto-advance
├── components/
│   ├── WikiImage.tsx           # Fetches images from Wikimedia Commons
│   ├── SlideRenderer.tsx       # Layout dispatcher with animations
│   ├── CaptionOverlay.tsx      # Animated captions
│   ├── PlayerControls.tsx      # Seekbar, play/pause, voice, captions
│   ├── InputBar.tsx            # Query input with length selector
│   └── slides/                 # One component per slide layout
│       ├── TitleOverlay.tsx
│       ├── SplitImage.tsx
│       ├── IconGrid.tsx
│       ├── StatsCallout.tsx
│       ├── Quote.tsx
│       ├── Chart.tsx
│       ├── SvgDiagram.tsx
│       └── ImageCollage.tsx
└── App.tsx                     # Root client component
```

## Key Patterns
- **Server-side API key**: GEMINI_API_KEY is in .env.local (no NEXT_PUBLIC prefix), only accessible in app/api/
- **Streaming**: Server streams raw Gemini text → client parses incrementally via parsePartialJsonArray
- **Voice sync**: useSlidePlayback splits scripts into sentences, uses Web Speech API, auto-advances
- **Append mode**: New queries append slides to existing presentation

## Environment
- `GEMINI_API_KEY` in `.env.local` — server-only, never exposed to client
- Dev: `npm run dev` (port 3000)
- Build: `npm run build` → `npm start`
