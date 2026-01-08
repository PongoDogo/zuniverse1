package app.lovable.zuniverse;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JsResult;
import android.webkit.JsPromptResult;
import android.util.Log;
import android.view.View;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

import java.io.ByteArrayInputStream;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * NETWORK-LEVEL AD BLOCKER - DETERMINISTIC BLOCKING
 * 
 * NO hacks, NO delays, NO re-applications.
 * - shouldInterceptRequest returns HTTP 204 for ALL non-whitelisted requests
 * - shouldOverrideUrlLoading returns true for ALL navigation
 * - onCreateWindow ALWAYS returns false
 * - ZERO popups, ZERO external browser
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "ZUNIVERSE_ADBLOCK";
    private static int blockedCount = 0;
    private WebView webViewRef;
    
    // ==================== WHITELIST CONFIGURATION ====================
    private static final Set<String> WHITELIST = new HashSet<>(Arrays.asList(
        // App domains
        "lovableproject.com", "lovable.dev", "localhost", "127.0.0.1", "10.0.2.2",
        
        // Streaming sources - VidSrc family
        "vidsrc.wtf", "vidsrc.cc", "vidsrc.me", "vidsrc.pro", "vidsrc.to", 
        "vidsrc.xyz", "vidsrc.net", "vidsrc.icu", "vidsrc.in", "vidsrc.nl",
        "vidsrc.pm", "vidsrc.stream", "vidsrc-api.com", "v2.vidsrc.me",
        "vidsrc-embed.ru", "vixsrc.to",
        
        // Embed sources
        "embed.su", "embedsu.com",
        "2embed.org", "2embed.cc", "2embed.skin", "2embed.to",
        "multiembed.mov", "multiembed.org",
        "superembed.stream",
        
        // Player sources
        "vidlink.pro",
        "vidbinge.dev", "vidbinge.com",
        "smashy.stream", "player.smashy.stream",
        "autoembed.cc", "autoembed.co", "player.autoembed.cc",
        "rivestream.live", "rivestream.xyz",
        "catflix.su",
        "nontongo.win",
        "nunflix-embed.vercel.app", "nunflix.org",
        "moviesapi.club",
        "gomovies.sx",
        "flixhq.to",
        "fmovies.to",
        "vidrock.net",
        
        // Video CDNs
        "googlevideo.com", "googleusercontent.com",
        "gstatic.com", "ggpht.com", "youtube.com", "ytimg.com",
        "akamaihd.net", "akamaized.net", "akamaicdn.net",
        "cloudfront.net", "cloudflare.com", "cdnjs.cloudflare.com",
        "fastly.net", "fastlylb.net",
        "jsdelivr.net", "unpkg.com",
        "bunnycdn.com", "b-cdn.net",
        "cdn77.org", "stackpathdns.com",
        "jwpcdn.com", "jwplayer.com", "jwpsrv.com",
        "vidcdn.co", "vidcdn.pro",
        "mixdrop.co", "mixdrop.to", "mixdrop.sx", "mixdrop.club",
        "streamtape.com", "strcloud.in", "strtape.cloud",
        "dood.watch", "dood.la", "dood.so", "dood.pm", "dood.to", "dood.ws", "dood.cx",
        "filemoon.sx", "filemoon.to", "filemoon.in",
        "upstream.to",
        "rabbitstream.net",
        "rapid-cloud.co", "rapid-cloud.ru",
        "vidplay.online", "vidplay.site", "vidplay.lol",
        "dokicloud.one",
        "megacloud.tv",
        "streamwish.to", "streamwish.com",
        "mp4upload.com",
        "voe.sx",
        
        // TMDB
        "themoviedb.org", "tmdb.org", "image.tmdb.org"
    ));
    
    // ==================== AD DOMAINS ====================
    private static final Set<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "googletagmanager.com", "google-analytics.com", "googletagservices.com",
        "adservice.google.com", "pagead2.googlesyndication.com",
        "facebook.com", "facebook.net", "connect.facebook.net", "fbcdn.net",
        "popads.net", "popcash.net", "propellerads.com", "propellerads.net",
        "exoclick.com", "trafficjunky.com", "trafficjunky.net", "adsterra.com",
        "clickadu.com", "hilltopads.net", "hilltopads.com", "admaven.com",
        "richads.com", "trafficstars.com", "popunder.net", "adcash.com",
        "evadav.com", "juicyads.com", "realsrv.com", "tsyndicate.com",
        "onclickmax.com", "onclickalgo.com", "onclickpredictiv.com",
        "pushame.com", "monetag.com", "a-ads.com", "coinzilla.com", "bitmedia.io",
        "adnxs.com", "advertising.com", "bidswitch.net", "pubmatic.com",
        "openx.net", "rubiconproject.com", "casalemedia.com", "criteo.com",
        "criteo.net", "amazon-adsystem.com", "media.net", "outbrain.com",
        "taboola.com", "mgid.com", "revcontent.com", "zergnet.com",
        "spotxchange.com", "spotx.tv", "teads.tv", "moatads.com", "adsrvr.org",
        "adroll.com", "quantcast.com",
        "scorecardresearch.com", "quantserve.com", "segment.io", "segment.com",
        "amplitude.com", "mixpanel.com", "hotjar.com", "fullstory.com",
        "bit.ly", "tinyurl.com", "shorte.st", "adf.ly", "bc.vc", "sh.st",
        "ouo.io", "ouo.press", "shrinkearn.com", "shrinkme.io"
    ));
    
    // ==================== LIFECYCLE ====================
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        log("=== NETWORK-LEVEL AD BLOCKER STARTING ===");
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        setupAdBlocker();
    }
    
    private void setupAdBlocker() {
        try {
            Bridge bridge = getBridge();
            if (bridge == null) return;
            
            WebView webView = bridge.getWebView();
            if (webView == null) return;
            
            webViewRef = webView;
            
            // Set clients ONCE - no re-application needed
            webView.setWebViewClient(new NetworkBlockingWebViewClient());
            webView.setWebChromeClient(new NoPopupWebChromeClient());
            
            // Block downloads
            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                log("BLOCKED DOWNLOAD: " + truncate(url, 60));
                blockedCount++;
            });
            
            configureWebViewSettings(webView);
            
            log("=== AD BLOCKER READY ===");
            
        } catch (Exception e) {
            log("Setup error: " + e.getMessage());
        }
    }
    
    private void configureWebViewSettings(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // CRITICAL: Kill all popup mechanisms
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setGeolocationEnabled(false);
        
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
    }
    
    // ==================== NETWORK-LEVEL BLOCKING WEBVIEWCLIENT ====================
    
    private class NetworkBlockingWebViewClient extends WebViewClient {
        
        /**
         * CRITICAL: Intercept ALL requests at network level.
         * Non-whitelisted = HTTP 204 empty response. NOT null.
         */
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            
            // Always allow data/blob URLs
            if (url.startsWith("data:") || url.startsWith("blob:")) {
                return null;
            }
            
            // Block ad domains immediately
            if (isAdDomain(url)) {
                log("BLOCKED [AD]: " + truncate(url, 60));
                blockedCount++;
                return http204Response();
            }
            
            // Check whitelist - if NOT whitelisted, return 204
            if (!isWhitelisted(url)) {
                log("BLOCKED [NOT WHITELISTED]: " + truncate(url, 60));
                blockedCount++;
                return http204Response();
            }
            
            // Whitelisted - allow the request
            return null;
        }
        
        /**
         * CRITICAL: Return TRUE for ALL navigation to prevent external browser.
         * We load whitelisted URLs ourselves, block everything else.
         */
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleNavigation(view, request.getUrl().toString());
        }
        
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleNavigation(view, url);
        }
        
        private boolean handleNavigation(WebView view, String url) {
            if (url == null || url.isEmpty()) {
                return true; // Block empty
            }
            
            // Allow internal schemes
            if (url.startsWith("javascript:") || url.startsWith("data:") || url.startsWith("blob:")) {
                return false;
            }
            
            // Block ALL non-HTTP schemes (intent://, market://, tel://, etc.)
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                log("BLOCKED [SCHEME]: " + truncate(url, 60));
                blockedCount++;
                return true;
            }
            
            // Block ad URLs
            if (isAdDomain(url)) {
                log("BLOCKED [AD NAV]: " + truncate(url, 60));
                blockedCount++;
                return true;
            }
            
            // Check whitelist
            if (isWhitelisted(url)) {
                log("ALLOWED: " + truncate(url, 60));
                view.loadUrl(url);
                return true; // We handled it
            }
            
            // Not whitelisted - BLOCK
            log("BLOCKED [NAV]: " + truncate(url, 60));
            blockedCount++;
            return true;
        }
        
        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            injectMinimalJS(view);
        }
    }
    
    // ==================== NO-POPUP WEBCHROMECLIENT ====================
    
    private class NoPopupWebChromeClient extends WebChromeClient {
        
        /**
         * CRITICAL: ALWAYS return false. No exceptions. No URL loading.
         * This kills ALL popup attempts at the root.
         */
        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            log("BLOCKED [POPUP]: Window creation attempt");
            blockedCount++;
            return false; // ALWAYS false - kill popup
        }
        
        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            if (isAdDomain(url)) {
                result.cancel();
                return true;
            }
            return super.onJsAlert(view, url, message, result);
        }
        
        @Override
        public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
            if (isAdDomain(url)) {
                result.cancel();
                return true;
            }
            return super.onJsConfirm(view, url, message, result);
        }
        
        @Override
        public boolean onJsPrompt(WebView view, String url, String message, 
                                 String defaultValue, JsPromptResult result) {
            if (isAdDomain(url)) {
                result.cancel();
                return true;
            }
            return super.onJsPrompt(view, url, message, defaultValue, result);
        }
        
        @Override
        public boolean onJsBeforeUnload(WebView view, String url, String message, JsResult result) {
            result.confirm();
            return true;
        }
    }
    
    // ==================== ABSOLUTE INTENT BLOCKING ====================
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            Log.d("INTENT_BLOCK", intent.toString());
            return;
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            Log.d("INTENT_BLOCK", intent.toString());
            return;
        }
        super.startActivity(intent, options);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (shouldBlockIntent(intent)) {
            Log.d("INTENT_BLOCK", intent.toString());
            return;
        }
        super.startActivityForResult(intent, requestCode);
    }
    
    @Override
    public void startActivityForResult(Intent intent, int requestCode, Bundle options) {
        if (shouldBlockIntent(intent)) {
            Log.d("INTENT_BLOCK", intent.toString());
            return;
        }
        super.startActivityForResult(intent, requestCode, options);
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        Uri data = intent.getData();
        String targetPackage = intent.getPackage();
        String myPackage = getPackageName();
        
        // Block ALL ACTION_VIEW intents
        if (Intent.ACTION_VIEW.equals(action)) {
            Log.d("INTENT_BLOCK", "Blocked ACTION_VIEW: " + intent.toString());
            return true;
        }
        
        // Block dangerous schemes
        if (data != null) {
            String scheme = data.getScheme();
            if (scheme != null) {
                // Block intent:// and market:// schemes
                if ("intent".equals(scheme) || "market".equals(scheme)) {
                    Log.d("INTENT_BLOCK", "Blocked scheme " + scheme + ": " + intent.toString());
                    return true;
                }
                
                // Block http/https if target package is NOT our app
                if (("http".equals(scheme) || "https".equals(scheme))) {
                    if (targetPackage == null || !targetPackage.equals(myPackage)) {
                        Log.d("INTENT_BLOCK", "Blocked external http/https: " + intent.toString());
                        return true;
                    }
                }
            }
        }
        
        // Block CATEGORY_BROWSABLE
        if (intent.getCategories() != null && intent.getCategories().contains(Intent.CATEGORY_BROWSABLE)) {
            Log.d("INTENT_BLOCK", "Blocked CATEGORY_BROWSABLE: " + intent.toString());
            return true;
        }
        
        return false;
    }
    
    // ==================== HELPER METHODS ====================
    
    private boolean isWhitelisted(String url) {
        if (url == null) return false;
        
        try {
            URL parsed = new URL(url);
            String host = parsed.getHost();
            if (host == null) return false;
            
            host = host.toLowerCase();
            
            for (String domain : WHITELIST) {
                if (host.equals(domain) || host.endsWith("." + domain)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Invalid URL
        }
        
        return false;
    }
    
    private boolean isAdDomain(String url) {
        if (url == null) return false;
        
        try {
            URL parsed = new URL(url);
            String host = parsed.getHost();
            if (host == null) return false;
            
            host = host.toLowerCase();
            
            for (String adDomain : AD_DOMAINS) {
                if (host.equals(adDomain) || host.endsWith("." + adDomain)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Invalid URL
        }
        
        return false;
    }
    
    /**
     * HTTP 204 No Content - deterministic blocking.
     * WebView gets empty response, no redirects can happen.
     */
    private WebResourceResponse http204Response() {
        return new WebResourceResponse(
            "text/plain",
            "UTF-8",
            204,
            "No Content",
            null,
            new ByteArrayInputStream(new byte[0])
        );
    }
    
    private String truncate(String s, int maxLen) {
        if (s == null) return "";
        return s.length() > maxLen ? s.substring(0, maxLen) + "..." : s;
    }
    
    private void log(String msg) {
        Log.i(TAG, msg);
    }
    
    /**
     * Minimal JS - just block window.open, nothing else.
     */
    private void injectMinimalJS(WebView webView) {
        String js = "(function(){" +
            "if(window.__ZU_NET_BLOCK) return;" +
            "window.__ZU_NET_BLOCK = true;" +
            "window.open = function(){return null;};" +
            "Object.defineProperty(window,'open',{value:function(){return null;},writable:false});" +
            "console.log('[ZUniverse] Network-level blocker active');" +
        "})();";
        webView.evaluateJavascript(js, null);
    }
    
    public static int getBlockedAdsCount() {
        return blockedCount;
    }
}
