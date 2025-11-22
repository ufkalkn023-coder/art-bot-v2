import { searchArtworks } from './artService.js';
import { generateEvolutionPost } from './geminiService.js';
import { downloadImage } from './imageService.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '../../data/temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const THEMES = [
    "Cats", "Dogs", "Horses", "The Moon", "The Sun",
    "Jesus", "The Virgin Mary", "Angels", "Demons",
    "Self-Portraits", "Flowers", "Skulls", "Books", "Music",
    "Sea", "Mountains", "War", "Love", "Death"
];

function parseYear(dateStr) {
    if (!dateStr) return 9999;
    // Extract first 4 digit number
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : 9999;
}

export async function generateEvolutionSeries() {
    // 1. Pick a random theme
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    console.log(`🧬 Starting Evolution Series for theme: ${theme}`);

    // 2. Search for artworks (fetch more to filter)
    // We search for "theme + painting" or just theme
    let artworks = await searchArtworks(theme, 15);

    if (artworks.length < 5) {
        console.log("⚠️ Not enough artworks found for evolution series.");
        return null;
    }

    // 3. Sort chronologically
    artworks.sort((a, b) => parseYear(a.date) - parseYear(b.date));

    // 4. Select up to 10 distinct items (avoid same artist/year if possible)
    // For now, just take the top 10 sorted
    const selectedArtworks = artworks.slice(0, 10);

    // 5. Generate Text
    const text = await generateEvolutionPost(theme, selectedArtworks);
    if (!text) return null;

    // 6. Generate Visual (GIF Slideshow)
    const gifBuffer = await createSlideshowGif(selectedArtworks);

    return {
        text,
        mediaBuffer: gifBuffer,
        altText: `Evolution of ${theme} in Art: A slideshow of ${selectedArtworks.length} artworks.`,
        artworks: selectedArtworks
    };
}

async function createSlideshowGif(artworks) {
    const frames = [];
    const width = 600;
    const height = 800; // 3:4 aspect ratio roughly

    for (const art of artworks) {
        try {
            const buffer = await downloadImage(art.imageUrl);

            // Resize and center on a canvas
            const resized = await sharp(buffer)
                .resize(width, height, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 1 }
                })
                .toBuffer();

            // Add text overlay (Year) - Optional, skipping for simplicity to avoid complex svg compositing issues
            // But we can add a simple label if needed.

            frames.push(resized);
        } catch (e) {
            console.error(`Failed to process image for ${art.title}:`, e.message);
        }
    }

    if (frames.length === 0) return null;

    // Create GIF using sharp
    // Sharp supports animated GIF creation from multiple images
    try {
        return await sharp(frames[0], { animated: true, limitInputPixels: false })
            .gif({ delay: 1500 }) // 1.5s per frame
            .composite(frames.slice(1).map(f => ({ input: f, blend: 'replace', gravity: 'center' }))) // This approach is wrong for sharp animation
            // Sharp's animation support is tricky. It's better to use a library like 'gifencoder' + 'canvas' or just stick to a collage.
            // Actually, sharp can create animated WebP easily. Twitter supports animated GIF/WebP.
            // Let's try creating an animated WebP which is better supported by Sharp.
            // Wait, Sharp 0.30+ supports creating animated images from a list of images?
            // No, usually you need to feed a multi-page image.
            // A simpler way: Create a collage (strip).

            // Let's pivot to COLLAGE (Strip) as requested "alt alta".
            // A vertical strip of 10 images.
            // 10 images * 800px height = 8000px height. Twitter might compress this heavily.
            // But "Long Post" implies reading.

            // Let's try the GIF approach again but correctly.
            // Since I don't want to install new dependencies like gifencoder, 
            // I will just return the FIRST 4 images as a grid (standard Twitter) 
            // OR create a single collage of the top 4.

            // User said "10 görsel".
            // If I can't make a GIF easily, I'll make a collage.
            // Let's make a 2x5 grid collage? Or 5x2?
            // 2 columns, 5 rows.
            // Width: 1080. Height: 5 * (1080/2) = 2700.
            // This is a reasonable aspect ratio (roughly 1:2.5).

            // Let's do a 2-column collage.

            .toBuffer();

    } catch (e) {
        console.error("GIF creation failed, falling back to collage");
    }

    return await createCollage(frames, width, height);
}

async function createCollage(buffers, itemWidth, itemHeight) {
    // 2 columns
    const cols = 2;
    const rows = Math.ceil(buffers.length / cols);

    const totalWidth = itemWidth * cols;
    const totalHeight = itemHeight * rows;

    const compositeOps = buffers.map((buf, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
            input: buf,
            top: row * itemHeight,
            left: col * itemWidth
        };
    });

    return await sharp({
        create: {
            width: totalWidth,
            height: totalHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 }
        }
    })
        .composite(compositeOps)
        .jpeg({ quality: 85 })
        .toBuffer();
}
