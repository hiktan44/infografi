
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { generateArticleInfographic, generateInfographicFromFile, generateInfographicFromText } from '../services/geminiService';
import { Citation, ArticleHistoryItem } from '../types';
import { Link, Loader2, Download, Sparkles, AlertCircle, Palette, Globe, ExternalLink, Maximize, Upload, AlignLeft, Monitor, Smartphone, BookOpen, FileSearch } from 'lucide-react';
import { LoadingState } from './LoadingState';
import ImageViewer from './ImageViewer';

interface ArticleToInfographicProps {
    history: ArticleHistoryItem[];
    onAddToHistory: (item: ArticleHistoryItem) => void;
    initialData?: { autoGenerateIntro?: boolean; mode?: 'professional' | 'beginner' };
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

const APP_DESCRIPTION_PRO = `
LINK2INK STÜDYO: GELECEĞİN GÖRSEL ZEKA PLATFORMU

GENEL BAKIŞ:
Link2Ink, karmaşık dijital verileri saniyeler içinde 4K çözünürlüklü, okunabilir ve estetik infografiklere dönüştüren bir yapay zeka ekosistemidir. Google Gemini 3 Pro Elite modelleri ile güçlendirilmiştir.

TEMEL MODÜLLER:
1. KOD AKIŞI (REPO ANALYZER):
   GitHub depolarını teknik olarak analiz eder. Dosya hiyerarşisini, bağımlılıkları ve mimariyi anlar. Sonuç olarak 4K teknik haritalar ve interaktif D3.js bağımlılık grafikleri üretir.

2. İNFOGRAFİKÇİ (ARTICLE TO INK):
   Herhangi bir makale URL'sini, PDF belgesini veya ham metni derinlemesine analiz eder. Önemli istatistikleri, anahtar noktaları ve sonuçları görsel bir hikayeye dönüştürür.

3. VİDEO ANALİZ (YOUTUBE AGENT):
   YouTube videolarının transkriptini ve içeriğini Google Search Grounding kullanarak bulur. Videoyu izlemeden tam bir eğitim posteri hazırlar.

4. SES DÖKÜMÜ (VOICE-TO-TEXT):
   Canlı ses kayıtlarını Gemini 3 Flash ile anında profesyonel metin dökümlerine çevirir.

TEKNİK AVANTAJLAR:
- 4K Ultra HD Çözünürlük Desteği.
- Çoklu Dil (Türkçe, İngilizce, Almanca, İspanyolca).
- Mobil (9:16) ve Masaüstü (16:9) Format Seçenekleri.
- Agentic Reasoning: Derin düşünme (Thinking Budget) ile hatasız analiz.
`;

const APP_DESCRIPTION_BEGINNER = `
LINK2INK: HER ŞEYİ GÖREBİLEN SİHİRLİ AYNA

Link2Ink, karmaşık şeyleri saniyeler içinde harika resimlere dönüştüren akıllı bir yardımcıdır. Teknik bilgi gerekmez!

NELER YAPABİLİR?
1. KODLARI RESME ÇEVİRİR: Bilgisayar kodlarını sanki bir şehrin haritasıymış gibi çizer. Karmaşık dosyaları birer bina gibi görebilirsiniz.
2. OKUMAK YERİNE İZLEYİN: Uzun makaleleri veya zor yazıları sizin için okur ve bir poster haline getirir. En önemli yerleri resimlerle anlatır.
3. VİDEOLARI ÖZETLER: Bir YouTube videosunu izlemek için vaktiniz mi yok? Link2Ink videoyu sizin yerinize "dinler" ve içindeki her şeyi tek bir resimde anlatır.
4. SESİNİZİ YAZIYA DÖKER: Siz konuşun, o yazsın! Hiç yorulmadan not alabilirsiniz.

NEDEN KULLANMALISINIZ?
- Çok kolay! Sadece bir link yapıştırın ve bekleyin.
- Resimler o kadar nettir ki (4K), her şeyi en ince ayrıntısına kadar görebilirsiniz.
- Anlamadığınız her şeyi sizin için basitleştirir.
`;

const ArticleToInfographic: React.FC<ArticleToInfographicProps> = ({ history, onAddToHistory, initialData }) => {
  const [sourceType, setSourceType] = useState<'url' | 'file' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("9:16");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("2K");
  const [fileData, setFileData] = useState<{ base64: string; mime: string; name: string; size: number } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(SKETCH_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('infografik');
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullScreenImage, setFullScreenImage] = useState<{src: string, alt: string} | null>(null);

  useEffect(() => {
      if (initialData?.autoGenerateIntro) {
          setSourceType('text');
          const description = initialData.mode === 'beginner' ? APP_DESCRIPTION_BEGINNER : APP_DESCRIPTION_PRO;
          const style = initialData.mode === 'beginner' ? "Eğlenceli ve Canlı" : "Modern Editoryal";
          
          setTextInput(description);
          setSelectedStyle(style);
          setImageSize("2K");
          setAspectRatio("9:16");
          
          const timer = setTimeout(() => {
              const btn = document.getElementById('generate-btn');
              if (btn) btn.click();
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [initialData]);

  const handleGenerate = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setImageData(null);
    setAnalysisText(null);
    
    try {
      let result;
      if (sourceType === 'url') {
          if (!urlInput) throw new Error("Lütfen bir URL girin.");
          result = await generateArticleInfographic(urlInput, selectedStyle, (s) => setLoadingStage(s), selectedLanguage, aspectRatio, imageSize);
          setDownloadName(urlInput.replace(/[^a-z0-9]/gi, '-').substring(0, 30));
      } else if (sourceType === 'file') {
          if (!fileData) throw new Error("Lütfen bir dosya yükleyin.");
          result = await generateInfographicFromFile(fileData!.base64, fileData!.mime, selectedStyle, (s) => setLoadingStage(s), selectedLanguage, aspectRatio, imageSize);
          setDownloadName(fileData!.name.split('.')[0]);
      } else {
          if (!textInput) throw new Error("Lütfen analiz edilecek bir metin girin.");
          result = await generateInfographicFromText(textInput, selectedStyle, (s) => setLoadingStage(s), selectedLanguage, aspectRatio, imageSize);
          setDownloadName('metin-analizi');
      }
      
      if (result && result.imageData) {
          setImageData(result.imageData);
          setAnalysisText(result.analysisText || null);
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
          İçeriği <span className="text-white font-bold italic">4K Ultra HD</span> çözünürlükle görselleştirin.
        </p>
      </div>

      <div className="flex justify-center -mb-8 relative z-20">
          <div className="bg-white/5 border border-white/20 p-2 rounded-[2rem] flex gap-2 shadow-neon-white backdrop-blur-3xl overflow-x-auto">
              <button onClick={() => setSourceType('url')} className={`px-10 py-4 rounded-2xl text-sm font-mono transition-all flex items-center gap-3 shrink-0 ${sourceType === 'url' ? 'bg-white text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}><Link className="w-5 h-5" /> URL</button>
              <button onClick={() => setSourceType('file')} className={`px-10 py-4 rounded-2xl text-sm font-mono transition-all flex items-center gap-3 shrink-0 ${sourceType === 'file' ? 'bg-orange-500 text-white font-black' : 'text-slate-400 hover:text-white'}`}><Upload className="w-5 h-5" /> DOSYA</button>
              <button onClick={() => setSourceType('text')} className={`px-10 py-4 rounded-2xl text-sm font-mono transition-all flex items-center gap-3 shrink-0 ${sourceType === 'text' ? 'bg-white text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}><AlignLeft className="w-5 h-5" /> METİN</button>
          </div>
      </div>

      <div className="glass-panel rounded-[3rem] p-8 md:p-16 space-y-12 relative z-10 pt-24 bg-white/5 border border-white/20 shadow-neon-white">
         <form onSubmit={handleGenerate} className="space-y-12">
            <div className="space-y-6">
                {sourceType === 'url' && (
                    <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Web sitesi veya makale URL'si" className="w-full bg-slate-950/50 border border-white/10 rounded-3xl px-8 py-6 text-2xl text-white placeholder:text-slate-700 outline-none font-bold" />
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
                    <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Analiz edilecek metni buraya yapıştırın..." className="w-full h-64 bg-slate-950/50 border border-white/10 rounded-3xl px-8 py-6 text-lg text-white placeholder:text-slate-700 outline-none font-mono leading-relaxed resize-none" />
                )}
            </div>

            <div className="grid md:grid-cols-4 gap-10">
                <div className="space-y-5">
                    <label className="text-xs text-white/50 font-mono tracking-widest uppercase font-black">Kalite</label>
                    <select value={imageSize} onChange={(e) => setImageSize(e.target.value as any)} className="w-full bg-slate-900 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-bold text-orange-400">
                        <option value="1K">1K Standart</option>
                        <option value="2K">2K High Def</option>
                        <option value="4K">4K Ultra HD</option>
                    </select>
                </div>
                <div className="space-y-5">
                    <label className="text-xs text-white/50 font-mono tracking-widest uppercase font-black">Format</label>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setAspectRatio("9:16")} className={`flex-1 py-4 rounded-xl text-xs font-mono border-2 transition-all ${aspectRatio === "9:16" ? 'bg-orange-500 text-white border-orange-500 shadow-neon-orange' : 'bg-white/5 text-slate-400 border-white/10'}`}><Smartphone className="w-5 h-5 mx-auto mb-1" /> MOBİL</button>
                        <button type="button" onClick={() => setAspectRatio("16:9")} className={`flex-1 py-4 rounded-xl text-xs font-mono border-2 transition-all ${aspectRatio === "16:9" ? 'bg-orange-500 text-white border-orange-500 shadow-neon-orange' : 'bg-white/5 text-slate-400 border-white/10'}`}><Monitor className="w-5 h-5 mx-auto mb-1" /> YATAY</button>
                    </div>
                </div>
                <div className="space-y-5">
                    <label className="text-xs text-white/50 font-mono tracking-widest uppercase font-black">Stil</label>
                    <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-slate-900 border-2 border-white/10 rounded-xl px-6 py-4 text-white outline-none">
                        {SKETCH_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-5">
                    <label className="text-xs text-white/50 font-mono tracking-widest uppercase font-black">Dil</label>
                    <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full bg-slate-900 border-2 border-white/10 rounded-xl px-6 py-4 text-white outline-none">
                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                </div>
            </div>

            <button id="generate-btn" type="submit" disabled={loading} className="w-full py-8 bg-white text-slate-950 hover:bg-orange-500 hover:text-white rounded-[2rem] font-black transition-all disabled:opacity-50 flex items-center justify-center gap-6 font-mono text-2xl tracking-widest uppercase shadow-2xl">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
                {loading ? "İŞLENİYOR..." : "OLUŞTUR"}
            </button>
         </form>
      </div>

      {loading && <div className="py-20 scale-125"><LoadingState message={loadingStage} type="article" /></div>}

      {imageData && !loading && (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="glass-panel rounded-[3rem] p-10 bg-white/5 border border-white/20 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-white font-mono uppercase tracking-widest">Tasarım Çıktısı</h3>
                        <p className="text-xs text-orange-500 font-mono font-black">{imageSize} RESOLUTION</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setFullScreenImage({src: `data:image/png;base64,${imageData}`, alt: "İnfografik"})} className="p-4 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><Maximize className="w-8 h-8" /></button>
                        <a href={`data:image/png;base64,${imageData}`} download={`${downloadName}.png`} className="bg-white text-slate-950 hover:bg-orange-500 hover:text-white px-12 py-6 rounded-2xl font-black text-lg shadow-xl">İNDİR</a>
                    </div>
                </div>
                <div className={`rounded-[2.5rem] overflow-hidden bg-white shadow-2xl ${aspectRatio === "9:16" ? "max-w-xl mx-auto" : "max-w-full"}`}>
                    <img src={`data:image/png;base64,${imageData}`} alt="Sonuç" className="w-full h-auto block" />
                </div>
            </div>
        </div>
      )}

      {error && (
          <div className="max-w-xl mx-auto p-12 glass-panel border-red-500/50 bg-red-500/5 rounded-[3rem] text-center space-y-6 animate-in shake">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">İşlem Başarısız</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
              </div>
              <button onClick={() => handleGenerate({ preventDefault: () => {} } as React.FormEvent)} className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest">TEKRAR DENE</button>
          </div>
      )}
    </div>
  );
};

export default ArticleToInfographic;
