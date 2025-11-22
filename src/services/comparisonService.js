/**
 * Artist Comparison Mode
 * Compares two similar artists in a single tweet
 */

const COMPARISONS = [
    {
        artist1: "Monet",
        artist2: "Manet",
        comparison: "Monet (Impressionism) vs Manet (Realism): Both masters of light, different approaches"
    },
    {
        artist1: "Van Gogh",
        artist2: "Gauguin",
        comparison: "Van Gogh (emotion) vs Gauguin (symbolism): Post-Impressionist rivals & friends"
    },
    {
        artist1: "Picasso",
        artist2: "Braque",
        comparison: "Picasso vs Braque: Co-founders of Cubism, inseparable innovators"
    },
    {
        artist1: "Michelangelo",
        artist2: "Leonardo",
        comparison: "Michelangelo (sculpture) vs Leonardo (science): Renaissance titans, fierce rivals"
    },
    {
        artist1: "Rembrandt",
        artist2: "Vermeer",
        comparison: "Rembrandt (drama) vs Vermeer (serenity): Dutch Golden Age masters"
    },
    {
        artist1: "Dalí",
        artist2: "Magritte",
        comparison: "Dalí (dreams) vs Magritte (reality): Surrealist visionaries"
    },
    {
        artist1: "Kandinsky",
        artist2: "Mondrian",
        comparison: "Kandinsky (organic) vs Mondrian (geometric): Abstract art pioneers"
    },
    {
        artist1: "Caravaggio",
        artist2: "Artemisia",
        comparison: "Caravaggio vs Artemisia Gentileschi: Baroque drama, different perspectives"
    },
    {
        artist1: "Renoir",
        artist2: "Degas",
        comparison: "Renoir (joy) vs Degas (movement): Impressionist contemporaries"
    },
    {
        artist1: "Warhol",
        artist2: "Lichtenstein",
        comparison: "Warhol (celebrity) vs Lichtenstein (comics): Pop Art icons"
    }
];

export function getArtistComparison(artistName) {
    // Find if current artist is in any comparison
    const match = COMPARISONS.find(c =>
        artistName.includes(c.artist1) || artistName.includes(c.artist2)
    );

    return match || null;
}

export function formatComparison(comparison) {
    return `\n\n⚖️ ${comparison.comparison}`;
}

export function shouldComparisonMode() {
    return Math.random() < 0.10; // 10% chance
}
