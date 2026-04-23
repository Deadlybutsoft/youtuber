import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

const VOICES = [
  { id: 'auto', name: '🎲 Auto', desc: '' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', desc: 'Energetic' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', desc: 'Educator' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', desc: 'Storyteller' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', desc: 'Confident' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', desc: 'Mature' },
];

const MODELS = [
  { id: 'gemini', name: 'Gemini 2.5 Flash' },
  { id: 'openrouter', name: 'OpenRouter (free models)' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (keys: { geminiKey: string; elevenLabsKey: string; openRouterKey: string }) => void;
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  errorMessage?: string | null;
}

export default function SettingsPopup({ open, onClose, onSave, selectedVoice, onVoiceChange, selectedModel, onModelChange, errorMessage }: Props) {
  const [geminiKey, setGeminiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showEleven, setShowEleven] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setElevenLabsKey(localStorage.getItem('elevenlabs_api_key') || '');
    setOpenRouterKey(localStorage.getItem('openrouter_api_key') || '');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', geminiKey.trim());
    localStorage.setItem('elevenlabs_api_key', elevenLabsKey.trim());
    localStorage.setItem('openrouter_api_key', openRouterKey.trim());
    onSave({ geminiKey: geminiKey.trim(), elevenLabsKey: elevenLabsKey.trim(), openRouterKey: openRouterKey.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div ref={ref} className="w-[480px] max-h-[80vh] overflow-y-auto bg-[#1A1A1A] border border-[#333] rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Voice */}
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Choose Voice</div>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {VOICES.map((v) => (
            <button key={v.id} type="button" onClick={() => onVoiceChange(v.id)} className={`text-left px-3 py-2 rounded-lg text-[12px] font-bold transition-colors ${v.id === 'auto' ? 'col-span-2' : ''} ${selectedVoice === v.id ? 'bg-[#FF4E00]/20 text-[#FF4E00]' : 'bg-[#111] text-white/50 hover:text-white hover:bg-white/5'}`}>
              {v.name} {v.desc && <span className="opacity-40 font-normal">· {v.desc}</span>}
            </button>
          ))}
        </div>

        {/* Model */}
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Model</div>
        <div className="flex gap-1.5 mb-4">
          {MODELS.map((m) => (
            <button key={m.id} type="button" onClick={() => onModelChange(m.id)} className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-bold transition-colors ${selectedModel === m.id ? 'bg-[#FF4E00]/20 text-[#FF4E00]' : 'bg-[#111] text-white/50 hover:text-white hover:bg-white/5'}`}>
              {m.name}
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 my-4" />

        {/* API Keys */}
        {errorMessage && (
          <div className="mb-4 px-3 py-2.5 bg-[#FF4E00]/15 border border-[#FF4E00]/30 rounded-lg text-[12px] text-[#FF6520] leading-snug">
            ⚠️ {errorMessage}
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-bold text-white">Your API Keys <span className="text-[11px] font-normal text-white/30">(optional)</span></div>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">Gemini API Key</div>
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#FF4E00] hover:underline">Get API Key →</a>
        </div>
        <div className="relative mb-4">
          <input type={showGemini ? 'text' : 'password'} value={geminiKey} onChange={e => setGeminiKey(e.target.value)} placeholder="Enter your Gemini key" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 pr-9 text-[13px] text-white outline-none focus:border-[#FF4E00]/50 placeholder:text-white/20" />
          <button type="button" onClick={() => setShowGemini(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            {showGemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">ElevenLabs API Key</div>
          <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#FF4E00] hover:underline">Get API Key →</a>
        </div>
        <div className="relative mb-4">
          <input type={showEleven ? 'text' : 'password'} value={elevenLabsKey} onChange={e => setElevenLabsKey(e.target.value)} placeholder="Enter your ElevenLabs key" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 pr-9 text-[13px] text-white outline-none focus:border-[#FF4E00]/50 placeholder:text-white/20" />
          <button type="button" onClick={() => setShowEleven(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            {showEleven ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">OpenRouter API Key</div>
          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#FF4E00] hover:underline">Get API Key →</a>
        </div>
        <div className="relative mb-4">
          <input type={showOpenRouter ? 'text' : 'password'} value={openRouterKey} onChange={e => setOpenRouterKey(e.target.value)} placeholder="Enter your OpenRouter key" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 pr-9 text-[13px] text-white outline-none focus:border-[#FF4E00]/50 placeholder:text-white/20" />
          <button type="button" onClick={() => setShowOpenRouter(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            {showOpenRouter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-[10px] text-white/25 mb-4">Keys are stored locally in your browser.</p>

        <button onClick={handleSave} className="w-full py-2 rounded-lg bg-[#FF4E00] text-white text-[13px] font-bold hover:bg-[#FF4E00]/90 transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}
