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
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.ByteArrayInputStream;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import app.lovable.zuniverse.plugins.AdBlockerPlugin;

/**
 * ULTIMATE NUCLEAR AD BLOCKER V4 - IFRAME KILLER
 * 
 * The previous versions failed because shouldOverrideUrlLoading is NOT called 
 * for navigations inside iframes. This version uses:
 * 
 * 1. Custom Context that blocks ALL startActivity calls at the base level
 * 2. WebView wrapped to use our blocking Context
 * 3. shouldInterceptRequest to block ad resources
 * 4. JavaScript injection with target="_top" forcing
 * 5. Complete popup and dialog blocking
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_V4";
    private static int blockedAdsCount = 0;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    
    // Domains allowed to load INSIDE the WebView only
    private static final Set<String> ALLOWED_DOMAINS = new HashSet<>(Arrays.asList(
        // Core app domains
        "lovableproject.com", "lovable.dev", "localhost", "127.0.0.1", "10.0.2.2",
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
        "superembed.stream",
        // TMDB for images only
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    // Block these patterns at network level
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
    
    /**
     * CRITICAL: Override attachBaseContext to wrap the Context
     * This ensures ALL startActivity calls from WebView go through our blocking Context
     */
    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(new IntentBlockingContext(newBase));
    }
    
    /**
     * Context wrapper that blocks ALL external app launches
     */
    private class IntentBlockingContext extends ContextWrapper {
        public IntentBlockingContext(Context base) {
            super(base);
        }
        
        @Override
        public void startActivity(Intent intent) {
            if (blockIntent(intent, "Context.startActivity")) return;
            super.startActivity(intent);
        }
        
        @Override
        public void startActivity(Intent intent, Bundle options) {
            if (blockIntent(intent, "Context.startActivity+Bundle")) return;
            super.startActivity(intent, options);
        }
        
        @Override
        public void startActivities(Intent[] intents) {
            android.util.Log.d(TAG, "★★★ BLOCKED Context.startActivities batch");
            blockedAdsCount++;
        }
        
        @Override
        public void startActivities(Intent[] intents, Bundle options) {
            android.util.Log.d(TAG, "★★★ BLOCKED Context.startActivities batch+Bundle");
            blockedAdsCount++;
        }
        
        private boolean blockIntent(Intent intent, String source) {
            if (intent == null) return false;
            
            String action = intent.getAction();
            Uri data = intent.getData();
            
            android.util.Log.d(TAG, ">>> INTENT INTERCEPTED [" + source + "]: action=" + action + ", data=" + data);
            
            // BLOCK ALL ACTION_VIEW - this is what browsers use
            if (Intent.ACTION_VIEW.equals(action)) {
                android.util.Log.d(TAG, "★★★ BLOCKED ACTION_VIEW: " + data);
                blockedAdsCount++;
                return true;
            }
            
            // Block any intent that would launch an external app
            try {
                PackageManager pm = getPackageManager();
                List<ResolveInfo> activities = pm.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
                String myPackage = getPackageName();
                
                for (ResolveInfo info : activities) {
                    if (info.activityInfo != null && 
                        !myPackage.equals(info.activityInfo.packageName)) {
                        android.util.Log.d(TAG, "★★★ BLOCKED EXTERNAL APP: " + info.activityInfo.packageName);
                        blockedAdsCount++;
                        return true;
                    }
                }
            } catch (Exception e) {
                // If we can't check, block to be safe
                android.util.Log.d(TAG, "★★★ BLOCKED (error checking): " + e.getMessage());
                blockedAdsCount++;
                return true;
            }
            
            return false;
        }
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
        android.util.Log.d(TAG, "=== NUCLEAR V4 - IFRAME KILLER INITIALIZED ===");
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        setupNuclearBlocking();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Re-inject blocker when resuming (in case we somehow left and came back)
        try {
            Bridge bridge = getBridge();
            if (bridge != null && bridge.getWebView() != null) {
                injectBlockerJS(bridge.getWebView());
            }
        } catch (Exception e) {}
    }
    
    private void setupNuclearBlocking() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) return;
            
            WebView webView = bridge.getWebView();
            if (webView == null) return;
            
            android.util.Log.d(TAG, "=== SETTING UP NUCLEAR BLOCKING ===");
            
            // Set up nuclear WebViewClient
            BridgeWebViewClient nuclearClient = new BridgeWebViewClient(bridge) {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    android.util.Log.d(TAG, "shouldOverrideUrlLoading: " + url);
                    return blockUrl(url, view);
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    android.util.Log.d(TAG, "shouldOverrideUrlLoading (legacy): " + url);
                    return blockUrl(url, view);
                }
                
                private boolean blockUrl(String url, WebView view) {
                    if (url == null) return true;
                    
                    String lowerUrl = url.toLowerCase();
                    
                    // Allow internal schemes
                    if (lowerUrl.startsWith("about:") || 
                        lowerUrl.startsWith("javascript:") || 
                        lowerUrl.startsWith("data:") ||
                        lowerUrl.startsWith("blob:")) {
                        return false;
                    }
                    
                    // BLOCK ALL non-HTTP schemes - these trigger external apps
                    if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                        android.util.Log.d(TAG, "★ BLOCKED SCHEME: " + url.substring(0, Math.min(80, url.length())));
                        blockedAdsCount++;
                        return true;
                    }
                    
                    // Only allow whitelisted domains
                    if (isDomainAllowed(url)) {
                        return false;
                    }
                    
                    // BLOCK everything else - DO NOT load it
                    android.util.Log.d(TAG, "★ BLOCKED URL: " + url.substring(0, Math.min(80, url.length())));
                    blockedAdsCount++;
                    return true;
                }
                
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    String lowerUrl = url.toLowerCase();
                    
                    // Block ad network resources at network level
                    if (AD_PATTERNS.matcher(url).matches()) {
                        android.util.Log.d(TAG, "★ BLOCKED AD RESOURCE: " + url.substring(0, Math.min(50, url.length())));
                        blockedAdsCount++;
                        return new WebResourceResponse("text/plain", "UTF-8", 
                            new ByteArrayInputStream("".getBytes()));
                    }
                    
                    // Block non-whitelisted domains from loading resources
                    // This catches iframe content that shouldOverrideUrlLoading misses
                    if ((lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://")) && 
                        !isDomainAllowed(url)) {
                        // Check if this is a navigation (HTML content)
                        String accept = request.getRequestHeaders().get("Accept");
                        if (accept != null && accept.contains("text/html")) {
                            android.util.Log.d(TAG, "★ BLOCKED HTML LOAD: " + url.substring(0, Math.min(50, url.length())));
                            blockedAdsCount++;
                            return new WebResourceResponse("text/html", "UTF-8", 
                                new ByteArrayInputStream("<html><body></body></html>".getBytes()));
                        }
                    }
                    
                    return super.shouldInterceptRequest(view, request);
                }
                
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    injectBlockerJS(view);
                }
                
                @Override
                public void onLoadResource(WebView view, String url) {
                    super.onLoadResource(view, url);
                    // Re-inject on every resource load to catch dynamic content
                    injectBlockerJS(view);
                }
            };
            
            webView.setWebViewClient(nuclearClient);
            
            // COMPLETELY DISABLE popups and dialogs
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d(TAG, "★ BLOCKED onCreateWindow (popup)");
                    blockedAdsCount++;
                    return false;
                }
                
                @Override
                public boolean onJsAlert(WebView view, String url, String message, android.webkit.JsResult result) {
                    android.util.Log.d(TAG, "★ BLOCKED JS Alert");
                    result.cancel();
                    return true;
                }
                
                @Override
                public boolean onJsConfirm(WebView view, String url, String message, android.webkit.JsResult result) {
                    android.util.Log.d(TAG, "★ BLOCKED JS Confirm");
                    result.cancel();
                    return true;
                }
                
                @Override
                public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, android.webkit.JsPromptResult result) {
                    android.util.Log.d(TAG, "★ BLOCKED JS Prompt");
                    result.cancel();
                    return true;
                }
                
                @Override
                public boolean onJsBeforeUnload(WebView view, String url, String message, android.webkit.JsResult result) {
                    result.confirm();
                    return true;
                }
            });
            
            // Maximum security WebView settings
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            settings.setGeolocationEnabled(false);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            settings.setAllowFileAccessFromFileURLs(false);
            settings.setAllowUniversalAccessFromFileURLs(false);
            
            // Disable third-party cookies
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
            
            // Enable safe browsing
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            // Inject blocker JS and start continuous injection
            injectBlockerJS(webView);
            startContinuousInjection(webView);
            
            android.util.Log.d(TAG, "=== NUCLEAR V4 ACTIVE ===");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Setup error: " + e.getMessage(), e);
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
    
    /**
     * AGGRESSIVE JavaScript injection that:
     * 1. Forces all links to target="_top" so they go through shouldOverrideUrlLoading
     * 2. Blocks window.open and location changes
     * 3. Removes invisible click-jacking overlays
     * 4. Intercepts and blocks external link clicks
     */
    private void injectBlockerJS(WebView webView) {
        String js = 
            "(function() {" +
            "  if (window.__NUCLEAR_V4__) return;" +
            "  window.__NUCLEAR_V4__ = true;" +
            "  console.log('[NUCLEAR V4] Injecting blocker');" +
            "  " +
            "  var allowed = [" +
            "    'lovableproject.com','lovable.dev','localhost','127.0.0.1','10.0.2.2'," +
            "    'vidsrc.cc','vidsrc.me','vidsrc.pro','vidsrc.to','vidsrc.xyz','vidsrc.net','vidsrc.icu'," +
            "    'embed.su','embedsu.com','vidlink.pro','moviesapi.club'," +
            "    'vidbinge.dev','vidbinge.com','2embed.org','2embed.cc','2embed.skin'," +
            "    'multiembed.mov','smashy.stream','player.smashy.stream'," +
            "    'autoembed.cc','autoembed.co','superembed.stream'," +
            "    'themoviedb.org','tmdb.org','image.tmdb.org'" +
            "  ];" +
            "  " +
            "  function isAllowed(url) {" +
            "    if (!url) return true;" +
            "    try {" +
            "      var u = new URL(url, location.href);" +
            "      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;" +
            "      var h = u.hostname.toLowerCase();" +
            "      return allowed.some(function(d) { return h === d || h.endsWith('.'+d); });" +
            "    } catch(e) { return false; }" +
            "  }" +
            "  " +
            "  // FORCE all links to target=_top - this makes them go through shouldOverrideUrlLoading" +
            "  function forceTopTarget() {" +
            "    var links = document.querySelectorAll('a[href]');" +
            "    links.forEach(function(a) {" +
            "      if (!isAllowed(a.href)) {" +
            "        a.removeAttribute('href');" +
            "        a.style.pointerEvents = 'none';" +
            "      } else {" +
            "        a.setAttribute('target', '_top');" +
            "      }" +
            "    });" +
            "  }" +
            "  forceTopTarget();" +
            "  " +
            "  // Kill window.open completely" +
            "  window.open = function() { console.log('[NUCLEAR V4] blocked window.open'); return null; };" +
            "  " +
            "  // Block location changes to non-allowed domains" +
            "  var origAssign = location.assign ? location.assign.bind(location) : function(){};" +
            "  var origReplace = location.replace ? location.replace.bind(location) : function(){};" +
            "  location.assign = function(u) { " +
            "    if(isAllowed(u)) origAssign(u); " +
            "    else console.log('[NUCLEAR V4] blocked location.assign:', u); " +
            "  };" +
            "  location.replace = function(u) { " +
            "    if(isAllowed(u)) origReplace(u); " +
            "    else console.log('[NUCLEAR V4] blocked location.replace:', u); " +
            "  };" +
            "  " +
            "  // Intercept href setter" +
            "  try {" +
            "    var locDesc = Object.getOwnPropertyDescriptor(window, 'location');" +
            "    if (locDesc && locDesc.set) {" +
            "      var origSet = locDesc.set;" +
            "      Object.defineProperty(window, 'location', {" +
            "        get: locDesc.get," +
            "        set: function(v) {" +
            "          if (isAllowed(v)) origSet.call(window, v);" +
            "          else console.log('[NUCLEAR V4] blocked location set:', v);" +
            "        }," +
            "        configurable: true" +
            "      });" +
            "    }" +
            "  } catch(e) {}" +
            "  " +
            "  // Block all click events on non-allowed links" +
            "  function blockClicks(e) {" +
            "    var el = e.target;" +
            "    var maxDepth = 10;" +
            "    while (el && maxDepth-- > 0) {" +
            "      if (el.tagName === 'A') {" +
            "        var href = el.getAttribute('href') || el.href;" +
            "        if (href && !isAllowed(href)) {" +
            "          console.log('[NUCLEAR V4] blocked click on:', href);" +
            "          e.preventDefault();" +
            "          e.stopPropagation();" +
            "          e.stopImmediatePropagation();" +
            "          return false;" +
            "        }" +
            "      }" +
            "      el = el.parentElement;" +
            "    }" +
            "  }" +
            "  " +
            "  // Capture phase to intercept before anything else" +
            "  ['click','mousedown','mouseup','touchstart','touchend','pointerdown','pointerup'].forEach(function(evt) {" +
            "    document.addEventListener(evt, blockClicks, true);" +
            "  });" +
            "  " +
            "  // Remove invisible overlays and suspicious elements" +
            "  function cleanOverlays() {" +
            "    document.querySelectorAll('*').forEach(function(el) {" +
            "      try {" +
            "        var s = getComputedStyle(el);" +
            "        var z = parseInt(s.zIndex) || 0;" +
            "        " +
            "        // Remove invisible high-z overlays (click hijackers)" +
            "        if ((s.position === 'fixed' || s.position === 'absolute') && z > 1000) {" +
            "          if (parseFloat(s.opacity) < 0.1 || " +
            "              el.offsetWidth < 5 || el.offsetHeight < 5 ||" +
            "              s.visibility === 'hidden') {" +
            "            el.remove();" +
            "            console.log('[NUCLEAR V4] removed overlay');" +
            "          }" +
            "        }" +
            "        " +
            "        // Check for full-screen overlays" +
            "        if (s.position === 'fixed' && " +
            "            el.offsetWidth >= window.innerWidth * 0.9 && " +
            "            el.offsetHeight >= window.innerHeight * 0.9 &&" +
            "            parseFloat(s.opacity) < 0.3) {" +
            "          el.remove();" +
            "          console.log('[NUCLEAR V4] removed fullscreen overlay');" +
            "        }" +
            "        " +
            "        // Remove iframes to non-allowed domains" +
            "        if (el.tagName === 'IFRAME') {" +
            "          var src = el.src || '';" +
            "          if (src && !isAllowed(src)) {" +
            "            el.remove();" +
            "            console.log('[NUCLEAR V4] removed iframe:', src.substring(0,50));" +
            "          }" +
            "        }" +
            "      } catch(e) {}" +
            "    });" +
            "    forceTopTarget();" +
            "  }" +
            "  " +
            "  // Run cleanup regularly" +
            "  cleanOverlays();" +
            "  setInterval(cleanOverlays, 500);" +
            "  " +
            "  // Watch for DOM changes and re-apply" +
            "  var observer = new MutationObserver(function() {" +
            "    forceTopTarget();" +
            "  });" +
            "  observer.observe(document.body || document.documentElement, {" +
            "    childList: true," +
            "    subtree: true" +
            "  });" +
            "  " +
            "  console.log('[NUCLEAR V4] Blocker active');" +
            "})();";
        
        webView.evaluateJavascript(js, null);
        
        // Also inject into all frames
        String frameJS = 
            "(function() {" +
            "  try {" +
            "    var frames = document.querySelectorAll('iframe');" +
            "    frames.forEach(function(f) {" +
            "      try {" +
            "        if (f.contentWindow) {" +
            "          f.contentWindow.open = function() { return null; };" +
            "        }" +
            "      } catch(e) {}" +
            "    });" +
            "  } catch(e) {}" +
            "})();";
        webView.evaluateJavascript(frameJS, null);
    }
    
    private void startContinuousInjection(WebView webView) {
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        // Reset flag and re-inject
                        webView.evaluateJavascript("(function(){window.__NUCLEAR_V4__=false;})();", null);
                        injectBlockerJS(webView);
                    }
                    mainHandler.postDelayed(this, 800);
                } catch (Exception e) {}
            }
        }, 800);
    }
    
    // ==================== ACTIVITY-LEVEL BLOCKING (BACKUP) ====================
    
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
        android.util.Log.d(TAG, "★★★ BLOCKED batch startActivities");
        blockedAdsCount++;
    }
    
    @Override
    public void startActivities(Intent[] intents, Bundle options) {
        android.util.Log.d(TAG, "★★★ BLOCKED batch startActivities");
        blockedAdsCount++;
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        // Block ALL ACTION_VIEW
        if (Intent.ACTION_VIEW.equals(intent.getAction())) {
            android.util.Log.d(TAG, "★★★ BLOCKED ACTION_VIEW at Activity level: " + intent.getData());
            blockedAdsCount++;
            return true;
        }
        
        // Block external apps
        try {
            List<ResolveInfo> activities = getPackageManager()
                .queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
            String myPackage = getPackageName();
            
            for (ResolveInfo info : activities) {
                if (info.activityInfo != null && !myPackage.equals(info.activityInfo.packageName)) {
                    android.util.Log.d(TAG, "★★★ BLOCKED EXTERNAL at Activity level: " + info.activityInfo.packageName);
                    blockedAdsCount++;
                    return true;
                }
            }
        } catch (Exception e) {
            blockedAdsCount++;
            return true;
        }
        
        return false;
    }
    
    public static int getBlockedAdsCount() {
        return blockedAdsCount;
    }
}
