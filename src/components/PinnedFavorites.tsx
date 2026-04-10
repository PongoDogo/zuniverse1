import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Pin, X } from "lucide-react";
import { getPinnedItems, unpinItem, PinnedItem } from "@/lib/userPreferences";
import { getImageUrl } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";

const PinnedFavorites = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<PinnedItem[]>([]);

  useEffect(() => {
    setItems(getPinnedItems());
  }, []);

  const handleUnpin = (item: PinnedItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    unpinItem(item.id, item.mediaType);
    setItems(getPinnedItems());
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-4 sm:mb-6 content-auto" style={{ containIntrinsicSize: "0 240px" }}>
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <Pin className="w-4 h-4 text-primary" />
        <h2 className="text-base sm:text-lg md:text-xl font-bold">{t("pinnedFavorites")}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {items.map((item) => (
          <div key={`${item.mediaType}-${item.id}`} className="group relative">
            <Link to={`/${item.mediaType}/${item.id}/watch`}>
              <div className="relative aspect-video rounded-lg overflow-hidden card-shadow ring-2 ring-primary/30">
                <img
                  src={getImageUrl(item.backdrop_path || item.poster_path, "w300")}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <button
                  onClick={(e) => handleUnpin(item, e)}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs sm:text-sm font-medium truncate">{item.title}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedFavorites;
