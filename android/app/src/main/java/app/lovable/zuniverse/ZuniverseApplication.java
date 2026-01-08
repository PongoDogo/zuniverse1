package app.lovable.zuniverse;

import android.app.Activity;
import android.app.Application;
import android.app.Instrumentation;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * NUCLEAR APPLICATION CLASS
 * 
 * This hooks into the Instrumentation class which is the ONLY bottleneck
 * for ALL activity launches in Android. This catches everything including:
 * - WebView internal launches (via AwContents)
 * - Context.startActivity
 * - Activity.startActivity
 * - Implicit and explicit intents
 */
public class ZuniverseApplication extends Application {
    
    private static final String TAG = "ZUNIVERSE_NUCLEAR_APP";
    private static int blockedCount = 0;
    
    @Override
    public void onCreate() {
        super.onCreate();
        hookInstrumentation();
        Log.d(TAG, "=== NUCLEAR APPLICATION INITIALIZED ===");
    }
    
    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        // Hook as early as possible
        hookInstrumentation();
    }
    
    /**
     * Replace the system Instrumentation with our blocking version.
     * This is the NUCLEAR option that intercepts ALL activity launches at the deepest level.
     */
    private void hookInstrumentation() {
        try {
            // Get ActivityThread class
            Class<?> activityThreadClass = Class.forName("android.app.ActivityThread");
            
            // Get current ActivityThread instance
            Method currentActivityThread = activityThreadClass.getDeclaredMethod("currentActivityThread");
            currentActivityThread.setAccessible(true);
            Object activityThread = currentActivityThread.invoke(null);
            
            // Get the mInstrumentation field
            Field instrumentationField = activityThreadClass.getDeclaredField("mInstrumentation");
            instrumentationField.setAccessible(true);
            
            // Get current instrumentation
            Instrumentation originalInstrumentation = (Instrumentation) instrumentationField.get(activityThread);
            
            // Check if already hooked
            if (originalInstrumentation instanceof NuclearInstrumentation) {
                Log.d(TAG, "Instrumentation already hooked");
                return;
            }
            
            // Replace with our nuclear version
            NuclearInstrumentation nuclearInstrumentation = new NuclearInstrumentation(originalInstrumentation, this);
            instrumentationField.set(activityThread, nuclearInstrumentation);
            
            Log.d(TAG, "=== INSTRUMENTATION HOOKED SUCCESSFULLY ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to hook Instrumentation: " + e.getMessage(), e);
        }
    }
    
    public static int getBlockedCount() {
        return blockedCount;
    }
    
    /**
     * Custom Instrumentation that intercepts ALL activity launches
     */
    public static class NuclearInstrumentation extends Instrumentation {
        
        private final Instrumentation original;
        private final Context appContext;
        
        // STRICT whitelist - only our app's package
        private static final Set<String> BLOCKED_BROWSER_PACKAGES = new HashSet<>(Arrays.asList(
            "com.android.browser",
            "com.android.chrome",
            "com.chrome.beta",
            "com.chrome.dev",
            "com.chrome.canary",
            "com.google.android.browser",
            "org.mozilla.firefox",
            "org.mozilla.firefox_beta",
            "org.mozilla.fennec",
            "com.opera.browser",
            "com.opera.mini.native",
            "com.microsoft.emmx",
            "com.brave.browser",
            "com.duckduckgo.mobile.android",
            "com.vivaldi.browser",
            "com.sec.android.app.sbrowser",
            "com.samsung.android.app.sbrowser",
            "com.huawei.browser",
            "com.mi.globalbrowser",
            "com.UCMobile.intl",
            "com.ksmobile.cb",
            "mobi.mgeek.TunnyBrowser",
            "com.uc.browser.en",
            "org.chromium.webview_shell"
        ));
        
        public NuclearInstrumentation(Instrumentation original, Context appContext) {
            this.original = original;
            this.appContext = appContext;
        }
        
        /**
         * This is THE method that all activity launches eventually go through.
         * By blocking here, we block EVERYTHING.
         */
        public ActivityResult execStartActivity(
                Context who, IBinder contextThread, IBinder token,
                Activity target, Intent intent, int requestCode, Bundle options) {
            
            if (shouldBlockIntent(intent)) {
                Log.d(TAG, "★★★ NUCLEAR BLOCKED: " + intent);
                blockedCount++;
                // Return a fake "canceled" result
                return new ActivityResult(Activity.RESULT_CANCELED, null);
            }
            
            // Use reflection to call the original method
            try {
                Method method = Instrumentation.class.getDeclaredMethod(
                    "execStartActivity",
                    Context.class, IBinder.class, IBinder.class,
                    Activity.class, Intent.class, int.class, Bundle.class
                );
                method.setAccessible(true);
                return (ActivityResult) method.invoke(original, who, contextThread, token, target, intent, requestCode, options);
            } catch (Exception e) {
                Log.e(TAG, "execStartActivity error: " + e.getMessage());
                return new ActivityResult(Activity.RESULT_CANCELED, null);
            }
        }
        
        // Override for Fragment-based launches (API 16+)
        public ActivityResult execStartActivity(
                Context who, IBinder contextThread, IBinder token,
                String target, Intent intent, int requestCode, Bundle options) {
            
            if (shouldBlockIntent(intent)) {
                Log.d(TAG, "★★★ NUCLEAR BLOCKED (Fragment): " + intent);
                blockedCount++;
                return new ActivityResult(Activity.RESULT_CANCELED, null);
            }
            
            try {
                Method method = Instrumentation.class.getDeclaredMethod(
                    "execStartActivity",
                    Context.class, IBinder.class, IBinder.class,
                    String.class, Intent.class, int.class, Bundle.class
                );
                method.setAccessible(true);
                return (ActivityResult) method.invoke(original, who, contextThread, token, target, intent, requestCode, options);
            } catch (Exception e) {
                Log.e(TAG, "execStartActivity (Fragment) error: " + e.getMessage());
                return new ActivityResult(Activity.RESULT_CANCELED, null);
            }
        }
        
        private boolean shouldBlockIntent(Intent intent) {
            if (intent == null) return false;
            
            String action = intent.getAction();
            
            // Block ALL ACTION_VIEW intents - this is how browsers are launched
            if (Intent.ACTION_VIEW.equals(action)) {
                Log.d(TAG, "BLOCKING ACTION_VIEW: " + intent.getData());
                return true;
            }
            
            // Block if explicitly targeting a browser
            String targetPackage = intent.getPackage();
            if (targetPackage != null && BLOCKED_BROWSER_PACKAGES.contains(targetPackage)) {
                Log.d(TAG, "BLOCKING browser package: " + targetPackage);
                return true;
            }
            
            // Check component
            if (intent.getComponent() != null) {
                String pkg = intent.getComponent().getPackageName();
                if (BLOCKED_BROWSER_PACKAGES.contains(pkg)) {
                    Log.d(TAG, "BLOCKING browser component: " + pkg);
                    return true;
                }
            }
            
            // Block any intent that resolves to a browser or external app
            try {
                List<ResolveInfo> resolvers = appContext.getPackageManager()
                    .queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
                
                String myPackage = appContext.getPackageName();
                
                for (ResolveInfo info : resolvers) {
                    String pkg = info.activityInfo.packageName;
                    
                    // Block if it's not our app
                    if (!pkg.equals(myPackage)) {
                        // Check if it's any browser
                        if (BLOCKED_BROWSER_PACKAGES.contains(pkg)) {
                            Log.d(TAG, "BLOCKING resolved browser: " + pkg);
                            return true;
                        }
                        
                        // Block if the intent has a browsable category
                        if (intent.hasCategory(Intent.CATEGORY_BROWSABLE)) {
                            Log.d(TAG, "BLOCKING BROWSABLE intent to: " + pkg);
                            return true;
                        }
                        
                        // Block if it's an HTTP(S) URL going to external app
                        if (intent.getData() != null) {
                            String scheme = intent.getData().getScheme();
                            if ("http".equals(scheme) || "https".equals(scheme) || 
                                "intent".equals(scheme) || "market".equals(scheme)) {
                                Log.d(TAG, "BLOCKING HTTP/intent URL to external: " + pkg);
                                return true;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error checking intent: " + e.getMessage());
                // Block if we can't verify
                return true;
            }
            
            return false;
        }
        
        // Delegate all other Instrumentation methods to original
        
        @Override
        public void onCreate(Bundle arguments) {
            original.onCreate(arguments);
        }
        
        @Override
        public void start() {
            original.start();
        }
        
        @Override
        public void onStart() {
            original.onStart();
        }
        
        @Override
        public boolean onException(Object obj, Throwable e) {
            return original.onException(obj, e);
        }
        
        @Override
        public void callActivityOnCreate(Activity activity, Bundle icicle) {
            original.callActivityOnCreate(activity, icicle);
        }
        
        @Override
        public void callActivityOnDestroy(Activity activity) {
            original.callActivityOnDestroy(activity);
        }
        
        @Override
        public void callActivityOnRestoreInstanceState(Activity activity, Bundle savedInstanceState) {
            original.callActivityOnRestoreInstanceState(activity, savedInstanceState);
        }
        
        @Override
        public void callActivityOnPostCreate(Activity activity, Bundle savedInstanceState) {
            original.callActivityOnPostCreate(activity, savedInstanceState);
        }
        
        @Override
        public void callActivityOnNewIntent(Activity activity, Intent intent) {
            original.callActivityOnNewIntent(activity, intent);
        }
        
        @Override
        public void callActivityOnStart(Activity activity) {
            original.callActivityOnStart(activity);
        }
        
        @Override
        public void callActivityOnRestart(Activity activity) {
            original.callActivityOnRestart(activity);
        }
        
        @Override
        public void callActivityOnResume(Activity activity) {
            original.callActivityOnResume(activity);
        }
        
        @Override
        public void callActivityOnStop(Activity activity) {
            original.callActivityOnStop(activity);
        }
        
        @Override
        public void callActivityOnSaveInstanceState(Activity activity, Bundle outState) {
            original.callActivityOnSaveInstanceState(activity, outState);
        }
        
        @Override
        public void callActivityOnPause(Activity activity) {
            original.callActivityOnPause(activity);
        }
        
        @Override
        public void callActivityOnUserLeaving(Activity activity) {
            original.callActivityOnUserLeaving(activity);
        }
        
        @Override
        public Activity newActivity(ClassLoader cl, String className, Intent intent)
                throws InstantiationException, IllegalAccessException, ClassNotFoundException {
            return original.newActivity(cl, className, intent);
        }
        
        @Override
        public Activity newActivity(Class<?> clazz, Context context, IBinder token,
                Application application, Intent intent, android.content.pm.ActivityInfo info,
                CharSequence title, Activity parent, String id,
                Object lastNonConfigurationInstance) throws InstantiationException, IllegalAccessException {
            return original.newActivity(clazz, context, token, application, intent, info, 
                title, parent, id, lastNonConfigurationInstance);
        }
    }
}
