import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      theme: {
        type: Type.OBJECT,
        properties: {
          bg: { type: Type.STRING }, text: { type: Type.STRING },
          accent: { type: Type.STRING }, font: { type: Type.STRING },
          align: { type: Type.STRING },
        }
      },
      layout: { type: Type.STRING }, title: { type: Type.STRING },
      subtitle: { type: Type.STRING },
      content: { type: Type.ARRAY, items: { type: Type.STRING } },
      imageKeyword: { type: Type.STRING },
      imageKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      script: { type: Type.STRING },
      iconifyNames: { type: Type.ARRAY, items: { type: Type.STRING } },
      chartType: { type: Type.STRING }, svgCode: { type: Type.STRING },
      chartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } } } },
      echartsOption: { type: Type.OBJECT, properties: {} },
      stats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, label: { type: Type.STRING } } } },
      // Whiteboard
      drawSteps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
        type: { type: Type.STRING }, at: { type: Type.NUMBER }, duration: { type: Type.NUMBER },
        params: { type: Type.OBJECT, properties: {} },
      } } },
      // HTML scene
      htmlScene: { type: Type.STRING },
      // Particle effect
      particleEffect: { type: Type.STRING },
      // Code walkthrough
      code: { type: Type.STRING }, language: { type: Type.STRING },
      highlightLines: { type: Type.ARRAY, items: { type: Type.NUMBER } },
      // Comparison
      leftColumn: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
      rightColumn: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
      // Timeline
      timelineSteps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
        year: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING },
      } } },
      // Canvas free elements
      elements: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
        type: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER },
        width: { type: Type.NUMBER }, height: { type: Type.NUMBER },
        rotation: { type: Type.NUMBER }, zIndex: { type: Type.NUMBER },
        content: { type: Type.STRING }, animation: { type: Type.STRING }, animationAt: { type: Type.NUMBER },
      } } },
    },
    required: ["layout", "title"]
  }
};

function buildPrompt(query: string, lengthOption: string, previousTitles: string[], mode: 'intro' | 'rest' | 'full' = 'full', introTitles: string[] = []): string {
  const lengthInstruction = mode === 'intro'
    ? "Generate EXACTLY 1 slide — the hook/intro only. Make it cinematic and irresistible."
    : mode === 'rest'
    ? (lengthOption === "Short"
        ? "Generate 1–2 more slides (core insight + punchy conclusion). Do NOT repeat the intro."
        : lengthOption === "Long"
        ? "Generate 4–8 more slides (deep explanation + strong conclusion). Do NOT repeat the intro."
        : "Generate 10+ slides — go deep. Cover every layer, nuance, and implication. Do NOT repeat the intro.")
    : (lengthOption === "Short"
        ? "Generate 2–3 slides. One hook, one core insight, one memorable takeaway."
        : lengthOption === "Long"
        ? "Generate 5–10 slides. Build a complete narrative arc with depth and variety."
        : "Generate 12+ slides. This is a full documentary-style deep dive — leave nothing out.");

  const contextInstruction = mode === 'rest'
    ? `You are continuing a presentation. Intro already covered: "${introTitles.join(", ")}". Continue for: "${query}"`
    : previousTitles.length > 0
    ? `You are continuing a live presentation. Already covered: "${previousTitles.join(", ")}". Seamlessly continue with: "${query}"`
    : `Topic: "${query}"`;

  return `You are a world-class visual storyteller — think Kurzgesagt meets 3Blue1Brown meets the best YouTube essayists. Your job is to turn any question into a stunning, cinematic slide presentation that feels like a premium YouTube video.

${contextInstruction}

${lengthInstruction}

━━━ NARRATIVE STRUCTURE ━━━
Build a real story arc:
• Slide 1 — The Hook: Open with a surprising fact, bold claim, or provocative question. Make the viewer lean in.
• Middle slides — The Journey: Explain with clarity and depth. Use analogies, real examples, data, and visuals. Each slide should feel like a new "scene" that advances understanding.
• Final slide — The Payoff: End with a powerful insight, reframe, or "aha" moment. No subscribe/like/comment CTAs ever.

━━━ SCRIPT QUALITY (MOST IMPORTANT) ━━━
Every slide MUST have a 'script' — the exact words spoken aloud. This is the soul of the presentation.
Rules for great scripts:
• Write like you're talking to a smart friend, not reading a textbook. Conversational, vivid, direct.
• Use rhetorical questions, short punchy sentences, and natural pauses ("Here's the thing...", "But wait —", "Think about it this way:").
• Scripts should be 3–6 sentences per slide. Long enough to be substantive, short enough to stay punchy.
• CRITICAL — Visual sync: The script MUST reference what's on screen. If there's a chart: "Look at this curve — notice how it spikes right here." If there's a stat: "That number you're seeing? That's not a typo." If there's an image: "This photo captures exactly what I mean." The voice and visual must feel like one unified experience.
• Never be generic. Every sentence should be specific to THIS topic.

━━━ VISUAL DESIGN ━━━
Every slide MUST have a 'theme' object:
• bg: Dark, atmospheric hex (e.g. "#050510", "#0d0d0d", "#0a1a0a", "#1a0a00"). Never use plain black #000000.
• text: High-contrast white/near-white (e.g. "#ffffff", "#f5f5f5", "#e8e8e8").
• accent: One bold, thematic accent color that fits the topic mood (e.g. "#FF4E00" for energy/tech, "#00D4FF" for science/space, "#FFD700" for history/wealth, "#00FF88" for nature/biology, "#FF00AA" for culture/art).
• font: Match the topic — 'playfair' for history/philosophy, 'jetbrains' for code/tech, 'space' for science/future, 'outfit' for modern/business, 'inter' for clean/neutral.
• align: Vary it. Use 'left' for text-heavy slides, 'center' for dramatic moments, 'right' sparingly for contrast.

Vary your color palette across slides — don't use the same bg/accent on every slide. Create visual rhythm.

━━━ LAYOUT SELECTION ━━━
Choose the layout that best serves each slide's content. Be bold — use diverse layouts, not just title-overlay every time.

1. "title-overlay" — Cinematic full-screen opener. Use 'imageKeyword' (2–3 specific words) for a Wikipedia background image. Best for hooks and chapter titles.
2. "split-image" — Text + visual side by side. Use 'imageKeyword' and 'content' bullets (3–5 punchy points, not full sentences). Best for explaining concepts with real-world examples.
3. "icon-grid" — 2–4 concept cards with icons. Use 'content' strings and matching 'iconifyNames' (e.g. 'mdi:brain', 'logos:react', 'ph:lightning-bold'). Best for listing key ideas or components.
4. "stats-callout" — 1–3 massive numbers that stop you in your tracks. Use 'stats' with 'value' (the number, formatted dramatically) and 'label' (short context). Best for data-driven moments.
5. "quote" — One powerful sentence. 'title' is the quote, 'subtitle' is attribution. Best for philosophical moments or expert opinions.
6. "chart" — Data visualization via Apache ECharts. Provide a complete 'echartsOption' JSON. Available types: bar, line, area (line+areaStyle), pie, donut (pie with radius array), scatter, radar, treemap, funnel, gauge, sankey, heatmap, sunburst. Style charts to match the slide theme — use the accent color. Best for trends, comparisons, distributions.
7. "svg-diagram" — Custom diagram or flowchart. Provide valid SVG in 'svgCode' with viewBox="0 0 400 400". Use clean lines, the accent color, and white text. Best for processes, systems, relationships.
8. "image-collage" — 2–4 Wikipedia images in a grid. Use 'imageKeywords' array. Best for showing multiple examples or perspectives.
9. "whiteboard" — Animated drawing that builds on screen. Use 'drawSteps' with: type ('shape'|'path'|'text'|'pointer'), at (seconds), duration (seconds), params. Best for math, geometry, or step-by-step processes.
10. "html-scene" — Sandboxed interactive HTML/CSS/JS animation. Use 'htmlScene' string. Dark background, white text, centered. Best for physics simulations, orbital mechanics, particle systems, interactive demos.
11. "kinetic-text" — Full-screen typographic impact. Title animates letter-by-letter, subtitle word-by-word, content as floating pills. Best for key takeaways or chapter breaks.
12. "code-walkthrough" — Syntax-highlighted code with line numbers. Use 'code', 'language', and optionally 'highlightLines'. Best for technical topics.
13. "comparison" — Side-by-side with VS badge. Use 'leftColumn' and 'rightColumn' each with { title, items[] }. Best for pros/cons, before/after, A vs B.
14. "timeline-flow" — Animated vertical timeline. Use 'timelineSteps' array of { year, title, description }. Best for history, evolution of ideas, or step sequences.
15. "canvas-free" — Freeform positioned elements. Use 'elements' array: { type ('text'|'image'|'icon'|'shape'), x (0–100), y (0–100), content, width?, height?, rotation?, zIndex?, animation?, animationAt? }. Best for creative layouts that don't fit other templates.

PARTICLE EFFECTS: Add 'particleEffect' to any slide for atmosphere. Options: 'starfield' (space/cosmos), 'snow' (cold/winter), 'rain' (melancholy/drama), 'fire' (intensity/danger), 'confetti' (celebration), 'fireworks' (achievement), 'bubbles' (underwater/science). Use max 1–2 per presentation, only when it genuinely enhances the mood.

━━━ QUALITY CHECKLIST ━━━
Before finalizing, verify each slide:
✓ Script is specific, vivid, and references the visual
✓ Layout choice serves the content (not just default title-overlay)
✓ Theme colors are varied and mood-appropriate
✓ Content is accurate and substantive — no filler
✓ The full presentation tells a coherent, satisfying story

Return ONLY a valid JSON array. No markdown, no code fences, no explanation.`;
}

async function streamGemini(prompt: string, userKey?: string): Promise<Response> {
  const apiKey = userKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const ai = new GoogleGenAI({ apiKey });
  let responseStream;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema }
      });
      break;
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if ((status === 503 || status === 429) && attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return new Response(
        JSON.stringify({ error: status === 503 || status === 429 ? 'Gemini is temporarily overloaded. Please try again in a moment.' : 'Failed to generate content', rate_limited: status === 429 || status === 503 }),
        { status: status || 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of responseStream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
      } catch (e) { controller.error(e); }
      finally { controller.close(); }
    }
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' } });
}

async function streamOpenRouter(prompt: string, userKey?: string): Promise<Response> {
  const apiKey = userKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const client = new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' });

  let completion;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      completion = await client.chat.completions.create({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });
      break;
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if ((status === 503 || status === 429) && attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return new Response(
        JSON.stringify({ error: 'OpenRouter error. Please try again in a moment.' }),
        { status: status || 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion!) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (e) { controller.error(e); }
      finally { controller.close(); }
    }
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' } });
}

export async function POST(req: NextRequest) {
  const { query, lengthOption, model, previousTitles, geminiKey, openRouterKey, mode, introTitles } = await req.json();
  if (!query) {
    return new Response(JSON.stringify({ error: 'query is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const prompt = buildPrompt(query, lengthOption || 'Short', previousTitles || [], mode || 'full', introTitles || []);

  if (model === 'openrouter') {
    return streamOpenRouter(prompt, openRouterKey);
  }
  return streamGemini(prompt, geminiKey);
}
