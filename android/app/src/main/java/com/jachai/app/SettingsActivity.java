package com.jachai.app;

import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.annotation.ColorRes;
import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;
import androidx.annotation.StringRes;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.core.content.ContextCompat;
import androidx.core.os.LocaleListCompat;

import com.google.android.material.button.MaterialButtonToggleGroup;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.materialswitch.MaterialSwitch;
import com.jachai.app.api.ApiClient;
import com.jachai.app.api.ApiModels;

import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/** Appearance, language, text size and haptics work now; account-related rows are placeholders. */
public class SettingsActivity extends BaseActivity {
    private static final String CONTACT_URL = "https://www.linkedin.com/in/mohammad-saleh-5279512b4/";

    private EditText serverUrl;
    private TextView serverStatus, serverState;
    private View serverDot;
    private ObjectAnimator dotPulse;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);
        Insets.padForSystemBars(findViewById(R.id.scroll));

        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
        setUpTheme();
        setUpLanguage();
        setUpTextSize();

        MaterialSwitch vibrate = findViewById(R.id.switch_vibrate);
        vibrate.setChecked(UiPrefs.vibrateOnFake(this));
        vibrate.setOnCheckedChangeListener((b, on) -> UiPrefs.setVibrateOnFake(this, on));

        serverUrl = findViewById(R.id.server_url);
        serverStatus = findViewById(R.id.server_status);
        serverState = findViewById(R.id.server_state);
        serverDot = findViewById(R.id.server_dot);
        serverUrl.setText(ApiClient.getBaseUrl(this));
        findViewById(R.id.btn_save_server).setOnClickListener(v -> saveServerAndCheck());

        setUpInfoRows();
        checkHealth();
    }

    // ---------------------------------------------------------------- appearance

    private void setUpTheme() {
        MaterialButtonToggleGroup group = findViewById(R.id.theme_group);
        boolean dark = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES;
        group.check(dark ? R.id.theme_dark : R.id.theme_light);
        group.addOnButtonCheckedListener((g, id, checked) -> {
            if (!checked) return;
            UiPrefs.setTheme(this, id == R.id.theme_dark ? UiPrefs.THEME_DARK : UiPrefs.THEME_LIGHT);
        });
    }

    /** Follows the device language until the user picks one here. */
    private void setUpLanguage() {
        MaterialButtonToggleGroup group = findViewById(R.id.lang_group);
        LocaleListCompat current = AppCompatDelegate.getApplicationLocales();
        String language = current.isEmpty() ? Locale.getDefault().getLanguage() : current.get(0).getLanguage();
        group.check("bn".equals(language) ? R.id.lang_bn : R.id.lang_en);
        group.addOnButtonCheckedListener((g, id, checked) -> {
            if (!checked) return;
            AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(id == R.id.lang_bn ? "bn" : "en"));
        });
    }

    private void setUpTextSize() {
        MaterialButtonToggleGroup group = findViewById(R.id.size_group);
        int[] ids = {R.id.size_small, R.id.size_medium, R.id.size_large};
        group.check(ids[UiPrefs.textSize(this)]);
        group.addOnButtonCheckedListener((g, id, checked) -> {
            if (!checked) return;
            int size = id == R.id.size_small ? UiPrefs.SIZE_SMALL : id == R.id.size_medium ? UiPrefs.SIZE_MEDIUM : UiPrefs.SIZE_LARGE;
            if (size == UiPrefs.textSize(this)) return;
            UiPrefs.setTextSize(this, size);
            recreate();
        });
    }

    // ---------------------------------------------------------------- server

    private void saveServerAndCheck() {
        if (!ApiClient.setBaseUrl(this, serverUrl.getText().toString())) {
            serverStatus.setText(R.string.server_invalid_url);
            showConnection(R.color.status_bad, R.string.status_offline, false);
            return;
        }
        serverUrl.setText(ApiClient.getBaseUrl(this));
        checkHealth();
    }

    private void checkHealth() {
        serverStatus.setText(R.string.server_checking);
        showConnection(R.color.status_wait, R.string.status_checking, true);
        ApiClient.get(this).health().enqueue(new Callback<ApiModels.Health>() {
            @Override
            public void onResponse(@NonNull Call<ApiModels.Health> call, @NonNull Response<ApiModels.Health> response) {
                if (isFinishing()) return;
                ApiModels.Health h = response.body();
                if (response.isSuccessful() && h != null && "ok".equals(h.status)) {
                    serverStatus.setText(getString(h.mockMode ? R.string.server_ok_mock : R.string.server_ok, h.version));
                    showConnection(R.color.status_ok, R.string.status_connected, true);
                } else {
                    serverStatus.setText(getString(R.string.server_error_code, response.code()));
                    showConnection(R.color.status_bad, R.string.status_offline, false);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiModels.Health> call, @NonNull Throwable t) {
                if (isFinishing()) return;
                serverStatus.setText(R.string.server_unreachable);
                showConnection(R.color.status_bad, R.string.status_offline, false);
            }
        });
    }

    /** The coloured light next to "Server"; the word beside it means colour is never the only signal. */
    private void showConnection(@ColorRes int color, @StringRes int label, boolean pulse) {
        serverDot.setBackgroundTintList(ColorStateList.valueOf(ContextCompat.getColor(this, color)));
        serverState.setText(label);
        if (dotPulse != null) dotPulse.cancel();
        serverDot.setAlpha(1f);
        if (pulse) {
            dotPulse = ObjectAnimator.ofFloat(serverDot, View.ALPHA, 1f, 0.35f).setDuration(900);
            dotPulse.setRepeatMode(ValueAnimator.REVERSE);
            dotPulse.setRepeatCount(ValueAnimator.INFINITE);
            dotPulse.start();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (dotPulse != null) dotPulse.cancel();
    }

    // ---------------------------------------------------------------- help & info

    private void setUpInfoRows() {
        LinearLayout rows = findViewById(R.id.info_rows);
        addRow(rows, R.drawable.ic_info, getString(R.string.set_how_to), null, v -> new MaterialAlertDialogBuilder(this)
                .setTitle(R.string.set_how_to)
                .setMessage(R.string.how_to_body)
                .setPositiveButton(R.string.btn_ok, null)
                .show());
        addRow(rows, R.drawable.ic_shield_check, getString(R.string.set_privacy), getString(R.string.set_coming_soon), null);
        addRow(rows, R.drawable.ic_person, getString(R.string.set_contact), getString(R.string.set_contact_sub), v -> {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(CONTACT_URL)));
            } catch (ActivityNotFoundException ignored) {
                // no browser installed; nothing sensible to do
            }
        });
        addRow(rows, R.drawable.ic_history, getString(R.string.set_about),
                getString(R.string.about_fmt, BuildConfig.VERSION_NAME), null);
    }

    private void addRow(LinearLayout parent, @DrawableRes int icon, String title, String subtitle, View.OnClickListener click) {
        View row = LayoutInflater.from(this).inflate(R.layout.item_setting_row, parent, false);
        ((ImageView) row.findViewById(R.id.row_icon)).setImageResource(icon);
        ((TextView) row.findViewById(R.id.row_title)).setText(title);
        TextView sub = row.findViewById(R.id.row_subtitle);
        if (subtitle != null) {
            sub.setText(subtitle);
            sub.setVisibility(View.VISIBLE);
        }
        if (click != null) {
            row.setOnClickListener(click);
        } else {
            row.findViewById(R.id.row_chevron).setVisibility(View.GONE);
            row.setBackground(null);
        }
        parent.addView(row);
    }
}
