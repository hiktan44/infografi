/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { ExternalLink, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ApiKeyModalProps {
  onKeySelected: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySelected }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    // Check if API key is already configured
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    setApiKey(key);
    setHasKey(!!key && key.length > 0);
  }, []);

  const handleSaveKey = () => {
    if (!apiKey || apiKey.trim().length === 0) return;

    setIsSaving(true);
    // Store in localStorage for persistence
    localStorage.setItem('gemini_api_key', apiKey.trim());

    setTimeout(() => {
      setHasKey(true);
      setIsSaving(false);
      onKeySelected();
    }, 500);
  };

  const handleUseExisting = () => {
    if (hasKey) {
      onKeySelected();
    }
  };

  if (hasKey) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
        <div className="w-full max-w-md relative overflow-hidden glass-panel rounded-3xl border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)] animate-in fade-in zoom-in-95 duration-300">

          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>

          <div className="p-8 relative z-10 flex flex-col items-center text-center space-y-6">

            <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center border border-green-500/30 shadow-xl">
               <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-sans">API Anahtarı Yapılandırıldı</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Gemini API anahtarınız başarıyla yapılandırıldı. Uygulamayı kullanmaya başlayabilirsiniz.
              </p>
            </div>

            <button
              onClick={handleUseExisting}
              className="w-full py-4 bg-gradient-to-r from-green-900/80 to-green-800/80 hover:from-green-900 hover:to-green-800 border border-green-500/50 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              Devam Et
            </button>

          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold text-white font-sans">Gemini API Anahtarı Gerekli</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Link2Ink, <span className="text-slate-200 font-semibold">Görsel Oluşturma</span> yeteneğine sahip gelişmiş Gemini modellerini kullanır.
            </p>
          </div>

          <div className="w-full p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3 text-left">
             <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
             <div className="space-y-1">
                 <p className="text-xs font-bold text-orange-200 uppercase tracking-wider">Önemli</p>
                 <p className="text-xs text-orange-200/70 leading-relaxed">
                    <strong>Google AI Studio</strong>'dan ücretsiz bir API anahtarı alabilir veya Google Cloud projeniz için ücretli bir anahtar kullanabilirsiniz.
                 </p>
             </div>
          </div>

          <div className="w-full space-y-3">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API anahtarınızı buraya yapıştırın..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors font-mono"
            />

            <button
              onClick={handleSaveKey}
              disabled={!apiKey || apiKey.trim().length === 0 || isSaving}
              className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-orange-900/80 hover:to-orange-800/80 border border-white/10 hover:border-orange-500/50 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Kaydediliyor...' : 'API Anahtarını Kaydet'}
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 w-full space-y-3">
             <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono"
             >
                Ücretsiz API Anahtarı Al <ExternalLink className="w-3 h-3" />
             </a>
             <br />
             <a
                href="https://ai.google.dev/gemini-api/docs/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono"
             >
                Faturalandırma Belgeleri <ExternalLink className="w-3 h-3" />
             </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;