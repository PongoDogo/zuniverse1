// Ad blocker utility - prevents external links from opening browser
// and blocks common ad domains

const AD_DOMAINS = [
  'doubleclick',
  'googlesyndication',
  'googleadservices',
  'adservice',
  'adsense',
  'adclick',
  'popads',
  'popcash',
  'propellerads',
  'exoclick',
  'trafficjunky',
  'adsterra',
  'adnxs',
  'advertising',
  'ads.',
  '/ads/',
  'banner',
  'clicktrack',
  'tracker',
  'pixel',
  'analytics',
  'facebook.com/tr',
  'scorecardresearch',
  'quantserve',
  'amazon-adsystem',
  'bidswitch',
  'pubmatic',
  'openx',
  'rubiconproject',
  'casalemedia',
  'criteo',
  'taboola',
  'outbrain',
  'mgid',
  'revcontent',
];

// Common redirect patterns used by streaming sites
const REDIRECT_PATTERNS = [
  /^https?:\/\/[^/]+\/(redirect|out|go|click|track)/i,
  /\?(.*&)?url=/i,
  /\?(.*&)?redirect=/i,
  /\?(.*&)?ref=/i,
  /\.(xyz|top|club|live|stream|click|buzz)($|\/)/i,
];

export const isAdUrl = (url: string): boolean => {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Check against ad domains
  if (AD_DOMAINS.some(domain => lowerUrl.includes(domain))) {
    return true;
  }
  
  // Check against redirect patterns
  if (REDIRECT_PATTERNS.some(pattern => pattern.test(url))) {
    return true;
  }
  
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

// Initialize the ad blocker - call this once on app startup
export const initAdBlocker = (): void => {
  // Intercept window.open
  const originalOpen = window.open;
  window.open = function(url?: string | URL, target?: string, features?: string) {
    const urlString = url?.toString() || '';
    
    if (isAdUrl(urlString) || (isExternalUrl(urlString) && target === '_blank')) {
      console.log('[AdBlocker] Blocked popup:', urlString);
      return null;
    }
    
    return originalOpen.call(window, url, target, features);
  };

  // Intercept link clicks globally
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor) {
      const href = anchor.getAttribute('href') || '';
      
      if (isAdUrl(href) || (isExternalUrl(href) && anchor.target === '_blank')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[AdBlocker] Blocked link click:', href);
        return false;
      }
    }
  }, true);

  // Block beforeunload for ad redirects
  let lastUserInteraction = 0;
  
  document.addEventListener('click', () => {
    lastUserInteraction = Date.now();
  }, true);

  document.addEventListener('touchstart', () => {
    lastUserInteraction = Date.now();
  }, true);

  // Intercept location changes
  const originalAssign = window.location.assign.bind(window.location);
  const originalReplace = window.location.replace.bind(window.location);

  (window.location as any).assign = function(url: string) {
    if (isAdUrl(url)) {
      console.log('[AdBlocker] Blocked location.assign:', url);
      return;
    }
    return originalAssign(url);
  };

  (window.location as any).replace = function(url: string) {
    if (isAdUrl(url)) {
      console.log('[AdBlocker] Blocked location.replace:', url);
      return;
    }
    return originalReplace(url);
  };

  console.log('[AdBlocker] Initialized successfully');
};

// Block iframe from navigating parent
export const setupIframeProtection = (): void => {
  const initObserver = () => {
    if (!document.body) {
      // Wait for body to be available
      requestAnimationFrame(initObserver);
      return;
    }
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLIFrameElement) {
            // Allow same-origin scripts but prevent top navigation
            if (!node.hasAttribute('sandbox')) {
              node.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[AdBlocker] Iframe protection active');
  };
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
};
