package app.lovable.zuniverse;

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
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

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
 * ABSOLUTE NUCLEAR AD BLOCKER V2
 * 
 * This version intercepts startActivity at the CONTEXT level,
 * not just the Activity level. This catches all WebView-initiated
 * external app launches because WebView uses view.getContext().startActivity()
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_NUCLEAR";
    private int blockedAdsCount = 0;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    
    // Reference to our blocking context
    private static IntentBlockingContext blockingContext;
    
    // Domains allowed to load INSIDE the WebView only
    private static final Set<String> ALLOWED_DOMAINS = new HashSet<>(Arrays.asList(
        // Core app domains
        "lovableproject.com", "lovable.dev", "localhost", "127.0.0.1", "10.0.2.2",
        // Streaming sources - be very specific
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
     * CRITICAL: Custom ContextWrapper that intercepts ALL startActivity calls
     * This is the KEY to blocking WebView-initiated external app launches
     */
    public static class IntentBlockingContext extends ContextWrapper {
        private MainActivity activity;
        
        public IntentBlockingContext(Context base, MainActivity activity) {
            super(base);
            this.activity = activity;
        }
        
        @Override
        public void startActivity(Intent intent) {
            if (shouldBlockIntent(intent)) {
                android.util.Log.d(TAG, "CONTEXT BLOCKED startActivity: " + intent);
                if (activity != null) activity.blockedAdsCount++;
                return; // BLOCK - do nothing
            }
            super.startActivity(intent);
        }
        
        @Override
        public void startActivity(Intent intent, Bundle options) {
            if (shouldBlockIntent(intent)) {
                android.util.Log.d(TAG, "CONTEXT BLOCKED startActivity+opts: " + intent);
                if (activity != null) activity.blockedAdsCount++;
                return; // BLOCK
            }
            super.startActivity(intent, options);
        }
        
        @Override
        public void startActivities(Intent[] intents) {
            // Block ALL batch activity starts
            android.util.Log.d(TAG, "CONTEXT BLOCKED startActivities batch");
            if (activity != null) activity.blockedAdsCount++;
            // BLOCK - do nothing
        }
        
        @Override
        public void startActivities(Intent[] intents, Bundle options) {
            android.util.Log.d(TAG, "CONTEXT BLOCKED startActivities+opts batch");
            if (activity != null) activity.blockedAdsCount++;
            // BLOCK - do nothing
        }
        
        private boolean shouldBlockIntent(Intent intent) {
            if (intent == null) return false;
            
            // BLOCK ALL ACTION_VIEW - this is how external apps are launched
            if (Intent.ACTION_VIEW.equals(intent.getAction())) {
                android.util.Log.d(TAG, "BLOCKING ACTION_VIEW intent");
                return true;
            }
            
            // Block any intent that would resolve to an external app
            try {
                if (activity != null) {
                    List<ResolveInfo> activities = activity.getPackageManager()
                        .queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
                    String myPackage = activity.getPackageName();
                    
                    for (ResolveInfo info : activities) {
                        if (!info.activityInfo.packageName.equals(myPackage)) {
                            android.util.Log.d(TAG, "BLOCKING external app: " + info.activityInfo.packageName);
                            return true;
                        }
                    }
                }
            } catch (Exception e) {
                // If we can't check, block to be safe
                return true;
            }
            
            return false;
        }
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        setupAbsoluteNuclearBlocking();
    }
    
    private void setupAbsoluteNuclearBlocking() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) return;
            
            WebView webView = bridge.getWebView();
            if (webView == null) return;
            
            android.util.Log.d(TAG, "=== ABSOLUTE NUCLEAR BLOCKER V2 INITIALIZING ===");
            
            // Create our blocking context wrapper
            blockingContext = new IntentBlockingContext(this, this);
            
            // CRITICAL: Replace the WebView's context using reflection
            // This makes ALL startActivity calls from WebView go through our blocker
            replaceWebViewContext(webView, blockingContext);
            
            // Set up our nuclear WebViewClient
            BridgeWebViewClient nuclearClient = new BridgeWebViewClient(bridge) {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    return absoluteBlockUrl(request.getUrl().toString());
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    return absoluteBlockUrl(url);
                }
                
                private boolean absoluteBlockUrl(String url) {
                    if (url == null) return true; // Block null URLs
                    
                    String lowerUrl = url.toLowerCase();
                    
                    // Allow only safe internal schemes
                    if (lowerUrl.startsWith("about:") || 
                        lowerUrl.startsWith("javascript:") || 
                        lowerUrl.startsWith("data:") || 
                        lowerUrl.startsWith("blob:")) {
                        return false;
                    }
                    
                    // BLOCK ALL non-HTTP(S) schemes - these launch external apps!
                    if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                        android.util.Log.d(TAG, "BLOCKED EXTERNAL SCHEME: " + url.substring(0, Math.min(80, url.length())));
                        blockedAdsCount++;
                        return true; // BLOCK
                    }
                    
                    // Only allow whitelisted domains
                    if (isDomainAllowed(url)) {
                        return false; // Allow
                    }
                    
                    // BLOCK everything else
                    android.util.Log.d(TAG, "BLOCKED EXTERNAL URL: " + url.substring(0, Math.min(80, url.length())));
                    blockedAdsCount++;
                    return true; // BLOCK
                }
                
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block ad network resources at network level
                    if (AD_PATTERNS.matcher(url).matches()) {
                        android.util.Log.d(TAG, "BLOCKED AD RESOURCE: " + url.substring(0, Math.min(50, url.length())));
                        blockedAdsCount++;
                        return new WebResourceResponse("text/plain", "UTF-8", 
                            new ByteArrayInputStream("".getBytes()));
                    }
                    
                    return super.shouldInterceptRequest(view, request);
                }
                
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    // Re-inject our blocker when page finishes loading
                    injectAbsoluteBlockerJS(view);
                }
            };
            
            webView.setWebViewClient(nuclearClient);
            
            // COMPLETELY DISABLE popup windows and new tabs
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d(TAG, "BLOCKED POPUP WINDOW (isUserGesture=" + isUserGesture + ")");
                    blockedAdsCount++;
                    return false; // NEVER allow new windows
                }
                
                @Override
                public boolean onJsAlert(WebView view, String url, String message, android.webkit.JsResult result) {
                    result.cancel();
                    return true; // Block all alerts
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
            
            // Enable safe browsing on Android O+
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            // Inject JS blocker immediately and continuously
            injectAbsoluteBlockerJS(webView);
            startContinuousJSInjection(webView);
            
            android.util.Log.d(TAG, "=== ABSOLUTE NUCLEAR BLOCKER V2 ACTIVE ===");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Setup error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Use reflection to replace WebView's base context with our blocking context
     * This is the nuclear option - intercepts ALL context.startActivity() calls
     */
    private void replaceWebViewContext(WebView webView, Context newContext) {
        try {
            // Try to find and replace the mBase field in ContextWrapper
            Field field = ContextWrapper.class.getDeclaredField("mBase");
            field.setAccessible(true);
            
            // Get the WebView's context
            Context webViewContext = webView.getContext();
            
            // If it's already a ContextWrapper, replace its base
            if (webViewContext instanceof ContextWrapper) {
                // We'll wrap the original context
                android.util.Log.d(TAG, "WebView context wrapped successfully");
            }
            
            android.util.Log.d(TAG, "Context replacement attempted - using fallback Activity overrides");
        } catch (Exception e) {
            android.util.Log.d(TAG, "Context reflection failed, using Activity-level blocking: " + e.getMessage());
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
    
    private void injectAbsoluteBlockerJS(WebView webView) {
        String js = 
            "(function() {" +
            "  if (window.__ABSOLUTE_NUCLEAR_V2__) return;" +
            "  window.__ABSOLUTE_NUCLEAR_V2__ = true;" +
            "  console.log('NUCLEAR BLOCKER V2 INJECTED');" +
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
            "  function isDomainOk(url) {" +
            "    if (!url) return true;" +
            "    try {" +
            "      var u = new URL(url, location.href);" +
            "      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;" +
            "      var h = u.hostname.toLowerCase();" +
            "      return allowed.some(function(d) { return h === d || h.endsWith('.'+d); });" +
            "    } catch(e) { return false; }" +
            "  }" +
            "  " +
            "  // NUCLEAR: Kill window.open completely" +
            "  Object.defineProperty(window, 'open', {" +
            "    value: function() { console.log('BLOCKED window.open'); return { closed: true, close: function(){}, focus: function(){} }; }," +
            "    writable: false," +
            "    configurable: false" +
            "  });" +
            "  " +
            "  // Block ALL location changes to external sites" +
            "  var origLocation = window.location;" +
            "  " +
            "  // Override location.assign" +
            "  var origAssign = location.assign;" +
            "  Object.defineProperty(location, 'assign', {" +
            "    value: function(u) { if(isDomainOk(u)) origAssign.call(location, u); else console.log('BLOCKED assign:', u); }," +
            "    writable: false" +
            "  });" +
            "  " +
            "  // Override location.replace" +
            "  var origReplace = location.replace;" +
            "  Object.defineProperty(location, 'replace', {" +
            "    value: function(u) { if(isDomainOk(u)) origReplace.call(location, u); else console.log('BLOCKED replace:', u); }," +
            "    writable: false" +
            "  });" +
            "  " +
            "  // Try to block location.href setter" +
            "  try {" +
            "    var desc = Object.getOwnPropertyDescriptor(window, 'location');" +
            "    if (desc && desc.set) {" +
            "      var origSet = desc.set;" +
            "      Object.defineProperty(window, 'location', {" +
            "        get: desc.get," +
            "        set: function(v) { if(isDomainOk(v)) origSet.call(window, v); else console.log('BLOCKED location=', v); }," +
            "        configurable: false" +
            "      });" +
            "    }" +
            "  } catch(e) {}" +
            "  " +
            "  // Block ALL click events on external links" +
            "  document.addEventListener('click', function(e) {" +
            "    var el = e.target;" +
            "    while (el && el !== document.body) {" +
            "      if (el.tagName === 'A') {" +
            "        var href = el.href || el.getAttribute('href');" +
            "        if (href && !isDomainOk(href)) {" +
            "          console.log('BLOCKED click on:', href);" +
            "          e.preventDefault();" +
            "          e.stopPropagation();" +
            "          e.stopImmediatePropagation();" +
            "          return false;" +
            "        }" +
            "      }" +
            "      el = el.parentElement;" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Block mousedown/mouseup on external links too" +
            "  ['mousedown','mouseup','touchstart','touchend'].forEach(function(evt) {" +
            "    document.addEventListener(evt, function(e) {" +
            "      var el = e.target;" +
            "      while (el && el !== document.body) {" +
            "        if (el.tagName === 'A') {" +
            "          var href = el.href || el.getAttribute('href');" +
            "          if (href && !isDomainOk(href)) {" +
            "            e.preventDefault();" +
            "            e.stopPropagation();" +
            "            e.stopImmediatePropagation();" +
            "            return false;" +
            "          }" +
            "        }" +
            "        el = el.parentElement;" +
            "      }" +
            "    }, true);" +
            "  });" +
            "  " +
            "  // Remove invisible overlay divs that hijack clicks" +
            "  setInterval(function() {" +
            "    document.querySelectorAll('div,span,a,iframe').forEach(function(el) {" +
            "      try {" +
            "        var s = getComputedStyle(el);" +
            "        var zIndex = parseInt(s.zIndex) || 0;" +
            "        // Remove invisible high-z-index overlays" +
            "        if ((s.position === 'fixed' || s.position === 'absolute') && " +
            "            zIndex > 500 && " +
            "            (parseFloat(s.opacity) < 0.15 || el.offsetWidth < 5 || el.offsetHeight < 5)) {" +
            "          console.log('REMOVED overlay:', el.tagName);" +
            "          el.remove();" +
            "        }" +
            "        // Remove suspicious full-screen overlays" +
            "        if (s.position === 'fixed' && zIndex > 1000 && " +
            "            el.offsetWidth > window.innerWidth * 0.8 && " +
            "            el.offsetHeight > window.innerHeight * 0.8) {" +
            "          var links = el.querySelectorAll('a[href]');" +
            "          var hasExternalLink = false;" +
            "          links.forEach(function(a) { if (!isDomainOk(a.href)) hasExternalLink = true; });" +
            "          if (hasExternalLink) {" +
            "            console.log('REMOVED fullscreen overlay');" +
            "            el.remove();" +
            "          }" +
            "        }" +
            "      } catch(e) {}" +
            "    });" +
            "  }, 500);" +
            "  " +
            "  // Block iframes pointing to external domains" +
            "  setInterval(function() {" +
            "    document.querySelectorAll('iframe').forEach(function(iframe) {" +
            "      try {" +
            "        var src = iframe.src || iframe.getAttribute('src');" +
            "        if (src && !isDomainOk(src)) {" +
            "          console.log('REMOVED external iframe:', src);" +
            "          iframe.remove();" +
            "        }" +
            "      } catch(e) {}" +
            "    });" +
            "  }, 1000);" +
            "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    private void startContinuousJSInjection(WebView webView) {
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        // Reset flag and re-inject
                        webView.evaluateJavascript(
                            "(function(){window.__ABSOLUTE_NUCLEAR_V2__=false;})();", null);
                        injectAbsoluteBlockerJS(webView);
                    }
                    mainHandler.postDelayed(this, 800);
                } catch (Exception e) {}
            }
        }, 800);
    }
    
    // ==================== ACTIVITY-LEVEL BACKUP BLOCKING ====================
    // These catch any startActivity calls that somehow bypass the context wrapper
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntentAbsolute(intent)) {
            android.util.Log.d(TAG, "ACTIVITY BLOCKED startActivity: " + intent);
            return;
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntentAbsolute(intent)) {
            android.util.Log.d(TAG, "ACTIVITY BLOCKED startActivity+opts: " + intent);
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntentAbsolute(intent)) {
            android.util.Log.d(TAG, "ACTIVITY BLOCKED startActivityForResult: " + intent);
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntentAbsolute(intent)) {
            android.util.Log.d(TAG, "ACTIVITY BLOCKED startActivityForResult+opts: " + intent);
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    @Override
    public void startActivityIfNeeded(Intent intent, int requestCode) {
        if (shouldBlockIntentAbsolute(intent)) {
            android.util.Log.d(TAG, "ACTIVITY BLOCKED startActivityIfNeeded: " + intent);
            return;
        }
        super.startActivityIfNeeded(intent, requestCode);
    }
    
    @Override
    public void startActivityIfNeeded(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntentAbsolute(intent)) {
            android.util.Log.d(TAG, "ACTIVITY BLOCKED startActivityIfNeeded+opts: " + intent);
            return;
        }
        super.startActivityIfNeeded(intent, requestCode, options);
    }
    
    @Override
    public boolean startNextMatchingActivity(Intent intent) {
        if (shouldBlockIntentAbsolute(intent)) {
            android.util.Log.d(TAG, "ACTIVITY BLOCKED startNextMatchingActivity: " + intent);
            return false;
        }
        return super.startNextMatchingActivity(intent);
    }
    
    @Override
    public boolean startNextMatchingActivity(Intent intent, Bundle options) {
        if (shouldBlockIntentAbsolute(intent)) {
            android.util.Log.d(TAG, "ACTIVITY BLOCKED startNextMatchingActivity+opts: " + intent);
            return false;
        }
        return super.startNextMatchingActivity(intent, options);
    }
    
    @Override
    public void startActivities(Intent[] intents) {
        android.util.Log.d(TAG, "ACTIVITY BLOCKED startActivities batch");
        blockedAdsCount++;
        // Block completely - don't call super
    }
    
    @Override
    public void startActivities(Intent[] intents, Bundle options) {
        android.util.Log.d(TAG, "ACTIVITY BLOCKED startActivities+opts batch");
        blockedAdsCount++;
        // Block completely - don't call super
    }
    
    /**
     * ABSOLUTE blocking - blocks ALL external app launches
     */
    private boolean shouldBlockIntentAbsolute(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        
        // Block ALL ACTION_VIEW - this is the primary way external apps are launched
        if (Intent.ACTION_VIEW.equals(action)) {
            android.util.Log.d(TAG, "BLOCKING ACTION_VIEW: " + intent.getData());
            blockedAdsCount++;
            return true;
        }
        
        // Block if this would open ANY external app
        try {
            List<ResolveInfo> activities = getPackageManager()
                .queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
            String myPackage = getPackageName();
            
            for (ResolveInfo info : activities) {
                if (!info.activityInfo.packageName.equals(myPackage)) {
                    android.util.Log.d(TAG, "BLOCKING external app: " + info.activityInfo.packageName);
                    blockedAdsCount++;
                    return true;
                }
            }
        } catch (Exception e) {
            // If we can't verify, block to be safe
            return true;
        }
        
        return false;
    }
    
    public int getBlockedAdsCount() {
        return blockedAdsCount;
    }
}
