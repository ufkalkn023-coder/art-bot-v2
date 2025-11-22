import axios from 'axios';
import { CONFIG } from '../config.js';

async function fetchFromChicago() {
    try {
        const page = Math.floor(Math.random() * 100) + 1;
        const response = await axios.get(
            `https://api.artic.edu/api/v1/artworks/search?q=&query[term][is_public_domain]=true&limit=1&page=${page}&fields=id,title,image_id,artist_title,date_display`,
            CONFIG.AXIOS
        );
        const data = response.data;
        if (data.data && data.data.length > 0) {
            const art = data.data[0];
            if (art.image_id) {
                return {
                    title: art.title,
                    artist: art.artist_title || "Unknown Artist",
                    date: art.date_display || "Unknown Date",
                    museum: "Art Institute of Chicago",
                    link: `https://www.artic.edu/artworks/${art.id}`,
                    imageUrl: `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
                };
            }
        }
        return null;
    } catch (e) {
        console.error("Error fetching from Chicago:", e.message);
        return null;
    }
}

async function fetchFromMet() {
    try {
        const searchRes = await axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=painting`,
            CONFIG.AXIOS
        );
        const ids = searchRes.data.objectIDs;
        if (!ids || ids.length === 0) return null;

        const maxIndex = Math.min(ids.length, 200);
        const randomId = ids[Math.floor(Math.random() * maxIndex)];

        const artRes = await axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomId}`,
            CONFIG.AXIOS
        );
        const art = artRes.data;

        if (art.primaryImage) {
            return {
                title: art.title,
                artist: art.artistDisplayName || "Unknown Artist",
                date: art.objectDate || "Unknown Date",
                museum: "The Met Museum",
                link: art.objectURL,
                imageUrl: art.primaryImage
            };
        }
        return null;
    } catch (e) {
        console.error("Error fetching from Met:", e.message);
        return null;
    }
}

async function fetchFromCleveland() {
    try {
        const skip = Math.floor(Math.random() * 500);
        const res = await axios.get(
            `https://openaccess-api.clevelandart.org/api/artworks/?share_license_status=CC0&has_image=1&limit=1&skip=${skip}&format=json`,
            CONFIG.AXIOS
        );
        if (res.data.data && res.data.data.length > 0) {
            const art = res.data.data[0];
            if (art.images?.web?.url) {
                return {
                    title: art.title,
                    artist: art.creators[0]?.description || "Unknown Artist",
                    date: art.creation_date || "Unknown Date",
                    museum: "Cleveland Museum of Art",
                    link: art.url,
                    imageUrl: art.images.web.url
                };
            }
        }
        return null;
    } catch (e) {
        console.error("Error fetching from Cleveland:", e.message);
        return null;
    }
}

export async function fetchArtwork() {
    const museums = [fetchFromChicago, fetchFromMet, fetchFromCleveland];
    const shuffledMuseums = museums.sort(() => 0.5 - Math.random());

    for (const museumFn of shuffledMuseums) {
        const art = await museumFn();
        if (art) return art;
    }
    return null;
}

// --- Search Functions for Mini Exhibition ---

async function searchChicago(query, limit = 4) {
    try {
        const response = await axios.get(
            `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&query[term][is_public_domain]=true&limit=${limit}&fields=id,title,image_id,artist_title,date_display`,
            CONFIG.AXIOS
        );
        const data = response.data;
        if (data.data && data.data.length >= limit) {
            return data.data.map(art => ({
                title: art.title,
                artist: art.artist_title || "Unknown Artist",
                date: art.date_display || "Unknown Date",
                museum: "Art Institute of Chicago",
                link: `https://www.artic.edu/artworks/${art.id}`,
                imageUrl: `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
            })).filter(art => art.imageUrl && !art.imageUrl.includes('null')); // Basic filter
        }
        return [];
    } catch (error) {
        console.error("Search error:", error.message);
        return [];
    }
}

export async function fetchRandomQuartet() {
    // Fetch 4 distinct artworks. 
    // We can just call fetchArtwork 4 times, but we should ensure they are distinct.
    const quartet = [];
    const maxAttempts = 10;
    let attempts = 0;

    while (quartet.length < 4 && attempts < maxAttempts) {
        const art = await fetchArtwork();
        if (art && !quartet.some(a => a.title === art.title)) {
            quartet.push(art);
        }
        attempts++;
    }

    if (quartet.length < 4) {
        console.warn(`⚠️ Could only fetch ${quartet.length} artworks for quartet.`);
        return null;
    }

    return quartet;
}

async function searchCleveland(query, limit = 4) {
    try {
        const res = await axios.get(
            `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(query)}&share_license_status=CC0&has_image=1&limit=${limit}&format=json`,
            CONFIG.AXIOS
        );
        if (res.data.data && res.data.data.length >= limit) {
            return res.data.data.map(art => ({
                title: art.title,
                artist: art.creators[0]?.description || "Unknown Artist",
                date: art.creation_date || "Unknown Date",
                museum: "Cleveland Museum of Art",
                link: art.url,
                imageUrl: art.images.web.url
            }));
        }
        return [];
    } catch (e) {
        console.error("Error searching Cleveland:", e.message);
        return [];
    }
}

export async function searchArtworks(query, limit = 4) {
    // Try Chicago first, then Cleveland (Met is too complex for batch search right now)
    const results = await searchChicago(query, limit);
    if (results.length >= limit) return results.slice(0, limit);

    const clevelandResults = await searchCleveland(query, limit);
    if (clevelandResults.length >= limit) return clevelandResults.slice(0, limit);

    return [];
}
