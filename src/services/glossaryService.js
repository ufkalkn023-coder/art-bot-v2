import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GLOSSARY_FILE = path.resolve(__dirname, '../data/art_glossary.json');

export function getRandomGlossaryTerm() {
    try {
        const data = fs.readFileSync(GLOSSARY_FILE, 'utf8');
        const { terms } = JSON.parse(data);

        // 30% chance to include a glossary term
        if (Math.random() < 0.3) {
            const randomTerm = terms[Math.floor(Math.random() * terms.length)];
            return randomTerm;
        }

        return null;
    } catch (error) {
        console.error("⚠️ Error reading glossary:", error.message);
        return null;
    }
}

export function formatGlossaryTerm(term) {
    return `\n\n📚 Art Term: ${term.term} - ${term.definition}`;
}
