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

  console.log('[AdBlocker] Initialized successfully');
};

// Note: Iframe sandbox protection disabled - streaming players require full permissions
export const setupIframeProtection = (): void => {
  console.log('[AdBlocker] Iframe protection skipped for player compatibility');
};
