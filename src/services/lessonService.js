import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LESSONS_FILE = path.resolve(__dirname, '../data/technical_lessons.json');

export function getRandomLesson() {
    try {
        const data = fs.readFileSync(LESSONS_FILE, 'utf8');
        const { lessons } = JSON.parse(data);
        return lessons[Math.floor(Math.random() * lessons.length)];
    } catch (error) {
        console.error("⚠️ Error reading lessons:", error.message);
        return null;
    }
}

export function formatLesson(lesson) {
    return `\n\n${lesson.short}`;
}
