// Ultra-aggressive ad blocker with Service Worker support

const AD_DOMAINS = [
  'doubleclick', 'googlesyndication', 'googleadservices', 'adservice', 'adsense',
  'adclick', 'popads', 'popcash', 'propellerads', 'exoclick', 'trafficjunky',
  'adsterra', 'adnxs', 'advertising', 'ads.', '/ads/', 'banner', 'clicktrack',
  'tracker', 'pixel', 'facebook.com/tr', 'scorecardresearch', 'quantserve',
  'amazon-adsystem', 'bidswitch', 'pubmatic', 'openx', 'rubiconproject',
  'casalemedia', 'criteo', 'taboola', 'outbrain', 'mgid', 'revcontent',
  'bet365', '1xbet', 'betway', 'casino', 'poker', 'slots', 'gambling', 'wager',
  'sex', 'porn', 'xxx', 'adult', 'dating', 'meet', 'singles', 'hookup',
  'crypto', 'bitcoin', 'forex', 'binary', 'trading', 'profit',
];

const REDIRECT_PATTERNS = [
  /^https?:\/\/[^/]+\/(redirect|out|go|click|track|ad|sponsor)/i,
  /\?(.*&)?(url|redirect|ref|link|goto|target)=/i,
  /\.(xyz|top|club|live|stream|click|buzz|bet|casino|poker|win|loan|work|gq|ml|ga|cf|tk)($|\/)/i,
];

export const isAdUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  if (AD_DOMAINS.some(domain => lowerUrl.includes(domain))) return true;
  if (REDIRECT_PATTERNS.some(pattern => pattern.test(url))) return true;
  return false;
};

export const isExternalUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
};

// Register the Service Worker ad blocker
export const registerAdBlockerServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/ad-blocker-sw.js', {
        scope: '/'
      });
      console.log('[AdBlocker] Service Worker registered:', registration.scope);
      return true;
    } catch (error) {
      console.error('[AdBlocker] Service Worker registration failed:', error);
      return false;
    }
  }
  console.log('[AdBlocker] Service Workers not supported');
  return false;
};

// Store original functions before overwriting
const originalOpen = window.open;
const originalAssign = window.location.assign?.bind(window.location);
const originalReplace = window.location.replace?.bind(window.location);

export const initAdBlocker = (): void => {
  console.log('[AdBlocker] Initializing ultra-aggressive mode...');

  // Register Service Worker for network-level blocking
  registerAdBlockerServiceWorker();

  // 1. Completely block window.open
  window.open = function(...args: any[]) {
    console.log('[AdBlocker] Blocked window.open:', args[0]);
    return null;
  };

  // 2. Override XMLHttpRequest to block ad requests
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    const urlString = url.toString();
    if (isAdUrl(urlString)) {
      console.log('[AdBlocker] Blocked XHR:', urlString);
      return;
    }
    return originalXHROpen.apply(this, [method, url, ...rest] as any);
  };

  // 3. Override fetch to block ad requests
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (isAdUrl(url)) {
      console.log('[AdBlocker] Blocked fetch:', url);
      return Promise.resolve(new Response('', { status: 200 }));
    }
    return originalFetch.apply(this, [input, init] as any);
  };

  // 4. Block location.assign
  try {
    if (originalAssign) {
      Object.defineProperty(window.location, 'assign', {
        value: function(url: string) {
          if (isExternalUrl(url) || isAdUrl(url)) {
            console.log('[AdBlocker] Blocked location.assign:', url);
            return;
          }
          originalAssign(url);
        },
        writable: false,
        configurable: false,
      });
    }
  } catch (e) {
    console.log('[AdBlocker] Could not override location.assign');
  }

  // 5. Block location.replace
  try {
    if (originalReplace) {
      Object.defineProperty(window.location, 'replace', {
        value: function(url: string) {
          if (isExternalUrl(url) || isAdUrl(url)) {
            console.log('[AdBlocker] Blocked location.replace:', url);
            return;
          }
          originalReplace(url);
        },
        writable: false,
        configurable: false,
      });
    }
  } catch (e) {
    console.log('[AdBlocker] Could not override location.replace');
  }

  // 6. Block ALL link clicks that go external
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor) {
      const href = anchor.getAttribute('href') || '';
      const targetAttr = anchor.getAttribute('target');
      
      if (isExternalUrl(href) || isAdUrl(href) || targetAttr === '_blank') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('[AdBlocker] Blocked link click:', href);
        return false;
      }
    }
  }, true);

  // 7. Block form submissions to external URLs
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    const action = form.action || '';
    
    if (isExternalUrl(action) || isAdUrl(action)) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[AdBlocker] Blocked form submission:', action);
      return false;
    }
  }, true);

  // 8. Block createElement for suspicious elements
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement(tagName, options);
    
    if (tagName.toLowerCase() === 'a') {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        if (name === 'href' && (isExternalUrl(value) || isAdUrl(value))) {
          console.log('[AdBlocker] Blocked dynamic link:', value);
          return;
        }
        if (name === 'target' && value === '_blank') {
          console.log('[AdBlocker] Blocked _blank target');
          return;
        }
        return originalSetAttribute(name, value);
      };
    }
    
    if (tagName.toLowerCase() === 'iframe') {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        if (name === 'src' && isAdUrl(value)) {
          console.log('[AdBlocker] Blocked ad iframe:', value);
          return;
        }
        return originalSetAttribute(name, value);
      };
    }
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        if (name === 'src' && isAdUrl(value)) {
          console.log('[AdBlocker] Blocked ad script:', value);
          return;
        }
        return originalSetAttribute(name, value);
      };
    }
    
    return element;
  };

  // 9. Block postMessage navigation attempts from iframes
  window.addEventListener('message', (event) => {
    const data = event.data;
    
    if (typeof data === 'object' && data !== null) {
      if (data.type === 'navigate' || data.action === 'redirect' || data.url || data.href) {
        const url = data.url || data.href || '';
        if (isExternalUrl(url) || isAdUrl(url)) {
          console.log('[AdBlocker] Blocked postMessage navigation:', url);
          return;
        }
      }
    }
  }, true);

  // 10. Block beforeunload manipulation
  try {
    Object.defineProperty(window, 'onbeforeunload', {
      set: function() { return; },
      get: function() { return null; },
      configurable: false,
    });
  } catch (e) {}

  // 11. Prevent alert/confirm/prompt hijacking
  window.alert = function(message?: any) {
    console.log('[AdBlocker] Blocked alert:', message);
    return;
  };
  
  window.confirm = function(message?: string) {
    console.log('[AdBlocker] Blocked confirm:', message);
    return false;
  };
  
  window.prompt = function(message?: string, defaultValue?: string) {
    console.log('[AdBlocker] Blocked prompt:', message);
    return null;
  };

  // 12. Block WebSocket connections to ad servers
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function(url: string | URL, protocols?: string | string[]) {
    const urlString = url.toString();
    if (isAdUrl(urlString)) {
      console.log('[AdBlocker] Blocked WebSocket:', urlString);
      throw new Error('Blocked by AdBlocker');
    }
    return new OriginalWebSocket(url, protocols);
  } as any;
  window.WebSocket.prototype = OriginalWebSocket.prototype;

  // 13. MutationObserver to remove dynamically added ad elements
  const adObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          // Remove ad iframes
          if (node.tagName === 'IFRAME') {
            const src = node.getAttribute('src') || '';
            if (isAdUrl(src)) {
              console.log('[AdBlocker] Removed ad iframe:', src);
              node.remove();
              continue;
            }
          }
          
          // Remove ad scripts
          if (node.tagName === 'SCRIPT') {
            const src = node.getAttribute('src') || '';
            if (isAdUrl(src)) {
              console.log('[AdBlocker] Removed ad script:', src);
              node.remove();
              continue;
            }
          }
          
          // Remove elements with ad-related classes/ids
          const className = node.className?.toString?.() || '';
          const id = node.id || '';
          if (
            className.match(/\b(ad|ads|advert|banner|popup|popunder|sponsor)\b/i) ||
            id.match(/\b(ad|ads|advert|banner|popup|popunder|sponsor)\b/i)
          ) {
            console.log('[AdBlocker] Removed ad element:', node.tagName);
            node.remove();
          }
        }
      }
    }
  });
  
  adObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  console.log('[AdBlocker] Ultra-aggressive mode initialized');
};

// CSS injection to hide common ad elements
export const injectAdBlockerCSS = (): void => {
  const style = document.createElement('style');
  style.id = 'lovable-adblock-css';
  style.textContent = `
    /* Hide common ad containers */
    [class*="ad-container"],
    [class*="ad-wrapper"],
    [class*="ad-banner"],
    [class*="advertisement"],
    [class*="ad-unit"],
    [class*="ad-slot"],
    [class*="adsbygoogle"],
    [id*="google_ads"],
    [id*="ad-"],
    [id*="ad_"],
    [class*="popup-ad"],
    [class*="overlay-ad"],
    [class*="pop-overlay"],
    [class*="interstitial"],
    iframe[src*="ads"],
    iframe[src*="doubleclick"],
    iframe[src*="googlesyndication"],
    iframe[src*="popads"],
    iframe[src*="popcash"],
    div[data-ad],
    div[data-ads],
    ins.adsbygoogle,
    .adsbygoogle,
    #player-advertising,
    .video-ads,
    .ima-ad-container {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      max-height: 0 !important;
      max-width: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
      opacity: 0 !important;
      position: absolute !important;
      left: -9999px !important;
    }
    
    /* Block overlay clicks */
    .overlay-container,
    .click-overlay,
    [class*="click-capture"],
    [class*="click-interceptor"] {
      pointer-events: none !important;
    }
  `;
  
  if (!document.getElementById('lovable-adblock-css')) {
    document.head.appendChild(style);
  }
  console.log('[AdBlocker] CSS injection complete');
};

// Additional protection for the player container
export const setupIframeProtection = (): void => {
  let lastFocusTime = Date.now();
  
  window.addEventListener('blur', () => {
    const now = Date.now();
    if (now - lastFocusTime < 100) {
      setTimeout(() => window.focus(), 0);
    }
    lastFocusTime = now;
  });

  // Force focus periodically
  const checkNewWindows = setInterval(() => {
    window.focus();
  }, 2000);

  setTimeout(() => clearInterval(checkNewWindows), 60000);

  // Block touch events on overlays
  document.addEventListener('touchstart', (e) => {
    const target = e.target as HTMLElement;
    const classes = target.className?.toString?.() || '';
    const id = target.id || '';
    
    if (
      classes.match(/overlay|popup|ad|banner|interstitial/i) ||
      id.match(/overlay|popup|ad|banner|interstitial/i)
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { passive: false, capture: true });

  console.log('[AdBlocker] Iframe protection active');
};
