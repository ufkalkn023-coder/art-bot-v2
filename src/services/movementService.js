import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEDULE_FILE = path.resolve(__dirname, '../data/movement_schedule.json');

export function getTodaysMovement() {
    try {
        const data = fs.readFileSync(SCHEDULE_FILE, 'utf8');
        const { schedule } = JSON.parse(data);

        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

        return schedule[dayOfWeek];
    } catch (error) {
        console.error("⚠️ Error reading movement schedule:", error.message);
        return null;
    }
}

export function getMovementMessage(movement) {
    return `🎨 ${movement.day} Theme: ${movement.theme} - ${movement.description}`;
}
