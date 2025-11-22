// Service to manage user preference profiles (preferred art movements)
import fs from 'fs';
import path from 'path';

const PREF_FILE = path.resolve('src/data/user_preferences.json');

// Ensure the file exists
function ensureFile() {
    try {
        if (!fs.existsSync(PREF_FILE)) {
            fs.writeFileSync(PREF_FILE, JSON.stringify({}), 'utf8');
        }
    } catch (e) {
        console.error('⚠️ Preference file error:', e.message);
    }
}

export function getPreferences(handle) {
    ensureFile();
    try {
        const data = JSON.parse(fs.readFileSync(PREF_FILE, 'utf8'));
        return data[handle] || [];
    } catch (e) {
        console.error('⚠️ Failed to read preferences:', e.message);
        return [];
    }
}

export function addPreference(handle, movement) {
    ensureFile();
    try {
        const data = JSON.parse(fs.readFileSync(PREF_FILE, 'utf8'));
        const list = data[handle] || [];
        if (!list.includes(movement)) {
            list.push(movement);
        }
        data[handle] = list;
        fs.writeFileSync(PREF_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Preference added for ${handle}: ${movement}`);
    } catch (e) {
        console.error('⚠️ Failed to write preferences:', e.message);
    }
}

export function setPreferences(handle, movements) {
    ensureFile();
    try {
        const data = JSON.parse(fs.readFileSync(PREF_FILE, 'utf8'));
        data[handle] = movements;
        fs.writeFileSync(PREF_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Preferences set for ${handle}`);
    } catch (e) {
        console.error('⚠️ Failed to set preferences:', e.message);
    }
}
