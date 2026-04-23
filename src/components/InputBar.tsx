import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Settings, ChevronDown } from 'lucide-react';
import SettingsPopup from './SettingsPopup';

interface Props {
  isLoading: boolean;
  onSubmit: (query: string, lengthOption: string) => void;
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onApiKeysChange: (keys: { geminiKey: string; elevenLabsKey: string; openRouterKey: string }) => void;
  apiKeyError?: string | null;
  onClearApiKeyError?: () => void;
}

const LENGTH_OPTIONS = ["Short", "Long", "Explained"] as const;

export default function InputBar({ isLoading, onSubmit, selectedVoice, onVoiceChange, selectedModel, onModelChange, onApiKeysChange, apiKeyError, onClearApiKeyError }: Props) {
  const [query, setQuery] = useState("");
  const [lengthOption, setLengthOption] = useState<"Short" | "Long" | "Explained">("Short");
  const [showSettings, setShowSettings] = useState(false);
  const [showLength, setShowLength] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (apiKeyError) setShowSettings(true);
  }, [apiKeyError]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px'; // 96px ≈ 4 lines
  };

  useEffect(autoResize, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(query, lengthOption);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim()) handleSubmit(e);
    }
  };

  return (
    <div className="flex-none flex items-center justify-center w-full shrink-0 pb-1 sm:pb-2">
      <form onSubmit={handleSubmit} className="w-full max-w-[800px] px-2 sm:px-6">
        <div className="relative flex items-end w-full bg-[#2F2F2F] border border-[#444] rounded-[20px] px-2 py-1.5 shadow-md focus-within:border-[#666] transition-colors duration-300">
          <button type="button" onClick={() => setShowSettings(true)} className="pl-2 pr-1 pb-1.5 text-white/40 hover:text-[#FF4E00] transition-colors shrink-0 self-end" aria-label="Settings">
            <Settings className="w-7 h-7" />
          </button>
          <div className="relative shrink-0 self-end pb-1.5">
            <button type="button" onClick={() => setShowLength(v => !v)} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[18px] font-bold text-white/50 hover:text-white/80 transition-colors">
              {lengthOption} <ChevronDown className="w-5 h-5" />
            </button>
            {showLength && (
              <div className="absolute bottom-full left-0 mb-1 w-28 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl overflow-hidden z-50 py-1">
                {LENGTH_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => { setLengthOption(opt); setShowLength(false); }} className={`w-full text-left px-3 py-1.5 text-[12px] font-bold transition-colors ${lengthOption === opt ? 'bg-[#FF4E00]/20 text-[#FF4E00]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowLength(false)}
            placeholder="Ask me anything..."
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent border-none py-2.5 pl-2 pr-12 text-[16px] text-white outline-none placeholder:text-white/30 font-sans resize-none overflow-y-auto leading-6"
            style={{ maxHeight: 96 }}
          />
          <button type="submit" disabled={isLoading || !query.trim()} className="absolute right-2.5 bottom-2 w-9 h-9 flex items-center justify-center bg-[#FF4E00] text-white rounded-full hover:bg-[#FF6520] disabled:opacity-30 disabled:bg-[#555] disabled:text-[#888] transition-all shrink-0" aria-label="Generate">
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>
      <SettingsPopup open={showSettings} onClose={() => { setShowSettings(false); onClearApiKeyError?.(); }} onSave={onApiKeysChange} selectedVoice={selectedVoice} onVoiceChange={onVoiceChange} selectedModel={selectedModel} onModelChange={onModelChange} errorMessage={apiKeyError} />
    </div>
  );
}
