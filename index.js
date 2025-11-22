import { validateConfig } from './src/config.js';
import { getPreferences } from './src/services/userPreferenceService.js';
import { shouldRunNow } from './src/services/scheduledExhibitionService.js';
import { fetchArtwork } from './src/services/artService.js';
import { generateArtContent } from './src/services/geminiService.js';
import { postTweet } from './src/services/twitterService.js';
import { shouldRun, updateLastRunTime } from './src/utils/state.js';
import { getTodaysBirthdayArtist, getBirthdayMessage } from './src/services/birthdayService.js';
import { downloadAndEnhanceImage } from './src/services/imageService.js';
import { trackTweet, backupTweet, generateReport } from './src/services/analyticsService.js';
import { logInfo, logWarn, logError, logSuccess } from './src/utils/logger.js';
import { getTodaysMovement, getMovementMessage } from './src/services/movementService.js';
import { getRandomGlossaryTerm, formatGlossaryTerm } from './src/services/glossaryService.js';
import { generateExhibition } from './src/services/exhibitionService.js';
import process from 'process';

async function runBot() {
    logInfo("🚀 Art Bot Triggered");

    // 1. Check Schedule with Jitter
    // Jitter: Randomly add/subtract up to 15 minutes to the schedule check
    // This makes the bot appear more human-like.
    const jitterMinutes = Math.floor(Math.random() * 31) - 15; // -15 to +15

    // We pass the jitter to the state check if needed, or just sleep if we are in a loop.
    // Since 'shouldRun' checks the last run time, we can just add a random delay before starting the actual work
    // if we are running in a loop. But for a cron-triggered script, we might want to sleep.

    if (process.env.LOOP === 'true') {
        // In loop mode, the interval handles the timing, but we can add a small random delay
        // before executing the core logic to vary the exact second/minute.
        const delayMs = Math.abs(jitterMinutes) * 60 * 1000;
        if (jitterMinutes > 0) {
            logInfo(`⏳ Jitter: Waiting ${jitterMinutes} minutes before starting...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    const check = shouldRun();
    if (!check.allowed) {
        logWarn(`SCHEDULING: ${check.reason} - Exiting`);
        return;
    }

    // Check Quota
    const { checkQuota } = await import('./src/services/databaseService.js');
    const quota = checkQuota();
    if (!quota.allowed) {
        logError(`⛔ Monthly Quota Exceeded: ${quota.count}/${quota.limit}. Stopping.`);
        // TODO: Send email notification here if configured
        return;
    }

    // 2. Validate Config
    validateConfig();

    try {
        // 3. Get Today's Movement Theme
        const todaysMovement = getTodaysMovement();
        if (todaysMovement) {
            logInfo(getMovementMessage(todaysMovement));
        }

        // 4. Check for Artist Birthday
        const birthdayArtist = getTodaysBirthdayArtist();
        if (birthdayArtist) {
            logInfo(`🎂 Birthday detected: ${birthdayArtist.name}`, birthdayArtist);
        }

        // 5. Check for Scheduled Mini Exhibition
        if (shouldRunNow()) {
            logInfo("🗓️ Scheduled Mini Exhibition triggered");
            const prefs = getPreferences(process.env.BOT_HANDLE || 'default');
            const exhibition = await generateExhibition(prefs);
            if (exhibition) {
                logInfo("📝 Generated Exhibition Text", { length: exhibition.text.length });
                logInfo("🐦 Posting exhibition tweet...");
                await postTweet(exhibition.text, exhibition.images, exhibition.altTexts);
                trackTweet(
                    { title: "Mini Exhibition", artist: "Various", museum: "Various" },
                    exhibition.text,
                    false,
                    false,
                    "Mini Exhibition",
                    exhibition.images.reduce((acc, buf) => acc + buf.length, 0)
                );
                updateLastRunTime();
                logSuccess("✨ Scheduled Mini Exhibition posted successfully!");
                return;
            } else {
                logWarn("⚠️ Scheduled Mini Exhibition generation failed, falling back to standard mode.");
            }
        }
        // 6. Random Mini Exhibition (10% Chance) – kept for testing
        const randomExhibition = Math.random();
        if (randomExhibition < 0.10) {
            logInfo("🖼️ Triggering Random Mini Exhibition Mode...");
            const exhibition = await generateExhibition();
            if (exhibition) {
                logInfo("📝 Generated Exhibition Text", { length: exhibition.text.length });
                await postTweet(exhibition.text, exhibition.images, exhibition.altTexts);
                trackTweet(
                    { title: "Mini Exhibition", artist: "Various", museum: "Various" },
                    exhibition.text,
                    false,
                    false,
                    "Mini Exhibition",
                    exhibition.images.reduce((acc, buf) => acc + buf.length, 0)
                );
                updateLastRunTime();
                logSuccess("✨ Random Mini Exhibition posted successfully!");
                return;
            } else {
                logWarn("⚠️ Random Mini Exhibition generation failed, falling back to standard mode.");
            }
        }

        // 7. Evolution Series (5% Chance) - NEW
        const randomEvolution = Math.random();
        if (randomEvolution < 0.05) {
            logInfo("🧬 Triggering Evolution Series Mode...");
            const { generateEvolutionSeries } = await import('./src/services/evolutionService.js');
            const evolution = await generateEvolutionSeries();

            if (evolution) {
                logInfo("📝 Generated Evolution Series Text", { length: evolution.text.length });
                await postTweet(evolution.text, evolution.mediaBuffer, evolution.altText);
                trackTweet(
                    { title: "Evolution Series", artist: "Various", museum: "Various" },
                    evolution.text,
                    false,
                    false,
                    "Evolution Series",
                    evolution.mediaBuffer.length
                );
                updateLastRunTime();
                logSuccess("✨ Evolution Series posted successfully!");
                return;
            } else {
                logWarn("⚠️ Evolution Series generation failed, falling back to standard mode.");
            }
        }

        // 8. Forgotten Artists Spotlight (REMOVED)
        // Feature removed as per user request.


        // 9. Standard Flow: Fetch Artwork
        logInfo("🎨 Searching for artwork...");
        const artwork = await fetchArtwork();

        if (!artwork) {
            logError("No artwork found from any museum");
            return;
        }
        logSuccess(`Found: ${artwork.title} - ${artwork.artist}`);

        // 10. Download and Enhance Image
        logInfo("📸 Enhancing image...");
        const imageBuffer = await downloadAndEnhanceImage(artwork.imageUrl);

        // 11. Generate Content (AI with Vision)
        logInfo("🧠 Generating AI content with vision analysis...");
        const baseTweetText = await generateArtContent(artwork, artwork.imageUrl);

        // 12. Smart Feature Rotation
        logInfo("🎲 Selecting optional features...");
        const { selectOptionalFeatures } = await import('./src/services/rotationService.js');
        const movementTheme = todaysMovement ? todaysMovement.theme : null;

        // Check for Wallpaper Mode
        const { checkWallpaperReady } = await import('./src/services/imageService.js');

        const { default: sharp } = await import('sharp');
        const metadata = await sharp(imageBuffer).metadata();
        const isWallpaper = checkWallpaperReady(metadata.width, metadata.height);

        if (isWallpaper) {
            const wallpaperMessages = [
                "📱 This masterpiece is perfectly sized for your phone wallpaper. No cropping needed! ✨",
                "📱 Need a new lock screen? This artwork fits 9:16 screens perfectly. ✨",
                "📱 Art in your pocket. This piece is wallpaper-ready! ✨",
                "📱 A perfect fit for your mobile screen. Enjoy this masterpiece daily! ✨",
                "📱 Vertical perfection. Make this your new wallpaper today. ✨"
            ];
            const randomMsg = wallpaperMessages[Math.floor(Math.random() * wallpaperMessages.length)];
            features.finalText += `\n\n${randomMsg}`;
            features.usedFeatures.push('wallpaper_mode');
        }

        // Add Creative Concepts to Rotation
        const features = selectOptionalFeatures(baseTweetText, artwork, movementTheme);

        // 10% chance for Time Capsule
        if (Math.random() < 0.10) {
            const { generateTimeCapsule } = await import('./src/services/geminiService.js');
            const capsuleText = await generateTimeCapsule(artwork);
            if (capsuleText) {
                features.finalText += `\n\n${capsuleText}`;
                features.usedFeatures.push('time_capsule');
            }
        }

        // 10% chance for Detail Zoom (Phase 2)
        if (Math.random() < 0.10 && !features.usedFeatures.includes('time_capsule')) {
            const { createDetailCrop } = await import('./src/services/imageService.js');
            const { generateDetailZoomText } = await import('./src/services/geminiService.js');

            const detailCrop = await createDetailCrop(imageBuffer);
            if (detailCrop) {
                const zoomText = await generateDetailZoomText(artwork);
                if (zoomText) {
                    features.finalText = zoomText; // Replace text for this mode
                    features.detailCrop = detailCrop;
                    features.usedFeatures.push('detail_zoom');
                }
            }
        }

        // 10% chance for Interactive Quiz (Phase 2)
        if (Math.random() < 0.10 && features.usedFeatures.length === 0) { // Only if no other feature used
            const { generateQuizText } = await import('./src/services/geminiService.js');
            const quizText = await generateQuizText(artwork);
            if (quizText) {
                features.finalText = quizText; // Replace text for this mode
                features.usedFeatures.push('interactive_quiz');
            }
        }

        // 5% chance for Quartet Mode (4-Photo) - NEW
        if (Math.random() < 0.05 && features.usedFeatures.length === 0) {
            logInfo("🖼️ Triggering Quartet Mode (4-Photo)...");
            const { fetchRandomQuartet } = await import('./src/services/artService.js');
            const quartet = await fetchRandomQuartet();

            if (quartet) {
                logInfo(`✅ Fetched quartet: ${quartet.map(a => a.title).join(', ')}`);

                // Download all images
                const imageBuffers = [];
                const altTexts = [];
                for (const art of quartet) {
                    try {
                        const buf = await downloadAndEnhanceImage(art.imageUrl);
                        imageBuffers.push(buf);
                        altTexts.push(`${art.title} by ${art.artist}`);
                    } catch (e) {
                        console.error(`Failed to download image for quartet: ${art.title}`);
                    }
                }

                if (imageBuffers.length === 4) {
                    const quartetText = `🎨 Art Quartet of the Moment\n\n` +
                        `1️⃣ ${quartet[0].title} - ${quartet[0].artist}\n` +
                        `2️⃣ ${quartet[1].title} - ${quartet[1].artist}\n` +
                        `3️⃣ ${quartet[2].title} - ${quartet[2].artist}\n` +
                        `4️⃣ ${quartet[3].title} - ${quartet[3].artist}\n\n` +
                        `#ArtQuartet #DailyArt`;

                    logInfo("🐦 Posting Quartet tweet...");
                    await postTweet(quartetText, imageBuffers, altTexts);

                    trackTweet(
                        { title: "Art Quartet", artist: "Various", museum: "Various" },
                        quartetText,
                        false,
                        false,
                        "Quartet",
                        imageBuffers.reduce((acc, buf) => acc + buf.length, 0)
                    );
                    updateLastRunTime();
                    logSuccess("✨ Quartet Mode posted successfully!");
                    return; // Exit main flow
                }
            }
        }

        const tweetText = features.finalText;

        // Log which features were added
        if (features.usedFeatures.length > 0) {
            logInfo(`✨ Added features: ${features.usedFeatures.join(', ')}`);
        }

        logInfo("📝 Generated Text", { length: tweetText.length });

        // 13. Backup
        backupTweet(artwork, tweetText, imageBuffer);

        // 14. Post Tweet
        logInfo("🐦 Posting tweet...");

        // Handle Detail Zoom (Multi-image)
        if (features.usedFeatures.includes('detail_zoom') && features.detailCrop) {
            await postTweet(tweetText, [imageBuffer, features.detailCrop], [`${artwork.title} - Full`, `Detail of ${artwork.title}`]);
        } else {
            await postTweet(tweetText, imageBuffer, `${artwork.title} by ${artwork.artist}`);
        }

        // 15. Track Analytics (with feature usage)
        const hasBirthday = features.usedFeatures.includes('birthday');
        const hasGlossary = features.usedFeatures.includes('glossary');
        trackTweet(artwork, tweetText, hasBirthday, hasGlossary, movementTheme, imageBuffer.length, imageBuffer);

        // 16. Update State
        updateLastRunTime();
        logSuccess("✨ Process completed successfully!");

    } catch (error) {
        logError("Unexpected error occurred", error);
    }
}

async function main() {
    // Initial run
    await runBot();

    // Loop Mode
    if (process.env.LOOP === 'true') {
        // 14 tweets per 24 hours = 1 tweet every ~102.8 minutes (approx 103 mins)
        // 103 minutes = 103 * 60 * 1000 = 6180000 ms
        const INTERVAL_MS = 6180000;

        logInfo(`🔄 LOOP MODE ACTIVE: Bot will check every 103 minutes (14 tweets/day)`);
        setInterval(async () => {
            await runBot();
        }, INTERVAL_MS);
    }

    // Generate report on exit (Ctrl+C)
    process.on('SIGINT', () => {
        console.log("\n\n");
        generateReport();
        process.exit(0);
    });
}

main();
