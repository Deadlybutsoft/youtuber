import { useState, useEffect } from 'react';

export default function WikiImage({ keyword, className }: { keyword: string; className?: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!keyword) return;
    let isMounted = true;
    (async () => {
      try {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(keyword)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const first = Object.values(pages)[0] as any;
          if (isMounted && first?.imageinfo?.[0]) {
            setImgUrl(first.imageinfo[0].thumburl || first.imageinfo[0].url);
          }
        }
      } catch (e) { console.error("Wiki fetch error", e); }
    })();
    return () => { isMounted = false; };
  }, [keyword]);

  if (!imgUrl) return <div className={`bg-[#222] animate-pulse ${className}`} />;
  return <img src={imgUrl} className={className} alt={keyword} />;
}
