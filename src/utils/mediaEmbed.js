/**
 * Universal Media Embed & Detection Utility
 * Supports YouTube (Standard + Shorts), TikTok, and Instagram (Reels & Posts)
 */

export const isYouTubeUrl = (url) => {
    if (!url) return false;
    const str = String(url).trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return true;
    return /(?:youtube\.com|youtu\.be)/i.test(str);
};

export const isYouTubeShorts = (url) => {
    if (!url) return false;
    return /(?:youtube\.com\/shorts\/|m\.youtube\.com\/shorts\/)/i.test(String(url));
};

export const getYouTubeId = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    
    // Explicit 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }
    
    // 1. YouTube Shorts (e.g. youtube.com/shorts/VIDEO_ID)
    const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/|m\.youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch && shortsMatch[1]) {
        return shortsMatch[1];
    }

    // 2. YouTube Standard, Embed, watch or youtu.be
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = trimmed.match(regExp);
    if (match && match[1]) {
        return match[1];
    }

    // 3. Extraction via URL object if it's YouTube domain
    try {
        if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
            const urlStr = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
            const urlObj = new URL(urlStr);
            const v = urlObj.searchParams.get('v');
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            for (let i = pathParts.length - 1; i >= 0; i--) {
                const part = pathParts[i];
                if (/^[a-zA-Z0-9_-]{11}$/.test(part)) {
                    return part;
                }
            }
        }
    } catch (e) {}

    return '';
};

export const isTikTokUrl = (url) => {
    if (!url) return false;
    const str = String(url).trim();
    return /(?:tiktok\.com)/i.test(str);
};

export const getTikTokId = (url) => {
    if (!url) return '';
    const str = String(url).trim();
    // Match numeric ID: /video/7234567890123456789 or /v/7234567890123456789
    const match = str.match(/(?:video\/|v\/)(\d+)/i);
    if (match && match[1]) {
        return match[1];
    }
    return str;
};

export const isInstagramUrl = (url) => {
    if (!url) return false;
    const str = String(url).trim();
    return /(?:instagram\.com|instagr\.am)/i.test(str);
};

export const getInstagramCode = (url) => {
    if (!url) return '';
    const str = String(url).trim();
    // Match /reel/CODE/, /reels/CODE/, /p/CODE/, /tv/CODE/
    const match = str.match(/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
        return match[1];
    }
    return '';
};

export const detectMediaType = (urlOrId) => {
    if (!urlOrId) return 'none';
    const str = String(urlOrId).trim();
    if (isTikTokUrl(str)) return 'tiktok';
    if (isInstagramUrl(str)) return 'instagram';
    if (isYouTubeUrl(str) || /^[a-zA-Z0-9_-]{11}$/.test(str)) return 'youtube';
    if (/\.(mp4|webm|ogg)($|\?)/i.test(str)) return 'direct';
    return 'unknown';
};

export const getMediaInfo = (urlOrId) => {
    const raw = String(urlOrId || '').trim();
    const type = detectMediaType(raw);

    if (type === 'youtube') {
        const ytId = getYouTubeId(raw);
        return {
            type: 'youtube',
            id: ytId,
            rawUrl: raw,
            isShorts: isYouTubeShorts(raw),
            embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&enablejsapi=1` : '',
            thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null,
            platformName: isYouTubeShorts(raw) ? 'YouTube Shorts' : 'YouTube'
        };
    }

    if (type === 'tiktok') {
        const ttId = getTikTokId(raw);
        const isNumericId = /^\d+$/.test(ttId);
        return {
            type: 'tiktok',
            id: ttId,
            rawUrl: raw,
            isShorts: true,
            embedUrl: isNumericId 
                ? `https://www.tiktok.com/embed/v2/${ttId}` 
                : (raw.startsWith('http') ? raw : `https://${raw}`),
            thumbnailUrl: null,
            platformName: 'TikTok'
        };
    }

    if (type === 'instagram') {
        const igCode = getInstagramCode(raw);
        return {
            type: 'instagram',
            id: igCode,
            rawUrl: raw,
            isShorts: true,
            embedUrl: igCode 
                ? `https://www.instagram.com/reel/${igCode}/embed/` 
                : (raw.startsWith('http') ? raw : `https://${raw}`),
            thumbnailUrl: null,
            platformName: 'Instagram'
        };
    }

    if (type === 'direct') {
        return {
            type: 'direct',
            id: raw,
            rawUrl: raw,
            isShorts: false,
            embedUrl: raw,
            thumbnailUrl: null,
            platformName: 'Video'
        };
    }

    return {
        type: 'unknown',
        id: raw,
        rawUrl: raw,
        isShorts: false,
        embedUrl: raw,
        thumbnailUrl: null,
        platformName: 'Web'
    };
};
