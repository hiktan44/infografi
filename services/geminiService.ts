/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RepoFileTree, Citation } from '../types';

// Helper to ensure we always get the freshest key from the environment
// immediately before a call.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface InfographicResult {
    imageData: string | null;
    citations: Citation[];
}

const handleApiError = (error: any) => {
    console.error("Gemini API Error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
        // Reset key selection if the key is invalid or doesn't have permissions
        window.dispatchEvent(new CustomEvent('reset-api-key'));
    }
    throw error;
};

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
  
  let styleGuidelines = "";
  let dimensionPrompt = "";

  if (is3D) {
      styleGuidelines = `VISUAL STYLE: Photorealistic Miniature Diorama. The data flow should look like a complex, glowing 3D printed physical model sitting on a dark, reflective executive desk.`;
      dimensionPrompt = `PERSPECTIVE & RENDER: Isometric view with TILT-SHIFT depth of field. High quality.`;
  } else {
      switch (style) {
          case "El Çizimi Blueprint":
              styleGuidelines = `VISUAL STYLE: Technical architectural blueprint. Dark blue background with white/light blue hand-drawn lines.`;
              break;
          case "Kurumsal Beyaz":
              styleGuidelines = `VISUAL STYLE: Clean, corporate, minimalist. Pure white background, high-contrast black or dark grey lines.`;
              break;
          case "Neon Siberpunk":
              styleGuidelines = `VISUAL STYLE: Dark mode cyberpunk. Black background with glowing neon pink, cyan, and violet lines.`;
              break;
          case "Modern Veri Akışı":
              styleGuidelines = `VISUAL STYLE: Replicate "Androidify Data Flow" aesthetic. Light blue solid background. Colorful icons.`;
              break;
          default:
              styleGuidelines = `VISUAL STYLE: ${style || "Modern Technical"}. High quality vector aesthetic.`;
              break;
      }
      
      if (aspectRatio === "9:16") {
          dimensionPrompt = "LAYOUT: Long-form vertical infographic. Structure it like two full pages of content stacked vertically. Use huge headings and multiple sections.";
      } else {
          dimensionPrompt = "LAYOUT: Horizontal landscape arrangement. Wide view.";
      }
  }

  const baseStylePrompt = `
  STRICT VISUAL STYLE GUIDELINES:
  ${styleGuidelines}
  - ${dimensionPrompt}
  - ICONS: Use relevant technical icons.
  - TYPOGRAPHY: CRITICAL! Use ULTRA-MASSIVE, BOLD, and thick fonts. Every piece of text must be readable on a small mobile screen without zooming. All text labels MUST be in ${language}.
  - RESOLUTION: High detail, 2K ultra-sharp rendering.
  `;

  const prompt = `Create a highly detailed technical logical data flow diagram infographic for GitHub repository: "${repoName}".
  
  ${baseStylePrompt}
  
  Repository Context: ${limitedTree}...
  
  Diagram Content Requirements:
  1. Title exactly: "${repoName} Veri Akışı" (Translated to ${language})
  2. Map the data flow based on files.
  3. Ensure "Input -> Processing -> Output" is clear.
  4. IMPORTANT: All text labels must be massive and in ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: "2K"
        }
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    return null;
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
    if (onProgress) onProgress("İÇERİK ARAŞTIRILIYOR VE ANALİZ EDİLİYOR...");
    
    let structuralSummary = "";
    let citations: Citation[] = [];

    try {
        const analysisPrompt = `Extract essential structure from: ${url}
        TARGET LANGUAGE: ${language}.
        Provide: 1. Headline, 2. Detailed Key Takeaways (split into 2 pages/sections worth of info for long vertical layout), 3. Supporting data, 4. Visual metaphor idea.`;

        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: analysisPrompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        structuralSummary = analysisResponse.text || "";

        const chunks = analysisResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    citations.push({ uri: chunk.web.uri, title: chunk.web.title || "" });
                }
            });
            const uniqueCitations = new Map();
            citations.forEach(c => uniqueCitations.set(c.uri, c));
            citations = Array.from(uniqueCitations.values());
        }
    } catch (e) {
        structuralSummary = `Create a deep, 2-page length infographic about: ${url}. Translate text to ${language}.`;
    }

    return await finalizeInfographic(structuralSummary, style, onProgress, language, aspectRatio);
}

export async function generateInfographicFromText(
  text: string,
  style: string,
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "9:16"
): Promise<InfographicResult> {
    if (onProgress) onProgress("METİN ANALİZ EDİLİYOR...");
    const ai = getAiClient();
    let structuralSummary = "";

    try {
        const analysisPrompt = `Analyze text and create structure for a long-form infographic:
        TEXT: ${text}
        TARGET LANGUAGE: ${language}.
        Provide: 1. Headline, 2. Detailed Key Takeaways (Expanded for 2-page length), 3. Supporting Data, 4. Visual Metaphor.`;

        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: analysisPrompt
        });
        structuralSummary = analysisResponse.text || "";
    } catch (e) {
        console.error("Text analysis failed:", e);
        throw new Error("Metin analiz edilemedi.");
    }

    return await finalizeInfographic(structuralSummary, style, onProgress, language, aspectRatio);
}

export async function generateInfographicFromFile(
  fileBase64: string,
  mimeType: string,
  style: string,
  onProgress?: (stage: string) => void,
  language: string = "Turkish",
  aspectRatio: "16:9" | "9:16" = "9:16"
): Promise<InfographicResult> {
    if (onProgress) onProgress("DOSYADAN BİLGİ ÇIKARILIYOR...");
    const ai = getAiClient();
    let structuralSummary = "";

    try {
        const analysisPrompt = `Extract core message from file for a deep, long-form infographic.
        TARGET LANGUAGE: ${language}.
        Provide: Headline, Detailed Key Takeaways (2-page deep content), Supporting Data, Visual Metaphor.`;

        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: fileBase64, mimeType } },
                    { text: analysisPrompt }
                ]
            }
        });
        structuralSummary = analysisResponse.text || "";
    } catch (e) {
        console.error("File analysis failed:", e);
        throw new Error("Dosya analiz edilemedi.");
    }

    return await finalizeInfographic(structuralSummary, style, onProgress, language, aspectRatio);
}

async function finalizeInfographic(
    structuralSummary: string,
    style: string,
    onProgress?: (stage: string) => void,
    language: string = "Turkish",
    aspectRatio: "16:9" | "9:16" = "9:16"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress("İNFOGRAFİK TASARLANIYOR VE OLUŞTURULUYOR...");

    let styleGuidelines = "";
    switch (style) {
        case "Fun & Playful":
        case "Eğlenceli ve Canlı":
            styleGuidelines = `STYLE: Vibrant 2D vector illustrations. Bright colors.`;
            break;
        case "Temiz Minimalist":
        case "Clean Minimalist":
            styleGuidelines = `STYLE: Ultra-minimalist. Lots of whitespace.`;
            break;
        case "Minimalist Beyaz":
            styleGuidelines = `STYLE: Pure white background, bold sharp black typography.`;
            break;
        case "Dark Mode Tech":
        case "Koyu Mod Teknoloji":
            styleGuidelines = `STYLE: Dark mode technical aesthetic. Dark slate/black background.`;
            break;
        default:
            styleGuidelines = `STYLE: Modern, professional flat vector illustration style.`;
            break;
    }

    const imagePrompt = `Create a professional, high-quality 2K infographic.
    LAYOUT: ${aspectRatio === "16:9" ? "Horizontal (Landscape)" : "Vertical (Long-form 2-page deep vertical flow)"}.
    CONTENT PLAN: ${structuralSummary}
    CRITICAL TYPOGRAPHY RULE:
    - USE ULTRA-MASSIVE, BOLD, AND VERY THICK FONTS.
    - TEXT MUST BE COMPLETELY READABLE ON SMALL SMARTPHONE SCREENS WITHOUT ANY ZOOMING.
    - DRAMATICALLY INCREASE FONT SIZE FOR ALL LABELS AND HEADERS.
    VISUAL RULES:
    - ${styleGuidelines}
    - LANGUAGE: All text in image MUST be ${language}.
    - RESOLUTION: Sharp details, 2K quality. Extra tall format for 9:16.
    - GOAL: Professional, easy to read on mobile, deep content flow.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: imagePrompt }] },
            config: { 
                responseModalities: [Modality.IMAGE],
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: "2K"
                }
            },
        });

        let imageData = null;
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    imageData = part.inlineData.data;
                    break;
                }
            }
        }
        return { imageData, citations: [] };
    } catch (error) {
        return handleApiError(error);
    }
}

export async function askNodeSpecificQuestion(
  nodeLabel: string, 
  question: string, 
  fileTree: RepoFileTree[]
): Promise<string> {
  const ai = getAiClient();
  const limitedTree = fileTree.slice(0, 300).map(f => f.path).join('\n');
  const prompt = `Senior software architect context.
  Component: "${nodeLabel}".
  Repo Context: ${limitedTree}
  User Question: "${question}"`;

  try {
    const response = await ai.models.generateContent({
       model: 'gemini-3-pro-preview',
       contents: { parts: [{ text: prompt }] }
    });
    return response.text || "Şu an bir cevap oluşturulamadı.";
  } catch (error) {
    return handleApiError(error);
  }
}

export async function editImageWithGemini(base64Data: string, mimeType: string, prompt: string): Promise<string | null> {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: { responseModalities: [Modality.IMAGE], imageConfig: { imageSize: "2K" } }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    return null;
  } catch (error) {
    return handleApiError(error);
  }
}