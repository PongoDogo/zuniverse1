package app.lovable.plugins;

import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@CapacitorPlugin(name = "AdBlocker")
public class AdBlockerPlugin extends Plugin {
    
    private int blockedCount = 0;
    
    // Comprehensive list of ad domains
    private static final Set<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        // Major ad networks
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "googletagmanager.com", "google-analytics.com", "googletagservices.com",
        "adservice.google.com", "pagead2.googlesyndication.com", "adsense",
        
        // Popup/popunder networks
        "popads.net", "popcash.net", "propellerads.com", "propellerads.net",
        "exoclick.com", "trafficjunky.com", "trafficjunky.net", "adsterra.com",
        "clickadu.com", "hilltopads.net", "admaven.com", "richads.com",
        "trafficstars.com", "popunder.net", "adcash.com", "evadav.com",
        "juicyads.com", "realsrv.com", "tsyndicate.com", "onclickmax.com",
        "onclickalgo.com", "onclickpredictiv.com", "pushame.com",
        
        // Video ad networks  
        "adnxs.com", "advertising.com", "bidswitch.net", "pubmatic.com",
        "openx.net", "rubiconproject.com", "casalemedia.com", "criteo.com",
        "criteo.net", "amazon-adsystem.com", "media.net", "outbrain.com",
        "taboola.com", "mgid.com", "revcontent.com", "zergnet.com",
        "spotxchange.com", "spotx.tv", "teads.tv", "moatads.com",
        
        // Tracking
        "scorecardresearch.com", "quantserve.com", "segment.io",
        "amplitude.com", "mixpanel.com", "hotjar.com", "fullstory.com",
        
        // Streaming ad servers
        "streamtape.com", "dood.la", "dood.so", "dood.pm", "dood.to",
        "mixdrop.co", "upstream.to", "voe.sx", "filemoon.sx",
        "rabbitstream.net", "rapid-cloud.co", "vidcloud.pro",
        
        // Scam/spam TLDs commonly used
        "bit.ly", "tinyurl.com", "shorte.st", "adf.ly", "bc.vc",
        "adfly.co", "sh.st"
    ));
    
    // URL path patterns that indicate ads
    private static final String[] AD_PATH_PATTERNS = {
        "/ads/", "/ad/", "/adserve", "/advert", "/banner/", "/popup/",
        "/popunder/", "/tracking/", "/analytics/", "/pixel/", "/pagead/",
        "/adsense/", "/sponsor/", "/click/", "/track/", "/redirect/",
        "/out/", "/go/", "/aff/", "/vast/", "/vpaid/"
    };
    
    // Suspicious file extensions
    private static final String[] BLOCKED_EXTENSIONS = {
        ".xyz", ".top", ".club", ".live", ".click", ".buzz", ".bet",
        ".casino", ".poker", ".win", ".loan", ".work", ".gq", ".ml", ".ga", ".cf", ".tk"
    };
    
    // Regex patterns for ad detection
    private static final Pattern AD_PATTERN = Pattern.compile(
        ".*(doubleclick|googlesyndication|googleadservices|adservice|" +
        "popads|popcash|propeller|exoclick|trafficjunky|adsterra|" +
        "clickadu|hilltopads|admaven|richads|trafficstars|popunder|" +
        "adcash|evadav|juicyads|realsrv|tsyndicate|onclickmax|" +
        "adnxs|pubmatic|openx|rubiconproject|criteo|outbrain|taboola|mgid).*",
        Pattern.CASE_INSENSITIVE
    );
    
    @PluginMethod
    public void getBlockedCount(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("count", blockedCount);
        call.resolve(ret);
    }
    
    @PluginMethod
    public void resetBlockedCount(PluginCall call) {
        blockedCount = 0;
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
    
    /**
     * Check if a URL should be blocked
     */
    public boolean shouldBlockUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        
        String lowerUrl = url.toLowerCase();
        
        // Check against ad domains
        for (String domain : AD_DOMAINS) {
            if (lowerUrl.contains(domain)) {
                blockedCount++;
                return true;
            }
        }
        
        // Check URL path patterns
        for (String pattern : AD_PATH_PATTERNS) {
            if (lowerUrl.contains(pattern)) {
                blockedCount++;
                return true;
            }
        }
        
        // Check suspicious extensions
        try {
            java.net.URL urlObj = new java.net.URL(url);
            String host = urlObj.getHost();
            for (String ext : BLOCKED_EXTENSIONS) {
                if (host.endsWith(ext)) {
                    blockedCount++;
                    return true;
                }
            }
        } catch (Exception e) {
            // Ignore malformed URLs
        }
        
        // Check regex pattern
        if (AD_PATTERN.matcher(lowerUrl).matches()) {
            blockedCount++;
            return true;
        }
        
        return false;
    }
    
    /**
     * Get a WebViewClient that blocks ads
     */
    public WebViewClient getAdBlockingWebViewClient() {
        return new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                
                if (shouldBlockUrl(url)) {
                    // Return empty response for blocked URLs
                    return new WebResourceResponse(
                        "text/plain",
                        "UTF-8",
                        new ByteArrayInputStream("".getBytes())
                    );
                }
                
                return super.shouldInterceptRequest(view, request);
            }
            
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                
                // Block navigation to ad URLs
                if (shouldBlockUrl(url)) {
                    return true; // Block the navigation
                }
                
                // Block popups/new window attempts
                if (request.isForMainFrame() && isExternalUrl(url, view.getUrl())) {
                    // Check if it's an ad redirect
                    if (shouldBlockUrl(url)) {
                        return true;
                    }
                }
                
                return false;
            }
            
            private boolean isExternalUrl(String url, String currentUrl) {
                try {
                    java.net.URL newUrl = new java.net.URL(url);
                    java.net.URL current = new java.net.URL(currentUrl);
                    return !newUrl.getHost().equals(current.getHost());
                } catch (Exception e) {
                    return false;
                }
            }
        };
    }
}
