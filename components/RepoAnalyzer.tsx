/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { fetchRepoFileTree } from '../services/githubService';
import { generateInfographic } from '../services/geminiService';
import { RepoFileTree, ViewMode, RepoHistoryItem } from '../types';
import { AlertCircle, Loader2, Layers, Box, Download, Sparkles, Command, Palette, Globe, Clock, Maximize, KeyRound, Smartphone, Monitor } from 'lucide-react';
import { LoadingState } from './LoadingState';
import ImageViewer from './ImageViewer';

interface RepoAnalyzerProps {
  onNavigate: (mode: ViewMode, data?: any) => void;
  history: RepoHistoryItem[];
  onAddToHistory: (item: RepoHistoryItem) => void;
}

const FLOW_STYLES = [
    "Modern Veri Akışı",
    "El Çizimi Blueprint",
    "Kurumsal Beyaz",
    "Neon Siberpunk",
    "Özel"
];

const LANGUAGES = [
  { label: "Türkçe (Türkiye)", value: "Turkish" },
  { label: "English (US)", value: "English" },
  { label: "Deutsch (Germany)", value: "German" },
];

const RepoAnalyzer: React.FC<RepoAnalyzerProps> = ({ onNavigate, history, onAddToHistory }) => {
  const [repoInput, setRepoInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(FLOW_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>('');
  
  const [infographicData, setInfographicData] = useState<string | null>(null);
  const [infographic3DData, setInfographic3DData] = useState<string | null>(null);
  const [generating3D, setGenerating3D] = useState(false);
  const [currentFileTree, setCurrentFileTree] = useState<RepoFileTree[] | null>(null);
  const [currentRepoName, setCurrentRepoName] = useState<string>('');
  
  const [fullScreenImage, setFullScreenImage] = useState<{src: string, alt: string} | null>(null);

  const parseRepoInput = (input: string): { owner: string, repo: string } | null => {
    const cleanInput = input.trim().replace(/\/$/, '');
    try {
      const url = new URL(cleanInput);
      if (url.hostname === 'github.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
      }
    } catch (e) { }
    const parts = cleanInput.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) return { owner: parts[0], repo: parts[1] };
    return null;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfographicData(null);
    setInfographic3DData(null);

    const repoDetails = parseRepoInput(repoInput);
    if (!repoDetails) {
      setError('Geçersiz format. "kullanici/depo" kullanın.');
      return;
    }

    setLoading(true);
    setCurrentRepoName(repoDetails.repo);
    try {
      setLoadingStage('GITHUB\'A BAĞLANILIYOR');
      const fileTree = await fetchRepoFileTree(repoDetails.owner, repoDetails.repo);
      if (fileTree.length === 0) throw new Error('İlgili dosya bulunamadı.');
      setCurrentFileTree(fileTree);

      setLoadingStage('ANALİZ EDİLİYOR VE OLUŞTURULUYOR');
      const data = await generateInfographic(repoDetails.repo, fileTree, selectedStyle, false, selectedLanguage, aspectRatio);
      if (data) setInfographicData(data);
      else throw new Error("Görsel oluşturulamadı.");
    } catch (err: any) {
      setError(err.message || 'Hata oluştu.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleGenerate3D = async () => {
    if (!currentFileTree || !currentRepoName) return;
    setGenerating3D(true);
    try {
      const data = await generateInfographic(currentRepoName, currentFileTree, selectedStyle, true, selectedLanguage, "16:9");
      if (data) setInfographic3DData(data);
    } catch (err: any) {
      setError(err.message || '3D hata oluştu.');
    } finally {
      setGenerating3D(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 mb-24">
      
      {fullScreenImage && (
          <ImageViewer src={fullScreenImage.src} alt={fullScreenImage.alt} onClose={() => setFullScreenImage(null)} />
      )}

      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Depo <span className="text-orange-500">Mimarisi</span>.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-light">
          Teknik akışları 2K yüksek çözünürlükle haritalayın.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto relative z-10">
        <form onSubmit={handleAnalyze} className="glass-panel rounded-2xl p-2 bg-white/5 border border-white/20 transition-all focus-within:ring-2 focus-within:ring-white shadow-2xl">
          <div className="flex items-center">
             <div className="pl-4 text-white/40">
                <Command className="w-5 h-5" />
             </div>
             <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="kullanici/depo"
                className="w-full bg-transparent border-none text-white placeholder:text-slate-700 focus:ring-0 text-lg px-4 py-3 font-mono font-bold"
              />
              <button
                type="submit"
                disabled={loading || !repoInput.trim()}
                className="px-6 py-3 bg-white text-slate-950 hover:bg-orange-500 hover:text-white rounded-xl font-black transition-all disabled:opacity-50 font-mono text-xs tracking-widest uppercase shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ANALİZ_ET"}
              </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 px-4 pb-2 grid md:grid-cols-2 gap-4">
             <div className="space-y-3">
                 <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest font-black">Görsel Stil</div>
                 <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                     {FLOW_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
             </div>

             <div className="space-y-3">
                 <div className="text-[10px] text-orange-400 font-mono uppercase tracking-widest font-black">Format & Dil</div>
                 <div className="flex gap-2">
                    <button type="button" onClick={() => setAspectRatio("9:16")} className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-mono border transition-all ${aspectRatio === "9:16" ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                        DİKEY
                    </button>
                    <button type="button" onClick={() => setAspectRatio("16:9")} className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-mono border transition-all ${aspectRatio === "16:9" ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                        YATAY
                    </button>
                 </div>
             </div>
          </div>
        </form>
      </div>

      {loading && <LoadingState message={loadingStage} type="repo" />}

      {infographicData && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel rounded-3xl p-2 bg-white/5 border border-white/20 shadow-2xl">
                 <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 mb-2">
                    <h3 className="text-[10px] font-black text-white font-mono uppercase tracking-[0.2em]">Diyagram (2K)</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setFullScreenImage({src: `data:image/png;base64,${infographicData}`, alt: "Diyagram"})} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                        <Maximize className="w-4 h-4" />
                      </button>
                      <a href={`data:image/png;base64,${infographicData}`} download={`${currentRepoName}-mimari.png`} className="bg-white text-slate-950 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase">İNDİR</a>
                    </div>
                </div>
                <div className={`rounded-xl overflow-hidden bg-white mx-auto ${aspectRatio === "9:16" ? "max-w-xs" : "max-w-full"}`}>
                    <img src={`data:image/png;base64,${infographicData}`} alt="Diyagram" className="w-full h-auto block" />
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-2 bg-white/5 border border-white/20 shadow-2xl flex flex-col">
                 <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 mb-2">
                    <h3 className="text-[10px] font-black text-white font-mono uppercase tracking-[0.2em]">Holografik Model (3D)</h3>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden bg-slate-950/50 relative flex items-center justify-center min-h-[300px]">
                  {infographic3DData ? (
                      <img src={`data:image/png;base64,${infographic3DData}`} alt="3D" className="w-full h-auto object-contain p-4" />
                  ) : generating3D ? (
                    <div className="text-center space-y-4">
                         <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                         <p className="text-[10px] text-orange-400 font-mono animate-pulse uppercase">Oluşturuluyor...</p>
                    </div>
                  ) : (
                    <button onClick={handleGenerate3D} className="px-8 py-3 bg-orange-500 text-white rounded-xl font-black transition-all flex items-center gap-2 font-mono text-xs shadow-lg uppercase">
                      <Sparkles className="w-4 h-4" /> 3D_MODEL_OLUŞTUR
                    </button>
                  )}
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoAnalyzer;