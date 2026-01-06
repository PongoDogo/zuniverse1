export interface StreamingSource {
  id: string;
  name: string;
  category: SourceCategory;
  buildUrl: (
    tmdbId: number,
    mediaType: "movie" | "tv",
    season?: number,
    episode?: number
  ) => string;
}

export type SourceCategory = 
  | "popular"
  | "premium"
  | "greek"
  | "alternative"
  | "backup";

export const categoryLabels: Record<SourceCategory, string> = {
  popular: "⭐ Low Ads",
  premium: "💎 Premium Quality",
  greek: "🇬🇷 Greek Language",
  alternative: "🔄 Alternative",
  backup: "💾 Backup Sources",
};

export const categoryOrder: SourceCategory[] = [
  "popular",
  "premium",
  "greek",
  "alternative",
  "backup",
];

export const streamingSources: StreamingSource[] = [
  // LOW ADS SOURCES - Prioritized
  {
    id: "vidsrcwtf",
    name: "VidSrc.wtf ⭐",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.vidsrc.wtf/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://www.vidsrc.wtf/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "superembed-vip",
    name: "SuperEmbed VIP ⭐",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      }
      return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`;
    },
  },
  {
    id: "embedsu",
    name: "Embed.su",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://embed.su/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidlink",
    name: "VidLink",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=true&ads=0`;
      }
      return `https://vidlink.pro/movie/${tmdbId}?autoplay=true&ads=0`;
    },
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "2embed",
    name: "2Embed",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://www.2embed.cc/embed/${tmdbId}`;
    },
  },

  // PREMIUM QUALITY
  {
    id: "vidsrcpro",
    name: "VidSrc Pro",
    category: "premium",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.pro/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrccc",
    name: "VidSrc CC",
    category: "premium",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidbinge",
    name: "VidBinge",
    category: "premium",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidbinge.dev/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidbinge.dev/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    category: "premium",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://player.smashy.stream/movie/${tmdbId}`;
    },
  },
  {
    id: "rive",
    name: "Rive",
    category: "premium",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://rivestream.live/watch?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://rivestream.live/watch?type=movie&id=${tmdbId}`;
    },
  },

  // GREEK LANGUAGE SOURCES
  {
    id: "embedsu-greek",
    name: "Embed.su Greek",
    category: "greek",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}?lang=el`;
      }
      return `https://embed.su/embed/movie/${tmdbId}?lang=el`;
    },
  },
  {
    id: "vidsrcme-greek",
    name: "VidSrc.me Greek",
    category: "greek",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&sub_lang=greek`;
      }
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}&sub_lang=greek`;
    },
  },
  {
    id: "multiembed-greek",
    name: "MultiEmbed Greek",
    category: "greek",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}&sub=Greek`;
      }
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&sub=Greek`;
    },
  },

  // ALTERNATIVE SOURCES
  {
    id: "vidsrcicu",
    name: "VidSrc ICU",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.icu/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcnl",
    name: "VidSrc NL",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.vidsrc.nl/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.vidsrc.nl/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      }
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
    },
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://superembed.stream/embed?video_id=${tmdbId}&tmdb=1&season=${season}&episode=${episode}`;
      }
      return `https://superembed.stream/embed?video_id=${tmdbId}&tmdb=1`;
    },
  },
  {
    id: "catflix",
    name: "Catflix",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://catflix.su/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://catflix.su/embed/movie/${tmdbId}`;
    },
  },

  // BACKUP SOURCES
  {
    id: "vidsrcembed",
    name: "VidSrc Embed",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
      }
      if (mediaType === "tv") {
        return `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}`;
      }
      return `https://vidsrc-embed.ru/embed/movie?tmdb=${tmdbId}&autoplay=1`;
    },
  },
  {
    id: "embedapi",
    name: "Embed API",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.embed-api.stream/?id=${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://player.embed-api.stream/?id=${tmdbId}`;
    },
  },
  {
    id: "nontongo",
    name: "Nontongo",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.nontongo.win/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://www.nontongo.win/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "nunflix",
    name: "NunFlix",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://nunflix-embed.vercel.app/api/show/${tmdbId}/${season}/${episode}`;
      }
      return `https://nunflix-embed.vercel.app/api/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcme",
    name: "VidSrc.me",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
    },
  },
];

// Group sources by category
export const getSourcesByCategory = (): Record<SourceCategory, StreamingSource[]> => {
  const grouped: Record<SourceCategory, StreamingSource[]> = {
    popular: [],
    premium: [],
    greek: [],
    alternative: [],
    backup: [],
  };
  
  streamingSources.forEach((source) => {
    grouped[source.category].push(source);
  });
  
  return grouped;
};

// Get default source
export const getDefaultSource = (): StreamingSource => streamingSources[0];

// Save preferred source to localStorage
export const savePreferredSource = (sourceId: string): void => {
  localStorage.setItem("preferredStreamingSource", sourceId);
};

// Get preferred source from localStorage
export const getPreferredSource = (): StreamingSource => {
  const savedId = localStorage.getItem("preferredStreamingSource");
  if (savedId) {
    const source = streamingSources.find((s) => s.id === savedId);
    if (source) return source;
  }
  return getDefaultSource();
};
