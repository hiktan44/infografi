/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { generateArticleInfographic, generateInfographicFromFile, generateInfographicFromText } from '../services/geminiService';
import { Citation, ArticleHistoryItem } from '../types';
import { Link, Loader2, Download, Sparkles, AlertCircle, Palette, Globe, ExternalLink, BookOpen, Clock, Maximize, Upload, FileText, X, Calendar, FileType, AlignLeft, Monitor, Smartphone } from 'lucide-react';
import { LoadingState } from './LoadingState';
import ImageViewer from './ImageViewer';

interface ArticleToInfographicProps {
    history: ArticleHistoryItem[];
    onAddToHistory: (item: ArticleHistoryItem) => void;
}

const SKETCH_STYLES = [
    "Modern Editoryal",
    "Minimalist Beyaz",
    "Eğlenceli ve Canlı",
    "Temiz Minimalist",
    "Koyu Mod Teknoloji",
    "Özel"
];

const LANGUAGES = [
  { label: "Türkçe (Türkiye)", value: "Turkish" },
  { label: "English (US)", value: "English" },
  { label: "German (Germany)", value: "German" },
  { label: "Spanish (Mexico)", value: "Spanish" },
  { label: "French (France)", value: "French" },
];

const ArticleToInfographic: React.FC<ArticleToInfographicProps> = ({ history, onAddToHistory }) => {
  const [sourceType, setSourceType] = useState<'url' | 'file' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("9:16");
  const [fileData, setFileData] = useState<{ base64: string; mime: string; name: string; size: number } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(SKETCH_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
  const [customStyle, setCustomStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('infografik');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullScreenImage, setFullScreenImage] = useState<{src: string, alt: string} | null>(null);

  const sanitizeFilename = (name: string) => {
      return name.toLowerCase()
          .replace(/[ğĞ]/g, 'g')
          .replace(/[üÜ]/g, 'u')
          .replace(/[şŞ]/g, 's')
          .replace(/[ıİ]/g, 'i')
          .replace(/[öÖ]/g, 'o')
          .replace(/[çÇ]/g, 'c')
          .replace(/[^a-z0-9]/gi, '-')
          .replace(/-+/g, '-')
          .substring(0, 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 15 * 1024 * 1024) {
              setError("Dosya boyutu 15MB limitini aşıyor.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              setFileData({ base64, mime: file.type, name: file.name, size: file.size });
              setError(null);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === 'url' && !urlInput.trim()) return;
    if (sourceType === 'file' && !fileData) return;
    if (sourceType === 'text' && !textInput.trim()) return;
    
    setLoading(true);
    setError(null);
    setImageData(null);
    setCitations([]);
    setLoadingStage('BAŞLATILIYOR...');

    // Determine download name
    let name = 'infografik';
    if (sourceType === 'url') {
        try { name = new URL(urlInput).hostname; } catch(e) { name = 'web-sayfasi'; }
    } else if (sourceType === 'file') {
        name = fileData?.name.split('.')[0] || 'dosya';
    } else {
        name = textInput.substring(0, 20);
    }
    setDownloadName(sanitizeFilename(name));

    try {
      const styleToUse = selectedStyle === 'Özel' ? customStyle : selectedStyle;
      let result;
      
      if (sourceType === 'url') {
          result = await generateArticleInfographic(urlInput, styleToUse, (stage) => setLoadingStage(stage), selectedLanguage, aspectRatio);
      } else if (sourceType === 'file') {
          result = await generateInfographicFromFile(fileData!.base64, fileData!.mime, styleToUse, (stage) => setLoadingStage(stage), selectedLanguage, aspectRatio);
      } else {
          result = await generateInfographicFromText(textInput, styleToUse, (stage) => setLoadingStage(stage), selectedLanguage, aspectRatio);
      }
      
      if (result && result.imageData) {
          setImageData(result.imageData);
          setCitations(result.citations || []);
      } else {
          throw new Error("İnfografik oluşturulamadı.");
      }
    } catch (err: any) {
      setError(err.message || "Beklenmedik bir hata oluştu.");
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 mb-24">
      
      {fullScreenImage && (
          <ImageViewer src={fullScreenImage.src} alt={fullScreenImage.alt} onClose={() => setFullScreenImage(null)} />
      )}

      {/* Hero Section */}
      <div className="text-center space-y-8 py-4">
        <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-tight">
          Site<span className="text-orange-500">Taslağı</span>.
        </h2>
        <p className="text-slate-400 text-xl md:text-3xl font-light max-w-4xl mx-auto">
          Daha uzun, daha detaylı ve <span className="text-white font-bold italic">telefonda mükemmel okunan</span> infografikler.
        </p>
      </div>

      {/* Source Selector Tabs */}
      <div className="flex justify-center -mb-8 relative z-20">
          <div className="bg-white/5 border border-white/20 p-2 rounded-[2rem] flex gap-2 shadow-neon-white backdrop-blur-3xl">
              <button 
                onClick={() => setSourceType('url')}
                className={`px-10 py-4 rounded-2xl text-sm md:text-lg font-mono transition-all flex items-center gap-3 ${sourceType === 'url' ? 'bg-white text-slate-950 font-black scale-105 shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                  <Link className="w-5 h-5" /> URL
              </button>
              <button 
                onClick={() => setSourceType('file')}
                className={`px-10 py-4 rounded-2xl text-sm md:text-lg font-mono transition-all flex items-center gap-3 ${sourceType === 'file' ? 'bg-orange-500 text-white font-black scale-105 shadow-neon-orange' : 'text-slate-400 hover:text-white'}`}
              >
                  <Upload className="w-5 h-5" /> DOSYA
              </button>
              <button 
                onClick={() => setSourceType('text')}
                className={`px-10 py-4 rounded-2xl text-sm md:text-lg font-mono transition-all flex items-center gap-3 ${sourceType === 'text' ? 'bg-white text-slate-950 font-black scale-105 shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                  <AlignLeft className="w-5 h-5" /> METİN
              </button>
          </div>
      </div>

      {/* Input Section */}
      <div className="glass-panel rounded-[3rem] p-8 md:p-16 space-y-12 relative z-10 pt-24 bg-white/5 border border-white/20 shadow-neon-white">
         <form onSubmit={handleGenerate} className="space-y-12">
            <div className="space-y-6">
                {sourceType === 'url' && (
                    <div className="relative">
                        <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="Makale URL'sini buraya yapıştırın"
                            className="w-full bg-slate-950/50 border border-white/10 rounded-3xl px-8 py-6 text-2xl text-white placeholder:text-slate-700 focus:ring-4 focus:ring-white/20 transition-all outline-none font-bold"
                        />
                    </div>
                )}

                {sourceType === 'file' && (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative w-full border-4 border-dashed rounded-[3rem] p-16 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 ${fileData ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 hover:border-white/30'}`}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx" />
                        {fileData ? (
                            <div className="text-center font-mono text-lg">
                                <p className="text-white font-black text-2xl mb-2">{fileData.name}</p>
                                <p className="text-orange-400 uppercase tracking-widest text-xs font-black">ANALİZE HAZIR</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Upload className="w-16 h-16 text-slate-500 mx-auto mb-6 group-hover:text-white transition-colors" />
                                <p className="text-xl text-slate-400 font-medium">Dosya seçin veya sürükleyin (PDF, DOCX, Resim)</p>
                                <p className="text-xs text-slate-600 mt-2 font-mono uppercase">Maksimum 15MB</p>
                            </div>
                        )}
                    </div>
                )}

                {sourceType === 'text' && (
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="İçeriği buraya yapıştırın..."
                        className="w-full bg-slate-950/50 border border-white/10 rounded-3xl px-8 py-8 text-xl text-white placeholder:text-slate-700 focus:ring-4 focus:ring-white/20 transition-all h-[400px] md:h-[500px] resize-none outline-none font-medium leading-relaxed"
                    />
                )}
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-3 gap-10">
                <div className="space-y-5">
                     <label className="text-xs text-white/50 font-mono tracking-widest flex items-center gap-3 uppercase font-black">
                        <Monitor className="w-5 h-5 text-orange-400" /> Görsel Formatı
                    </label>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setAspectRatio("9:16")} className={`flex-1 py-5 px-3 rounded-2xl text-xs font-mono border-2 transition-all ${aspectRatio === "9:16" ? 'bg-orange-500 text-white border-orange-500 shadow-neon-orange font-black scale-105' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'}`}>
                            <Smartphone className="w-6 h-6 mx-auto mb-2" /> DİKEY (MOBİL OKUMA)
                        </button>
                        <button type="button" onClick={() => setAspectRatio("16:9")} className={`flex-1 py-5 px-3 rounded-2xl text-xs font-mono border-2 transition-all ${aspectRatio === "16:9" ? 'bg-orange-500 text-white border-orange-500 shadow-neon-orange font-black scale-105' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'}`}>
                            <Monitor className="w-6 h-6 mx-auto mb-2" /> YATAY (SUNUM)
                        </button>
                    </div>
                </div>

                <div className="space-y-5">
                     <label className="text-xs text-white/50 font-mono tracking-widest flex items-center gap-3 uppercase font-black">
                        <Palette className="w-5 h-5 text-white" /> Tasarım Stili
                    </label>
                    <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl px-6 py-5 text-lg text-white focus:ring-4 focus:ring-white/20 outline-none font-black appearance-none cursor-pointer">
                        {SKETCH_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                 <div className="space-y-5">
                     <label className="text-xs text-white/50 font-mono tracking-widest flex items-center gap-3 uppercase font-black">
                        <Globe className="w-5 h-5 text-white" /> Çıktı Dili
                    </label>
                    <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl px-6 py-5 text-lg text-white focus:ring-4 focus:ring-white/20 outline-none font-black appearance-none cursor-pointer">
                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                 </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-8 bg-white text-slate-950 hover:bg-orange-500 hover:text-white rounded-[2rem] font-black transition-all disabled:opacity-50 flex items-center justify-center gap-6 font-mono text-2xl tracking-widest uppercase shadow-2xl active:scale-95 group"
            >
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />}
                {loading ? "İŞLENİYOR..." : "TASLAĞI OLUŞTUR"}
            </button>
         </form>
      </div>

      {error && (
        <div className="glass-panel border-red-500/50 p-10 rounded-3xl flex items-center gap-8 text-red-400 font-mono text-lg bg-red-500/5 shadow-xl animate-in shake">
          <AlertCircle className="w-8 h-8 flex-shrink-0 text-red-500" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {loading && (
          <div className="py-20 scale-125">
              <LoadingState message={loadingStage} type="article" />
          </div>
      )}

      {/* Result Section - Responsive & High Visibility */}
      {imageData && !loading && (
        <div className="glass-panel rounded-[4rem] p-6 md:p-12 animate-in fade-in duration-1000 bg-white/5 border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-10 py-10 flex flex-col md:flex-row items-center justify-between border-b border-white/10 mb-10 bg-white/5 rounded-t-[3rem] gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-3 font-mono uppercase tracking-[0.2em]">
                      <Sparkles className="w-6 h-6 text-orange-400" /> Analiz Tamamlandı
                    </h3>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">2 Sayfa Derinliğinde • Ultra Büyük Yazı Tipi • 2K HD</p>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => setFullScreenImage({src: `data:image/png;base64,${imageData}`, alt: "İnfografik"})} className="p-4 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/20">
                        <Maximize className="w-8 h-8" />
                    </button>
                    <a href={`data:image/png;base64,${imageData}`} download={`${downloadName}.png`} className="flex items-center gap-4 bg-white text-slate-950 hover:bg-orange-500 hover:text-white transition-all font-mono px-12 py-6 rounded-2xl font-black text-lg shadow-xl active:scale-95">
                        <Download className="w-6 h-6" /> PNG İNDİR
                    </a>
                </div>
            </div>
            
            <div className={`w-full rounded-[2.5rem] overflow-hidden bg-white shadow-[0_0_100px_rgba(255,255,255,0.05)] ${aspectRatio === "9:16" ? "max-w-3xl mx-auto" : "max-w-full"}`}>
                <img 
                    src={`data:image/png;base64,${imageData}`} 
                    alt="Oluşturulan İnfografik" 
                    className="w-full h-auto object-contain block hover:scale-[1.02] transition-transform duration-1000" 
                />
            </div>

            <div className="mt-12 p-10 bg-slate-950/50 rounded-[2.5rem] border border-white/5 text-center">
                <p className="text-lg font-mono text-slate-400 tracking-wide uppercase">
                    İnfografik tek parça ama <span className="text-white font-bold">"iki sayfa"</span> içeriğine sahip olacak şekilde dikey olarak uzatılmıştır. Telefonda en iyi sonuç için indirdikten sonra tam ekran inceleyin.
                </p>
            </div>
        </div>
      )}
    </div>
  );
};

export default ArticleToInfographic;