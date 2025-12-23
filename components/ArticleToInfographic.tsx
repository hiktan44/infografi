
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { generateArticleInfographic, generateInfographicFromFile, generateInfographicFromText } from '../services/geminiService';
import { Citation, ArticleHistoryItem } from '../types';
import { Link, Loader2, Download, Sparkles, AlertCircle, Palette, Globe, ExternalLink, Maximize, Upload, AlignLeft, Monitor, Smartphone, BookOpen, FileSearch } from 'lucide-react';
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
    "Koyu Mod Teknoloji"
];

const LANGUAGES = [
  { label: "Türkçe (Türkiye)", value: "Turkish" },
  { label: "English (US)", value: "English" },
  { label: "Deutsch (Germany)", value: "German" },
  { label: "Español (Spain)", value: "Spanish" },
];

const ArticleToInfographic: React.FC<ArticleToInfographicProps> = ({ history, onAddToHistory }) => {
  const [sourceType, setSourceType] = useState<'url' | 'file' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  // Default to 9:16 for Mobile First experience
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("9:16");
  const [fileData, setFileData] = useState<{ base64: string; mime: string; name: string; size: number } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(SKETCH_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('infografik');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullScreenImage, setFullScreenImage] = useState<{src: string, alt: string} | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageData(null);
    setAnalysisText(null);
    setCitations([]);
    
    try {
      let result;
      if (sourceType === 'url') {
          result = await generateArticleInfographic(urlInput, selectedStyle, (s) => setLoadingStage(s), selectedLanguage, aspectRatio);
          setDownloadName(urlInput.replace(/[^a-z0-9]/gi, '-').substring(0, 30));
      } else if (sourceType === 'file') {
          result = await generateInfographicFromFile(fileData!.base64, fileData!.mime, selectedStyle, (s) => setLoadingStage(s), selectedLanguage, aspectRatio);
          setDownloadName(fileData!.name.split('.')[0]);
      } else {
          result = await generateInfographicFromText(textInput, selectedStyle, (s) => setLoadingStage(s), selectedLanguage, aspectRatio);
          setDownloadName('metin-analizi');
      }
      
      if (result && result.imageData) {
          setImageData(result.imageData);
          setAnalysisText(result.analysisText || null);
          setCitations(result.citations || []);
      }
    } catch (err: any) {
      setError(err.message || "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 mb-24">
      {fullScreenImage && <ImageViewer src={fullScreenImage.src} alt={fullScreenImage.alt} onClose={() => setFullScreenImage(null)} />}

      <div className="text-center space-y-8 py-4">
        <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-tight">
          İnfografik<span className="text-orange-500">çi</span>.
        </h2>
        <p className="text-slate-400 text-xl md:text-2xl font-light max-w-4xl mx-auto leading-relaxed">
          İçeriğinizi <span className="text-white font-bold italic">derinlemesine analiz</span> ve profesyonel tasarımla buluşturun.
        </p>
      </div>

      <div className="flex justify-center -mb-8 relative z-20">
          <div className="bg-white/5 border border-white/20 p-2 rounded-[2rem] flex gap-2 shadow-neon-white backdrop-blur-3xl">
              <button onClick={() => setSourceType('url')} className={`px-10 py-4 rounded-2xl text-sm md:text-lg font-mono transition-all flex items-center gap-3 ${sourceType === 'url' ? 'bg-white text-slate-950 font-black scale-105 shadow-xl' : 'text-slate-400 hover:text-white'}`}><Link className="w-5 h-5" /> URL</button>
              <button onClick={() => setSourceType('file')} className={`px-10 py-4 rounded-2xl text-sm md:text-lg font-mono transition-all flex items-center gap-3 ${sourceType === 'file' ? 'bg-orange-500 text-white font-black scale-105 shadow-neon-orange' : 'text-slate-400 hover:text-white'}`}><Upload className="w-5 h-5" /> DOSYA</button>
              <button onClick={() => setSourceType('text')} className={`px-10 py-4 rounded-2xl text-sm md:text-lg font-mono transition-all flex items-center gap-3 ${sourceType === 'text' ? 'bg-white text-slate-950 font-black scale-105 shadow-xl' : 'text-slate-400 hover:text-white'}`}><AlignLeft className="w-5 h-5" /> METİN</button>
          </div>
      </div>

      <div className="glass-panel rounded-[3rem] p-8 md:p-16 space-y-12 relative z-10 pt-24 bg-white/5 border border-white/20 shadow-neon-white">
         <form onSubmit={handleGenerate} className="space-y-12">
            <div className="space-y-6">
                {sourceType === 'url' && (
                    <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Web sitesi veya makale URL'si" className="w-full bg-slate-950/50 border border-white/10 rounded-3xl px-8 py-6 text-2xl text-white placeholder:text-slate-700 focus:ring-4 focus:ring-white/20 outline-none font-bold" />
                )}
                {sourceType === 'file' && (
                    <div onClick={() => fileInputRef.current?.click()} className={`group relative w-full border-4 border-dashed rounded-[3rem] p-16 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 ${fileData ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 hover:border-white/30'}`}>
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setFileData({ base64: (reader.result as string).split(',')[1], mime: file.type, name: file.name, size: file.size });
                            reader.readAsDataURL(file);
                          }
                        }} className="hidden" accept=".pdf,.doc,.docx,image/*" />
                        {fileData ? <p className="text-white font-black text-2xl">{fileData.name}</p> : <p className="text-xl text-slate-400 font-medium">Dosya seçin veya sürükleyin</p>}
                    </div>
                )}
                {sourceType === 'text' && (
                    <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="İçeriği yapıştırın (Min. 300 kelime önerilir)..." className="w-full bg-slate-950/50 border border-white/10 rounded-3xl px-8 py-8 text-xl text-white h-[300px] resize-none outline-none font-medium" />
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-10">
                <div className="space-y-5">
                    <label className="text-xs text-white/50 font-mono tracking-widest flex items-center gap-3 uppercase font-black"><Monitor className="w-5 h-5 text-orange-400" /> Format</label>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setAspectRatio("9:16")} className={`flex-1 py-4 rounded-xl text-xs font-mono border-2 transition-all ${aspectRatio === "9:16" ? 'bg-orange-500 text-white border-orange-500 shadow-neon-orange' : 'bg-white/5 text-slate-400 border-white/10'}`}><Smartphone className="w-5 h-5 mx-auto mb-1" /> MOBİL (HİKAYE)</button>
                        <button type="button" onClick={() => setAspectRatio("16:9")} className={`flex-1 py-4 rounded-xl text-xs font-mono border-2 transition-all ${aspectRatio === "16:9" ? 'bg-orange-500 text-white border-orange-500 shadow-neon-orange' : 'bg-white/5 text-slate-400 border-white/10'}`}><Monitor className="w-5 h-5 mx-auto mb-1" /> YATAY (POST)</button>
                    </div>
                </div>
                <div className="space-y-5">
                    <label className="text-xs text-white/50 font-mono tracking-widest flex items-center gap-3 uppercase font-black"><Palette className="w-5 h-5 text-white" /> Stil</label>
                    <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-slate-900 border-2 border-white/10 rounded-xl px-6 py-4 text-lg text-white outline-none appearance-none cursor-pointer">
                        {SKETCH_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-5">
                    <label className="text-xs text-white/50 font-mono tracking-widest flex items-center gap-3 uppercase font-black"><Globe className="w-5 h-5 text-white" /> Dil</label>
                    <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full bg-slate-900 border-2 border-white/10 rounded-xl px-6 py-4 text-lg text-white outline-none appearance-none cursor-pointer">
                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-8 bg-white text-slate-950 hover:bg-orange-500 hover:text-white rounded-[2rem] font-black transition-all disabled:opacity-50 flex items-center justify-center gap-6 font-mono text-2xl tracking-widest uppercase shadow-2xl">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
                {loading ? "İÇERİK İŞLENİYOR..." : "ANALİZ ET VE OLUŞTUR"}
            </button>
         </form>
      </div>

      {error && (
        <div className="glass-panel border-red-500/50 p-10 rounded-3xl flex items-center gap-8 text-red-400 font-mono text-lg bg-red-500/5 shadow-xl animate-in shake">
          <AlertCircle className="w-8 h-8 flex-shrink-0 text-red-500" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {loading && <div className="py-20 scale-125"><LoadingState message={loadingStage} type="article" /></div>}

      {imageData && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-1000">
             {/* Analiz Metin Paneli */}
             <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel rounded-[2rem] p-8 border border-white/10 h-fit bg-slate-950/50">
                    <div className="flex items-center gap-3 text-orange-400 font-mono text-xs uppercase tracking-widest border-b border-white/10 pb-4 mb-6">
                        <FileSearch className="w-4 h-4" /> İçerik Analizi
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-sm italic">
                            {analysisText}
                        </div>
                    </div>
                </div>

                {citations.length > 0 && (
                    <div className="glass-panel rounded-[2rem] p-8 border border-white/10 bg-slate-950/50">
                        <div className="flex items-center gap-3 text-white/50 font-mono text-xs uppercase tracking-widest border-b border-white/10 pb-4 mb-6">
                            <BookOpen className="w-4 h-4" /> Kaynaklar
                        </div>
                        <div className="space-y-3">
                            {citations.map((cite, i) => (
                                <a key={i} href={cite.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
                                    <span className="text-slate-400 text-xs font-medium truncate pr-4">{cite.title}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-white shrink-0" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Görsel Paneli */}
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel rounded-[3rem] p-6 md:p-10 bg-white/5 border border-white/20 shadow-2xl overflow-hidden">
                    <div className="px-10 py-10 flex flex-col md:flex-row items-center justify-between border-b border-white/10 mb-10 bg-white/5 rounded-t-[3rem] gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-3 font-mono uppercase tracking-[0.2em]"><Sparkles className="w-6 h-6 text-orange-400" /> Tasarım</h3>
                            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">2K High Resolution • Smart Layout</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <button onClick={() => setFullScreenImage({src: `data:image/png;base64,${imageData}`, alt: "İnfografik"})} className="p-4 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><Maximize className="w-8 h-8" /></button>
                            <a href={`data:image/png;base64,${imageData}`} download={`${downloadName}.png`} className="flex items-center gap-4 bg-white text-slate-950 hover:bg-orange-500 hover:text-white transition-all font-mono px-12 py-6 rounded-2xl font-black text-lg shadow-xl"><Download className="w-6 h-6" /> İNDİR</a>
                        </div>
                    </div>
                    
                    <div className={`w-full rounded-[2.5rem] overflow-hidden bg-white shadow-2xl ${aspectRatio === "9:16" ? "max-w-xl mx-auto" : "max-w-full"}`}>
                        <img src={`data:image/png;base64,${imageData}`} alt="Sonuç" className="w-full h-auto object-contain block hover:scale-[1.01] transition-transform duration-700" />
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ArticleToInfographic;
