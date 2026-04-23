export function parsePartialJsonArray(jsonString: string): any[] {
  const results = [];
  let bracketCount = 0;
  let objectStart = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (!inString) {
      if (char === '{') {
        if (bracketCount === 0) objectStart = i;
        bracketCount++;
      } else if (char === '}') {
        bracketCount--;
        if (bracketCount === 0 && objectStart !== -1) {
          try {
            results.push(JSON.parse(jsonString.substring(objectStart, i + 1)));
          } catch (e) { /* ignore partial */ }
        }
      }
    }
  }
  return results;
}
