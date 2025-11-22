import fs from 'fs';
import path from 'path';
import {
    insertTweet,
    upsertArtist,
    upsertMuseum,
    getAnalytics,
    getTotalImageSize,
    getColorStats
} from './databaseService.js';

const BACKUP_DIR = path.resolve('backup');
const BACKUP_TWEETS_FILE = path.join(BACKUP_DIR, 'tweets.json');
const BACKUP_IMAGES_DIR = path.join(BACKUP_DIR, 'images');

export async function trackTweet(artwork, tweetText, hasBirthday = false, hasGlossary = false, movementTheme = null, imageSize = 0, imageBuffer = null) {
    // Extract dominant color if image buffer is provided
    let dominantColor = null;
    if (imageBuffer) {
        dominantColor = await extractDominantColor(imageBuffer);
    }

    // Insert into database
    insertTweet({
        timestamp: new Date().toISOString(),
        artist: artwork.artist,
        title: artwork.title,
        museum: artwork.museum,
        date: artwork.date,
        tweet_text: tweetText,
        tweet_length: tweetText.length,
        link: artwork.link,
        image_path: null,
        image_size: imageSize,
        has_birthday: hasBirthday,
        has_glossary: hasGlossary,
        movement_theme: movementTheme,
        dominant_color: dominantColor
    });

    // Update artist and museum counts
    upsertArtist(artwork.artist);
    upsertMuseum(artwork.museum);

    console.log("📊 Analytics updated");
}

export function backupTweet(artwork, tweetText, imageBuffer) {
    try {
        // Backup tweet data to JSON (for redundancy)
        let tweets = [];
        if (fs.existsSync(BACKUP_TWEETS_FILE)) {
            const data = fs.readFileSync(BACKUP_TWEETS_FILE, 'utf8');
            tweets = JSON.parse(data);
        }

        tweets.push({
            timestamp: new Date().toISOString(),
            artwork,
            tweetText
        });

        fs.writeFileSync(BACKUP_TWEETS_FILE, JSON.stringify(tweets, null, 2));

        // Backup image
        const timestamp = Date.now();
        const imagePath = path.join(BACKUP_IMAGES_DIR, `${timestamp}.jpg`);
        fs.writeFileSync(imagePath, imageBuffer);

        console.log("💾 Backup saved");
    } catch (error) {
        console.error("❌ Backup failed:", error.message);
    }
}

export function generateReport() {
    const analytics = getAnalytics();
    const totalBytes = getTotalImageSize();
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(4);

    console.log("\n" + "=".repeat(50));
    console.log("📊 ANALYTICS LEADERBOARD & REPORT");
    console.log("=".repeat(50));

    console.log(`\n📈 Total Tweets Posted: ${analytics.totalTweets}`);
    console.log(`💾 Total Storage Used: ${totalMB} MB (${totalGB} GB)`);

    // Top 5 Artists
    if (analytics.topArtists && analytics.topArtists.length > 0) {
        console.log("\n🏆 TOP 5 ARTISTS:");
        analytics.topArtists.forEach((artist, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
            console.log(`  ${medal} ${artist.name}: ${artist.tweet_count} tweets`);
        });
    }

    // Museum Distribution
    if (analytics.museums && analytics.museums.length > 0) {
        console.log("\n🏛️ MUSEUM DISTRIBUTION:");
        analytics.museums.forEach(museum => {
            const percentage = ((museum.tweet_count / analytics.totalTweets) * 100).toFixed(1);
            console.log(`  - ${museum.name}: ${museum.tweet_count} tweets (${percentage}%)`);
        });
    }

    // Day of Week Analysis
    if (analytics.mostActiveDay) {
        console.log(`\n📅 MOST ACTIVE DAY: ${analytics.mostActiveDay.day} (${analytics.mostActiveDay.count} tweets)`);
    }

    // Average tweet length
    console.log(`\n📏 AVERAGE TWEET LENGTH: ${analytics.avgLength} characters`);

    // Color Analysis
    const colorStats = getColorStats();
    if (colorStats && colorStats.topColors.length > 0) {
        console.log("\n🎨 COLOR PALETTE OF THE MONTH:");
        colorStats.topColors.forEach(c => {
            console.log(`  - ${c.color}: ${c.percentage}%`);
        });
        console.log(`  ✨ Dominant Mood: ${colorStats.dominantMood}`);
    }

    console.log("\n" + "=".repeat(50) + "\n");
}

// --- Color Analysis Helpers ---

import sharp from 'sharp';

export async function extractDominantColor(imageBuffer) {
    try {
        const stats = await sharp(imageBuffer).stats();
        const { r, g, b } = stats.channels.map(c => c.mean);
        return getColorName(r, g, b);
    } catch (e) {
        return null;
    }
}

function getColorName(r, g, b) {
    // Simple Euclidean distance to nearest named color
    const colors = {
        'Red': [255, 0, 0],
        'Green': [0, 255, 0],
        'Blue': [0, 0, 255],
        'Yellow': [255, 255, 0],
        'Cyan': [0, 255, 255],
        'Magenta': [255, 0, 255],
        'White': [255, 255, 255],
        'Black': [0, 0, 0],
        'Gray': [128, 128, 128],
        'Orange': [255, 165, 0],
        'Purple': [128, 0, 128],
        'Brown': [165, 42, 42],
        'Gold': [255, 215, 0],
        'Beige': [245, 245, 220]
    };

    let minDist = Infinity;
    let closest = 'Unknown';

    for (const [name, rgb] of Object.entries(colors)) {
        const dist = Math.sqrt(
            Math.pow(r - rgb[0], 2) +
            Math.pow(g - rgb[1], 2) +
            Math.pow(b - rgb[2], 2)
        );
        if (dist < minDist) {
            minDist = dist;
            closest = name;
        }
    }
    return closest;
}
