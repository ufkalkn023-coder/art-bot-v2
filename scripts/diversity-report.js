import { db } from '../src/services/databaseService.js';

console.log('\n' + '='.repeat(60));
console.log('📊 DIVERSITY & DISTRIBUTION REPORT');
console.log('='.repeat(60));

// Total tweets
const totalTweets = db.prepare('SELECT COUNT(*) as count FROM tweets').get().count;
console.log(`\n📈 Total Tweets: ${totalTweets}`);

// Movement distribution (from theme)
console.log('\n🎨 MOVEMENT DISTRIBUTION:');
const movements = db.prepare(`
    SELECT movement_theme, COUNT(*) as count 
    FROM tweets 
    WHERE movement_theme IS NOT NULL
    GROUP BY movement_theme 
    ORDER BY count DESC
`).all();

if (movements.length > 0) {
    movements.forEach(m => {
        const percentage = ((m.count / totalTweets) * 100).toFixed(1);
        console.log(`  - ${m.theme || 'Unknown'}: ${m.count} tweets (${percentage}%)`);
    });
} else {
    console.log('  No movement data available');
}

// Museum distribution
console.log('\n🏛️ MUSEUM DISTRIBUTION:');
const museums = db.prepare(`
    SELECT museum, COUNT(*) as count 
    FROM tweets 
    GROUP BY museum 
    ORDER BY count DESC
`).all();

museums.forEach(m => {
    const percentage = ((m.count / totalTweets) * 100).toFixed(1);
    console.log(`  - ${m.museum}: ${m.count} tweets (${percentage}%)`);
});

// Century distribution (from artwork dates)
console.log('\n📅 CENTURY DISTRIBUTION:');
const centuries = db.prepare(`
    SELECT 
        CASE 
            WHEN date LIKE '%14%' THEN '15th Century'
            WHEN date LIKE '%15%' THEN '16th Century'
            WHEN date LIKE '%16%' THEN '17th Century'
            WHEN date LIKE '%17%' THEN '18th Century'
            WHEN date LIKE '%18%' THEN '19th Century'
            WHEN date LIKE '%19%' THEN '20th Century'
            WHEN date LIKE '%20%' THEN '21st Century'
            ELSE 'Unknown'
        END as century,
        COUNT(*) as count
    FROM tweets
    GROUP BY century
    ORDER BY century
`).all();

centuries.forEach(c => {
    const percentage = ((c.count / totalTweets) * 100).toFixed(1);
    console.log(`  - ${c.century}: ${c.count} tweets (${percentage}%)`);
});

// Feature usage
console.log('\n✨ FEATURE USAGE:');
const features = {
    birthday: db.prepare('SELECT COUNT(*) as count FROM tweets WHERE has_birthday = 1').get().count,
    glossary: db.prepare('SELECT COUNT(*) as count FROM tweets WHERE has_glossary = 1').get().count
};

console.log(`  - Birthday messages: ${features.birthday} tweets (${((features.birthday / totalTweets) * 100).toFixed(1)}%)`);
console.log(`  - Glossary terms: ${features.glossary} tweets (${((features.glossary / totalTweets) * 100).toFixed(1)}%)`);

console.log('\n' + '='.repeat(60) + '\n');
