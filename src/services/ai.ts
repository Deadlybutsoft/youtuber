import { Slide } from '../types/slide';
import { parsePartialJsonArray } from '../utils/parsePartialJson';

export class RateLimitError extends Error { constructor() { super('rate_limited'); } }

async function fetchStream(
  body: object,
  onSlide: (slide: Slide) => void,
): Promise<Slide[]> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    const parsed = parsePartialJsonArray(accumulated) as Slide[];
    for (let i = emittedCount; i < parsed.length; i++) {
      onSlide(parsed[i]);
      emittedCount++;
    }
  }

  return parsePartialJsonArray(accumulated) as Slide[];
}

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
  const base = {
    query, lengthOption, model, previousTitles,
    ...(geminiKey && { geminiKey }),
    ...(openRouterKey && { openRouterKey }),
  };

  // Skip intro/rest split for Short (1-3 slides) — not worth two round trips
  if (lengthOption === 'Short') {
    const slides: Slide[] = [];
    await fetchStream(base, (slide) => {
      slides.push(slide);
      onUpdate([...slides]);
    });
    return;
  }

  const newSlides: Slide[] = [];
  const emit = () => onUpdate([...newSlides]);

  // Fire intro call
  const introSlides = await fetchStream({ ...base, mode: 'intro' }, (slide) => {
    newSlides.push(slide);
    emit();
  });

  // Fire rest call — await it so isStreaming stays true until all slides arrive
  await fetchStream(
    { ...base, mode: 'rest', introTitles: introSlides.map(s => s.title) },
    (slide) => { newSlides.push(slide); emit(); },
  ).catch(() => {});
}
