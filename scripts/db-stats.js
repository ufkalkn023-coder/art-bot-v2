import { getAnalytics } from '../src/services/databaseService.js';

const analytics = getAnalytics();

console.log('\n' + '='.repeat(50));
console.log('📊 DATABASE STATISTICS');
console.log('='.repeat(50));

console.log(`\n📈 Total Tweets: ${analytics.totalTweets}`);

if (analytics.topArtists && analytics.topArtists.length > 0) {
    console.log('\n🏆 TOP 5 ARTISTS:');
    analytics.topArtists.forEach((artist, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        console.log(`  ${medal} ${artist.name}: ${artist.tweet_count} tweets`);
    });
}

if (analytics.museums && analytics.museums.length > 0) {
    console.log('\n🏛️ MUSEUM DISTRIBUTION:');
    analytics.museums.forEach(museum => {
        const percentage = ((museum.tweet_count / analytics.totalTweets) * 100).toFixed(1);
        console.log(`  - ${museum.name}: ${museum.tweet_count} tweets (${percentage}%)`);
    });
}

if (analytics.mostActiveDay) {
    console.log(`\n📅 MOST ACTIVE DAY: ${analytics.mostActiveDay.day} (${analytics.mostActiveDay.count} tweets)`);
}

console.log(`\n📏 AVERAGE TWEET LENGTH: ${analytics.avgLength} characters`);

console.log('\n' + '='.repeat(50) + '\n');
