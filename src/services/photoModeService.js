import sharp from 'sharp';
import axios from 'axios';

/**
 * 4-Photo Mode: Creates 1 full image + 3 cropped details
 * Returns array of image buffers
 */
export async function create4PhotoMode(imageUrl) {
    try {
        // Download image
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        const imageBuffer = Buffer.from(response.data);

        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();
        const { width, height } = metadata;

        const photos = [];

        // Photo 1: Full image (optimized)
        const fullImage = await sharp(imageBuffer)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toBuffer();
        photos.push(fullImage);

        // Photo 2: Top-left detail (interesting area)
        const crop1 = await sharp(imageBuffer)
            .extract({
                left: 0,
                top: 0,
                width: Math.floor(width / 2),
                height: Math.floor(height / 2)
            })
            .resize(800, 800, { fit: 'cover' })
            .jpeg({ quality: 85 })
            .toBuffer();
        photos.push(crop1);

        // Photo 3: Center detail (focal point)
        const crop2 = await sharp(imageBuffer)
            .extract({
                left: Math.floor(width / 4),
                top: Math.floor(height / 4),
                width: Math.floor(width / 2),
                height: Math.floor(height / 2)
            })
            .resize(800, 800, { fit: 'cover' })
            .jpeg({ quality: 85 })
            .toBuffer();
        photos.push(crop2);

        // Photo 4: Bottom-right detail
        const crop3 = await sharp(imageBuffer)
            .extract({
                left: Math.floor(width / 2),
                top: Math.floor(height / 2),
                width: Math.floor(width / 2),
                height: Math.floor(height / 2)
            })
            .resize(800, 800, { fit: 'cover' })
            .jpeg({ quality: 85 })
            .toBuffer();
        photos.push(crop3);

        console.log(`📸 4-Photo Mode: Created 1 full + 3 crops`);
        return photos;

    } catch (error) {
        console.error("❌ 4-Photo Mode failed:", error.message);
        return null;
    }
}

/**
 * Check if 4-photo mode should be used (random 20% chance)
 */
export function should4PhotoMode() {
    return Math.random() < 0.20; // 20% chance
}
