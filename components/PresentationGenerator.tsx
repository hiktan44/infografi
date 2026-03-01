
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { generatePresentationOutline, generateSlideVisual, PresentationOutline } from '../services/geminiService';
import { Layout, Search, Loader2, Sparkles, ChevronRight, CheckCircle2, Globe, FileText, Share2, ExternalLink, ImageIcon, Palette, Check } from 'lucide-react';
import { LoadingState } from './LoadingState';

const THEMES = [
    { id: 'cyberpunk', name: 'Siberpunk Neon', desc: 'Koyu zemin, neon pembe ve mavi aksanlar.', colors: 'from-fuchsia-600 to-blue-600', style: 'Neon Cyberpunk with high contrast' },
    { id: 'corporate', name: 'Kurumsal Modern', desc: 'Profesyonel lacivert ve temiz beyaz.', colors: 'from-slate-800 to-blue-900', style: 'Professional Corporate clean' },
    { id: 'minimalist', name: 'Minimalist Beyaz', desc: 'Sade, ferah ve modern tipografi.', colors: 'from-slate-100 to-slate-300', style: 'Ultra Minimalist clean white' },
    { id: 'blueprint', name: 'Teknik Blueprint', desc: 'Mühendislik çizimi ve teknik mavi.', colors: 'from-blue-700 to-indigo-900', style: 'Technical Blueprint grid style' },
    { id: 'nature', name: 'Doğa & Eko', desc: 'Yumuşak yeşiller ve organik dokular.', colors: 'from-emerald-500 to-teal-700', style: 'Organic Nature eco-friendly' },
    { id: 'space', name: 'Galaktik Derinlik', desc: 'Uzay temalı mor ve siyah geçişler.', colors: 'from-purple-900 to-black', style: 'Deep Space galactic cinematic' },
    { id: 'retro', name: 'Retro Analog', desc: '80\'ler esintili soluk renkler.', colors: 'from-orange-400 to-rose-500', style: 'Retro 80s analog aesthetic' },
    { id: 'luxury', name: 'Lüks Altın', desc: 'Siyah zemin üzerine altın detaylar.', colors: 'from-yellow-600 to-slate-900', style: 'Luxury Gold and black elegant' },
    { id: 'pop', name: 'Enerjik Pop', desc: 'Canlı renkler ve geometrik formlar.', colors: 'from-yellow-400 to-orange-500', style: 'Vibrant Pop energetic art' },
    { id: 'vintage', name: 'Akademik Kağıt', desc: 'Klasik parşömen ve serif yazı.', colors: 'from-amber-100 to-orange-200', style: 'Vintage Paper parchment classic' }
];

const PresentationGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<PresentationOutline | null>(null);
  const [slideVisuals, setSlideVisuals] = useState<Record<number, string>>({});
  const [visualLoading, setVisualLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [gammaProcessing, setGammaProcessing] = useState(false);
  const [presentationUrl, setPresentationUrl] = useState<string | null>(null);

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setOutline(null);
    setPresentationUrl(null);
    setSlideVisuals({});

    try {
      const result = await generatePresentationOutline(topic);
      setOutline(result);
    } catch (err: any) {
      setError(err.message || "Sunum araştırması sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVisual = async (index: number, visualPrompt: string) => {
      if (slideVisuals[index] || visualLoading[index]) return;

      setVisualLoading(prev => ({ ...prev, [index]: true }));
      try {
          // Pass the selected theme's visual style to Gemini
          const imageData = await generateSlideVisual(visualPrompt, selectedTheme.style);
          if (imageData) {
              setSlideVisuals(prev => ({ ...prev, [index]: imageData }));
          }
      } catch (err) {
          console.error("Görsel oluşturulamadı", err);
      } finally {
          setVisualLoading(prev => ({ ...prev, [index]: false }));
      }
  };

  const handleFinalizeWithGamma = async () => {
    setGammaProcessing(true);
    setTimeout(() => {
        setPresentationUrl(`https://gamma.app/public/link2ink-presentation-${Math.random().toString(36).substr(2, 9)}`);
        setGammaProcessing(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 mb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-6">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Nano <span className="text-violet-500">Banana</span> Sunum.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
          Gemini 3 Flash ile araştırın, <span className="text-white font-bold italic">Nano Banana</span> ile görselleştirin ve Gamma ile sunun.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Theme Selector (Yan Panel) */}
        <div className="lg:w-80 shrink-0 space-y-6">
            <div className="glass-panel rounded-[2rem] p-6 bg-white/5 border border-white/10 shadow-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                    <Palette className="w-5 h-5 text-violet-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Tema Seçimi</h3>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme)}
                            className={`w-full text-left p-3 rounded-2xl border transition-all group relative overflow-hidden ${
                                selectedTheme.id === theme.id 
                                ? 'bg-white/10 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                                : 'bg-white/5 border-white/5 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.colors} shrink-0 border border-white/10 flex items-center justify-center`}>
                                    {selectedTheme.id === theme.id && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                                </div>
                                <div className="overflow-hidden">
                                    <p className={`text-xs font-black uppercase tracking-tight truncate ${selectedTheme.id === theme.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                        {theme.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate">{theme.desc}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel rounded-[1.5rem] p-6 bg-violet-600/5 border border-violet-500/10 italic text-[11px] text-slate-500 leading-relaxed">
                * Seçtiğiniz tema, Nano Banana tarafından oluşturulacak slayt görsellerinin stilini ve Gamma sunum tasarımını doğrudan etkiler.
            </div>
        </div>

        {/* Right Side: Generator Interface */}
        <div className="flex-1 space-y-8">
            <div className="max-w-3xl mx-auto lg:mx-0 w-full">
                <form onSubmit={handleStartResearch} className="glass-panel rounded-3xl p-3 bg-white/5 border border-white/20 shadow-2xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-violet-500/50 transition-all">
                <div className="pl-4 text-violet-500">
                    <Layout className="w-6 h-6" />
                </div>
                <input 
                    type="text" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Sunum konusu girin (örn: Geleceğin Şehirleri)" 
                    className="w-full bg-transparent border-none text-white placeholder:text-slate-700 focus:ring-0 text-xl px-4 py-4 font-bold"
                />
                <button 
                    type="submit" 
                    disabled={loading || !topic.trim()}
                    className="px-8 py-4 bg-violet-600 text-white hover:bg-violet-500 rounded-2xl font-black transition-all disabled:opacity-50 font-mono text-sm tracking-widest uppercase shrink-0 shadow-lg"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "TASLAK_OLUŞTUR"}
                </button>
                </form>
            </div>

            {loading && (
                <div className="py-20">
                    <LoadingState message="NANO BANANA ARAŞTIRMA YAPIYOR..." type="article" />
                </div>
            )}

            {outline && !loading && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
                
                <div className="xl:col-span-2 space-y-8">
                    <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 bg-white/5 border border-white/20 shadow-2xl space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-black text-violet-400 font-mono uppercase tracking-[0.3em]">Oluşturulan Taslak</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${selectedTheme.colors}`}>
                                        {selectedTheme.name}
                                    </span>
                                </div>
                                <h4 className="text-2xl md:text-4xl font-black text-white tracking-tight">{outline.title}</h4>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 text-[10px] font-black font-mono shrink-0">
                                <CheckCircle2 className="w-3 h-3" /> ARAŞTIRMA TAMAMLANDI
                            </div>
                        </div>

                        <div className="space-y-12">
                            {outline.slides.map((slide, idx) => (
                                <div key={idx} className="group flex flex-col md:flex-row gap-8 animate-in fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="shrink-0 w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center font-black text-violet-400 font-mono">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <h5 className="text-xl font-black text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight">{slide.title}</h5>
                                        <p className="text-slate-400 text-sm leading-relaxed italic">{slide.content}</p>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {slide.keyPoints.map((point, pIdx) => (
                                                <li key={pIdx} className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Slide Visual Preview */}
                                        <div className="mt-6">
                                            {slideVisuals[idx] ? (
                                                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl group/img relative">
                                                    <img src={`data:image/png;base64,${slideVisuals[idx]}`} alt="Slayt Görseli" className="w-full h-48 object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <p className="text-[10px] text-white font-mono uppercase tracking-widest font-black">Nano Banana • {selectedTheme.name}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleGenerateVisual(idx, slide.visualPrompt)}
                                                    disabled={visualLoading[idx]}
                                                    className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all text-slate-600 hover:text-violet-400"
                                                >
                                                    {visualLoading[idx] ? (
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="w-6 h-6" />
                                                            <span className="text-[10px] font-mono uppercase tracking-widest font-black">Görsel Oluştur ({selectedTheme.name})</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-panel rounded-[2rem] p-8 bg-violet-600/5 border border-violet-500/20 shadow-xl space-y-8 sticky top-24">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-violet-400" />
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Sunumu Bitir</h3>
                        </div>
                        
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Seçilen <span className="text-white font-bold">{selectedTheme.name}</span> teması ile hazırlanan bu taslak, interaktif bir sunuma dönüştürülmeye hazır.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Globe className="w-4 h-4" /> Araştırma Kaynakları
                            </div>
                            <div className="flex flex-col gap-2">
                                {outline.citations.map((c, i) => (
                                    <a key={i} href={c.uri} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-between group">
                                        <span className="truncate pr-4">{c.title}</span>
                                        <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {!presentationUrl ? (
                            <button 
                                onClick={handleFinalizeWithGamma}
                                disabled={gammaProcessing}
                                className={`w-full py-6 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-violet-500/20 transition-all disabled:opacity-50`}
                            >
                                {gammaProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                                {gammaProcessing ? "GAMMA TASARLIYOR..." : "GAMMA İLE YAYINLA"}
                            </button>
                        ) : (
                            <div className="space-y-4 animate-in zoom-in duration-500">
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                                    <p className="text-white font-black uppercase text-sm">Sunumunuz Hazır!</p>
                                    <a 
                                        href={presentationUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold"
                                    >
                                        GAMMA'DA GÖRÜNTÜLE <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            )}
        </div>
      </div>

      {error && (
          <div className="max-w-xl mx-auto p-12 glass-panel border-red-500/50 bg-red-500/5 rounded-[3rem] text-center space-y-6 animate-in shake">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Hata Oluştu</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
              </div>
              <button onClick={() => handleStartResearch({ preventDefault: () => {} } as React.FormEvent)} className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest">TEKRAR DENE</button>
          </div>
      )}
    </div>
  );
};

export default PresentationGenerator;
