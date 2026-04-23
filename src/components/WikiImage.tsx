'use client';
import { useState, useEffect, useRef } from 'react';

const wikiCache = new Map<string, string | null>();

async function fetchWikiImage(keyword: string): Promise<string | null> {
  if (wikiCache.has(keyword)) return wikiCache.get(keyword) ?? null;

  // Try Wikipedia page images first (better quality, more relevant)
  try {
    const pageRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(keyword)}&prop=pageimages&pithumbsize=800&format=json&origin=*`
    );
    const pageData = await pageRes.json();
    const pages = pageData.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0] as Record<string, unknown>;
      const thumb = (page?.thumbnail as Record<string, string>)?.source;
      if (thumb) {
        wikiCache.set(keyword, thumb);
        return thumb;
      }
    }
  } catch {}

  // Fallback: Wikimedia Commons search
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(keyword)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    if (pages) {
      // Filter out SVGs and pick first valid image
      const sorted = Object.values(pages) as Record<string, unknown>[];
      for (const p of sorted) {
        const info = (p?.imageinfo as Record<string, string>[])?.[0];
        if (!info) continue;
        const mime = info.mime || '';
        if (mime.includes('svg')) continue; // Skip SVGs
        const resolved = info.thumburl || info.url;
        if (resolved) {
          wikiCache.set(keyword, resolved);
          return resolved;
        }
      }
    }
  } catch {}

  // Fallback: Unsplash Source (free, no API key needed)
  const fallback = `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}`;
  wikiCache.set(keyword, fallback);
  return fallback;
}

export default function WikiImage({ keyword, className }: { keyword: string; className?: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(() => wikiCache.get(keyword) ?? null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!keyword) return;
    if (wikiCache.has(keyword)) {
      setImgUrl(wikiCache.get(keyword) ?? null);
      return;
    }
    let mounted = true;
    fetchWikiImage(keyword).then(url => {
      if (mounted) setImgUrl(url);
    });
    return () => { mounted = false; };
  }, [keyword]);

  if (!imgUrl || error) {
    return (
      <div className={`${className} bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center`}>
        <span className="text-white/20 text-[12px] font-mono uppercase tracking-wider">{keyword}</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className={`${className} bg-[#1a1a1a] animate-pulse`} />}
      <img
        ref={imgRef}
        src={imgUrl}
        className={`${className} ${loaded ? '' : 'hidden'}`}
        alt={keyword}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}
