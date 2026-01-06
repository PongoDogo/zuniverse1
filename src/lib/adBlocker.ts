// NUCLEAR AD BLOCKER - Maximum aggression
// Blocks popups, redirects, overlays, and all known ad techniques

let blockedCount = 0;
let isInitialized = false;

// Callback to notify UI of blocked ads
let onBlockedCallback: ((count: number) => void) | null = null;

export const setBlockedCallback = (callback: (count: number) => void) => {
  onBlockedCallback = callback;
};

const notifyBlocked = () => {
  blockedCount++;
  onBlockedCallback?.(blockedCount);
  console.log(`[AdBlocker] Total blocked: ${blockedCount}`);
};

// Extensive ad domain list
const AD_DOMAINS = [
  // Ad networks
  'doubleclick', 'googlesyndication', 'googleadservices', 'adservice', 'adsense',
  'adclick', 'popads', 'popcash', 'propellerads', 'exoclick', 'trafficjunky',
  'adsterra', 'adnxs', 'advertising', 'pubmatic', 'openx', 'rubiconproject',
  'casalemedia', 'criteo', 'taboola', 'outbrain', 'mgid', 'revcontent',
  'amazon-adsystem', 'bidswitch', 'media.net', 'adf.ly', 'shorte.st',
  
  // Popunder/popup networks
  'popunder', 'pop2', 'clickadu', 'admaven', 'hilltopads', 'richads',
  'trafficstars', 'clickaine', 'evadav', 'galaksion', 'popmyads',
  'adcash', 'revenuehits', 'yllix', 'adfly', 'linkbucks',
  
  // Tracking
  'scorecardresearch', 'quantserve', 'facebook.com/tr', 'segment.io',
  'analytics', 'tracker', 'tracking', 'pixel', 'beacon',
  
  // Scam/spam categories
  'bet365', '1xbet', 'betway', 'casino', 'poker', 'slots', 'gambling', 'wager',
  'sex', 'porn', 'xxx', 'adult', 'dating', 'hookup', 'singles',
  'crypto', 'bitcoin', 'forex', 'binary', 'trading', 'profit',
  
  // URL shorteners often used for ads
  'bit.ly', 'tinyurl', 'shorturl', 'cutt.ly', 'rebrand.ly',
];

const BLOCKED_EXTENSIONS = ['.xyz', '.top', '.club', '.live', '.click', '.buzz', '.bet', '.casino', '.win', '.loan', '.work', '.gq', '.ml', '.ga', '.cf', '.tk'];

export const isAdUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  
  // Check ad domains
  if (AD_DOMAINS.some(domain => lowerUrl.includes(domain))) return true;
  
  // Check suspicious extensions
  if (BLOCKED_EXTENSIONS.some(ext => lowerUrl.includes(ext))) return true;
  
  // Check common ad paths
  if (/\/(ads?|advert|banner|popup|popunder|sponsor|track|click|redirect)\//i.test(url)) return true;
  
  // Check redirect patterns
  if (/[?&](redirect|ref|aff|click|track|url|goto|target)=/i.test(url)) return true;
  
  return false;
};

export const isExternalUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return true; // If we can't parse it, assume external
  }
};

// Store original functions
const originals = {
  windowOpen: window.open,
  fetch: window.fetch,
  createElement: document.createElement.bind(document),
  addEventListener: EventTarget.prototype.addEventListener,
};

export const initAdBlocker = (): void => {
  if (isInitialized) return;
  isInitialized = true;
  
  console.log('[AdBlocker] Initializing NUCLEAR mode...');

  // ========== 1. BLOCK ALL window.open ==========
  window.open = function(...args: any[]): Window | null {
    console.log('[AdBlocker] ⛔ Blocked window.open:', args[0]);
    notifyBlocked();
    return null;
  };

  // ========== 2. Block ALL popups via click events ==========
  const blockClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    
    // Check for anchor tags
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.href || anchor.getAttribute('href') || '';
      const targetAttr = anchor.getAttribute('target');
      
      // Block external links and _blank targets
      if (targetAttr === '_blank' || isExternalUrl(href) || isAdUrl(href)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('[AdBlocker] ⛔ Blocked link:', href);
        notifyBlocked();
        return false;
      }
    }
    
    // Block clicks on overlay/ad elements
    const className = (target.className?.toString?.() || '').toLowerCase();
    const id = (target.id || '').toLowerCase();
    const tagName = target.tagName.toLowerCase();
    
    const suspiciousPatterns = /overlay|popup|modal|interstitial|preroll|ad-|ads-|banner|click-through|click_through/;
    
    if (suspiciousPatterns.test(className) || suspiciousPatterns.test(id)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('[AdBlocker] ⛔ Blocked overlay click');
      notifyBlocked();
      return false;
    }
  };
  
  // Capture ALL clicks at the document level
  document.addEventListener('click', blockClick, true);
  document.addEventListener('mousedown', blockClick, true);
  document.addEventListener('mouseup', blockClick, true);
  document.addEventListener('touchstart', blockClick, { capture: true, passive: false });
  document.addEventListener('touchend', blockClick, { capture: true, passive: false });

  // ========== 3. Block focus hijacking ==========
  let lastFocusTime = 0;
  window.addEventListener('blur', () => {
    const now = Date.now();
    // If blur happens too fast, likely a popup attempt
    if (now - lastFocusTime < 500) {
      console.log('[AdBlocker] ⛔ Blocked focus hijack');
      notifyBlocked();
      setTimeout(() => window.focus(), 10);
    }
    lastFocusTime = now;
  }, true);

  // ========== 4. Block location changes ==========
  const blockLocation = (methodName: string) => {
    try {
      const original = (window.location as any)[methodName]?.bind(window.location);
      if (original) {
        Object.defineProperty(window.location, methodName, {
          value: function(url: string) {
            if (isExternalUrl(url) || isAdUrl(url)) {
              console.log(`[AdBlocker] ⛔ Blocked location.${methodName}:`, url);
              notifyBlocked();
              return;
            }
            return original(url);
          },
          writable: false,
          configurable: false,
        });
      }
    } catch (e) {}
  };
  
  blockLocation('assign');
  blockLocation('replace');

  // Block location.href setter
  try {
    const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    if (locationDescriptor && locationDescriptor.set) {
      const originalSet = locationDescriptor.set;
      Object.defineProperty(window, 'location', {
        get: () => window.location,
        set: (url) => {
          if (typeof url === 'string' && (isExternalUrl(url) || isAdUrl(url))) {
            console.log('[AdBlocker] ⛔ Blocked location setter:', url);
            notifyBlocked();
            return;
          }
          originalSet.call(window, url);
        },
      });
    }
  } catch (e) {}

  // ========== 5. Block form submissions ==========
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    const action = form.action || '';
    
    if (isExternalUrl(action) || isAdUrl(action)) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[AdBlocker] ⛔ Blocked form submit:', action);
      notifyBlocked();
    }
  }, true);

  // ========== 6. Block XMLHttpRequest ads ==========
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    const urlStr = url.toString();
    if (isAdUrl(urlStr)) {
      console.log('[AdBlocker] ⛔ Blocked XHR:', urlStr);
      notifyBlocked();
      // Don't open the request
      return;
    }
    return originalXHROpen.apply(this, [method, url, ...rest] as any);
  };

  // ========== 7. Block fetch ads ==========
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
    if (isAdUrl(url)) {
      console.log('[AdBlocker] ⛔ Blocked fetch:', url);
      notifyBlocked();
      return Promise.resolve(new Response('', { status: 200 }));
    }
    return originals.fetch.apply(this, [input, init] as any);
  };

  // ========== 8. Block WebSocket ads ==========
  const OriginalWebSocket = window.WebSocket;
  (window as any).WebSocket = function(url: string | URL, protocols?: string | string[]) {
    const urlStr = url.toString();
    if (isAdUrl(urlStr)) {
      console.log('[AdBlocker] ⛔ Blocked WebSocket:', urlStr);
      notifyBlocked();
      throw new Error('Blocked by AdBlocker');
    }
    return new OriginalWebSocket(url, protocols);
  };
  (window as any).WebSocket.prototype = OriginalWebSocket.prototype;
  (window as any).WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
  (window as any).WebSocket.OPEN = OriginalWebSocket.OPEN;
  (window as any).WebSocket.CLOSING = OriginalWebSocket.CLOSING;
  (window as any).WebSocket.CLOSED = OriginalWebSocket.CLOSED;

  // ========== 9. Block createElement for ad elements ==========
  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originals.createElement(tagName, options);
    const tag = tagName.toLowerCase();
    
    if (tag === 'a' || tag === 'iframe' || tag === 'script' || tag === 'img') {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        if ((name === 'href' || name === 'src') && isAdUrl(value)) {
          console.log(`[AdBlocker] ⛔ Blocked ${tag} creation with:`, value);
          notifyBlocked();
          return;
        }
        if (name === 'target' && value === '_blank') {
          console.log('[AdBlocker] ⛔ Blocked _blank target');
          notifyBlocked();
          return;
        }
        return originalSetAttribute(name, value);
      };
      
      // Also intercept direct property assignment
      if (tag === 'a') {
        Object.defineProperty(element, 'href', {
          set: function(val) {
            if (isAdUrl(val) || isExternalUrl(val)) {
              console.log('[AdBlocker] ⛔ Blocked anchor href:', val);
              notifyBlocked();
              return;
            }
            originalSetAttribute('href', val);
          },
          get: function() {
            return element.getAttribute('href') || '';
          }
        });
      }
    }
    
    return element;
  };

  // ========== 10. Block postMessage navigation ==========
  window.addEventListener('message', (event) => {
    if (typeof event.data === 'object' && event.data !== null) {
      const data = event.data;
      if (data.type === 'navigate' || data.action === 'redirect' || data.url || data.href || data.link) {
        const url = data.url || data.href || data.link || '';
        if (isExternalUrl(url) || isAdUrl(url)) {
          console.log('[AdBlocker] ⛔ Blocked postMessage navigation:', url);
          notifyBlocked();
        }
      }
    }
  }, true);

  // ========== 11. Block alert/confirm/prompt abuse ==========
  window.alert = function(msg?: any) {
    console.log('[AdBlocker] ⛔ Blocked alert:', msg);
    notifyBlocked();
  };
  window.confirm = function(msg?: string): boolean {
    console.log('[AdBlocker] ⛔ Blocked confirm:', msg);
    notifyBlocked();
    return false;
  };
  window.prompt = function(msg?: string): string | null {
    console.log('[AdBlocker] ⛔ Blocked prompt:', msg);
    notifyBlocked();
    return null;
  };

  // ========== 12. Block beforeunload hijacking ==========
  try {
    Object.defineProperty(window, 'onbeforeunload', {
      set: () => {},
      get: () => null,
      configurable: false,
    });
  } catch (e) {}

  // ========== 13. MutationObserver to remove ad elements ==========
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        
        const checkAndRemove = (el: HTMLElement) => {
          const tag = el.tagName.toLowerCase();
          const src = el.getAttribute('src') || el.getAttribute('href') || '';
          const className = (el.className?.toString?.() || '').toLowerCase();
          const id = (el.id || '').toLowerCase();
          
          // Check src/href for ad URLs
          if (src && isAdUrl(src)) {
            console.log(`[AdBlocker] ⛔ Removed ad ${tag}:`, src);
            el.remove();
            notifyBlocked();
            return true;
          }
          
          // Check class/id for ad patterns
          const adPatterns = /\b(ad|ads|advert|banner|popup|popunder|sponsor|interstitial|preroll)\b/i;
          if (adPatterns.test(className) || adPatterns.test(id)) {
            // Don't remove our own ad blocker elements or video player elements
            if (className.includes('adblock-') || id.includes('adblock-')) return false;
            if (el.closest('[class*="video-player"]')) return false;
            
            console.log(`[AdBlocker] ⛔ Removed ad element:`, tag, className || id);
            el.remove();
            notifyBlocked();
            return true;
          }
          
          return false;
        };
        
        if (!checkAndRemove(node)) {
          // Check children
          node.querySelectorAll('iframe, script, div, a').forEach((child) => {
            checkAndRemove(child as HTMLElement);
          });
        }
      }
    }
  });
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // ========== 14. Block keyboard shortcuts used by ads ==========
  document.addEventListener('keydown', (e) => {
    // Block Ctrl+Click or other combinations ads might use
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement?.tagName === 'A') {
        e.preventDefault();
        console.log('[AdBlocker] ⛔ Blocked keyboard navigation');
        notifyBlocked();
      }
    }
  }, true);

  console.log('[AdBlocker] ✅ NUCLEAR mode activated - all protections enabled');
};

// CSS injection for hiding ad elements
export const injectAdBlockerCSS = (): void => {
  const existingStyle = document.getElementById('nuclear-adblock-css');
  if (existingStyle) return;
  
  const style = document.createElement('style');
  style.id = 'nuclear-adblock-css';
  style.textContent = `
    /* Hide common ad containers aggressively */
    [class*="ad-container"], [class*="ad-wrapper"], [class*="ad-banner"],
    [class*="advertisement"], [class*="ad-unit"], [class*="ad-slot"],
    [class*="adsbygoogle"], [id*="google_ads"], [id*="ad-"], [id*="ad_"],
    [class*="popup-ad"], [class*="overlay-ad"], [class*="pop-overlay"],
    [class*="interstitial"], [class*="preroll"], [class*="video-ads"],
    [class*="ima-ad"], [class*="sponsorship"], [class*="promoted"],
    div[data-ad], div[data-ads], div[data-ad-slot], ins.adsbygoogle,
    .adsbygoogle, #player-advertising, .ima-ad-container,
    iframe[src*="ads"], iframe[src*="doubleclick"], iframe[src*="googlesyndication"],
    iframe[src*="popads"], iframe[src*="popcash"], iframe[src*="propeller"],
    div[class*="click-overlay"], div[class*="click-interceptor"],
    a[href*="bet365"], a[href*="1xbet"], a[href*="casino"],
    div[style*="z-index: 99999"], div[style*="z-index:99999"],
    div[style*="z-index: 999999"], div[style*="z-index:999999"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      height: 0 !important;
      width: 0 !important;
      max-height: 0 !important;
      max-width: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      left: -99999px !important;
      top: -99999px !important;
    }
    
    /* Disable pointer events on suspicious overlays */
    body > div[style*="position: fixed"],
    body > div[style*="position:fixed"] {
      pointer-events: none !important;
    }
    
    /* But allow our video player */
    .video-player-container, .video-player-container * {
      pointer-events: auto !important;
    }
    
    /* Block click overlays that might be over videos */
    .click-capture, .click-blocker, .overlay-blocker {
      pointer-events: none !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('[AdBlocker] ✅ CSS injection complete');
};

// Special protection for video player area
export const setupIframeProtection = (): void => {
  // Periodically check for and close any new windows/tabs
  const checkInterval = setInterval(() => {
    // Try to regain focus if lost to a popup
    if (document.hidden) {
      window.focus();
    }
  }, 1000);
  
  // Stop after 5 minutes to save resources
  setTimeout(() => clearInterval(checkInterval), 300000);
  
  // Block right-click menu that ads might abuse
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    const className = (target.className?.toString?.() || '').toLowerCase();
    if (className.includes('overlay') || className.includes('ad')) {
      e.preventDefault();
    }
  }, true);
  
  console.log('[AdBlocker] ✅ Iframe protection active');
};

// Get blocked count
export const getBlockedCount = (): number => blockedCount;

// Reset counter
export const resetBlockedCount = (): void => {
  blockedCount = 0;
};
