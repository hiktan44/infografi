/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { ExternalLink, CreditCard, Loader2, KeyRound, AlertTriangle, Check } from 'lucide-react';

interface ApiKeyModalProps {
  onKeySelected: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySelected }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        setTimeout(() => {
            onKeySelected();
        }, 500);
      }
    } catch (e) {
      console.error("Anahtar seçici açılamadı", e);
      setIsConnecting(false);
    }
  };

  const handleManualKeySubmit = () => {
    const trimmed = manualKey.trim();
    if (!trimmed) {
      setError('Lütfen bir API anahtarı girin.');
      return;
    }
    if (trimmed.length < 20) {
      setError('Geçersiz API anahtarı formatı.');
      return;
    }
    localStorage.setItem('gemini_api_key', trimmed);
    onKeySelected();
  };

  const hasAiStudio = !!(window.aistudio && window.aistudio.openSelectKey);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-md relative overflow-hidden glass-panel rounded-3xl border border-orange-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in fade-in zoom-in-95 duration-300">

        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="p-8 relative z-10 flex flex-col items-center text-center space-y-6">

          <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center border border-orange-500/30 shadow-xl">
             <KeyRound className="w-8 h-8 text-orange-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-sans">API Anahtarı Gerekli</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Link2Ink, <span className="text-slate-200 font-semibold">Görsel Oluşturma</span> yeteneğine sahip gelişmiş Gemini modellerini kullanır. Devam etmek için geçerli bir API anahtarı gereklidir.
            </p>
          </div>

          <div className="w-full p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3 text-left">
             <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
             <div className="space-y-1">
                 <p className="text-xs font-bold text-orange-200 uppercase tracking-wider">Ücretli Proje Gerekli</p>
                 <p className="text-xs text-orange-200/70 leading-relaxed">
                    <strong>Google Cloud Ödeme Projesi</strong> ile ilişkili bir API anahtarı kullanmalısınız. Süresi dolmuş veya ücretsiz anahtarlar çalışmaz.
                 </p>
             </div>
          </div>

          <div className="w-full space-y-3">
            <div className="relative">
              <input
                type="password"
                value={manualKey}
                onChange={(e) => { setManualKey(e.target.value); setError(''); }}
                placeholder="Gemini API anahtarınızı yapıştırın..."
                className="w-full px-4 py-3.5 bg-slate-900/80 border border-white/10 focus:border-orange-500/50 rounded-xl text-white text-sm placeholder:text-slate-600 outline-none transition-colors font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleManualKeySubmit()}
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 text-left">{error}</p>
            )}
            <button
              onClick={handleManualKeySubmit}
              disabled={!manualKey.trim()}
              className="w-full py-4 bg-gradient-to-r from-orange-900/80 to-orange-800/80 hover:from-orange-800 hover:to-orange-700 border border-orange-500/30 hover:border-orange-500/50 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" /> Anahtarı Kaydet ve Devam Et
            </button>
          </div>

          {hasAiStudio && (
            <>
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs text-slate-500 font-mono">veya</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 hover:border-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-70 text-sm"
              >
                {isConnecting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Bağlanıyor...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-4 h-4 group-hover:text-orange-200" /> AI Studio ile Bağlan
                    </>
                )}
              </button>
            </>
          )}

          <div className="pt-4 border-t border-white/5 w-full">
             <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono"
             >
                Google AI Studio'dan API Anahtarı Al <ExternalLink className="w-3 h-3" />
             </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
