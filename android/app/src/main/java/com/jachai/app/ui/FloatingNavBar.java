package com.jachai.app.ui;

import android.animation.ValueAnimator;
import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.transition.ChangeBounds;
import android.transition.TransitionManager;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.animation.PathInterpolator;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Space;
import android.widget.TextView;

import androidx.annotation.DrawableRes;
import androidx.annotation.StringRes;
import androidx.core.content.ContextCompat;

import com.jachai.app.R;

import java.util.ArrayList;
import java.util.List;

/**
 * Floating, rounded bottom navigation. Inactive tabs show only their icon; the active tab shows icon + name on an
 * accent pill. The pill is drawn once, behind the tabs, and slides and stretches from the old tab to the new one
 * (its leading edge moves first, so it reads as one shape travelling rather than two blinking).
 */
public class FloatingNavBar extends LinearLayout {

    public interface OnTabSelectedListener {
        void onTabSelected(int index);
    }

    private static final long SLIDE_MS = 320;

    private final List<LinearLayout> items = new ArrayList<>();
    private final Paint pillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF pill = new RectF();
    private final RectF from = new RectF();
    private OnTabSelectedListener listener;
    private OnTabSelectedListener reselectListener;
    private ValueAnimator slide;
    private boolean pendingSlide;
    private int selected = -1;

    public FloatingNavBar(Context context, AttributeSet attrs) {
        super(context, attrs);
        setOrientation(HORIZONTAL);
        setGravity(Gravity.CENTER_VERTICAL);
        setBackgroundResource(R.drawable.bg_nav);
        setElevation(dp(10));
        setWillNotDraw(false);
        int pad = dp(8);
        setPadding(pad, pad, pad, pad);
        pillPaint.setColor(ContextCompat.getColor(context, R.color.accent));
    }

    public void setOnTabSelectedListener(OnTabSelectedListener listener) {
        this.listener = listener;
    }

    /** Tapping the tab that is already active, e.g. to scroll its page back to the top. */
    public void setOnTabReselectedListener(OnTabSelectedListener listener) {
        this.reselectListener = listener;
    }

    public void addTab(@DrawableRes int icon, @StringRes int label) {
        if (!items.isEmpty()) addView(new Space(getContext()), new LayoutParams(0, 1, 1f));

        LinearLayout item = new LinearLayout(getContext());
        item.setOrientation(HORIZONTAL);
        item.setGravity(Gravity.CENTER);
        item.setMinimumHeight(dp(56));
        item.setMinimumWidth(dp(56));
        item.setPadding(dp(16), 0, dp(16), 0);
        item.setContentDescription(getContext().getString(label));

        ImageView iconView = new ImageView(getContext());
        iconView.setImageResource(icon);
        iconView.setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        item.addView(iconView, new LayoutParams(dp(26), dp(26)));

        TextView labelView = new TextView(getContext());
        labelView.setText(label);
        labelView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        labelView.setTypeface(Typeface.DEFAULT_BOLD);
        labelView.setMaxLines(1);
        labelView.setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        LayoutParams lp = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        lp.setMarginStart(dp(8));
        item.addView(labelView, lp);

        final int index = items.size();
        item.setOnClickListener(v -> {
            v.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK);
            if (index == selected) {
                if (reselectListener != null) reselectListener.onTabSelected(index);
                return;
            }
            select(index, true);
            if (listener != null) listener.onTabSelected(index);
        });
        items.add(item);
        addView(item, new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));
        styleItem(item, false, false);
    }

    public void select(int index, boolean animate) {
        boolean slideIt = animate && selected >= 0 && !pill.isEmpty();
        if (slideIt) {
            from.set(pill);
            pendingSlide = true;
            // Icons glide to their new spots while the pill travels.
            TransitionManager.beginDelayedTransition(this, new ChangeBounds()
                    .setDuration(SLIDE_MS).setInterpolator(new PathInterpolator(0.2f, 0f, 0f, 1f)));
        }
        selected = index;
        for (int i = 0; i < items.size(); i++) styleItem(items.get(i), i == index, slideIt);
        requestLayout();
    }

    public int getSelected() {
        return selected;
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        super.onLayout(changed, l, t, r, b);
        if (selected < 0 || selected >= items.size()) return;
        View target = items.get(selected);
        RectF to = new RectF(target.getLeft(), target.getTop(), target.getRight(), target.getBottom());
        if (pendingSlide) {
            pendingSlide = false;
            startSlide(new RectF(from), to);
        } else if (slide == null || !slide.isRunning()) {
            pill.set(to);
            invalidate();
        }
    }

    private void startSlide(RectF start, RectF end) {
        if (slide != null) slide.cancel();
        boolean right = end.centerX() > start.centerX();
        slide = ValueAnimator.ofFloat(0f, 1f).setDuration(SLIDE_MS);
        slide.setInterpolator(new PathInterpolator(0.2f, 0f, 0f, 1f));
        slide.addUpdateListener(a -> {
            float f = (float) a.getAnimatedValue();
            float lead = Math.min(1f, f * 1.35f);  // the edge in the direction of travel moves first
            float leftF = right ? f : lead, rightF = right ? lead : f;
            pill.set(lerp(start.left, end.left, leftF), end.top,
                    lerp(start.right, end.right, rightF), end.bottom);
            invalidate();
        });
        slide.start();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (pill.isEmpty()) return;
        float radius = pill.height() / 2;
        canvas.drawRoundRect(pill, radius, radius, pillPaint);  // drawn before the children, so it sits behind
    }

    private void styleItem(LinearLayout item, boolean active, boolean animate) {
        ImageView icon = (ImageView) item.getChildAt(0);
        TextView label = (TextView) item.getChildAt(1);
        int fg = ContextCompat.getColor(getContext(), active ? R.color.on_accent : R.color.text_muted);
        icon.setImageTintList(ColorStateList.valueOf(fg));
        label.setTextColor(fg);
        label.setVisibility(active ? VISIBLE : GONE);
        item.setSelected(active);
        if (active && animate) {
            label.setAlpha(0f);
            label.setTranslationX(-dp(8));
            label.animate().alpha(1f).translationX(0f).setStartDelay(SLIDE_MS / 3).setDuration(200).start();
            icon.animate().scaleX(1.15f).scaleY(1.15f).setDuration(120)
                    .withEndAction(() -> icon.animate().scaleX(1f).scaleY(1f).setDuration(160).start()).start();
        } else {
            label.animate().cancel();
            label.setAlpha(1f);
            label.setTranslationX(0f);
        }
    }

    private static float lerp(float a, float b, float f) {
        return a + (b - a) * f;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
