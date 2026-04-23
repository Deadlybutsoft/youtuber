import { Slide } from '../types/slide';
import { parsePartialJsonArray } from '../utils/parsePartialJson';

export class RateLimitError extends Error { constructor() { super('rate_limited'); } }

export async function streamSlides(
  query: string,
  lengthOption: string,
  model: string,
  existingSlides: Slide[],
  geminiKey: string,
  onUpdate: (slides: Slide[]) => void,
  openRouterKey?: string,
): Promise<void> {
  const previousTitles = existingSlides.slice(-3).map(s => s.title);

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query, lengthOption, model, previousTitles,
      ...(geminiKey && { geminiKey }),
      ...(openRouterKey && { openRouterKey }),
    }),
  });

  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    if (b.rate_limited) throw new RateLimitError();
    throw new Error(`API error: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let emittedCount = 0;
  const slides: Slide[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    const parsed = parsePartialJsonArray(accumulated) as Slide[];
    for (let i = emittedCount; i < parsed.length; i++) {
      slides.push(parsed[i]);
      onUpdate([...slides]);
      emittedCount++;
    }
  }
}
