import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../../data/artbot.db');
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS tweets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            artist TEXT NOT NULL,
            title TEXT NOT NULL,
            museum TEXT NOT NULL,
            date TEXT,
            tweet_text TEXT NOT NULL,
            tweet_length INTEGER,
            link TEXT,
            image_path TEXT,
            image_size INTEGER,
            has_birthday BOOLEAN DEFAULT 0,
            has_glossary BOOLEAN DEFAULT 0,
            movement_theme TEXT,
            dominant_color TEXT
        );

        CREATE TABLE IF NOT EXISTS artists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            tweet_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS museums (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            tweet_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS state (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_tweets_timestamp ON tweets(timestamp);
        CREATE INDEX IF NOT EXISTS idx_tweets_artist ON tweets(artist);
        CREATE INDEX IF NOT EXISTS idx_tweets_museum ON tweets(museum);
    `);

    // Migration: Add image_size column if it doesn't exist
    try {
        db.exec("ALTER TABLE tweets ADD COLUMN image_size INTEGER");
    } catch (error) { }

    // Migration: Add dominant_color column if it doesn't exist
    try {
        db.exec("ALTER TABLE tweets ADD COLUMN dominant_color TEXT");
    } catch (error) { }
}

// Initialize on import
initializeDatabase();

// ==================== TWEETS ====================

export function insertTweet(tweetData) {
    const stmt = db.prepare(`
        INSERT INTO tweets (
            timestamp, artist, title, museum, date, 
            tweet_text, tweet_length, link, image_path, image_size,
            has_birthday, has_glossary, movement_theme, dominant_color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
        tweetData.timestamp,
        tweetData.artist,
        tweetData.title,
        tweetData.museum,
        tweetData.date,
        tweetData.tweet_text,
        tweetData.tweet_length,
        tweetData.link,
        tweetData.image_path || null,
        tweetData.image_size || 0,
        tweetData.has_birthday ? 1 : 0,
        tweetData.has_glossary ? 1 : 0,
        tweetData.movement_theme || null,
        tweetData.dominant_color || null
    );
}

export function getAllTweets() {
    return db.prepare('SELECT * FROM tweets ORDER BY timestamp DESC').all();
}

export function getTweetCount() {
    return db.prepare('SELECT COUNT(*) as count FROM tweets').get().count;
}

export function getRecentTweets(limit = 10) {
    return db.prepare('SELECT * FROM tweets ORDER BY timestamp DESC LIMIT ?').all(limit);
}

export function getTotalImageSize() {
    const result = db.prepare('SELECT SUM(image_size) as total_size FROM tweets').get();
    return result.total_size || 0;
}

// ==================== ARTISTS ====================

export function upsertArtist(artistName) {
    const stmt = db.prepare(`
        INSERT INTO artists (name, tweet_count) VALUES (?, 1)
        ON CONFLICT(name) DO UPDATE SET tweet_count = tweet_count + 1
    `);
    return stmt.run(artistName);
}

export function getTopArtists(limit = 5) {
    return db.prepare(`
        SELECT name, tweet_count 
        FROM artists 
        ORDER BY tweet_count DESC 
        LIMIT ?
    `).all(limit);
}

export function getAllArtists() {
    return db.prepare('SELECT * FROM artists ORDER BY tweet_count DESC').all();
}

// ==================== MUSEUMS ====================

export function upsertMuseum(museumName) {
    const stmt = db.prepare(`
        INSERT INTO museums (name, tweet_count) VALUES (?, 1)
        ON CONFLICT(name) DO UPDATE SET tweet_count = tweet_count + 1
    `);
    return stmt.run(museumName);
}

export function getMuseumDistribution() {
    return db.prepare(`
        SELECT name, tweet_count 
        FROM museums 
        ORDER BY tweet_count DESC
    `).all();
}

// ==================== STATE ====================

export function setState(key, value) {
    const stmt = db.prepare(`
        INSERT INTO state (key, value, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
    `);
    const now = new Date().toISOString();
    return stmt.run(key, value, now, value, now);
}

export function getState(key) {
    const result = db.prepare('SELECT value FROM state WHERE key = ?').get(key);
    return result ? result.value : null;
}

// ==================== ANALYTICS ====================

export function getAnalytics() {
    const totalTweets = getTweetCount();
    const topArtists = getTopArtists(5);
    const museums = getMuseumDistribution();

    // Day of week analysis
    const tweets = getAllTweets();
    const dayCount = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    tweets.forEach(tweet => {
        const day = new Date(tweet.timestamp).getDay();
        dayCount[day] = (dayCount[day] || 0) + 1;
    });

    const mostActiveDay = Object.entries(dayCount)
        .sort((a, b) => b[1] - a[1])[0];

    // Average tweet length
    const avgLength = tweets.length > 0
        ? Math.round(tweets.reduce((sum, t) => sum + (t.tweet_length || 0), 0) / tweets.length)
        : 0;

    return {
        totalTweets,
        topArtists,
        museums,
        mostActiveDay: mostActiveDay ? {
            day: dayNames[mostActiveDay[0]],
            count: mostActiveDay[1]
        } : null,
        avgLength
    };
}

export function getMonthlyTweetCount() {
    const result = db.prepare(`
        SELECT COUNT(*) as count 
        FROM tweets 
        WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now')
    `).get();
    return result.count;
}

export function checkQuota(limit = 495) {
    const count = getMonthlyTweetCount();
    if (count >= limit) {
        return { allowed: false, count, limit };
    }
    return { allowed: true, count, limit };
}

export function getColorStats() {
    const rows = db.prepare(`
        SELECT dominant_color, COUNT(*) as count
        FROM tweets
        WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now')
          AND dominant_color IS NOT NULL
        GROUP BY dominant_color
        ORDER BY count DESC
    `).all();

    const total = rows.reduce((sum, r) => sum + r.count, 0);

    const topColors = rows.map(r => ({
        color: r.dominant_color,
        percentage: ((r.count / total) * 100).toFixed(1)
    }));

    return {
        topColors,
        dominantMood: rows.length > 0 ? `${rows[0].dominant_color} Period` : 'Eclectic'
    };
}

// Export database instance for advanced queries
export { db };
