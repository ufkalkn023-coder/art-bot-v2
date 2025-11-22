import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIVIA_FILE = path.resolve(__dirname, '../data/art_trivia.json');

export function getRandomTrivia() {
    try {
        const data = fs.readFileSync(TRIVIA_FILE, 'utf8');
        const { trivia } = JSON.parse(data);

        // Return random trivia
        return trivia[Math.floor(Math.random() * trivia.length)];
    } catch (error) {
        console.error("⚠️ Error reading trivia:", error.message);
        return null;
    }
}

export function formatTrivia(trivia) {
    return `\n\n${trivia.short}`;
}
