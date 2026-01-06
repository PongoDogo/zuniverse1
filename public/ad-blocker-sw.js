// Service Worker Ad Blocker - Blocks ads at the network level
// This can block ads even from within iframes!

const AD_DOMAINS = [
  // Major ad networks
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'googletagmanager.com', 'google-analytics.com', 'googletagservices.com',
  'adservice.google', 'pagead2.googlesyndication.com',
  
  // Popup/popunder networks
  'popads.net', 'popcash.net', 'propellerads.com', 'propellerads.net',
  'exoclick.com', 'trafficjunky.com', 'trafficjunky.net',
  'adsterra.com', 'adsterratools.com',
  
  // Video ad networks
  'adnxs.com', 'advertising.com', 'bidswitch.net',
  'pubmatic.com', 'openx.net', 'rubiconproject.com',
  'casalemedia.com', 'criteo.com', 'criteo.net',
  'amazon-adsystem.com', 'media.net',
  
  // Tracking & analytics
  'facebook.com/tr', 'facebook.net/tr', 'scorecardresearch.com',
  'quantserve.com', 'segment.io', 'amplitude.com',
  
  // Content recommendation ads
  'taboola.com', 'outbrain.com', 'mgid.com', 'revcontent.com',
  'zergnet.com', 'newsmax.com/widget',
  
  // Gambling/adult/crypto spam
  'bet365.com', '1xbet.com', 'betway.com', '888casino.com',
  'williamhill.com', 'bwin.com', 'pokerstars.com',
  
  // Malware/scam domains
  'click.', 'track.', 'tracker.', 'trk.', 'pixel.',
  
  // Streaming site specific ad networks
  'streamtape.com/ad', 'dooood.com/ad', 'mixdrop.co/ad',
  'vidcloud.co/ad', 'rabbitstream.net/ad',
  'mcloud.to/ad', 'dokicloud.one/ad',
  
  // Common ad/tracker paths
  '/ads/', '/ad.js', '/ad/', 'ads.js',
  '/pagead/', '/adsense/', '/adserver/',
  '/tracking/', '/analytics/', '/pixel/',
  '/popup/', '/popunder/',
];

const AD_URL_PATTERNS = [
  // Ad-related URL patterns
  /\/ads?\//i,
  /\/adserve/i,
  /\/advert/i,
  /\/banner/i,
  /\/popup/i,
  /\/popunder/i,
  /\/(click|track|pixel)\./i,
  /googleads/i,
  /pagead/i,
  /adsense/i,
  /doubleclick/i,
  
  // Suspicious TLDs often used by ad/scam sites
  /\.(xyz|top|club|live|stream|click|buzz|bet|casino|poker|win|loan|work|gq|ml|ga|cf|tk)$/i,
  
  // Common redirect patterns
  /\?(.*&)?(redirect|ref|aff|click|track)=/i,
  /\/(redirect|out|go|click|track|ad|sponsor)\//i,
];

const BLOCKED_RESOURCE_TYPES = [
  'beacon',
  'ping',
];

// Check if URL is an ad
function isAdUrl(url) {
  const lowerUrl = url.toLowerCase();
  
  // Check against ad domains
  for (const domain of AD_DOMAINS) {
    if (lowerUrl.includes(domain)) {
      return true;
    }
  }
  
  // Check against URL patterns
  for (const pattern of AD_URL_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  return false;
}

// Handle fetch events
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const destination = event.request.destination;
  
  // Block known ad resource types
  if (BLOCKED_RESOURCE_TYPES.includes(destination)) {
    console.log('[SW AdBlocker] Blocked beacon/ping:', url);
    event.respondWith(new Response('', { status: 200 }));
    return;
  }
  
  // Check if it's an ad URL
  if (isAdUrl(url)) {
    console.log('[SW AdBlocker] Blocked ad request:', url);
    
    // Return appropriate empty response based on resource type
    if (destination === 'script') {
      event.respondWith(new Response('', { 
        status: 200,
        headers: { 'Content-Type': 'application/javascript' }
      }));
    } else if (destination === 'image') {
      // Return transparent 1x1 pixel
      const pixel = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      event.respondWith(new Response(
        Uint8Array.from(atob(pixel), c => c.charCodeAt(0)),
        { 
          status: 200,
          headers: { 'Content-Type': 'image/gif' }
        }
      ));
    } else if (destination === 'style') {
      event.respondWith(new Response('', { 
        status: 200,
        headers: { 'Content-Type': 'text/css' }
      }));
    } else if (destination === 'iframe' || destination === 'document') {
      event.respondWith(new Response(
        '<!DOCTYPE html><html><body></body></html>', 
        { 
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      ));
    } else {
      event.respondWith(new Response('', { status: 200 }));
    }
    return;
  }
  
  // For non-ad requests, just pass through
  // Don't call event.respondWith to let normal fetch happen
});

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW AdBlocker] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW AdBlocker] Activated!');
  event.waitUntil(clients.claim());
});
