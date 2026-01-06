package app.lovable.zuniverse;

import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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
            
            // CRITICAL: Custom WebViewClient with HitTestResult checking
            BridgeWebViewClient customClient = new BridgeWebViewClient(bridge) {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // KEY INSIGHT: If getHitTestResult() is null or UNKNOWN, 
                    // the navigation was triggered by JavaScript, not user click
                    WebView.HitTestResult hitTest = view.getHitTestResult();
                    boolean isUserInitiated = hitTest != null && 
                        hitTest.getType() != WebView.HitTestResult.UNKNOWN_TYPE;
                    
                    // If NOT user-initiated and NOT to our allowed domains, BLOCK IT
                    if (!isUserInitiated && !isAllowedDomain(url)) {
                        android.util.Log.d(TAG, "BLOCKED JS-triggered navigation: " + truncateUrl(url));
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
                    WebView.HitTestResult hitTest = view.getHitTestResult();
                    boolean isUserInitiated = hitTest != null && 
                        hitTest.getType() != WebView.HitTestResult.UNKNOWN_TYPE;
                    
                    if (!isUserInitiated && !isAllowedDomain(url)) {
                        android.util.Log.d(TAG, "BLOCKED JS-triggered (legacy): " + truncateUrl(url));
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
                    
                    return super.shouldInterceptRequest(view, request);
                }
            };
            
            webView.setWebViewClient(customClient);
            
            // NUCLEAR: Block ALL new window creation
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    // Even if "user gesture" is true, ads can fake this - BLOCK ALL
                    android.util.Log.d(TAG, "BLOCKED popup (isUserGesture=" + isUserGesture + ")");
                    blockedAdsCount++;
                    return false;
                }
                
                @Override
                public void onCloseWindow(WebView window) {}
                
                // Block JavaScript alerts/confirms
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
                
                // Block geolocation requests
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
            
            android.util.Log.d(TAG, "Ad blocking setup complete with HitTestResult checking");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Error setting up ad blocking: " + e.getMessage());
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
            "  if (window.__ZUNIVERSE_BLOCKER_V2__) return;" +
            "  window.__ZUNIVERSE_BLOCKER_V2__ = true;" +
            "  " +
            "  var allowed = ['lovableproject.com','lovable.dev','localhost'," +
            "    'vidsrc.cc','vidsrc.me','vidsrc.pro','vidsrc.to','vidsrc.xyz','vidsrc.net','vidsrc.icu'," +
            "    'embed.su','embedsu.com','vidlink.pro','moviesapi.club'," +
            "    'vidbinge.dev','vidbinge.com','2embed.org','2embed.cc','2embed.skin'," +
            "    'multiembed.mov','smashy.stream','autoembed.cc','autoembed.co'," +
            "    'themoviedb.org','tmdb.org'];" +
            "  " +
            "  function ok(u) {" +
            "    if (!u) return true;" +
            "    try {" +
            "      var h = new URL(u, location.href).hostname.toLowerCase();" +
            "      return allowed.some(function(d) { return h === d || h.endsWith('.'+d); });" +
            "    } catch(e) { return false; }" +
            "  }" +
            "  " +
            "  // Kill window.open completely" +
            "  window.open = function() { return null; };" +
            "  " +
            "  // Override location methods" +
            "  var origAssign = location.assign.bind(location);" +
            "  var origReplace = location.replace.bind(location);" +
            "  location.assign = function(u) { if(ok(u)) origAssign(u); };" +
            "  location.replace = function(u) { if(ok(u)) origReplace(u); };" +
            "  " +
            "  // Trap location.href changes" +
            "  var desc = Object.getOwnPropertyDescriptor(window, 'location');" +
            "  if (desc && desc.configurable) {" +
            "    var realLoc = window.location;" +
            "    Object.defineProperty(window, 'location', {" +
            "      get: function() { return realLoc; }," +
            "      set: function(u) { if(ok(u)) realLoc.href = u; }" +
            "    });" +
            "  }" +
            "  " +
            "  // Block ALL click events on non-allowed links" +
            "  function blockBadLinks(e) {" +
            "    var el = e.target;" +
            "    while (el && el !== document) {" +
            "      if (el.tagName === 'A' && el.href && !ok(el.href)) {" +
            "        e.preventDefault();" +
            "        e.stopPropagation();" +
            "        e.stopImmediatePropagation();" +
            "        return false;" +
            "      }" +
            "      // Also check for onclick handlers that might redirect" +
            "      if (el.onclick || el.getAttribute('onclick')) {" +
            "        var onclick = el.getAttribute('onclick') || '';" +
            "        if (onclick.includes('location') || onclick.includes('window.open') || onclick.includes('href')) {" +
            "          e.preventDefault();" +
            "          e.stopPropagation();" +
            "          return false;" +
            "        }" +
            "      }" +
            "      el = el.parentElement;" +
            "    }" +
            "  }" +
            "  " +
            "  // Capture phase for maximum priority" +
            "  ['click','mousedown','mouseup','touchstart','touchend','pointerdown','pointerup'].forEach(function(evt) {" +
            "    document.addEventListener(evt, blockBadLinks, {capture: true, passive: false});" +
            "  });" +
            "  " +
            "  // Block form submissions to ad sites" +
            "  document.addEventListener('submit', function(e) {" +
            "    var form = e.target;" +
            "    if (form.action && !ok(form.action)) {" +
            "      e.preventDefault();" +
            "      e.stopPropagation();" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Remove any invisible overlays that hijack clicks" +
            "  setInterval(function() {" +
            "    var overlays = document.querySelectorAll('div[style*=\"z-index: 99\"], div[style*=\"position: fixed\"], div[style*=\"position:fixed\"], iframe[style*=\"opacity: 0\"], iframe[style*=\"opacity:0\"]');" +
            "    overlays.forEach(function(el) {" +
            "      var style = window.getComputedStyle(el);" +
            "      if (parseFloat(style.opacity) < 0.1 || style.visibility === 'hidden') {" +
            "        el.remove();" +
            "      }" +
            "    });" +
            "    // Also remove suspicious iframes" +
            "    document.querySelectorAll('iframe').forEach(function(f) {" +
            "      if (f.src && !ok(f.src) && !f.src.startsWith('about:')) {" +
            "        f.remove();" +
            "      }" +
            "    });" +
            "  }, 1000);" +
            "  " +
            "  console.log('[ZUNIVERSE] Ad blocker v2 active');" +
            "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    /**
     * Re-inject blocker every 2 seconds to catch dynamically loaded content
     */
    private void startContinuousInjection(WebView webView) {
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        injectAdBlocker(webView);
                    }
                    mainHandler.postDelayed(this, 2000);
                } catch (Exception e) {
                    android.util.Log.e(TAG, "Injection error: " + e.getMessage());
                }
            }
        }, 2000);
    }
    
    // BLOCK ALL intents that would open a browser
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
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        Uri data = intent.getData();
        
        // Block ANY intent with a URL that would open browser
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            String scheme = data.getScheme();
            
            // Block ALL URL schemes that could open browser
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
                    pkg.contains("puffin") || pkg.contains("duckduckgo")) {
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
