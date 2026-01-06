package app.lovable;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import app.lovable.plugins.AdBlockerPlugin;
import app.lovable.plugins.AdBlockerWebViewClient;

public class MainActivity extends BridgeActivity {
    
    private AdBlockerWebViewClient adBlockerClient;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register the AdBlocker plugin
        registerPlugin(AdBlockerPlugin.class);
        
        super.onCreate(savedInstanceState);
        
        // Get the WebView and apply ad blocking
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            setupAdBlocking(webView);
        }
    }
    
    private void setupAdBlocking(WebView webView) {
        // Create and set the ad-blocking WebViewClient
        adBlockerClient = new AdBlockerWebViewClient();
        webView.setWebViewClient(adBlockerClient);
        
        // Configure WebView settings for better ad blocking
        WebSettings settings = webView.getSettings();
        
        // Block popups
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        
        // Disable geolocation (often used for targeted ads)
        settings.setGeolocationEnabled(false);
        
        // Block mixed content (HTTP on HTTPS pages - often ads)
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    }
    
    /**
     * Get the number of blocked ads
     */
    public int getBlockedAdsCount() {
        if (adBlockerClient != null) {
            return adBlockerClient.getBlockedCount();
        }
        return 0;
    }
}
