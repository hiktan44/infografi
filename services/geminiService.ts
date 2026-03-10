
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RepoFileTree, Citation } from '../types';

const getApiKey = (): string => {
    const userKey = localStorage.getItem('gemini_api_key');
    return userKey || import.meta.env.VITE_GEMINI_API_KEY || '';
};

const getAiClient = () => new GoogleGenAI({ apiKey: getApiKey() });

export interface InfographicResult {
    imageData: string | null;
    citations: Citation[];
    analysisText?: string;
}

export interface PresentationOutline {
    title: string;
    slides: { title: string; content: string; keyPoints: string[]; visualPrompt: string }[];
    citations: Citation[];
}

const handleApiError = (error: any) => {
    console.error("Gemini API Error:", error);
    const msg = error?.message || '';
    if (
        msg.includes("Requested entity was not found") ||
        msg.includes("API key expired") ||
        msg.includes("API_KEY_INVALID") ||
        msg.includes("API key not valid")
    ) {
        localStorage.removeItem('gemini_api_key');
        window.dispatchEvent(new CustomEvent('reset-api-key'));
    }
    throw error;
};

/**
 * SUNUM TASLAĞI OLUŞTURUCU - Gemini 3 Flash Preview
 * Uses latest flash for high-speed research and outlining.
 */
export async function generatePresentationOutline(topic: string, language: string = "Turkish"): Promise<PresentationOutline> {
    const ai = getAiClient();
    const prompt = `ROLE: Advanced Presentation Strategist.
    TOPIC: ${topic}.
    LANGUAGE: ${language}.
    
    TASK: 
    1. Research current data/trends on this topic using Google Search.
    2. Create a high-impact presentation outline with 5-7 slides.
    3. Each slide must have a title, short descriptive paragraph, 3 key bullet points, and a "visualPrompt" describing an image that would fit this slide (for an AI image generator).
    
    Format output strictly as JSON following this schema:
    {
        "title": "Presentation Main Title",
        "slides": [
            { "title": "Slide Title", "content": "Brief overview", "keyPoints": ["point 1", "point 2", "point 3"], "visualPrompt": "A futuristic image of..." }
        ]
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
            }
        });

        const data = JSON.parse(response.text || "{}");
        const citations: Citation[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    citations.push({ uri: chunk.web.uri, title: chunk.web.title || "Kaynak" });
                }
            });
        }
        return { ...data, citations };
    } catch (e: any) {
        return handleApiError(e);
    }
}

/**
 * SLAYT GÖRSELİ OLUŞTURUCU - Nano Banana (gemini-2.5-flash-image)
 * Generates a visual background or key visual for a slide.
 */
export async function generateSlideVisual(prompt: string, style: string = "Professional Modern"): Promise<string | null> {
    const ai = getAiClient();
    const fullPrompt = `Presentation Slide Visual: ${prompt}. Style: ${style}. 
    High-quality, clean, minimalist background with space for text overlays. 
    Cinematic lighting, 4K resolution.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
            config: { 
                imageConfig: { aspectRatio: "16:9" }
            }
        });
        
        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        return part?.inlineData?.data || null;
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * SES DÖKÜMÜ - Gemini 3 Flash Preview
 */
export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { data: base64Audio, mimeType } },
                { text: "Lütfen bu ses kaydını metne dök. Sadece metni döndür." }
            ]
        }
    });
    return response.text || "Ses çözümlenemedi.";
}

/**
 * AGENTIC YOUTUBE ANALİZİ
 */
export async function generateYoutubeInfographic(
  youtubeUrl: string,
  style: string,
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "9:16",
  imageSize: "1K" | "2K" | "4K" = "2K"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress("ÖĞRENME AJANI BAŞLATILDI: VİDEO TRANSKRİPTİ ARANIYOR...");

    // Geliştirilmiş regex: URL'den video ID'sini çıkarır
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) throw new Error("GEÇERSİZ_URL: YouTube video ID'si tespit edilemedi.");

    const agentPrompt = `ROLE: Advanced Learning & Transcription Agent.
    TARGET: YouTube Video ID ${videoId}.
    
    TASK 1 (RETRIEVAL): Use Google Search Grounding to find the EXACT transcript or a verbatim summary of this video's audio content.
    TASK 2 (PROCESSING): Perform a structural analysis in ${language}. Extract core arguments and key data.
    TASK 3 (VERIFICATION): If evidence is missing, fail with: "SOURCE_UNREACHABLE".
    
    Present output as a high-density educational report for an infographic.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: agentPrompt,
            config: { 
                tools: [{ googleSearch: {} }],
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        
        const summary = response.text || "";
        if (summary.includes("SOURCE_UNREACHABLE")) {
            throw new Error("VİDEO İÇERİĞİ ÇÖZÜMLENEMEDİ: Ajan bu videonun transkriptini web üzerinde bulamadı.");
        }

        const citations: Citation[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    citations.push({ uri: chunk.web.uri, title: chunk.web.title || "Kaynak" });
                }
            });
        }

        const imgResult = await finalizeInfographic(summary, style, onProgress, language, aspectRatio, imageSize);
        return { ...imgResult, analysisText: summary, citations };
    } catch (e: any) {
        if (e.message.includes("ÇÖZÜMLENEMEDİ")) throw e;
        return handleApiError(e);
    }
}

/**
 * GÖRSEL TASARIM MOTORU
 */
async function finalizeInfographic(
    summary: string,
    style: string,
    onProgress?: (stage: string) => void,
    language: string = "Turkish",
    aspectRatio: "16:9" | "9:16" = "16:9",
    imageSize: "1K" | "2K" | "4K" = "1K"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress(`${imageSize} İNFOGRAFİK TASARLANIYOR...`);

    const imagePrompt = `PROFESSIONAL LEARNING INFOGRAPHIC: 
    DATA SOURCE: ${summary}
    STYLING: ${style}. LANGUAGE: ${language}. 
    QUALITY: ${imageSize} Ultra HD.
    LAYOUT: ${aspectRatio}.
    REQUIREMENTS: Clear typography, educational structure, transcription-based accuracy. High contrast visuals.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: imagePrompt }] },
            config: { 
                imageConfig: { aspectRatio, imageSize }
            },
        });
        const parts = response.candidates[0].content.parts;
        const imageData = parts.find(p => p.inlineData)?.inlineData?.data || null;
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
  aspectRatio: "16:9" | "9:16" = "16:9",
  imageSize: "1K" | "2K" | "4K" = "1K"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress("AJAN MAKALE ANALİZİ YAPIYOR...");
    const analysisResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Exhaustive research and brief for URL: ${url}. Lang: ${language}.`,
        config: { 
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
    return await finalizeInfographic(analysisResponse.text || "", style, onProgress, language, aspectRatio, imageSize);
}

export async function generateInfographicFromText(
  text: string,
  style: string,
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "16:9",
  imageSize: "1K" | "2K" | "4K" = "1K"
): Promise<InfographicResult> {
    return await finalizeInfographic(text, style, onProgress, language, aspectRatio, imageSize);
}

export async function generateInfographicFromFile(
  fileBase64: string,
  mimeType: string,
  style: string,
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "16:9",
  imageSize: "1K" | "2K" | "4K" = "1K"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress("DOSYA ANALİZ EDİLİYOR...");
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { data: fileBase64, mimeType } }, 
                { text: `Detailed infographic brief from this file in ${language}.` }
            ]
        },
        config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return await finalizeInfographic(response.text || "", style, onProgress, language, aspectRatio, imageSize);
}

export async function generateInfographic(
  repoName: string, 
  fileTree: RepoFileTree[], 
  style: string, 
  is3D: boolean = false,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "16:9",
  imageSize: "1K" | "2K" | "4K" = "1K"
): Promise<string | null> {
  const ai = getAiClient();
  const limitedTree = fileTree.slice(0, 100).map(f => f.path).join(', ');
  
  let prompt = `DEEP DARK MODE Technical Architecture Diagram for ${repoName}. Style: ${style}. Lang: ${language}. High contrast, neon accents, dark background. Files: ${limitedTree}`;
  
  if (is3D) {
      prompt = `PROFESSIONAL DEEP DARK 3D Holographic Model of ${repoName} code structure. 
      Style: ${style}. 4K Ultra HD resolution. 
      Vibrant neon connections on a pitch-black background. 
      Hyper-realistic 3D technical mapping with glow effects. 
      Language: ${language}. Clear legible code labels.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio, imageSize } }
  });
  return response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData?.data || null;
}

export async function analyzeRepoFeatures(repoName: string, fileTree: RepoFileTree[], language: string = "Turkish"): Promise<string> {
    const ai = getAiClient();
    const prompt = `Extract top 5 features of ${repoName} (32K Thinking). Lang: ${language}. Files: ${fileTree.slice(0, 50).map(f => f.path).join(', ')}`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text || "Başarısız.";
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
    config: { imageConfig: { imageSize: "2K" } }
  });
  return response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData?.data || null;
}

export async function askNodeSpecificQuestion(nodeLabel: string, question: string, fileTree: RepoFileTree[]): Promise<string> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
       model: 'gemini-3-pro-preview',
       contents: `Node: ${nodeLabel}. Query: ${question}. Context: ${fileTree.length} files.`,
       config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text || "Yanıt yok.";
}
