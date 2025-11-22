import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPOSITION_FILE = path.resolve(__dirname, '../data/composition_analysis.json');

export function getRandomComposition() {
    try {
        const data = fs.readFileSync(COMPOSITION_FILE, 'utf8');
        const { techniques } = JSON.parse(data);
        return techniques[Math.floor(Math.random() * techniques.length)];
    } catch (error) {
        console.error("⚠️ Error reading composition:", error.message);
        return null;
    }
}

export function formatComposition(composition) {
    return `\n\n${composition.short}`;
}
