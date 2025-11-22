import { db } from '../src/services/databaseService.js';

console.log('\n' + '='.repeat(60));
console.log('📅 MONTHLY THEME REPORT (Last 30 Days)');
console.log('='.repeat(60));

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const dateThreshold = thirtyDaysAgo.toISOString();

// Total tweets in last 30 days
const totalTweets = db.prepare(`
    SELECT COUNT(*) as count 
    FROM tweets 
    WHERE timestamp >= ?
`).get(dateThreshold).count;

console.log(`\n📈 Total Tweets (Last 30 Days): ${totalTweets}`);

if (totalTweets === 0) {
    console.log('\n⚠️ No tweets in the last 30 days');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
}

// Most common movement theme
console.log('\n🎨 MOST COMMON MOVEMENT:');
const topMovement = db.prepare(`
    SELECT movement_theme, COUNT(*) as count 
    FROM tweets 
    WHERE timestamp >= ? AND movement_theme IS NOT NULL
    GROUP BY movement_theme 
    ORDER BY count DESC 
    LIMIT 1
`).get(dateThreshold);

if (topMovement) {
    const percentage = ((topMovement.count / totalTweets) * 100).toFixed(1);
    console.log(`  ${topMovement.movement_theme}: ${topMovement.count} tweets (${percentage}%)`);
} else {
    console.log('  No movement data available');
}

// Most active museum
console.log('\n🏛️ MOST ACTIVE MUSEUM:');
const topMuseum = db.prepare(`
    SELECT museum, COUNT(*) as count 
    FROM tweets 
    WHERE timestamp >= ?
    GROUP BY museum 
    ORDER BY count DESC 
    LIMIT 1
`).get(dateThreshold);

if (topMuseum) {
    const percentage = ((topMuseum.count / totalTweets) * 100).toFixed(1);
    console.log(`  ${topMuseum.museum}: ${topMuseum.count} tweets (${percentage}%)`);
}

// Top 3 artists
console.log('\n🏆 TOP 3 ARTISTS:');
const topArtists = db.prepare(`
    SELECT artist, COUNT(*) as count 
    FROM tweets 
    WHERE timestamp >= ?
    GROUP BY artist 
    ORDER BY count DESC 
    LIMIT 3
`).all(dateThreshold);

topArtists.forEach((artist, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
    console.log(`  ${medal} ${artist.artist}: ${artist.count} tweets`);
});

// Average tweet length
const avgLength = db.prepare(`
    SELECT AVG(tweet_length) as avg 
    FROM tweets 
    WHERE timestamp >= ?
`).get(dateThreshold).avg;

console.log(`\n📏 AVERAGE TWEET LENGTH: ${Math.round(avgLength)} characters`);

// Feature usage
console.log('\n✨ FEATURE USAGE:');
const features = {
    birthday: db.prepare(`SELECT COUNT(*) as count FROM tweets WHERE timestamp >= ? AND has_birthday = 1`).get(dateThreshold).count,
    glossary: db.prepare(`SELECT COUNT(*) as count FROM tweets WHERE timestamp >= ? AND has_glossary = 1`).get(dateThreshold).count
};

console.log(`  - Birthday messages: ${features.birthday} (${((features.birthday / totalTweets) * 100).toFixed(1)}%)`);
console.log(`  - Glossary terms: ${features.glossary} (${((features.glossary / totalTweets) * 100).toFixed(1)}%)`);

// Day of week distribution
console.log('\n📅 MOST ACTIVE DAY:');
const tweets = db.prepare(`SELECT timestamp FROM tweets WHERE timestamp >= ?`).all(dateThreshold);
const dayCount = {};
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

tweets.forEach(tweet => {
    const day = new Date(tweet.timestamp).getDay();
    dayCount[day] = (dayCount[day] || 0) + 1;
});

const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
if (mostActiveDay) {
    console.log(`  ${dayNames[mostActiveDay[0]]}: ${mostActiveDay[1]} tweets`);
}

console.log('\n' + '='.repeat(60) + '\n');
