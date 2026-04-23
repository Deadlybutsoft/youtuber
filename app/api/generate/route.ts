import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      style: { type: Type.STRING },
      title: { type: Type.STRING },
      subtitle: { type: Type.STRING },
      content: { type: Type.ARRAY, items: { type: Type.STRING } },
      icons: { type: Type.ARRAY, items: { type: Type.STRING } },
      imageKeyword: { type: Type.STRING },
      imageKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      script: { type: Type.STRING },
      stats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, label: { type: Type.STRING } } } },
      chartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } } } },
      svgCode: { type: Type.STRING },
      code: { type: Type.STRING },
      codeLanguage: { type: Type.STRING },
      leftColumn: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
      rightColumn: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
      timelineSteps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, text: { type: Type.STRING } } } },
      longText: { type: Type.STRING },
    },
    required: ['style', 'title', 'script'],
  },
};

function buildPrompt(query: string, lengthOption: string, previousTitles: string[]): string {
  const count = lengthOption === 'Short' ? '2–3' : lengthOption === 'Long' ? '5–8' : '10+';
  const cont = previousTitles.length > 0
    ? `\nContinuing. Already covered: "${previousTitles.join('", "')}". Don't repeat.`
    : '';

  return `You are a world-class visual storyteller. Create a cinematic slide presentation.
${cont}
Topic: "${query}"
Generate ${count} slides.

Every slide MUST have: style, title, script.
script = 3–6 sentences spoken aloud. Conversational, vivid, references what's on screen.

━━━ 15 SLIDE STYLES ━━━
Pick the best style for each slide's content. Use variety — don't repeat the same style.

1. "hero" — Cinematic opener. Fields: title, subtitle?, imageKeyword (Wikipedia search term)
2. "split" — Text + image side by side. Fields: title, content[] (3-5 bullets), icons[] (Iconify names matching content), imageKeyword
3. "icon-grid" — 2-4 concept cards. Fields: title, subtitle?, content[] (2-4 items), icons[] (matching, e.g. mdi:brain, ph:lightning-bold)
4. "stats" — Big numbers. Fields: title, stats[] ({value, label}, 1-3 items)
5. "quote" — Powerful statement. Fields: title (the quote), subtitle (attribution)
6. "chart-bar" — Bar chart. Fields: title, chartData[] ({name, value}, 3-8 items)
7. "chart-line" — Line chart. Fields: title, chartData[] ({name, value}, 4-10 items)
8. "chart-pie" — Pie chart. Fields: title, chartData[] ({name, value}, 3-6 items)
9. "diagram" — SVG flowchart. Fields: title, svgCode (valid SVG, viewBox="0 0 400 300", dark bg, white text, colored lines)
10. "gallery" — Image grid. Fields: title, imageKeywords[] (2-4 Wikipedia search terms)
11. "long-text" — Detailed explanation. Fields: title, longText (2-4 paragraphs)
12. "comparison" — A vs B. Fields: title, leftColumn {title, items[]}, rightColumn {title, items[]}
13. "timeline" — Step sequence. Fields: title, timelineSteps[] ({label, text}, 3-6 steps)
14. "code" — Code snippet. Fields: title, code (15-30 lines), codeLanguage
15. "big-statement" — One bold line. Fields: title, subtitle?

━━━ RULES ━━━
• Use diverse styles — mix at least 3-4 different styles per presentation
• When using content[], ALWAYS include matching icons[] (same length)
• chartData must have real, accurate numbers
• imageKeyword = 2-3 word Wikipedia image search
• Script must reference the visual: "Look at this chart...", "Notice this number..."

Return ONLY a valid JSON array.`;
}

async function streamGemini(prompt: string, userKey?: string): Promise<Response> {
  const apiKey = userKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  const ai = new GoogleGenAI({ apiKey });
  let stream;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash', contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: schema },
      });
      break;
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if ((status === 503 || status === 429) && attempt < 2) { await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); continue; }
      return new Response(JSON.stringify({ error: 'Generation failed', rate_limited: status === 429 || status === 503 }), { status: status || 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try { for await (const chunk of stream!) { if (chunk.text) controller.enqueue(encoder.encode(chunk.text)); } }
      catch (e) { controller.error(e); } finally { controller.close(); }
    },
  });
  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' } });
}

const OPENROUTER_MODELS = ['google/gemma-4-31b-it:free', 'openai/gpt-oss-120b:free', 'meta-llama/llama-3.3-70b-instruct:free'];

async function streamOpenRouter(prompt: string, userKey?: string): Promise<Response> {
  const apiKey = userKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  const client = new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' });
  let completion;
  for (const model of OPENROUTER_MODELS) {
    try { completion = await client.chat.completions.create({ model, messages: [{ role: 'user', content: prompt + '\n\nReturn ONLY valid JSON array. No markdown fences.' }], stream: true }); break; }
    catch (e: unknown) { const s = (e as { status?: number }).status; if (s === 429 || s === 503) continue; return new Response(JSON.stringify({ error: 'OpenRouter error', rate_limited: false }), { status: s || 500, headers: { 'Content-Type': 'application/json' } }); }
  }
  if (!completion) return new Response(JSON.stringify({ error: 'All models rate-limited', rate_limited: true }), { status: 429, headers: { 'Content-Type': 'application/json' } });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try { for await (const chunk of completion!) { const t = chunk.choices[0]?.delta?.content; if (t) controller.enqueue(encoder.encode(t)); } }
      catch (e) { controller.error(e); } finally { controller.close(); }
    },
  });
  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' } });
}

export async function POST(req: NextRequest) {
  const { query, lengthOption, model, previousTitles, geminiKey, openRouterKey } = await req.json();
  if (!query) return new Response(JSON.stringify({ error: 'query is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  const prompt = buildPrompt(query, lengthOption || 'Short', previousTitles || []);
  return model === 'openrouter' ? streamOpenRouter(prompt, openRouterKey) : streamGemini(prompt, geminiKey);
}
