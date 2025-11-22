import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUOTES_FILE = path.resolve(__dirname, '../data/artist_quotes.json');

export function getRandomQuote() {
    try {
        const data = fs.readFileSync(QUOTES_FILE, 'utf8');
        const { quotes } = JSON.parse(data);

        // Return random quote
        return quotes[Math.floor(Math.random() * quotes.length)];
    } catch (error) {
        console.error("⚠️ Error reading quotes:", error.message);
        return null;
    }
}

export function formatQuote(quote) {
    return `\n\n💬 ${quote.short}`;
}
