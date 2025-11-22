import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config.js';
import axios from 'axios';

let genAI;
let model;
let visionModel;

if (CONFIG.GEMINI.API_KEY) {
    genAI = new GoogleGenerativeAI(CONFIG.GEMINI.API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export async function generateArtContent(artwork, imageUrl = null) {
    if (!model) {
        console.warn("⚠️ Gemini API key missing. Using default caption.");
        return `🎨 ${artwork.title}\n👤 ${artwork.artist}\n📅 ${artwork.date}\n🏛️ ${artwork.museum}`;
    }

    // Try Vision API if image URL is provided
    if (imageUrl && visionModel) {
        try {
            return await generateWithVision(artwork, imageUrl);
        } catch (error) {
            console.warn("⚠️ Vision API failed, falling back to text-only:", error.message);
            // Fall through to text-only generation
        }
    }

    // Text-only generation (fallback)
    return await generateTextOnly(artwork);
}

async function generateWithVision(artwork, imageUrl) {
    // Download image
    const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: CONFIG.AXIOS.headers
    });
    const imageBuffer = Buffer.from(response.data);
    const base64Image = imageBuffer.toString('base64');

    const prompt = `
    You are an art critic analyzing this artwork.
    
    Artwork Details:
    Title: ${artwork.title}
    Artist: ${artwork.artist}
    Date: ${artwork.date}
    
    Analyze the image and write a Twitter post (max 240 characters).
    
    Requirements:
    1. Describe what you SEE in the image (composition, colors, technique)
    2. Mention the title and artist naturally
    3. Be sophisticated yet accessible
    4. End with 2-3 relevant hashtags
    5. Language: English
    6. DO NOT include the link, I will add it
    
    Output ONLY the tweet text.
    `;

    const result = await visionModel.generateContent([
        prompt,
        {
            inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg'
            }
        }
    ]);

    const response2 = await result.response;
    let text = response2.text().trim();

    // Hard truncate
    if (text.length > 250) {
        text = text.substring(0, 247) + "...";
    }

    return text;
}

async function generateTextOnly(artwork) {
    const prompt = `
    Act as an art curator and critic. I will provide you with details of an artwork.
    Your task is to write a Twitter post.
    
    CRITICAL CONSTRAINT: The output text MUST be under 240 characters. This is a HARD LIMIT.
    
    Artwork Details:
    Title: ${artwork.title}
    Artist: ${artwork.artist}
    Date: ${artwork.date}
    Museum: ${artwork.museum}

    Requirements:
    1. Start with an engaging hook or a philosophical question related to the art.
    2. Mention the title and artist naturally.
    3. Provide a brief, interesting fact.
    4. End with 2-3 relevant hashtags.
    5. The tone should be sophisticated yet accessible.
    6. Language: English.
    7. DO NOT include the link in your output.
    
    Output ONLY the tweet text.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Hard truncate
        if (text.length > 250) {
            text = text.substring(0, 247) + "...";
        }

        return text;
    } catch (error) {
        console.error("❌ Gemini Error:", error);
        // Fallback to basic info
        return `🎨 ${artwork.title}\n👤 ${artwork.artist}\n📅 ${artwork.date}\n🏛️ ${artwork.museum}`;
    }
}

// --- Evolution Series ---

export async function generateEvolutionPost(theme, artworks) {
    if (!model) return null;

    const artworksList = artworks.map((a, i) => `${i + 1}. ${a.title} (${a.date}) by ${a.artist}`).join('\n');

    const prompt = `
    You are an art historian creating a "Mini Documentary" for Twitter (X).
    Theme: "${theme}"
    
    I have a series of ${artworks.length} artworks showing the evolution of this theme:
    ${artworksList}
    
    Write a Long Post (up to 25000 characters) analyzing this evolution.
    
    Structure:
    1. **Title**: A catchy, bold title (e.g., "🐈 The Evolution of Cats in Art").
    2. **Introduction**: Brief context.
    3. **The Journey**: Go through the eras/artworks chronologically. Group them if needed (e.g., "The Ancient Era", "The Renaissance Turn").
       - Use BOLD for artwork titles.
       - Use ITALIC for dates.
       - Explain *how* and *why* the depiction changed.
    4. **Conclusion**: A philosophical summary.
    5. **Hashtags**: 3-4 relevant tags.
    
    Tone: Educational, engaging, storytelling.
    Format: Use Markdown (Bold, Italic). Do NOT use links.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Safety Check
        const { validateContent } = await import('../utils/safety.js');
        validateContent(text);

        return text;
    } catch (error) {
        console.error("❌ Gemini Evolution Error:", error);
        return null;
    }
}

// --- Creative Concepts ---

export async function generateCinemaCrossover(artwork) {
    if (!model) return null;

    const prompt = `
    Analyze the atmosphere of "${artwork.title}" by ${artwork.artist}.
    Which famous film director's style (e.g., Wes Anderson, Tarantino, Kubrick, Lynch, Nolan) does this resemble?
    
    Write a short tweet (max 280 chars):
    1. State the director match clearly.
    2. Explain why (color palette, symmetry, mood).
    3. Use a film clapper emoji 🎬.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (e) {
        return null;
    }
}

export async function generateTimeCapsule(artwork) {
    if (!model) return null;

    const prompt = `
    The artwork is "${artwork.title}" created in ${artwork.date}.
    Identify the specific year (or approximate mid-point year).
    List 3 major/bizarre historical events from that year (outside of art).
    
    Write a tweet (max 280 chars):
    "Year: [Year]. While ${artwork.artist} was painting this:
    - [Event 1]
    - [Event 2]
    - [Event 3]
    History is context. 🕰️"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (e) {
        return null;
    }
}

export async function generateDetailZoomText(artwork) {
    if (!model) return null;

    const prompt = `
    I am posting a "Detail Zoom" of "${artwork.title}" by ${artwork.artist}.
    The tweet includes the full image AND a zoomed-in crop of a specific detail.
    
    Write a short, engaging tweet (max 200 chars):
    1. Ask the audience if they ever noticed the details.
    2. Mention the artist/title.
    3. Use a magnifying glass emoji 🔍.
    4. Language: English.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (e) {
        return null;
    }
}

export async function generateQuizText(artwork) {
    if (!model) return null;

    const prompt = `
    Create an "Guess the Artist" quiz for this artwork: "${artwork.title}".
    DO NOT reveal the artist's name in the tweet text (except in hashtags if unavoidable, but try to avoid).
    
    Write a tweet (max 240 chars):
    1. Describe the style/subject briefly.
    2. Ask "Who painted this masterpiece?" or similar.
    3. Provide a hint (e.g., "Hint: A master of [Movement]").
    4. Add #ArtQuiz hashtag.
    5. Language: English.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (e) {
        return null;
    }
}
