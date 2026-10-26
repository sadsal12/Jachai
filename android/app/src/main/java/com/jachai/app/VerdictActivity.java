package com.jachai.app;

import android.animation.ObjectAnimator;
import android.animation.PropertyValuesHolder;
import android.animation.ValueAnimator;
import android.content.ComponentName;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.animation.OvershootInterpolator;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import androidx.annotation.ColorRes;
import androidx.annotation.NonNull;
import androidx.annotation.StringRes;
import androidx.core.content.ContextCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.button.MaterialButton;
import com.jachai.app.api.ApiClient;
import com.jachai.app.api.ApiModels;
import com.jachai.app.api.ApiService;
import com.jachai.app.share.SharedContent;
import com.jachai.app.share.UriFiles;

import java.io.File;
import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Share sheet → upload → poll /result every 1.5 s → red/green verdict hero with plain-language certainty and advice.
 * States: loading, result, error. Never crashes on bad input; every failure lands on the error state.
 */
public class VerdictActivity extends BaseActivity {
    private static final long POLL_INTERVAL_MS = 1500;
    private static final long MAX_WAIT_MS = 25_000;
    private static final long TIP_INTERVAL_MS = 2200;
    private static final long MAX_UPLOAD_BYTES = 50L * 1024 * 1024;
    // CONFIRM/REJECT are distinct "success"/"warning" patterns on Android 11+; older phones get a plain buzz.
    private static final int HAPTIC_CONFIRM = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
            ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.VIRTUAL_KEY;
    private static final int HAPTIC_REJECT = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
            ? HapticFeedbackConstants.REJECT : HapticFeedbackConstants.LONG_PRESS;
    // Two firm pulses for "fake": felt even when the phone's touch feedback is turned off.
    private static final long[] FAKE_BUZZ = {0, 350, 180, 350};
    private static final int VERY_SURE = 85, FAIRLY_SURE = 65;
    private static final String ENGINE_FALLBACK = "fallback";

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();

    private ApiService api;
    private Call<?> inFlight;
    private String jobId;
    private long startedAt;
    private File tempFile;
    private int tipIndex;

    private View root, loadingGroup, resultGroup, hero, certaintyCard, adviceCard, buttonBar, loadingIcon;
    private TextView loadingTip, titleBn, titleEn, explanationBn, explanationEn, confidenceLabel, detail;
    private TextView certaintyWord, advice;
    private ImageView icon, adviceIcon;
    private ProgressBar confidenceBar;
    private MaterialButton retryButton, shareButton;
    private ApiModels.Result lastResult;
    private ObjectAnimator loadingPulse;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this, SystemBarStyle.dark(Color.TRANSPARENT),
                SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT));
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_verdict);

        root = findViewById(R.id.root);
        loadingGroup = findViewById(R.id.loading_group);
        resultGroup = findViewById(R.id.result_group);
        loadingTip = findViewById(R.id.loading_tip);
        loadingIcon = findViewById(R.id.loading_icon);
        hero = findViewById(R.id.hero);
        icon = findViewById(R.id.verdict_icon);
        titleBn = findViewById(R.id.verdict_title_bn);
        titleEn = findViewById(R.id.verdict_title_en);
        certaintyCard = findViewById(R.id.certainty_card);
        certaintyWord = findViewById(R.id.certainty_word);
        adviceCard = findViewById(R.id.advice_card);
        adviceIcon = findViewById(R.id.advice_icon);
        advice = findViewById(R.id.advice);
        explanationBn = findViewById(R.id.explanation_bn);
        explanationEn = findViewById(R.id.explanation_en);
        confidenceBar = findViewById(R.id.confidence_bar);
        confidenceLabel = findViewById(R.id.confidence_label);
        detail = findViewById(R.id.detail);
        buttonBar = findViewById(R.id.button_bar);
        retryButton = findViewById(R.id.btn_retry);
        shareButton = findViewById(R.id.btn_share);
        applyInsets();

        findViewById(R.id.btn_done).setOnClickListener(v -> finish());
        retryButton.setOnClickListener(v -> start(getIntent()));
        shareButton.setOnClickListener(v -> shareResult());

        api = ApiClient.get(this);
        start(getIntent());
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacksAndMessages(null);
        if (inFlight != null) inFlight.cancel();
        if (loadingPulse != null) loadingPulse.cancel();
        io.shutdownNow();
        deleteTempFile();
    }

    // ---------------------------------------------------------------- flow

    private void start(Intent intent) {
        showLoading();
        SharedContent content = SharedContent.from(this, intent);
        if (content == null) {
            showError(R.string.error_nothing_shared);
            return;
        }
        startedAt = SystemClock.elapsedRealtime();
        if (content.isText()) {
            submitText(content.text);
        } else if (!content.isSupportedMedia()) {
            showError(R.string.error_unsupported);
        } else {
            if (content.hadMultiple) Toast.makeText(this, R.string.toast_first_item_only, Toast.LENGTH_SHORT).show();
            submitMedia(content);
        }
    }

    private void submitText(String text) {
        Call<ApiModels.JobCreated> call = api.verifyText(new ApiModels.TextRequest(text));
        inFlight = call;
        call.enqueue(jobCallback);
    }

    private void submitMedia(SharedContent content) {
        io.execute(() -> {
            try {
                deleteTempFile();
                tempFile = UriFiles.copyToCache(this, content.uri, content.mimeType, MAX_UPLOAD_BYTES);
                String fallbackName = content.isVideo() ? "shared.mp4" : "shared.jpg";
                String name = UriFiles.displayName(this, content.uri, fallbackName);
                RequestBody body = RequestBody.create(tempFile, MediaType.parse(content.mimeType));
                MultipartBody.Part part = MultipartBody.Part.createFormData("file", name, body);
                runOnUiThread(() -> {
                    if (isFinishing() || isDestroyed()) return;
                    Call<ApiModels.JobCreated> call = api.verifyMedia(part);
                    inFlight = call;
                    call.enqueue(jobCallback);
                });
            } catch (UriFiles.TooLargeException e) {
                runOnUiThread(() -> showError(R.string.error_too_large));
            } catch (IOException | SecurityException e) {
                runOnUiThread(() -> showError(R.string.error_cannot_read));
            }
        });
    }

    private final Callback<ApiModels.JobCreated> jobCallback = new Callback<ApiModels.JobCreated>() {
        @Override
        public void onResponse(@NonNull Call<ApiModels.JobCreated> call, @NonNull Response<ApiModels.JobCreated> response) {
            if (isFinishing()) return;
            ApiModels.JobCreated job = response.body();
            if (!response.isSuccessful() || job == null || job.jobId == null) {
                showError(errorForHttp(response.code()));
                return;
            }
            jobId = job.jobId;
            handler.postDelayed(VerdictActivity.this::poll, job.pollAfterMs > 0 ? job.pollAfterMs : POLL_INTERVAL_MS);
        }

        @Override
        public void onFailure(@NonNull Call<ApiModels.JobCreated> call, @NonNull Throwable t) {
            if (!call.isCanceled() && !isFinishing()) showError(errorForThrowable(t));
        }
    };

    private void poll() {
        Call<ApiModels.Result> call = api.result(jobId);
        inFlight = call;
        call.enqueue(new Callback<ApiModels.Result>() {
            @Override
            public void onResponse(@NonNull Call<ApiModels.Result> call, @NonNull Response<ApiModels.Result> response) {
                if (isFinishing()) return;
                ApiModels.Result result = response.body();
                if (!response.isSuccessful() || result == null) {
                    showError(errorForHttp(response.code()));
                } else if (result.isFinished() && result.verdict != null) {
                    showResult(result);
                } else {
                    pollAgainOrGiveUp();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiModels.Result> call, @NonNull Throwable t) {
                if (call.isCanceled() || isFinishing()) return;
                pollAgainOrGiveUp();  // a dropped poll on flaky Wi-Fi shouldn't kill the check
            }
        });
    }

    private void pollAgainOrGiveUp() {
        if (SystemClock.elapsedRealtime() - startedAt > MAX_WAIT_MS) {
            showError(R.string.error_timeout);
        } else {
            handler.postDelayed(this::poll, POLL_INTERVAL_MS);
        }
    }

    // ---------------------------------------------------------------- UI states

    /** The hero runs under the status bar; loading and the button bar stay clear of the system bars. */
    private void applyInsets() {
        final int heroTop = hero.getPaddingTop(), barBottom = buttonBar.getPaddingBottom();
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, windowInsets) -> {
            androidx.core.graphics.Insets bars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            loadingGroup.setPadding(loadingGroup.getPaddingLeft(), bars.top, loadingGroup.getPaddingRight(), bars.bottom);
            hero.setPadding(hero.getPaddingLeft(), heroTop + bars.top, hero.getPaddingRight(), hero.getPaddingBottom());
            buttonBar.setPadding(buttonBar.getPaddingLeft(), buttonBar.getPaddingTop(),
                    buttonBar.getPaddingRight(), barBottom + bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
    }

    private void showLoading() {
        handler.removeCallbacksAndMessages(null);
        setBackground(R.color.verdict_loading);
        loadingGroup.setVisibility(View.VISIBLE);
        resultGroup.setVisibility(View.GONE);
        if (loadingPulse == null) {
            loadingPulse = ObjectAnimator.ofPropertyValuesHolder(loadingIcon,
                    PropertyValuesHolder.ofFloat(View.SCALE_X, 1f, 1.08f),
                    PropertyValuesHolder.ofFloat(View.SCALE_Y, 1f, 1.08f)).setDuration(700);
            loadingPulse.setRepeatMode(ValueAnimator.REVERSE);
            loadingPulse.setRepeatCount(ValueAnimator.INFINITE);
        }
        loadingPulse.start();
        tipIndex = 0;
        rotateTip();
    }

    private void rotateTip() {
        String[] tips = getResources().getStringArray(R.array.loading_tips);
        loadingTip.setText(tips[tipIndex++ % tips.length]);
        handler.postDelayed(this::rotateTip, TIP_INTERVAL_MS);
    }

    private void showResult(ApiModels.Result r) {
        handler.removeCallbacksAndMessages(null);
        deleteTempFile();
        boolean red = r.isRed();
        // The backend's last-resort answer is a cautious green; show it as "unsure" rather than "real".
        boolean unsure = !red && ENGINE_FALLBACK.equals(r.engine);
        int verdictColor = red ? R.color.verdict_red : unsure ? R.color.verdict_neutral : R.color.verdict_green;
        setHero(verdictColor);
        icon.setImageResource(red ? R.drawable.ic_verdict_fake : unsure ? R.drawable.ic_verdict_error : R.drawable.ic_verdict_real);

        titleBn.setText(r.title != null ? r.title.bn : getString(red ? R.string.fallback_red_bn : R.string.fallback_green_bn));
        titleEn.setText(r.title != null ? r.title.en : getString(red ? R.string.fallback_red_en : R.string.fallback_green_en));
        explanationBn.setText(r.explanation != null ? r.explanation.bn : "");
        explanationEn.setText(r.explanation != null ? r.explanation.en : "");

        // Words first ("Very sure"), the number second: easier to grasp than a bare percentage.
        int pct = r.confidence != null ? (int) Math.round(r.confidence * 100) : 0;
        certaintyWord.setText(pct >= VERY_SURE ? R.string.certainty_high
                : pct >= FAIRLY_SURE ? R.string.certainty_mid : R.string.certainty_low);
        confidenceLabel.setText(getString(R.string.confidence_fmt, pct));
        confidenceBar.setProgressTintList(ColorStateList.valueOf(ContextCompat.getColor(this, verdictColor)));
        ObjectAnimator.ofInt(confidenceBar, "progress", 0, pct).setDuration(700).start();
        certaintyCard.setVisibility(View.VISIBLE);

        advice.setText(red ? R.string.advice_red : unsure ? R.string.advice_unsure : R.string.advice_green);
        adviceIcon.setImageResource(red ? R.drawable.ic_warning : unsure ? R.drawable.ic_info : R.drawable.ic_check_circle);
        adviceIcon.setImageTintList(ColorStateList.valueOf(ContextCompat.getColor(this,
                red ? R.color.status_bad : unsure ? R.color.text_muted : R.color.status_ok)));
        adviceCard.setVisibility(View.VISIBLE);

        icon.setScaleX(0.3f);
        icon.setScaleY(0.3f);
        icon.animate().scaleX(1f).scaleY(1f).setDuration(450).setInterpolator(new OvershootInterpolator(2f)).start();
        if (red && UiPrefs.vibrateOnFake(this)) {
            buzz();
        } else if (!red) {
            root.performHapticFeedback(HAPTIC_CONFIRM);
        }
        if (!unsure) UiPrefs.recordCheck(this, red, r.kind);  // nothing was actually judged

        if (r.matchedClaim != null) {
            detail.setText(getString(R.string.matched_claim_fmt, r.matchedClaim.claimBn, r.matchedClaim.claimEn));
            detail.setVisibility(View.VISIBLE);
        } else {
            detail.setVisibility(View.GONE);
        }
        lastResult = r;
        retryButton.setVisibility(View.GONE);
        shareButton.setVisibility(View.VISIBLE);
        showResultGroup();
    }

    @SuppressWarnings("deprecation")
    private void buzz() {
        Vibrator vibrator = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
                ? getSystemService(VibratorManager.class).getDefaultVibrator()
                : (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (vibrator == null || !vibrator.hasVibrator()) {
            root.performHapticFeedback(HAPTIC_REJECT);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(FAKE_BUZZ, -1));
        } else {
            vibrator.vibrate(FAKE_BUZZ, -1);
        }
    }

    /** Lets the user reply to the rumour in the same chat it came from. */
    private void shareResult() {
        ApiModels.Result r = lastResult;
        if (r == null || r.title == null || r.explanation == null) return;
        String text = (r.isRed() ? "⚠️ " : "✅ ") + r.title.bn + " · " + r.title.en + "\n\n"
                + r.explanation.bn + "\n\n" + r.explanation.en + "\n\n" + getString(R.string.share_result_footer);
        Intent send = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text);
        Intent chooser = Intent.createChooser(send, getString(R.string.share_result_chooser));
        // Don't offer "Check with Jachai" as a place to share our own verdict.
        chooser.putExtra(Intent.EXTRA_EXCLUDE_COMPONENTS, new ComponentName[]{new ComponentName(this, VerdictActivity.class)});
        startActivity(chooser);
    }

    private void showError(@StringRes int message) {
        handler.removeCallbacksAndMessages(null);
        setHero(R.color.verdict_neutral);
        icon.setImageResource(R.drawable.ic_verdict_error);
        titleBn.setText(R.string.error_title_bn);
        titleEn.setText(R.string.error_title_en);
        String[] both = getString(message).split("\n", 2);
        explanationBn.setText(both[0]);
        explanationEn.setText(both.length > 1 ? both[1] : "");
        certaintyCard.setVisibility(View.GONE);
        adviceCard.setVisibility(View.GONE);
        detail.setVisibility(View.GONE);
        retryButton.setVisibility(View.VISIBLE);
        shareButton.setVisibility(View.GONE);
        showResultGroup();
    }

    private void showResultGroup() {
        if (loadingPulse != null) loadingPulse.cancel();
        loadingGroup.setVisibility(View.GONE);
        resultGroup.setVisibility(View.VISIBLE);
        resultGroup.setAlpha(0f);
        resultGroup.animate().alpha(1f).setDuration(250).start();
    }

    private void setBackground(int colorRes) {
        root.setBackgroundColor(ContextCompat.getColor(this, colorRes));
    }

    private void setHero(@ColorRes int colorRes) {
        int color = ContextCompat.getColor(this, colorRes);
        hero.setBackgroundTintList(ColorStateList.valueOf(color));
        root.setBackgroundColor(color);  // fills behind the status bar during the fade-in
    }

    // ---------------------------------------------------------------- errors

    @StringRes
    private static int errorForHttp(int code) {
        if (code == 413) return R.string.error_too_large;
        if (code == 415) return R.string.error_unsupported;
        if (code == 404) return R.string.error_expired;
        return R.string.error_server;
    }

    @StringRes
    private static int errorForThrowable(Throwable t) {
        if (t instanceof UnknownHostException || t instanceof ConnectException) return R.string.error_no_internet;
        if (t instanceof SocketTimeoutException) return R.string.error_timeout;
        return R.string.error_server;
    }

    private void deleteTempFile() {
        File f = tempFile;
        tempFile = null;
        //noinspection ResultOfMethodCallIgnored
        if (f != null) f.delete();
    }
}
