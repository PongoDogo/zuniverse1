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
  popular: "⭐ Popular",
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
  // POPULAR SOURCES
  {
    id: "vixsrc",
    name: "VixSrc",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      let url = `https://vixsrc.to/${mediaType}/${tmdbId}`;
      if (mediaType === "tv" && season && episode) {
        url = `https://vixsrc.to/tv/${tmdbId}/${season}/${episode}`;
      }
      return url + "?primaryColor=8B5CF6&secondaryColor=4C1D95&autoplay=true";
    },
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.xyz/embed/movie/${tmdbId}`;
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
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=true`;
      }
      return `https://vidlink.pro/movie/${tmdbId}?autoplay=true`;
    },
  },
  {
    id: "vidrock",
    name: "VidRock",
    category: "popular",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidrock.net/tv/${tmdbId}/${season}/${episode}?autoplay=true&autonext=true`;
      }
      return `https://vidrock.net/movie/${tmdbId}?autoplay=true`;
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
    id: "autoembed",
    name: "AutoEmbed",
    category: "premium",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
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
    id: "vidrock-greek",
    name: "VidRock Greek",
    category: "greek",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidrock.net/tv/${tmdbId}/${season}/${episode}?autoplay=true&autonext=true&lang=el`;
      }
      return `https://vidrock.net/movie/${tmdbId}?autoplay=true&lang=el`;
    },
  },
  {
    id: "vidsrc-greek",
    name: "VidSrc Greek",
    category: "greek",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}?sub_lang=greek`;
      }
      return `https://vidsrc.xyz/embed/movie/${tmdbId}?sub_lang=greek`;
    },
  },
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
    id: "vembed",
    name: "VEmbed",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vembed.stream/play/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://vembed.stream/play/${tmdbId}`;
    },
  },
  {
    id: "moviesapi",
    name: "MoviesAPI",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}`;
      }
      return `https://moviesapi.club/movie/${tmdbId}`;
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
  {
    id: "flicky",
    name: "Flicky",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://flicky.host/embed/tv/?id=${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://flicky.host/embed/movie/?id=${tmdbId}`;
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
    id: "moviee",
    name: "Moviee",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://moviee.tv/embed/tv/${tmdbId}?seasion=${season}&episode=${episode}`;
      }
      return `https://moviee.tv/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "ridoo",
    name: "Ridoo",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://ridoo.net/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://ridoo.net/movie/${tmdbId}`;
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
    id: "primewire",
    name: "PrimeWire",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.primewire.tf/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://www.primewire.tf/embed/movie?tmdb=${tmdbId}`;
    },
  },
  {
    id: "111movies",
    name: "111Movies",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://111movies.com/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://111movies.com/movie/${tmdbId}`;
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
