package app.lovable.zuniverse;

import android.app.Activity;
import android.app.Application;
import android.app.Instrumentation;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.util.Log;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;

/**
 * NUCLEAR APPLICATION V5 - SIMPLIFIED
 * 
 * Hooks into Android's Instrumentation to block ALL external app launches
 * at the deepest system level possible.
 */
public class ZuniverseApplication extends Application {
    
    private static final String TAG = "ZUNIVERSE_APP";
    private static int blocked = 0;
    
    @Override
    public void onCreate() {
        super.onCreate();
        hookInstrumentation();
        Log.d(TAG, "=== APPLICATION BLOCKER ACTIVE ===");
    }
    
    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        hookInstrumentation();
    }
    
    /**
     * Replace system Instrumentation with our blocking version
     */
    private void hookInstrumentation() {
        try {
            Class<?> activityThreadClass = Class.forName("android.app.ActivityThread");
            Method currentActivityThread = activityThreadClass.getDeclaredMethod("currentActivityThread");
            currentActivityThread.setAccessible(true);
            Object activityThread = currentActivityThread.invoke(null);
            
            if (activityThread == null) return;
            
            Field instrumentationField = activityThreadClass.getDeclaredField("mInstrumentation");
            instrumentationField.setAccessible(true);
            
            Instrumentation original = (Instrumentation) instrumentationField.get(activityThread);
            
            if (original instanceof BlockingInstrumentation) return;
            
            instrumentationField.set(activityThread, new BlockingInstrumentation(original, this));
            
            Log.d(TAG, "Instrumentation hook installed");
            
        } catch (Exception e) {
            Log.e(TAG, "Hook failed: " + e.getMessage());
        }
    }
    
    @Override
    public void startActivity(Intent intent) {
        if (shouldBlock(intent)) return;
        super.startActivity(intent);
    }
    
    @Override
    public void startActivity(Intent intent, Bundle options) {
        if (shouldBlock(intent)) return;
        super.startActivity(intent, options);
    }
    
    private boolean shouldBlock(Intent intent) {
        if (intent == null) return false;
        
        if (Intent.ACTION_VIEW.equals(intent.getAction())) {
            Log.d(TAG, "★ BLOCKED ACTION_VIEW: " + intent.getData());
            blocked++;
            return true;
        }
        
        try {
            List<ResolveInfo> activities = getPackageManager()
                .queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
            
            for (ResolveInfo info : activities) {
                if (info.activityInfo != null && !getPackageName().equals(info.activityInfo.packageName)) {
                    Log.d(TAG, "★ BLOCKED EXTERNAL: " + info.activityInfo.packageName);
                    blocked++;
                    return true;
                }
            }
        } catch (Exception e) {
            blocked++;
            return true;
        }
        
        return false;
    }
    
    public static int getBlockedCount() {
        return blocked;
    }
    
    /**
     * Custom Instrumentation that intercepts ALL activity launches
     */
    private static class BlockingInstrumentation extends Instrumentation {
        
        private final Instrumentation original;
        private final Context appContext;
        
        BlockingInstrumentation(Instrumentation original, Context appContext) {
            this.original = original;
            this.appContext = appContext;
        }
        
        @Override
        public ActivityResult execStartActivity(
                Context who, android.os.IBinder contextThread, android.os.IBinder token,
                Activity target, Intent intent, int requestCode, Bundle options) {
            
            if (shouldBlockIntent(intent)) {
                Log.d(TAG, "★ INSTRUMENTATION BLOCKED: " + intent);
                return null;
            }
            
            try {
                Method method = Instrumentation.class.getDeclaredMethod(
                    "execStartActivity",
                    Context.class, android.os.IBinder.class, android.os.IBinder.class,
                    Activity.class, Intent.class, int.class, Bundle.class
                );
                method.setAccessible(true);
                return (ActivityResult) method.invoke(original, who, contextThread, token, target, intent, requestCode, options);
            } catch (Exception e) {
                return null;
            }
        }
        
        @Override
        public ActivityResult execStartActivity(
                Context who, android.os.IBinder contextThread, android.os.IBinder token,
                String target, Intent intent, int requestCode, Bundle options) {
            
            if (shouldBlockIntent(intent)) {
                Log.d(TAG, "★ INSTRUMENTATION BLOCKED (String): " + intent);
                return null;
            }
            
            try {
                Method method = Instrumentation.class.getDeclaredMethod(
                    "execStartActivity",
                    Context.class, android.os.IBinder.class, android.os.IBinder.class,
                    String.class, Intent.class, int.class, Bundle.class
                );
                method.setAccessible(true);
                return (ActivityResult) method.invoke(original, who, contextThread, token, target, intent, requestCode, options);
            } catch (Exception e) {
                return null;
            }
        }
        
        private boolean shouldBlockIntent(Intent intent) {
            if (intent == null) return false;
            
            // BLOCK ALL ACTION_VIEW
            if (Intent.ACTION_VIEW.equals(intent.getAction())) {
                blocked++;
                return true;
            }
            
            // Block external apps
            try {
                PackageManager pm = appContext.getPackageManager();
                List<ResolveInfo> activities = pm.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
                
                for (ResolveInfo info : activities) {
                    if (info.activityInfo != null && !appContext.getPackageName().equals(info.activityInfo.packageName)) {
                        blocked++;
                        return true;
                    }
                }
            } catch (Exception e) {
                blocked++;
                return true;
            }
            
            return false;
        }
        
        // Delegate all standard methods to original
        @Override public void onCreate(Bundle arguments) { original.onCreate(arguments); }
        @Override public void start() { original.start(); }
        @Override public void onStart() { original.onStart(); }
        @Override public boolean onException(Object obj, Throwable e) { return original.onException(obj, e); }
        @Override public void sendStatus(int resultCode, Bundle results) { original.sendStatus(resultCode, results); }
        @Override public void finish(int resultCode, Bundle results) { original.finish(resultCode, results); }
        @Override public void onDestroy() { original.onDestroy(); }
        @Override public Context getContext() { return original.getContext(); }
        @Override public Context getTargetContext() { return original.getTargetContext(); }
        @Override public boolean isProfiling() { return original.isProfiling(); }
        @Override public void startProfiling() { original.startProfiling(); }
        @Override public void stopProfiling() { original.stopProfiling(); }
        @Override public void setInTouchMode(boolean inTouch) { original.setInTouchMode(inTouch); }
        @Override public void waitForIdle(Runnable recipient) { original.waitForIdle(recipient); }
        @Override public void waitForIdleSync() { original.waitForIdleSync(); }
        @Override public void runOnMainSync(Runnable runner) { original.runOnMainSync(runner); }
        
        @Override
        public Activity startActivitySync(Intent intent) {
            if (shouldBlockIntent(intent)) return null;
            return original.startActivitySync(intent);
        }
        
        @Override public void addMonitor(ActivityMonitor monitor) { original.addMonitor(monitor); }
        @Override public ActivityMonitor addMonitor(android.content.IntentFilter filter, ActivityResult result, boolean block) { return original.addMonitor(filter, result, block); }
        @Override public ActivityMonitor addMonitor(String cls, ActivityResult result, boolean block) { return original.addMonitor(cls, result, block); }
        @Override public boolean checkMonitorHit(ActivityMonitor monitor, int minHits) { return original.checkMonitorHit(monitor, minHits); }
        @Override public Activity waitForMonitor(ActivityMonitor monitor) { return original.waitForMonitor(monitor); }
        @Override public Activity waitForMonitorWithTimeout(ActivityMonitor monitor, long timeOut) { return original.waitForMonitorWithTimeout(monitor, timeOut); }
        @Override public void removeMonitor(ActivityMonitor monitor) { original.removeMonitor(monitor); }
        @Override public boolean invokeMenuActionSync(Activity targetActivity, int id, int flag) { return original.invokeMenuActionSync(targetActivity, id, flag); }
        @Override public boolean invokeContextMenuAction(Activity targetActivity, int id, int flag) { return original.invokeContextMenuAction(targetActivity, id, flag); }
        @Override public void sendStringSync(String text) { original.sendStringSync(text); }
        @Override public void sendKeySync(android.view.KeyEvent event) { original.sendKeySync(event); }
        @Override public void sendKeyDownUpSync(int key) { original.sendKeyDownUpSync(key); }
        @Override public void sendCharacterSync(int keyCode) { original.sendCharacterSync(keyCode); }
        @Override public void sendPointerSync(android.view.MotionEvent event) { original.sendPointerSync(event); }
        @Override public void sendTrackballEventSync(android.view.MotionEvent event) { original.sendTrackballEventSync(event); }
        
        @Override
        public Application newApplication(ClassLoader cl, String className, Context context)
                throws InstantiationException, IllegalAccessException, ClassNotFoundException {
            return original.newApplication(cl, className, context);
        }
        
        @Override public void callApplicationOnCreate(Application app) { original.callApplicationOnCreate(app); }
        
        @Override
        public Activity newActivity(Class<?> clazz, Context context, android.os.IBinder token,
                Application application, Intent intent, android.content.pm.ActivityInfo info,
                CharSequence title, Activity parent, String id,
                Object lastNonConfigurationInstance) throws InstantiationException, IllegalAccessException {
            return original.newActivity(clazz, context, token, application, intent, info, title, parent, id, lastNonConfigurationInstance);
        }
        
        @Override
        public Activity newActivity(ClassLoader cl, String className, Intent intent)
                throws InstantiationException, IllegalAccessException, ClassNotFoundException {
            return original.newActivity(cl, className, intent);
        }
        
        @Override public void callActivityOnCreate(Activity activity, Bundle icicle) { original.callActivityOnCreate(activity, icicle); }
        @Override public void callActivityOnDestroy(Activity activity) { original.callActivityOnDestroy(activity); }
        @Override public void callActivityOnRestoreInstanceState(Activity activity, Bundle savedInstanceState) { original.callActivityOnRestoreInstanceState(activity, savedInstanceState); }
        @Override public void callActivityOnPostCreate(Activity activity, Bundle icicle) { original.callActivityOnPostCreate(activity, icicle); }
        @Override public void callActivityOnNewIntent(Activity activity, Intent intent) { original.callActivityOnNewIntent(activity, intent); }
        @Override public void callActivityOnStart(Activity activity) { original.callActivityOnStart(activity); }
        @Override public void callActivityOnRestart(Activity activity) { original.callActivityOnRestart(activity); }
        @Override public void callActivityOnResume(Activity activity) { original.callActivityOnResume(activity); }
        @Override public void callActivityOnStop(Activity activity) { original.callActivityOnStop(activity); }
        @Override public void callActivityOnSaveInstanceState(Activity activity, Bundle outState) { original.callActivityOnSaveInstanceState(activity, outState); }
        @Override public void callActivityOnPause(Activity activity) { original.callActivityOnPause(activity); }
        @Override public void callActivityOnUserLeaving(Activity activity) { original.callActivityOnUserLeaving(activity); }
    }
}
