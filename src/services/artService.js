// artService.js

// 1. Gerekli kütüphaneyi içe aktarın. Axios, HTTP istekleri için gereklidir.
import axios from 'axios';

// 2. CONFIG nesnesini tanımlayın.
// Bu nesne, axios istekleri için timeout gibi ayarları tutar. 
// Eğer CONFIG ayarlarınız başka bir dosyadan geliyorsa (örn. config.js),
// buraya o dosyadan import etmelisiniz:
// import { CONFIG } from './config.js'; 
// Aksi takdirde, varsayılan bir tanım kullanabiliriz:

const CONFIG = {
    AXIOS: {
        timeout: 15000 // Örnek timeout: 15 saniye
        // Diğer özel ayarlar buraya eklenebilir
    }
};

// --- Search by Artist Name (for Forgotten Artists Spotlight) ---

// Fonksiyonun dışa aktarılması (export)
export async function searchArtworkByArtist(artistName) {
    // Try Chicago API first
    try {
        const response = await axios.get(
            `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(artistName)}&query[term][is_public_domain]=true&limit=10&fields=id,title,image_id,artist_title,date_display`,
            CONFIG.AXIOS
        );
        const data = response.data;
        if (data.data && data.data.length > 0) {
            // Find artwork that actually matches the artist
            for (const art of data.data) {
                if (art.image_id && art.artist_title && art.artist_title.toLowerCase().includes(artistName.toLowerCase())) {
                    return {
                        title: art.title,
                        artist: art.artist_title,
                        date: art.date_display || "Unknown Date",
                        museum: "Art Institute of Chicago",
                        link: `https://www.artic.edu/artworks/${art.id}`,
                        imageUrl: `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
                    };
                }
            }
        }
    } catch (e) {
        // Hata ayıklama için detaylı loglama
        console.error(`Error searching Chicago for artist (${artistName}):`, e.message);
    }

    // Try Met API
    try {
        const searchRes = await axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&artistOrCulture=true&q=${encodeURIComponent(artistName)}`,
            CONFIG.AXIOS
        );
        const ids = searchRes.data.objectIDs;
        if (ids && ids.length > 0) {
            // Try first few results (limit to 5 API calls to avoid rate limits/slowdown)
            for (let i = 0; i < Math.min(5, ids.length); i++) {
                try {
                    const artRes = await axios.get(
                        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${ids[i]}`,
                        CONFIG.AXIOS
                    );
                    const art = artRes.data;
                    if (art.primaryImage && art.artistDisplayName &&
                        art.artistDisplayName.toLowerCase().includes(artistName.toLowerCase())) {
                        return {
                            title: art.title,
                            artist: art.artistDisplayName,
                            date: art.objectDate || "Unknown Date",
                            museum: "The Met Museum",
                            link: art.objectURL,
                            imageUrl: art.primaryImage
                        };
                    }
                } catch (e) {
                    // Tekil eser sorgusu hatası, bir sonraki esere geç
                    continue;
                }
            }
        }
    } catch (e) {
        console.error(`Error searching Met for artist (${artistName}):`, e.message);
    }

    // Try Cleveland API
    try {
        const res = await axios.get(
            `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(artistName)}&share_license_status=CC0&has_image=1&limit=10&format=json`,
            CONFIG.AXIOS
        );
        if (res.data.data && res.data.data.length > 0) {
            for (const art of res.data.data) {
                // Cleveland API'da artist bilgisi creators dizisi içinde olabilir
                const artistDesc = art.creators?.[0]?.description || "";
                if (art.images?.web?.url && artistDesc.toLowerCase().includes(artistName.toLowerCase())) {
                    return {
                        title: art.title,
                        artist: artistDesc,
                        date: art.creation_date || "Unknown Date",
                        museum: "Cleveland Museum of Art",
                        link: art.url,
                        imageUrl: art.images.web.url
                    };
                }
            }
        }
    } catch (e) {
        console.error(`Error searching Cleveland for artist (${artistName}):`, e.message);
    }

    // Tüm denemeler başarısız olursa null döner
    return null;
}


// General Search Function (for Exhibition Mode)
export async function searchArtworks(query, limit = 5) {
    try {
        const response = await axios.get(
            `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&query[term][is_public_domain]=true&limit=${limit * 2}&fields=id,title,image_id,artist_title,date_display`,
            CONFIG.AXIOS
        );
        const data = response.data;
        if (data.data && data.data.length > 0) {
            const results = data.data
                .filter(art => art.image_id) // Ensure image exists
                .map(art => ({
                    title: art.title,
                    artist: art.artist_title || "Unknown Artist",
                    date: art.date_display || "Unknown Date",
                    museum: "Art Institute of Chicago",
                    link: `https://www.artic.edu/artworks/${art.id}`,
                    imageUrl: `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
                }));

            return results.slice(0, limit);
        }
    } catch (e) {
        console.error(`Error searching artworks for query (${query}):`, e.message);
    }
    return [];
}


// Fetch a random artwork (Main Function)
export async function fetchArtwork() {
    try {
        // Random page to get variety
        const randomPage = Math.floor(Math.random() * 100) + 1;

        const response = await axios.get(
            `https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=1&page=${randomPage}&fields=id,title,image_id,artist_title,date_display,medium_display`,
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
                    medium: art.medium_display || "Unknown Medium",
                    museum: "Art Institute of Chicago",
                    link: `https://www.artic.edu/artworks/${art.id}`,
                    imageUrl: `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
                };
            }
        }
    } catch (e) {
        console.error("Error fetching random artwork:", e.message);
    }
    return null;
}
