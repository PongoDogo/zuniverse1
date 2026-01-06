import { useCallback, useRef, useState, useEffect } from 'react';
import { Shield, Play, MousePointer } from 'lucide-react';

interface SafeClickOverlayProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isActive: boolean;
  onDeactivate: () => void;
}

// Safe zone is the center area where play buttons typically are
// Edges are where ad overlays and clickjacking usually happen
const SAFE_ZONE = {
  // Percentage from each edge that's considered "dangerous"
  edgePercent: 15,
  // Center zone size as percentage of total area
  centerWidthPercent: 50,
  centerHeightPercent: 50,
};

const SafeClickOverlay = ({ iframeRef, isActive, onDeactivate }: SafeClickOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [clicksForwarded, setClicksForwarded] = useState(0);
  const [lastBlockReason, setLastBlockReason] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  // Hide hint after first successful click
  useEffect(() => {
    if (clicksForwarded > 0) {
      setShowHint(false);
    }
  }, [clicksForwarded]);

  const isInSafeZone = useCallback((clientX: number, clientY: number): { safe: boolean; reason?: string } => {
    if (!overlayRef.current) return { safe: false, reason: 'No overlay' };

    const rect = overlayRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    const percentX = (relativeX / rect.width) * 100;
    const percentY = (relativeY / rect.height) * 100;

    // Check if click is in edge zones (dangerous)
    const edgeP = SAFE_ZONE.edgePercent;
    
    // Top edge
    if (percentY < edgeP) {
      return { safe: false, reason: 'Top edge (close button area)' };
    }
    // Bottom edge
    if (percentY > (100 - edgeP)) {
      return { safe: false, reason: 'Bottom edge (banner area)' };
    }
    // Left edge
    if (percentX < edgeP) {
      return { safe: false, reason: 'Left edge' };
    }
    // Right edge
    if (percentX > (100 - edgeP)) {
      return { safe: false, reason: 'Right edge' };
    }

    // Check if in center safe zone
    const centerStartX = (100 - SAFE_ZONE.centerWidthPercent) / 2;
    const centerEndX = centerStartX + SAFE_ZONE.centerWidthPercent;
    const centerStartY = (100 - SAFE_ZONE.centerHeightPercent) / 2;
    const centerEndY = centerStartY + SAFE_ZONE.centerHeightPercent;

    if (percentX >= centerStartX && percentX <= centerEndX &&
        percentY >= centerStartY && percentY <= centerEndY) {
      return { safe: true };
    }

    // In the "middle ground" - allow but with caution
    return { safe: true };
  }, []);

  const forwardClickToIframe = useCallback((clientX: number, clientY: number) => {
    if (!iframeRef.current || !overlayRef.current) return;

    const overlayRect = overlayRef.current.getBoundingClientRect();
    const iframeRect = iframeRef.current.getBoundingClientRect();

    // Calculate position relative to iframe
    const x = clientX - iframeRect.left;
    const y = clientY - iframeRect.top;

    // Temporarily disable pointer-events on overlay to let click through
    overlayRef.current.style.pointerEvents = 'none';
    
    // Create and dispatch a click event at the correct position
    const elementAtPoint = document.elementFromPoint(clientX, clientY);
    
    if (elementAtPoint === iframeRef.current) {
      // We can't directly click inside the iframe, but we can focus it
      // and let the user's next click go through
      iframeRef.current.focus();
      setClicksForwarded(prev => prev + 1);
      console.log(`[SafeClick] ✅ Forwarded click at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }

    // Re-enable after a short delay
    setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.style.pointerEvents = 'auto';
      }
    }, 300);
  }, [iframeRef]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { safe, reason } = isInSafeZone(e.clientX, e.clientY);

    if (safe) {
      forwardClickToIframe(e.clientX, e.clientY);
      setLastBlockReason(null);
    } else {
      console.log(`[SafeClick] ⛔ Blocked click: ${reason}`);
      setLastBlockReason(reason || 'Edge zone');
      
      // Show feedback briefly
      setTimeout(() => setLastBlockReason(null), 2000);
    }
  }, [isInSafeZone, forwardClickToIframe]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Double-click in center = deactivate protection
    const { safe } = isInSafeZone(e.clientX, e.clientY);
    if (safe) {
      onDeactivate();
    }
  }, [isInSafeZone, onDeactivate]);

  if (!isActive) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10 cursor-pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{ 
        background: 'transparent',
        // Visual debugging - uncomment to see zones
        // background: 'rgba(0,255,0,0.1)',
      }}
    >
      {/* Safe zone indicator */}
      <div 
        className="absolute border-2 border-green-500/30 rounded-lg pointer-events-none"
        style={{
          left: `${SAFE_ZONE.edgePercent}%`,
          right: `${SAFE_ZONE.edgePercent}%`,
          top: `${SAFE_ZONE.edgePercent}%`,
          bottom: `${SAFE_ZONE.edgePercent}%`,
        }}
      />

      {/* Center target zone */}
      <div 
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          left: `${(100 - SAFE_ZONE.centerWidthPercent) / 2}%`,
          right: `${(100 - SAFE_ZONE.centerWidthPercent) / 2}%`,
          top: `${(100 - SAFE_ZONE.centerHeightPercent) / 2}%`,
          bottom: `${(100 - SAFE_ZONE.centerHeightPercent) / 2}%`,
        }}
      >
        {showHint && (
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 text-center animate-pulse">
            <Play className="w-8 h-8 text-white mx-auto mb-1" />
            <p className="text-white text-sm font-medium">Click here to play</p>
            <p className="text-gray-400 text-xs">Protected zone - ads blocked outside</p>
          </div>
        )}
      </div>

      {/* Block reason feedback */}
      {lastBlockReason && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2 animate-bounce">
          <Shield className="w-4 h-4" />
          <span>Blocked: {lastBlockReason}</span>
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute bottom-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
        <Shield className="w-3 h-3" />
        <span>Protected</span>
      </div>

      {/* Deactivate hint */}
      <div className="absolute bottom-2 left-2 text-white/50 text-xs">
        Double-click center to disable protection
      </div>
    </div>
  );
};

export default SafeClickOverlay;
