import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config.js';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(CONFIG.GEMINI.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateArtContent(artwork, imageUrl) {
   if (!model) return "Error: Gemini model not initialized.";

   const prompt = `
    Analyze this artwork and write a comprehensive, engaging "Deep Dive" article for social media (up to 20,000 characters).
    
    Artwork: "${artwork.title}" by ${artwork.artist} (${artwork.date})
    Museum: ${artwork.museum}
    
    Your goal is to be the ultimate digital art historian—accessible but deeply knowledgeable.
    
    Structure:
    1. **The Hook**: A captivating opening about the visual impact or a surprising fact.
    2. **The Story**: The narrative behind the creation. What was happening in the artist's life?
    3. **Deep Analysis**: Break down the technique, brushwork, lighting, and composition.
    4. **Hidden Details**: Point out things most people miss.
    5. **Historical Context**: Place it in the timeline of art history. Why does it matter?
    6. **SEO Keywords**: Naturally weave in keywords like "Art History", "Masterpiece", "${artwork.artist}", "${artwork.movement}", "Oil Painting", etc.
    
    Tone: Enthusiastic, authoritative, storytelling, slightly informal but educational.
    
    Output ONLY the text. Use emojis to break up sections.
    `;

   try {
      // For vision models, we would need to pass the image data. 
      // Since we are using the text-only model for now (or if the image isn't passed as a Part),
      // we will rely on the metadata.
      // TODO: Implement actual vision capabilities if needed by passing image parts.

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
   } catch (error) {
      console.error("❌ Gemini Error:", error);
      return `🎨 ${artwork.title} by ${artwork.artist}\n\nA masterpiece from ${artwork.date}. \n\n#Art #DailyArt`;
   }
}



export async function generateTimeCapsule(artwork) {
   if (!model) return null;

   const prompt = `
    If "${artwork.title}" (${artwork.date}) were a time capsule, what single object or sound from that era would be trapped inside it?
    
    Write a short, poetic answer (max 200 chars).
    
    Output ONLY the answer.
    `;

   try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
   } catch (error) {
      console.error("❌ Gemini Time Capsule Error:", error);
      return null;
   }
}

export async function generateDetailZoomText(artwork) {
   if (!model) return null;

   const prompt = `
    Write a short tweet (max 200 chars) encouraging people to look closer at the details of "${artwork.title}".
    Focus on brushwork, lighting, or hidden details.
    
    Output ONLY the text.
    `;

   try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
   } catch (error) {
      console.error("❌ Gemini Detail Zoom Error:", error);
      return null;
   }
}

export async function generateQuizText(artwork) {
   if (!model) return null;

   const prompt = `
    Create a "Guess the Artist" quiz tweet for "${artwork.title}".
    
    Format:
    "🎨 Guess the Artist!
    
    Clue 1: [Stylistic clue]
    Clue 2: [Biographical clue]
    
    (Answer in next tweet!) #ArtQuiz"
    
    Output ONLY the tweet text.
    `;

   try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
   } catch (error) {
      console.error("❌ Gemini Quiz Error:", error);
      return null;
   }
}

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
       - How they overcame discrimination (race, gender, etc.)
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

export async function generateEvolutionPost(theme, artworks) {
   if (!model) return null;

   const artworksList = artworks.map((a, i) => `${i + 1}. "${a.title}" by ${a.artist} (${a.date})`).join('\n');

   const prompt = `
     Create a fascinating Twitter thread (or long post) about the "Evolution of ${theme} in Art".
     
     I have selected these ${artworks.length} artworks:
     ${artworksList}
     
     Write a cohesive narrative that explains how the depiction of ${theme} has changed over time, referencing these specific pieces.
     
     Structure:
     - **Title**: Catchy title with emojis
     - **Intro**: Brief set up of the theme.
     - **The Journey**: Walk through the timeline, grouping the artworks if needed, highlighting stylistic changes (e.g. from realism to abstraction).
     - **Conclusion**: A thought on what this evolution tells us.
     
     Tone: Educational, storytelling, engaging.
     
     Output ONLY the text.
     `;

   try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
   } catch (error) {
      console.error("❌ Gemini Evolution Post Error:", error);
      return null;
   }
}
