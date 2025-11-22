import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIRTHDAY_FILE = path.resolve(__dirname, '../data/artist_birthdays.json');

export function getTodaysBirthdayArtist() {
    try {
        const data = fs.readFileSync(BIRTHDAY_FILE, 'utf8');
        const { artists } = JSON.parse(data);

        const today = new Date();
        const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const birthdayArtist = artists.find(artist => artist.birthDate === todayStr);

        if (birthdayArtist) {
            const age = today.getFullYear() - birthdayArtist.birthYear;
            return {
                ...birthdayArtist,
                age,
                isBirthday: true
            };
        }

        return null;
    } catch (error) {
        console.error("⚠️ Error reading birthday data:", error.message);
        return null;
    }
}

export function getBirthdayMessage(artist) {
    const age = new Date().getFullYear() - artist.birthYear;
    return `🎂 Today marks ${age} years since ${artist.name} was born! (${artist.birthYear}-${artist.deathYear})`;
}
