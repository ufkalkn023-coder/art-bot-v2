import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPECIAL_DAYS_FILE = path.resolve(__dirname, '../data/special_days.json');

export function getTodaysSpecialDay() {
    try {
        const data = fs.readFileSync(SPECIAL_DAYS_FILE, 'utf8');
        const { days } = JSON.parse(data);

        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        // Find special day for today
        const specialDay = days.find(d => d.month === month && d.day === day);

        return specialDay || null;
    } catch (error) {
        console.error("⚠️ Error reading special days:", error.message);
        return null;
    }
}

export function formatSpecialDay(day) {
    return day.message;
}
