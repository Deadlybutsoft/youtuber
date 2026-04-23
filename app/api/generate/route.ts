import { GoogleGenAI, Type } from '@google/genai';
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
      stats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, label: { type: Type.STRING } } } }
    },
    required: ["layout", "title"]
  }
};

function buildPrompt(query: string, lengthOption: string, previousTitles: string[]): string {
  const lengthInstruction = lengthOption === "Short"
    ? "CRITICAL LENGTH CONSTRAINT: Generate a quick, concise summary. Create EXACTLY 1 to 3 slides MAX."
    : lengthOption === "Long"
    ? "CRITICAL LENGTH CONSTRAINT: Generate a detailed multi-frame storyboard. Create exactly 3 to 10 slides MAX."
    : "CRITICAL LENGTH CONSTRAINT: Generate a deeply comprehensive, highly detailed storyboard. Create 10+ slides explaining every nuance step-by-step.";

  const contextInstruction = previousTitles.length > 0
    ? `You are continuing an ongoing presentation. Previous topics covered: "${previousTitles.join(", ")}". \n\nNow, seamlessly continue the presentation by addressing this new input: "${query}"`
    : `You are a charismatic visual storyteller and educator. Your goal is to answer the user's question: "${query}" using a cinematic visual presentation.`;

  return `${contextInstruction}

Each slide is a scene. Speak directly to the viewer in a conversational, enthusiastic tone!

${lengthInstruction}

Structure the flow (if multi-frame):
- Frame 1: The Hook / Intro
- Middle Frames: The Core Explanation
- Final Frame: A powerful concluding thought. (CRITICAL: DO NOT use YouTube tropes like asking the user to "subscribe", "like", or "comment" under any circumstances. Keep it strictly educational and impactful.)

CRITICAL REQUIREMENT: For EVERY single frame, you MUST write a 'script'. This is the exact, verbatim transcript of what you (the charismatic guy/teacher) are saying out loud while this specific slide is on the screen. Make the script energetic, natural, and educational.
EXTREMELY IMPORTANT SYNCHRONIZATION: The speaker MUST explicitly acknowledge and refer to the visual elements on the screen! You are presenting a visual deck, not just talking in a void.
- If you use a 'chart', say "Take a look at this chart here, you can see..."
- If you use a 'stats-callout', say "Notice this massive number on the screen..."
- If you use 'split-image' or 'image-collage', say "Look at this image..."
- If you use 'icon-grid' or 'svg-diagram', say "Let's break down this diagram on screen..."
The voice and the visual layout MUST feel perfectly synchronized and context-aware.

CRITICAL REQUIREMENT: For EVERY single frame, you MUST include a 'theme' object specifying the design system. Match the mood of the slide!
- bg: Background color hex code (Must be dark and moody like "#080808", "#120822", "#0a1f10").
- text: Main text color hex code (Must be ultra-bright for contrast like "#ffffff", "#f0f0f0").
- accent: Punchy accent color hex code for highlights/subtitles (e.g., "#FF4E00", "#00FFCC", "#FF00FF", "#EAB308").
- font: Choose from ['inter', 'playfair', 'space', 'jetbrains', 'outfit']. Mix it up (e.g. use 'playfair' for history, 'jetbrains' for code).
- align: Choose text alignment from ['left', 'center', 'right'].

Available strict layout scenes:
1. "title-overlay": Dramatic full-screen title. Provide 'imageKeyword' (1-3 words) for a Wikipedia image search background.
2. "split-image": Conversational text paired with B-roll. Provide 'imageKeyword' (1-3 words) and 'content' bullets.
3. "icon-grid": Explaining concepts using specific icons. Provide 2-4 'content' strings and matching 'iconifyNames' (e.g. 'mdi:brain', 'logos:react', 'twemoji:fire').
4. "stats-callout": Highlighting massive numbers or facts. Provide 1-3 'stats' (value and label).
5. "quote": A powerful statement. Provide 'title' (the quote) and 'subtitle' (the speaker/context).
6. "chart": Display a chart showing data trends. Provide 'chartType' ('bar', 'line', 'pie') and 'chartData' (array of {name, value}).
7. "svg-diagram": Create any geometry, shape, diagram, or flowchart. Provide raw valid SVG string in 'svgCode'. Use viewBox="0 0 400 400".
8. "image-collage": Display multiple images. Provide an array of 2 to 4 'imageKeywords' for Wikipedia image search.

Return a JSON array of these frames.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 500 });
  }

  const { query, lengthOption, previousTitles } = await req.json();
  if (!query) {
    return new Response(JSON.stringify({ error: 'query is required' }), { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(query, lengthOption || 'Short', previousTitles || []);

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema }
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of responseStream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  });
}
