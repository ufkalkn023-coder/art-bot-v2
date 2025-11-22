export function checkAnniversary(artwork) {
    if (!artwork.date) return null;

    // Extract year from date string (e.g., "1889", "c. 1900", "1850-1860")
    const yearMatch = artwork.date.match(/\b(\d{4})\b/);
    if (!yearMatch) return null;

    const artworkYear = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear();
    const yearsAgo = currentYear - artworkYear;

    // Check if it's a century anniversary (100, 200, 300, etc.)
    if (yearsAgo > 0 && yearsAgo % 100 === 0) {
        return {
            years: yearsAgo,
            artworkYear,
            message: `🎂 ${yearsAgo} years ago!`
        };
    }

    return null;
}

export function formatAnniversary(anniversary) {
    return `\n\n${anniversary.message}`;
}
