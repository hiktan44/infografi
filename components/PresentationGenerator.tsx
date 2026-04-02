
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { generatePresentationOutline, generateSlideVisual, PresentationOutline } from '../services/geminiService';
import { Layout, Search, Loader2, Sparkles, ChevronRight, CheckCircle2, Globe, FileText, Share2, ExternalLink, ImageIcon, Palette, Check, Play, X } from 'lucide-react';
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
  const [slideCount, setSlideCount] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<PresentationOutline | null>(null);
  const [slideVisuals, setSlideVisuals] = useState<Record<number, string>>({});
  const [visualLoading, setVisualLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleGenerateVisual = async (index: number, visualPrompt: string, themeStyle: string) => {
      setVisualLoading(prev => ({ ...prev, [index]: true }));
      try {
          const imageData = await generateSlideVisual(visualPrompt, themeStyle);
          if (imageData) {
              setSlideVisuals(prev => ({ ...prev, [index]: imageData }));
          }
      } catch (err) {
          console.error("Görsel oluşturulamadı", err);
      } finally {
          setVisualLoading(prev => ({ ...prev, [index]: false }));
      }
  };

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !file) return;

    setLoading(true);
    setError(null);
    setOutline(null);
    setSlideVisuals({});
    setIsPlaying(false);

    try {
      let fileBase64: string | undefined;
      let mimeType: string | undefined;

      if (file) {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
          }
          fileBase64 = window.btoa(binary);
          mimeType = file.type;
      }

      const result = await generatePresentationOutline(topic, slideCount, fileBase64, mimeType);
      setOutline(result);
      
      // Auto-generate visuals
      result.slides.forEach((slide, idx) => {
          handleGenerateVisual(idx, slide.visualPrompt, selectedTheme.style);
      });

    } catch (err: any) {
      setError(err.message || "Sunum araştırması sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (isPlaying && outline) {
      const slide = outline.slides[currentSlide];
      const visual = slideVisuals[currentSlide];
      
      return (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500">
              <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                  {visual && (
                      <img src={`data:image/png;base64,${visual}`} alt="Slide Background" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
                  
                  <div className="relative z-10 max-w-6xl w-full p-8 md:p-16 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight drop-shadow-2xl leading-tight">{slide.title}</h1>
                      <p className="text-2xl md:text-3xl lg:text-4xl text-slate-200 font-light leading-relaxed drop-shadow-lg max-w-4xl">{slide.content}</p>
                      <ul className="space-y-6 mt-12">
                          {slide.keyPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-6 text-xl md:text-2xl lg:text-3xl text-white font-medium drop-shadow-md max-w-4xl">
                                  <div className="w-4 h-4 mt-2.5 rounded-full bg-violet-500 shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.8)]" />
                                  <span>{point}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
              
              <div className="h-24 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-8 shrink-0">
                  <button 
                      onClick={() => setIsPlaying(false)}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                  >
                      <X className="w-5 h-5" /> Kapat
                  </button>
                  
                  <div className="flex items-center gap-6">
                      <button 
                          onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                          disabled={currentSlide === 0}
                          className="p-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-2xl transition-all text-white"
                      >
                          <ChevronRight className="w-8 h-8 rotate-180" />
                      </button>
                      <span className="text-white font-mono font-bold text-xl">{currentSlide + 1} / {outline.slides.length}</span>
                      <button 
                          onClick={() => setCurrentSlide(prev => Math.min(outline.slides.length - 1, prev + 1))}
                          disabled={currentSlide === outline.slides.length - 1}
                          className="p-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-2xl transition-all text-white"
                      >
                          <ChevronRight className="w-8 h-8" />
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 mb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-6">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Nano <span className="text-violet-500">Banana</span> Sunum.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
          Gemini 3 Flash ile araştırın, <span className="text-white font-bold italic">Gemini 3.1 Flash Image Preview</span> ile görselleştirin ve anında sunun.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Theme Selector */}
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
                * Seçtiğiniz tema, oluşturulacak slayt görsellerinin stilini ve sunum tasarımını doğrudan etkiler.
            </div>
        </div>

        {/* Right Side: Generator Interface */}
        <div className="flex-1 space-y-8">
            <div className="max-w-3xl mx-auto lg:mx-0 w-full">
                <form onSubmit={handleStartResearch} className="glass-panel rounded-3xl p-2 bg-white/5 border border-white/20 shadow-2xl focus-within:ring-2 focus-within:ring-violet-500/50 transition-all">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 p-2">
                            <div className="pl-4 text-violet-500">
                                <Layout className="w-6 h-6" />
                            </div>
                            <input 
                                type="text" 
                                value={topic} 
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Konu, metin veya web sitesi URL'si girin..." 
                                className="w-full bg-transparent border-none text-white placeholder:text-slate-700 focus:ring-0 text-xl px-2 py-4 font-bold"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pb-4 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Slayt Sayısı:</span>
                                    <select 
                                        value={slideCount} 
                                        onChange={(e) => setSlideCount(Number(e.target.value))}
                                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
                                    >
                                        <option value={3}>3 Slayt</option>
                                        <option value={5}>5 Slayt</option>
                                        <option value={7}>7 Slayt</option>
                                        <option value={10}>10 Slayt</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Dosya (Opsiyonel):</span>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="text-[10px] text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-violet-500/20 file:text-violet-400 hover:file:bg-violet-500/30 w-48"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading || (!topic.trim() && !file)}
                                className="w-full sm:w-auto px-8 py-3 bg-violet-600 text-white hover:bg-violet-500 rounded-xl font-black transition-all disabled:opacity-50 font-mono text-xs tracking-widest uppercase shadow-lg"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "SUNUM_ÜRET"}
                            </button>
                        </div>
                    </div>
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
                                                        <p className="text-[10px] text-white font-mono uppercase tracking-widest font-black">Gemini 3.1 Flash Image • {selectedTheme.name}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white/5 text-slate-500">
                                                    {visualLoading[idx] ? (
                                                        <>
                                                            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                                                            <span className="text-[10px] font-mono uppercase tracking-widest font-black text-violet-400">Görsel Üretiliyor...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="w-6 h-6" />
                                                            <span className="text-[10px] font-mono uppercase tracking-widest font-black">Görsel Bekleniyor</span>
                                                        </>
                                                    )}
                                                </div>
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
                            <Play className="w-6 h-6 text-violet-400" />
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Sunumu Oynat</h3>
                        </div>
                        
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Seçilen <span className="text-white font-bold">{selectedTheme.name}</span> teması ile hazırlanan sunumunuzu tam ekran oynatabilirsiniz.
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
                                {outline.citations.length === 0 && (
                                    <div className="text-xs text-slate-500 italic">Kaynak bulunamadı.</div>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => { setIsPlaying(true); setCurrentSlide(0); }}
                            disabled={Object.keys(slideVisuals).length < outline.slides.length}
                            className={`w-full py-6 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-violet-500/20 transition-all disabled:opacity-50`}
                        >
                            {Object.keys(slideVisuals).length < outline.slides.length ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                            {Object.keys(slideVisuals).length < outline.slides.length ? "GÖRSELLER HAZIRLANIYOR..." : "SUNUMU BAŞLAT"}
                        </button>
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
