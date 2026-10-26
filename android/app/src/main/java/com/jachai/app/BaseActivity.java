package com.jachai.app;

import android.content.Context;
import android.content.res.Configuration;

import androidx.appcompat.app.AppCompatActivity;

/** Applies the in-app text size (Small / Medium / Large) on top of the phone's own font size. */
public abstract class BaseActivity extends AppCompatActivity {
    private static final float MAX_FONT_SCALE = 2f;

    private float appliedScale;

    @Override
    protected void attachBaseContext(Context base) {
        appliedScale = UiPrefs.fontScale(base);
        Configuration config = new Configuration(base.getResources().getConfiguration());
        config.fontScale = Math.min(config.fontScale * appliedScale, MAX_FONT_SCALE);
        super.attachBaseContext(base.createConfigurationContext(config));
    }

    /** Screens left in the back stack pick up a text size changed in Settings when they come back. */
    @Override
    protected void onResume() {
        super.onResume();
        if (UiPrefs.fontScale(this) != appliedScale) recreate();
    }
}
