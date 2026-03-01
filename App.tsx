
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import RepoAnalyzer from './components/RepoAnalyzer';
import ArticleToInfographic from './components/ArticleToInfographic';
import YoutubeToInfographic from './components/YoutubeToInfographic';
import AudioTranscriber from './components/AudioTranscriber';
import PresentationGenerator from './components/PresentationGenerator';
import DevStudio from './components/DevStudio';
import Home from './components/Home';
import Pricing from './components/Pricing';
import IntroAnimation from './components/IntroAnimation';
import ApiKeyModal from './components/ApiKeyModal';
import { ViewMode, RepoHistoryItem, ArticleHistoryItem, DevStudioState } from './types';
import { Github, PenTool, GitBranch, FileText, Home as HomeIcon, CreditCard, DollarSign, Youtube, Mic, Layout } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.HOME);
  const [showIntro, setShowIntro] = useState(true);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  
  const [repoHistory, setRepoHistory] = useState<RepoHistoryItem[]>([]);
  const [articleHistory, setArticleHistory] = useState<ArticleHistoryItem[]>([]);
  const [devStudioData, setDevStudioData] = useState<DevStudioState | null>(null);
  const [initialViewData, setInitialViewData] = useState<any>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    setHasApiKey(!!apiKey && apiKey.trim().length > 0);
    setCheckingKey(false);

    const handleKeyReset = () => {
        setHasApiKey(false);
    };
    window.addEventListener('reset-api-key', handleKeyReset);
    return () => window.removeEventListener('reset-api-key', handleKeyReset);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleNavigate = (mode: ViewMode, data?: any) => {
    setInitialViewData(data || null);
    if (mode === ViewMode.DEV_STUDIO && data) {
      setDevStudioData(data);
    }
    setCurrentView(mode);
  };

  const handlePaymentSimulation = (plan: string) => {
      alert(`${plan} planı seçildi. Gerçek bir senaryoda burada Stripe Checkout sayfası açılacaktır.`);
      setCurrentView(ViewMode.HOME);
  };

  const handleAddRepoHistory = (item: RepoHistoryItem) => {
    setRepoHistory(prev => [item, ...prev]);
  };

  const handleAddArticleHistory = (item: ArticleHistoryItem) => {
    setArticleHistory(prev => [item, ...prev]);
  };

  if (checkingKey) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!hasApiKey && <ApiKeyModal onKeySelected={() => setHasApiKey(true)} />}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      <header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-6xl">
        <div className="glass-panel rounded-2xl px-6 py-4 flex justify-between items-center bg-white/5 border-white/10">
          <button 
            onClick={() => setCurrentView(ViewMode.HOME)}
            className="flex items-center gap-4 group transition-opacity hover:opacity-80"
          >
            <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-neon-white group-hover:border-orange-400 transition-colors">
               <PenTool className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight font-sans">
                Link2Ink <span className="text-orange-500">Stüdyo</span>
              </h1>
            </div>
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView(ViewMode.PRICING)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white font-mono uppercase tracking-widest hover:bg-white/10 transition-all"
            >
                <DollarSign className="w-3 h-3 text-orange-400" /> Fiyatlandırma
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col">
        {currentView !== ViewMode.HOME && (
            <div className="flex justify-center mb-8 md:mb-12 animate-in fade-in slide-in-from-top-4 sticky top-24 z-40">
            <div className="glass-panel p-1.5 rounded-full flex relative shadow-2xl bg-white/5 border-white/20 backdrop-blur-3xl overflow-x-auto no-scrollbar max-w-full">
                <button
                onClick={() => setCurrentView(ViewMode.HOME)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 font-mono text-slate-400 hover:text-white shrink-0"
                >
                <HomeIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/10 my-auto mx-1 shrink-0"></div>
                <button
                onClick={() => setCurrentView(ViewMode.PRESENTATION)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs transition-all duration-300 font-mono shrink-0 ${
                    currentView === ViewMode.PRESENTATION
                    ? 'text-white bg-violet-600/20 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                >
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline">Sunum</span>
                </button>
                <button
                onClick={() => setCurrentView(ViewMode.REPO_ANALYZER)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs transition-all duration-300 font-mono shrink-0 ${
                    currentView === ViewMode.REPO_ANALYZER || currentView === ViewMode.DEV_STUDIO
                    ? 'text-white bg-white/20 border border-white/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                >
                <GitBranch className="w-4 h-4" />
                <span className="hidden sm:inline">KodAkışı</span>
                </button>
                <button
                onClick={() => setCurrentView(ViewMode.ARTICLE_INFOGRAPHIC)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs transition-all duration-300 font-mono shrink-0 ${
                    currentView === ViewMode.ARTICLE_INFOGRAPHIC
                    ? 'text-orange-100 bg-orange-500/20 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">İnfografikçi</span>
                </button>
                <button
                onClick={() => setCurrentView(ViewMode.YOUTUBE_INFOGRAPHIC)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs transition-all duration-300 font-mono shrink-0 ${
                    currentView === ViewMode.YOUTUBE_INFOGRAPHIC
                    ? 'text-red-100 bg-red-600/20 border border-red-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                >
                <Youtube className="w-4 h-4" />
                <span className="hidden sm:inline">VideoAnaliz</span>
                </button>
                <button
                onClick={() => setCurrentView(ViewMode.AUDIO_TRANSCRIBE)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs transition-all duration-300 font-mono shrink-0 ${
                    currentView === ViewMode.AUDIO_TRANSCRIBE
                    ? 'text-emerald-100 bg-emerald-600/20 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">SesDökümü</span>
                </button>
            </div>
            </div>
        )}

        <div className="flex-1">
            {currentView === ViewMode.HOME && (
                <Home onNavigate={handleNavigate} />
            )}
            {currentView === ViewMode.PRESENTATION && (
                <div className="animate-in fade-in duration-500">
                    <PresentationGenerator />
                </div>
            )}
            {currentView === ViewMode.PRICING && (
                <Pricing onSelectPlan={handlePaymentSimulation} />
            )}
            {currentView === ViewMode.REPO_ANALYZER && (
                <div className="animate-in fade-in duration-500">
                    <RepoAnalyzer 
                        onNavigate={handleNavigate} 
                        history={repoHistory} 
                        onAddToHistory={handleAddRepoHistory}
                    />
                </div>
            )}
            {currentView === ViewMode.DEV_STUDIO && (
                <div className="animate-in fade-in duration-500 h-full">
                    <DevStudio initialState={devStudioData} onNavigate={handleNavigate} />
                </div>
            )}
            {currentView === ViewMode.ARTICLE_INFOGRAPHIC && (
                <div className="animate-in fade-in duration-500">
                    <ArticleToInfographic 
                        history={articleHistory} 
                        onAddToHistory={handleAddArticleHistory}
                        initialData={initialViewData}
                    />
                </div>
            )}
            {currentView === ViewMode.YOUTUBE_INFOGRAPHIC && (
                <div className="animate-in fade-in duration-500">
                    <YoutubeToInfographic />
                </div>
            )}
            {currentView === ViewMode.AUDIO_TRANSCRIBE && (
                <div className="animate-in fade-in duration-500">
                    <AudioTranscriber />
                </div>
            )}
        </div>
      </main>

      <footer className="py-12 mt-auto border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center px-4 space-y-4">
          <p className="text-xs font-mono text-slate-500">
            <span className="text-white">link</span>:<span className="text-orange-500">ink</span>$ Gemini 3 Pro Elite
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
