package app.lovable.zuniverse;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.View;

import com.getcapacitor.BridgeActivity;

import app.lovable.zuniverse.plugins.AdBlockerPlugin;
import app.lovable.zuniverse.plugins.AdBlockerWebViewClient;

public class MainActivity extends BridgeActivity {
    
    private AdBlockerWebViewClient adBlockerClient;
    private static final String TAG = "MainActivity";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register the AdBlocker plugin BEFORE super.onCreate
        registerPlugin(AdBlockerPlugin.class);
        
        super.onCreate(savedInstanceState);
        
        // Use a handler to ensure we set the WebViewClient AFTER Capacitor fully initializes
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                setupAdBlocking();
            }
        }, 100);
    }
    
    private void setupAdBlocking() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView == null) {
                android.util.Log.e(TAG, "WebView is null, cannot setup ad blocking");
                return;
            }
            
            // Create and set our custom ad-blocking WebViewClient
            adBlockerClient = new AdBlockerWebViewClient();
            webView.setWebViewClient(adBlockerClient);
            
            // Set custom WebChromeClient to block popups at browser level
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    // Block ALL new window creation (this catches most popup ads)
                    android.util.Log.d(TAG, "Blocked popup window creation");
                    return false;
                }
                
                @Override
                public void onCloseWindow(WebView window) {
                    // Handle close
                    super.onCloseWindow(window);
                }
            });
            
            // Configure WebView settings for aggressive ad blocking
            WebSettings settings = webView.getSettings();
            
            // Block popups and new windows completely
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            
            // Disable geolocation (used for targeted ads)
            settings.setGeolocationEnabled(false);
            
            // Block mixed content (HTTP on HTTPS - often ads)
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            
            // Disable third-party cookies (tracking)
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
            
            // Enable safe browsing
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            android.util.Log.d(TAG, "Ad blocking setup complete");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Error setting up ad blocking: " + e.getMessage());
        }
    }
    
    public int getBlockedAdsCount() {
        if (adBlockerClient != null) {
            return adBlockerClient.getBlockedCount();
        }
        return 0;
    }
}
