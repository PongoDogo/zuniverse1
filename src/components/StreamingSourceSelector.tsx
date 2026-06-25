import { useMemo, useState } from "react";
import { Server, Check, Search, Star, Flag, Zap, Archive, Heart, Sparkles, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  StreamingSource,
  streamingSources,
  getSourcesByCategory,
  categoryLabels,
  categoryOrder,
  SourceCategory,
  savePreferredSource,
  getSourceStatus,
  statusDotClass,
  statusLabels,
  SourceStatus,
} from "@/lib/streamingSources";
import { toggleSourceFavorite, isSourceFavorite } from "@/lib/sourceFavorites";

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

type Filter = "all" | "live" | "favorites";

const StreamingSourceSelector = ({
  currentSource,
  onSourceChange,
}: StreamingSourceSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [, setRefresh] = useState(0);

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

  const visibleSources = useMemo(() => {
    let list = streamingSources;
    if (filter === "live") list = list.filter((s) => getSourceStatus(s.id) === "live");
    if (filter === "favorites") list = list.filter((s) => isSourceFavorite(s.id));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [filter, searchQuery]);

  const grouped = useMemo(() => {
    const all = getSourcesByCategory();
    if (filter === "all" && !searchQuery) return all;
    const out: Record<SourceCategory, StreamingSource[]> = {
      top: [], reliable: [], good: [], alternative: [], backup: [],
    };
    visibleSources.forEach((s) => out[s.category].push(s));
    return out;
  }, [visibleSources, filter, searchQuery]);

  const liveCount = streamingSources.filter((s) => getSourceStatus(s.id) === "live").length;
  const favCount = streamingSources.filter((s) => isSourceFavorite(s.id)).length;
  const currentStatus = getSourceStatus(currentSource.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="gap-2 text-xs sm:text-sm h-9 px-3 group">
          <span className={cn("w-1.5 h-1.5 rounded-full transition-all", statusDotClass[currentStatus])} />
          <Server className="w-3.5 h-3.5 opacity-70" />
          <span className="max-w-[120px] sm:max-w-[160px] truncate font-medium">
            {currentSource.name.replace(/[⭐]/g, "").trim()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[320px] p-0 overflow-hidden border-border/60 bg-popover/95 backdrop-blur-xl shadow-2xl"
      >
        {/* Header */}
        <div className="px-3 pt-3 pb-2 border-b border-border/60 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold tracking-wide">Streaming Sources</span>
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {streamingSources.length} total · {liveCount} live
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background/60 border-border/60"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1">
            {[
              { id: "all" as Filter, label: "All", count: streamingSources.length },
              { id: "live" as Filter, label: "Live", count: liveCount },
              { id: "favorites" as Filter, label: "★", count: favCount },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all",
                  filter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {f.label} <span className="opacity-70 tabular-nums">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[360px]">
          <div className="p-1.5">
            {visibleSources.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No sources match
              </div>
            ) : (
              categoryOrder.map((category) => {
                const sources = grouped[category];
                if (!sources || sources.length === 0) return null;
                const Icon = categoryIcons[category];

                return (
                  <div key={category} className="mb-1">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                      <Icon className="w-3 h-3" />
                      <span>{categoryLabels[category]}</span>
                      <span className="ml-auto tabular-nums">{sources.length}</span>
                    </div>
                    <div className="space-y-0.5">
                      {sources.map((source) => {
                        const status = getSourceStatus(source.id);
                        const isCurrent = currentSource.id === source.id;
                        const isFav = isSourceFavorite(source.id);
                        const isDown = status === "down";
                        return (
                          <button
                            key={source.id}
                            onClick={() => !isDown && handleSourceChange(source)}
                            disabled={isDown}
                            title={`${source.name} — ${statusLabels[status]}`}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all group",
                              isCurrent
                                ? "bg-primary/15 text-foreground ring-1 ring-primary/30"
                                : "hover:bg-muted/60",
                              isDown && "opacity-40 cursor-not-allowed"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                statusDotClass[status]
                              )}
                            />
                            <span className="truncate text-left flex-1 font-medium">
                              {source.name.replace(/[⭐]/g, "").trim()}
                            </span>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => handleToggleFavorite(e, source.id)}
                              className={cn(
                                "p-0.5 rounded transition-opacity",
                                isFav ? "opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
                              )}
                            >
                              <Heart className={cn("w-3 h-3", isFav && "fill-primary text-primary")} />
                            </span>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer legend */}
        <div className="px-3 py-2 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Live</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Limited</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />Unverified</span>
          </div>
          <span>Auto-fallback ON</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StreamingSourceSelector;
