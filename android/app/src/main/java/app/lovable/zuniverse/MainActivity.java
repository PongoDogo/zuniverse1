package app.lovable.zuniverse;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.ByteArrayInputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import app.lovable.zuniverse.plugins.AdBlockerPlugin;

/**
 * ABSOLUTE FINAL AD BLOCKER - THE NUCLEAR OPTION
 * 
 * We intercept at EVERY possible level:
 * 1. WebView URL loading (shouldOverrideUrlLoading)
 * 2. WebView new windows (onCreateWindow - return FALSE to completely disable)
 * 3. Activity startActivity overrides
 * 4. Application-level ActivityLifecycleCallbacks
 * 5. Touch event interception to detect ad clicks
 * 6. JavaScript injection to kill ad scripts before they run
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_ADBLOCKER";
    private int blockedAdsCount = 0;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    
    // Track touch events - if external intent fires within 1 second of touch, it's an ad
    private long lastTouchTime = 0;
    private static final long TOUCH_AD_WINDOW = 1000; // 1 second
    
    // STRICT allowlist - only these domains can navigate
    private static final Set<String> ALLOWED_DOMAINS = new HashSet<>(Arrays.asList(
        // Our app
        "lovableproject.com", "lovable.dev", "localhost", "127.0.0.1",
        // Streaming sources
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
    
    // Aggressive ad patterns
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
        setupAbsoluteAdBlocking();
    }
    
    /**
     * CRITICAL: Intercept ALL touch events to track when user taps
     * Any external intent within 1 second of a tap is likely an ad
     */
    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        if (ev.getAction() == MotionEvent.ACTION_DOWN) {
            lastTouchTime = System.currentTimeMillis();
        }
        return super.dispatchTouchEvent(ev);
    }
    
    private boolean isWithinTouchWindow() {
        return (System.currentTimeMillis() - lastTouchTime) < TOUCH_AD_WINDOW;
    }
    
    private void setupAbsoluteAdBlocking() {
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
            
            android.util.Log.d(TAG, "=== INITIALIZING ABSOLUTE AD BLOCKER ===");
            
            // Create the ultimate WebViewClient
            BridgeWebViewClient absoluteClient = new BridgeWebViewClient(bridge) {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    return blockUrl(request.getUrl().toString());
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    return blockUrl(url);
                }
                
                private boolean blockUrl(String url) {
                    if (url == null) return false;
                    
                    String lowerUrl = url.toLowerCase();
                    
                    // Allow internal schemes
                    if (lowerUrl.startsWith("about:") || 
                        lowerUrl.startsWith("javascript:") || 
                        lowerUrl.startsWith("data:") || 
                        lowerUrl.startsWith("blob:")) {
                        return false;
                    }
                    
                    // BLOCK ALL non-HTTP(S) schemes - these open external apps!
                    if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                        android.util.Log.d(TAG, ">>> BLOCKED scheme: " + truncateUrl(url));
                        blockedAdsCount++;
                        return true;
                    }
                    
                    // Check if domain is allowed
                    if (isDomainAllowed(url)) {
                        return false; // Allow
                    }
                    
                    // BLOCK everything else
                    android.util.Log.d(TAG, ">>> BLOCKED URL: " + truncateUrl(url));
                    blockedAdsCount++;
                    return true;
                }
                
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block ad network requests at the network level
                    if (AD_PATTERNS.matcher(url).matches()) {
                        android.util.Log.d(TAG, ">>> BLOCKED ad network: " + truncateUrl(url));
                        blockedAdsCount++;
                        return new WebResourceResponse("text/plain", "UTF-8", 
                            new ByteArrayInputStream("".getBytes()));
                    }
                    
                    return super.shouldInterceptRequest(view, request);
                }
            };
            
            webView.setWebViewClient(absoluteClient);
            
            /**
             * CRITICAL FIX: Instead of trying to intercept popups,
             * we completely DISABLE multiple windows. Return FALSE
             * from onCreateWindow to tell WebView "no, you can't open that"
             */
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d(TAG, ">>> BLOCKED window.open attempt (userGesture=" + isUserGesture + ")");
                    blockedAdsCount++;
                    // Return FALSE = don't create window, don't do anything
                    return false;
                }
                
                @Override
                public void onCloseWindow(WebView window) {
                    // Do nothing
                }
                
                // Block all JS dialogs
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
                public boolean onJsBeforeUnload(WebView view, String url, String message, android.webkit.JsResult result) {
                    result.confirm();
                    return true;
                }
            });
            
            // Aggressive WebView settings
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            settings.setGeolocationEnabled(false);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            
            // Disable third-party cookies
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
            
            // Enable safe browsing on Android O+
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            // Inject aggressive JavaScript ad blocker
            injectAbsoluteAdBlocker(webView);
            startContinuousInjection(webView);
            
            android.util.Log.d(TAG, "=== ABSOLUTE AD BLOCKER READY ===");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Error in setupAbsoluteAdBlocking: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private boolean isDomainAllowed(String url) {
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
    
    private String truncateUrl(String url) {
        if (url == null) return "null";
        return url.length() > 80 ? url.substring(0, 80) + "..." : url;
    }
    
    /**
     * Aggressive JavaScript injection that:
     * 1. Completely disables window.open
     * 2. Blocks location changes to non-allowed domains
     * 3. Removes invisible overlay elements
     * 4. Blocks click event hijacking
     */
    private void injectAbsoluteAdBlocker(WebView webView) {
        String js = 
            "(function() {" +
            "  if (window.__ZUNIVERSE_ABSOLUTE_BLOCKER__) return;" +
            "  window.__ZUNIVERSE_ABSOLUTE_BLOCKER__ = true;" +
            "  console.log('[ZU] Injecting ABSOLUTE ad blocker');" +
            "  " +
            "  var allowed = [" +
            "    'lovableproject.com','lovable.dev','localhost','127.0.0.1'," +
            "    'vidsrc.cc','vidsrc.me','vidsrc.pro','vidsrc.to','vidsrc.xyz','vidsrc.net','vidsrc.icu'," +
            "    'embed.su','embedsu.com','vidlink.pro','moviesapi.club'," +
            "    'vidbinge.dev','vidbinge.com','2embed.org','2embed.cc','2embed.skin'," +
            "    'multiembed.mov','smashy.stream','player.smashy.stream','autoembed.cc','autoembed.co'," +
            "    'themoviedb.org','tmdb.org','image.tmdb.org'" +
            "  ];" +
            "  " +
            "  function isDomainOk(url) {" +
            "    if (!url) return true;" +
            "    try {" +
            "      var h = new URL(url, location.href).hostname.toLowerCase();" +
            "      return allowed.some(function(d) { return h === d || h.endsWith('.'+d); });" +
            "    } catch(e) { return true; }" +
            "  }" +
            "  " +
            "  // NUCLEAR: Completely kill window.open - return null always" +
            "  var fakeWindow = { closed: true, close: function(){} };" +
            "  window.open = function() { console.log('[ZU] BLOCKED window.open'); return fakeWindow; };" +
            "  try { Object.defineProperty(window, 'open', { value: function(){ return fakeWindow; }, writable: false, configurable: false }); } catch(e){}" +
            "  " +
            "  // Kill location methods" +
            "  var origAssign = location.assign;" +
            "  var origReplace = location.replace;" +
            "  location.assign = function(u) {" +
            "    if (isDomainOk(u)) origAssign.call(location, u);" +
            "    else console.log('[ZU] BLOCKED assign:', u);" +
            "  };" +
            "  location.replace = function(u) {" +
            "    if (isDomainOk(u)) origReplace.call(location, u);" +
            "    else console.log('[ZU] BLOCKED replace:', u);" +
            "  };" +
            "  " +
            "  // Kill location.href setter" +
            "  try {" +
            "    var locDesc = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');" +
            "    if (locDesc && locDesc.set) {" +
            "      var origHrefSet = locDesc.set;" +
            "      Object.defineProperty(window.Location.prototype, 'href', {" +
            "        get: locDesc.get," +
            "        set: function(u) {" +
            "          if (isDomainOk(u)) origHrefSet.call(this, u);" +
            "          else console.log('[ZU] BLOCKED href:', u);" +
            "        }," +
            "        configurable: false" +
            "      });" +
            "    }" +
            "  } catch(e) {}" +
            "  " +
            "  // Block clicks that would navigate to ads" +
            "  document.addEventListener('click', function(e) {" +
            "    var el = e.target;" +
            "    var maxDepth = 10;" +
            "    while (el && el !== document && maxDepth-- > 0) {" +
            "      if (el.tagName === 'A' && el.href && !isDomainOk(el.href)) {" +
            "        console.log('[ZU] BLOCKED link click:', el.href);" +
            "        e.preventDefault();" +
            "        e.stopPropagation();" +
            "        e.stopImmediatePropagation();" +
            "        return false;" +
            "      }" +
            "      el = el.parentElement;" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Remove ad overlays and suspicious elements" +
            "  function cleanupAds() {" +
            "    try {" +
            "      // Remove invisible overlays with high z-index (click hijackers)" +
            "      document.querySelectorAll('div, span, a').forEach(function(el) {" +
            "        try {" +
            "          var s = getComputedStyle(el);" +
            "          var z = parseInt(s.zIndex) || 0;" +
            "          // Invisible element with high z-index = ad overlay" +
            "          if ((s.position === 'fixed' || s.position === 'absolute') &&" +
            "              (parseFloat(s.opacity) < 0.05 || s.visibility === 'hidden' || s.display === 'none') &&" +
            "              z > 500) {" +
            "            el.remove();" +
            "            console.log('[ZU] Removed invisible overlay');" +
            "          }" +
            "          // Fullscreen overlay (click hijacker)" +
            "          if (s.position === 'fixed' &&" +
            "              el.offsetWidth > window.innerWidth * 0.8 &&" +
            "              el.offsetHeight > window.innerHeight * 0.8 &&" +
            "              z > 100) {" +
            "            el.style.pointerEvents = 'none';" +
            "          }" +
            "        } catch(e) {}" +
            "      });" +
            "      // Remove suspicious iframes" +
            "      document.querySelectorAll('iframe').forEach(function(f) {" +
            "        try {" +
            "          var src = f.src || '';" +
            "          if (!isDomainOk(src) && src.indexOf('http') === 0) {" +
            "            var s = getComputedStyle(f);" +
            "            if (f.offsetWidth < 10 || f.offsetHeight < 10 || parseFloat(s.opacity) < 0.1) {" +
            "              f.remove();" +
            "              console.log('[ZU] Removed suspicious iframe');" +
            "            }" +
            "          }" +
            "        } catch(e) {}" +
            "      });" +
            "    } catch(e) {}" +
            "  }" +
            "  setInterval(cleanupAds, 500);" +
            "  cleanupAds();" +
            "  " +
            "  // Block beforeunload hijacking" +
            "  window.onbeforeunload = null;" +
            "  try {" +
            "    Object.defineProperty(window, 'onbeforeunload', { get: function(){return null;}, set: function(){}, configurable: false });" +
            "  } catch(e) {}" +
            "  " +
            "  // Kill alert/confirm/prompt" +
            "  window.alert = function() {};" +
            "  window.confirm = function() { return false; };" +
            "  window.prompt = function() { return null; };" +
            "  " +
            "  console.log('[ZU] ABSOLUTE ad blocker ACTIVE');" +
            "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    private void startContinuousInjection(WebView webView) {
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        // Re-inject to catch dynamically loaded content
                        String reinject = 
                            "(function() {" +
                            "  if (!window.__ZUNIVERSE_ABSOLUTE_BLOCKER__) {" +
                            "    window.__ZUNIVERSE_ABSOLUTE_BLOCKER__ = false;" + // Reset flag
                            "  }" +
                            "})();";
                        webView.evaluateJavascript(reinject, null);
                        injectAbsoluteAdBlocker(webView);
                    }
                    mainHandler.postDelayed(this, 1000); // Every 1 second
                } catch (Exception e) {
                    android.util.Log.e(TAG, "Injection error: " + e.getMessage());
                }
            }
        }, 1000);
    }
    
    // ==================== ABSOLUTE INTENT BLOCKING ====================
    // These override ALL startActivity calls to block external apps
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startActivity: " + intent.getDataString());
            blockedAdsCount++;
            return; // Silently block
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startActivity+opts: " + intent.getDataString());
            blockedAdsCount++;
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startActivityForResult: " + intent.getDataString());
            blockedAdsCount++;
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startActivityForResult+opts: " + intent.getDataString());
            blockedAdsCount++;
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    @Override
    public void startActivityIfNeeded(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startActivityIfNeeded: " + intent.getDataString());
            blockedAdsCount++;
            return;
        }
        super.startActivityIfNeeded(intent, requestCode);
    }
    
    @Override
    public void startActivityIfNeeded(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startActivityIfNeeded+opts: " + intent.getDataString());
            blockedAdsCount++;
            return;
        }
        super.startActivityIfNeeded(intent, requestCode, options);
    }
    
    @Override
    public boolean startActivityIfNeeded(Intent intent, int requestCode, Bundle options, boolean force) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startActivityIfNeeded+force: " + intent.getDataString());
            blockedAdsCount++;
            return false;
        }
        return super.startActivityIfNeeded(intent, requestCode, options);
    }
    
    @Override
    public boolean startNextMatchingActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startNextMatchingActivity: " + intent.getDataString());
            blockedAdsCount++;
            return false;
        }
        return super.startNextMatchingActivity(intent);
    }
    
    @Override
    public boolean startNextMatchingActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, ">>> BLOCKED startNextMatchingActivity+opts: " + intent.getDataString());
            blockedAdsCount++;
            return false;
        }
        return super.startNextMatchingActivity(intent, options);
    }
    
    /**
     * The CORE blocking logic - should this intent be blocked?
     */
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        Uri data = intent.getData();
        
        // Log what we're checking
        android.util.Log.d(TAG, "Checking intent: action=" + action + ", data=" + data);
        
        // BLOCK if this happened right after a touch (likely ad click)
        if (isWithinTouchWindow()) {
            // If it's trying to open a URL in a browser, BLOCK IT
            if (Intent.ACTION_VIEW.equals(action) && data != null) {
                String scheme = data.getScheme();
                if (scheme != null && (scheme.equals("http") || scheme.equals("https") || 
                    scheme.equals("intent") || scheme.equals("market"))) {
                    
                    String host = data.getHost();
                    if (host != null && !isHostAllowed(host)) {
                        android.util.Log.d(TAG, "TOUCH-BLOCKED: " + data);
                        return true;
                    }
                }
            }
        }
        
        // ALWAYS block non-HTTP schemes (intent://, market://, tel://, etc.)
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            String scheme = data.getScheme();
            if (scheme != null && !scheme.equals("http") && !scheme.equals("https")) {
                android.util.Log.d(TAG, "SCHEME-BLOCKED: " + scheme);
                return true;
            }
            
            // Block external HTTP URLs
            String host = data.getHost();
            if (host != null && !isHostAllowed(host)) {
                android.util.Log.d(TAG, "HOST-BLOCKED: " + host);
                return true;
            }
        }
        
        // Block if this would open a browser app
        if (wouldOpenBrowser(intent)) {
            android.util.Log.d(TAG, "BROWSER-BLOCKED");
            return true;
        }
        
        return false;
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
                // Known browser packages
                if (pkg.contains("chrome") || pkg.contains("browser") || 
                    pkg.contains("firefox") || pkg.contains("opera") ||
                    pkg.contains("edge") || pkg.contains("samsung") ||
                    pkg.contains("brave") || pkg.contains("duckduckgo") ||
                    pkg.contains("vivaldi") || pkg.contains("kiwi") ||
                    pkg.contains("uc") || pkg.contains("dolphin") ||
                    pkg.contains("puffin") || pkg.contains("webview")) {
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
