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
  {
    id: "vidrock",
    name: "VidRock",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidrock.net/tv/${tmdbId}/${season}/${episode}?autoplay=true&autonext=true`;
      }
      return `https://vidrock.net/movie/${tmdbId}?autoplay=true`;
    },
  },
  // Greek language support sources (with lang=el parameter)
  {
    id: "vidrock-greek",
    name: "VidRock (Greek)",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidrock.net/tv/${tmdbId}/${season}/${episode}?autoplay=true&autonext=true&lang=el`;
      }
      return `https://vidrock.net/movie/${tmdbId}?autoplay=true&lang=el`;
    },
  },
  {
    id: "vidsrc-greek",
    name: "VidSrc (Greek)",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}?sub_lang=greek`;
      }
      return `https://vidsrc.xyz/embed/movie/${tmdbId}?sub_lang=greek`;
    },
  },
  {
    id: "embedsu-greek",
    name: "Embed.su (Greek)",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}?lang=el`;
      }
      return `https://embed.su/embed/movie/${tmdbId}?lang=el`;
    },
  },
  // Additional streaming sources
  {
    id: "warezcdn",
    name: "WarezCDN",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://embed.warezcdn.link/serie/${tmdbId}/${season}/${episode}`;
      }
      return `https://embed.warezcdn.link/filme/${tmdbId}`;
    },
  },
  {
    id: "filmxy",
    name: "FilmXY",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.filmxy.pw/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://www.filmxy.pw/embed/movie/${tmdbId}`;
    },
  },
  {
    id: "dbgo",
    name: "DBGO",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://dbgo.fun/imdb.php?id=${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://dbgo.fun/imdb.php?id=${tmdbId}`;
    },
  },
  {
    id: "showbox",
    name: "ShowBox",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://showbox.media/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://showbox.media/movie/${tmdbId}`;
    },
  },
  {
    id: "rive",
    name: "Rive",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://rivestream.live/watch?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://rivestream.live/watch?type=movie&id=${tmdbId}`;
    },
  },
  {
    id: "flicky",
    name: "Flicky",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://flicky.host/embed/tv/?id=${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://flicky.host/embed/movie/?id=${tmdbId}`;
    },
  },
  {
    id: "catflix",
    name: "Catflix",
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
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidplay.online/e/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://vidplay.online/e/${tmdbId}`;
    },
  },
  {
    id: "filemoon",
    name: "Filemoon",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://filemoon.sx/e/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://filemoon.sx/e/${tmdbId}`;
    },
  },
  {
    id: "streamwish",
    name: "StreamWish",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://streamwish.to/e/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://streamwish.to/e/${tmdbId}`;
    },
  },
  {
    id: "doodstream",
    name: "DoodStream",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://dood.re/e/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://dood.re/e/${tmdbId}`;
    },
  },
  {
    id: "mp4upload",
    name: "MP4Upload",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://www.mp4upload.com/embed-${tmdbId}.html?s=${season}&e=${episode}`;
      }
      return `https://www.mp4upload.com/embed-${tmdbId}.html`;
    },
  },
  {
    id: "upstream",
    name: "Upstream",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://upstream.to/embed-${tmdbId}.html?s=${season}&e=${episode}`;
      }
      return `https://upstream.to/embed-${tmdbId}.html`;
    },
  },
  {
    id: "mixdrop",
    name: "MixDrop",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://mixdrop.ag/e/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://mixdrop.ag/e/${tmdbId}`;
    },
  },
  {
    id: "voe",
    name: "VOE",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://voe.sx/e/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://voe.sx/e/${tmdbId}`;
    },
  },
  {
    id: "okru",
    name: "OK.ru",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://ok.ru/videoembed/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://ok.ru/videoembed/${tmdbId}`;
    },
  },
  {
    id: "dailymotion",
    name: "Dailymotion",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://geo.dailymotion.com/player.html?video=${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://geo.dailymotion.com/player.html?video=${tmdbId}`;
    },
  },
  {
    id: "vidsrcme",
    name: "VidSrc.me",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
    },
  },
  {
    id: "vidsrcme-greek",
    name: "VidSrc.me (Greek)",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&sub_lang=greek`;
      }
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}&sub_lang=greek`;
    },
  },
  {
    id: "streamsb",
    name: "StreamSB",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://streamsb.net/embed-${tmdbId}.html?s=${season}&e=${episode}`;
      }
      return `https://streamsb.net/embed-${tmdbId}.html`;
    },
  },
  {
    id: "hexload",
    name: "Hexload",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://hexload.com/e/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://hexload.com/e/${tmdbId}`;
    },
  },
  {
    id: "uqload",
    name: "UQLoad",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://uqload.ws/embed-${tmdbId}.html?s=${season}&e=${episode}`;
      }
      return `https://uqload.ws/embed-${tmdbId}.html`;
    },
  },
  {
    id: "turbovid",
    name: "TurboVid",
    buildUrl: (tmdbId, mediaType, season, episode) => {
      if (mediaType === "tv" && season && episode) {
        return `https://turbovid.eu/e/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://turbovid.eu/e/${tmdbId}`;
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
