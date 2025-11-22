// --- Forgotten Artists Spotlight ---

export async function generateForgottenArtistSpotlight(artist, artwork) {
    if (!model) return null;

    const lifespan = artist.death_year 
        ? `${artist.birth_year}-${artist.death_year}`
        : `born ${artist.birth_year}`;

    const prompt = `
    You are writing a powerful, SEO-optimized spotlight on an underrepresented artist.
    
    Artist: ${artist.name} (${lifespan})
    Identity: ${artist.gender}, ${artist.ethnicity}
    Nationality: ${artist.nationality}
    Movement: ${artist.movement}
    Artwork: "${artwork.title}" ${artwork.date ? `(${artwork.date})` : ''}
    
    Why they're underrepresented: ${artist.why_forgotten}
    
    Write a comprehensive social media post (up to 20,000 characters) that:
    
    1. **Opening Hook**: Start with a powerful question or statement about representation in art
       Example: "Why don't we know ${artist.name}'s name as well as Picasso's?"
    
    2. **Artist's Story**: Tell their compelling biography
       - Early life and barriers they faced
       - How they overcame discrimination (race, gender, etc.)
       - Their artistic journey and breakthrough moments
    
    3. **Artistic Contributions**: Analyze their unique style and innovations
       - What made their work groundbreaking
       - How they influenced art history
       - Specific techniques or themes they pioneered
    
    4. **This Artwork**: Deep analysis of "${artwork.title}"
       - Visual description
       - Symbolism and meaning
       - Why it's significant in their body of work
    
    5. **Historical Context**: The barriers they faced
       - Systemic discrimination in the art world
       - How their identity affected their career
       - Contemporary artists who faced similar challenges
    
    6. **Legacy & Modern Relevance**: Why they matter today
       - How they paved the way for diverse artists
       - Recent recognition or exhibitions
       - What we can learn from their story
    
    7. **Call to Action**: Encourage learning more
       - Where to see their work (museums: ${artist.museums.join(', ')})
       - Invite discussion about diversity in art
    
    8. **SEO Keywords** (naturally integrate):
       - "${artist.name}"
       - "underrepresented artists"
       - "diversity in art"
       - "${artist.ethnicity} artists"
       - "${artist.gender} artists in history"
       - "${artist.movement}"
    
    9. **Hashtags** (10-12):
       - Broad: #ArtHistory #DiversityInArt #RepresentationMatters
       - Specific: #${artist.name.replace(/\s+/g, '')} #${artist.ethnicity.replace(/\s+/g, '')}Artists
       - Movement: #${artist.movement.replace(/\s+/g, '')}
       - Engagement: #ForgottenArtists #ArtEducation #MuseumCollection
    
    **Tone**: Respectful, empowering, educational, and passionate. Celebrate their achievements while acknowledging injustice.
    
    **Language**: English
    
    Output ONLY the post text with proper formatting.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("❌ Gemini Spotlight Error:", error);
        return null;
    }
}
