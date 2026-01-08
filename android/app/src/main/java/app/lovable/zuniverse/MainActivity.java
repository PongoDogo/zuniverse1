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
import android.webkit.WebViewClient;
import android.view.MotionEvent;

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
 * ULTIMATE NUCLEAR AD BLOCKER V3
 * 
 * Uses multiple layers of blocking:
 * 1. Instrumentation hook (in ZuniverseApplication) - catches ALL activity launches
 * 2. Activity-level startActivity overrides
 * 3. WebViewClient URL interception
 * 4. WebChromeClient popup blocking
 * 5. JavaScript injection to block redirects
 * 6. Touch event interception
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_NUCLEAR";
    private int blockedAdsCount = 0;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    private long lastTouchTime = 0;
    
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
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        setupNuclearBlocking();
    }
    
    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        if (ev.getAction() == MotionEvent.ACTION_DOWN) {
            lastTouchTime = System.currentTimeMillis();
        }
        return super.dispatchTouchEvent(ev);
    }
    
    private void setupNuclearBlocking() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) return;
            
            WebView webView = bridge.getWebView();
            if (webView == null) return;
            
            android.util.Log.d(TAG, "=== NUCLEAR BLOCKER V3 INITIALIZING ===");
            
            // Set up nuclear WebViewClient
            BridgeWebViewClient nuclearClient = new BridgeWebViewClient(bridge) {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    android.util.Log.d(TAG, "shouldOverrideUrlLoading: " + url);
                    return blockUrl(url);
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    android.util.Log.d(TAG, "shouldOverrideUrlLoading (legacy): " + url);
                    return blockUrl(url);
                }
                
                private boolean blockUrl(String url) {
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
                    
                    // BLOCK everything else
                    android.util.Log.d(TAG, "★ BLOCKED URL: " + url.substring(0, Math.min(80, url.length())));
                    blockedAdsCount++;
                    return true;
                }
                
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block ad network resources
                    if (AD_PATTERNS.matcher(url).matches()) {
                        android.util.Log.d(TAG, "★ BLOCKED AD: " + url.substring(0, Math.min(50, url.length())));
                        blockedAdsCount++;
                        return new WebResourceResponse("text/plain", "UTF-8", 
                            new ByteArrayInputStream("".getBytes()));
                    }
                    
                    return super.shouldInterceptRequest(view, request);
                }
                
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    injectBlockerJS(view);
                }
            };
            
            webView.setWebViewClient(nuclearClient);
            
            // COMPLETELY DISABLE popups
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d(TAG, "★ BLOCKED POPUP");
                    blockedAdsCount++;
                    return false;
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
                
                @Override
                public boolean onJsBeforeUnload(WebView view, String url, String message, android.webkit.JsResult result) {
                    result.confirm();
                    return true;
                }
            });
            
            // Maximum security settings
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
            
            // Start continuous JS injection
            injectBlockerJS(webView);
            startContinuousInjection(webView);
            
            android.util.Log.d(TAG, "=== NUCLEAR BLOCKER V3 ACTIVE ===");
            
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
    
    private void injectBlockerJS(WebView webView) {
        String js = 
            "(function() {" +
            "  if (window.__NUCLEAR_V3__) return;" +
            "  window.__NUCLEAR_V3__ = true;" +
            "  console.log('[NUCLEAR] Blocker V3 injected');" +
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
            "  function isOk(url) {" +
            "    if (!url) return true;" +
            "    try {" +
            "      var u = new URL(url, location.href);" +
            "      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;" +
            "      var h = u.hostname.toLowerCase();" +
            "      return allowed.some(function(d) { return h === d || h.endsWith('.'+d); });" +
            "    } catch(e) { return false; }" +
            "  }" +
            "  " +
            "  // Kill window.open" +
            "  window.open = function() { console.log('[NUCLEAR] blocked window.open'); return null; };" +
            "  " +
            "  // Block location changes" +
            "  var _assign = location.assign.bind(location);" +
            "  var _replace = location.replace.bind(location);" +
            "  location.assign = function(u) { if(isOk(u)) _assign(u); else console.log('[NUCLEAR] blocked assign:', u); };" +
            "  location.replace = function(u) { if(isOk(u)) _replace(u); else console.log('[NUCLEAR] blocked replace:', u); };" +
            "  " +
            "  // Block link clicks" +
            "  document.addEventListener('click', function(e) {" +
            "    var el = e.target;" +
            "    while (el) {" +
            "      if (el.tagName === 'A' && el.href && !isOk(el.href)) {" +
            "        console.log('[NUCLEAR] blocked click:', el.href);" +
            "        e.preventDefault();" +
            "        e.stopImmediatePropagation();" +
            "        return false;" +
            "      }" +
            "      el = el.parentElement;" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Remove overlay ads" +
            "  setInterval(function() {" +
            "    document.querySelectorAll('div,iframe,a').forEach(function(el) {" +
            "      try {" +
            "        var s = getComputedStyle(el);" +
            "        var z = parseInt(s.zIndex) || 0;" +
            "        if ((s.position === 'fixed' || s.position === 'absolute') && z > 500) {" +
            "          if (parseFloat(s.opacity) < 0.2 || el.offsetWidth < 10 || el.offsetHeight < 10) {" +
            "            el.remove();" +
            "          }" +
            "        }" +
            "        if (el.tagName === 'IFRAME') {" +
            "          var src = el.src || '';" +
            "          if (src && !isOk(src)) el.remove();" +
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
                        webView.evaluateJavascript("(function(){window.__NUCLEAR_V3__=false;})();", null);
                        injectBlockerJS(webView);
                    }
                    mainHandler.postDelayed(this, 1000);
                } catch (Exception e) {}
            }
        }, 1000);
    }
    
    // ==================== ACTIVITY-LEVEL BLOCKING ====================
    // Backup layer in case Instrumentation hook fails
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlock(intent)) {
            android.util.Log.d(TAG, "★ ACTIVITY BLOCKED: " + intent);
            return;
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlock(intent)) {
            android.util.Log.d(TAG, "★ ACTIVITY BLOCKED: " + intent);
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlock(intent)) {
            android.util.Log.d(TAG, "★ ACTIVITY BLOCKED: " + intent);
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlock(intent)) {
            android.util.Log.d(TAG, "★ ACTIVITY BLOCKED: " + intent);
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    @Override
    public void startActivities(Intent[] intents) {
        android.util.Log.d(TAG, "★ BLOCKED batch startActivities");
        blockedAdsCount++;
    }
    
    @Override
    public void startActivities(Intent[] intents, Bundle options) {
        android.util.Log.d(TAG, "★ BLOCKED batch startActivities");
        blockedAdsCount++;
    }
    
    private boolean shouldBlock(Intent intent) {
        if (intent == null) return false;
        
        // Block ALL ACTION_VIEW
        if (Intent.ACTION_VIEW.equals(intent.getAction())) {
            blockedAdsCount++;
            return true;
        }
        
        // Block external apps
        try {
            List<ResolveInfo> activities = getPackageManager()
                .queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
            String myPackage = getPackageName();
            
            for (ResolveInfo info : activities) {
                if (!info.activityInfo.packageName.equals(myPackage)) {
                    blockedAdsCount++;
                    return true;
                }
            }
        } catch (Exception e) {
            return true;
        }
        
        return false;
    }
    
    public int getBlockedAdsCount() {
        return blockedAdsCount;
    }
}
