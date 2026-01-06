package app.lovable.zuniverse.plugins;

import android.graphics.Bitmap;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.util.Log;

import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

/**
 * Aggressive ad-blocking WebViewClient for streaming content
 * Blocks ads at the native level before they can load
 */
public class AdBlockerWebViewClient extends WebViewClient {
    
    private static final String TAG = "AdBlocker";
    private final AtomicInteger blockedCount = new AtomicInteger(0);
    
    // MASSIVE ad domain blocklist - targeting streaming site ads specifically
    private static final Set<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        // Google Ads
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "googletagmanager.com", "google-analytics.com", "googletagservices.com",
        "adservice.google.com", "pagead2.googlesyndication.com", "adsense.google.com",
        "partner.googleadservices.com", "tpc.googlesyndication.com",
        
        // STREAMING SITE AD NETWORKS (CRITICAL)
        "betteradsolution.com", "bestadbid.com", "bidadx.com", "bidgear.com",
        "cdn77.org/pop", "cpmoffers.net", "disqus.com/embed/ads",
        "fastclick.net", "freeadserve.com", "getpush.click", "highperformanceformat.com",
        "landingtracking.com", "livejasmin.com", "livetraffic.com", "newstar.autos",
        "onclickgenius.com", "onclickmax.com", "onclickalgo.com", "onclickpredictiv.com",
        "popads.net", "popcash.net", "propellerads.com", "propellerclick.com",
        "puhtml.com", "pushnami.com", "pushsweet.com", "pushance.com",
        "revenuenetworkcpm.com", "trafcfy.com", "trafficholder.com",
        "vidazoo.com", "videmedia.tv", "vidoomy.com", "videoadex.com",
        "whos.amung.us", "youradexchange.com",
        
        // Major popup/popunder networks
        "exoclick.com", "exosrv.com", "exdynsrv.com", "trafficjunky.com", 
        "trafficjunky.net", "adsterra.com", "adsterra.net", "clickadu.com", 
        "clickadilla.com", "hilltopads.net", "hilltopads.com", "admaven.com", 
        "ad-maven.com", "richads.com", "trafficstars.com", "popunder.net",
        "adcash.com", "evadav.com", "juicyads.com", "realsrv.com", 
        "tsyndicate.com", "a-ads.com", "ero-advertising.com",
        
        // Video ad networks
        "adnxs.com", "advertising.com", "bidswitch.net", "pubmatic.com",
        "openx.net", "rubiconproject.com", "casalemedia.com", "criteo.com",
        "criteo.net", "amazon-adsystem.com", "media.net", "outbrain.com",
        "taboola.com", "mgid.com", "revcontent.com", "zergnet.com",
        "spotxchange.com", "spotx.tv", "teads.tv", "moatads.com",
        "aniview.com", "springserve.com", "connatix.com", "selectmedia.asia",
        "onetag.com", "sovrn.com", "rhythmone.com", "underdog.media",
        
        // Tracking & fingerprinting
        "scorecardresearch.com", "quantserve.com", "segment.io", "segment.com",
        "amplitude.com", "mixpanel.com", "hotjar.com", "fullstory.com",
        "mouseflow.com", "luckyorange.com", "crazyegg.com", "inspectlet.com",
        "fingerprintjs.com", "fp.measure.office.com", "clarity.ms",
        
        // Notification spam
        "pushame.com", "pushnami.com", "pushworldtoday.com", "notifyadspush.com",
        "push.world", "pushgroup.net", "subscribers.com", "wonderpush.com",
        "webpushr.com", "cleverpush.com", "pushassist.com", "pushcrew.com",
        
        // Crypto/gambling ads
        "coinzilla.com", "bitmedia.io", "cointraffic.io", "coinad.com",
        "gambling.com", "gamblingsites.org",
        
        // URL shorteners used for ad redirects
        "bit.ly", "tinyurl.com", "shorte.st", "adf.ly", "bc.vc",
        "adfly.co", "sh.st", "ouo.io", "ouo.press", "exe.io", "cutt.ly",
        "shorturl.at", "t.co/ads", "clck.ru", "goo.gl",
        
        // Malvertising/scam domains
        "clickfunnels.com", "clickbank.net", "getresponse.com",
        "leadpages.net", "systeme.io", "kartra.com"
    ));
    
    // URL path patterns that indicate ads
    private static final String[] AD_PATH_PATTERNS = {
        "/ads/", "/ad/", "/adserve", "/advert", "/banner/", "/popup/",
        "/popunder/", "/tracking/", "/analytics/", "/pixel/", "/pagead/",
        "/adsense/", "/sponsor/", "/click/", "/track/", "/redirect/",
        "/out/", "/go/", "/aff/", "/vast/", "/vpaid/", "/preroll/",
        "/midroll/", "/postroll/", "/overlay/", "openrtb", "/prebid/",
        "/rtb/", "/bid/", "adsystem", "adserver", "/beacon/", "/pix/",
        "/imp/", "/impression/", "/clicktrack", "/adtrack", "/adclick",
        "/adsrv", "/adlog", "doubleclick", "googlesyndication",
        "/popads", "/popcash", "/propeller", "/exoclick"
    };
    
    // Suspicious TLDs 
    private static final String[] BLOCKED_TLDS = {
        ".xyz", ".top", ".club", ".live", ".click", ".buzz", ".bet",
        ".casino", ".poker", ".win", ".loan", ".work", ".gq", ".ml",
        ".ga", ".cf", ".tk", ".icu", ".monster", ".quest", ".cam",
        ".stream", ".racing", ".download", ".trade", ".bid", ".date"
    };
    
    // Keywords pattern for ad detection
    private static final Pattern AD_KEYWORD_PATTERN = Pattern.compile(
        ".*(doubleclick|googlesyndication|googleadservices|adservice|" +
        "popads|popcash|propeller|exoclick|trafficjunky|adsterra|" +
        "clickadu|hilltopads|admaven|richads|trafficstars|popunder|" +
        "adcash|evadav|juicyads|realsrv|tsyndicate|onclickmax|" +
        "adnxs|pubmatic|openx|rubiconproject|criteo|outbrain|taboola|" +
        "mgid|impression|clicktrack|adtrack|adclick|adsrv|adlog|" +
        "banner|popup|overlay|preroll|midroll|sponsored|promo).*",
        Pattern.CASE_INSENSITIVE
    );
    
    // Patterns for iframe/script blocking
    private static final Pattern IFRAME_AD_PATTERN = Pattern.compile(
        ".*(ads|ad\\.|banner|popup|popunder|overlay|sponsor|promo|" +
        "doubleclick|googlesyndication|exoclick|propeller|trafficjunky).*",
        Pattern.CASE_INSENSITIVE
    );

    private WebResourceResponse createEmptyResponse() {
        return new WebResourceResponse("text/plain", "UTF-8", 
            new ByteArrayInputStream("".getBytes()));
    }
    
    private WebResourceResponse createEmptyHtmlResponse() {
        String html = "<!DOCTYPE html><html><head></head><body></body></html>";
        return new WebResourceResponse("text/html", "UTF-8", 
            new ByteArrayInputStream(html.getBytes()));
    }
    
    private WebResourceResponse createTransparentPixelResponse() {
        byte[] pixel = new byte[] {
            (byte) 0x47, (byte) 0x49, (byte) 0x46, (byte) 0x38, (byte) 0x39, (byte) 0x61,
            (byte) 0x01, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x80, (byte) 0x00,
            (byte) 0x00, (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0x00, (byte) 0x00,
            (byte) 0x00, (byte) 0x21, (byte) 0xf9, (byte) 0x04, (byte) 0x01, (byte) 0x00,
            (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x2c, (byte) 0x00, (byte) 0x00,
            (byte) 0x00, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x01, (byte) 0x00,
            (byte) 0x00, (byte) 0x02, (byte) 0x02, (byte) 0x44, (byte) 0x01, (byte) 0x00,
            (byte) 0x3b
        };
        return new WebResourceResponse("image/gif", null, 
            new ByteArrayInputStream(pixel));
    }
    
    private WebResourceResponse createEmptyJsResponse() {
        return new WebResourceResponse("application/javascript", "UTF-8", 
            new ByteArrayInputStream("//blocked".getBytes()));
    }
    
    /**
     * Core URL blocking logic
     */
    public boolean shouldBlockUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        
        String lowerUrl = url.toLowerCase();
        
        // Check against ad domains
        for (String domain : AD_DOMAINS) {
            if (lowerUrl.contains(domain)) {
                Log.d(TAG, "BLOCKED [domain]: " + url.substring(0, Math.min(100, url.length())));
                blockedCount.incrementAndGet();
                return true;
            }
        }
        
        // Check URL path patterns
        for (String pattern : AD_PATH_PATTERNS) {
            if (lowerUrl.contains(pattern)) {
                Log.d(TAG, "BLOCKED [path]: " + url.substring(0, Math.min(100, url.length())));
                blockedCount.incrementAndGet();
                return true;
            }
        }
        
        // Check suspicious TLDs
        try {
            java.net.URL urlObj = new java.net.URL(url);
            String host = urlObj.getHost().toLowerCase();
            for (String tld : BLOCKED_TLDS) {
                if (host.endsWith(tld)) {
                    Log.d(TAG, "BLOCKED [TLD]: " + url.substring(0, Math.min(100, url.length())));
                    blockedCount.incrementAndGet();
                    return true;
                }
            }
        } catch (Exception e) {
            // Ignore malformed URLs
        }
        
        // Check keyword pattern
        if (AD_KEYWORD_PATTERN.matcher(lowerUrl).matches()) {
            Log.d(TAG, "BLOCKED [keyword]: " + url.substring(0, Math.min(100, url.length())));
            blockedCount.incrementAndGet();
            return true;
        }
        
        return false;
    }
    
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        
        if (shouldBlockUrl(url)) {
            String accept = request.getRequestHeaders().get("Accept");
            if (accept != null) {
                if (accept.contains("text/html")) {
                    return createEmptyHtmlResponse();
                } else if (accept.contains("image")) {
                    return createTransparentPixelResponse();
                } else if (accept.contains("javascript") || accept.contains("script")) {
                    return createEmptyJsResponse();
                }
            }
            return createEmptyResponse();
        }
        
        return super.shouldInterceptRequest(view, request);
    }
    
    // Allowed streaming source domains - player embeds we want to work
    private static final Set<String> ALLOWED_DOMAINS = new HashSet<>(Arrays.asList(
        // Our app
        "lovableproject.com", "lovable.dev", "localhost",
        // Streaming sources (from the app)
        "vidsrc.cc", "vidsrc.me", "vidsrc.pro", "vidsrc.to", "vidsrc.xyz", "vidsrc.net",
        "embed.su", "embedsu.com",
        "vidlink.pro",
        "moviesapi.club",
        "vidbinge.dev", "vidbinge.com",
        "2embed.org", "2embed.cc", "2embed.skin",
        "multiembed.mov", "multiembed.org",
        "player.smashy.stream", "smashy.stream",
        "autoembed.cc", "autoembed.co",
        // TMDB for images
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    private boolean isAllowedDomain(String host) {
        if (host == null) return false;
        String lowerHost = host.toLowerCase();
        for (String allowed : ALLOWED_DOMAINS) {
            if (lowerHost.equals(allowed) || lowerHost.endsWith("." + allowed)) {
                return true;
            }
        }
        return false;
    }
    
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        String lowerUrl = url.toLowerCase();
        
        // Block navigation to ad URLs
        if (shouldBlockUrl(url)) {
            Log.d(TAG, "BLOCKED navigation: " + url.substring(0, Math.min(100, url.length())));
            return true;
        }
        
        try {
            java.net.URL urlObj = new java.net.URL(url);
            String newHost = urlObj.getHost();
            
            // If it's an allowed streaming domain, let it through
            if (isAllowedDomain(newHost)) {
                return false;
            }
            
            // Block ANY navigation to external sites not in our allowed list
            // This is the key fix - clicking on player won't open external ad sites
            Log.d(TAG, "BLOCKED external navigation: " + url.substring(0, Math.min(100, url.length())));
            blockedCount.incrementAndGet();
            return true;
            
        } catch (Exception e) {
            // If we can't parse the URL, block it to be safe
            Log.d(TAG, "BLOCKED unparseable URL: " + url.substring(0, Math.min(50, url.length())));
            return true;
        }
    }
    
    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
        injectAdBlockingCSS(view);
    }
    
    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        injectAdBlockingCSS(view);
        injectAdBlockingJS(view);
    }
    
    /**
     * Aggressive CSS to hide ad elements
     */
    private void injectAdBlockingCSS(WebView view) {
        String css = 
            // Common ad classes
            "[class*='ad-'], [class*='ads-'], [class*='advert'], [class*='advertisement'], " +
            "[class*='banner'], [class*='popup'], [class*='pop-up'], [class*='popunder'], " +
            "[class*='modal']:not([class*='video']):not([class*='player']), " +
            "[class*='overlay']:not([class*='video']):not([class*='player']):not([class*='controls']), " +
            "[class*='sponsor'], [class*='promo'], [class*='promoted'], " +
            // Common ad IDs
            "[id*='ad-'], [id*='ads-'], [id*='advert'], [id*='banner'], " +
            "[id*='popup'], [id*='pop-up'], [id*='modal']:not([id*='video']), " +
            "[id*='overlay']:not([id*='video']):not([id*='player']), " +
            // Specific ad elements
            "iframe[src*='ads'], iframe[src*='ad.'], iframe[src*='doubleclick'], " +
            "iframe[src*='googlesyndication'], iframe[src*='popads'], iframe[src*='exoclick'], " +
            "iframe[src*='propeller'], iframe[src*='trafficjunky'], " +
            // Links to ads
            "a[href*='//ad.'], a[href*='/ads/'], a[href*='click.'], a[href*='track.'], " +
            "a[href*='popads'], a[href*='exoclick'], a[href*='trafficjunky'], " +
            // Data attributes
            "div[data-ad], div[data-ads], div[data-advertisement], " +
            // Google ads
            "ins.adsbygoogle, .adsbygoogle, " +
            // Generic containers
            ".ad-container, .ad-wrapper, .ad-banner, .ad-slot, .ad-unit, " +
            ".advertisement, .sponsored, .sponsoredAd, #overlay:not(.video-overlay), " +
            // Notification prompts
            "[class*='notification-prompt'], [class*='push-prompt'], [class*='subscribe-prompt'], " +
            // Cookie/GDPR banners (optional)
            "[class*='cookie-banner'], [class*='consent-banner'] " +
            "{ " +
            "  display: none !important; " +
            "  visibility: hidden !important; " +
            "  opacity: 0 !important; " +
            "  pointer-events: none !important; " +
            "  height: 0 !important; " +
            "  max-height: 0 !important; " +
            "  width: 0 !important; " +
            "  max-width: 0 !important; " +
            "  overflow: hidden !important; " +
            "  position: absolute !important; " +
            "  left: -9999px !important; " +
            "  top: -9999px !important; " +
            "  z-index: -9999 !important; " +
            "}";
        
        String js = "(function() {" +
            "var style = document.createElement('style');" +
            "style.id = 'zuniverse-adblock-css';" +
            "style.type = 'text/css';" +
            "style.appendChild(document.createTextNode('" + css.replace("'", "\\'").replace("\n", " ") + "'));" +
            "if (!document.getElementById('zuniverse-adblock-css')) {" +
            "  document.head.appendChild(style);" +
            "}" +
            "})();";
        
        view.evaluateJavascript(js, null);
    }
    
    /**
     * Aggressive JS to neutralize ad scripts
     */
    private void injectAdBlockingJS(WebView view) {
        String js = 
            "(function() {" +
            "  if (window.__zuniverse_adblock) return;" +
            "  window.__zuniverse_adblock = true;" +
            "  " +
            "  // Block window.open completely" +
            "  window.open = function() { console.log('ZUniverse: Blocked popup'); return null; };" +
            "  " +
            "  // Block alert/confirm/prompt (often used for scam ads)" +
            "  window.alert = function() { return null; };" +
            "  window.confirm = function() { return false; };" +
            "  window.prompt = function() { return null; };" +
            "  " +
            "  // Block beforeunload (prevents \"are you sure you want to leave\" ads)" +
            "  window.onbeforeunload = null;" +
            "  window.addEventListener('beforeunload', function(e) { e.preventDefault(); e.returnValue = ''; }, true);" +
            "  " +
            "  // Block click hijacking" +
            "  document.addEventListener('click', function(e) {" +
            "    var t = e.target;" +
            "    while (t && t !== document.body) {" +
            "      if (t.tagName === 'A') {" +
            "        var href = t.href || '';" +
            "        var adPatterns = ['ad.', 'ads.', 'click.', 'track.', 'popads', 'exoclick', 'trafficjunky', 'doubleclick'];" +
            "        for (var i = 0; i < adPatterns.length; i++) {" +
            "          if (href.indexOf(adPatterns[i]) !== -1) {" +
            "            e.preventDefault();" +
            "            e.stopPropagation();" +
            "            console.log('ZUniverse: Blocked ad click');" +
            "            return false;" +
            "          }" +
            "        }" +
            "        if (t.target === '_blank') {" +
            "          e.preventDefault();" +
            "          e.stopPropagation();" +
            "          console.log('ZUniverse: Blocked _blank link');" +
            "          return false;" +
            "        }" +
            "      }" +
            "      t = t.parentElement;" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Remove ad iframes periodically" +
            "  function removeAdIframes() {" +
            "    document.querySelectorAll('iframe').forEach(function(f) {" +
            "      var src = (f.src || '').toLowerCase();" +
            "      var adPatterns = ['ad', 'pop', 'banner', 'click', 'track', 'sponsor', 'promo'];" +
            "      for (var i = 0; i < adPatterns.length; i++) {" +
            "        if (src.indexOf(adPatterns[i]) !== -1) {" +
            "          f.remove();" +
            "          console.log('ZUniverse: Removed ad iframe');" +
            "          break;" +
            "        }" +
            "      }" +
            "    });" +
            "  }" +
            "  setInterval(removeAdIframes, 2000);" +
            "  setTimeout(removeAdIframes, 500);" +
            "  " +
            "  // Block push notification requests" +
            "  if (window.Notification) {" +
            "    window.Notification.requestPermission = function() { return Promise.reject(); };" +
            "  }" +
            "  " +
            "  console.log('ZUniverse: Ad blocker active');" +
            "})();";
        
        view.evaluateJavascript(js, null);
    }
    
    public int getBlockedCount() {
        return blockedCount.get();
    }
    
    public void resetBlockedCount() {
        blockedCount.set(0);
    }
}
