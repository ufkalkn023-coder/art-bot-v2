/**
 * Before/After Restoration Mode
 * Shows restoration work when available
 * Note: This requires restoration data which museums rarely provide
 * For now, this is a placeholder for future enhancement
 */

const RESTORATION_EXAMPLES = [
    {
        artwork: "Sistine Chapel",
        info: "Restored 1980-1994: Revealed Michelangelo's vibrant original colors",
        short: "🔧 Restored 1980-94: Vibrant colors revealed!"
    },
    {
        artwork: "The Last Supper",
        info: "Restored 1978-1999: 21 years to save da Vinci's masterpiece",
        short: "🔧 21-year restoration saved this masterpiece"
    },
    {
        artwork: "Ghent Altarpiece",
        info: "Ongoing restoration revealing hidden details",
        short: "🔧 Restoration revealing hidden details"
    },
    {
        artwork: "The Night Watch",
        info: "Operation Night Watch: AI-assisted restoration",
        short: "🔧 AI-assisted restoration in progress"
    },
    {
        artwork: "Mona Lisa",
        info: "Cleaned in 1809, revealing brighter colors",
        short: "🔧 1809 cleaning revealed brighter colors"
    }
];

export function getRestorationInfo(artworkTitle) {
    const match = RESTORATION_EXAMPLES.find(r =>
        artworkTitle.toLowerCase().includes(r.artwork.toLowerCase())
    );

    return match || null;
}

export function formatRestoration(restoration) {
    return `\n\n${restoration.short}`;
}

export function shouldRestorationMode() {
    return Math.random() < 0.05; // 5% chance (rare)
}
