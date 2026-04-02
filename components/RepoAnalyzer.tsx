
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { fetchRepoFileTree } from '../services/githubService';
// Remove non-existent import generateRepoFunctionalInfographic
import { generateInfographic, analyzeRepoFeatures, generatePurposeInfographic } from '../services/geminiService';
import { RepoFileTree, ViewMode, RepoHistoryItem, DataFlowGraph, D3Node, D3Link } from '../types';
import { AlertCircle, Loader2, Layers, Box, Download, Sparkles, Command, Palette, Globe, Clock, Maximize, KeyRound, Smartphone, Monitor, Terminal, Code2, Cpu, Rocket, ChevronRight, Github, Info } from 'lucide-react';
import { LoadingState } from './LoadingState';
import ImageViewer from './ImageViewer';

interface RepoAnalyzerProps {
  onNavigate: (mode: ViewMode, data?: any) => void;
  history: RepoHistoryItem[];
  onAddToHistory: (item: RepoHistoryItem) => void;
}

const FLOW_STYLES = [
    "Siyah Neon (Önerilen)",
    "Modern Veri Akışı",
    "El Çizimi Blueprint",
    "Kurumsal Beyaz",
    "Neon Siberpunk",
    "Özel"
];

const RepoAnalyzer: React.FC<RepoAnalyzerProps> = ({ onNavigate, history, onAddToHistory }) => {
  const [repoInput, setRepoInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(FLOW_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState("Turkish");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("2K");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>('');
  
  const [infographicData, setInfographicData] = useState<string | null>(null);
  const [purposeInfographicData, setPurposeInfographicData] = useState<string | null>(null);
  const [repoFeatures, setRepoFeatures] = useState<string | null>(null);
  const [currentFileTree, setCurrentFileTree] = useState<RepoFileTree[] | null>(null);
  const [currentRepoName, setCurrentRepoName] = useState<string>('');
  const [graphData, setGraphData] = useState<DataFlowGraph | null>(null);
  
  const [fullScreenImage, setFullScreenImage] = useState<{src: string, alt: string} | null>(null);

  const parseRepoInput = (input: string): { owner: string, repo: string } | null => {
    let cleanInput = input.trim().replace(/\/$/, '');
    
    // Handle full URLs
    try {
      if (cleanInput.startsWith('http')) {
        const url = new URL(cleanInput);
        if (url.hostname.includes('github.com')) {
          const parts = url.pathname.split('/').filter(Boolean);
          if (parts.length >= 2) {
            return { 
                owner: parts[0], 
                repo: parts[1].replace(/\.git$/, '') 
            };
          }
        }
      }
    } catch (e) { }

    // Handle owner/repo format
    const parts = cleanInput.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) {
        return { 
            owner: parts[0], 
            repo: parts[1].replace(/\.git$/, '') 
        };
    }
    
    return null;
  };

  const generateLocalGraphData = (repoName: string, files: RepoFileTree[]): DataFlowGraph => {
      const nodes: D3Node[] = [{ id: 'root', label: repoName, group: 0 }];
      const links: D3Link[] = [];
      
      const folders = new Set<string>();
      files.slice(0, 50).forEach((file, idx) => {
          const parts = file.path.split('/');
          const fileName = parts.pop() || '';
          const folderPath = parts.join('/') || 'src';
          
          if (!folders.has(folderPath)) {
              folders.add(folderPath);
              nodes.push({ id: folderPath, label: folderPath, group: 1 });
              links.push({ source: 'root', target: folderPath, value: 2 });
          }
          
          nodes.push({ id: file.path, label: fileName, group: 2 });
          links.push({ source: folderPath, target: file.path, value: 1 });
      });
      
      return { nodes, links };
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfographicData(null);
    setPurposeInfographicData(null);
    setRepoFeatures(null);
    setGraphData(null);

    const repoDetails = parseRepoInput(repoInput);
    if (!repoDetails) {
      setError('Geçersiz format. "kullanici/depo" veya GitHub linki girin.');
      return;
    }

    setLoading(true);
    setCurrentRepoName(repoDetails.repo);
    try {
      setLoadingStage('GITHUB API BAĞLANTISI KURULUYOR');
      const fileTree = await fetchRepoFileTree(repoDetails.owner, repoDetails.repo);
      if (fileTree.length === 0) throw new Error('Repository boş veya kod dosyası içermiyor.');
      setCurrentFileTree(fileTree);

      setLoadingStage('MİMARİ YAPAY ZEKA TARAFINDAN ÇÖZÜMLENİYOR');
      
      // Force "is3D" to be true for the requested dark 3D effect
      const [imgData, featuresText, purposeImgData] = await Promise.all([
          generateInfographic(repoDetails.repo, fileTree, selectedStyle, true, selectedLanguage, aspectRatio, imageSize),
          analyzeRepoFeatures(repoDetails.repo, fileTree, selectedLanguage),
          generatePurposeInfographic(repoDetails.repo, fileTree, selectedStyle, selectedLanguage, aspectRatio, imageSize)
      ]);

      if (imgData) {
          setInfographicData(imgData);
          setPurposeInfographicData(purposeImgData);
          setRepoFeatures(featuresText);
          const generatedGraph = generateLocalGraphData(repoDetails.repo, fileTree);
          setGraphData(generatedGraph);
          
          onAddToHistory({
              id: Date.now().toString(),
              repoName: repoDetails.repo,
              imageData: imgData,
              is3D: true,
              style: selectedStyle,
              date: new Date()
          });
      } else {
          throw new Error("Görselleştirme oluşturulamadı. Lütfen API anahtarınızın Pro/Ücretli bir proje olduğunu kontrol edin.");
      }

    } catch (err: any) {
      setError(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleGoToStudio = () => {
    if (graphData && currentFileTree) {
      onNavigate(ViewMode.DEV_STUDIO, {
          repoName: currentRepoName,
          fileTree: currentFileTree,
          graphData: graphData
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 mb-24">
      {fullScreenImage && <ImageViewer src={fullScreenImage.src} alt={fullScreenImage.alt} onClose={() => setFullScreenImage(null)} />}

      <div className="text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Repo <span className="text-orange-500">Mimarı</span>.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-light">
          Gemini 3 Pro ile kod tabanınızı <span className="text-white font-bold italic">4K teknik haritalara</span> dönüştürün.
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <form onSubmit={handleAnalyze} className="glass-panel rounded-3xl p-3 bg-white/5 border border-white/20 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-orange-500/50">
          <div className="flex items-center gap-2">
             <div className="pl-4 text-orange-500">
                <Github className="w-6 h-6" />
             </div>
             <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="facebook/react veya github.com/owner/repo"
                className="w-full bg-transparent border-none text-white placeholder:text-slate-700 focus:ring-0 text-xl px-4 py-4 font-mono font-bold"
              />
              <button
                type="submit"
                disabled={loading || !repoInput.trim()}
                className="px-8 py-4 bg-orange-600 text-white hover:bg-orange-500 rounded-2xl font-black transition-all disabled:opacity-50 font-mono text-sm tracking-widest uppercase shrink-0 shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ANALİZ_ET"}
              </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 px-4 pb-2 grid md:grid-cols-2 gap-6">
             <div className="space-y-3">
                 <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest font-black flex items-center gap-2">
                     <Palette className="w-3 h-3" /> Görsel Stil
                 </div>
                 <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                     {FLOW_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
             </div>

             <div className="space-y-3">
                 <div className="text-[10px] text-orange-400 font-mono uppercase tracking-widest font-black flex items-center gap-2">
                     <Maximize className="w-3 h-3" /> Kalite Modu
                 </div>
                 <div className="flex gap-2">
                    <select value={imageSize} onChange={(e) => setImageSize(e.target.value as any)} className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold flex-1">
                        <option value="1K">1K Standart</option>
                        <option value="2K">2K High Def</option>
                        <option value="4K">4K Ultra HD</option>
                    </select>
                    <div className="flex gap-1">
                        <button type="button" onClick={() => setAspectRatio("9:16")} className={`p-3 rounded-xl border transition-all ${aspectRatio === "9:16" ? 'bg-orange-600 border-orange-500' : 'bg-white/5 border-white/10 text-slate-500'}`} title="Dikey Mobile">
                            <Smartphone className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => setAspectRatio("16:9")} className={`p-3 rounded-xl border transition-all ${aspectRatio === "16:9" ? 'bg-orange-600 border-orange-500' : 'bg-white/5 border-white/10 text-slate-500'}`} title="Yatay Masaüstü">
                            <Monitor className="w-5 h-5" />
                        </button>
                    </div>
                 </div>
             </div>
          </div>
        </form>
      </div>

      {loading && <div className="py-20"><LoadingState message={loadingStage} type="repo" /></div>}

      {infographicData && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel rounded-[2.5rem] p-8 bg-slate-950/50 border border-white/10 shadow-xl space-y-8">
                   <div className="flex items-center justify-between border-b border-white/5 pb-6">
                       <div className="flex items-center gap-3">
                           <Code2 className="w-6 h-6 text-orange-500" />
                           <h3 className="text-xl font-black text-white uppercase tracking-tight">Mimari Rapor</h3>
                       </div>
                   </div>
                   
                   <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans italic opacity-80">
                       {repoFeatures}
                   </div>

                   <button 
                    onClick={handleGoToStudio}
                    className="w-full py-6 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-orange-500/10 transition-all group"
                   >
                       <Terminal className="w-5 h-5 group-hover:rotate-12 transition-transform" /> DEV_STUDIO'YU AÇ <ChevronRight className="w-5 h-5" />
                </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                  <div className="glass-panel rounded-[3rem] p-4 bg-white/5 border border-white/20 shadow-2xl relative group">
                    <div className="absolute top-8 right-8 flex gap-3 z-10">
                        <button onClick={() => setFullScreenImage({src: `data:image/png;base64,${infographicData}`, alt: "Mimari Diyagram"})} className="p-4 bg-black/60 backdrop-blur-md rounded-2xl text-white border border-white/10 hover:bg-orange-600 transition-all">
                            <Maximize className="w-6 h-6" />
                        </button>
                        <a href={`data:image/png;base64,${infographicData}`} download={`${currentRepoName}-mimari.png`} className="p-4 bg-white text-slate-950 rounded-2xl font-black hover:bg-orange-600 hover:text-white transition-all">
                            <Download className="w-6 h-6" />
                        </a>
                    </div>
                    
                    <div className={`rounded-[2rem] overflow-hidden bg-white mx-auto shadow-2xl ${aspectRatio === "9:16" ? "max-w-sm" : "max-w-full"}`}>
                        <img src={`data:image/png;base64,${infographicData}`} alt="Diyagram" className="w-full h-auto block" />
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-8 py-4 border-t border-white/5">
                         <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                            <Cpu className="w-4 h-4 text-orange-500" /> GEMINI_3_PRO_ULTRA_HD
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                            <Rocket className="w-4 h-4 text-orange-500" /> ARCH_MAPPING_VERIFIED
                         </div>
                    </div>
                  </div>
              </div>
          </div>

          {purposeInfographicData && (
              <div className="glass-panel rounded-[3rem] p-8 bg-white/5 border border-white/20 shadow-2xl relative group">
                  <div className="absolute top-12 right-12 flex gap-3 z-10">
                      <button onClick={() => setFullScreenImage({src: `data:image/png;base64,${purposeInfographicData}`, alt: "Proje Amacı İnfografiği"})} className="p-4 bg-black/60 backdrop-blur-md rounded-2xl text-white border border-white/10 hover:bg-orange-600 transition-all">
                          <Maximize className="w-6 h-6" />
                      </button>
                      <a href={`data:image/png;base64,${purposeInfographicData}`} download={`${currentRepoName}-amaci.png`} className="p-4 bg-white text-slate-950 rounded-2xl font-black hover:bg-orange-600 hover:text-white transition-all">
                          <Download className="w-6 h-6" />
                      </a>
                  </div>
                  <div className="text-center mb-8">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight">Projenin Amacı ve İşlevi</h3>
                      <p className="text-slate-400 mt-2 font-mono text-sm">Bu depo ne işe yarıyor ve temel özellikleri neler?</p>
                  </div>
                  <div className={`rounded-[2rem] overflow-hidden bg-white mx-auto shadow-2xl ${aspectRatio === "9:16" ? "max-w-sm" : "max-w-full"}`}>
                      <img src={`data:image/png;base64,${purposeInfographicData}`} alt="Proje Amacı" className="w-full h-auto block" />
                  </div>
              </div>
          )}
        </div>
      )}

      {error && (
          <div className="max-w-xl mx-auto p-12 glass-panel border-red-500/50 bg-red-500/5 rounded-[3rem] text-center space-y-6 animate-in shake">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">İşlem Başarısız</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
              </div>
              
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 text-left flex gap-4">
                  <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                      <p className="text-xs font-bold text-white uppercase font-mono">Çözüm Önerileri</p>
                      <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 font-mono">
                          <li>Deponun <b>Public (Herkese Açık)</b> olduğundan emin olun.</li>
                          <li>URL'nin doğru yazıldığını kontrol edin.</li>
                          <li>API anahtarınızın kotasını kontrol edin.</li>
                      </ul>
                  </div>
              </div>

              <button onClick={() => handleAnalyze({ preventDefault: () => {} } as React.FormEvent)} className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest">TEKRAR DENE</button>
          </div>
      )}
    </div>
  );
};

export default RepoAnalyzer;
