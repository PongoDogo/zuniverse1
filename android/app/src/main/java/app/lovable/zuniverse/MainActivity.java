package app.lovable.zuniverse;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.ContextWrapper;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
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
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import app.lovable.zuniverse.plugins.AdBlockerPlugin;

/**
 * NUCLEAR AD BLOCKER V6 - THE REAL FIX
 * 
 * ROOT CAUSE DISCOVERED:
 * Capacitor's BridgeWebViewClient calls bridge.launchIntent(url) which
 * directly calls getContext().startActivity() - this BYPASSES our Activity
 * overrides because Bridge uses its own context reference.
 * 
 * THE FIX:
 * 1. Use a PLAIN WebViewClient (not BridgeWebViewClient) so launchIntent is NEVER called
 * 2. Handle ALL navigation ourselves - return true for everything we want to block
 * 3. Only return false (let WebView handle) for whitelisted URLs
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_V6";
    private static int blockedCount = 0;
    private Handler handler = new Handler(Looper.getMainLooper());
    private WebView webViewRef;
    
    // WHITELIST - only these domains can load
    private static final Set<String> WHITELIST = new HashSet<>(Arrays.asList(
        // App domains
        "lovableproject.com", "lovable.dev", "localhost", "127.0.0.1", "10.0.2.2",
        
        // Streaming sources - VidSrc family
        "vidsrc.wtf", "vidsrc.cc", "vidsrc.me", "vidsrc.pro", "vidsrc.to", 
        "vidsrc.xyz", "vidsrc.net", "vidsrc.icu", "vidsrc.in", "vidsrc.nl",
        "vidsrc-api.com", "v2.vidsrc.me",
        
        // Embed sources
        "embed.su", "embedsu.com",
        "2embed.org", "2embed.cc", "2embed.skin",
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
        
        // Video CDNs - essential for playback
        "googlevideo.com", "googleusercontent.com",
        "gstatic.com", "ggpht.com",
        "akamaihd.net", "akamaized.net", "akamaicdn.net",
        "cloudfront.net", "cloudflare.com", "cdnjs.cloudflare.com",
        "fastly.net", "fastlylb.net",
        "jsdelivr.net", "unpkg.com",
        "bunnycdn.com", "b-cdn.net",
        "cdn77.org",
        "jwpcdn.com", "jwplayer.com", "jwpsrv.com",
        "vidcdn.co", "vidcdn.pro",
        "mixdrop.co", "mixdrop.to", "mixdrop.sx",
        "streamtape.com", "strcloud.in",
        "dood.watch", "dood.la", "dood.so", "dood.pm",
        "filemoon.sx", "filemoon.to",
        "upstream.to",
        "rabbitstream.net",
        "rapid-cloud.co", "rapid-cloud.ru",
        "vidplay.online", "vidplay.site",
        "dokicloud.one",
        "megacloud.tv",
        
        // TMDB
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    // Ad patterns to block at network level
    private static final Pattern AD_PATTERN = Pattern.compile(
        ".*(doubleclick|googlesyndication|googleadservices|google-analytics|" +
        "facebook\\.com/tr|analytics|tracker|adservice|adsserver|" +
        "popads|popunder|popcash|propellerads|exoclick|trafficjunky|" +
        "clickadu|admaven|adsterra|monetag|hilltopads|" +
        "mgid|taboola|outbrain|realsrv|onclickmax|pushame|" +
        "juicyads|adnxs\\.com|pubmatic|criteo|" +
        "bidswitch|openx\\.net|rubiconproject|amazon-adsystem|" +
        "ad\\.|ads\\.|adv\\.|banner|sponsor|promo|" +
        "/ads/|/ad/|/adx/|/adv/).*",
        Pattern.CASE_INSENSITIVE
    );
    
    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(new BlockingContext(newBase));
    }
    
    /**
     * Context wrapper that blocks ALL startActivity calls that would open external apps
     */
    private class BlockingContext extends ContextWrapper {
        BlockingContext(Context base) {
            super(base);
        }
        
        @Override
        public void startActivity(Intent intent) {
            if (shouldBlockIntent(intent)) {
                log("CONTEXT BLOCKED: " + intent);
                return;
            }
            super.startActivity(intent);
        }
        
        @Override
        public void startActivity(Intent intent, Bundle options) {
            if (shouldBlockIntent(intent)) {
                log("CONTEXT BLOCKED (options): " + intent);
                return;
            }
            super.startActivity(intent, options);
        }
        
        @Override
        public void startActivities(Intent[] intents) {
            log("CONTEXT BLOCKED batch startActivities");
            blockedCount++;
            // Do nothing - block batch launches
        }
        
        @Override
        public void startActivities(Intent[] intents, Bundle options) {
            log("CONTEXT BLOCKED batch startActivities");
            blockedCount++;
            // Do nothing
        }
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        
        // BLOCK ALL ACTION_VIEW - this is what opens browsers
        if (Intent.ACTION_VIEW.equals(action)) {
            blockedCount++;
            Uri data = intent.getData();
            if (data != null) {
                log("BLOCKED ACTION_VIEW: " + data.toString());
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
            // If we can't determine, block it to be safe
            blockedCount++;
            return true;
        }
        
        return false;
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
        log("=== NUCLEAR V6 STARTING ===");
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        setupAdBlocker();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Re-apply in case something reset it
        handler.postDelayed(this::setupAdBlocker, 200);
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
            
            // KEY FIX: Use a PLAIN WebViewClient - NOT BridgeWebViewClient!
            // This prevents bridge.launchIntent() from ever being called
            webView.setWebViewClient(new WebViewClient() {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    return handleNavigation(request.getUrl().toString());
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    return handleNavigation(url);
                }
                
                /**
                 * THE KEY METHOD - decides if URL should load
                 * Return TRUE = we handled it (blocked or allowed to load in webview)
                 * Return FALSE = let WebView handle it (which could trigger external browser via system)
                 */
                private boolean handleNavigation(String url) {
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
                    
                    // BLOCK all non-HTTP schemes (intent://, market://, tel://, etc.)
                    if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                        log("BLOCKED SCHEME: " + url.substring(0, Math.min(80, url.length())));
                        blockedCount++;
                        return true; // Blocked - we "handled" it by doing nothing
                    }
                    
                    // Check if whitelisted
                    if (isWhitelisted(url)) {
                        // Let it load in WebView - important: return false so WebView loads it
                        return false;
                    }
                    
                    // NOT whitelisted - BLOCK IT
                    log("BLOCKED URL: " + url.substring(0, Math.min(80, url.length())));
                    blockedCount++;
                    return true; // Blocked
                }
                
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block known ad patterns
                    if (AD_PATTERN.matcher(url).matches()) {
                        log("BLOCKED AD RESOURCE: " + url.substring(0, Math.min(60, url.length())));
                        blockedCount++;
                        return emptyResponse();
                    }
                    
                    // Block non-whitelisted HTML/document loads (catches iframe ads)
                    String accept = request.getRequestHeaders().get("Accept");
                    if (accept != null && accept.contains("text/html")) {
                        if (!isWhitelisted(url)) {
                            log("BLOCKED IFRAME/HTML: " + url.substring(0, Math.min(60, url.length())));
                            blockedCount++;
                            return emptyHtmlResponse();
                        }
                    }
                    
                    return null; // Let it through
                }
                
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    injectAdBlockerJS(view);
                }
            });
            
            // Block popups via WebChromeClient
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, 
                                             boolean isUserGesture, android.os.Message resultMsg) {
                    log("BLOCKED POPUP WINDOW");
                    blockedCount++;
                    return false; // Deny popup
                }
                
                @Override
                public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                    result.cancel();
                    return true; // Suppress alert
                }
                
                @Override
                public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                    result.cancel();
                    return true;
                }
                
                @Override
                public boolean onJsPrompt(WebView view, String url, String message, 
                                         String defaultValue, JsPromptResult result) {
                    result.cancel();
                    return true;
                }
                
                @Override
                public boolean onJsBeforeUnload(WebView view, String url, String message, JsResult result) {
                    result.confirm();
                    return true;
                }
            });
            
            // Block downloads (ads sometimes trigger fake downloads)
            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                log("BLOCKED DOWNLOAD: " + url.substring(0, Math.min(60, url.length())));
                blockedCount++;
                // Do nothing - don't start download
            });
            
            // Aggressive WebView settings
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
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
            
            // Disable context menu (prevents "Open in browser" option)
            webView.setOnLongClickListener(v -> true);
            
            // Start continuous JS injection
            startContinuousJSInjection(webView);
            
            log("=== NUCLEAR V6 ACTIVE ===");
            
        } catch (Exception e) {
            log("Setup error: " + e.getMessage());
            e.printStackTrace();
        }
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
            // Invalid URL - not whitelisted
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
    
    /**
     * JavaScript injection to block click hijacking and overlay ads
     */
    private void injectAdBlockerJS(WebView webView) {
        // Build whitelist for JS
        StringBuilder whitelist = new StringBuilder();
        for (String domain : WHITELIST) {
            if (whitelist.length() > 0) whitelist.append("','");
            whitelist.append(domain);
        }
        
        String js = "(function() {" +
            "if(window.__ZUNIVERSE_V6) return;" +
            "window.__ZUNIVERSE_V6 = true;" +
            
            // Whitelist domains
            "var W = ['" + whitelist.toString() + "'];" +
            
            "function isOk(url) {" +
            "  if(!url) return true;" +
            "  try {" +
            "    var h = new URL(url, location.href).hostname.toLowerCase();" +
            "    return W.some(function(d) { return h === d || h.endsWith('.' + d); });" +
            "  } catch(e) { return false; }" +
            "}" +
            
            // Kill window.open completely
            "window.open = function() { return null; };" +
            
            // Kill location redirects to non-whitelisted domains
            "var origAssign = location.assign.bind(location);" +
            "var origReplace = location.replace.bind(location);" +
            
            "Object.defineProperty(window, 'location', {" +
            "  get: function() { return location; }," +
            "  set: function(v) { if(isOk(v)) location.href = v; }" +
            "});" +
            
            "location.assign = function(url) { if(isOk(url)) origAssign(url); };" +
            "location.replace = function(url) { if(isOk(url)) origReplace(url); };" +
            
            // Block clicks on non-whitelisted links
            "document.addEventListener('click', function(e) {" +
            "  var t = e.target;" +
            "  while(t && t.tagName !== 'A') { t = t.parentElement; }" +
            "  if(t && t.href && !isOk(t.href)) {" +
            "    e.preventDefault();" +
            "    e.stopPropagation();" +
            "    e.stopImmediatePropagation();" +
            "    return false;" +
            "  }" +
            "}, true);" +
            
            // Block touch events on ad links
            "document.addEventListener('touchend', function(e) {" +
            "  var t = e.target;" +
            "  while(t && t.tagName !== 'A') { t = t.parentElement; }" +
            "  if(t && t.href && !isOk(t.href)) {" +
            "    e.preventDefault();" +
            "    e.stopPropagation();" +
            "    e.stopImmediatePropagation();" +
            "    return false;" +
            "  }" +
            "}, true);" +
            
            // Remove invisible overlays and ad iframes every 500ms
            "setInterval(function() {" +
            "  var all = document.querySelectorAll('*');" +
            "  all.forEach(function(el) {" +
            "    try {" +
            "      var s = getComputedStyle(el);" +
            "      // Remove invisible overlays with high z-index" +
            "      if((s.position === 'fixed' || s.position === 'absolute') && " +
            "         parseInt(s.zIndex) > 1000 && " +
            "         (parseFloat(s.opacity) < 0.1 || el.offsetWidth < 3)) {" +
            "        el.remove();" +
            "      }" +
            "      // Remove non-whitelisted iframes" +
            "      if(el.tagName === 'IFRAME' && el.src && !isOk(el.src)) {" +
            "        el.remove();" +
            "      }" +
            "    } catch(e) {}" +
            "  });" +
            "}, 500);" +
            
            "console.log('[ZUniverse] Ad blocker V6 active');" +
        "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    private void startContinuousJSInjection(WebView webView) {
        Runnable injector = new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        // Reset flag and re-inject
                        webView.evaluateJavascript("window.__ZUNIVERSE_V6 = false;", null);
                        injectAdBlockerJS(webView);
                    }
                } catch (Exception e) {
                    // Ignore
                }
                handler.postDelayed(this, 1500);
            }
        };
        handler.postDelayed(injector, 1500);
    }
    
    // ==================== ACTIVITY-LEVEL BLOCKING (backup) ====================
    
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
