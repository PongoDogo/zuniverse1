package app.lovable.zuniverse;

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

/**
 * NUCLEAR AD BLOCKER - COMPLETELY BLOCKS ALL EXTERNAL APP LAUNCHES
 * 
 * This version BLOCKS ALL external intents unconditionally.
 * The app CANNOT open any other app including browsers.
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_ADBLOCKER";
    private int blockedAdsCount = 0;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    
    // Domains allowed to load INSIDE the WebView (not open externally)
    private static final Set<String> ALLOWED_DOMAINS = new HashSet<>(Arrays.asList(
        "lovableproject.com", "lovable.dev", "localhost", "127.0.0.1",
        "vidsrc.cc", "vidsrc.me", "vidsrc.pro", "vidsrc.to", "vidsrc.xyz", "vidsrc.net", "vidsrc.icu",
        "embed.su", "embedsu.com",
        "vidlink.pro",
        "moviesapi.club",
        "vidbinge.dev", "vidbinge.com",
        "2embed.org", "2embed.cc", "2embed.skin",
        "multiembed.mov",
        "smashy.stream", "player.smashy.stream",
        "autoembed.cc", "autoembed.co",
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    // Ad patterns to block at network level
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
        setupNuclearAdBlocking();
    }
    
    private void setupNuclearAdBlocking() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) return;
            
            WebView webView = bridge.getWebView();
            if (webView == null) return;
            
            android.util.Log.d(TAG, "=== NUCLEAR AD BLOCKER INITIALIZING ===");
            
            // Create WebViewClient that blocks external navigation
            BridgeWebViewClient nuclearClient = new BridgeWebViewClient(bridge) {
                
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
                    
                    // Allow internal browser schemes
                    if (lowerUrl.startsWith("about:") || 
                        lowerUrl.startsWith("javascript:") || 
                        lowerUrl.startsWith("data:") || 
                        lowerUrl.startsWith("blob:")) {
                        return false;
                    }
                    
                    // BLOCK ALL non-HTTP schemes immediately - these open external apps!
                    if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
                        android.util.Log.d(TAG, "BLOCKED SCHEME: " + url.substring(0, Math.min(50, url.length())));
                        blockedAdsCount++;
                        return true; // BLOCK
                    }
                    
                    // Check if domain is in our allowed list
                    if (isDomainAllowed(url)) {
                        return false; // Allow navigation
                    }
                    
                    // BLOCK all other URLs
                    android.util.Log.d(TAG, "BLOCKED URL: " + url.substring(0, Math.min(50, url.length())));
                    blockedAdsCount++;
                    return true; // BLOCK
                }
                
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block ad network resources
                    if (AD_PATTERNS.matcher(url).matches()) {
                        blockedAdsCount++;
                        return new WebResourceResponse("text/plain", "UTF-8", 
                            new ByteArrayInputStream("".getBytes()));
                    }
                    
                    return super.shouldInterceptRequest(view, request);
                }
            };
            
            webView.setWebViewClient(nuclearClient);
            
            // COMPLETELY DISABLE popup windows
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d(TAG, "BLOCKED POPUP");
                    blockedAdsCount++;
                    return false; // NEVER create new windows
                }
                
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
            
            // Lock down WebView settings
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            settings.setGeolocationEnabled(false);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            
            // Disable third-party cookies
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
            
            // Enable safe browsing
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            // Start continuous JS injection
            injectAdBlockerJS(webView);
            startContinuousInjection(webView);
            
            android.util.Log.d(TAG, "=== NUCLEAR AD BLOCKER ACTIVE ===");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Error: " + e.getMessage());
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
    
    private void injectAdBlockerJS(WebView webView) {
        String js = 
            "(function() {" +
            "  if (window.__NUCLEAR_BLOCKER__) return;" +
            "  window.__NUCLEAR_BLOCKER__ = true;" +
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
            "  // Kill window.open completely" +
            "  window.open = function() { return { closed: true, close: function(){} }; };" +
            "  " +
            "  // Block location changes" +
            "  var origAssign = location.assign.bind(location);" +
            "  var origReplace = location.replace.bind(location);" +
            "  location.assign = function(u) { if(isDomainOk(u)) origAssign(u); };" +
            "  location.replace = function(u) { if(isDomainOk(u)) origReplace(u); };" +
            "  " +
            "  // Block link clicks to external sites" +
            "  document.addEventListener('click', function(e) {" +
            "    var el = e.target;" +
            "    while (el && el !== document) {" +
            "      if (el.tagName === 'A' && el.href && !isDomainOk(el.href)) {" +
            "        e.preventDefault();" +
            "        e.stopPropagation();" +
            "        return false;" +
            "      }" +
            "      el = el.parentElement;" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Remove ad overlays" +
            "  setInterval(function() {" +
            "    document.querySelectorAll('div,span,a').forEach(function(el) {" +
            "      try {" +
            "        var s = getComputedStyle(el);" +
            "        if ((s.position==='fixed'||s.position==='absolute') &&" +
            "            parseInt(s.zIndex||0) > 500 &&" +
            "            (parseFloat(s.opacity)<0.1 || el.offsetWidth<5 || el.offsetHeight<5)) {" +
            "          el.remove();" +
            "        }" +
            "      } catch(e) {}" +
            "    });" +
            "  }, 500);" +
            "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    private void startContinuousInjection(WebView webView) {
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        webView.evaluateJavascript(
                            "(function(){window.__NUCLEAR_BLOCKER__=false;})();", null);
                        injectAdBlockerJS(webView);
                    }
                    mainHandler.postDelayed(this, 1000);
                } catch (Exception e) {}
            }
        }, 1000);
    }
    
    // ==================== NUCLEAR INTENT BLOCKING ====================
    // Block ALL attempts to start external activities
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivity: " + intent);
            return;
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivity+opts: " + intent);
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityForResult: " + intent);
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityForResult+opts: " + intent);
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    @Override
    public void startActivityIfNeeded(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityIfNeeded: " + intent);
            return;
        }
        super.startActivityIfNeeded(intent, requestCode);
    }
    
    @Override
    public void startActivityIfNeeded(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityIfNeeded+opts: " + intent);
            return;
        }
        super.startActivityIfNeeded(intent, requestCode, options);
    }
    
    @Override
    public boolean startNextMatchingActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startNextMatchingActivity: " + intent);
            return false;
        }
        return super.startNextMatchingActivity(intent);
    }
    
    @Override
    public boolean startNextMatchingActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startNextMatchingActivity+opts: " + intent);
            return false;
        }
        return super.startNextMatchingActivity(intent, options);
    }
    
    /**
     * NUCLEAR BLOCKING: Block ALL external intents
     * This blocks ALL attempts to open any other app including browsers
     */
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        
        // Block ALL ACTION_VIEW intents - these open external apps
        if (Intent.ACTION_VIEW.equals(action)) {
            Uri data = intent.getData();
            if (data != null) {
                String scheme = data.getScheme();
                // Block http, https, intent, market, tel, mailto - EVERYTHING
                if (scheme != null) {
                    android.util.Log.d(TAG, "BLOCKING ACTION_VIEW: " + data);
                    blockedAdsCount++;
                    return true; // BLOCK ALL
                }
            }
        }
        
        // Block if this would open any browser
        if (wouldOpenExternalApp(intent)) {
            android.util.Log.d(TAG, "BLOCKING EXTERNAL APP: " + intent);
            blockedAdsCount++;
            return true;
        }
        
        return false;
    }
    
    private boolean wouldOpenExternalApp(Intent intent) {
        try {
            List<ResolveInfo> activities = getPackageManager().queryIntentActivities(intent, 0);
            String myPackage = getPackageName();
            
            for (ResolveInfo info : activities) {
                String pkg = info.activityInfo.packageName;
                // If ANY app other than ours would handle this, BLOCK IT
                if (!pkg.equals(myPackage)) {
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
