package app.lovable.zuniverse;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.ContextWrapper;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
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
import java.lang.reflect.Field;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * NUCLEAR AD BLOCKER V7 - BRIDGE CONTEXT INJECTION
 * 
 * This version fixes the core problem: Capacitor's Bridge holds its own
 * context reference and calls getContext().startActivity() which bypasses
 * our Activity overrides.
 * 
 * THE FIX: Use reflection to inject our BlockingContext into the Bridge itself.
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_V7";
    private static int blockedCount = 0;
    private Handler handler = new Handler(Looper.getMainLooper());
    private WebView webViewRef;
    private boolean bridgePatched = false;
    
    // Preference key for whitelist-only mode
    public static final String PREFS_NAME = "ZuniversePrefs";
    public static final String PREF_WHITELIST_ONLY = "whitelist_only_mode";
    
    // ==================== WHITELIST CONFIGURATION ====================
    // Only these domains can load when whitelist mode is enabled (default: enabled)
    private static final Set<String> WHITELIST = new HashSet<>(Arrays.asList(
        // App domains - ESSENTIAL
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
        
        // Video CDNs - ESSENTIAL for playback
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
    
    // ==================== AD BLOCKING PATTERNS ====================
    // Comprehensive ad domain list (EasyList-style)
    private static final Set<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        // Google Ads
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "googletagmanager.com", "google-analytics.com", "googletagservices.com",
        "adservice.google.com", "pagead2.googlesyndication.com",
        
        // Major ad networks
        "facebook.com/tr", "facebook.net/tr", "connect.facebook.net",
        "ads.twitter.com", "ads-twitter.com", "analytics.twitter.com",
        
        // Popup/popunder networks - HIGH PRIORITY TO BLOCK
        "popads.net", "popcash.net", "propellerads.com", "propellerads.net",
        "exoclick.com", "trafficjunky.com", "trafficjunky.net", "adsterra.com",
        "clickadu.com", "hilltopads.net", "hilltopads.com", "admaven.com", "richads.com",
        "trafficstars.com", "popunder.net", "adcash.com", "evadav.com",
        "juicyads.com", "realsrv.com", "tsyndicate.com", "onclickmax.com",
        "onclickalgo.com", "onclickpredictiv.com", "pushame.com", "monetag.com",
        "a-ads.com", "coinzilla.com", "bitmedia.io",
        
        // Video ad networks
        "adnxs.com", "advertising.com", "bidswitch.net", "pubmatic.com",
        "openx.net", "rubiconproject.com", "casalemedia.com", "criteo.com",
        "criteo.net", "amazon-adsystem.com", "media.net", "outbrain.com",
        "taboola.com", "mgid.com", "revcontent.com", "zergnet.com",
        "spotxchange.com", "spotx.tv", "teads.tv", "moatads.com", "adsrvr.org",
        "adroll.com", "quantcast.com",
        
        // Tracking/Analytics to block
        "scorecardresearch.com", "quantserve.com", "segment.io", "segment.com",
        "amplitude.com", "mixpanel.com", "hotjar.com", "fullstory.com",
        "mouseflow.com", "luckyorange.com", "crazyegg.com", "clicktale.com",
        
        // Scam redirectors
        "bit.ly", "tinyurl.com", "shorte.st", "adf.ly", "bc.vc", "sh.st",
        "ouo.io", "ouo.press", "shrinkearn.com", "shrinkme.io"
    ));
    
    // URL path patterns that indicate ads
    private static final String[] AD_PATH_PATTERNS = {
        "/ads/", "/ad/", "/adserve", "/advert", "/banner/", "/popup/",
        "/popunder/", "/tracking/", "/analytics/", "/pixel/", "/pagead/",
        "/adsense/", "/sponsor/", "/click", "/track", "/redirect",
        "/out/", "/go/", "/aff/", "/vast/", "/vpaid/", "openx", "prebid"
    };
    
    // Regex pattern for ad detection
    private static final Pattern AD_PATTERN = Pattern.compile(
        ".*(doubleclick|googlesyndication|googleadservices|google-analytics|" +
        "facebook\\.com/tr|analytics|tracker|adservice|adsserver|" +
        "popads|popunder|popcash|propellerads|exoclick|trafficjunky|" +
        "clickadu|admaven|adsterra|monetag|hilltopads|" +
        "mgid|taboola|outbrain|realsrv|onclickmax|pushame|" +
        "juicyads|adnxs\\.com|pubmatic|criteo|" +
        "bidswitch|openx\\.net|rubiconproject|amazon-adsystem|" +
        "ad\\.doubleclick|ads\\.google|pagead|adserver|advert|" +
        "/ads/|/ad/|/adx/|/adv/|/banner|/popup|/popunder).*",
        Pattern.CASE_INSENSITIVE
    );
    
    // ==================== CONTEXT BLOCKING ====================
    
    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(new BlockingContext(newBase));
    }
    
    /**
     * Context wrapper that blocks ALL startActivity calls that would open external apps.
     * This is injected into the Bridge to intercept its startActivity calls.
     */
    private class BlockingContext extends ContextWrapper {
        BlockingContext(Context base) {
            super(base);
        }
        
        @Override
        public void startActivity(Intent intent) {
            if (shouldBlockIntent(intent)) {
                log("CONTEXT BLOCKED: " + getIntentInfo(intent));
                return;
            }
            super.startActivity(intent);
        }
        
        @Override
        public void startActivity(Intent intent, Bundle options) {
            if (shouldBlockIntent(intent)) {
                log("CONTEXT BLOCKED (options): " + getIntentInfo(intent));
                return;
            }
            super.startActivity(intent, options);
        }
        
        @Override
        public void startActivities(Intent[] intents) {
            log("CONTEXT BLOCKED batch startActivities: " + intents.length + " intents");
            blockedCount++;
        }
        
        @Override
        public void startActivities(Intent[] intents, Bundle options) {
            log("CONTEXT BLOCKED batch startActivities: " + intents.length + " intents");
            blockedCount++;
        }
        
        @Override
        public Context getApplicationContext() {
            Context appContext = super.getApplicationContext();
            // Wrap the application context too
            if (appContext != null && !(appContext instanceof BlockingContext)) {
                return new BlockingContext(appContext);
            }
            return appContext;
        }
    }
    
    private String getIntentInfo(Intent intent) {
        if (intent == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("action=").append(intent.getAction());
        if (intent.getData() != null) {
            sb.append(", data=").append(intent.getData().toString().substring(0, 
                Math.min(80, intent.getData().toString().length())));
        }
        return sb.toString();
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        
        // BLOCK ALL ACTION_VIEW - this is what opens browsers
        if (Intent.ACTION_VIEW.equals(action)) {
            blockedCount++;
            Uri data = intent.getData();
            if (data != null) {
                String url = data.toString();
                // Allow whitelisted domains even for ACTION_VIEW
                if (isWhitelisted(url)) {
                    return false; // Don't block whitelisted
                }
                log("BLOCKED ACTION_VIEW: " + url.substring(0, Math.min(80, url.length())));
            }
            return true;
        }
        
        // Block any intent that would launch an external app
        try {
            String myPackage = getPackageName();
            List<ResolveInfo> activities = getPackageManager()
                .queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
            
            for (ResolveInfo info : activities) {
                if (info.activityInfo != null && 
                    !myPackage.equals(info.activityInfo.packageName)) {
                    log("BLOCKED EXTERNAL APP: " + info.activityInfo.packageName);
                    blockedCount++;
                    return true;
                }
            }
        } catch (Exception e) {
            blockedCount++;
            return true;
        }
        
        return false;
    }
    
    // ==================== LIFECYCLE ====================
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        log("=== NUCLEAR V7 STARTING ===");
        
        // Initialize whitelist mode to ON by default
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (!prefs.contains(PREF_WHITELIST_ONLY)) {
            prefs.edit().putBoolean(PREF_WHITELIST_ONLY, true).apply();
        }
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        patchBridgeContext();
        setupAdBlocker();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Re-apply patches in case something reset them
        handler.postDelayed(() -> {
            patchBridgeContext();
            setupAdBlocker();
        }, 200);
    }
    
    /**
     * CRITICAL: Patch the Bridge's internal context to use our BlockingContext
     */
    private void patchBridgeContext() {
        if (bridgePatched) return;
        
        try {
            Bridge bridge = getBridge();
            if (bridge == null) {
                handler.postDelayed(this::patchBridgeContext, 300);
                return;
            }
            
            // Use reflection to replace the context field in Bridge
            Class<?> bridgeClass = bridge.getClass();
            
            // Try to find and patch the context field
            Field[] fields = bridgeClass.getDeclaredFields();
            for (Field field : fields) {
                if (Context.class.isAssignableFrom(field.getType())) {
                    field.setAccessible(true);
                    Object currentContext = field.get(bridge);
                    if (currentContext != null && !(currentContext instanceof BlockingContext)) {
                        field.set(bridge, new BlockingContext((Context) currentContext));
                        log("Patched Bridge context field: " + field.getName());
                    }
                }
            }
            
            // Also try parent classes
            Class<?> parentClass = bridgeClass.getSuperclass();
            while (parentClass != null && parentClass != Object.class) {
                for (Field field : parentClass.getDeclaredFields()) {
                    if (Context.class.isAssignableFrom(field.getType())) {
                        try {
                            field.setAccessible(true);
                            Object currentContext = field.get(bridge);
                            if (currentContext != null && !(currentContext instanceof BlockingContext)) {
                                field.set(bridge, new BlockingContext((Context) currentContext));
                                log("Patched parent context field: " + field.getName());
                            }
                        } catch (Exception e) {
                            // Some fields may be final, ignore
                        }
                    }
                }
                parentClass = parentClass.getSuperclass();
            }
            
            bridgePatched = true;
            log("Bridge context patching complete");
            
        } catch (Exception e) {
            log("Bridge patching error: " + e.getMessage());
        }
    }
    
    private void setupAdBlocker() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) {
                log("Bridge is null, retrying...");
                handler.postDelayed(this::setupAdBlocker, 500);
                return;
            }
            
            WebView webView = bridge.getWebView();
            if (webView == null) {
                log("WebView is null, retrying...");
                handler.postDelayed(this::setupAdBlocker, 500);
                return;
            }
            
            webViewRef = webView;
            
            // Set our custom WebViewClient with ad blocking
            webView.setWebViewClient(new AdBlockingWebViewClient());
            
            // Block popups via WebChromeClient
            webView.setWebChromeClient(new BlockingWebChromeClient());
            
            // Block downloads (ads sometimes trigger fake downloads)
            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                log("BLOCKED DOWNLOAD: " + url.substring(0, Math.min(60, url.length())));
                blockedCount++;
            });
            
            // Aggressive WebView settings
            configureWebViewSettings(webView);
            
            // Disable context menu (prevents "Open in browser" option)
            webView.setOnLongClickListener(v -> true);
            
            // Start continuous JS injection
            startContinuousJSInjection(webView);
            
            log("=== NUCLEAR V7 ACTIVE ===");
            
        } catch (Exception e) {
            log("Setup error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void configureWebViewSettings(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // SECURITY: Disable features that ads abuse
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setGeolocationEnabled(false);
        
        // Disable third-party cookies
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        
        // Enable safe browsing on Android O+
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
         * Return TRUE = we handled it (blocked)
         * Return FALSE = let WebView load it
         */
        private boolean handleNavigation(String url, boolean isMainFrame) {
            if (url == null || url.isEmpty()) {
                return true; // Block empty
            }
            
            String lowerUrl = url.toLowerCase();
            
            // Allow internal WebView schemes
            if (lowerUrl.startsWith("javascript:") || 
                lowerUrl.startsWith("data:") || 
                lowerUrl.startsWith("blob:") ||
                lowerUrl.startsWith("about:")) {
                return false; // Let WebView handle
            }
            
            // BLOCK ALL non-HTTP schemes (intent://, market://, tel://, etc.)
            // These are often used by ads to open external apps
            if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                log("BLOCKED SCHEME: " + url.substring(0, Math.min(80, url.length())));
                blockedCount++;
                return true;
            }
            
            // Check if URL is an ad
            if (isAdUrl(url)) {
                log("BLOCKED AD NAV: " + url.substring(0, Math.min(60, url.length())));
                blockedCount++;
                return true;
            }
            
            // Check whitelist mode
            if (isWhitelistModeEnabled()) {
                if (!isWhitelisted(url)) {
                    log("BLOCKED NON-WHITELIST: " + url.substring(0, Math.min(60, url.length())));
                    blockedCount++;
                    return true;
                }
            }
            
            // Allow whitelisted URLs to load in WebView
            return false;
        }
        
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            
            // Block known ad patterns at resource level
            if (isAdUrl(url)) {
                log("BLOCKED AD RESOURCE: " + url.substring(0, Math.min(60, url.length())));
                blockedCount++;
                return emptyResponse();
            }
            
            // For HTML requests (potential iframe ads), check whitelist
            String accept = request.getRequestHeaders().get("Accept");
            if (accept != null && accept.contains("text/html")) {
                if (isWhitelistModeEnabled() && !isWhitelisted(url)) {
                    log("BLOCKED IFRAME: " + url.substring(0, Math.min(60, url.length())));
                    blockedCount++;
                    return emptyHtmlResponse();
                }
            }
            
            // Block scripts from ad domains
            if (url.endsWith(".js") && isAdDomain(url)) {
                log("BLOCKED AD SCRIPT: " + url.substring(0, Math.min(60, url.length())));
                blockedCount++;
                return emptyResponse();
            }
            
            return null; // Let it through
        }
        
        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            injectAdBlockerJS(view);
        }
        
        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            // Silently ignore errors from blocked resources
            if (isAdUrl(failingUrl)) {
                return;
            }
            super.onReceivedError(view, errorCode, description, failingUrl);
        }
    }
    
    // ==================== BLOCKING WEBCHROMECLIENT ====================
    
    private class BlockingWebChromeClient extends WebChromeClient {
        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, 
                                      boolean isUserGesture, android.os.Message resultMsg) {
            log("BLOCKED POPUP WINDOW");
            blockedCount++;
            return false; // Deny all popup windows
        }
        
        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            // Block JS alerts (often used by ads)
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
            result.confirm(); // Always allow unload
            return true;
        }
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
        
        // Check regex pattern first (catches most)
        if (AD_PATTERN.matcher(lowerUrl).matches()) {
            return true;
        }
        
        // Check ad path patterns
        for (String pattern : AD_PATH_PATTERNS) {
            if (lowerUrl.contains(pattern)) {
                return true;
            }
        }
        
        // Check ad domains
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
                if (host.equals(adDomain) || host.endsWith("." + adDomain) || host.contains(adDomain)) {
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
    
    // ==================== JAVASCRIPT INJECTION ====================
    
    private void injectAdBlockerJS(WebView webView) {
        StringBuilder whitelist = new StringBuilder();
        for (String domain : WHITELIST) {
            if (whitelist.length() > 0) whitelist.append("','");
            whitelist.append(domain);
        }
        
        String js = "(function() {" +
            "if(window.__ZUNIVERSE_V7) return;" +
            "window.__ZUNIVERSE_V7 = true;" +
            
            "var W = ['" + whitelist.toString() + "'];" +
            
            "function isOk(url) {" +
            "  if(!url) return true;" +
            "  try {" +
            "    var h = new URL(url, location.href).hostname.toLowerCase();" +
            "    return W.some(function(d) { return h === d || h.endsWith('.' + d); });" +
            "  } catch(e) { return false; }" +
            "}" +
            
            // Kill window.open completely
            "window.open = function() { console.log('[ZU] Blocked window.open'); return null; };" +
            
            // Kill location redirects
            "var origAssign = location.assign.bind(location);" +
            "var origReplace = location.replace.bind(location);" +
            
            "location.assign = function(url) { if(isOk(url)) origAssign(url); else console.log('[ZU] Blocked assign:', url); };" +
            "location.replace = function(url) { if(isOk(url)) origReplace(url); else console.log('[ZU] Blocked replace:', url); };" +
            
            // Block href setter
            "try {" +
            "  var locDesc = Object.getOwnPropertyDescriptor(window, 'location');" +
            "  if(locDesc && locDesc.set) {" +
            "    var origSet = locDesc.set;" +
            "    Object.defineProperty(window, 'location', {" +
            "      get: locDesc.get," +
            "      set: function(v) { if(isOk(v)) origSet.call(window, v); }" +
            "    });" +
            "  }" +
            "} catch(e) {}" +
            
            // Block clicks on non-whitelisted links (capture phase)
            "document.addEventListener('click', function(e) {" +
            "  var t = e.target;" +
            "  while(t && t.tagName !== 'A') t = t.parentElement;" +
            "  if(t && t.href && !isOk(t.href)) {" +
            "    e.preventDefault();" +
            "    e.stopPropagation();" +
            "    e.stopImmediatePropagation();" +
            "    console.log('[ZU] Blocked click:', t.href);" +
            "    return false;" +
            "  }" +
            "}, true);" +
            
            // Also block mousedown to prevent drag redirects
            "document.addEventListener('mousedown', function(e) {" +
            "  var t = e.target;" +
            "  while(t && t.tagName !== 'A') t = t.parentElement;" +
            "  if(t && t.href && !isOk(t.href)) {" +
            "    e.preventDefault();" +
            "    e.stopImmediatePropagation();" +
            "  }" +
            "}, true);" +
            
            // Block touch events
            "['touchstart','touchend'].forEach(function(evt) {" +
            "  document.addEventListener(evt, function(e) {" +
            "    var t = e.target;" +
            "    while(t && t.tagName !== 'A') t = t.parentElement;" +
            "    if(t && t.href && !isOk(t.href)) {" +
            "      e.preventDefault();" +
            "      e.stopImmediatePropagation();" +
            "    }" +
            "  }, true);" +
            "});" +
            
            // Periodic cleanup of ad elements
            "setInterval(function() {" +
            "  try {" +
            "    // Remove invisible overlay ads" +
            "    document.querySelectorAll('*').forEach(function(el) {" +
            "      try {" +
            "        var s = getComputedStyle(el);" +
            "        if((s.position === 'fixed' || s.position === 'absolute') && " +
            "           parseInt(s.zIndex) > 1000 && " +
            "           (parseFloat(s.opacity) < 0.1 || el.offsetWidth < 3 || el.offsetHeight < 3)) {" +
            "          el.remove();" +
            "        }" +
            "      } catch(e) {}" +
            "    });" +
            "    // Remove non-whitelisted iframes" +
            "    document.querySelectorAll('iframe').forEach(function(f) {" +
            "      if(f.src && !isOk(f.src)) f.remove();" +
            "    });" +
            "    // Force all links to target _self" +
            "    document.querySelectorAll('a[target=\"_blank\"]').forEach(function(a) {" +
            "      a.target = '_self';" +
            "    });" +
            "  } catch(e) {}" +
            "}, 500);" +
            
            "console.log('[ZUniverse] Ad blocker V7 active');" +
        "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    private void startContinuousJSInjection(WebView webView) {
        Runnable injector = new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        webView.evaluateJavascript("window.__ZUNIVERSE_V7 = false;", null);
                        injectAdBlockerJS(webView);
                    }
                } catch (Exception e) {
                    // Ignore
                }
                handler.postDelayed(this, 2000);
            }
        };
        handler.postDelayed(injector, 2000);
    }
    
    // ==================== ACTIVITY-LEVEL BLOCKING (final backup) ====================
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) return;
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) return;
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) return;
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) return;
        super.startActivityForResult(intent, requestCode, options);
    }
    
    @Override
    public void startActivities(Intent[] intents) {
        log("BLOCKED batch startActivities");
        blockedCount++;
    }
    
    @Override
    public void startActivities(Intent[] intents, Bundle options) {
        log("BLOCKED batch startActivities");
        blockedCount++;
    }
    
    private void log(String msg) {
        Log.d(TAG, "★ " + msg);
    }
    
    public static int getBlockedAdsCount() {
        return blockedCount;
    }
}
