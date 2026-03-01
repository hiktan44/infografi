
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Copy, Check, MessageSquareText, Sparkles, Trash2 } from 'lucide-react';
import { transcribeAudio } from '../services/geminiService';

const AudioTranscriber: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setLoading(true);
          try {
            const text = await transcribeAudio(base64Audio, 'audio/webm');
            setTranscript(prev => prev + (prev ? '\n\n' : '') + text);
          } catch (e) {
            alert("Döküm hatası: " + e);
          } finally {
            setLoading(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Mikrofon erişimi engellendi veya bulunamadı.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 mb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-6">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Ses<span className="text-emerald-500">Dökümü</span>.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-light">
          Gemini 3 Flash ile sesinizi anlık olarak <span className="text-white font-bold italic">profesyonel metne</span> dönüştürün.
        </p>
      </div>

      <div className="glass-panel rounded-[3rem] p-12 bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center space-y-8">
        <div className="relative group">
           <div className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-500 ${isRecording ? 'bg-red-500/40 animate-pulse' : 'bg-emerald-500/20 group-hover:bg-emerald-500/30'}`}></div>
           <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isRecording ? 'bg-red-600 scale-110' : 'bg-emerald-600 hover:scale-105'}`}
           >
              {isRecording ? <Square className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
           </button>
        </div>

        <p className="text-sm font-mono uppercase tracking-[0.3em] text-slate-500 animate-pulse">
            {isRecording ? "Kayıt Ediliyor..." : "Kaydı Başlatmak İçin Dokunun"}
        </p>

        <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase">
                    <MessageSquareText className="w-4 h-4" /> Çıktı Paneli
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setTranscript('')} className="text-xs font-mono text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Temizle
                    </button>
                    <button onClick={copyToClipboard} disabled={!transcript} className="text-xs font-mono text-slate-600 hover:text-emerald-400 transition-colors flex items-center gap-1 disabled:opacity-0">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Kopyalandı" : "Kopyala"}
                    </button>
                </div>
            </div>
            
            <div className="w-full min-h-[300px] bg-slate-950/50 rounded-3xl border border-white/10 p-8 text-lg text-slate-200 font-sans leading-relaxed whitespace-pre-wrap relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center gap-4 text-emerald-400 font-mono text-sm uppercase tracking-widest animate-in fade-in">
                        <Loader2 className="w-6 h-6 animate-spin" /> Gemini İşliyor...
                    </div>
                )}
                {!transcript && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40 space-y-4">
                        <Sparkles className="w-12 h-12" />
                        <p className="italic text-sm">Sesiniz burada metne dönüşecek...</p>
                    </div>
                )}
                {transcript}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AudioTranscriber;
