
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ViewMode } from '../types';
import { GitBranch, FileText, Youtube, BrainCircuit, Image, Sparkles, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (mode: ViewMode) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-24 mb-24">
      {/* Hero Section */}
      <div className="text-center space-y-12 pt-12 animate-in fade-in duration-1000">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/20 text-xs font-mono text-white/80 mb-6 shadow-neon-white uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Görsel Zeka Platformu</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tight text-white font-sans leading-none mb-6">
          Link <span className="text-orange-500">2</span> Ink
        </h1>
        
        <p className="text-slate-400 text-lg md:text-2xl font-light max-w-4xl mx-auto leading-relaxed">
          İstediğiniz kaynağı saniyeler içerisinde <span className="text-white font-bold italic">mobil cihazlarda mükemmel okunan</span> profesyonel infografiklere dönüştürün.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 w-full max-w-6xl mx-auto">
            
            {/* GitHub Option */}
            <button 
                onClick={() => onNavigate(ViewMode.REPO_ANALYZER)}
                className="glass-panel p-10 rounded-3xl hover:bg-white/10 transition-all border border-white/10 hover:border-white/30 text-left group relative overflow-hidden shadow-2xl"
            >
                <div className="absolute right-0 top-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <GitBranch className="w-40 h-40 -rotate-12 text-white" />
                </div>
                <div className="space-y-8 relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-slate-900 transition-all duration-500">
                        <GitBranch className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white transition-colors">KodAkışı</h3>
                        <p className="text-sm text-slate-400 font-mono mt-4 leading-relaxed group-hover:text-slate-300">
                            Repoları teknik haritalara ve 3D modellere dönüştürün.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-white/50 group-hover:text-white font-mono text-xs uppercase tracking-[0.2em] pt-6 border-t border-white/5">
                        Keşfet <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </div>
                </div>
            </button>

            {/* Web Article Option */}
            <button 
                onClick={() => onNavigate(ViewMode.ARTICLE_INFOGRAPHIC)}
                className="glass-panel p-10 rounded-3xl hover:bg-white/10 transition-all border border-white/10 hover:border-orange-500/30 text-left group relative overflow-hidden shadow-2xl"
            >
                 <div className="absolute right-0 top-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-orange-500">
                    <FileText className="w-40 h-40 -rotate-12" />
                </div>
                <div className="space-y-8 relative z-10">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-neon-orange">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white group-hover:text-orange-200 transition-colors">İnfografikçi</h3>
                        <p className="text-sm text-slate-400 font-mono mt-4 leading-relaxed group-hover:text-slate-300">
                            Web içeriklerini mobil uyumlu profesyonel tasarımlara dönüştürün.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-white/50 group-hover:text-orange-300 font-mono text-xs uppercase tracking-[0.2em] pt-6 border-t border-white/5">
                        Oluştur <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </div>
                </div>
            </button>

            {/* YouTube Option */}
            <button 
                onClick={() => onNavigate(ViewMode.YOUTUBE_INFOGRAPHIC)}
                className="glass-panel p-10 rounded-3xl hover:bg-white/10 transition-all border border-white/10 hover:border-red-500/30 text-left group relative overflow-hidden shadow-2xl"
            >
                 <div className="absolute right-0 top-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-red-500">
                    <Youtube className="w-40 h-40 -rotate-12" />
                </div>
                <div className="space-y-8 relative z-10">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 border border-red-500/20 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-neon-white">
                        <Youtube className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white group-hover:text-red-200 transition-colors">VideoAnaliz</h3>
                        <p className="text-sm text-slate-400 font-mono mt-4 leading-relaxed group-hover:text-slate-300">
                            YouTube videolarını tek tıkla görsel özetlere ve infografiklere dönüştürün.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-white/50 group-hover:text-red-300 font-mono text-xs uppercase tracking-[0.2em] pt-6 border-t border-white/5">
                        Analiz Et <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </div>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
