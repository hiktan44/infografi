
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect } from 'react';
import { generateYoutubeInfographic } from '../services/geminiService';
import { Citation } from '../types';
import { Youtube, Loader2, Download, Sparkles, AlertCircle, Palette, Globe, Maximize, Smartphone, Monitor, CheckCircle2, RefreshCw, Lock, Info, ExternalLink, Zap, Fingerprint, ShieldAlert, Lightbulb } from 'lucide-react';
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
  const [selectedStyle, setSelectedStyle] = useState(SKETCH_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<{src: string, alt: string} | null>(null);

  useEffect(() => {
    if (error) {
        setError(null);
        setErrorCode(null);
    }
  }, [urlInput]);

  // Ultra-Robust YouTube ID Çözücü
  const videoId = useMemo(() => {
    if (!urlInput) return null;
    
    const input = urlInput.trim();
    
    // Pattern 1: Standart v= ve youtu.be/ ID çekimi
    const standardRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i;
    const match = input.match(standardRegex);
    
    if (match && match[1]) return match[1];

    // Pattern 2: Sadece 11 haneli ID girilmişse
    if (input.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    
    return null;
  }, [urlInput]);

  // AI için temizlenmiş URL
  const cleanUrl = useMemo(() => {
    if (!videoId) return urlInput;
    return `https://www.youtube.com/watch?v=${videoId}`;
  }, [videoId, urlInput]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId) {
        setError("Lütfen geçerli bir YouTube video linki veya ID'si girin.");
        return;
    }
    
    setLoading(true);
    setError(null);
    setErrorCode(null);
    setImageData(null);
    setAnalysisText(null);
    
    try {
      console.log("Analyzing video:", cleanUrl);
      const result = await generateYoutubeInfographic(cleanUrl, selectedStyle, (s) => setLoadingStage(s), selectedLanguage, aspectRatio);
      
      if (result && result.imageData) {
          setImageData(result.imageData);
          setAnalysisText(result.analysisText || null);
          setCitations(result.citations || []);
      } else {
          throw new Error("Görsel oluşturma motoru yanıt vermedi.");
      }
    } catch (err: any) {
      console.error("Youtube Analysis Error:", err);
      // Hata kodunu ayıkla
      let userMessage = "Video analizi sırasında beklenmeyen bir hata oluştu.";
      let code = "UNKNOWN";

      if (err.message.includes("VIDEO_NOT_FOUND_IN_SEARCH")) {
          userMessage = "Video verileri Google üzerinde doğrulanamadı.";
          code = "NOT_FOUND";
      } else if (err.message.includes("INSUFFICIENT_DATA")) {
          userMessage = "Video hakkında görsel oluşturmak için yeterli veri toplanamadı.";
          code = "NO_DATA";
      } else if (err.message.includes("SAFETY")) {
          userMessage = "İçerik güvenlik filtrelerine takıldı.";
          code = "SAFETY";
      }

      setError(userMessage);
      setErrorCode(code);
    } finally {
      setLoading(false);
    }
  };

  const getErrorSuggestions = (code: string | null) => {
      if (code === "NOT_FOUND") {
          return [
              "Videonun 'Liste Dışı' (Unlisted) veya 'Gizli' olmadığından emin olun.",
              "Video çok yeniyse Google henüz indekslememiş olabilir.",
              "Video ID'sinin (URL sonundaki 11 hane) doğru olduğunu kontrol edin."
          ];
      }
      if (code === "NO_DATA") {
          return [
              "Bu video çok kısa (Shorts) veya hiç konuşma içermiyor olabilir.",
              "Videonun başlığı veya açıklaması çok yetersiz olabilir.",
              "Daha popüler veya içeriği zengin bir video deneyin."
          ];
      }
      return [
          "Farklı bir video linki deneyin.",
          "Sayfayı yenileyip tekrar deneyin.",
          "Video çok uzunsa (1 saat+) işlemesi zaman aşımına uğramış olabilir."
      ];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 mb-24">
      {fullScreenImage && <ImageViewer src={fullScreenImage.src} alt={fullScreenImage.alt} onClose={() => setFullScreenImage(null)} />}

      <div className="text-center space-y-8 py-4">
        <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-tight">
          Video<span className="text-red-500">Analiz</span>.
        </h2>
        <p className="text-slate-400 text-xl md:text-2xl font-light max-w-4xl mx-auto leading-relaxed">
          Gemini 3 Pro teknolojisi ile videoları <span className="text-white font-bold italic">Deep Grounding</span> yöntemiyle analiz edin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div className="glass-panel rounded-[3rem] p-8 md:p-12 space-y-8 bg-white/5 border border-white/20 shadow-neon-white h-fit">
            <form onSubmit={handleGenerate} className="space-y-8">
                <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500">
                        <Youtube className="w-8 h-8" />
                    </div>
                    <input 
                        type="text" 
                        value={urlInput} 
                        onChange={(e) => setUrlInput(e.target.value)} 
                        placeholder="Link yapıştırın (Örn: youtu.be/9tGv0ZS5Upw)" 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-3xl px-16 py-6 text-xl text-white placeholder:text-slate-700 focus:ring-4 focus:ring-red-500/20 outline-none font-bold" 
                    />
                    {videoId && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-md border border-white/10">
                            <Fingerprint className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-mono text-slate-300 tracking-wider">ID:{videoId}</span>
                        </div>
                    )}
                </div>

                <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl relative group">
                    {videoId ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                            <Youtube className="w-16 h-16 opacity-20" />
                            <p className="text-xs font-mono uppercase tracking-widest text-center px-6 italic text-slate-500">Video önizlemesi burada görünecek...</p>
                        </div>
                    )}
                    {videoId && (
                         <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-lg">
                            <CheckCircle2 className="w-3 h-3" /> HEDEF KİLİTLENDİ
                         </div>
                    )}
                </div>

                {videoId && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-200 leading-relaxed">
                            <strong>GELİŞMİŞ MOD:</strong> "Hata 153" veya "Videoyu YouTube'da izleyin" uyarısı alırsanız endişelenmeyin. AI motoru, <span className="font-bold text-white font-mono bg-white/10 px-1 rounded">ID:{videoId}</span> kodunu Google Veritabanında çapraz sorgulayarak doğru videonun içeriğini bulacak ve yanlış video analizini önleyecektir.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] text-white/50 font-mono tracking-widest flex items-center gap-2 uppercase font-black"><Palette className="w-3 h-3" /> Görsel Stil</label>
                        <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                            {SKETCH_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] text-white/50 font-mono tracking-widest flex items-center gap-2 uppercase font-black"><Globe className="w-3 h-3" /> Çıktı Dili</label>
                        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] text-white/50 font-mono tracking-widest flex items-center gap-2 uppercase font-black"><Monitor className="w-3 h-3" /> Format</label>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setAspectRatio("9:16")} className={`flex-1 py-3 rounded-xl text-[10px] font-mono border transition-all ${aspectRatio === "9:16" ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-white/5 text-slate-400 border-white/10'}`}><Smartphone className="w-4 h-4 mx-auto mb-1" /> DİKEY (MOBİL)</button>
                        <button type="button" onClick={() => setAspectRatio("16:9")} className={`flex-1 py-3 rounded-xl text-[10px] font-mono border transition-all ${aspectRatio === "16:9" ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-white/5 text-slate-400 border-white/10'}`}><Monitor className="w-4 h-4 mx-auto mb-1" /> YATAY (MASAÜSTÜ)</button>
                    </div>
                </div>

                <button type="submit" disabled={loading || !videoId} className="w-full py-6 bg-red-600 text-white hover:bg-red-700 rounded-[1.5rem] font-black transition-all disabled:opacity-50 flex items-center justify-center gap-4 font-mono text-lg tracking-widest uppercase shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                    {loading ? "ID DOĞRULANIYOR VE İŞLENİYOR..." : "DOĞRULANMIŞ VİDEOYU İŞLE"}
                </button>
            </form>
        </div>

        <div className="space-y-8 h-full">
            {loading && <div className="py-20"><LoadingState message={loadingStage} type="article" /></div>}

            {imageData && !loading && (
                <div className="glass-panel rounded-[3rem] p-6 bg-white/5 border border-white/20 shadow-2xl overflow-hidden animate-in fade-in duration-1000 h-full">
                    <div className="px-6 py-6 flex flex-col md:flex-row items-center justify-between border-b border-white/10 mb-8 bg-white/5 rounded-t-[2rem] gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-red-500" />
                                <h3 className="text-sm font-black text-white font-mono uppercase tracking-[0.2em]">Analiz Raporu Hazır</h3>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono uppercase">2K Ultra HD Poster • {selectedStyle}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setFullScreenImage({src: `data:image/png;base64,${imageData}`, alt: "Video İnfografik"})} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><Maximize className="w-5 h-6" /></button>
                            <a href={`data:image/png;base64,${imageData}`} download="video-analiz.png" className="bg-white text-slate-950 hover:bg-red-600 hover:text-white transition-all font-mono px-6 py-3 rounded-xl font-black text-xs shadow-lg flex items-center gap-2"><Download className="w-4 h-4" /> İNDİR</a>
                        </div>
                    </div>
                    
                    <div className={`w-full rounded-[2rem] overflow-hidden bg-white shadow-2xl mx-auto ${aspectRatio === "9:16" ? "max-w-sm" : "max-w-full"}`}>
                        <img src={`data:image/png;base64,${imageData}`} alt="Video İnfografik" className="w-full h-auto block hover:scale-[1.01] transition-transform duration-700" />
                    </div>

                    {analysisText && (
                         <div className="mt-8 p-8 bg-slate-950/50 rounded-3xl border border-white/10 space-y-6 shadow-inner">
                            <div className="flex items-center gap-3 text-red-400 font-mono text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-4">
                                <Info className="w-5 h-5" /> Çıkarılan İçerik Özeti (AI Deep Grounding)
                            </div>
                            <div className="text-slate-200 text-base md:text-lg leading-8 font-sans max-h-[500px] overflow-y-auto pr-4 custom-scrollbar whitespace-pre-wrap">
                                {analysisText}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="glass-panel border-red-500/50 p-8 rounded-3xl flex flex-col gap-6 bg-red-500/5 animate-in shake h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    
                    <div className="flex items-center gap-4 z-10">
                        <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                           <ShieldAlert className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-white">Analiz Tamamlanamadı</p>
                            <p className="text-slate-400 text-xs">{error}</p>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5 z-10">
                         <div className="flex items-center gap-2 text-yellow-400 font-mono text-[10px] uppercase tracking-widest mb-3">
                            <Lightbulb className="w-3 h-3" /> Olası Çözümler
                         </div>
                         <ul className="space-y-2">
                            {getErrorSuggestions(errorCode).map((suggestion, idx) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                    <span className="text-slate-600 mt-0.5">•</span> {suggestion}
                                </li>
                            ))}
                         </ul>
                    </div>

                    <button onClick={() => handleGenerate({ preventDefault: () => {} } as React.FormEvent)} className="flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all text-xs uppercase tracking-widest shadow-lg z-10">
                        <RefreshCw className="w-4 h-4" /> Tekrar Dene
                    </button>
                </div>
            )}

            {!imageData && !loading && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-panel rounded-[3rem] border-white/5 opacity-40">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Sparkles className="w-10 h-10 text-slate-700" />
                    </div>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest max-w-xs leading-relaxed text-center">
                        Video linkini yapıştırdığınızda AI, yerleştirme kısıtlamalarını Google Search üzerinden aşarak analizi başlatacaktır.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default YoutubeToInfographic;
