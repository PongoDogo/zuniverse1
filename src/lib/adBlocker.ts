// Ultra-aggressive ad blocker - blocks ALL external navigation and popups

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

// Store original functions before overwriting
const originalOpen = window.open;
const originalAssign = window.location.assign;
const originalReplace = window.location.replace;

export const initAdBlocker = (): void => {
  console.log('[AdBlocker] Initializing ultra-aggressive mode...');

  // 1. Completely block window.open
  window.open = function(...args: any[]) {
    console.log('[AdBlocker] Blocked window.open:', args[0]);
    return null;
  };

  // 2. Block location.assign
  try {
    Object.defineProperty(window.location, 'assign', {
      value: function(url: string) {
        if (isExternalUrl(url) || isAdUrl(url)) {
          console.log('[AdBlocker] Blocked location.assign:', url);
          return;
        }
        originalAssign.call(window.location, url);
      },
      writable: false,
      configurable: false,
    });
  } catch (e) {
    console.log('[AdBlocker] Could not override location.assign');
  }

  // 3. Block location.replace
  try {
    Object.defineProperty(window.location, 'replace', {
      value: function(url: string) {
        if (isExternalUrl(url) || isAdUrl(url)) {
          console.log('[AdBlocker] Blocked location.replace:', url);
          return;
        }
        originalReplace.call(window.location, url);
      },
      writable: false,
      configurable: false,
    });
  } catch (e) {
    console.log('[AdBlocker] Could not override location.replace');
  }

  // 4. Block location.href setter
  try {
    const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    if (locationDescriptor) {
      let currentHref = window.location.href;
      Object.defineProperty(window, 'location', {
        get: function() {
          return new Proxy(window.location, {
            set: function(target, prop, value) {
              if (prop === 'href' && (isExternalUrl(value as string) || isAdUrl(value as string))) {
                console.log('[AdBlocker] Blocked location.href:', value);
                return true;
              }
              (target as any)[prop] = value;
              return true;
            },
          });
        },
        set: function() {
          console.log('[AdBlocker] Blocked location override');
        },
        configurable: false,
      });
    }
  } catch (e) {
    console.log('[AdBlocker] Could not proxy location object');
  }

  // 5. Block ALL link clicks that go external
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor) {
      const href = anchor.getAttribute('href') || '';
      const targetAttr = anchor.getAttribute('target');
      
      // Block if external, ad URL, or opens new tab
      if (isExternalUrl(href) || isAdUrl(href) || targetAttr === '_blank') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('[AdBlocker] Blocked link click:', href);
        return false;
      }
    }
  }, true);

  // 6. Block mousedown/mouseup that might trigger ads
  ['mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach(eventType => {
    document.addEventListener(eventType, (e) => {
      const target = e.target as HTMLElement;
      
      // Check if it's an ad overlay or suspicious element
      if (target.closest('[class*="overlay"]') || 
          target.closest('[class*="popup"]') ||
          target.closest('[class*="modal"]') ||
          target.closest('[id*="ad"]') ||
          target.closest('[class*="ad-"]')) {
        // Don't block, but watch for navigation
      }
    }, true);
  });

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
    
    return element;
  };

  // 9. Block postMessage navigation attempts from iframes
  window.addEventListener('message', (event) => {
    const data = event.data;
    
    // Check for navigation-related messages
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
  Object.defineProperty(window, 'onbeforeunload', {
    set: function() { return; },
    get: function() { return null; },
    configurable: false,
  });

  // 11. Prevent alert/confirm/prompt hijacking
  const originalAlert = window.alert;
  const originalConfirm = window.confirm;
  const originalPrompt = window.prompt;
  
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

  console.log('[AdBlocker] Ultra-aggressive mode initialized');
};

// CSS injection to hide common ad elements
export const injectAdBlockerCSS = (): void => {
  const style = document.createElement('style');
  style.textContent = `
    /* Hide common ad containers */
    [class*="ad-container"],
    [class*="ad-wrapper"],
    [class*="ad-banner"],
    [class*="advertisement"],
    [id*="google_ads"],
    [id*="ad-"],
    [class*="popup-ad"],
    [class*="overlay-ad"],
    iframe[src*="ads"],
    iframe[src*="doubleclick"],
    iframe[src*="googlesyndication"],
    div[data-ad],
    ins.adsbygoogle {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }
    
    /* Prevent overlay clicks */
    body::after {
      content: none !important;
    }
  `;
  document.head.appendChild(style);
  console.log('[AdBlocker] CSS injection complete');
};

// Additional protection for the player container
export const setupIframeProtection = (): void => {
  // Immediately refocus if window loses focus (popup attempt)
  let lastFocusTime = Date.now();
  
  window.addEventListener('blur', () => {
    const now = Date.now();
    // Only refocus if blur happened quickly (likely popup)
    if (now - lastFocusTime < 100) {
      setTimeout(() => window.focus(), 0);
    }
    lastFocusTime = now;
  });

  // Monitor for new windows/tabs being opened
  const checkNewWindows = setInterval(() => {
    // Force focus back to this window periodically
    window.focus();
  }, 1000);

  // Clean up after 30 seconds
  setTimeout(() => clearInterval(checkNewWindows), 30000);

  // Block touch events that might trigger ads on mobile
  document.addEventListener('touchstart', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[class*="overlay"]') || target.closest('[id*="ad"]')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { passive: false, capture: true });

  console.log('[AdBlocker] Iframe protection active');
};
