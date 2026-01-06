package app.lovable.zuniverse;

import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.MotionEvent;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import app.lovable.zuniverse.plugins.AdBlockerPlugin;

public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUniverseAdBlocker";
    private int blockedAdsCount = 0;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    
    // NUCLEAR: Track touch events to block click-triggered ads
    private volatile boolean isTouchActive = false;
    private volatile long lastTouchTime = 0;
    private static final long TOUCH_BLOCK_WINDOW_MS = 500; // Block intents for 500ms after touch
    
    // ONLY allow these domains - VERY STRICT
    private static final Set<String> ALLOWED_DOMAINS = new HashSet<>(Arrays.asList(
        // Our app
        "lovableproject.com", "lovable.dev", "localhost",
        // Streaming sources - only the main ones we use
        "vidsrc.cc", "vidsrc.me", "vidsrc.pro", "vidsrc.to", "vidsrc.xyz", "vidsrc.net", "vidsrc.icu",
        "embed.su", "embedsu.com",
        "vidlink.pro",
        "moviesapi.club",
        "vidbinge.dev", "vidbinge.com",
        "2embed.org", "2embed.cc", "2embed.skin",
        "multiembed.mov",
        "smashy.stream", "player.smashy.stream",
        "autoembed.cc", "autoembed.co",
        // TMDB for images
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    // Known ad/tracker domains to block at resource level
    private static final Pattern AD_PATTERNS = Pattern.compile(
        ".*(doubleclick|googlesyndication|googleadservices|google-analytics|" +
        "facebook\\.com/tr|fbcdn|analytics|tracker|adservice|adsserver|" +
        "popads|popunder|popcash|propellerads|exoclick|juicyads|trafficjunky|" +
        "clickadu|admaven|adsterra|monetag|hilltopads|revcontent|" +
        "mgid|taboola|outbrain|zergnet|realsrv|onclickmax|clickaine|" +
        "pushnami|pushame|pushwhy|pushking|pushno|" +
        "redirect|track\\.php|click\\.php|go\\.php|redir|" +
        "bc\\.vc|sh\\.st|adf\\.ly|linkvertise|shrinkme|" +
        "ads\\.|ad\\.|adv\\.|banner|sponsor).*",
        Pattern.CASE_INSENSITIVE
    );
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        setupAggressiveAdBlocking();
    }
    
    /**
     * NUCLEAR: Intercept ALL touch events to track when user is touching the screen.
     * Any Intent that tries to open during/after a touch is an AD and should be blocked.
     */
    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        switch (ev.getAction()) {
            case MotionEvent.ACTION_DOWN:
                isTouchActive = true;
                lastTouchTime = System.currentTimeMillis();
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                isTouchActive = false;
                lastTouchTime = System.currentTimeMillis();
                break;
        }
        return super.dispatchTouchEvent(ev);
    }
    
    /**
     * Check if we're in the "danger zone" where click-triggered ads happen
     */
    private boolean isInTouchBlockWindow() {
        return isTouchActive || (System.currentTimeMillis() - lastTouchTime < TOUCH_BLOCK_WINDOW_MS);
    }
    
    private void setupAggressiveAdBlocking() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) {
                android.util.Log.e(TAG, "Bridge is null");
                return;
            }
            
            WebView webView = bridge.getWebView();
            if (webView == null) {
                android.util.Log.e(TAG, "WebView is null");
                return;
            }
            
            // CRITICAL: Custom WebViewClient that blocks ALL external navigation
            BridgeWebViewClient customClient = new BridgeWebViewClient(bridge) {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // NUCLEAR: If touched recently and URL is external, BLOCK IT
                    if (isInTouchBlockWindow() && !isAllowedDomain(url)) {
                        android.util.Log.d(TAG, "BLOCKED touch-triggered navigation: " + truncateUrl(url));
                        blockedAdsCount++;
                        return true;
                    }
                    
                    // Block ALL external navigation that's not in our allowed list
                    if (shouldBlockUrl(url)) {
                        android.util.Log.d(TAG, "BLOCKED navigation to: " + truncateUrl(url));
                        blockedAdsCount++;
                        return true;
                    }
                    
                    return super.shouldOverrideUrlLoading(view, request);
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (isInTouchBlockWindow() && !isAllowedDomain(url)) {
                        android.util.Log.d(TAG, "BLOCKED touch-triggered (legacy): " + truncateUrl(url));
                        blockedAdsCount++;
                        return true;
                    }
                    
                    if (shouldBlockUrl(url)) {
                        android.util.Log.d(TAG, "BLOCKED (legacy): " + truncateUrl(url));
                        blockedAdsCount++;
                        return true;
                    }
                    return super.shouldOverrideUrlLoading(view, url);
                }
                
                // BLOCK AD RESOURCES at the network level
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block known ad patterns
                    if (AD_PATTERNS.matcher(url).matches()) {
                        android.util.Log.d(TAG, "BLOCKED resource: " + truncateUrl(url));
                        blockedAdsCount++;
                        return createEmptyResponse();
                    }
                    
                    // Also block requests to non-allowed domains
                    if (!isAllowedDomain(url) && !url.startsWith("data:") && !url.startsWith("blob:")) {
                        String host = getHostFromUrl(url);
                        if (host != null && !host.isEmpty()) {
                            android.util.Log.d(TAG, "BLOCKED resource from non-allowed domain: " + truncateUrl(url));
                            blockedAdsCount++;
                            return createEmptyResponse();
                        }
                    }
                    
                    return super.shouldInterceptRequest(view, request);
                }
            };
            
            webView.setWebViewClient(customClient);
            
            // NUCLEAR: Block ALL new window creation
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    // BLOCK ALL - ads fake user gestures
                    android.util.Log.d(TAG, "BLOCKED popup (isUserGesture=" + isUserGesture + ")");
                    blockedAdsCount++;
                    return false;
                }
                
                @Override
                public void onCloseWindow(WebView window) {}
                
                @Override
                public boolean onJsAlert(WebView view, String url, String message, android.webkit.JsResult result) {
                    result.cancel();
                    return true;
                }
                
                @Override
                public boolean onJsConfirm(WebView view, String url, String message, android.webkit.JsResult result) {
                    result.cancel();
                    return true;
                }
                
                @Override
                public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, android.webkit.JsPromptResult result) {
                    result.cancel();
                    return true;
                }
                
                @Override
                public void onGeolocationPermissionsShowPrompt(String origin, android.webkit.GeolocationPermissions.Callback callback) {
                    callback.invoke(origin, false, false);
                }
            });
            
            // Configure WebView for maximum security
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            settings.setGeolocationEnabled(false);
            
            // Disable third-party cookies completely
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
            
            // Enable safe browsing
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            // Inject ad blocker on page load and continuously
            injectAdBlocker(webView);
            startContinuousInjection(webView);
            
            android.util.Log.d(TAG, "NUCLEAR ad blocking active - touch window tracking enabled");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Error setting up ad blocking: " + e.getMessage());
        }
    }
    
    private String getHostFromUrl(String url) {
        try {
            java.net.URL urlObj = new java.net.URL(url);
            return urlObj.getHost();
        } catch (Exception e) {
            return null;
        }
    }
    
    private WebResourceResponse createEmptyResponse() {
        return new WebResourceResponse(
            "text/plain",
            "UTF-8",
            new ByteArrayInputStream("".getBytes())
        );
    }
    
    private String truncateUrl(String url) {
        if (url == null) return "null";
        return url.substring(0, Math.min(80, url.length()));
    }
    
    private boolean isAllowedDomain(String url) {
        if (url == null) return false;
        try {
            java.net.URL urlObj = new java.net.URL(url);
            String host = urlObj.getHost();
            if (host == null) return false;
            
            String lowerHost = host.toLowerCase();
            for (String allowed : ALLOWED_DOMAINS) {
                if (lowerHost.equals(allowed) || lowerHost.endsWith("." + allowed)) {
                    return true;
                }
            }
        } catch (Exception e) {}
        return false;
    }
    
    private boolean shouldBlockUrl(String url) {
        if (url == null || url.isEmpty()) return false;
        
        String lowerUrl = url.toLowerCase();
        
        // Allow about:blank and javascript: URLs
        if (lowerUrl.startsWith("about:") || lowerUrl.startsWith("javascript:") || lowerUrl.startsWith("data:")) {
            return false;
        }
        
        // Block ALL non-http schemes (intent://, market://, etc.)
        if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
            return true;
        }
        
        // Block if not in allowed domains
        return !isAllowedDomain(url);
    }
    
    /**
     * Ultra-aggressive JavaScript injection to block all redirect methods
     */
    private void injectAdBlocker(WebView webView) {
        String js = 
            "(function() {" +
            "  if (window.__ZU_NUCLEAR__) return;" +
            "  window.__ZU_NUCLEAR__ = true;" +
            "  " +
            "  var allowed = ['lovableproject.com','lovable.dev','localhost'," +
            "    'vidsrc.cc','vidsrc.me','vidsrc.pro','vidsrc.to','vidsrc.xyz','vidsrc.net','vidsrc.icu'," +
            "    'embed.su','embedsu.com','vidlink.pro','moviesapi.club'," +
            "    'vidbinge.dev','vidbinge.com','2embed.org','2embed.cc','2embed.skin'," +
            "    'multiembed.mov','smashy.stream','autoembed.cc','autoembed.co'," +
            "    'themoviedb.org','tmdb.org','image.tmdb.org'];" +
            "  " +
            "  function ok(u) {" +
            "    if (!u) return true;" +
            "    try {" +
            "      var h = new URL(u, location.href).hostname.toLowerCase();" +
            "      return allowed.some(function(d) { return h === d || h.endsWith('.'+d); });" +
            "    } catch(e) { return false; }" +
            "  }" +
            "  " +
            "  // KILL window.open" +
            "  window.open = function() { console.log('[ZU] blocked window.open'); return null; };" +
            "  " +
            "  // KILL location methods" +
            "  var origAssign = location.assign ? location.assign.bind(location) : function(){};" +
            "  var origReplace = location.replace ? location.replace.bind(location) : function(){};" +
            "  location.assign = function(u) { if(ok(u)) origAssign(u); else console.log('[ZU] blocked assign:', u); };" +
            "  location.replace = function(u) { if(ok(u)) origReplace(u); else console.log('[ZU] blocked replace:', u); };" +
            "  " +
            "  // Trap location.href" +
            "  try {" +
            "    var realLoc = window.location;" +
            "    var origHref = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');" +
            "    if (origHref && origHref.set) {" +
            "      Object.defineProperty(window.Location.prototype, 'href', {" +
            "        get: origHref.get," +
            "        set: function(u) { if(ok(u)) origHref.set.call(this, u); else console.log('[ZU] blocked href:', u); }" +
            "      });" +
            "    }" +
            "  } catch(e) {}" +
            "  " +
            "  // NUCLEAR: Block ALL click events that might lead to ads" +
            "  function nuclearClickBlock(e) {" +
            "    var el = e.target;" +
            "    var maxDepth = 20;" +
            "    var depth = 0;" +
            "    while (el && el !== document && depth < maxDepth) {" +
            "      depth++;" +
            "      // Check anchor tags" +
            "      if (el.tagName === 'A') {" +
            "        var href = el.href || el.getAttribute('href');" +
            "        if (href && !ok(href)) {" +
            "          e.preventDefault();" +
            "          e.stopPropagation();" +
            "          e.stopImmediatePropagation();" +
            "          console.log('[ZU] blocked click on bad link:', href);" +
            "          return false;" +
            "        }" +
            "        // Also check target=_blank" +
            "        if (el.target === '_blank') {" +
            "          el.target = '_self';" +
            "          if (!ok(href)) {" +
            "            e.preventDefault();" +
            "            e.stopPropagation();" +
            "            return false;" +
            "          }" +
            "        }" +
            "      }" +
            "      // Check for invisible/transparent overlays (common ad technique)" +
            "      var style = window.getComputedStyle(el);" +
            "      if (style.position === 'fixed' || style.position === 'absolute') {" +
            "        var opacity = parseFloat(style.opacity);" +
            "        if (opacity < 0.1 || style.pointerEvents === 'all') {" +
            "          // Might be an ad overlay - check z-index" +
            "          var zIndex = parseInt(style.zIndex) || 0;" +
            "          if (zIndex > 1000) {" +
            "            e.preventDefault();" +
            "            e.stopPropagation();" +
            "            el.style.pointerEvents = 'none';" +
            "            el.style.display = 'none';" +
            "            console.log('[ZU] blocked click on suspicious overlay');" +
            "            return false;" +
            "          }" +
            "        }" +
            "      }" +
            "      el = el.parentElement;" +
            "    }" +
            "  }" +
            "  " +
            "  // Capture ALL click-like events at document level with highest priority" +
            "  ['click','mousedown','mouseup','touchstart','touchend','pointerdown','pointerup'].forEach(function(evt) {" +
            "    document.addEventListener(evt, nuclearClickBlock, {capture: true, passive: false});" +
            "    window.addEventListener(evt, nuclearClickBlock, {capture: true, passive: false});" +
            "  });" +
            "  " +
            "  // Periodically remove ad overlays and iframes" +
            "  setInterval(function() {" +
            "    // Remove invisible overlays" +
            "    document.querySelectorAll('div, span, a').forEach(function(el) {" +
            "      try {" +
            "        var style = window.getComputedStyle(el);" +
            "        var isFixed = style.position === 'fixed' || style.position === 'absolute';" +
            "        var isTransparent = parseFloat(style.opacity) < 0.1;" +
            "        var isFullScreen = el.offsetWidth > window.innerWidth * 0.8 && el.offsetHeight > window.innerHeight * 0.8;" +
            "        var hasHighZ = (parseInt(style.zIndex) || 0) > 1000;" +
            "        if (isFixed && (isTransparent || isFullScreen) && hasHighZ) {" +
            "          el.style.pointerEvents = 'none';" +
            "          el.style.display = 'none';" +
            "        }" +
            "      } catch(e) {}" +
            "    });" +
            "    // Remove bad iframes" +
            "    document.querySelectorAll('iframe').forEach(function(f) {" +
            "      if (f.src && !ok(f.src) && !f.src.startsWith('about:') && !f.src.startsWith('blob:')) {" +
            "        f.remove();" +
            "      }" +
            "    });" +
            "  }, 500);" +
            "  " +
            "  // Block alert/confirm/prompt" +
            "  window.alert = function() {};" +
            "  window.confirm = function() { return false; };" +
            "  window.prompt = function() { return null; };" +
            "  window.onbeforeunload = null;" +
            "  Object.defineProperty(window, 'onbeforeunload', {get: function(){return null;}, set: function(){}});" +
            "  " +
            "  console.log('[ZU] NUCLEAR ad blocker active');" +
            "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    /**
     * Re-inject blocker every second to catch dynamically loaded content
     */
    private void startContinuousInjection(WebView webView) {
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        injectAdBlocker(webView);
                    }
                    mainHandler.postDelayed(this, 1000); // Every 1 second instead of 2
                } catch (Exception e) {
                    android.util.Log.e(TAG, "Injection error: " + e.getMessage());
                }
            }
        }, 1000);
    }
    
    // ==================== NUCLEAR INTENT BLOCKING ====================
    // Block ALL intents that would open external apps/browsers
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivity: " + intent);
            blockedAdsCount++;
            return;
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivity+options: " + intent);
            blockedAdsCount++;
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityForResult: " + intent);
            blockedAdsCount++;
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityForResult+options: " + intent);
            blockedAdsCount++;
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    @Override
    public boolean startActivityIfNeeded(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityIfNeeded: " + intent);
            blockedAdsCount++;
            return false;
        }
        return super.startActivityIfNeeded(intent, requestCode);
    }
    
    @Override
    public boolean startActivityIfNeeded(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityIfNeeded+options: " + intent);
            blockedAdsCount++;
            return false;
        }
        return super.startActivityIfNeeded(intent, requestCode, options);
    }
    
    @Override
    public boolean startNextMatchingActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startNextMatchingActivity: " + intent);
            blockedAdsCount++;
            return false;
        }
        return super.startNextMatchingActivity(intent);
    }
    
    @Override
    public boolean startNextMatchingActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startNextMatchingActivity+options: " + intent);
            blockedAdsCount++;
            return false;
        }
        return super.startNextMatchingActivity(intent, options);
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        // NUCLEAR: Block ALL external intents triggered during touch
        if (isInTouchBlockWindow()) {
            String action = intent.getAction();
            Uri data = intent.getData();
            ComponentName component = intent.getComponent();
            
            // Only allow intents to our own app
            if (component != null && !component.getPackageName().equals(getPackageName())) {
                android.util.Log.d(TAG, "BLOCKED touch-triggered external intent");
                return true;
            }
            
            // Block any URL intent
            if (Intent.ACTION_VIEW.equals(action) && data != null) {
                String scheme = data.getScheme();
                if ("http".equals(scheme) || "https".equals(scheme) || "intent".equals(scheme) || "market".equals(scheme)) {
                    android.util.Log.d(TAG, "BLOCKED touch-triggered URL intent: " + data);
                    return true;
                }
            }
        }
        
        // Normal blocking logic
        String action = intent.getAction();
        Uri data = intent.getData();
        
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            String scheme = data.getScheme();
            
            if ("http".equals(scheme) || "https".equals(scheme)) {
                String host = data.getHost();
                if (host == null || !isHostAllowed(host)) {
                    return true;
                }
            }
            
            // Block intent:// and market:// completely
            if ("intent".equals(scheme) || "market".equals(scheme)) {
                return true;
            }
        }
        
        // Check if this would open any browser app
        return wouldOpenBrowser(intent);
    }
    
    private boolean isHostAllowed(String host) {
        if (host == null) return false;
        String lowerHost = host.toLowerCase();
        for (String allowed : ALLOWED_DOMAINS) {
            if (lowerHost.equals(allowed) || lowerHost.endsWith("." + allowed)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean wouldOpenBrowser(Intent intent) {
        try {
            List<ResolveInfo> activities = getPackageManager().queryIntentActivities(intent, 0);
            for (ResolveInfo info : activities) {
                String pkg = info.activityInfo.packageName.toLowerCase();
                if (pkg.contains("chrome") || pkg.contains("browser") || 
                    pkg.contains("firefox") || pkg.contains("opera") ||
                    pkg.contains("edge") || pkg.contains("samsung") ||
                    pkg.contains("brave") || pkg.contains("webview") ||
                    pkg.contains("uc") || pkg.contains("dolphin") ||
                    pkg.contains("puffin") || pkg.contains("duckduckgo") ||
                    pkg.contains("vivaldi") || pkg.contains("kiwi") ||
                    pkg.contains("yandex") || pkg.contains("miui")) {
                    return true;
                }
            }
        } catch (Exception e) {}
        return false;
    }
    
    public int getBlockedAdsCount() {
        return blockedAdsCount;
    }
}
