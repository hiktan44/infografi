/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Cpu, FileText, Zap, Activity, Server, Shield, Database, Code2 } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  type: 'repo' | 'article';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message, type }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  const config = type === 'repo' ? {
    color: 'text-orange-400',
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    icon: Cpu,
    logPrefix: 'git',
    tasks: [
      "Uzak ağaç nesnesi getiriliyor...",
      "Soyut Sözdizimi Ağacı ayrıştırılıyor...",
      "Bağımlılık grafiği haritalanıyor...",
      "Yapısal yoğun noktalar belirleniyor...",
      "Düğüm konumları vektörleştiriliyor...",
      "Kuvvet odaklı düzen hesaplanıyor...",
      "Görselleştirme hattı optimize ediliyor...",
      "WebGL varlıkları derleniyor...",
      "Son ışık haritası fırınlanıyor..."
    ]
  } : {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    icon: FileText,
    logPrefix: 'web',
    tasks: [
      "DNS başlıkları çözümleniyor...",
      "DOM yapısı taranıyor...",
      "Semantik varlıklar çıkarılıyor...",
      "İçerik yoğunluğu analiz ediliyor...",
      "Görsel metaforlar sentezleniyor...",
      "Optimal yerleşim belirleniyor...",
      "Vektör katmanları rasterize ediliyor...",
      "Stil transferi uygulanıyor...",
      "Son kompozisyon oluşturuluyor..."
    ]
  };

  const Icon = config.icon;

  useEffect(() => {
    setLogs([`> ${config.logPrefix}_modülü başlatılıyor...`]);
    
    const interval = setInterval(() => {
      setLogs(prev => {
        const nextLog = config.tasks[Math.floor(Math.random() * config.tasks.length)];
        const timestamp = new Date().toLocaleTimeString('tr-TR', { hour12: false });
        const newLogs = [...prev, `[${timestamp}] ${nextLog} ... TAMAM`];
        if (newLogs.length > 5) return newLogs.slice(newLogs.length - 5);
        return newLogs;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [type]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-16 animate-in fade-in duration-700">
      
      <div className="relative w-40 h-40 flex items-center justify-center mb-10">
        <div className={`absolute inset-0 rounded-full border border-white/10`}></div>
        <div className={`absolute inset-0 rounded-full border-2 border-dashed ${config.border} opacity-20 animate-[spin_12s_linear_infinite]`}></div>
        <div className={`absolute inset-4 rounded-full border border-t-transparent border-l-transparent ${config.border} opacity-40 animate-[spin_3s_linear_infinite_reverse]`}></div>
        <div className={`relative z-10 p-6 rounded-full ${config.bg} bg-opacity-10 backdrop-blur-xl border ${config.border} border-opacity-30 shadow-[0_0_40px_rgba(0,0,0,0.6)] animate-pulse`}>
           <Icon className={`w-12 h-12 ${config.color}`} />
        </div>
      </div>

      <h3 className={`text-xl md:text-2xl font-mono font-bold ${config.color} mb-6 tracking-widest uppercase animate-pulse text-center`}>
        {message || 'VERİ_İŞLENİYOR'}
      </h3>

      <div className="w-full bg-slate-950/80 rounded-xl border border-white/10 p-4 font-mono text-xs relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
             <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
             </div>
             <div className="text-[10px] text-slate-600 uppercase tracking-wider">sistem_günlüğü</div>
        </div>
        
        <div className="flex flex-col gap-1.5 h-32 justify-end">
            {logs.map((log, i) => (
                <div key={i} className="text-slate-400 animate-in slide-in-from-left-4 fade-in duration-300 truncate font-medium">
                    <span className={`${config.color} opacity-50 mr-2`}>{'>'}</span>
                    {log}
                </div>
            ))}
            <div className="flex items-center gap-2 text-slate-500 animate-pulse mt-1">
               <Activity className="w-3 h-3" />
               <span>Çalışıyor...</span>
            </div>
        </div>
      </div>
    </div>
  );
};