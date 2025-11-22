/**
 * Safety utility to filter out sensitive content.
 * This acts as a hard filter for generated text to prevent account suspension.
 */

const BLACKLIST = [
    // Politics & Controversial
    // Politics & Controversial
    'siyaset', 'parti', 'seçim', 'hükümet', 'muhalefet', 'darbe', 'terör',
    'savaş', 'çatışma', 'silah', 'bomba', 'öldürme', 'katliam', 'soykırım',
    'ırkçılık', 'faşizm', 'komünizm', 'şeriat', 'cihat', 'fetö', 'pkk',
    'tayyip', 'erdoğan', 'kılıçdaroğlu', 'imamoğlu', 'yavaş', 'bahçeli',
    'politics', 'war', 'conflict', 'weapon', 'bomb', 'kill', 'massacre', 'genocide',

    // NSFW & Violence
    'porno', 'seks', 'tecavüz', 'taciz', 'çıplak', 'meme', 'vajina', 'penis',
    'intihar', 'kendini asma', 'kesme', 'kan', 'vahşet', 'işkence',

    // Hate Speech & Profanity
    'aptal', 'gerizekalı', 'salak', 'mal', 'oç', 'piç', 'yavşak',
    'nefret', 'iğrenç', 'lanet', 'allah belanı',

    // Spam & Scams
    'takip et', 'follow', 'kazan', 'bitcoin', 'kripto', 'bahis', 'kumar'
];

/**
 * Checks if the text contains any blacklisted words.
 * @param {string} text - The text to check.
 * @returns {boolean} - True if safe, false if contains blacklisted words.
 */
export function isContentSafe(text) {
    if (!text) return true;

    const lowerText = text.toLowerCase();

    for (const word of BLACKLIST) {
        // Check for whole words or significant parts to avoid false positives
        // Using a simple includes for now, but could be regex enhanced
        if (lowerText.includes(word)) {
            console.warn(`[Safety] Content blocked due to forbidden word: ${word}`);
            return false;
        }
    }

    return true;
}

/**
 * Validates the generated content and throws error if unsafe.
 * @param {string} text - The text to validate.
 * @throws {Error} - If content is unsafe.
 */
export function validateContent(text) {
    if (!isContentSafe(text)) {
        throw new Error('SAFETY_VIOLATION: Generated content contains forbidden words.');
    }
}
