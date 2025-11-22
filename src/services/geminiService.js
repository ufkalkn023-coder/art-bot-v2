import { GoogleGenerativeAI } from '@google/generative-ai';
// Yerleşik Global Fetch API'si kullanılacaktır (Node.js 18+ gereklidir).
import { CONFIG } from '../config.js';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(CONFIG.GEMINI.API_KEY);

/**
 * Harici bir URL'den görseli indirir ve Gemini API'sinin beklediği formata dönüştürür.
 * HTTP başlığından dinamik MIME türü algılanır.
 */
async function urlToGenerativePart(url) {
    if (!url) return null;
    
    console.log(`🔍 [Görsel Analizi Başlatılıyor]: ${url} indiriliyor...`);
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Hata kodu: ${response.status}`);
        }
        
        // MIME Type'ı otomatik algıla 
        const mimeType = response.headers.get("content-type") || "image/jpeg";

        // Veriyi Buffer -> Base64 çevir
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        
        console.log(`✅ Görsel işlendi. Tür: ${mimeType}`);

        return {
            inlineData: {
                data: base64Data, 
                mimeType: mimeType 
            }
        };
    } catch (e) {
        console.error(`❌ Görsel indirme hatası: ${e.message}`);
        return null; 
    }
}

// ✅ MODEL GÜNCELLEMESİ: gemini-2.5-flash kullanılıyor.
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    config: { 
        temperature: 0.5,
        // Rolü ve Kişiliği Sabitleyen Sistem Talimatı
        systemInstruction: "You are 'CuratorBot', a highly specialized, academic-level art historian and senior museum curator. Your primary function is to generate impeccably researched, authoritative, and brilliantly written content about fine art. You prioritize unassailable factual accuracy, a consistently high scholarly tone, and strict adherence to all output formatting constraints."
    } 
});

// Kritik Negatif Kısıtlamaları İçeren Ortak Format Kuralları Özeti
const FORMAT_RULES_SUMMARY = `
Output must be impeccably written, demonstrate a flawless command of English grammar, and prioritize format compliance. Do NOT use ANY markdown symbols (*, #, -, _, lists, or enumerations) for emphasis, italics, or structuring within the body text. Use ONLY standard double line breaks to separate paragraphs. You may ONLY use **bolding** for the main section titles. Output must be plain text.

**CRITICAL NEGATIVE CONSTRAINTS**: Do NOT use overly promotional language, emojis, exclamation points (unless essential for a quote), or casual social media slang. Maintain a consistently high scholarly standard.
`;

// --- Derinlemesine Sanat Makalesi (Deep Dive) ---

export async function generateArtContent(artwork, imageUrl) {
    if (!model) return "Error: Gemini model not initialized.";
    
    let imagePart = null;
    if (imageUrl) {
        // Dinamik MIME türü algılama kullanılıyor.
        imagePart = await urlToGenerativePart(imageUrl); 
    }

    const prompt = `
    Goal: Produce a single, deeply researched, scholarly, and impeccably written article.
    
    Analyze this artwork and write a comprehensive, engaging "Deep Dive" article for social media (up to 20,000 characters).
    
    Artwork: "${artwork.title}" by ${artwork.artist} (${artwork.date})
    Museum: ${artwork.museum}
    
    Your goal is to be the ultimate digital art historian—accessible but deeply knowledgeable.
    
    ${imagePart ? "**CRITICAL INSTRUCTION**: The analysis MUST be grounded in the visual evidence of the accompanying image. Focus on color theory, light sourcing, and spatial depth explicitly derived from the picture." : "**NOTE**: Visual analysis is based on historical knowledge of this artwork."}
    
    Structure:
    1. **The Hook**: A captivating opening.
    2. **The Story**: The narrative behind the creation.
    3. **Deep Analysis**: Technique, brushwork, lighting, composition.
    4. **Hidden Details**: Things most people miss.
    5. **Historical Context**: Timeline and importance.
    6. **SEO Keywords**: Weave in academic keywords naturally.
    
    ${FORMAT_RULES_SUMMARY}
    
    **FINAL QC STEP**: Ensure NO markdown symbols (bullets, *, -) in body text.
    `; 

    const contents = imagePart ? [prompt, imagePart] : [prompt]; 

    // ✅ Yeniden Deneme (Retry) Mekanizması
    const MAX_RETRIES = 3;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const result = await model.generateContent({ contents: contents });
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error(`❌ Gemini Error (Attempt ${i + 1}/${MAX_RETRIES}):`, error);
            if (i === MAX_RETRIES - 1) {
                // Üç denemeden sonra varsayılan metni döndür.
                return `🎨 ${artwork.title} by ${artwork.artist}\n\nA masterpiece from ${artwork.date}. \n\n#Art #DailyArt`;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// --- Detaylı Zoom Tweet'i ---

export async function generateDetailZoomText(artwork) {
    if (!model) return null;

    const prompt = `
    Write a short tweet (max 200 chars) encouraging people to look closer at the details of "${artwork.title}".
    Focus on brushwork, lighting, or hidden details.
    
    Tone: Engaging, brief, and perfectly punctuated.
    
    ${FORMAT_RULES_SUMMARY}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("❌ Gemini Detail Zoom Error:", error);
        return null;
    }
}


// --- Unutulmuş Sanatçılar Profili (Spotlight) ---

export async function generateForgottenArtistSpotlight(artist, artwork) {
    if (!model) return null;

    const lifespan = artist.death_year
        ? `${artist.birth_year}-${artist.death_year}`
        : `born ${artist.birth_year}`;

    const prompt = `
    Goal: Produce a single, profoundly researched, and impeccably written article. Prioritize unassailable factual accuracy and stylistic excellence above all else.
    
    You are writing a powerful, SEO-optimized spotlight on an underrepresented artist.
    
    Artist: ${artist.name} (${lifespan})
    Identity: ${artist.gender}, ${artist.ethnicity}
    Nationality: ${artist.nationality}
    Movement: ${artist.movement}
    Artwork: "${artwork.title}" ${artwork.date ? `(${artwork.date})` : ''}
    
    Why they're underrepresented: ${artist.why_forgotten}
    
    Write a comprehensive social media post (up to 20,000 characters) that covers the following structure:
    
    **The structure must be followed exactly. Output text must flow naturally without using numbering or lists within the body:**
    
    1. **Opening Hook**: Start with a powerful question or statement about representation in art.
    2. **Artist's Story**: Tell their compelling biography, including barriers and breakthroughs.
    3. **Artistic Contributions**: Analyze their unique style and innovations.
    4. **This Artwork**: Deep analysis of "${artwork.title}".
    5. **Historical Context**: The systemic barriers and challenges they faced.
    6. **Legacy & Modern Relevance**: Why they matter today and their recent recognition.
    7. **Call to Action**: Encourage learning more and invite discussion.
    8. **SEO Keywords**: Naturally weave them in.
    9. **Hashtags**: Include 10-12 relevant hashtags at the very end of the post.
    
    ${FORMAT_RULES_SUMMARY}

    **FINAL QC STEP**: Before outputting the final text, perform an internal review to ensure absolute compliance with all formatting and negative constraints. Specifically, verify that NO markdown symbols (e.g., bullets, #, -, *) were used in the body text.
    
    Output ONLY the post text with the proper formatting, including the list of hashtags at the very end.
    `;

    // ✅ Yeniden Deneme (Retry) Mekanizması
    const MAX_RETRIES = 3;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error(`❌ Gemini Spotlight Error (Attempt ${i + 1}/${MAX_RETRIES}):`, error);
            if (i === MAX_RETRIES - 1) {
                // Üç denemeden sonra null döndür.
                return null;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}
