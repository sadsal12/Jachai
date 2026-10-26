package com.jachai.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.text.Editable;
import android.text.TextWatcher;
import android.text.format.DateUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.PickVisualMediaRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.jachai.app.bubble.BubbleService;
import com.jachai.app.ui.BigToggle;
import com.jachai.app.ui.FloatingNavBar;
import com.jachai.app.ui.WeekBars;

import java.util.Calendar;
import java.util.List;

/**
 * Home: four tabs (Text, Media, Bubble, Profile) behind a floating nav bar. The share sheet stays the main
 * entry point; these tabs are the in-app way to reach the same checks.
 */
public class MainActivity extends BaseActivity {
    private static final String STATE_TAB = "tab";
    private static final int TAB_TEXT = 0, TAB_MEDIA = 1, TAB_BUBBLE = 2, TAB_PROFILE = 3;

    private View[] pages;
    private FloatingNavBar nav;
    private EditText claimText;
    private BigToggle bubbleToggle;
    private TextView bubbleStatus;

    private final ActivityResultLauncher<PickVisualMediaRequest> pickMedia =
            registerForActivityResult(new ActivityResultContracts.PickVisualMedia(), this::onMediaPicked);

    private final ActivityResultLauncher<Intent> screenCaptureConsent =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                if (result.getResultCode() != RESULT_OK || result.getData() == null) return;
                ContextCompat.startForegroundService(this, new Intent(this, BubbleService.class)
                        .putExtra(BubbleService.EXTRA_RESULT_CODE, result.getResultCode())
                        .putExtra(BubbleService.EXTRA_RESULT_DATA, result.getData()));
                Toast.makeText(this, R.string.toast_bubble_started, Toast.LENGTH_LONG).show();
                showBubbleState(true, true);
                moveTaskToBack(true);  // get out of the way so the user can open the post
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        pages = new View[]{findViewById(R.id.page_text), findViewById(R.id.page_media),
                findViewById(R.id.page_bubble), findViewById(R.id.page_profile)};
        nav = findViewById(R.id.nav);
        claimText = findViewById(R.id.claim_text);
        bubbleToggle = findViewById(R.id.bubble_toggle);
        bubbleStatus = findViewById(R.id.bubble_status);
        applyInsets(findViewById(R.id.root));

        nav.addTab(R.drawable.ic_text, R.string.nav_text);
        nav.addTab(R.drawable.ic_image, R.string.nav_media);
        nav.addTab(R.drawable.ic_bubble, R.string.nav_bubble);
        nav.addTab(R.drawable.ic_person, R.string.nav_profile);
        nav.setOnTabSelectedListener(i -> showPage(i, true));
        nav.setOnTabReselectedListener(i -> ((ScrollView) pages[i]).smoothScrollTo(0, 0));
        int tab = savedInstanceState != null ? savedInstanceState.getInt(STATE_TAB, TAB_TEXT) : TAB_TEXT;
        nav.select(tab, false);
        showPage(tab, false);

        findViewById(R.id.btn_settings).setOnClickListener(v -> startActivity(new Intent(this, SettingsActivity.class)));

        // Text
        findViewById(R.id.btn_paste).setOnClickListener(v -> pasteFromClipboard());
        findViewById(R.id.btn_clear).setOnClickListener(v -> claimText.setText(""));
        findViewById(R.id.btn_check_text).setOnClickListener(v -> checkText());
        claimText.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override public void afterTextChanged(Editable s) {
                updateTextBox();
            }
        });
        updateTextBox();
        findViewById(R.id.tile_media).setOnClickListener(v -> goToTab(TAB_MEDIA));
        findViewById(R.id.tile_bubble).setOnClickListener(v -> goToTab(TAB_BUBBLE));

        // Media
        findViewById(R.id.btn_pick_photo).setOnClickListener(v -> pickMedia.launch(
                new PickVisualMediaRequest.Builder()
                        .setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE)
                        .build()));
        findViewById(R.id.btn_pick_video).setOnClickListener(v -> pickMedia.launch(
                new PickVisualMediaRequest.Builder()
                        .setMediaType(ActivityResultContracts.PickVisualMedia.VideoOnly.INSTANCE)
                        .build()));
        addInfoRows(findViewById(R.id.spot_list),
                new int[]{R.drawable.ic_image, R.drawable.ic_video, R.drawable.ic_screenshot},
                new int[]{R.string.spot_photo, R.string.spot_video, R.string.spot_screens});

        // Bubble
        addSteps(findViewById(R.id.bubble_steps),
                R.string.bubble_step1, R.string.bubble_step2, R.string.bubble_step3);
        bubbleToggle.setOnClickListener(v -> toggleBubble());

        // Profile
        findViewById(R.id.avatar).setOnClickListener(v ->
                Toast.makeText(this, R.string.toast_accounts_soon, Toast.LENGTH_SHORT).show());
        findViewById(R.id.btn_share_app).setOnClickListener(v -> shareApp());
        findViewById(R.id.btn_first_check).setOnClickListener(v -> {
            goToTab(TAB_TEXT);
            claimText.requestFocus();
        });
        findViewById(R.id.split_bar).setClipToOutline(true);
    }

    @Override
    protected void onResume() {
        super.onResume();
        showBubbleState(BubbleService.isRunning(), false);
        refreshHome();
        refreshProfile(false);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt(STATE_TAB, nav.getSelected());
    }

    // ---------------------------------------------------------------- layout

    private void showPage(int index, boolean animate) {
        for (int i = 0; i < pages.length; i++) pages[i].setVisibility(i == index ? View.VISIBLE : View.GONE);
        if (index == TAB_PROFILE) refreshProfile(animate);
        if (animate) {
            // A short fade + rise, so switching tabs feels connected rather than a hard cut.
            View page = pages[index];
            page.setAlpha(0f);
            page.setTranslationY(12 * getResources().getDisplayMetrics().density);
            page.animate().alpha(1f).translationY(0f).setDuration(180).start();
        }
    }

    private void goToTab(int index) {
        nav.select(index, true);
        showPage(index, true);
    }

    /** Keeps content clear of the system bars; hides the nav bar while the keyboard is up. */
    private void applyInsets(View root) {
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, windowInsets) -> {
            androidx.core.graphics.Insets bars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            androidx.core.graphics.Insets ime = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
            boolean typing = windowInsets.isVisible(WindowInsetsCompat.Type.ime());
            v.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
            nav.setVisibility(typing ? View.GONE : View.VISIBLE);
            return WindowInsetsCompat.CONSUMED;
        });
    }

    private void addSteps(LinearLayout container, int... steps) {
        LayoutInflater inflater = LayoutInflater.from(this);
        for (int i = 0; i < steps.length; i++) {
            View row = inflater.inflate(R.layout.item_step, container, false);
            ((TextView) row.findViewById(R.id.step_number)).setText(String.valueOf(i + 1));
            ((TextView) row.findViewById(R.id.step_text)).setText(steps[i]);
            if (i == steps.length - 1) row.findViewById(R.id.step_line).setVisibility(View.INVISIBLE);
            container.addView(row, i);
        }
    }

    private void addInfoRows(LinearLayout container, int[] icons, int[] texts) {
        LayoutInflater inflater = LayoutInflater.from(this);
        for (int i = 0; i < icons.length; i++) {
            View row = inflater.inflate(R.layout.item_info_row, container, false);
            ((ImageView) row.findViewById(R.id.info_icon)).setImageResource(icons[i]);
            ((TextView) row.findViewById(R.id.info_text)).setText(texts[i]);
            container.addView(row);
        }
    }

    // ---------------------------------------------------------------- bubble

    private void toggleBubble() {
        if (BubbleService.isRunning()) {
            startService(new Intent(this, BubbleService.class).setAction(BubbleService.ACTION_STOP));
            showBubbleState(false, true);
            return;
        }
        if (!Settings.canDrawOverlays(this)) {
            Toast.makeText(this, R.string.toast_overlay_permission, Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName())));
            return;
        }
        MediaProjectionManager mpm = getSystemService(MediaProjectionManager.class);
        screenCaptureConsent.launch(mpm.createScreenCaptureIntent());
    }

    private void showBubbleState(boolean on, boolean animate) {
        bubbleToggle.setChecked(on, animate);
        bubbleStatus.setText(on ? R.string.bubble_status_on : R.string.bubble_status_off);
    }

    // ---------------------------------------------------------------- text tab

    private void refreshHome() {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        ((TextView) findViewById(R.id.greeting)).setText(hour < 12 ? R.string.greeting_morning
                : hour < 17 ? R.string.greeting_afternoon : R.string.greeting_evening);
        int checks = UiPrefs.checksDone(this), fakes = UiPrefs.fakesCaught(this);
        String line;
        if (checks == 0) {
            line = getString(R.string.home_stats_none);
        } else {
            line = getResources().getQuantityString(R.plurals.home_stats_checks, checks, checks);
            if (fakes > 0) line = getString(R.string.home_stats_join, line,
                    getResources().getQuantityString(R.plurals.home_stats_fakes, fakes, fakes));
        }
        ((TextView) findViewById(R.id.home_stats)).setText(line);
    }

    /** Paste lives inside the empty box; once there's text it gives way to a clear button. */
    private void updateTextBox() {
        boolean empty = claimText.getText().toString().trim().isEmpty();
        findViewById(R.id.btn_paste).setVisibility(empty ? View.VISIBLE : View.GONE);
        findViewById(R.id.btn_clear).setVisibility(empty ? View.GONE : View.VISIBLE);
        // Still tappable when empty: it explains what to do instead of silently doing nothing.
        findViewById(R.id.btn_check_text).setAlpha(empty ? 0.5f : 1f);
    }

    // ---------------------------------------------------------------- checks

    private void pasteFromClipboard() {
        ClipboardManager clipboard = getSystemService(ClipboardManager.class);
        ClipData clip = clipboard != null ? clipboard.getPrimaryClip() : null;
        CharSequence text = clip != null && clip.getItemCount() > 0 ? clip.getItemAt(0).coerceToText(this) : null;
        if (text == null || text.toString().trim().isEmpty()) {
            Toast.makeText(this, R.string.toast_clipboard_empty, Toast.LENGTH_SHORT).show();
            return;
        }
        claimText.setText(text);
        claimText.setSelection(claimText.length());
    }

    private void checkText() {
        String text = claimText.getText().toString().trim();
        if (text.isEmpty()) {
            Toast.makeText(this, R.string.toast_enter_text, Toast.LENGTH_SHORT).show();
            return;
        }
        // Same entry point as the share sheet, so this exercises exactly the judged code path.
        startActivity(new Intent(Intent.ACTION_SEND)
                .setClass(this, VerdictActivity.class)
                .setType("text/plain")
                .putExtra(Intent.EXTRA_TEXT, text));
    }

    private void onMediaPicked(Uri uri) {
        if (uri == null) return;
        String type = getContentResolver().getType(uri);
        startActivity(new Intent(Intent.ACTION_SEND)
                .setClass(this, VerdictActivity.class)
                .setType(type != null ? type : "image/*")
                .putExtra(Intent.EXTRA_STREAM, uri)
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION));
    }

    // ---------------------------------------------------------------- profile

    private void refreshProfile(boolean animate) {
        int checks = UiPrefs.checksDone(this), fakes = UiPrefs.fakesCaught(this);
        findViewById(R.id.profile_empty).setVisibility(checks == 0 ? View.VISIBLE : View.GONE);
        findViewById(R.id.stats_group).setVisibility(checks == 0 ? View.GONE : View.VISIBLE);
        if (checks == 0) return;

        ((TextView) findViewById(R.id.stat_checks)).setText(String.valueOf(checks));
        ((TextView) findViewById(R.id.stat_fakes)).setText(String.valueOf(fakes));
        ((TextView) findViewById(R.id.stat_real)).setText(String.valueOf(checks - fakes));
        setWeight(findViewById(R.id.split_fake), fakes);
        setWeight(findViewById(R.id.split_real), checks - fakes);

        int[] week = UiPrefs.checksPerDay(this, 7);
        int weekTotal = 0;
        for (int n : week) weekTotal += n;
        WeekBars bars = findViewById(R.id.week_bars);
        bars.setCounts(week, animate);
        bars.setContentDescription(getResources().getQuantityString(R.plurals.week_cd, weekTotal, weekTotal));

        LinearLayout list = findViewById(R.id.recent_list);
        list.removeAllViews();
        List<UiPrefs.Check> recent = UiPrefs.recentChecks(this);
        findViewById(R.id.recent_empty).setVisibility(recent.isEmpty() ? View.VISIBLE : View.GONE);
        LayoutInflater inflater = LayoutInflater.from(this);
        for (UiPrefs.Check c : recent) {
            View row = inflater.inflate(R.layout.item_recent, list, false);
            ImageView icon = row.findViewById(R.id.recent_icon);
            icon.setImageResource(c.red ? R.drawable.ic_warning : R.drawable.ic_check_circle);
            icon.setBackgroundTintList(ColorStateList.valueOf(
                    ContextCompat.getColor(this, c.red ? R.color.verdict_red : R.color.verdict_green)));
            icon.setImageTintList(ColorStateList.valueOf(0xFFFFFFFF));
            ((TextView) row.findViewById(R.id.recent_title)).setText(getString(R.string.recent_row_fmt,
                    getString(kindLabel(c.kind)), getString(c.red ? R.string.recent_fake : R.string.recent_real)));
            long now = System.currentTimeMillis();
            ((TextView) row.findViewById(R.id.recent_time)).setText(now - c.time < DateUtils.MINUTE_IN_MILLIS
                    ? getString(R.string.recent_just_now)
                    : DateUtils.getRelativeTimeSpanString(c.time, now, DateUtils.MINUTE_IN_MILLIS));
            list.addView(row, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT));
        }
    }

    private static void setWeight(View v, int weight) {
        LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) v.getLayoutParams();
        lp.weight = weight;
        v.setLayoutParams(lp);
    }

    private static int kindLabel(String kind) {
        if ("video".equals(kind)) return R.string.kind_video;
        if ("photo".equals(kind)) return R.string.kind_photo;
        return R.string.kind_text;
    }

    private void shareApp() {
        Intent send = new Intent(Intent.ACTION_SEND).setType("text/plain")
                .putExtra(Intent.EXTRA_TEXT, getString(R.string.share_app_message));
        startActivity(Intent.createChooser(send, getString(R.string.btn_share_app)));
    }
}
