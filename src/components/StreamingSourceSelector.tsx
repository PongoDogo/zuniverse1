import { Server, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface StreamingSource {
  id: string;
  name: string;
  buildUrl: (
    tmdbId: number,
    mediaType: "movie" | "tv",
    season?: number,
    episode?: number
  ) => string;
}

export const streamingSources: StreamingSource[] = [
  {
    id: "vixsrc",
    name: "VixSrc",
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
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.xyz/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcpro",
    name: "VidSrc Pro",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.pro/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcicu",
    name: "VidSrc ICU",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.icu/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrccc",
    name: "VidSrc CC",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcnl",
    name: "VidSrc NL",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.vidsrc.nl/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.vidsrc.nl/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidsrcembed",
    name: "VidSrc Embed",
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
    id: "2embed",
    name: "2Embed",
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
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      }
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
    },
  },
  {
    id: "embedapi",
    name: "Embed API",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.embed-api.stream/?id=${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://player.embed-api.stream/?id=${tmdbId}`;
    },
  },
  {
    id: "vembed",
    name: "VEmbed",
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
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}`;
      }
      return `https://moviesapi.club/movie/${tmdbId}`;
    },
  },
  {
    id: "embedsu",
    name: "Embed.su",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://embed.su/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://player.smashy.stream/movie/${tmdbId}`;
    },
  },
  {
    id: "nontongo",
    name: "Nontongo",
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
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://moviee.tv/embed/tv/${tmdbId}?seasion=${season}&episode=${episode}`;
      }
      return `https://moviee.tv/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "vidlink",
    name: "VidLink",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=true`;
      }
      return `https://vidlink.pro/movie/${tmdbId}?autoplay=true`;
    },
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://superembed.stream/embed?video_id=${tmdbId}&tmdb=1&season=${season}&episode=${episode}`;
      }
      return `https://superembed.stream/embed?video_id=${tmdbId}&tmdb=1`;
    },
  },
  {
    id: "ridoo",
    name: "Ridoo",
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
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://nunflix-embed.vercel.app/api/show/${tmdbId}/${season}/${episode}`;
      }
      return `https://nunflix-embed.vercel.app/api/movie/${tmdbId}`;
    },
  },
  {
    id: "gomoplayer",
    name: "Gomo",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://gomo.to/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://gomo.to/movie/${tmdbId}`;
    },
  },
  {
    id: "primewire",
    name: "PrimeWire",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.primewire.tf/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://www.primewire.tf/embed/movie?tmdb=${tmdbId}`;
    },
  },
  {
    id: "vidbinge",
    name: "VidBinge",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidbinge.dev/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidbinge.dev/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "111movies",
    name: "111Movies",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://111movies.com/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://111movies.com/movie/${tmdbId}`;
    },
  },
];

interface StreamingSourceSelectorProps {
  currentSource: StreamingSource;
  onSourceChange: (source: StreamingSource) => void;
}

const StreamingSourceSelector = ({
  currentSource,
  onSourceChange,
}: StreamingSourceSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Server className="w-4 h-4" />
          {currentSource.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {streamingSources.map((source) => (
              <DropdownMenuItem
                key={source.id}
                onClick={() => onSourceChange(source)}
                className="flex items-center justify-between"
              >
                {source.name}
                {currentSource.id === source.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StreamingSourceSelector;
