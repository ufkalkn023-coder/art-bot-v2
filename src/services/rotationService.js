import { getTodaysBirthdayArtist, getBirthdayMessage } from './birthdayService.js';
import { getRandomGlossaryTerm, formatGlossaryTerm } from './glossaryService.js';
import { getTodaysEvent, formatHistoryEvent } from './historyService.js';
import { getRandomQuote, formatQuote } from './quoteService.js';
import { getRandomTrivia, formatTrivia } from './triviaService.js';
import { getTodaysSpecialDay, formatSpecialDay } from './specialDaysService.js';
import { checkAnniversary, formatAnniversary } from './anniversaryService.js';
import { selectHashtags, formatHashtags } from './hashtagService.js';
import { getRandomLesson, formatLesson } from './lessonService.js';
import { getRandomSymbol, formatSymbol } from './symbolService.js';
import { getRandomColorFact, formatColorFact } from './colorTheoryService.js';
import { getRandomComposition, formatComposition } from './compositionService.js';
import { getPopCultureConnection, formatPopCulture } from './popCultureService.js';
import { getArtistComparison, formatComparison } from './comparisonService.js';
import { getRestorationInfo, formatRestoration } from './restorationService.js';

const MAX_TWEET_LENGTH = 280;
const SAFE_LENGTH = 240; // Reduced to account for hashtags

/**
 * Smart rotation system to add optional features to tweets
 * Ensures character limit is never exceeded
 */
export function selectOptionalFeatures(baseTweetText, artwork, movement) {
    const features = {
        specialDay: null,
        birthday: null,
        anniversary: null,
        glossary: null,
        history: null,
        quote: null,
        trivia: null,
        lesson: null,
        symbol: null,
        colorFact: null,
        composition: null,
        popCulture: null,
        comparison: null,
        restoration: null,
        hashtags: null,
        usedFeatures: []
    };

    let currentText = baseTweetText;

    // 1. HIGHEST PRIORITY: Special Day (Christmas, World Art Day, etc.)
    const specialDay = getTodaysSpecialDay();
    if (specialDay && specialDay.priority === 'high') {
        const dayMsg = formatSpecialDay(specialDay);
        const testText = `${dayMsg}\n\n${currentText}`;

        if (testText.length <= SAFE_LENGTH) {
            features.specialDay = dayMsg;
            currentText = testText;
            features.usedFeatures.push('specialDay');
        }
    }

    // 2. HIGH PRIORITY: Birthday (if applicable and matches artist)
    const birthdayArtist = getTodaysBirthdayArtist();
    if (birthdayArtist && artwork.artist.includes(birthdayArtist.name)) {
        const birthdayMsg = `🎂 ${getBirthdayMessage(birthdayArtist)}`;
        const testText = features.specialDay
            ? currentText
            : `${birthdayMsg}\n\n${currentText}`;

        if (testText.length <= SAFE_LENGTH && !features.specialDay) {
            features.birthday = birthdayMsg;
            currentText = testText;
            features.usedFeatures.push('birthday');
        }
    }

    // 3. MEDIUM PRIORITY: Anniversary (100, 200, 300 years ago)
    const anniversary = checkAnniversary(artwork);
    if (anniversary && !features.birthday && !features.specialDay) {
        const annivText = formatAnniversary(anniversary);
        const testText = currentText + annivText;

        if (testText.length <= SAFE_LENGTH) {
            features.anniversary = annivText;
            currentText = testText;
            features.usedFeatures.push('anniversary');
        }
    }

    // 4. Random feature selection (only one additional feature)
    const random = Math.random();

    // 25% chance: Glossary term
    if (random < 0.25) {
        const glossaryTerm = getRandomGlossaryTerm();
        if (glossaryTerm) {
            const termText = formatGlossaryTerm(glossaryTerm);
            const testText = currentText + termText;

            if (testText.length <= SAFE_LENGTH) {
                features.glossary = termText;
                currentText = testText;
                features.usedFeatures.push('glossary');
            }
        }
    }
    // 45% chance (25-45%): Artist quote
    else if (random < 0.45) {
        const quote = getRandomQuote();
        if (quote) {
            const quoteText = formatQuote(quote);
            const testText = currentText + quoteText;

            if (testText.length <= SAFE_LENGTH) {
                features.quote = quoteText;
                currentText = testText;
                features.usedFeatures.push('quote');
            }
        }
    }
    // 60% chance (45-60%): Historical event
    else if (random < 0.60) {
        const event = getTodaysEvent();
        if (event) {
            const eventText = formatHistoryEvent(event);
            const testText = currentText + eventText;

            if (testText.length <= SAFE_LENGTH) {
                features.history = eventText;
                currentText = testText;
                features.usedFeatures.push('history');
            }
        }
    }
    // 70% chance (60-70%): Trivia
    else if (random < 0.70) {
        const trivia = getRandomTrivia();
        if (trivia) {
            const triviaText = formatTrivia(trivia);
            const testText = currentText + triviaText;

            if (testText.length <= SAFE_LENGTH) {
                features.trivia = triviaText;
                currentText = testText;
                features.usedFeatures.push('trivia');
            }
        }
    }
    // 75% chance (70-75%): Technical Lesson
    else if (random < 0.75) {
        const lesson = getRandomLesson();
        if (lesson) {
            const lessonText = formatLesson(lesson);
            const testText = currentText + lessonText;

            if (testText.length <= SAFE_LENGTH) {
                features.lesson = lessonText;
                currentText = testText;
                features.usedFeatures.push('lesson');
            }
        }
    }
    // 80% chance (75-80%): Symbol Guide
    else if (random < 0.80) {
        const symbol = getRandomSymbol();
        if (symbol) {
            const symbolText = formatSymbol(symbol);
            const testText = currentText + symbolText;

            if (testText.length <= SAFE_LENGTH) {
                features.symbol = symbolText;
                currentText = testText;
                features.usedFeatures.push('symbol');
            }
        }
    }
    // 85% chance (80-85%): Color Theory
    else if (random < 0.85) {
        const colorFact = getRandomColorFact();
        if (colorFact) {
            const colorText = formatColorFact(colorFact);
            const testText = currentText + colorText;

            if (testText.length <= SAFE_LENGTH) {
                features.colorFact = colorText;
                currentText = testText;
                features.usedFeatures.push('colorFact');
            }
        }
    }
    // 90% chance (85-90%): Composition Analysis
    else if (random < 0.90) {
        const composition = getRandomComposition();
        if (composition) {
            const compText = formatComposition(composition);
            const testText = currentText + compText;

            if (testText.length <= SAFE_LENGTH) {
                features.composition = compText;
                currentText = testText;
                features.usedFeatures.push('composition');
            }
        }
    }
    // 10% chance (90-100%): No additional feature

    // Check for pop culture connection (independent of rotation)
    const popCulture = getPopCultureConnection(artwork.title);
    if (popCulture) {
        const popText = formatPopCulture(popCulture);
        const testText = currentText + popText;

        if (testText.length <= SAFE_LENGTH) {
            features.popCulture = popText;
            currentText = testText;
            features.usedFeatures.push('popCulture');
        }
    }

    // Check for artist comparison
    const comparison = getArtistComparison(artwork.artist);
    if (comparison) {
        const compText = formatComparison(comparison);
        const testText = currentText + compText;

        if (testText.length <= SAFE_LENGTH) {
            features.comparison = compText;
            currentText = testText;
            features.usedFeatures.push('comparison');
        }
    }

    // Check for restoration info
    const restoration = getRestorationInfo(artwork.title);
    if (restoration) {
        const restText = formatRestoration(restoration);
        const testText = currentText + restText;

        if (testText.length <= SAFE_LENGTH) {
            features.restoration = restText;
            currentText = testText;
            features.usedFeatures.push('restoration');
        }
    }

    // 5. ALWAYS ADD: Hashtags (at the end)
    const hashtags = selectHashtags(artwork, movement);
    const hashtagText = formatHashtags(hashtags);
    const finalText = currentText + hashtagText;

    if (finalText.length <= MAX_TWEET_LENGTH) {
        features.hashtags = hashtagText;
        currentText = finalText;
        features.usedFeatures.push('hashtags');
    }

    features.finalText = currentText;
    features.finalLength = currentText.length;

    return features;
}

/**
 * Build final tweet text with selected features
 */
export function buildFinalTweet(baseTweetText, features) {
    let finalText = baseTweetText;

    if (features.specialDay) {
        finalText = `${features.specialDay}\n\n${finalText}`;
    }

    if (features.birthday) {
        finalText = `${features.birthday}\n\n${finalText}`;
    }

    if (features.anniversary) {
        finalText += features.anniversary;
    }

    if (features.glossary) {
        finalText += features.glossary;
    }

    if (features.quote) {
        finalText += features.quote;
    }

    if (features.history) {
        finalText += features.history;
    }

    if (features.trivia) {
        finalText += features.trivia;
    }

    if (features.hashtags) {
        finalText += features.hashtags;
    }

    // Final safety check
    if (finalText.length > MAX_TWEET_LENGTH) {
        console.warn(`⚠️ Tweet too long (${finalText.length} chars), truncating...`);
        finalText = finalText.substring(0, MAX_TWEET_LENGTH - 3) + "...";
    }

    return finalText;
}
