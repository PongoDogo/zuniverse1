import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getImageUrl } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "b2ec786f995dcde6d8d264ecd3cd91e9";
const BASE_URL = "https://api.themoviedb.org/3";

interface CreditItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: string;
  popularity: number;
  vote_average: number;
}

interface ActorGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  actorId: number;
  actorName: string;
  actorImage: string | null;
}

const fetchActorCredits = async (actorId: number): Promise<CreditItem[]> => {
  const res = await fetch(
    `${BASE_URL}/person/${actorId}/combined_credits?api_key=${API_KEY}`
  );
  if (!res.ok) throw new Error("Failed to fetch actor credits");
  const data = await res.json();
  const cast: CreditItem[] = data.cast ?? [];
  // Deduplicate by id, take top 8 by popularity
  const seen = new Set<number>();
  return cast
    .filter((c) => {
      if (seen.has(c.id) || !c.poster_path) return false;
      seen.add(c.id);
      return true;
    })
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8);
};

// Layout constants
const SVG_SIZE = 460;
const CENTER = SVG_SIZE / 2;
const ACTOR_R = 44;
const NODE_R = 32;
const ORBIT_R = 160;

const ActorGraphModal = ({
  isOpen,
  onClose,
  actorId,
  actorName,
  actorImage,
}: ActorGraphModalProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: credits, isLoading } = useQuery({
    queryKey: ["actor-credits", actorId],
    queryFn: () => fetchActorCredits(actorId),
    enabled: isOpen && !!actorId,
    staleTime: 1000 * 60 * 10,
  });

  // Reset hover on close
  useEffect(() => {
    if (!isOpen) setHoveredIdx(null);
  }, [isOpen]);

  const nodes = useMemo(() => {
    if (!credits) return [];
    return credits.map((item, i) => {
      const angle = (2 * Math.PI * i) / credits.length - Math.PI / 2;
      return {
        ...item,
        x: CENTER + ORBIT_R * Math.cos(angle),
        y: CENTER + ORBIT_R * Math.sin(angle),
      };
    });
  }, [credits]);

  const handleNodeClick = useCallback(
    (item: CreditItem) => {
      onClose();
      const type = item.media_type === "tv" ? "tv" : "movie";
      navigate(`/${type}/${item.id}`);
    },
    [navigate, onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-background border-border">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            🕸️ {language === "el" ? "Δίκτυο Ηθοποιού" : "Actor's Web"} — {actorName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center p-4 pt-0">
          {isLoading ? (
            <div className="h-[460px] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              width="100%"
              height="auto"
              className="max-h-[60vh]"
              role="img"
              aria-label={`${actorName} connection graph`}
            >
              <defs>
                {/* Actor clip */}
                <clipPath id="actor-clip">
                  <circle cx={CENTER} cy={CENTER} r={ACTOR_R} />
                </clipPath>
                {/* Node clips */}
                {nodes.map((_, i) => (
                  <clipPath key={i} id={`node-clip-${i}`}>
                    <circle cx={nodes[i].x} cy={nodes[i].y} r={NODE_R} />
                  </clipPath>
                ))}
              </defs>

              {/* Lines from center to nodes */}
              {nodes.map((node, i) => (
                <line
                  key={`line-${i}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={node.x}
                  y2={node.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth={hoveredIdx === i ? 2.5 : 1}
                  strokeOpacity={hoveredIdx === i ? 0.9 : 0.25}
                  className="transition-all duration-200"
                />
              ))}

              {/* Orbit ring (decorative) */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={ORBIT_R}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                strokeDasharray="4 4"
              />

              {/* Movie/TV Nodes */}
              {nodes.map((node, i) => {
                const isHovered = hoveredIdx === i;
                const scale = isHovered ? 1.18 : 1;
                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => handleNodeClick(node)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleNodeClick(node)}
                    aria-label={node.title || node.name || ""}
                  >
                    {/* Glow ring on hover */}
                    {isHovered && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={NODE_R + 4}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        opacity={0.7}
                      />
                    )}
                    <g
                      style={{
                        transform: `translate(${node.x}px, ${node.y}px) scale(${scale}) translate(${-node.x}px, ${-node.y}px)`,
                        transformOrigin: `${node.x}px ${node.y}px`,
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={NODE_R}
                        fill="hsl(var(--card))"
                        stroke="hsl(var(--border))"
                        strokeWidth={1.5}
                      />
                      <image
                        href={getImageUrl(node.poster_path, "w200")}
                        x={node.x - NODE_R}
                        y={node.y - NODE_R}
                        width={NODE_R * 2}
                        height={NODE_R * 2}
                        clipPath={`url(#node-clip-${i})`}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </g>
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={node.x - 60}
                          y={node.y + NODE_R + 6}
                          width={120}
                          height={22}
                          rx={4}
                          fill="hsl(var(--popover))"
                          stroke="hsl(var(--border))"
                          strokeWidth={0.5}
                        />
                        <text
                          x={node.x}
                          y={node.y + NODE_R + 21}
                          textAnchor="middle"
                          fontSize={10}
                          fill="hsl(var(--foreground))"
                          fontFamily="Inter, sans-serif"
                          fontWeight={500}
                        >
                          {(node.title || node.name || "").slice(0, 18)}
                          {(node.title || node.name || "").length > 18 ? "…" : ""}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Center Actor Node */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={ACTOR_R + 3}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
              />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={ACTOR_R}
                fill="hsl(var(--card))"
              />
              <image
                href={getImageUrl(actorImage, "w200")}
                x={CENTER - ACTOR_R}
                y={CENTER - ACTOR_R}
                width={ACTOR_R * 2}
                height={ACTOR_R * 2}
                clipPath="url(#actor-clip)"
                preserveAspectRatio="xMidYMid slice"
              />
              {/* Actor name below center */}
              <text
                x={CENTER}
                y={CENTER + ACTOR_R + 16}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="hsl(var(--foreground))"
                fontFamily="Inter, sans-serif"
              >
                {actorName.length > 20 ? actorName.slice(0, 18) + "…" : actorName}
              </text>
            </svg>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActorGraphModal;
