package app.lovable.zuniverse;

import android.app.Activity;
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
import android.webkit.DownloadListener;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Toast;

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
 * NUCLEAR AD BLOCKER V5 - COMPLETE REWRITE
 * 
 * Previous versions failed because they tried to be too smart.
 * This version is BRUTAL and SIMPLE:
 * 
 * 1. BLOCK ALL startActivity calls with ACTION_VIEW
 * 2. BLOCK ALL downloads (ads use downloads to escape)  
 * 3. BLOCK ALL non-whitelisted URLs at every level
 * 4. BLOCK ALL popups/new windows
 * 5. Inject JS to kill click hijacking
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_V5";
    private static int blockedCount = 0;
    private Handler handler = new Handler(Looper.getMainLooper());
    
    // STRICT whitelist - only these domains can load
    private static final Set<String> WHITELIST = new HashSet<>(Arrays.asList(
        // App
        "lovableproject.com", "lovable.dev", "localhost", "127.0.0.1", "10.0.2.2",
        
        // === ALL STREAMING SOURCES ===
        // VidSrc family
        "vidsrc.wtf", "vidsrc.cc", "vidsrc.me", "vidsrc.pro", "vidsrc.to", 
        "vidsrc.xyz", "vidsrc.net", "vidsrc.icu", "vidsrc.in", "vidsrc.nl",
        "vidsrc-embed.ru",
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
        "rivestream.live",
        "catflix.su",
        "nontongo.win",
        "nunflix-embed.vercel.app",
        "embed-api.stream", "player.embed-api.stream",
        "moviesapi.club",
        
        // === MEDIA CDNs (required for video playback) ===
        "googlevideo.com", "googleusercontent.com",
        "gstatic.com", "ggpht.com",
        "akamaihd.net", "akamaized.net", "akamaicdn.net",
        "cloudfront.net", "cloudflare.com", "cdnjs.cloudflare.com",
        "fastly.net", "fastlylb.net",
        "jsdelivr.net", "unpkg.com",
        "bunnycdn.com", "b-cdn.net",
        "cdn77.org", "cdnvideo.ru",
        "jwpcdn.com", "jwplayer.com", "jwpsrv.com",
        "vidcdn.co", "vidcdn.pro",
        "mixdrop.co", "mixdrop.to",
        "streamtape.com", "strcloud.in",
        "dood.watch", "dood.la", "dood.so", "dood.pm",
        "filemoon.sx", "filemoon.to",
        "upstream.to",
        "rabbitstream.net",
        "rapid-cloud.co", "rapid-cloud.ru",
        
        // === TMDB (images) ===
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    // Ad patterns
    private static final Pattern AD_PATTERN = Pattern.compile(
        ".*(doubleclick|googlesyndication|googleadservices|google-analytics|" +
        "facebook\\.com/tr|analytics|tracker|adservice|adsserver|" +
        "popads|popunder|popcash|propellerads|exoclick|trafficjunky|" +
        "clickadu|admaven|adsterra|monetag|hilltopads|" +
        "mgid|taboola|outbrain|realsrv|onclickmax|pushame|" +
        "ad\\.|ads\\.|adv\\.|banner|sponsor|promo).*",
        Pattern.CASE_INSENSITIVE
    );
    
    /**
     * LAYER 1: Block at Context level
     */
    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(new BlockingContext(newBase));
    }
    
    private class BlockingContext extends ContextWrapper {
        BlockingContext(Context base) { super(base); }
        
        @Override
        public void startActivity(Intent intent) {
            if (blockIntent(intent)) return;
            super.startActivity(intent);
        }
        
        @Override
        public void startActivity(Intent intent, Bundle options) {
            if (blockIntent(intent)) return;
            super.startActivity(intent, options);
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
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
        log("=== NUCLEAR V5 STARTING ===");
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        setupBlocking();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Re-apply blocking when app resumes
        handler.postDelayed(this::setupBlocking, 100);
    }
    
    private void setupBlocking() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) return;
            
            WebView webView = bridge.getWebView();
            if (webView == null) return;
            
            // LAYER 2: Custom WebViewClient that blocks everything
            webView.setWebViewClient(new BridgeWebViewClient(bridge) {
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    return handleUrl(request.getUrl().toString());
                }
                
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    return handleUrl(url);
                }
                
                private boolean handleUrl(String url) {
                    if (url == null) return true;
                    
                    // Allow javascript/data/blob
                    String lower = url.toLowerCase();
                    if (lower.startsWith("javascript:") || lower.startsWith("data:") || 
                        lower.startsWith("blob:") || lower.startsWith("about:")) {
                        return false;
                    }
                    
                    // BLOCK all non-http schemes (intent://, market://, tel://, etc.)
                    if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
                        log("BLOCKED scheme: " + url.substring(0, Math.min(60, url.length())));
                        blockedCount++;
                        return true;
                    }
                    
                    // Check whitelist
                    if (isWhitelisted(url)) {
                        return false;
                    }
                    
                    // BLOCK everything else
                    log("BLOCKED URL: " + url.substring(0, Math.min(60, url.length())));
                    blockedCount++;
                    return true;
                }
                
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    // Block ad patterns at network level
                    if (AD_PATTERN.matcher(url).matches()) {
                        log("BLOCKED AD: " + url.substring(0, Math.min(50, url.length())));
                        blockedCount++;
                        return emptyResponse();
                    }
                    
                    // Block non-whitelisted HTML pages (catches iframe ads)
                    String accept = request.getRequestHeaders().get("Accept");
                    if (accept != null && accept.contains("text/html") && !isWhitelisted(url)) {
                        log("BLOCKED HTML: " + url.substring(0, Math.min(50, url.length())));
                        blockedCount++;
                        return emptyHtmlResponse();
                    }
                    
                    return super.shouldInterceptRequest(view, request);
                }
                
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    injectBlocker(view);
                }
            });
            
            // LAYER 3: Block ALL popups and dialogs
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    log("BLOCKED popup");
                    blockedCount++;
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
            
            // LAYER 4: Block ALL downloads - ads often trigger fake downloads
            webView.setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, 
                                          String mimetype, long contentLength) {
                    log("BLOCKED DOWNLOAD: " + url.substring(0, Math.min(60, url.length())));
                    blockedCount++;
                    // Do nothing - don't start any download
                }
            });
            
            // LAYER 5: Aggressive WebView settings
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
            
            // Enable safe browsing if available
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            // LAYER 6: Disable long-press context menu (prevents "Open in browser")
            webView.setOnLongClickListener(v -> true);
            
            // Initial injection
            injectBlocker(webView);
            
            // Continuous re-injection
            startContinuousInjection(webView);
            
            log("=== NUCLEAR V5 ACTIVE ===");
            
        } catch (Exception e) {
            log("Setup error: " + e.getMessage());
        }
    }
    
    private boolean isWhitelisted(String url) {
        if (url == null) return false;
        try {
            String host = new java.net.URL(url).getHost();
            if (host == null) return false;
            host = host.toLowerCase();
            
            for (String domain : WHITELIST) {
                if (host.equals(domain) || host.endsWith("." + domain)) {
                    return true;
                }
            }
        } catch (Exception e) {}
        return false;
    }
    
    private WebResourceResponse emptyResponse() {
        return new WebResourceResponse("text/plain", "UTF-8", 
            new ByteArrayInputStream("".getBytes()));
    }
    
    private WebResourceResponse emptyHtmlResponse() {
        return new WebResourceResponse("text/html", "UTF-8", 
            new ByteArrayInputStream("<html><body></body></html>".getBytes()));
    }
    
    /**
     * JavaScript injection to block click hijacking and ad overlays
     */
    private void injectBlocker(WebView webView) {
        String whitelist = String.join("','", WHITELIST);
        
        String js = 
            "(function(){" +
            "if(window.__NV5)return;" +
            "window.__NV5=true;" +
            "var W=['" + whitelist + "'];" +
            "function ok(u){" +
            "  if(!u)return true;" +
            "  try{" +
            "    var h=new URL(u,location.href).hostname.toLowerCase();" +
            "    return W.some(function(d){return h===d||h.endsWith('.'+d);});" +
            "  }catch(e){return false;}" +
            "}" +
            // Kill window.open
            "window.open=function(){return null;};" +
            // Block location changes
            "var oA=location.assign.bind(location);" +
            "var oR=location.replace.bind(location);" +
            "location.assign=function(u){if(ok(u))oA(u);};" +
            "location.replace=function(u){if(ok(u))oR(u);};" +
            // Block click on bad links
            "document.addEventListener('click',function(e){" +
            "  var t=e.target;" +
            "  for(var i=0;i<5&&t;i++){" +
            "    if(t.tagName==='A'&&t.href&&!ok(t.href)){" +
            "      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();" +
            "      return false;" +
            "    }" +
            "    t=t.parentElement;" +
            "  }" +
            "},true);" +
            // Same for touch
            "document.addEventListener('touchend',function(e){" +
            "  var t=e.target;" +
            "  for(var i=0;i<5&&t;i++){" +
            "    if(t.tagName==='A'&&t.href&&!ok(t.href)){" +
            "      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();" +
            "      return false;" +
            "    }" +
            "    t=t.parentElement;" +
            "  }" +
            "},true);" +
            // Remove invisible overlays periodically
            "setInterval(function(){" +
            "  document.querySelectorAll('*').forEach(function(el){" +
            "    try{" +
            "      var s=getComputedStyle(el);" +
            "      if((s.position==='fixed'||s.position==='absolute')&&" +
            "         parseInt(s.zIndex)>1000&&" +
            "         (parseFloat(s.opacity)<0.1||s.visibility==='hidden'||el.offsetWidth<5)){" +
            "        el.remove();" +
            "      }" +
            "      if(el.tagName==='IFRAME'&&el.src&&!ok(el.src)){" +
            "        el.remove();" +
            "      }" +
            "    }catch(e){}" +
            "  });" +
            "},500);" +
            "})();";
        
        webView.evaluateJavascript(js, null);
    }
    
    private void startContinuousInjection(WebView webView) {
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    if (webView != null) {
                        webView.evaluateJavascript("window.__NV5=false;", null);
                        injectBlocker(webView);
                    }
                    handler.postDelayed(this, 1000);
                } catch (Exception e) {}
            }
        }, 1000);
    }
    
    // ==================== ACTIVITY-LEVEL BLOCKING ====================
    
    @Override
    public void startActivity(Intent intent) {
        if (blockIntent(intent)) return;
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (blockIntent(intent)) return;
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (blockIntent(intent)) return;
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (blockIntent(intent)) return;
        super.startActivityForResult(intent, requestCode, options);
    }
    
    @Override
    public void startActivities(Intent[] intents) {
        log("BLOCKED batch");
        blockedCount++;
    }
    
    @Override
    public void startActivities(Intent[] intents, Bundle options) {
        log("BLOCKED batch");
        blockedCount++;
    }
    
    private boolean blockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        Uri data = intent.getData();
        
        // BLOCK ALL ACTION_VIEW - this is what opens the browser
        if (Intent.ACTION_VIEW.equals(action)) {
            log("BLOCKED ACTION_VIEW: " + (data != null ? data.toString().substring(0, Math.min(60, data.toString().length())) : "null"));
            blockedCount++;
            return true;
        }
        
        // Block any intent going to external app
        try {
            List<ResolveInfo> activities = getPackageManager()
                .queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
            String myPackage = getPackageName();
            
            for (ResolveInfo info : activities) {
                if (info.activityInfo != null && !myPackage.equals(info.activityInfo.packageName)) {
                    log("BLOCKED EXTERNAL: " + info.activityInfo.packageName);
                    blockedCount++;
                    return true;
                }
            }
        } catch (Exception e) {
            blockedCount++;
            return true;
        }
        
        return false;
    }
    
    private void log(String msg) {
        android.util.Log.d(TAG, "★ " + msg);
    }
    
    public static int getBlockedAdsCount() {
        return blockedCount;
    }
}
