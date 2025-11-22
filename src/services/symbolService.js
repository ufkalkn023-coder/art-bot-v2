import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYMBOLS_FILE = path.resolve(__dirname, '../data/symbol_guide.json');

export function getRandomSymbol() {
    try {
        const data = fs.readFileSync(SYMBOLS_FILE, 'utf8');
        const { symbols } = JSON.parse(data);
        return symbols[Math.floor(Math.random() * symbols.length)];
    } catch (error) {
        console.error("⚠️ Error reading symbols:", error.message);
        return null;
    }
}

export function formatSymbol(symbol) {
    return `\n\n${symbol.short}`;
}
