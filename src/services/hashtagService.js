import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HASHTAGS_FILE = path.resolve(__dirname, '../data/hashtags.json');

export function selectHashtags(artwork, movement) {
    try {
        const data = fs.readFileSync(HASHTAGS_FILE, 'utf8');
        const hashtags = JSON.parse(data);

        const selected = [];

        // 1. Always add 1 general hashtag
        const generalTag = hashtags.general[Math.floor(Math.random() * hashtags.general.length)];
        selected.push(generalTag);

        // 2. Add movement hashtag if available
        if (movement && hashtags.movements[movement]) {
            const movementTags = hashtags.movements[movement];
            const movementTag = movementTags[Math.floor(Math.random() * movementTags.length)];
            selected.push(movementTag);
        }

        // 3. Add artist hashtag if available
        const artistName = artwork.artist.split(' ')[0]; // First name or last name
        for (const [key, tags] of Object.entries(hashtags.artists)) {
            if (artwork.artist.includes(key)) {
                const artistTag = tags[Math.floor(Math.random() * tags.length)];
                selected.push(artistTag);
                break;
            }
        }

        // 4. Add museum hashtag if available
        if (hashtags.museums[artwork.museum]) {
            const museumTags = hashtags.museums[artwork.museum];
            const museumTag = museumTags[Math.floor(Math.random() * museumTags.length)];
            selected.push(museumTag);
        }

        // Limit to 3 hashtags max
        return selected.slice(0, 3);
    } catch (error) {
        console.error("⚠️ Error selecting hashtags:", error.message);
        return ['#Art', '#Painting'];
    }
}

export function formatHashtags(hashtags) {
    return '\n\n' + hashtags.join(' ');
}
