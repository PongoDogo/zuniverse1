// NUCLEAR Service Worker Ad Blocker
// Intercepts network requests before they reach the page

const AD_DOMAINS = [
  // Major ad networks
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'googletagmanager.com', 'google-analytics.com', 'googletagservices.com',
  'adservice.google', 'pagead2.googlesyndication.com', 'adsense',
  
  // Popup/popunder networks
  'popads.net', 'popcash.net', 'propellerads.com', 'propellerads.net',
  'exoclick.com', 'trafficjunky.com', 'trafficjunky.net', 'adsterra.com',
  'clickadu.com', 'hilltopads.net', 'admaven.com', 'richads.com',
  'trafficstars.com', 'popunder.net', 'adcash.com', 'evadav.com',
  
  // Video ad networks
  'adnxs.com', 'advertising.com', 'bidswitch.net', 'pubmatic.com',
  'openx.net', 'rubiconproject.com', 'casalemedia.com', 'criteo.com',
  'criteo.net', 'amazon-adsystem.com', 'media.net', 'outbrain.com',
  'taboola.com', 'mgid.com', 'revcontent.com', 'zergnet.com',
  
  // Tracking & analytics
  'facebook.com/tr', 'facebook.net/tr', 'scorecardresearch.com',
  'quantserve.com', 'segment.io', 'amplitude.com', 'mixpanel.com',
  'hotjar.com', 'fullstory.com', 'mouseflow.com', 'luckyorange.com',
  
  // Streaming site ad networks
  'streamtape.com/ad', 'dooood.com/ad', 'mixdrop.co/ad',
  'rabbitstream.net/ad', 'mcloud.to/ad', 'dokicloud.one/ad',
  'filemoon.sx/ad', 'voe.sx/ad', 'upstream.to/ad',
  
  // Scam/spam
  'bet365', '1xbet', 'betway', 'casino', 'poker', 'slots', 'gambling',
  'dating', 'adult', 'xxx', 'porn', 'sex', 'crypto', 'bitcoin', 'forex',
];

const AD_PATH_PATTERNS = [
  '/ads/', '/ad/', '/adserve', '/advert', '/banner/', '/popup/', '/popunder/',
  '/tracking/', '/analytics/', '/pixel/', '/pagead/', '/adsense/', '/sponsor/',
  '/click/', '/track/', '/redirect/', '/out/', '/go/', '/aff/',
];

const BLOCKED_EXTENSIONS = [
  '.xyz', '.top', '.club', '.live', '.click', '.buzz', '.bet',
  '.casino', '.poker', '.win', '.loan', '.work', '.gq', '.ml', '.ga', '.cf', '.tk'
];

function isAdUrl(url) {
  const lowerUrl = url.toLowerCase();
  
  // Check ad domains
  for (const domain of AD_DOMAINS) {
    if (lowerUrl.includes(domain)) {
      return true;
    }
  }
  
  // Check ad paths
  for (const path of AD_PATH_PATTERNS) {
    if (lowerUrl.includes(path)) {
      return true;
    }
  }
  
  // Check suspicious extensions
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    for (const ext of BLOCKED_EXTENSIONS) {
      if (hostname.endsWith(ext)) {
        return true;
      }
    }
  } catch (e) {}
  
  // Check URL patterns
  if (/\?(.*&)?(redirect|ref|aff|click|track|url|goto)=/i.test(url)) {
    return true;
  }
  
  return false;
}

// Handle fetch events - intercept ALL network requests
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const destination = event.request.destination;
  
  // Always block beacons and pings
  if (destination === 'beacon' || destination === 'ping') {
    console.log('[SW] Blocked beacon/ping:', url);
    event.respondWith(new Response('', { status: 200 }));
    return;
  }
  
  // Check if URL matches ad patterns
  if (isAdUrl(url)) {
    console.log('[SW] ⛔ Blocked:', url);
    
    // Return appropriate empty response based on resource type
    switch (destination) {
      case 'script':
        event.respondWith(new Response('// blocked', { 
          status: 200,
          headers: { 'Content-Type': 'application/javascript' }
        }));
        break;
        
      case 'image':
        // Return transparent 1x1 GIF
        const pixel = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        event.respondWith(new Response(
          Uint8Array.from(atob(pixel), c => c.charCodeAt(0)),
          { status: 200, headers: { 'Content-Type': 'image/gif' }}
        ));
        break;
        
      case 'style':
        event.respondWith(new Response('/* blocked */', { 
          status: 200,
          headers: { 'Content-Type': 'text/css' }
        }));
        break;
        
      case 'iframe':
      case 'document':
        event.respondWith(new Response(
          '<!DOCTYPE html><html><head></head><body></body></html>', 
          { status: 200, headers: { 'Content-Type': 'text/html' }}
        ));
        break;
        
      default:
        event.respondWith(new Response('', { status: 200 }));
    }
    return;
  }
  
  // Non-ad requests pass through normally
});

// Install immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ad blocker...');
  self.skipWaiting();
});

// Take control immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ Ad blocker activated!');
  event.waitUntil(clients.claim());
});
