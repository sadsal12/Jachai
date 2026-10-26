package com.jachai.app;

import android.app.Application;

/** Applies the saved light/dark choice before the first screen draws. */
public class JachaiApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        UiPrefs.applyTheme(UiPrefs.theme(this));
    }
}
