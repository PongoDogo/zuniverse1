package app.lovable.zuniverse;

import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import app.lovable.zuniverse.plugins.AdBlockerPlugin;
import app.lovable.zuniverse.plugins.AdBlockerWebViewClient;

public class MainActivity extends BridgeActivity {
    
    private AdBlockerWebViewClient adBlockerClient;
    private static final String TAG = "MainActivity";
    
    // Domains we allow to open (streaming sources only)
    private static final Set<String> ALLOWED_EXTERNAL_DOMAINS = new HashSet<>(Arrays.asList(
        "lovableproject.com", "lovable.dev"
    ));
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdBlockerPlugin.class);
        super.onCreate(savedInstanceState);
        
        new Handler(Looper.getMainLooper()).postDelayed(this::setupAdBlocking, 100);
    }
    
    /**
     * CRITICAL: Override startActivity to BLOCK all browser intents
     * This is the nuclear option - prevents ANY attempt to open external browser
     */
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED browser intent: " + intent.toString());
            return; // Simply don't start the activity - blocks the redirect
        }
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlockIntent(intent)) {
            android.util.Log.d(TAG, "BLOCKED browser intent with options: " + intent.toString());
            return;
        }
        super.startActivity(intent, options);
    }
    
    private boolean shouldBlockIntent(Intent intent) {
        if (intent == null) return false;
        
        String action = intent.getAction();
        Uri data = intent.getData();
        
        // Block VIEW intents with HTTP/HTTPS URLs (browser opens)
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            String scheme = data.getScheme();
            if ("http".equals(scheme) || "https".equals(scheme)) {
                String host = data.getHost();
                
                // Check if it's an allowed domain
                if (host != null && isAllowedDomain(host)) {
                    return false; // Allow this
                }
                
                // Block ALL other external URLs - this is the key fix!
                android.util.Log.d(TAG, "BLOCKING external URL: " + data.toString().substring(0, Math.min(100, data.toString().length())));
                return true;
            }
            
            // Block intent:// scheme URLs (often used for ad redirects)
            if ("intent".equals(scheme)) {
                android.util.Log.d(TAG, "BLOCKING intent:// URL");
                return true;
            }
            
            // Block market:// URLs (app store redirects from ads)
            if ("market".equals(scheme)) {
                android.util.Log.d(TAG, "BLOCKING market:// URL");
                return true;
            }
        }
        
        // Check if intent would open a browser app
        if (wouldOpenBrowser(intent)) {
            android.util.Log.d(TAG, "BLOCKING intent that would open browser");
            return true;
        }
        
        return false;
    }
    
    private boolean isAllowedDomain(String host) {
        if (host == null) return false;
        String lowerHost = host.toLowerCase();
        for (String allowed : ALLOWED_EXTERNAL_DOMAINS) {
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
                String packageName = info.activityInfo.packageName.toLowerCase();
                // Common browser package names
                if (packageName.contains("chrome") || 
                    packageName.contains("browser") || 
                    packageName.contains("firefox") ||
                    packageName.contains("opera") ||
                    packageName.contains("edge") ||
                    packageName.contains("samsung") ||
                    packageName.contains("brave")) {
                    return true;
                }
            }
        } catch (Exception e) {
            // If we can't check, assume it might open browser
        }
        return false;
    }
    
    private void setupAdBlocking() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView == null) {
                android.util.Log.e(TAG, "WebView is null");
                return;
            }
            
            adBlockerClient = new AdBlockerWebViewClient();
            webView.setWebViewClient(adBlockerClient);
            
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d(TAG, "Blocked popup window");
                    return false;
                }
            });
            
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            settings.setGeolocationEnabled(false);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            
            android.util.Log.d(TAG, "Ad blocking setup complete");
            
        } catch (Exception e) {
            android.util.Log.e(TAG, "Error: " + e.getMessage());
        }
    }
    
    public int getBlockedAdsCount() {
        return adBlockerClient != null ? adBlockerClient.getBlockedCount() : 0;
    }
}
