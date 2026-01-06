package app.lovable.zuniverse;

import android.content.Context;
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
 * ULTIMATE AD BLOCKER
 * 
 * The problem: Ad scripts inject click handlers that, when triggered, 
 * cause the WebView to launch an Intent to open a browser. This happens
 * at a level below our Activity's startActivity() override.
 * 
 * The solution: Completely override the WebView's URL handling so that
 * ANY navigation to a non-whitelisted domain is blocked and absorbed.
 * We also create a custom Context wrapper that intercepts startActivity.
 */
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
    
    // Known ad/tracker patterns to block at resource level
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
    
    // Custom Context that blocks all startActivity calls
    private class AdBlockingContext extends android.content.ContextWrapper {
        public AdBlockingContext(Context base) {
            super(base);
        }
        
        @Override
        public void startActivity(Intent intent) {
            if (shouldBlockIntent(intent)) {
                android.util.Log.d(TAG, "CONTEXT: BLOCKED startActivity: " + intent.getData());
                blockedAdsCount++;
                return;
            }
            super.startActivity(intent);
        }
        
        @Override
        public void startActivity(Intent intent, Bundle options) {
            if (shouldBlockIntent(intent)) {
                android.util.Log.d(TAG, "CONTEXT: BLOCKED startActivity+options: " + intent.getData());
                blockedAdsCount++;
                return;
            }
            super.startActivity(intent, options);
        }
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        setupUltimateAdBlocking();
    }
    
    private void setupUltimateAdBlocking() {
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
            
            // ULTIMATE: Create a WebViewClient that handles EVERYTHING
            BridgeWebViewClient ultimateClient = new BridgeWebViewClient(bridge) {
                
                /**
                 * This is THE critical method. When WebView wants to load a URL,
                 * it calls this method. If we return true, WebView does nothing.
                 * We MUST return true for all ad/external URLs.
                 */
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    return handleUrlLoading(url);
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    return handleUrlLoading(url);
                }
                
                private boolean handleUrlLoading(String url) {
                    if (url == null) return false;
                    
                    String lowerUrl = url.toLowerCase();
                    
                    // Allow internal navigation (about:, javascript:, data:, blob:)
                    if (lowerUrl.startsWith("about:") || 
                        lowerUrl.startsWith("javascript:") || 
                        lowerUrl.startsWith("data:") || 
                        lowerUrl.startsWith("blob:")) {
                        return false;
                    }
                    
                    // BLOCK ALL non-HTTP schemes (intent://, market://, tel:, mailto:, etc.)
                    // These are what open the browser!
                    if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                        android.util.Log.d(TAG, "BLOCKED non-http scheme: " + truncateUrl(url));
                        blockedAdsCount++;
                        return true; // Block it!
                    }
                    
                    // Check if this is an allowed domain
                    if (isAllowedDomain(url)) {
                        return false; // Allow it
                    }
                    
                    // BLOCK everything else
                    android.util.Log.d(TAG, "BLOCKED external URL: " + truncateUrl(url));
                    blockedAdsCount++;
                    return true; // Block it!
                }
                
                // BLOCK AD RESOURCES at the network level
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block known ad patterns
                    if (AD_PATTERNS.matcher(url).matches()) {
                        android.util.Log.d(TAG, "BLOCKED ad resource: " + truncateUrl(url));
                        blockedAdsCount++;
                        return createEmptyResponse();
                    }
                    
                    return super.shouldInterceptRequest(view, request);
                }
            };
            
            webView.setWebViewClient(ultimateClient);
            
            // Block ALL new window creation - this is how popups work
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    // Get the URL that's trying to open
                    WebView tempWebView = new WebView(view.getContext());
                    tempWebView.setWebViewClient(new WebViewClient() {
                        @Override
                        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                            String url = request.getUrl().toString();
                            android.util.Log.d(TAG, "BLOCKED popup URL: " + truncateUrl(url));
                            blockedAdsCount++;
                            return true; // Block!
                        }
                        
                        @Override
                        public boolean shouldOverrideUrlLoading(WebView view, String url) {
                            android.util.Log.d(TAG, "BLOCKED popup URL: " + truncateUrl(url));
                            blockedAdsCount++;
                            return true; // Block!
                        }
                    });
                    
                    // This intercepts what the popup was trying to load
                    WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                    transport.setWebView(tempWebView);
                    resultMsg.sendToTarget();
                    
                    // Schedule removal of temp webview
                    mainHandler.postDelayed(() -> tempWebView.destroy(), 100);
                    
                    return true; // Pretend we handled it
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
            });
            
            // WebView Settings - disable features that ads abuse
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false); // Critical!
            settings.setGeolocationEnabled(false);
            
            // Disable third-party cookies
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
            
            // Safe browsing
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            // Inject JavaScript ad blocker
            injectAdBlocker(webView);
            startContinuousInjection(webView);
            
            android.util.Log.d(TAG, "ULTIMATE ad blocking initialized");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Error setting up ad blocking: " + e.getMessage());
        }
    }
    
    private WebResourceResponse createEmptyResponse() {
        return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream("".getBytes()));
    }
    
    private String truncateUrl(String url) {
        if (url == null) return "null";
        return url.length() > 80 ? url.substring(0, 80) + "..." : url;
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
    
    /**
     * JavaScript injection to block client-side redirects
     */
    private void injectAdBlocker(WebView webView) {
        String js = 
            "(function() {" +
            "  if (window.__ZU_ULTIMATE__) return;" +
            "  window.__ZU_ULTIMATE__ = true;" +
            "  " +
            "  var allowed = ['lovableproject.com','lovable.dev','localhost'," +
            "    'vidsrc.cc','vidsrc.me','vidsrc.pro','vidsrc.to','vidsrc.xyz','vidsrc.net','vidsrc.icu'," +
            "    'embed.su','embedsu.com','vidlink.pro','moviesapi.club'," +
            "    'vidbinge.dev','vidbinge.com','2embed.org','2embed.cc','2embed.skin'," +
            "    'multiembed.mov','smashy.stream','autoembed.cc','autoembed.co'," +
            "    'themoviedb.org','tmdb.org','image.tmdb.org'];" +
            "  " +
            "  function isOk(u) {" +
            "    if (!u) return true;" +
            "    try {" +
            "      var h = new URL(u, location.href).hostname.toLowerCase();" +
            "      return allowed.some(function(d) { return h === d || h.endsWith('.'+d); });" +
            "    } catch(e) { return true; }" +
            "  }" +
            "  " +
            "  // Completely kill window.open" +
            "  window.open = function(url) {" +
            "    console.log('[ZU] BLOCKED window.open:', url);" +
            "    return null;" +
            "  };" +
            "  Object.defineProperty(window, 'open', { value: function(){return null;}, writable: false, configurable: false });" +
            "  " +
            "  // Kill location methods" +
            "  var safeAssign = location.assign.bind(location);" +
            "  var safeReplace = location.replace.bind(location);" +
            "  location.assign = function(u) {" +
            "    if (isOk(u)) safeAssign(u);" +
            "    else console.log('[ZU] BLOCKED assign:', u);" +
            "  };" +
            "  location.replace = function(u) {" +
            "    if (isOk(u)) safeReplace(u);" +
            "    else console.log('[ZU] BLOCKED replace:', u);" +
            "  };" +
            "  " +
            "  // Kill location.href setter" +
            "  try {" +
            "    var desc = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');" +
            "    if (desc && desc.set) {" +
            "      var origSet = desc.set;" +
            "      Object.defineProperty(window.Location.prototype, 'href', {" +
            "        get: desc.get," +
            "        set: function(u) {" +
            "          if (isOk(u)) origSet.call(this, u);" +
            "          else console.log('[ZU] BLOCKED href set:', u);" +
            "        }," +
            "        configurable: false" +
            "      });" +
            "    }" +
            "  } catch(e) {}" +
            "  " +
            "  // Block clicks on external links" +
            "  document.addEventListener('click', function(e) {" +
            "    var el = e.target;" +
            "    while (el && el !== document) {" +
            "      if (el.tagName === 'A' && el.href && !isOk(el.href)) {" +
            "        e.preventDefault();" +
            "        e.stopPropagation();" +
            "        e.stopImmediatePropagation();" +
            "        console.log('[ZU] BLOCKED link click:', el.href);" +
            "        return false;" +
            "      }" +
            "      el = el.parentElement;" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Remove ad overlays periodically" +
            "  setInterval(function() {" +
            "    document.querySelectorAll('div, span, a, iframe').forEach(function(el) {" +
            "      try {" +
            "        var s = getComputedStyle(el);" +
            "        // Remove invisible overlays with high z-index" +
            "        if ((s.position === 'fixed' || s.position === 'absolute') &&" +
            "            (parseFloat(s.opacity) < 0.1 || s.visibility === 'hidden') &&" +
            "            parseInt(s.zIndex) > 1000) {" +
            "          el.remove();" +
            "        }" +
            "        // Remove fullscreen overlays" +
            "        if (s.position === 'fixed' &&" +
            "            el.offsetWidth >= window.innerWidth * 0.9 &&" +
            "            el.offsetHeight >= window.innerHeight * 0.9 &&" +
            "            parseInt(s.zIndex) > 100) {" +
            "          el.style.pointerEvents = 'none';" +
            "        }" +
            "      } catch(e) {}" +
            "    });" +
            "  }, 300);" +
            "  " +
            "  // Block beforeunload (prevents \"are you sure\" ads)" +
            "  window.onbeforeunload = null;" +
            "  Object.defineProperty(window, 'onbeforeunload', {" +
            "    get: function() { return null; }," +
            "    set: function() {}," +
            "    configurable: false" +
            "  });" +
            "  " +
            "  // Block alert/confirm/prompt" +
            "  window.alert = function() {};" +
            "  window.confirm = function() { return false; };" +
            "  window.prompt = function() { return null; };" +
            "  " +
            "  console.log('[ZU] ULTIMATE ad blocker active');" +
            "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    /**
     * Re-inject blocker to catch dynamically loaded content
     */
    private void startContinuousInjection(WebView webView) {
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        injectAdBlocker(webView);
                    }
                    mainHandler.postDelayed(this, 500); // Every 500ms
                } catch (Exception e) {
                    android.util.Log.e(TAG, "Injection error: " + e.getMessage());
                }
            }
        }, 500);
    }
    
    // ==================== BACKUP: INTENT BLOCKING ====================
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "ACTIVITY: BLOCKED startActivity");
            blockedAdsCount++;
            return;
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "ACTIVITY: BLOCKED startActivity+options");
            blockedAdsCount++;
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "ACTIVITY: BLOCKED startActivityForResult");
            blockedAdsCount++;
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "ACTIVITY: BLOCKED startActivityForResult+options");
            blockedAdsCount++;
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        Uri data = intent.getData();
        
        // Block ACTION_VIEW with URL data
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            String scheme = data.getScheme();
            
            // Block intent://, market://, tel://, mailto://, etc.
            if (!"http".equals(scheme) && !"https".equals(scheme)) {
                return true;
            }
            
            // Block external HTTP URLs
            String host = data.getHost();
            if (host != null && !isHostAllowed(host)) {
                return true;
            }
        }
        
        // Check if intent would open a browser
        if (wouldOpenBrowser(intent)) {
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
                if (pkg.contains("chrome") || pkg.contains("browser") || 
                    pkg.contains("firefox") || pkg.contains("opera") ||
                    pkg.contains("edge") || pkg.contains("samsung") ||
                    pkg.contains("brave") || pkg.contains("duckduckgo") ||
                    pkg.contains("vivaldi") || pkg.contains("kiwi")) {
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
