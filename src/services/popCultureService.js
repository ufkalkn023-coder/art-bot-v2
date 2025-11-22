import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POP_CULTURE_FILE = path.resolve(__dirname, '../data/pop_culture.json');

export function getPopCultureConnection(artworkTitle) {
    try {
        const data = fs.readFileSync(POP_CULTURE_FILE, 'utf8');
        const { connections } = JSON.parse(data);

        // Try to find matching artwork
        const match = connections.find(c =>
            artworkTitle.toLowerCase().includes(c.artwork.toLowerCase()) ||
            c.artwork.toLowerCase().includes(artworkTitle.toLowerCase())
        );

        return match || null;
    } catch (error) {
        console.error("⚠️ Error reading pop culture:", error.message);
        return null;
    }
}

export function formatPopCulture(connection) {
    return `\n\n${connection.short}`;
}
