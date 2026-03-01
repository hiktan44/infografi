
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ViewMode } from '../types';
import { GitBranch, FileText, Youtube, Mic, ArrowRight, Sparkles, Zap, Info, Heart, Layout } from 'lucide-react';

interface HomeProps {
  onNavigate: (mode: ViewMode, data?: any) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-24 mb-24">
      <div className="text-center space-y-12 pt-12 animate-in fade-in duration-1000">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/20 text-xs font-mono text-white/80 mb-6 shadow-neon-white uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Gemini 3 Pro Görsel Zeka</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tight text-white font-sans leading-none mb-6">
          Link <span className="text-orange-500">2</span> Ink
        </h1>
        
        <p className="text-slate-400 text-lg md:text-2xl font-light max-w-4xl mx-auto leading-relaxed">
          Kodları, makaleleri ve videoları <span className="text-white font-bold italic">4K Ultra HD</span> infografiklere ve metin raporlarına dönüştürün.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
            <button 
                onClick={() => onNavigate(ViewMode.ARTICLE_INFOGRAPHIC, { autoGenerateIntro: true, mode: 'professional' })}
                className="group relative px-8 py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-2xl transition-all flex items-center gap-3"
            >
                <div className="absolute -inset-1 bg-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Info className="w-5 h-5 text-orange-400 relative z-10" />
                <span className="text-white font-bold relative z-10">Profesyonel Tanıtım Oluştur</span>
                <ArrowRight className="w-4 h-4 text-orange-400 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
                onClick={() => onNavigate(ViewMode.ARTICLE_INFOGRAPHIC, { autoGenerateIntro: true, mode: 'beginner' })}
                className="group relative px-8 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl transition-all flex items-center gap-3"
            >
                <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Heart className="w-5 h-5 text-emerald-400 relative z-10" />
                <span className="text-white font-bold relative z-10">Teknik Olmayanlar İçin Rehber</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-12 w-full max-w-6xl mx-auto">
            
            <button 
                onClick={() => onNavigate(ViewMode.PRESENTATION)}
                className="glass-panel p-8 rounded-3xl hover:bg-violet-500/10 transition-all border border-violet-500/20 text-left group relative overflow-hidden shadow-2xl"
            >
                <Layout className="w-10 h-10 text-violet-400 mb-6" />
                <h3 className="text-xl font-black text-white">Sunum</h3>
                <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">Gamma API ile anında profesyonel sunumlar.</p>
            </button>

            <button 
                onClick={() => onNavigate(ViewMode.REPO_ANALYZER)}
                className="glass-panel p-8 rounded-3xl hover:bg-white/10 transition-all border border-white/10 text-left group relative overflow-hidden shadow-2xl"
            >
                <GitBranch className="w-10 h-10 text-orange-400 mb-6" />
                <h3 className="text-xl font-black text-white">KodAkışı</h3>
                <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">Repoları teknik haritalara dönüştürün.</p>
            </button>

            <button 
                onClick={() => onNavigate(ViewMode.ARTICLE_INFOGRAPHIC)}
                className="glass-panel p-8 rounded-3xl hover:bg-white/10 transition-all border border-white/10 text-left group relative overflow-hidden shadow-2xl"
            >
                <FileText className="w-10 h-10 text-orange-400 mb-6" />
                <h3 className="text-xl font-black text-white">İnfografikçi</h3>
                <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">Web içeriklerini 4K poster yapın.</p>
            </button>

            <button 
                onClick={() => onNavigate(ViewMode.YOUTUBE_INFOGRAPHIC)}
                className="glass-panel p-8 rounded-3xl hover:bg-white/10 transition-all border border-white/10 text-left group relative overflow-hidden shadow-2xl"
            >
                <Youtube className="w-10 h-10 text-red-500 mb-6" />
                <h3 className="text-xl font-black text-white">VideoAnaliz</h3>
                <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">YouTube videolarını 32K Thinking ile çözün.</p>
            </button>

            <button 
                onClick={() => onNavigate(ViewMode.AUDIO_TRANSCRIBE)}
                className="glass-panel p-8 rounded-3xl hover:bg-emerald-500/10 transition-all border border-emerald-500/20 text-left group relative overflow-hidden shadow-2xl"
            >
                <Mic className="w-10 h-10 text-emerald-400 mb-6" />
                <h3 className="text-xl font-black text-white">SesDökümü</h3>
                <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">Mikrofonunuzla konuşun, Gemini yazsın.</p>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
