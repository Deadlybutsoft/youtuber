import { Slide } from '../types/slide';
import { parsePartialJsonArray } from '../utils/parsePartialJson';

export async function streamSlides(
  query: string,
  lengthOption: string,
  existingSlides: Slide[],
  onUpdate: (slides: Slide[]) => void,
): Promise<Slide[]> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      lengthOption,
      previousTitles: existingSlides.slice(-3).map(s => s.title),
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let lastUpdate = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    const now = Date.now();
    if (now - lastUpdate > 200) {
      const parsed = parsePartialJsonArray(accumulated) as Slide[];
      if (parsed.length > 0) onUpdate(parsed);
      lastUpdate = now;
    }
  }

  return parsePartialJsonArray(accumulated) as Slide[];
}
