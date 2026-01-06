package app.lovable.zuniverse;

import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import app.lovable.zuniverse.plugins.AdBlockerPlugin;

public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "MainActivity";
    private int blockedAdsCount = 0;
    
    // ONLY allow these domains
    private static final Set<String> ALLOWED_DOMAINS = new HashSet<>(Arrays.asList(
        // Our app
        "lovableproject.com", "lovable.dev", "localhost",
        // Streaming sources
        "vidsrc.cc", "vidsrc.me", "vidsrc.pro", "vidsrc.to", "vidsrc.xyz", "vidsrc.net",
        "embed.su", "embedsu.com",
        "vidlink.pro",
        "moviesapi.club",
        "vidbinge.dev", "vidbinge.com",
        "2embed.org", "2embed.cc", "2embed.skin",
        "multiembed.mov", "multiembed.org",
        "player.smashy.stream", "smashy.stream",
        "autoembed.cc", "autoembed.co",
        // TMDB for images
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
    }
    
    /**
     * CRITICAL: Called after the Bridge is initialized
     * This is where we set up our custom WebViewClient that extends Capacitor's
     */
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
            
            // Create our custom WebViewClient that EXTENDS Capacitor's BridgeWebViewClient
            // This is critical - it keeps Capacitor working while adding our blocking
            BridgeWebViewClient customClient = new BridgeWebViewClient(bridge) {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block ALL external navigation that's not in our allowed list
                    if (shouldBlockNavigation(url)) {
                        android.util.Log.d(TAG, "BLOCKED WebView navigation: " + url.substring(0, Math.min(80, url.length())));
                        blockedAdsCount++;
                        return true; // Block the navigation
                    }
                    
                    // Let Capacitor handle allowed URLs
                    return super.shouldOverrideUrlLoading(view, request);
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (shouldBlockNavigation(url)) {
                        android.util.Log.d(TAG, "BLOCKED WebView navigation (legacy): " + url.substring(0, Math.min(80, url.length())));
                        blockedAdsCount++;
                        return true;
                    }
                    return super.shouldOverrideUrlLoading(view, url);
                }
            };
            
            webView.setWebViewClient(customClient);
            
            // Block ALL new window creation (popups)
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d(TAG, "BLOCKED popup window creation");
                    blockedAdsCount++;
                    return false; // Block ALL popups
                }
                
                @Override
                public void onCloseWindow(WebView window) {
                    // Do nothing
                }
            });
            
            // Configure WebView settings for maximum security
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            settings.setGeolocationEnabled(false);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            
            // Disable third-party cookies
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
            
            // Enable safe browsing on newer Android
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            // Inject our master ad-blocking JavaScript
            injectMasterAdBlocker(webView);
            
            android.util.Log.d(TAG, "Aggressive ad blocking setup complete");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Error setting up ad blocking: " + e.getMessage());
        }
    }
    
    /**
     * Check if a URL should be blocked
     */
    private boolean shouldBlockNavigation(String url) {
        if (url == null || url.isEmpty()) return false;
        
        String lowerUrl = url.toLowerCase();
        
        // Always allow about:blank and javascript: URLs
        if (lowerUrl.startsWith("about:") || lowerUrl.startsWith("javascript:")) {
            return false;
        }
        
        // Allow data: URLs (used for inline content)
        if (lowerUrl.startsWith("data:")) {
            return false;
        }
        
        // Only check http/https URLs
        if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
            return true; // Block intent://, market://, etc.
        }
        
        try {
            java.net.URL urlObj = new java.net.URL(url);
            String host = urlObj.getHost();
            
            if (host == null || host.isEmpty()) {
                return true; // Block malformed URLs
            }
            
            // Check if it's an allowed domain
            String lowerHost = host.toLowerCase();
            for (String allowed : ALLOWED_DOMAINS) {
                if (lowerHost.equals(allowed) || lowerHost.endsWith("." + allowed)) {
                    return false; // Allow this domain
                }
            }
            
            // Block everything else
            return true;
            
        } catch (Exception e) {
            return true; // Block if we can't parse
        }
    }
    
    /**
     * Inject JavaScript that blocks ALL forms of redirection
     */
    private void injectMasterAdBlocker(WebView webView) {
        String js = 
            "(function() {" +
            "  if (window.__ZUNIVERSE_MASTER_BLOCKER__) return;" +
            "  window.__ZUNIVERSE_MASTER_BLOCKER__ = true;" +
            "  " +
            "  // NUCLEAR: Override window.location completely" +
            "  var allowedDomains = ['lovableproject.com', 'lovable.dev', 'localhost', " +
            "    'vidsrc.cc', 'vidsrc.me', 'vidsrc.pro', 'vidsrc.to', 'vidsrc.xyz', 'vidsrc.net', " +
            "    'embed.su', 'embedsu.com', 'vidlink.pro', 'moviesapi.club', " +
            "    'vidbinge.dev', 'vidbinge.com', '2embed.org', '2embed.cc', '2embed.skin', " +
            "    'multiembed.mov', 'multiembed.org', 'smashy.stream', 'autoembed.cc', 'autoembed.co', " +
            "    'themoviedb.org', 'tmdb.org', 'image.tmdb.org'];" +
            "  " +
            "  function isAllowedUrl(url) {" +
            "    if (!url) return true;" +
            "    try {" +
            "      var u = new URL(url, window.location.href);" +
            "      var host = u.hostname.toLowerCase();" +
            "      for (var i = 0; i < allowedDomains.length; i++) {" +
            "        if (host === allowedDomains[i] || host.endsWith('.' + allowedDomains[i])) return true;" +
            "      }" +
            "      return false;" +
            "    } catch(e) { return false; }" +
            "  }" +
            "  " +
            "  // Block window.open" +
            "  window.open = function() { console.log('[ZUNIVERSE] Blocked window.open'); return null; };" +
            "  " +
            "  // Block window.location changes" +
            "  var originalLocation = window.location;" +
            "  try {" +
            "    Object.defineProperty(window, 'location', {" +
            "      get: function() { return originalLocation; }," +
            "      set: function(url) {" +
            "        if (isAllowedUrl(url)) {" +
            "          originalLocation.href = url;" +
            "        } else {" +
            "          console.log('[ZUNIVERSE] Blocked location change to: ' + url);" +
            "        }" +
            "      }" +
            "    });" +
            "  } catch(e) {}" +
            "  " +
            "  // Block location.href, location.assign, location.replace" +
            "  var origAssign = location.assign;" +
            "  var origReplace = location.replace;" +
            "  location.assign = function(url) {" +
            "    if (isAllowedUrl(url)) origAssign.call(location, url);" +
            "    else console.log('[ZUNIVERSE] Blocked location.assign: ' + url);" +
            "  };" +
            "  location.replace = function(url) {" +
            "    if (isAllowedUrl(url)) origReplace.call(location, url);" +
            "    else console.log('[ZUNIVERSE] Blocked location.replace: ' + url);" +
            "  };" +
            "  " +
            "  // Block click hijacking - prevent ANY link that goes to non-allowed domains" +
            "  document.addEventListener('click', function(e) {" +
            "    var target = e.target;" +
            "    while (target && target !== document) {" +
            "      if (target.tagName === 'A' && target.href) {" +
            "        if (!isAllowedUrl(target.href)) {" +
            "          e.preventDefault();" +
            "          e.stopPropagation();" +
            "          e.stopImmediatePropagation();" +
            "          console.log('[ZUNIVERSE] Blocked click on: ' + target.href);" +
            "          return false;" +
            "        }" +
            "      }" +
            "      target = target.parentElement;" +
            "    }" +
            "  }, true);" +
            "  " +
            "  // Block mousedown/mouseup on ad links (some ads use these instead of click)" +
            "  ['mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(function(evt) {" +
            "    document.addEventListener(evt, function(e) {" +
            "      var target = e.target;" +
            "      while (target && target !== document) {" +
            "        if (target.tagName === 'A' && target.href && !isAllowedUrl(target.href)) {" +
            "          e.preventDefault();" +
            "          e.stopPropagation();" +
            "          return false;" +
            "        }" +
            "        target = target.parentElement;" +
            "      }" +
            "    }, true);" +
            "  });" +
            "  " +
            "  // Block alert/confirm/prompt" +
            "  window.alert = function() {};" +
            "  window.confirm = function() { return false; };" +
            "  window.prompt = function() { return null; };" +
            "  " +
            "  // Block beforeunload" +
            "  window.onbeforeunload = null;" +
            "  Object.defineProperty(window, 'onbeforeunload', { set: function() {}, get: function() { return null; } });" +
            "  " +
            "  // Block form submissions to ad sites" +
            "  document.addEventListener('submit', function(e) {" +
            "    var form = e.target;" +
            "    if (form.action && !isAllowedUrl(form.action)) {" +
            "      e.preventDefault();" +
            "      console.log('[ZUNIVERSE] Blocked form submission');" +
            "    }" +
            "  }, true);" +
            "  " +
            "  console.log('[ZUNIVERSE] Master ad blocker active');" +
            "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    /**
     * CRITICAL: Override startActivity to block ALL browser intents
     */
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivity: " + intent.toString());
            blockedAdsCount++;
            return;
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivity with options: " + intent.toString());
            blockedAdsCount++;
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityForResult: " + intent.toString());
            blockedAdsCount++;
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED startActivityForResult with options: " + intent.toString());
            blockedAdsCount++;
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        Uri data = intent.getData();
        
        // Block VIEW intents with URLs
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            String scheme = data.getScheme();
            
            // Block http/https URLs that aren't in our allowed list
            if ("http".equals(scheme) || "https".equals(scheme)) {
                String host = data.getHost();
                if (host != null) {
                    String lowerHost = host.toLowerCase();
                    for (String allowed : ALLOWED_DOMAINS) {
                        if (lowerHost.equals(allowed) || lowerHost.endsWith("." + allowed)) {
                            return false; // Allow this domain
                        }
                    }
                }
                // Block all other URLs
                return true;
            }
            
            // Block intent:// and market:// schemes
            if ("intent".equals(scheme) || "market".equals(scheme)) {
                return true;
            }
        }
        
        // Check if intent would open a browser
        if (wouldOpenBrowser(intent)) {
            return true;
        }
        
        return false;
    }
    
    private boolean wouldOpenBrowser(Intent intent) {
        try {
            List<ResolveInfo> activities = getPackageManager().queryIntentActivities(intent, 0);
            for (ResolveInfo info : activities) {
                String packageName = info.activityInfo.packageName.toLowerCase();
                if (packageName.contains("chrome") || 
                    packageName.contains("browser") || 
                    packageName.contains("firefox") ||
                    packageName.contains("opera") ||
                    packageName.contains("edge") ||
                    packageName.contains("samsung") ||
                    packageName.contains("brave") ||
                    packageName.contains("webview")) {
                    return true;
                }
            }
        } catch (Exception e) {
            // If we can't check, be safe
        }
        return false;
    }
    
    public int getBlockedAdsCount() {
        return blockedAdsCount;
    }
}
