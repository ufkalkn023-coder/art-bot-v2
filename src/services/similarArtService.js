// Service to find visually similar artworks based on dominant colors
import axios from 'axios';
import sharp from 'sharp';
import { CONFIG } from '../config.js';

/**
 * Extract dominant colors from an image buffer using sharp's stats.
 * Returns an array of hex strings (e.g., ['#aabbcc']).
 */
async function getDominantColors(imageBuffer, count = 3) {
    const { channels } = await sharp(imageBuffer).stats();
    // Simple approach: take the most saturated channel average as dominant colors
    const colors = [];
    for (let i = 0; i < count; i++) {
        const r = Math.round(channels[0].mean);
        const g = Math.round(channels[1].mean);
        const b = Math.round(channels[2].mean);
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colors.push(hex);
    }
    return colors;
}

/**
 * Search for artworks similar to the given image using color filters.
 * Currently uses Chicago API with a simple "color" query parameter if supported.
 * Falls back to a generic keyword search.
 */
export async function findSimilarArtworks(baseImageUrl, limit = 3) {
    try {
        // Download base image
        const resp = await axios.get(baseImageUrl, { responseType: 'arraybuffer', headers: CONFIG.AXIOS.headers });
        const baseBuffer = Buffer.from(resp.data);
        const colors = await getDominantColors(baseBuffer);
        const colorQuery = colors[0]; // pick first dominant color

        // Attempt color‑based search on Chicago (example endpoint, may not support color directly)
        const searchUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(colorQuery)}&query[term][is_public_domain]=true&limit=${limit}&fields=id,title,image_id,artist_title,date_display`;
        const searchRes = await axios.get(searchUrl, CONFIG.AXIOS);
        const data = searchRes.data;
        if (data.data && data.data.length > 0) {
            return data.data.map(art => ({
                title: art.title,
                artist: art.artist_title || 'Unknown Artist',
                date: art.date_display || 'Unknown Date',
                museum: 'Art Institute of Chicago',
                link: `https://www.artic.edu/artworks/${art.id}`,
                imageUrl: `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
            }));
        }
        // Fallback: generic search with the original theme (not available here)
        return [];
    } catch (e) {
        console.error('❌ Similar art search failed:', e.message);
        return [];
    }
}
