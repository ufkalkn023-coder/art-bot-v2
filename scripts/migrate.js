import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    insertTweet,
    upsertArtist,
    upsertMuseum,
    setState,
    getTweetCount
} from '../src/services/databaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYTICS_FILE = path.resolve(__dirname, '../analytics.json');
const BACKUP_TWEETS_FILE = path.resolve(__dirname, '../backup/tweets.json');
const LAST_RUN_FILE = path.resolve(__dirname, '../last_run.json');

console.log('🔄 Starting SQLite Migration...\n');

let migratedCount = 0;

// 1. Migrate analytics.json
if (fs.existsSync(ANALYTICS_FILE)) {
    console.log('📊 Migrating analytics.json...');
    try {
        const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));

        if (data.tweets && Array.isArray(data.tweets)) {
            data.tweets.forEach(tweet => {
                insertTweet({
                    timestamp: tweet.timestamp,
                    artist: tweet.artist,
                    title: tweet.title,
                    museum: tweet.museum,
                    date: tweet.date || '',
                    tweet_text: '',  // Not stored in analytics.json
                    tweet_length: tweet.tweetLength || 0,
                    link: tweet.link || '',
                    image_path: null,
                    has_birthday: false,
                    has_glossary: false,
                    movement_theme: null
                });

                upsertArtist(tweet.artist);
                upsertMuseum(tweet.museum);
                migratedCount++;
            });
            console.log(`✅ Migrated ${data.tweets.length} tweets from analytics.json`);
        }
    } catch (error) {
        console.error('❌ Error migrating analytics.json:', error.message);
    }
} else {
    console.log('⚠️  analytics.json not found, skipping...');
}

// 2. Migrate backup/tweets.json (has full tweet text)
if (fs.existsSync(BACKUP_TWEETS_FILE)) {
    console.log('\n💾 Migrating backup/tweets.json...');
    try {
        const tweets = JSON.parse(fs.readFileSync(BACKUP_TWEETS_FILE, 'utf8'));

        if (Array.isArray(tweets)) {
            // Get current count to avoid duplicates
            const currentCount = getTweetCount();

            tweets.forEach(item => {
                const artwork = item.artwork;
                insertTweet({
                    timestamp: item.timestamp,
                    artist: artwork.artist,
                    title: artwork.title,
                    museum: artwork.museum,
                    date: artwork.date || '',
                    tweet_text: item.tweetText,
                    tweet_length: item.tweetText.length,
                    link: artwork.link || '',
                    image_path: null,
                    has_birthday: false,
                    has_glossary: false,
                    movement_theme: null
                });

                upsertArtist(artwork.artist);
                upsertMuseum(artwork.museum);
            });

            const newCount = getTweetCount();
            console.log(`✅ Migrated ${newCount - currentCount} additional tweets from backup`);
        }
    } catch (error) {
        console.error('❌ Error migrating backup/tweets.json:', error.message);
    }
} else {
    console.log('⚠️  backup/tweets.json not found, skipping...');
}

// 3. Migrate last_run.json
if (fs.existsSync(LAST_RUN_FILE)) {
    console.log('\n⏰ Migrating last_run.json...');
    try {
        const data = JSON.parse(fs.readFileSync(LAST_RUN_FILE, 'utf8'));
        if (data.lastRun) {
            setState('last_run', data.lastRun);
            console.log(`✅ Migrated last run time: ${data.lastRun}`);
        }
    } catch (error) {
        console.error('❌ Error migrating last_run.json:', error.message);
    }
} else {
    console.log('⚠️  last_run.json not found, skipping...');
}

// 4. Summary
console.log('\n' + '='.repeat(50));
console.log('✨ Migration Complete!');
console.log('='.repeat(50));
console.log(`📊 Total tweets in database: ${getTweetCount()}`);
console.log('\n💡 Next steps:');
console.log('   1. Verify data with: npm run db-stats');
console.log('   2. Test bot with: DRY_RUN=true npm start');
console.log('   3. JSON files are kept as backup');
console.log('='.repeat(50) + '\n');
