
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect } from 'react';
import { generateYoutubeInfographic } from '../services/geminiService';
import { Citation } from '../types';
import { Youtube, Loader2, Download, Sparkles, AlertCircle, Maximize, Smartphone, Monitor, RefreshCw, ShieldAlert, Lightbulb, Search, BookMarked, FileText, PlayCircle } from 'lucide-react';
import { LoadingState } from './LoadingState';
import ImageViewer from './ImageViewer';

const SKETCH_STYLES = [
    "Modern Editoryal",
    "Minimalist Beyaz",
    "Eğlenceli ve Canlı",
    "Koyu Mod Teknoloji",
    "Sinematik Analiz"
];

const LANGUAGES = [
  { label: "Türkçe (Türkiye)", value: "Turkish" },
  { label: "English (US)", value: "English" },
  { label: "Deutsch (Germany)", value: "German" },
  { label: "Español (Spain)", value: "Spanish" },
];

const YoutubeToInfographic: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("9:16");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("2K");
  const [selectedStyle, setSelectedStyle] = useState(SKETCH_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<{src: string, alt: string} | null>(null);

  // Geliştirilmiş Video ID yakalama mantığı
  const videoId = useMemo(() => {
    if (!urlInput) return null;
    const input = urlInput.trim();
    
    // Daha kapsamlı bir regex: Standart, shorts, embed, live ve youtu.be kısayollarını destekler
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i;
    const match = input.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }

    // Eğer kullanıcı sadece 11 karakterlik ID'yi girdiyse onu da kabul et
    if (input.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(input)) {
        return input;
    }

    return null;
  }, [urlInput]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId) {
        setError("Lütfen geçerli bir YouTube video linki girin.");
        return;
    }
    
    setLoading(true);
    setError(null);
    setImageData(null);
    setAnalysisText(null);
    setCitations([]);
    
    try {
      const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const result = await generateYoutubeInfographic(cleanUrl, selectedStyle, (s) => setLoadingStage(s), selectedLanguage, aspectRatio, imageSize);
      
      if (result && result.imageData) {
          setImageData(result.imageData);
          setAnalysisText(result.analysisText || null);
          setCitations(result.citations || []);
      }
    } catch (err: any) {
      setError(err.message || "Ajan transkript verisine ulaşamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 mb-24">
      {fullScreenImage && <ImageViewer src={fullScreenImage.src} alt={fullScreenImage.alt} onClose={() => setFullScreenImage(null)} />}

      <div className="text-center space-y-8 py-4">
        <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-tight">
          Öğrenme<span className="text-red-500">Ajanı</span>.
        </h2>
        <p className="text-slate-400 text-xl md:text-2xl font-light max-w-4xl mx-auto leading-relaxed">
          YouTube videolarını <span className="text-white font-bold italic">transkript odaklı</span> analiz ve görselleştirme ile çözün.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* SOL: IFRAME VE KONTROLLER */}
        <div className="glass-panel rounded-[3rem] p-8 md:p-10 space-y-8 bg-white/5 border border-white/20 shadow-neon-white h-fit">
            <form onSubmit={handleGenerate} className="space-y-8">
                <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500">
                        <Youtube className="w-8 h-8" />
                    </div>
                    <input 
                        type="text" 
                        value={urlInput} 
                        onChange={(e) => setUrlInput(e.target.value)} 
                        placeholder="YouTube Linkini Buraya Yapıştırın..." 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-3xl px-16 py-6 text-xl text-white placeholder:text-slate-700 focus:ring-4 focus:ring-red-500/20 outline-none font-bold" 
                    />
                </div>

                {/* IFRAME: Video ID varsa anında gösterilir */}
                <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl relative transition-all duration-500">
                    {videoId ? (
                        <iframe
                            className="w-full h-full animate-in fade-in duration-700"
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`}
                            title="YouTube Video Player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                            <PlayCircle className="w-16 h-16 opacity-20" />
                            <p className="text-xs font-mono uppercase tracking-widest text-center px-6 italic text-slate-500">Geçerli bir link girildiğinde video burada önizlenecek...</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] text-white/50 font-mono tracking-widest uppercase font-black">Ders Stili</label>
                        <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                            {SKETCH_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] text-white/50 font-mono tracking-widest uppercase font-black">İnfografik Kalite</label>
                        <select value={imageSize} onChange={(e) => setImageSize(e.target.value as any)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold text-orange-400">
                            <option value="1K">1K Standart</option>
                            <option value="2K">2K High Res</option>
                            <option value="4K">4K Ultra Agent</option>
                        </select>
                    </div>
                </div>

                <button type="submit" disabled={loading || !videoId} className="w-full py-6 bg-red-600 text-white hover:bg-red-700 rounded-[1.5rem] font-black transition-all disabled:opacity-50 flex items-center justify-center gap-4 font-mono text-lg tracking-widest uppercase shadow-xl relative overflow-hidden group">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                    {loading ? "AJAN TRANSKRİPTİ ÇIKARTIYOR..." : "VİDEOYU ANALİZ ET"}
                </button>
            </form>
        </div>

        {/* SAĞ: SONUÇLAR (TRANSKRİPT VE İNFOGRAFİK) */}
        <div className="space-y-8 h-full">
            {loading && <div className="py-20"><LoadingState message={loadingStage} type="article" /></div>}

            {imageData && !loading && (
                <div className="glass-panel rounded-[3rem] p-6 bg-white/5 border border-white/20 shadow-2xl overflow-hidden animate-in fade-in duration-1000">
                    <div className="px-6 py-6 flex flex-col md:flex-row items-center justify-between border-b border-white/10 mb-8 bg-white/5 rounded-t-[2rem] gap-4">
                        <div className="space-y-1 text-center md:text-left">
                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-[0.2em]">Agentic Öğrenme Raporu</h3>
                            <p className="text-[10px] text-emerald-500 font-mono uppercase font-black tracking-widest">VERİ DOĞRULANDI • {imageSize}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setFullScreenImage({src: `data:image/png;base64,${imageData}`, alt: "Video Analiz"})} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><Maximize className="w-5 h-6" /></button>
                            <a href={`data:image/png;base64,${imageData}`} download="video-analiz.png" className="bg-white text-slate-950 hover:bg-red-600 hover:text-white transition-all font-mono px-6 py-3 rounded-xl font-black text-xs shadow-lg flex items-center gap-2"><Download className="w-4 h-4" /> İNDİR</a>
                        </div>
                    </div>
                    
                    <div className={`rounded-[2rem] overflow-hidden bg-white shadow-2xl mx-auto ${aspectRatio === "9:16" ? "max-w-sm" : "max-w-full"}`}>
                        <img src={`data:image/png;base64,${imageData}`} alt="İnfografik" className="w-full h-auto block" />
                    </div>

                    {/* TRANSKRİPT VE ANALİZ ALANI */}
                    {analysisText && (
                         <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <FileText className="w-4 h-4" /> Çıkarılan Transkript & Eğitim Notları
                            </div>
                            <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/10 text-slate-400 text-xs leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar font-mono whitespace-pre-wrap italic">
                                {analysisText}
                            </div>
                         </div>
                    )}

                    {citations.length > 0 && (
                        <div className="mt-6 space-y-3 border-t border-white/5 pt-6">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <BookMarked className="w-3 h-3" /> Ajanın Doğruladığı Kaynaklar
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {citations.map((c, i) => (
                                    <a key={i} href={c.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                                        {c.title.substring(0, 25)}...
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="glass-panel border-red-500/50 p-8 rounded-[2.5rem] flex flex-col gap-8 bg-red-500/5 animate-in shake h-full justify-center">
                    <div className="flex items-center gap-4">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                        <div>
                            <p className="font-black text-2xl text-white uppercase tracking-tight">Analiz Hatası</p>
                            <p className="text-slate-400 text-sm italic">Video içeriğine ulaşılamadı.</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/10 space-y-4">
                        <div className="flex items-center gap-2 text-yellow-500 font-mono text-[10px] uppercase font-black">
                            <Lightbulb className="w-3 h-3" /> Çözüm Önerileri
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {error} <br/><br/>
                            Lütfen videonun "Herkese Açık" (Public) olduğundan emin olun. Bazı videolar embedding özelliğini kapatmış olabilir, ancak linkiniz doğru görünüyorsa ajanı tekrar görevlendirmeyi deneyebilirsiniz.
                        </p>
                    </div>

                    <button onClick={() => handleGenerate({ preventDefault: () => {} } as React.FormEvent)} className="w-full py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                        <RefreshCw className="w-5 h-5" /> TEKRAR DENE
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default YoutubeToInfographic;
