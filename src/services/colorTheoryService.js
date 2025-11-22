import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLOR_FILE = path.resolve(__dirname, '../data/color_theory.json');

export function getRandomColorFact() {
    try {
        const data = fs.readFileSync(COLOR_FILE, 'utf8');
        const { facts } = JSON.parse(data);
        return facts[Math.floor(Math.random() * facts.length)];
    } catch (error) {
        console.error("⚠️ Error reading color facts:", error.message);
        return null;
    }
}

export function formatColorFact(fact) {
    return `\n\n${fact.short}`;
}
