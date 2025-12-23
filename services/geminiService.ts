
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RepoFileTree, Citation } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface InfographicResult {
    imageData: string | null;
    citations: Citation[];
    analysisText?: string;
    videoTitle?: string;
}

const handleApiError = (error: any) => {
    console.error("Gemini API Error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
        window.dispatchEvent(new CustomEvent('reset-api-key'));
    }
    throw error;
};

/**
 * YouTube İçerik Analizi - Hibrit Protokol
 * 1. Öncelik: Transkript ve Doğrudan İçerik Analizi.
 * 2. Fallback: Google Search Deep Grounding (Eğer transkript erişilemezse).
 */
export async function generateYoutubeInfographic(
  youtubeUrl: string,
  style: string,
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "9:16"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress("VİDEO İÇERİĞİ VE TRANSKRİPT ANALİZ EDİLİYOR...");

    let structuralSummary = "";
    let citations: Citation[] = [];

    // URL'den ID'yi temizle
    const videoIdMatch = youtubeUrl.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/|v\/|^)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
        throw new Error("INVALID_URL_FORMAT");
    }

    try {
        // PROMPT GÜNCELLEMESİ: TRANSCRIPT ÖNCELİKLİ HİBRİT YAPI
        const analysisPrompt = `ROLE: Expert Data Journalist & Instructional Designer.
        TASK: Deeply analyze the YouTube Video (ID: ${videoId}) for a high-density ${aspectRatio === "9:16" ? "Vertical Mobile" : "Horizontal"} Infographic.
        
        TARGET VIDEO: ${youtubeUrl}
        
        INVESTIGATION PROTOCOL (PRIORITY ORDER):
        1.  **PRIMARY (TRANSCRIPT/CONTENT)**: First, attempt to retrieve or access the actual spoken content/transcript of this video. If you have internal knowledge of this video or can access its captions via your tools, base the analysis STRICTLY on this direct data for maximum accuracy.
        2.  **SECONDARY (SEARCH FALLBACK)**: ONLY if direct transcript access is impossible or data is insufficient, perform a Google Search for "${youtubeUrl}", "${videoId} transcript", and "${videoId} key takeaways" to reconstruct the content from external reviews and summaries.
        
        EXTRACTION REQUIREMENTS (${language}):
        Don't just summarize. Extract specific details, methodologies, and nuances.
        
        1.  **THE CORE HOOK**: What is the single most compelling idea? (Max 10 words).
        2.  **DATA & METRICS**: Extract specific numbers, percentages, dates, or prices mentioned. Label them clearly.
        3.  **THE PROCESS/FRAMEWORK**: If the video teaches "How to," extract the exact steps (Step 1, Step 2...). If it's an opinion, extract the "Arguments vs. Counter-arguments".
        4.  **HIDDEN GEMS**: Find 1-2 counter-intuitive facts or "Insider Tips" mentioned in the video.
        5.  **QUOTABLE MOMENT**: One powerful, short direct quote or key phrase.
        6.  **VISUAL CUES**: Suggest icons for the key points (e.g., "Use a Shield icon for security section").
        
        OUTPUT FORMAT (Strictly in ${language}):
        Provide a structured, rich summary optimized for visual layout. Indicate at the start whether you used "Direct Transcript" or "Search Fallback".`;

        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: analysisPrompt,
            config: { 
                tools: [{ googleSearch: {} }],
                temperature: 0.2, // Lower temperature for more factual extraction
            }
        });
        
        structuralSummary = analysisResponse.text || "";

        const chunks = analysisResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    citations.push({ uri: chunk.web.uri, title: chunk.web.title || "Kaynak" });
                }
            });
        }

        if (structuralSummary.length < 50) {
             structuralSummary += `\n\n(Not: Bu video için kısıtlı veri mevcuttu. Görsel, mevcut meta veriler üzerinden oluşturuldu.)`;
        }

    } catch (e: any) {
        console.warn("YouTube Deep Analysis Warning:", e.message);
        structuralSummary = `Video ID: ${videoId}. Video içeriği tam olarak doğrulanamadı, ancak isteğiniz üzerine görselleştirme oluşturuluyor. Konu: YouTube İçerik Özeti.`;
    }

    const imgResult = await finalizeInfographic(structuralSummary, style, onProgress, language, aspectRatio);
    return { ...imgResult, citations, analysisText: structuralSummary };
}

/**
 * Tasarım Finalizasyon Hattı
 * Gemini 3 Pro Image modeli kullanılarak 2K çözünürlükte infografik üretilir.
 */
async function finalizeInfographic(
    summary: string,
    style: string,
    onProgress?: (stage: string) => void,
    language: string = "Turkish",
    aspectRatio: "16:9" | "9:16" = "9:16"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress("İNFOGRAFİK TASARLANIYOR (GEMINI 3 PRO)...");

    // PROMPT GÜNCELLEMESİ: GÖRSEL ZENGİNLİK VE YERLEŞİM ZEKASI
    const imagePrompt = `DESIGN TASK: Create a professional, high-density ${aspectRatio === "9:16" ? "VERTICAL (Mobile Story format)" : "HORIZONTAL"} Infographic (2K Resolution).
    
    CONTENT SOURCE:
    ${summary}

    STYLE PARAMS:
    - Visual Style: ${style}
    - Language: ${language}
    
    LAYOUT RULES FOR RICH DATA:
    1.  **Information Architecture**: 
        - If the data has steps, draw a **Flowchart** or **Path**.
        - If the data has comparisons, use a **Split-Screen** or **Table** layout.
        - If the data is statistical, use **Big Number Cards** or **Donut Charts**.
    2.  **Typography**: Use a Massive Headline. Use distinct font weights for 'Labels' vs 'Body Text'.
    3.  **Visual Hierarchy**: The 'Core Hook' must be the focal point. 'Hidden Gems' should be in a distinct 'Tip Box' or footer.
    4.  **Color Theory**: High contrast. Dark text on light background or Neon on Dark (based on style: ${style}). Ensure text is legible.
    5.  **Density**: Avoid empty space. Fill the canvas with structured grids, icons, and data points.

    OUTPUT: A complete, polished, ready-to-share infographic image.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview', // En yüksek kalite model
            contents: { parts: [{ text: imagePrompt }] },
            config: { 
                responseModalities: [Modality.IMAGE],
                imageConfig: { aspectRatio, imageSize: "2K" }
            },
        });
        const parts = response.candidates?.[0]?.content?.parts;
        const imageData = parts?.find(p => p.inlineData)?.inlineData?.data || null;
        return { imageData, citations: [] };
    } catch (error) {
        return handleApiError(error);
    }
}

export async function generateArticleInfographic(
  url: string, 
  style: string, 
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "9:16"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress("SAYFA DERİNLEMESİNE ANALİZ EDİLİYOR...");
    let structuralSummary = "";
    
    // ANALİZ PROMPTU GÜNCELLEMESİ: DETAYLI VERİ VE BAĞLAM ÇIKARIMI
    const deepAnalysisPrompt = `ROLE: Senior Analyst & Visual Communicator.
    TASK: Analyze the following URL content to create a structured brief for a Mobile Infographic.
    URL: ${url}
    
    INSTRUCTIONS:
    Read the content and extract specific, high-value information. Do not just summarize abstractly.
    
    REQUIRED OUTPUT STRUCTURE (${language}):
    1.  **HEADLINE**: A catchy, 5-7 word title that summarizes the benefit.
    2.  **THE "WHY"**: One sentence explaining why this topic matters right now.
    3.  **KEY STATS DATABASE**: Extract every specific number, date, percentage, or price mentioned. List them.
    4.  **ACTIONABLE TAKEAWAYS**: Convert paragraphs into a 5-step checklist or "How-To" list.
    5.  **EXPERT INSIGHT**: Find a quote or a specific prediction mentioned in the text.
    6.  **PROS/CONS (if applicable)**: If the article compares things, list the distinct advantages and disadvantages.
    
    Output strictly in ${language}.`;

    try {
        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: deepAnalysisPrompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        structuralSummary = analysisResponse.text || "";
    } catch (e) {
        structuralSummary = `${url} içeriği. Dil: ${language}.`;
    }
    const result = await finalizeInfographic(structuralSummary, style, onProgress, language, aspectRatio);
    return { ...result, analysisText: structuralSummary };
}

export async function generateInfographicFromText(
  text: string,
  style: string,
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "9:16"
): Promise<InfographicResult> {
    // Metin girdisi için de yapıyı zenginleştir
    const enrichedText = `
    RAW DATA SOURCE:
    ${text}
    
    INSTRUCTION: 
    Act as a Data Editor. Refine this text for a ${aspectRatio} Infographic in ${language}.
    1. Identify the Main Theme.
    2. Extract 3-5 Key Bullet Points.
    3. If there are numbers, highlight them as "Big Stats".
    4. Create a "Bottom Line" conclusion.
    `;
    return await finalizeInfographic(enrichedText, style, onProgress, language, aspectRatio);
}

export async function generateInfographicFromFile(
  fileBase64: string,
  mimeType: string,
  style: string,
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "9:16"
): Promise<InfographicResult> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { data: fileBase64, mimeType } }, 
                { text: `TASK: Analyze this document for a ${aspectRatio} Infographic (${language}).
                
                REQUIREMENTS:
                - Extract the Document Title.
                - Extract the Executive Summary (2 sentences).
                - List the Top 5 Key Findings/Data points.
                - Identify any Charts/Graphs described and summarize their trend (e.g., "Sales increased by 20%").
                - Conclusion/Recommendation.` }
            ]
        }
    });
    return await finalizeInfographic(response.text || "", style, onProgress, language, aspectRatio);
}

export async function generateInfographic(
  repoName: string, 
  fileTree: RepoFileTree[], 
  style: string, 
  is3D: boolean = false,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "16:9"
): Promise<string | null> {
  const ai = getAiClient();
  const limitedTree = fileTree.slice(0, 150).map(f => f.path).join(', ');
  // Technical diagram prompt
  let prompt = `Teknik Mimari Diyagram: ${repoName}. Dosyalar: ${limitedTree}. Stil: ${style}. Dil: ${language}. 2K Sharp Typography.`;
  
  // If 3D requested, change prompt
  if (is3D) {
      prompt = `Create a futuristic 3D HOLOGRAPHIC visualization of the software architecture for ${repoName}. Glowing nodes, floating code blocks, cyberpunk aesthetic. ${style}. 2K Resolution.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: { aspectRatio, imageSize: "2K" }
      },
    });
    const parts = response.candidates?.[0]?.content?.parts;
    return parts?.find(p => p.inlineData)?.inlineData?.data || null;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Teknik olmayan, ürün özelliklerini ve faydalarını anlatan infografik.
 */
export async function generateRepoFunctionalInfographic(
  repoName: string,
  fileTree: RepoFileTree[],
  style: string,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "16:9"
): Promise<string | null> {
    const ai = getAiClient();
    const limitedTree = fileTree.slice(0, 100).map(f => f.path).join(', ');
    
    const prompt = `GÖREV: ${repoName} uygulaması için "Ürün Tanıtım İnfografiği" (Non-Technical Product Feature Poster) tasarla.
    
    KAYNAK KOD İPUÇLARI: ${limitedTree}
    
    TASARIM KURALLARI:
    1. KOD GÖSTERME. Sadece uygulamanın ne işe yaradığını, özelliklerini ve kullanıcıya faydalarını görselleştir.
    2. STİL: ${style} (Modern, Temiz, Pazarlama odaklı).
    3. DİL: ${language}.
    4. İÇERİK:
       - Büyük, çekici bir Ürün Başlığı.
       - 3-4 Ana Özellik (İkonlarla).
       - Kullanıcı Faydası.
       - Modern UI Mockup veya illüstrasyon tarzı.
    
    Çözünürlük: 2K.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: { aspectRatio, imageSize: "2K" }
            },
        });
        const parts = response.candidates?.[0]?.content?.parts;
        return parts?.find(p => p.inlineData)?.inlineData?.data || null;
    } catch (error) {
        return handleApiError(error);
    }
}

export async function analyzeRepoFeatures(
  repoName: string, 
  fileTree: RepoFileTree[], 
  language: string = "Turkish"
): Promise<string> {
  const ai = getAiClient();
  const limitedTree = fileTree.slice(0, 300).map(f => f.path).join('\n');
  
  const prompt = `Role: Senior Software Architect.
  Context: Analysis of repository '${repoName}'.
  File Structure:
  ${limitedTree}
  
  Task: Create a structured summary of this application in ${language}.
  
  Output Format:
  1. 🎯 **Proje Amacı**: (Ne işe yarar? Tek cümle.)
  2. 🛠 **Teknoloji Yığını**: (Kullanılan diller, frameworkler, araçlar.)
  3. 🚀 **Temel Özellikler**: (3-5 madde ile yetenekleri.)
  4. 💡 **Mimari Notlar**: (Klasör yapısından çıkarılan mimari desenler.)
  
  Keep it professional, concise, and use emojis for readability.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [{ text: prompt }] }
  });
  
  return response.text || "Özellik analizi oluşturulamadı.";
}

export async function editImageWithGemini(base64Data: string, mimeType: string, prompt: string): Promise<string | null> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    },
    config: { responseModalities: [Modality.IMAGE], imageConfig: { imageSize: "2K" } }
  });
  const parts = response.candidates?.[0]?.content?.parts;
  return parts?.find(p => p.inlineData)?.inlineData?.data || null;
}

export async function askNodeSpecificQuestion(
  nodeLabel: string, 
  question: string, 
  fileTree: RepoFileTree[]
): Promise<string> {
  const ai = getAiClient();
  const limitedTree = fileTree.slice(0, 300).map(f => f.path).join('\n');
  const prompt = `Architect: ${limitedTree}\nComponent: ${nodeLabel}\nQuestion: ${question}`;
  const response = await ai.models.generateContent({
       model: 'gemini-3-pro-preview',
       contents: { parts: [{ text: prompt }] }
  });
  return response.text || "Cevap üretilemedi.";
}
