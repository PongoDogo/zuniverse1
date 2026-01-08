package app.lovable.zuniverse;

import android.app.Application;
import android.util.Log;

/**
 * CLEAN APPLICATION CLASS - PLAY STORE COMPLIANT
 * 
 * This class contains NO reflection, NO instrumentation hooks, NO system hacks.
 * It only provides basic application initialization.
 * 
 * All ad blocking is handled in MainActivity using standard WebView APIs.
 */
public class ZuniverseApplication extends Application {
    
    private static final String TAG = "ZUNIVERSE_APP";
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "ZUniverse Application initialized - Clean Ad Blocker");
    }
}
