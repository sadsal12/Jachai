package com.jachai.app.ui;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.View;
import android.view.animation.DecelerateInterpolator;

import androidx.core.content.ContextCompat;

import com.jachai.app.R;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/**
 * A plain 7-day bar chart: one rounded bar per day, the count above it and the day's initial below. Today's bar
 * is solid accent, earlier days a lighter accent, empty days a short grey stub so the baseline still reads.
 */
public class WeekBars extends View {
    private final Paint bar = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint label = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF rect = new RectF();
    private final String[] days = new String[7];
    private int[] counts = new int[7];
    private float progress = 1f;
    private final int accent, accentSoft, stub, textPrimary, textMuted;

    public WeekBars(Context context, AttributeSet attrs) {
        super(context, attrs);
        accent = ContextCompat.getColor(context, R.color.accent);
        accentSoft = (accent & 0x00FFFFFF) | 0x80000000;
        stub = ContextCompat.getColor(context, R.color.outline);
        textPrimary = ContextCompat.getColor(context, R.color.text_primary);
        textMuted = ContextCompat.getColor(context, R.color.text_muted);
        label.setTextAlign(Paint.Align.CENTER);

        SimpleDateFormat fmt = new SimpleDateFormat("EEEEE", Locale.getDefault());
        Calendar day = Calendar.getInstance();
        for (int i = 6; i >= 0; i--) {
            days[i] = fmt.format(day.getTime());
            day.add(Calendar.DAY_OF_YEAR, -1);
        }
        setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_YES);
    }

    /** {@code values}: 7 counts, oldest first, today last. */
    public void setCounts(int[] values, boolean animate) {
        counts = values.clone();
        if (animate) {
            ValueAnimator a = ValueAnimator.ofFloat(0f, 1f).setDuration(500);
            a.setInterpolator(new DecelerateInterpolator());
            a.addUpdateListener(v -> {
                progress = (float) v.getAnimatedValue();
                invalidate();
            });
            a.start();
        } else {
            progress = 1f;
            invalidate();
        }
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int w = MeasureSpec.getSize(widthMeasureSpec);
        setMeasuredDimension(w, resolveSize(Math.round(dp(150)), heightMeasureSpec));
    }

    @Override
    protected void onDraw(Canvas canvas) {
        float numberSize = sp(15), daySize = sp(15);
        float top = numberSize + dp(8);
        float bottom = getHeight() - daySize - dp(10);
        float maxH = bottom - top;
        int max = 1;
        for (int c : counts) max = Math.max(max, c);

        float slot = (float) getWidth() / counts.length;
        float barW = Math.min(dp(28), slot * 0.55f);
        for (int i = 0; i < counts.length; i++) {
            float cx = slot * i + slot / 2;
            boolean today = i == counts.length - 1;
            float h = counts[i] == 0 ? dp(6) : Math.max(dp(10), maxH * counts[i] / max * progress);
            rect.set(cx - barW / 2, bottom - h, cx + barW / 2, bottom);
            bar.setColor(counts[i] == 0 ? stub : today ? accent : accentSoft);
            canvas.drawRoundRect(rect, dp(8), dp(8), bar);

            if (counts[i] > 0) {
                label.setTextSize(numberSize);
                label.setTypeface(Typeface.DEFAULT_BOLD);
                label.setColor(textPrimary);
                canvas.drawText(String.valueOf(counts[i]), cx, rect.top - dp(6), label);
            }
            label.setTextSize(daySize);
            label.setTypeface(today ? Typeface.DEFAULT_BOLD : Typeface.DEFAULT);
            label.setColor(today ? textPrimary : textMuted);
            canvas.drawText(days[i], cx, getHeight() - dp(4), label);
        }
    }

    private float dp(float v) {
        return v * getResources().getDisplayMetrics().density;
    }

    private float sp(float v) {
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, v, getResources().getDisplayMetrics());
    }
}
