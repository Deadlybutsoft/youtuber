import React, { useState } from 'react';
import { ArrowUp, ListFilter } from 'lucide-react';

interface Props {
  isLoading: boolean;
  onSubmit: (query: string, lengthOption: string) => void;
}

export default function InputBar({ isLoading, onSubmit }: Props) {
  const [query, setQuery] = useState("");
  const [lengthOption, setLengthOption] = useState<"Short" | "Long" | "Explained">("Short");
  const [showMenu, setShowMenu] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(query, lengthOption);
    setQuery("");
  };

  return (
    <div className="relative z-30 flex-none flex items-center justify-center w-full shrink-0 pb-8 sm:pb-10 md:pb-12 px-10 sm:px-12 md:px-14">
      <form onSubmit={handleSubmit} className="w-full max-w-[700px]">
        <div className="relative flex items-center w-full bg-white/[0.06] border border-white/15 rounded-none px-2 py-1 backdrop-blur-sm transition-colors duration-300 focus-within:border-white/30 focus-within:bg-white/[0.08]">
          <div className="relative">
            <button type="button" onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 pl-3 pr-4 py-2 text-[12px] font-['IBM_Plex_Mono',monospace] text-white/50 hover:text-white/80 transition-colors uppercase tracking-widest cursor-pointer bg-transparent border-none">
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lengthOption}</span>
            </button>
            {showMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-36 bg-[#0a0a0a] border border-white/15 shadow-2xl overflow-hidden z-50">
                {(["Short", "Long", "Explained"] as const).map((opt) => (
                  <button key={opt} type="button" onClick={() => { setLengthOption(opt); setShowMenu(false); }} className={`w-full text-left px-4 py-2.5 text-[12px] font-['IBM_Plex_Mono',monospace] uppercase tracking-widest transition-colors cursor-pointer border-none ${lengthOption === opt ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-[1px] h-5 bg-white/10 mr-2" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask me anything..." className="w-full bg-transparent border-none py-3 pl-2 pr-12 text-[16px] text-white/90 outline-none placeholder:text-white/25 font-['Space_Grotesk',sans-serif]" disabled={isLoading} onFocus={() => setShowMenu(false)} />
          <button type="submit" disabled={isLoading || !query.trim()} className="absolute right-2.5 w-8 h-8 flex items-center justify-center bg-white/90 text-[#050505] rounded-none opacity-80 hover:opacity-100 disabled:opacity-20 disabled:bg-white/20 disabled:text-white/30 transition-all cursor-pointer border-none" aria-label="Generate">
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
