import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { CONFIG } from '../config.js';

let client;
let rwClient;

if (CONFIG.TWITTER.API_KEY) {
    client = new TwitterApi({
        appKey: CONFIG.TWITTER.API_KEY,
        appSecret: CONFIG.TWITTER.API_SECRET,
        accessToken: CONFIG.TWITTER.ACCESS_TOKEN,
        accessSecret: CONFIG.TWITTER.ACCESS_SECRET,
    });
    rwClient = client.readWrite;
}

export async function postTweet(tweetText, mediaBufferOrBuffers, altTextOrTexts) {
    const isMulti = Array.isArray(mediaBufferOrBuffers);
    const buffers = isMulti ? mediaBufferOrBuffers : [mediaBufferOrBuffers];
    const altTexts = isMulti ? altTextOrTexts : [altTextOrTexts];

    if (CONFIG.DRY_RUN) {
        console.log("----- DRY RUN MODE -----");
        console.log("Tweet Text:\n", tweetText);
        console.log(`Media Count: ${buffers.length}`);
        buffers.forEach((buf, i) => {
            console.log(`Image ${i + 1} Buffer Size: ${buf.length} bytes`);
            console.log(`Image ${i + 1} Alt Text: ${altTexts[i] || 'None'}`);
        });
        console.log("------------------------");
        return;
    }

    if (!rwClient) {
        throw new Error("Twitter client not initialized. Check API keys.");
    }

    try {
        // 1. Upload All Media
        const mediaIds = await Promise.all(buffers.map(async (buffer, index) => {
            const mediaId = await rwClient.v1.uploadMedia(buffer, { type: 'jpg' });

            // 2. Add Alt Text for each
            if (altTexts[index]) {
                await rwClient.v1.createMediaMetadata(mediaId, {
                    alt_text: { text: altTexts[index] }
                });
            }
            return mediaId;
        }));

        // 3. Post Tweet with all media IDs
        await rwClient.v2.tweet({
            text: tweetText,
            media: { media_ids: mediaIds }
        });

        console.log(`✅ Tweet successfully posted with ${mediaIds.length} images!`);

    } catch (error) {
        console.error("❌ Error posting tweet:", error);

        // Error Handling for 429 (Rate Limit) and 500 (Server Error)
        if (error.code === 429 || error.code === 500) {
            console.warn(`⚠️ Encountered ${error.code} error. Waiting for 15 minutes before retrying is recommended (handled by scheduler).`);
            // In a loop mode, we might want to pause, but since this is triggered by scheduler, 
            // we just throw so the main loop knows it failed. 
            // The scheduler should respect the 'last run' time.
        }
        throw error;
    }
}

/**
 * NOTE: Auto-replies are disabled to save API usage.
 * Manual replies should be done via X Pro (TweetDeck).
 */
