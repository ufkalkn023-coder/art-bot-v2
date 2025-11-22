import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let artistsData;

// Load artists data
function loadArtists() {
    if (!artistsData) {
        const dataPath = path.join(__dirname, '../data/forgotten_artists.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        artistsData = JSON.parse(rawData);
    }
    return artistsData;
}

/**
 * Get a random forgotten artist from the database
 * @returns {Object} Artist object with all metadata
 */
export function getRandomForgottenArtist() {
    const data = loadArtists();
    const randomIndex = Math.floor(Math.random() * data.artists.length);
    return data.artists[randomIndex];
}

/**
 * Get forgotten artists by category (gender, ethnicity, etc.)
 * @param {string} category - 'gender', 'ethnicity', or 'movement'
 * @param {string} value - The value to filter by
 * @returns {Array} Array of matching artists
 */
export function getForgottenArtistsByCategory(category, value) {
    const data = loadArtists();
    return data.artists.filter(artist => {
        if (category === 'gender') return artist.gender === value;
        if (category === 'ethnicity') return artist.ethnicity.includes(value);
        if (category === 'movement') return artist.movement.includes(value);
        return false;
    });
}

/**
 * Get a living forgotten artist (for contemporary spotlight)
 * @returns {Object|null} Artist object or null if none found
 */
export function getLivingForgottenArtist() {
    const data = loadArtists();
    const living = data.artists.filter(artist => artist.death_year === null);
    if (living.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * living.length);
    return living[randomIndex];
}

/**
 * Check if today is Monday (Forgotten Artist Spotlight day)
 * @returns {boolean}
 */
export function shouldRunForgottenArtistSpotlight() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayOfWeek === 1; // Monday = 1
}

/**
 * Get artist info formatted for display
 * @param {Object} artist - Artist object
 * @returns {string} Formatted string
 */
export function formatArtistInfo(artist) {
    const lifespan = artist.death_year
        ? `${artist.birth_year}-${artist.death_year}`
        : `b. ${artist.birth_year}`;

    return `
🌟 FORGOTTEN ARTIST SPOTLIGHT 🌟

${artist.name} (${lifespan})
${artist.nationality} | ${artist.ethnicity}
Movement: ${artist.movement}

Notable Works:
${artist.notable_works.map(work => `• ${work}`).join('\n')}

Why Underrepresented:
${artist.why_forgotten}

Find their work at: ${artist.museums.join(', ')}
    `.trim();
}

/**
 * Get all artists count
 * @returns {number}
 */
export function getArtistsCount() {
    const data = loadArtists();
    return data.artists.length;
}
