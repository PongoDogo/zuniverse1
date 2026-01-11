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
  | "top"
  | "reliable"
  | "good"
  | "alternative"
  | "backup";

export const categoryLabels: Record<SourceCategory, string> = {
  top: "🏆 Most Popular",
  reliable: "⭐ Reliable",
  good: "✅ Good Quality",
  alternative: "🔄 Alternative",
  backup: "💾 Backup",
};

export const categoryOrder: SourceCategory[] = [
  "top",
  "reliable",
  "good",
  "alternative",
  "backup",
];

export const streamingSources: StreamingSource[] = [
  // ==========================================
  // TOP TIER - Most Popular & Functional
  // ==========================================
  {
    id: "vidsrcto",
    name: "VidSrc.to ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.to/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "embedsu",
    name: "Embed.su ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://embed.su/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcxyz",
    name: "VidSrc.xyz",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
    },
  },
  {
    id: "2embed",
    name: "2Embed",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://www.2embed.cc/embed/${tmdbId}`;
    },
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
    },
  },

  // ==========================================
  // RELIABLE - Consistently Working
  // ==========================================
  {
    id: "multiembed",
    name: "MultiEmbed",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      }
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
    },
  },
  {
    id: "vidsrcme",
    name: "VidSrc.me",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
    },
  },
  {
    id: "vidsrcpro",
    name: "VidSrc.pro",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.pro/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidlink",
    name: "VidLink",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidlink.pro/movie/${tmdbId}`;
    },
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://player.smashy.stream/movie/${tmdbId}`;
    },
  },
  {
    id: "moviesapi",
    name: "MoviesAPI",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}`;
      }
      return `https://moviesapi.club/movie/${tmdbId}`;
    },
  },

  // ==========================================
  // GOOD QUALITY - Works Well
  // ==========================================
  {
    id: "vidsrccc",
    name: "VidSrc.cc",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcicu",
    name: "VidSrc.icu",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.icu/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcnl",
    name: "VidSrc.nl",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.vidsrc.nl/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.vidsrc.nl/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidbinge",
    name: "VidBinge",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidbinge.dev/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidbinge.dev/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcin",
    name: "VidSrc.in",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.in/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "embedsoap",
    name: "EmbedSoap",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.embedsoap.com/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://www.embedsoap.com/embed/movie/${tmdbId}`;
    },
  },

  // ==========================================
  // ALTERNATIVE - Additional Options
  // ==========================================
  {
    id: "vidsrcwtf",
    name: "VidSrc.wtf",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.vidsrc.wtf/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://www.vidsrc.wtf/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      }
      return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`;
    },
  },
  {
    id: "rive",
    name: "RiveStream",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://rivestream.live/watch?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://rivestream.live/watch?type=movie&id=${tmdbId}`;
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
    id: "vidplay",
    name: "VidPlay",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidplay.online/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidplay.online/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "primewire",
    name: "PrimeWire",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.primewire.tf/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://www.primewire.tf/embed/movie/${tmdbId}`;
    },
  },

  // ==========================================
  // BACKUP - Last Resort Options
  // ==========================================
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
        return `https://moviee.tv/embed/tv/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://moviee.tv/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "frembed",
    name: "Frembed",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://frembed.lol/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://frembed.lol/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "susflix",
    name: "SussFlix",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://sussflix.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://sussflix.to/embed/movie/${tmdbId}`;
    },
  },
];

// Group sources by category
export const getSourcesByCategory = (): Record<SourceCategory, StreamingSource[]> => {
  const grouped: Record<SourceCategory, StreamingSource[]> = {
    top: [],
    reliable: [],
    good: [],
    alternative: [],
    backup: [],
  };
  
  streamingSources.forEach((source) => {
    grouped[source.category].push(source);
  });
  
  return grouped;
};

// Get default source (first top tier source)
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
