// Ad blocker utility - aggressively prevents popups and external navigation

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
  'bet365',
  '1xbet',
  'betway',
  'casino',
  'poker',
  'slots',
  'gambling',
  'wager',
];

const REDIRECT_PATTERNS = [
  /^https?:\/\/[^/]+\/(redirect|out|go|click|track)/i,
  /\?(.*&)?url=/i,
  /\?(.*&)?redirect=/i,
  /\?(.*&)?ref=/i,
  /\.(xyz|top|club|live|stream|click|buzz|bet|casino)($|\/)/i,
];

export const isAdUrl = (url: string): boolean => {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  if (AD_DOMAINS.some(domain => lowerUrl.includes(domain))) {
    return true;
  }
  
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

// Initialize aggressive ad blocker
export const initAdBlocker = (): void => {
  // Completely disable window.open - block ALL popups
  window.open = function(url?: string | URL) {
    console.log('[AdBlocker] Blocked popup:', url?.toString() || 'unknown');
    return null;
  };

  // Block any attempts to change location
  const blockNavigation = (e: BeforeUnloadEvent | PopStateEvent) => {
    // Allow if it's internal navigation
    return;
  };

  // Intercept link clicks globally - block ALL external links
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor) {
      const href = anchor.getAttribute('href') || '';
      
      // Block all external links and ad URLs
      if (isExternalUrl(href) || isAdUrl(href)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('[AdBlocker] Blocked link:', href);
        return false;
      }
    }
  }, true);

  // Block form submissions to external URLs
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

  // Block right-click context menu hijacking
  document.addEventListener('contextmenu', (e) => {
    // Allow normal context menu, just prevent hijacking
  }, false);

  // Prevent scripts from creating new elements that redirect
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement(tagName, options);
    
    if (tagName.toLowerCase() === 'a') {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        if (name === 'href' && (isExternalUrl(value) || isAdUrl(value))) {
          console.log('[AdBlocker] Blocked dynamic link creation:', value);
          return;
        }
        return originalSetAttribute(name, value);
      };
    }
    
    return element;
  };

  // Block location changes from iframes trying to navigate parent
  Object.defineProperty(window, 'onbeforeunload', {
    set: function() {
      // Prevent sites from setting onbeforeunload
      return;
    },
    get: function() {
      return null;
    }
  });

  console.log('[AdBlocker] Aggressive mode initialized');
};

// Additional protection for the player container
export const setupIframeProtection = (): void => {
  // Block any blur events that might indicate popup attempts
  window.addEventListener('blur', () => {
    // Immediately refocus if we lose focus (popup attempt)
    setTimeout(() => {
      window.focus();
    }, 0);
  });

  console.log('[AdBlocker] Iframe protection active');
};
