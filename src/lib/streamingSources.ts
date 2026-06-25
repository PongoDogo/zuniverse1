export type SourceStatus = "live" | "limited" | "down" | "unknown";

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

// Liveness map populated from automated availability checks.
// "live" = responded 200, "limited" = blocked at root but embed may work,
// "down" = confirmed dead, "unknown" = bot probe blocked (often OK in real browsers).
const SOURCE_STATUS: Record<string, SourceStatus> = {
  vidsrcto: "live", embedsu: "live", vidsrcxyz: "unknown", vidsrcvip: "unknown",
  vixsrc: "live", "2embed": "live", autoembed: "unknown", vidlink: "live",
  vidplay: "live", warezcdn: "unknown", filmxy: "limited", showbox: "live",
  vidsrcprime: "live", hdmovies: "unknown", movieapi: "unknown",
  multiembed: "live", vidsrcme: "live", vidsrcpro: "live", smashystream: "unknown",
  moviesapi: "unknown", vidsrcdev: "down", embedapi: "limited", mapletv: "unknown",
  movieclub: "unknown", gdriveplayer: "live", godriveplayerapi: "unknown",
  spencerdevs: "unknown", vidsrccc: "limited", vidsrcicu: "unknown",
  vidsrcnl: "live", vidbinge: "unknown", vidsrcin: "live", vidsrcnet: "unknown",
  vidsrccx: "unknown", embedsoap: "unknown", anyembed: "live",
  vidsrcwtfpremium: "live", emberstream: "unknown", superstream: "unknown",
  vidsrcwtf: "live", superembed: "live", rive: "live", catflix: "live",
  primewire: "unknown", flixhq: "unknown", movieembed: "unknown", gomo: "unknown",
  nontongopremium: "live", streamzone: "unknown", animehiber: "unknown",
  moviecloud: "live", vidsrcembed: "live", nontongo: "live", moviee: "unknown",
  frembed: "unknown", nunflix: "down", rgshows: "unknown", streamsrc: "unknown",
  embedsito: "unknown", watchhub: "unknown", flixwave: "unknown",
  cinezone: "unknown", vidwtf: "unknown",
};

export const getSourceStatus = (id: string): SourceStatus =>
  SOURCE_STATUS[id] ?? "unknown";

export const statusLabels: Record<SourceStatus, string> = {
  live: "Live",
  limited: "Limited",
  down: "Offline",
  unknown: "Unverified",
};

export const statusDotClass: Record<SourceStatus, string> = {
  live: "bg-emerald-500 shadow-[0_0_8px_hsl(var(--primary)/0.8)]",
  limited: "bg-amber-500",
  down: "bg-red-500",
  unknown: "bg-muted-foreground/40",
};

export type SourceCategory = 
  | "top"
  | "reliable"
  | "good"
  | "alternative"
  | "backup";

export const categoryLabels: Record<SourceCategory, string> = {
  top: "🏆 Top Picks",
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
  // 🏆 TOP PICKS - Best Quality & Most Reliable (15 sources)
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
    name: "VidSrc.xyz ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
    },
  },
  {
    id: "vidsrcvip",
    name: "VidSrc.vip ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.vip/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.vip/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vixsrc",
    name: "VixSrc ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vixsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vixsrc.to/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "2embed",
    name: "2Embed ⭐",
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
    name: "AutoEmbed ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidlink",
    name: "VidLink ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidlink.pro/movie/${tmdbId}`;
    },
  },
  {
    id: "vidplay",
    name: "VidPlay ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidplay.online/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidplay.online/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "warezcdn",
    name: "WarezCDN ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://embed.warezcdn.com/serie/${tmdbId}/${season}/${episode}`;
      }
      return `https://embed.warezcdn.com/filme/${tmdbId}`;
    },
  },
  {
    id: "filmxy",
    name: "FilmXY ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://filmxy.vip/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://filmxy.vip/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "showbox",
    name: "ShowBox ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://showbox.media/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://showbox.media/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcprime",
    name: "VidSrc Prime ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.pm/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "hdmovies",
    name: "HDMovies ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://hdmovie2.sx/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://hdmovie2.sx/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "movieapi",
    name: "MovieAPI ⭐",
    category: "top",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://movieapi.club/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://movieapi.club/movie/${tmdbId}`;
    },
  },

  // ==========================================
  // ⭐ RELIABLE - Consistently Working (12 sources)
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
  {
    id: "vidsrcdev",
    name: "VidSrc.dev",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.dev/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.dev/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "embedapi",
    name: "EmbedAPI",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.embed-api.stream/?id=${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://player.embed-api.stream/?id=${tmdbId}`;
    },
  },
  {
    id: "mapletv",
    name: "MapleTV",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://mapletv.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://mapletv.to/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "movieclub",
    name: "MovieClub",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://movieclub.top/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://movieclub.top/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "gdriveplayer",
    name: "GDrivePlayer",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://databasegdriveplayer.co/player.php?tmdb=${tmdbId}&type=tv&season=${season}&episode=${episode}`;
      }
      return `https://databasegdriveplayer.co/player.php?tmdb=${tmdbId}&type=movie`;
    },
  },
  {
    id: "godriveplayerapi",
    name: "GoDrivePlayer API",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://godriveplayer.api/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://godriveplayer.api/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "spencerdevs",
    name: "SpencerDevs",
    category: "reliable",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://spencerdevs.com/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://spencerdevs.com/embed/movie/${tmdbId}`;
    },
  },

  // ==========================================
  // ✅ GOOD QUALITY - Works Well (12 sources)
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
    id: "vidsrcnet",
    name: "VidSrc.net",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.net/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.net/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrccx",
    name: "VidSrc.cx",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.cx/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.cx/embed/movie/${tmdbId}`;
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
  {
    id: "anyembed",
    name: "AnyEmbed",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://anyembed.xyz/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://anyembed.xyz/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcwtfpremium",
    name: "VidWTF Premium",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.wtf/embed/tv/${tmdbId}/${season}/${episode}?premium=1`;
      }
      return `https://vidsrc.wtf/embed/movie/${tmdbId}?premium=1`;
    },
  },
  {
    id: "emberstream",
    name: "EmberStream",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://ember.stream/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://ember.stream/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "superstream",
    name: "SuperStream",
    category: "good",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://superstream.live/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://superstream.live/embed/movie/${tmdbId}`;
    },
  },

  // ==========================================
  // 🔄 ALTERNATIVE - Additional Options (12 sources)
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
  {
    id: "flixhq",
    name: "FlixHQ",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://flixhq.click/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://flixhq.click/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "movieembed",
    name: "MovieEmbed",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://movieembed.xyz/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://movieembed.xyz/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "gomo",
    name: "GoMo",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://gomo.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://gomo.to/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "nontongopremium",
    name: "Nontongo Premium",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://nontongo.win/embed/tv/${tmdbId}/${season}/${episode}?premium=1`;
      }
      return `https://nontongo.win/embed/movie/${tmdbId}?premium=1`;
    },
  },
  {
    id: "streamzone",
    name: "StreamZone",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://streamzone.live/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://streamzone.live/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "animehiber",
    name: "AnimeHiber",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://animehiber.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://animehiber.to/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "moviecloud",
    name: "MovieCloud",
    category: "alternative",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://moviecloud.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://moviecloud.to/embed/movie/${tmdbId}`;
    },
  },

  // ==========================================
  // 💾 BACKUP - Last Resort Options (12 sources)
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
    id: "rgshows",
    name: "RGShows",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://rivestream.org/embed?tmdb=${tmdbId}&type=tv&s=${season}&e=${episode}`;
      }
      return `https://rivestream.org/embed?tmdb=${tmdbId}&type=movie`;
    },
  },
  {
    id: "streamsrc",
    name: "StreamSrc",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://streamsrc.vip/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://streamsrc.vip/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "embedsito",
    name: "EmbedSito",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://embedsito.com/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://embedsito.com/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "watchhub",
    name: "WatchHub",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://watchhub.stream/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://watchhub.stream/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "flixwave",
    name: "FlixWave",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://flixwave.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://flixwave.to/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "cinezone",
    name: "CineZone",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://cinezone.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://cinezone.to/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidwtf",
    name: "VidWTF",
    category: "backup",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidwtf.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidwtf.to/embed/movie/${tmdbId}`;
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
    if (source && getSourceStatus(source.id) !== "down") return source;
  }
  return getDefaultSource();
};

// Get next source for auto-fallback
export const getNextSource = (currentSourceId: string): StreamingSource | null => {
  const currentIndex = streamingSources.findIndex(s => s.id === currentSourceId);
  if (currentIndex === -1) return null;
  for (let i = currentIndex + 1; i < streamingSources.length; i++) {
    if (getSourceStatus(streamingSources[i].id) !== "down") return streamingSources[i];
  }
  return null;
};

// Get total source count
export const getSourceCount = (): number => streamingSources.length;