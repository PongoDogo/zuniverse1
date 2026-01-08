package app.lovable.zuniverse;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JsResult;
import android.webkit.JsPromptResult;
import android.util.Log;
import android.view.View;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

import java.io.ByteArrayInputStream;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * AGGRESSIVE AD BLOCKER - ZERO EXTERNAL BROWSER
 * 
 * This version ensures NO external browser can ever open:
 * - Custom WebViewClient that NEVER calls super for navigation
 * - WebChromeClient that captures window.open URLs and loads in same WebView
 * - All startActivity variants blocked for browser intents
 * - Continuous re-application of WebViewClient to prevent Capacitor override
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_ADBLOCK";
    private static int blockedCount = 0;
    private Handler handler = new Handler(Looper.getMainLooper());
    private WebView webViewRef;
    private boolean adBlockerSetup = false;
    
    // Preference keys
    public static final String PREFS_NAME = "ZuniversePrefs";
    public static final String PREF_WHITELIST_ONLY = "whitelist_only_mode";
    
    // ==================== WHITELIST CONFIGURATION ====================
    private static final Set<String> WHITELIST = new HashSet<>(Arrays.asList(
        // App domains
        "lovableproject.com", "lovable.dev", "localhost", "127.0.0.1", "10.0.2.2",
        
        // Streaming sources - VidSrc family
        "vidsrc.wtf", "vidsrc.cc", "vidsrc.me", "vidsrc.pro", "vidsrc.to", 
        "vidsrc.xyz", "vidsrc.net", "vidsrc.icu", "vidsrc.in", "vidsrc.nl",
        "vidsrc.pm", "vidsrc.stream", "vidsrc-api.com", "v2.vidsrc.me",
        "vidsrc-embed.ru", "vixsrc.to",
        
        // Embed sources
        "embed.su", "embedsu.com",
        "2embed.org", "2embed.cc", "2embed.skin", "2embed.to",
        "multiembed.mov", "multiembed.org",
        "superembed.stream",
        
        // Player sources
        "vidlink.pro",
        "vidbinge.dev", "vidbinge.com",
        "smashy.stream", "player.smashy.stream",
        "autoembed.cc", "autoembed.co", "player.autoembed.cc",
        "rivestream.live", "rivestream.xyz",
        "catflix.su",
        "nontongo.win",
        "nunflix-embed.vercel.app", "nunflix.org",
        "moviesapi.club",
        "gomovies.sx",
        "flixhq.to",
        "fmovies.to",
        "vidrock.net",
        
        // Video CDNs
        "googlevideo.com", "googleusercontent.com",
        "gstatic.com", "ggpht.com", "youtube.com", "ytimg.com",
        "akamaihd.net", "akamaized.net", "akamaicdn.net",
        "cloudfront.net", "cloudflare.com", "cdnjs.cloudflare.com",
        "fastly.net", "fastlylb.net",
        "jsdelivr.net", "unpkg.com",
        "bunnycdn.com", "b-cdn.net",
        "cdn77.org", "stackpathdns.com",
        "jwpcdn.com", "jwplayer.com", "jwpsrv.com",
        "vidcdn.co", "vidcdn.pro",
        "mixdrop.co", "mixdrop.to", "mixdrop.sx", "mixdrop.club",
        "streamtape.com", "strcloud.in", "strtape.cloud",
        "dood.watch", "dood.la", "dood.so", "dood.pm", "dood.to", "dood.ws", "dood.cx",
        "filemoon.sx", "filemoon.to", "filemoon.in",
        "upstream.to",
        "rabbitstream.net",
        "rapid-cloud.co", "rapid-cloud.ru",
        "vidplay.online", "vidplay.site", "vidplay.lol",
        "dokicloud.one",
        "megacloud.tv",
        "streamwish.to", "streamwish.com",
        "mp4upload.com",
        "voe.sx",
        
        // TMDB
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    // ==================== AD BLOCKING - EASYLIST STYLE ====================
    
    private static final Set<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        // Google Ads
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "googletagmanager.com", "google-analytics.com", "googletagservices.com",
        "adservice.google.com", "pagead2.googlesyndication.com",
        
        // Facebook/Meta
        "facebook.com", "facebook.net", "connect.facebook.net", "fbcdn.net",
        
        // Major popup/popunder networks
        "popads.net", "popcash.net", "propellerads.com", "propellerads.net",
        "exoclick.com", "trafficjunky.com", "trafficjunky.net", "adsterra.com",
        "clickadu.com", "hilltopads.net", "hilltopads.com", "admaven.com",
        "richads.com", "trafficstars.com", "popunder.net", "adcash.com",
        "evadav.com", "juicyads.com", "realsrv.com", "tsyndicate.com",
        "onclickmax.com", "onclickalgo.com", "onclickpredictiv.com",
        "pushame.com", "monetag.com", "a-ads.com", "coinzilla.com", "bitmedia.io",
        
        // Video ad networks
        "adnxs.com", "advertising.com", "bidswitch.net", "pubmatic.com",
        "openx.net", "rubiconproject.com", "casalemedia.com", "criteo.com",
        "criteo.net", "amazon-adsystem.com", "media.net", "outbrain.com",
        "taboola.com", "mgid.com", "revcontent.com", "zergnet.com",
        "spotxchange.com", "spotx.tv", "teads.tv", "moatads.com", "adsrvr.org",
        "adroll.com", "quantcast.com",
        
        // Tracking/Analytics
        "scorecardresearch.com", "quantserve.com", "segment.io", "segment.com",
        "amplitude.com", "mixpanel.com", "hotjar.com", "fullstory.com",
        "mouseflow.com", "luckyorange.com", "crazyegg.com", "clicktale.com",
        
        // URL shorteners / redirectors
        "bit.ly", "tinyurl.com", "shorte.st", "adf.ly", "bc.vc", "sh.st",
        "ouo.io", "ouo.press", "shrinkearn.com", "shrinkme.io",
        
        // Additional ad domains
        "serving-sys.com", "2mdn.net", "yieldmanager.com", "brightcove.net",
        "adtechus.com", "atdmt.com", "eyeviewads.com", "mediaplex.com",
        "smaato.net", "inmobi.com", "flurry.com", "appsflyer.com",
        "adjust.com", "branch.io", "kochava.com", "singular.net"
    ));
    
    private static final String[] AD_PATH_PATTERNS = {
        "/ads/", "/ad/", "/adserve", "/advert", "/banner/", "/popup/",
        "/popunder/", "/tracking/", "/analytics/", "/pixel/", "/pagead/",
        "/adsense/", "/sponsor/", "/click?", "/track?", "/redirect?",
        "/out/", "/go/", "/aff/", "/vast/", "/vpaid/", "/prebid/",
        "/openx/", "/adx/", "/dmp/", "/beacon/"
    };
    
    private static final Pattern AD_PATTERN = Pattern.compile(
        ".*(doubleclick|googlesyndication|googleadservices|google-analytics|" +
        "facebook\\.net|analytics|tracker|adservice|adsserver|" +
        "popads|popunder|popcash|propellerads|exoclick|trafficjunky|" +
        "clickadu|admaven|adsterra|monetag|hilltopads|" +
        "mgid|taboola|outbrain|realsrv|onclickmax|pushame|" +
        "juicyads|adnxs|pubmatic|criteo|" +
        "bidswitch|openx|rubiconproject|amazon-adsystem|" +
        "ad\\.doubleclick|ads\\.google|pagead|adserver|" +
        "/ads?[/\\?]|/ad[/\\?]|/adx[/\\?]|/adv[/\\?]|" +
        "banner|popup|popunder).*",
        Pattern.CASE_INSENSITIVE
    );
    
    // ==================== LIFECYCLE ====================
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        log("=== AGGRESSIVE AD BLOCKER STARTING ===");
        
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (!prefs.contains(PREF_WHITELIST_ONLY)) {
            prefs.edit().putBoolean(PREF_WHITELIST_ONLY, true).apply();
        }
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        applyAdBlockerWithRetry();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Re-apply aggressively - Capacitor might reset it
        handler.postDelayed(this::applyAdBlockerWithRetry, 100);
        handler.postDelayed(this::applyAdBlockerWithRetry, 500);
        handler.postDelayed(this::applyAdBlockerWithRetry, 1000);
        handler.postDelayed(this::applyAdBlockerWithRetry, 2000);
    }
    
    private void applyAdBlockerWithRetry() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) {
                handler.postDelayed(this::applyAdBlockerWithRetry, 300);
                return;
            }
            
            WebView webView = bridge.getWebView();
            if (webView == null) {
                handler.postDelayed(this::applyAdBlockerWithRetry, 300);
                return;
            }
            
            webViewRef = webView;
            
            // CRITICAL: Set our custom clients - ALWAYS replace, never trust existing
            webView.setWebViewClient(new ZeroExternalWebViewClient());
            webView.setWebChromeClient(new ZeroExternalWebChromeClient(webView));
            
            // Block ALL downloads
            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                log("BLOCKED DOWNLOAD: " + truncate(url, 60));
                blockedCount++;
            });
            
            configureWebViewSettings(webView);
            
            // Disable context menu
            webView.setOnLongClickListener(v -> true);
            
            // Start JS injection
            if (!adBlockerSetup) {
                startJSInjection(webView);
                adBlockerSetup = true;
            }
            
            log("=== AD BLOCKER APPLIED ===");
            
        } catch (Exception e) {
            log("Setup error: " + e.getMessage());
        }
    }
    
    private void configureWebViewSettings(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // CRITICAL: Disable all popup/new window features
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setGeolocationEnabled(false);
        
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }
    }
    
    // ==================== ZERO EXTERNAL BROWSER WEBVIEWCLIENT ====================
    
    private class ZeroExternalWebViewClient extends WebViewClient {
        
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            return handleUrlLoading(view, url);
        }
        
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleUrlLoading(view, url);
        }
        
        /**
         * CRITICAL: Return TRUE = we handled it (blocked or loaded ourselves)
         * NEVER return false for external URLs - that would let system handle it
         */
        private boolean handleUrlLoading(WebView view, String url) {
            if (url == null || url.isEmpty()) {
                return true; // Block empty
            }
            
            String lowerUrl = url.toLowerCase();
            
            // Allow internal schemes
            if (lowerUrl.startsWith("javascript:") || 
                lowerUrl.startsWith("data:") || 
                lowerUrl.startsWith("blob:") ||
                lowerUrl.startsWith("about:")) {
                return false; // Let WebView handle these
            }
            
            // BLOCK ALL non-HTTP schemes - intent://, market://, tel://, mailto://, etc.
            if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                log("BLOCKED: Non-HTTP scheme: " + truncate(url, 80));
                blockedCount++;
                return true; // BLOCKED - we handled it
            }
            
            // Block ad URLs
            if (isAdUrl(url)) {
                log("BLOCKED: Ad URL: " + truncate(url, 60));
                blockedCount++;
                return true; // BLOCKED
            }
            
            // Check whitelist mode
            if (isWhitelistModeEnabled()) {
                if (isWhitelisted(url)) {
                    // Whitelisted - load in same WebView
                    log("ALLOWED: " + truncate(url, 60));
                    view.loadUrl(url);
                    return true; // We loaded it ourselves
                } else {
                    log("BLOCKED: Not whitelisted: " + truncate(url, 60));
                    blockedCount++;
                    return true; // BLOCKED
                }
            }
            
            // If whitelist mode is off, check if it's an ad, otherwise allow
            if (!isAdUrl(url)) {
                view.loadUrl(url);
            }
            return true; // We handled it
        }
        
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            
            // Block ad resources
            if (isAdUrl(url)) {
                log("BLOCKED: Ad resource: " + truncate(url, 60));
                blockedCount++;
                return emptyResponse();
            }
            
            // Block non-whitelisted iframes
            String accept = request.getRequestHeaders().get("Accept");
            if (accept != null && accept.contains("text/html")) {
                if (isWhitelistModeEnabled() && !isWhitelisted(url)) {
                    log("BLOCKED: Non-whitelist iframe: " + truncate(url, 60));
                    blockedCount++;
                    return emptyHtmlResponse();
                }
            }
            
            // Block scripts from ad domains
            if ((url.endsWith(".js") || url.contains(".js?")) && isAdDomain(url)) {
                log("BLOCKED: Ad script: " + truncate(url, 60));
                blockedCount++;
                return emptyResponse();
            }
            
            return null; // Allow
        }
        
        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            injectAdBlockerJS(view);
        }
        
        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            if (failingUrl != null && isAdUrl(failingUrl)) {
                return; // Ignore errors from blocked ads
            }
            super.onReceivedError(view, errorCode, description, failingUrl);
        }
    }
    
    // ==================== ZERO EXTERNAL BROWSER WEBCHROMECLIENT ====================
    
    private class ZeroExternalWebChromeClient extends WebChromeClient {
        
        private final WebView parentWebView;
        
        public ZeroExternalWebChromeClient(WebView webView) {
            this.parentWebView = webView;
        }
        
        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            log("BLOCKED: Popup window attempt");
            blockedCount++;
            
            // Try to capture the URL from the hit result
            WebView.HitTestResult result = view.getHitTestResult();
            if (result != null && result.getExtra() != null) {
                String url = result.getExtra();
                log("Popup URL was: " + truncate(url, 60));
                
                // If whitelisted, load in same webview
                if (isWhitelisted(url) && !isAdUrl(url)) {
                    log("Loading popup URL in same WebView: " + truncate(url, 60));
                    parentWebView.loadUrl(url);
                }
            }
            
            // NEVER create new window - always return false
            return false;
        }
        
        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            if (isAdUrl(url)) {
                result.cancel();
                return true;
            }
            return super.onJsAlert(view, url, message, result);
        }
        
        @Override
        public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
            if (isAdUrl(url)) {
                result.cancel();
                return true;
            }
            return super.onJsConfirm(view, url, message, result);
        }
        
        @Override
        public boolean onJsPrompt(WebView view, String url, String message, 
                                 String defaultValue, JsPromptResult result) {
            if (isAdUrl(url)) {
                result.cancel();
                return true;
            }
            return super.onJsPrompt(view, url, message, defaultValue, result);
        }
        
        @Override
        public boolean onJsBeforeUnload(WebView view, String url, String message, JsResult result) {
            result.confirm();
            return true;
        }
    }
    
    // ==================== BLOCK ALL EXTERNAL ACTIVITY LAUNCHES ====================
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            log("BLOCKED: startActivity " + getIntentInfo(intent));
            return; // Swallow - do nothing
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            log("BLOCKED: startActivity with options " + getIntentInfo(intent));
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            log("BLOCKED: startActivityForResult " + getIntentInfo(intent));
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            log("BLOCKED: startActivityForResult with options " + getIntentInfo(intent));
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        
        // Block ALL ACTION_VIEW intents (browser opens)
        if (Intent.ACTION_VIEW.equals(action)) {
            Uri data = intent.getData();
            if (data != null) {
                String url = data.toString();
                String scheme = data.getScheme();
                
                // Block all non-whitelisted URLs
                if (!isWhitelisted(url)) {
                    log("BLOCKED: ACTION_VIEW to " + truncate(url, 60));
                    blockedCount++;
                    return true;
                }
                
                // Block intent:// and market:// schemes
                if (scheme != null && (scheme.equals("intent") || scheme.equals("market"))) {
                    log("BLOCKED: Special scheme " + scheme);
                    blockedCount++;
                    return true;
                }
            }
            // Block ACTION_VIEW without data too
            blockedCount++;
            return true;
        }
        
        // Block implicit browser intents
        if (intent.getCategories() != null && 
            intent.getCategories().contains(Intent.CATEGORY_BROWSABLE)) {
            log("BLOCKED: CATEGORY_BROWSABLE intent");
            blockedCount++;
            return true;
        }
        
        return false;
    }
    
    private String getIntentInfo(Intent intent) {
        if (intent == null) return "null";
        Uri data = intent.getData();
        return intent.getAction() + (data != null ? " -> " + truncate(data.toString(), 60) : "");
    }
    
    // ==================== HELPER METHODS ====================
    
    private boolean isWhitelistModeEnabled() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        return prefs.getBoolean(PREF_WHITELIST_ONLY, true);
    }
    
    public void setWhitelistMode(boolean enabled) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putBoolean(PREF_WHITELIST_ONLY, enabled).apply();
        log("Whitelist mode: " + (enabled ? "ON" : "OFF"));
    }
    
    private boolean isWhitelisted(String url) {
        if (url == null) return false;
        
        try {
            URL parsed = new URL(url);
            String host = parsed.getHost();
            if (host == null) return false;
            
            host = host.toLowerCase();
            
            for (String domain : WHITELIST) {
                if (host.equals(domain) || host.endsWith("." + domain)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Invalid URL
        }
        
        return false;
    }
    
    private boolean isAdUrl(String url) {
        if (url == null) return false;
        
        String lowerUrl = url.toLowerCase();
        
        if (AD_PATTERN.matcher(lowerUrl).matches()) {
            return true;
        }
        
        for (String pattern : AD_PATH_PATTERNS) {
            if (lowerUrl.contains(pattern)) {
                return true;
            }
        }
        
        return isAdDomain(url);
    }
    
    private boolean isAdDomain(String url) {
        if (url == null) return false;
        
        try {
            URL parsed = new URL(url);
            String host = parsed.getHost();
            if (host == null) return false;
            
            host = host.toLowerCase();
            
            for (String adDomain : AD_DOMAINS) {
                if (host.equals(adDomain) || host.endsWith("." + adDomain)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Invalid URL
        }
        
        return false;
    }
    
    private WebResourceResponse emptyResponse() {
        return new WebResourceResponse(
            "text/plain", 
            "UTF-8", 
            new ByteArrayInputStream(new byte[0])
        );
    }
    
    private WebResourceResponse emptyHtmlResponse() {
        String empty = "<!DOCTYPE html><html><head></head><body></body></html>";
        return new WebResourceResponse(
            "text/html", 
            "UTF-8", 
            new ByteArrayInputStream(empty.getBytes())
        );
    }
    
    private String truncate(String s, int maxLen) {
        if (s == null) return "";
        return s.length() > maxLen ? s.substring(0, maxLen) + "..." : s;
    }
    
    // ==================== JAVASCRIPT INJECTION ====================
    
    private void injectAdBlockerJS(WebView webView) {
        StringBuilder whitelistJS = new StringBuilder();
        for (String domain : WHITELIST) {
            if (whitelistJS.length() > 0) whitelistJS.append("','");
            whitelistJS.append(domain);
        }
        
        String js = "(function() {" +
            "if(window.__ZU_ADBLOCK_V2) return;" +
            "window.__ZU_ADBLOCK_V2 = true;" +
            
            "var W = ['" + whitelistJS.toString() + "'];" +
            
            "function isAllowed(url) {" +
            "  if(!url) return true;" +
            "  try {" +
            "    var h = new URL(url, location.href).hostname.toLowerCase();" +
            "    return W.some(function(d) { return h === d || h.endsWith('.' + d); });" +
            "  } catch(e) { return false; }" +
            "}" +
            
            // COMPLETELY disable window.open
            "window.open = function() { console.log('[ZU] BLOCKED window.open'); return null; };" +
            "Object.defineProperty(window, 'open', { value: function() { return null; }, writable: false, configurable: false });" +
            
            // Block location changes
            "var _assign = location.assign.bind(location);" +
            "var _replace = location.replace.bind(location);" +
            "location.assign = function(url) { if(isAllowed(url)) _assign(url); else console.log('[ZU] BLOCKED location.assign: ' + url); };" +
            "location.replace = function(url) { if(isAllowed(url)) _replace(url); else console.log('[ZU] BLOCKED location.replace: ' + url); };" +
            
            // Block setting location.href
            "try {" +
            "  var _href = location.href;" +
            "  Object.defineProperty(location, 'href', {" +
            "    get: function() { return _href; }," +
            "    set: function(url) { if(isAllowed(url)) { _href = url; _assign(url); } else { console.log('[ZU] BLOCKED location.href: ' + url); } }" +
            "  });" +
            "} catch(e) {}" +
            
            // Block clicks on non-whitelisted links
            "document.addEventListener('click', function(e) {" +
            "  var t = e.target;" +
            "  while(t && t.tagName !== 'A') t = t.parentElement;" +
            "  if(t && t.href) {" +
            "    if(!isAllowed(t.href)) {" +
            "      console.log('[ZU] BLOCKED click: ' + t.href);" +
            "      e.preventDefault();" +
            "      e.stopPropagation();" +
            "      e.stopImmediatePropagation();" +
            "      return false;" +
            "    }" +
            "    // Force same window" +
            "    if(t.target === '_blank') t.target = '_self';" +
            "  }" +
            "}, true);" +
            
            // Block touch events
            "['touchstart','touchend','mousedown','mouseup'].forEach(function(evt) {" +
            "  document.addEventListener(evt, function(e) {" +
            "    var t = e.target;" +
            "    while(t && t.tagName !== 'A') t = t.parentElement;" +
            "    if(t && t.href && !isAllowed(t.href)) {" +
            "      e.preventDefault();" +
            "      e.stopImmediatePropagation();" +
            "    }" +
            "  }, true);" +
            "});" +
            
            // Periodic cleanup
            "setInterval(function() {" +
            "  // Remove overlay ads (invisible divs with high z-index)" +
            "  document.querySelectorAll('div,iframe,ins').forEach(function(el) {" +
            "    try {" +
            "      var s = getComputedStyle(el);" +
            "      if((s.position === 'fixed' || s.position === 'absolute') && parseInt(s.zIndex) > 9000) {" +
            "        if(parseFloat(s.opacity) < 0.15 || el.offsetWidth === 0 || el.offsetHeight === 0) {" +
            "          el.remove();" +
            "        }" +
            "      }" +
            "    } catch(e) {}" +
            "  });" +
            "  // Remove non-whitelisted iframes" +
            "  document.querySelectorAll('iframe').forEach(function(f) {" +
            "    if(f.src && !isAllowed(f.src)) { f.remove(); console.log('[ZU] Removed iframe: ' + f.src); }" +
            "  });" +
            "  // Force all links to open in same window" +
            "  document.querySelectorAll('a[target=\"_blank\"]').forEach(function(a) { a.target = '_self'; });" +
            "}, 500);" +
            
            "console.log('[ZUniverse] Ad Blocker V2 active - ZERO external browser');" +
        "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    private void startJSInjection(WebView webView) {
        Runnable injector = new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        webView.evaluateJavascript("window.__ZU_ADBLOCK_V2 = false;", null);
                        injectAdBlockerJS(webView);
                    }
                } catch (Exception e) {
                    // Ignore
                }
                handler.postDelayed(this, 2000);
            }
        };
        handler.postDelayed(injector, 1500);
    }
    
    private void log(String msg) {
        Log.i(TAG, "★ " + msg);
    }
    
    public static int getBlockedAdsCount() {
        return blockedCount;
    }
}
