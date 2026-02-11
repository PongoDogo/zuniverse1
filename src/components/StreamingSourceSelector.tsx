import { useState } from "react";
import { Server, Check, Search, Star, Flag, Zap, Archive, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  StreamingSource,
  streamingSources,
  getSourcesByCategory,
  categoryLabels,
  categoryOrder,
  SourceCategory,
  savePreferredSource,
} from "@/lib/streamingSources";
import { getSourceFavorites, toggleSourceFavorite, isSourceFavorite } from "@/lib/sourceFavorites";

export type { StreamingSource };
export { streamingSources };

interface StreamingSourceSelectorProps {
  currentSource: StreamingSource;
  onSourceChange: (source: StreamingSource) => void;
}

const categoryIcons: Record<SourceCategory, typeof Star> = {
  top: Star,
  reliable: Zap,
  good: Flag,
  alternative: Server,
  backup: Archive,
};

const StreamingSourceSelector = ({
  currentSource,
  onSourceChange,
}: StreamingSourceSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setRefresh] = useState(0);
  const sourcesByCategory = getSourcesByCategory();

  const handleSourceChange = (source: StreamingSource) => {
    savePreferredSource(source.id);
    onSourceChange(source);
  };

  const handleToggleFavorite = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSourceFavorite(sourceId);
    setRefresh((r) => r + 1);
  };

  const filteredSources = searchQuery
    ? streamingSources.filter((source) =>
        source.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const favoriteSources = streamingSources.filter((s) => isSourceFavorite(s.id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="gap-2 text-xs sm:text-sm">
          <Server className="w-4 h-4" />
          <span className="max-w-[100px] sm:max-w-none truncate">{currentSource.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        {/* Search */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="h-[380px]">
          <div className="p-1">
            {/* Favorite Sources Section */}
            {!searchQuery && favoriteSources.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2 text-xs text-primary py-2">
                  <Heart className="w-3.5 h-3.5 fill-primary" />
                  Your Favorites
                </DropdownMenuLabel>
                {favoriteSources.map((source) => (
                  <DropdownMenuItem
                    key={`fav-${source.id}`}
                    onClick={() => handleSourceChange(source)}
                    className="flex items-center justify-between cursor-pointer ml-2"
                  >
                    <span>{source.name}</span>
                    <div className="flex items-center gap-1">
                      {currentSource.id === source.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {filteredSources ? (
              filteredSources.length > 0 ? (
                filteredSources.map((source) => (
                  <DropdownMenuItem
                    key={source.id}
                    onClick={() => handleSourceChange(source)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {categoryLabels[source.category].split(" ")[0]}
                      </span>
                      {source.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleFavorite(e, source.id)}
                        className="p-0.5 hover:text-primary transition-colors"
                      >
                        <Heart className={`w-3 h-3 ${isSourceFavorite(source.id) ? "fill-primary text-primary" : ""}`} />
                      </button>
                      {currentSource.id === source.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sources found
                </p>
              )
            ) : (
              categoryOrder.map((category) => {
                const sources = sourcesByCategory[category];
                if (sources.length === 0) return null;
                
                const Icon = categoryIcons[category];
                
                return (
                  <div key={category}>
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                      <Icon className="w-3.5 h-3.5" />
                      {categoryLabels[category]}
                    </DropdownMenuLabel>
                    {sources.map((source) => (
                      <DropdownMenuItem
                        key={source.id}
                        onClick={() => handleSourceChange(source)}
                        className="flex items-center justify-between cursor-pointer ml-2"
                      >
                        <span>{source.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleToggleFavorite(e, source.id)}
                            className="p-0.5 hover:text-primary transition-colors"
                          >
                            <Heart className={`w-3 h-3 ${isSourceFavorite(source.id) ? "fill-primary text-primary" : ""}`} />
                          </button>
                          {currentSource.id === source.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StreamingSourceSelector;
