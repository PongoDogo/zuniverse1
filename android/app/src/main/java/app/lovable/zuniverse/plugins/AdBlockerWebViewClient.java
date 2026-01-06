package app.lovable.zuniverse.plugins;

import android.graphics.Bitmap;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceError;
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
 * Custom WebViewClient that intercepts and blocks ad-related requests
 * This runs at the native Android level, blocking ads before they load
 */
public class AdBlockerWebViewClient extends WebViewClient {
    
    private static final String TAG = "AdBlocker";
    private final AtomicInteger blockedCount = new AtomicInteger(0);
    
    // Comprehensive ad domain blocklist
    private static final Set<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        // Google Ads
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "googletagmanager.com", "google-analytics.com", "googletagservices.com",
        "adservice.google.com", "pagead2.googlesyndication.com",
        
        // Major popup/popunder networks
        "popads.net", "popcash.net", "propellerads.com", "propellerads.net",
        "exoclick.com", "trafficjunky.com", "trafficjunky.net", "adsterra.com",
        "clickadu.com", "hilltopads.net", "admaven.com", "richads.com",
        "trafficstars.com", "popunder.net", "adcash.com", "evadav.com",
        "juicyads.com", "realsrv.com", "tsyndicate.com", "onclickmax.com",
        "onclickalgo.com", "onclickpredictiv.com", "pushame.com", "pushnami.com",
        "ero-advertising.com", "exosrv.com", "exdynsrv.com", "a-ads.com",
        
        // Video ad networks
        "adnxs.com", "advertising.com", "bidswitch.net", "pubmatic.com",
        "openx.net", "rubiconproject.com", "casalemedia.com", "criteo.com",
        "criteo.net", "amazon-adsystem.com", "media.net", "outbrain.com",
        "taboola.com", "mgid.com", "revcontent.com", "zergnet.com",
        "spotxchange.com", "spotx.tv", "teads.tv", "moatads.com",
        "aniview.com", "springserve.com", "connatix.com", "vidoomy.com",
        
        // Tracking & analytics
        "scorecardresearch.com", "quantserve.com", "segment.io",
        "amplitude.com", "mixpanel.com", "hotjar.com", "fullstory.com",
        "mouseflow.com", "luckyorange.com", "crazyegg.com", "inspectlet.com",
        
        // Streaming site ad networks
        "streamtape.com", "dood.la", "dood.so", "dood.pm", "dood.to", "dood.watch",
        "mixdrop.co", "mixdrop.to", "upstream.to", "voe.sx", "filemoon.sx",
        "rabbitstream.net", "rapid-cloud.co", "vidcloud.pro", "dokicloud.one",
        "mcloud.to", "fembed.com", "fcdn.stream", "embedsito.com",
        
        // URL shorteners (often used for ad redirects)
        "bit.ly", "tinyurl.com", "shorte.st", "adf.ly", "bc.vc",
        "adfly.co", "sh.st", "ouo.io", "ouo.press", "exe.io",
        
        // Notification/push spam
        "pushame.com", "pushnami.com", "pushworldtoday.com", "notifyadspush.com",
        
        // Cryptocurrency/gambling ads
        "coinzilla.com", "a-ads.com", "bitmedia.io", "cointraffic.io"
    ));
    
    // URL path patterns that indicate ads
    private static final String[] AD_PATH_PATTERNS = {
        "/ads/", "/ad/", "/adserve", "/advert", "/banner/", "/popup/",
        "/popunder/", "/tracking/", "/analytics/", "/pixel/", "/pagead/",
        "/adsense/", "/sponsor/", "/click/", "/track/", "/redirect/",
        "/out/", "/go/", "/aff/", "/vast/", "/vpaid/", "/preroll/",
        "/midroll/", "/postroll/", "/overlay/", "openrtb", "/prebid/",
        "/rtb/", "/bid/", "adsystem", "adserver", "/beacon/"
    };
    
    // Suspicious TLDs commonly used for ads
    private static final String[] BLOCKED_TLDS = {
        ".xyz", ".top", ".club", ".live", ".click", ".buzz", ".bet",
        ".casino", ".poker", ".win", ".loan", ".work", ".gq", ".ml",
        ".ga", ".cf", ".tk", ".icu", ".monster", ".quest"
    };
    
    // Keywords that suggest ad content
    private static final Pattern AD_KEYWORD_PATTERN = Pattern.compile(
        ".*(doubleclick|googlesyndication|googleadservices|adservice|" +
        "popads|popcash|propeller|exoclick|trafficjunky|adsterra|" +
        "clickadu|hilltopads|admaven|richads|trafficstars|popunder|" +
        "adcash|evadav|juicyads|realsrv|tsyndicate|onclickmax|" +
        "adnxs|pubmatic|openx|rubiconproject|criteo|outbrain|taboola|" +
        "mgid|impression|clicktrack|adtrack|adclick|adsrv|adlog).*",
        Pattern.CASE_INSENSITIVE
    );
    
    /**
     * Empty response for blocked requests
     */
    private WebResourceResponse createEmptyResponse() {
        return new WebResourceResponse(
            "text/plain",
            "UTF-8",
            new ByteArrayInputStream("".getBytes())
        );
    }
    
    /**
     * Empty HTML response for blocked iframes/documents
     */
    private WebResourceResponse createEmptyHtmlResponse() {
        String html = "<!DOCTYPE html><html><head></head><body></body></html>";
        return new WebResourceResponse(
            "text/html",
            "UTF-8",
            new ByteArrayInputStream(html.getBytes())
        );
    }
    
    /**
     * Transparent pixel for blocked images
     */
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
        return new WebResourceResponse(
            "image/gif",
            null,
            new ByteArrayInputStream(pixel)
        );
    }
    
    /**
     * Check if URL should be blocked
     */
    public boolean shouldBlockUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        
        String lowerUrl = url.toLowerCase();
        
        // Check against ad domains
        for (String domain : AD_DOMAINS) {
            if (lowerUrl.contains(domain)) {
                Log.d(TAG, "Blocked (domain): " + url);
                blockedCount.incrementAndGet();
                return true;
            }
        }
        
        // Check URL path patterns
        for (String pattern : AD_PATH_PATTERNS) {
            if (lowerUrl.contains(pattern)) {
                Log.d(TAG, "Blocked (path): " + url);
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
                    Log.d(TAG, "Blocked (TLD): " + url);
                    blockedCount.incrementAndGet();
                    return true;
                }
            }
        } catch (Exception e) {
            // Ignore malformed URLs
        }
        
        // Check keyword pattern
        if (AD_KEYWORD_PATTERN.matcher(lowerUrl).matches()) {
            Log.d(TAG, "Blocked (keyword): " + url);
            blockedCount.incrementAndGet();
            return true;
        }
        
        return false;
    }
    
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        
        if (shouldBlockUrl(url)) {
            // Return appropriate empty response based on Accept header
            String accept = request.getRequestHeaders().get("Accept");
            if (accept != null) {
                if (accept.contains("text/html")) {
                    return createEmptyHtmlResponse();
                } else if (accept.contains("image")) {
                    return createTransparentPixelResponse();
                }
            }
            return createEmptyResponse();
        }
        
        return super.shouldInterceptRequest(view, request);
    }
    
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        
        // Block navigation to ad URLs
        if (shouldBlockUrl(url)) {
            Log.d(TAG, "Blocked navigation: " + url);
            return true;
        }
        
        // Block new window attempts (popup ads)
        if (!request.isForMainFrame()) {
            if (shouldBlockUrl(url)) {
                Log.d(TAG, "Blocked popup: " + url);
                return true;
            }
        }
        
        return false;
    }
    
    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
        // Inject CSS to hide common ad elements
        injectAdBlockingCSS(view);
    }
    
    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        // Re-inject CSS and run JS cleanup
        injectAdBlockingCSS(view);
        injectAdBlockingJS(view);
    }
    
    /**
     * Inject CSS to hide ad elements
     */
    private void injectAdBlockingCSS(WebView view) {
        String css = 
            "[class*='ad-'], [class*='ads-'], [class*='advert'], " +
            "[class*='banner'], [class*='popup'], [class*='modal'], " +
            "[class*='overlay']:not([class*='video']):not([class*='player']), " +
            "[id*='ad-'], [id*='ads-'], [id*='advert'], [id*='banner'], " +
            "[id*='popup'], [id*='modal'], " +
            "iframe[src*='ads'], iframe[src*='ad.'], iframe[src*='doubleclick'], " +
            "iframe[src*='googlesyndication'], iframe[src*='popads'], " +
            "a[href*='//ad.'], a[href*='/ads/'], a[href*='click.'], " +
            "div[data-ad], div[data-ads], ins.adsbygoogle, " +
            ".adsbygoogle, .ad-container, .ad-wrapper, .ad-banner, " +
            ".sponsored, .advertisement, #overlay:not(.video-overlay) { " +
            "  display: none !important; " +
            "  visibility: hidden !important; " +
            "  opacity: 0 !important; " +
            "  pointer-events: none !important; " +
            "  height: 0 !important; " +
            "  width: 0 !important; " +
            "  position: absolute !important; " +
            "  left: -9999px !important; " +
            "}";
        
        String js = "var style = document.createElement('style');" +
            "style.type = 'text/css';" +
            "style.appendChild(document.createTextNode('" + css.replace("'", "\\'") + "'));" +
            "document.head.appendChild(style);";
        
        view.evaluateJavascript(js, null);
    }
    
    /**
     * Inject JS to block ad-related functions
     */
    private void injectAdBlockingJS(WebView view) {
        String js = 
            "(function() {" +
            "  // Block window.open" +
            "  window.open = function() { return null; };" +
            "  " +
            "  // Block popups on click" +
            "  document.addEventListener('click', function(e) {" +
            "    var t = e.target;" +
            "    if (t.tagName === 'A') {" +
            "      var href = t.href || '';" +
            "      if (t.target === '_blank' || href.includes('://') && !href.includes(location.hostname)) {" +
            "        e.preventDefault();" +
            "        e.stopPropagation();" +
            "      }" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Remove ad iframes" +
            "  setInterval(function() {" +
            "    document.querySelectorAll('iframe').forEach(function(f) {" +
            "      var src = f.src || '';" +
            "      if (src.includes('ad') || src.includes('pop') || src.includes('banner')) {" +
            "        f.remove();" +
            "      }" +
            "    });" +
            "  }, 1000);" +
            "})();";
        
        view.evaluateJavascript(js, null);
    }
    
    /**
     * Get the count of blocked ads
     */
    public int getBlockedCount() {
        return blockedCount.get();
    }
    
    /**
     * Reset the blocked counter
     */
    public void resetBlockedCount() {
        blockedCount.set(0);
    }
}
