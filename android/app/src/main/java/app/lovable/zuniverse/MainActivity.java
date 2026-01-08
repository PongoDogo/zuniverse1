package app.lovable.zuniverse;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

import java.io.ByteArrayInputStream;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * CLEAN AD BLOCKER - PLAY STORE COMPLIANT
 * 
 * This version uses ONLY standard Android APIs:
 * - Custom WebViewClient with shouldInterceptRequest for ad blocking
 * - Custom WebChromeClient to block popups
 * - Activity startActivity() overrides to block external launches
 * 
 * NO reflection, NO instrumentation hooks, NO system hacks.
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_ADBLOCKER";
    private static int blockedCount = 0;
    private Handler handler = new Handler(Looper.getMainLooper());
    private WebView webViewRef;
    
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
    
    // Known ad/tracker domains (comprehensive list)
    private static final Set<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        // Google Ads
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "googletagmanager.com", "google-analytics.com", "googletagservices.com",
        "adservice.google.com", "pagead2.googlesyndication.com",
        
        // Facebook/Meta
        "facebook.com", "facebook.net", "connect.facebook.net", "fbcdn.net",
        
        // Twitter/X ads
        "ads.twitter.com", "ads-twitter.com", "analytics.twitter.com",
        
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
        
        // Additional known ad domains
        "serving-sys.com", "2mdn.net", "yieldmanager.com", "brightcove.net",
        "adtechus.com", "atdmt.com", "eyeviewads.com", "mediaplex.com",
        "smaato.net", "inmobi.com", "flurry.com", "appsflyer.com",
        "adjust.com", "branch.io", "kochava.com", "singular.net"
    ));
    
    // URL path patterns indicating ads
    private static final String[] AD_PATH_PATTERNS = {
        "/ads/", "/ad/", "/adserve", "/advert", "/banner/", "/popup/",
        "/popunder/", "/tracking/", "/analytics/", "/pixel/", "/pagead/",
        "/adsense/", "/sponsor/", "/click?", "/track?", "/redirect?",
        "/out/", "/go/", "/aff/", "/vast/", "/vpaid/", "/prebid/",
        "/openx/", "/adx/", "/dmp/", "/beacon/"
    };
    
    // Regex for comprehensive ad detection
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
        log("=== CLEAN AD BLOCKER STARTING ===");
        
        // Initialize whitelist mode to ON by default
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (!prefs.contains(PREF_WHITELIST_ONLY)) {
            prefs.edit().putBoolean(PREF_WHITELIST_ONLY, true).apply();
        }
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        setupAdBlocker();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Re-apply ad blocker in case Bridge resets it
        handler.postDelayed(this::setupAdBlocker, 300);
    }
    
    private void setupAdBlocker() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) {
                handler.postDelayed(this::setupAdBlocker, 500);
                return;
            }
            
            WebView webView = bridge.getWebView();
            if (webView == null) {
                handler.postDelayed(this::setupAdBlocker, 500);
                return;
            }
            
            webViewRef = webView;
            
            // Set custom WebViewClient with ad blocking
            webView.setWebViewClient(new AdBlockingWebViewClient());
            
            // Set custom WebChromeClient to block popups
            webView.setWebChromeClient(new AdBlockingWebChromeClient());
            
            // Block downloads (often triggered by ads)
            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                log("BLOCKED DOWNLOAD: " + truncate(url, 60));
                blockedCount++;
            });
            
            // Configure WebView settings
            configureWebViewSettings(webView);
            
            // Disable long-press context menu
            webView.setOnLongClickListener(v -> true);
            
            // Start JavaScript injection
            startJSInjection(webView);
            
            log("=== CLEAN AD BLOCKER ACTIVE ===");
            
        } catch (Exception e) {
            log("Setup error: " + e.getMessage());
        }
    }
    
    private void configureWebViewSettings(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // Disable features abused by ads
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setGeolocationEnabled(false);
        
        // Disable third-party cookies
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        
        // Enable safe browsing
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }
    }
    
    // ==================== AD BLOCKING WEBVIEWCLIENT ====================
    
    private class AdBlockingWebViewClient extends WebViewClient {
        
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleNavigation(request.getUrl().toString(), request.isForMainFrame());
        }
        
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleNavigation(url, true);
        }
        
        /**
         * Handle URL navigation.
         * Return TRUE = blocked (we handled it)
         * Return FALSE = allow WebView to load
         */
        private boolean handleNavigation(String url, boolean isMainFrame) {
            if (url == null || url.isEmpty()) {
                return true;
            }
            
            String lowerUrl = url.toLowerCase();
            
            // Allow internal schemes
            if (lowerUrl.startsWith("javascript:") || 
                lowerUrl.startsWith("data:") || 
                lowerUrl.startsWith("blob:") ||
                lowerUrl.startsWith("about:")) {
                return false;
            }
            
            // BLOCK all non-HTTP schemes (intent://, market://, tel://, etc.)
            if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                log("BLOCKED SCHEME: " + truncate(url, 80));
                blockedCount++;
                return true;
            }
            
            // Block known ad URLs
            if (isAdUrl(url)) {
                log("BLOCKED AD NAV: " + truncate(url, 60));
                blockedCount++;
                return true;
            }
            
            // Check whitelist mode
            if (isWhitelistModeEnabled() && !isWhitelisted(url)) {
                log("BLOCKED NON-WHITELIST: " + truncate(url, 60));
                blockedCount++;
                return true;
            }
            
            // Allow whitelisted URLs
            return false;
        }
        
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            
            // Block known ad URLs at resource level
            if (isAdUrl(url)) {
                log("BLOCKED AD RESOURCE: " + truncate(url, 60));
                blockedCount++;
                return emptyResponse();
            }
            
            // Block non-whitelisted HTML content (iframes)
            String accept = request.getRequestHeaders().get("Accept");
            if (accept != null && accept.contains("text/html")) {
                if (isWhitelistModeEnabled() && !isWhitelisted(url)) {
                    log("BLOCKED IFRAME: " + truncate(url, 60));
                    blockedCount++;
                    return emptyHtmlResponse();
                }
            }
            
            // Block scripts from ad domains
            if ((url.endsWith(".js") || url.contains(".js?")) && isAdDomain(url)) {
                log("BLOCKED AD SCRIPT: " + truncate(url, 60));
                blockedCount++;
                return emptyResponse();
            }
            
            return null; // Allow request
        }
        
        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            injectAdBlockerJS(view);
        }
        
        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            // Ignore errors from blocked resources
            if (failingUrl != null && isAdUrl(failingUrl)) {
                return;
            }
            super.onReceivedError(view, errorCode, description, failingUrl);
        }
    }
    
    // ==================== AD BLOCKING WEBCHROMECLIENT ====================
    
    private class AdBlockingWebChromeClient extends WebChromeClient {
        
        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, 
                                      boolean isUserGesture, android.os.Message resultMsg) {
            log("BLOCKED POPUP WINDOW");
            blockedCount++;
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
    
    // ==================== ACTIVITY-LEVEL BLOCKING ====================
    // Override startActivity to prevent external browser launches
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            log("BLOCKED startActivity: " + getIntentInfo(intent));
            return;
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            log("BLOCKED startActivity: " + getIntentInfo(intent));
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            log("BLOCKED startActivityForResult: " + getIntentInfo(intent));
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            log("BLOCKED startActivityForResult: " + getIntentInfo(intent));
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        
        // Block ACTION_VIEW to external browser
        if (Intent.ACTION_VIEW.equals(action)) {
            Uri data = intent.getData();
            if (data != null) {
                String url = data.toString();
                // Allow whitelisted URLs
                if (isWhitelisted(url)) {
                    return false;
                }
                blockedCount++;
                return true;
            }
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
        
        // Check regex pattern
        if (AD_PATTERN.matcher(lowerUrl).matches()) {
            return true;
        }
        
        // Check path patterns
        for (String pattern : AD_PATH_PATTERNS) {
            if (lowerUrl.contains(pattern)) {
                return true;
            }
        }
        
        // Check domain
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
            "if(window.__ZUNIVERSE_CLEAN) return;" +
            "window.__ZUNIVERSE_CLEAN = true;" +
            
            "var W = ['" + whitelistJS.toString() + "'];" +
            
            "function isAllowed(url) {" +
            "  if(!url) return true;" +
            "  try {" +
            "    var h = new URL(url, location.href).hostname.toLowerCase();" +
            "    return W.some(function(d) { return h === d || h.endsWith('.' + d); });" +
            "  } catch(e) { return false; }" +
            "}" +
            
            // Block window.open
            "window.open = function() { console.log('[ZU] Blocked window.open'); return null; };" +
            
            // Block location changes
            "var origAssign = location.assign.bind(location);" +
            "var origReplace = location.replace.bind(location);" +
            "location.assign = function(url) { if(isAllowed(url)) origAssign(url); };" +
            "location.replace = function(url) { if(isAllowed(url)) origReplace(url); };" +
            
            // Block clicks on non-whitelisted links
            "document.addEventListener('click', function(e) {" +
            "  var t = e.target;" +
            "  while(t && t.tagName !== 'A') t = t.parentElement;" +
            "  if(t && t.href && !isAllowed(t.href)) {" +
            "    e.preventDefault();" +
            "    e.stopPropagation();" +
            "    e.stopImmediatePropagation();" +
            "    return false;" +
            "  }" +
            "}, true);" +
            
            // Block touch events
            "['touchstart','touchend'].forEach(function(evt) {" +
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
            "  // Remove hidden overlay ads" +
            "  document.querySelectorAll('div,iframe').forEach(function(el) {" +
            "    try {" +
            "      var s = getComputedStyle(el);" +
            "      if((s.position === 'fixed' || s.position === 'absolute') && " +
            "         parseInt(s.zIndex) > 9000 && parseFloat(s.opacity) < 0.15) {" +
            "        el.remove();" +
            "      }" +
            "    } catch(e) {}" +
            "  });" +
            "  // Remove non-whitelisted iframes" +
            "  document.querySelectorAll('iframe').forEach(function(f) {" +
            "    if(f.src && !isAllowed(f.src)) f.remove();" +
            "  });" +
            "  // Force links to open in same window" +
            "  document.querySelectorAll('a[target=\"_blank\"]').forEach(function(a) {" +
            "    a.target = '_self';" +
            "  });" +
            "}, 1000);" +
            
            "console.log('[ZUniverse] Clean Ad Blocker active');" +
        "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    private void startJSInjection(WebView webView) {
        Runnable injector = new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        webView.evaluateJavascript("window.__ZUNIVERSE_CLEAN = false;", null);
                        injectAdBlockerJS(webView);
                    }
                } catch (Exception e) {
                    // Ignore
                }
                handler.postDelayed(this, 3000);
            }
        };
        handler.postDelayed(injector, 3000);
    }
    
    private void log(String msg) {
        Log.d(TAG, "★ " + msg);
    }
    
    public static int getBlockedAdsCount() {
        return blockedCount;
    }
}
