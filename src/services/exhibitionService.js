import { searchArtworks } from './artService.js';
import { findSimilarArtworks } from './similarArtService.js';
import { downloadAndEnhanceImage } from './imageService.js';

const THEMES = [
    "Impressionism", "Surrealism", "Baroque", "Renaissance", "Ukiyo-e",
    "Portrait", "Landscape", "Still Life", "Abstract",
    "Blue", "Red", "Gold", "Nature", "City",
    "Monet", "Van Gogh", "Hokusai", "Rembrandt"
];

export async function generateExhibition(preferredMovements = []) {
    // Choose a theme, preferring user-specified movements if available
    let availableThemes = THEMES;
    if (preferredMovements.length > 0) {
        const filtered = THEMES.filter(t => preferredMovements.includes(t));
        if (filtered.length > 0) availableThemes = filtered;
    }
    const theme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    console.log(`🎨 Preparing Mini Exhibition: ${theme}`);

    const artworks = await searchArtworks(theme, 4);

    if (artworks.length < 4) {
        console.log("❌ Not enough artworks found for exhibition.");
        return null;
    }

    // Process all images
    const processedImages = [];
    const altTexts = [];

    for (const art of artworks) {
        try {
            const buffer = await downloadAndEnhanceImage(art.imageUrl);
            processedImages.push(buffer);
            altTexts.push(`${art.title} by ${art.artist}`);
        } catch (e) {
            console.error(`Failed to process image for ${art.title}:`, e.message);
        }
    }

    if (processedImages.length < 4) {
        console.log("❌ Failed to process all 4 images.");
        return null;
    }

    // Create Tweet Text
    let tweetText = `🖼️ Mini Exhibition: ${theme}\n\n` +
        `1️⃣ ${artworks[0].title} - ${artworks[0].artist}\n` +
        `2️⃣ ${artworks[1].title} - ${artworks[1].artist}\n` +
        `3️⃣ ${artworks[2].title} - ${artworks[2].artist}\n` +
        `4️⃣ ${artworks[3].title} - ${artworks[3].artist}\n\n`;
    // Add similar-art suggestions based on the first artwork
    try {
        const similar = await findSimilarArtworks(artworks[0].imageUrl, 3);
        if (similar.length > 0) {
            tweetText += `🔎 Benzer eserler:${similar.map((a, i) => `\n${i + 1}. ${a.title} - ${a.artist}`).join('')}\n\n`;
        }
    } catch (e) {
        console.error('❌ Similar art fetch failed:', e.message);
    }
    tweetText += `#ArtExhibition #${theme.replace(/\s/g, '')} #ArtBot`;

    return {
        text: tweetText,
        images: processedImages,
        altTexts: altTexts
    };
}
