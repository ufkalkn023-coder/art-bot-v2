import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENTS_FILE = path.resolve(__dirname, '../data/art_history_events.json');

export function getTodaysEvent() {
    try {
        const data = fs.readFileSync(EVENTS_FILE, 'utf8');
        const { events } = JSON.parse(data);

        const today = new Date();
        const month = today.getMonth() + 1; // 0-indexed
        const day = today.getDate();

        // Find events for today
        const todaysEvents = events.filter(e => e.month === month && e.day === day);

        if (todaysEvents.length > 0) {
            // Return random event if multiple
            return todaysEvents[Math.floor(Math.random() * todaysEvents.length)];
        }

        return null;
    } catch (error) {
        console.error("⚠️ Error reading history events:", error.message);
        return null;
    }
}

export function formatHistoryEvent(event) {
    return `\n\n📅 On this day: ${event.short}`;
}
