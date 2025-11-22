import sharp from 'sharp';
import axios from 'axios';
import { CONFIG } from '../config.js';

export async function downloadAndEnhanceImage(imageUrl) {
    try {
        // 1. Download Image
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: CONFIG.AXIOS.headers
        });

        let imageBuffer = Buffer.from(response.data);

        // 2. Process with Sharp
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        // 3. Resize if too large (Twitter max: 5MB, optimal width: 1200px)
        let processedImage = image;
        if (metadata.width > 1200) {
            processedImage = processedImage.resize(1200, null, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // 4. Add Watermark (subtle, bottom-right)
        const watermarkSvg = Buffer.from(`
            <svg width="200" height="30">
                <text x="10" y="20" font-family="Arial" font-size="14" fill="white" opacity="0.6">
                    ArtArchive
                </text>
            </svg>
        `);

        const watermark = await sharp(watermarkSvg).png().toBuffer();

        processedImage = processedImage.composite([{
            input: watermark,
            gravity: 'southeast',
            blend: 'over'
        }]);

        // 5. Convert to JPEG and optimize
        const finalBuffer = await processedImage
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();

        console.log(`📸 Image enhanced: ${metadata.width}x${metadata.height} → optimized with watermark`);

        return finalBuffer;

    } catch (error) {
        console.error("❌ Image enhancement failed:", error.message);
        // Fallback: return original image
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: CONFIG.AXIOS.headers
        });
        return Buffer.from(response.data);
    }
}

export async function downloadImage(imageUrl) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: CONFIG.AXIOS.headers
        });
        return Buffer.from(response.data);
    } catch (error) {
        console.error("❌ Image download failed:", error.message);
        throw error;
    }
}

export function checkWallpaperReady(width, height) {
    // 9:16 ratio is approx 0.5625
    // We allow some tolerance, e.g., 0.5 to 0.6
    const ratio = width / height;
    const isPortrait = ratio >= 0.5 && ratio <= 0.65;
    const isHighRes = width >= 1080 && height >= 1920;

    return isPortrait && isHighRes;
}

export async function createDetailCrop(imageBuffer) {
    try {
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        // Crop size: 30% of the smaller dimension, min 300px
        const minDim = Math.min(metadata.width, metadata.height);
        const cropSize = Math.max(300, Math.floor(minDim * 0.4));

        // Strategy: Entropy-based cropping (smart crop)
        // Sharp's 'attention' strategy focuses on the most interesting part.
        // But we want a specific crop, not just a resize.
        // Let's try to extract a region.
        // Since we can't easily find "eyes" without ML, let's use Sharp's entropy strategy to find a busy area.
        // Or simpler: Just take a center-ish crop or random crop.
        // Let's do a random crop for variety, but avoiding edges.

        const maxLeft = metadata.width - cropSize;
        const maxTop = metadata.height - cropSize;

        // Random position (centered bias)
        const left = Math.floor(Math.random() * maxLeft);
        const top = Math.floor(Math.random() * maxTop);

        // Add a "Magnifying Glass" effect? Maybe just the crop is enough.
        const crop = await image
            .extract({ left, top, width: cropSize, height: cropSize })
            .resize(600, 600) // Normalize size for Twitter
            .toBuffer();

        return crop;
    } catch (error) {
        console.error("❌ Detail Crop failed:", error);
        return null;
    }
}
