import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

export const CONFIG = {
    TWITTER: {
        API_KEY: process.env.TWITTER_API_KEY,
        API_SECRET: process.env.TWITTER_API_SECRET,
        ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
        ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET,
    },
    GEMINI: {
        API_KEY: process.env.GEMINI_API_KEY,
    },
    AXIOS: {
        timeout: 15000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    },
    DRY_RUN: process.env.DRY_RUN === 'true',
    // Schedule for Mini Exhibition: first Monday of each month at 09:00
    SCHEDULED_EXHIBITION: {
        dayOfWeek: 1, // Monday (0=Sunday)
        weekOfMonth: 1, // first week
        hour: 9,
        minute: 0
    }

};

export function validateConfig() {
    const missingKeys = [];
    if (!CONFIG.TWITTER.API_KEY) missingKeys.push('TWITTER_API_KEY');
    if (!CONFIG.TWITTER.API_SECRET) missingKeys.push('TWITTER_API_SECRET');
    if (!CONFIG.TWITTER.ACCESS_TOKEN) missingKeys.push('TWITTER_ACCESS_TOKEN');
    if (!CONFIG.TWITTER.ACCESS_SECRET) missingKeys.push('TWITTER_ACCESS_SECRET');

    // Gemini key is optional for now if we want to allow running without it (fallback to basic), 
    // but for this plan it's required.
    if (!CONFIG.GEMINI.API_KEY) missingKeys.push('GEMINI_API_KEY');

    if (CONFIG.DRY_RUN) {
        console.warn("⚠️ DRY RUN MODE: Skipping API key validation.");
        return;
    }

    if (missingKeys.length > 0) {
        console.error(`❌ HATA: Eksik API Anahtarları: ${missingKeys.join(', ')}`);
        process.exit(1);
    }
}
