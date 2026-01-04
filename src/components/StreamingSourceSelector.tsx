import { useState } from "react";
import { motion } from "framer-motion";
import { Server, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
      <DropdownMenuContent align="end">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StreamingSourceSelector;
