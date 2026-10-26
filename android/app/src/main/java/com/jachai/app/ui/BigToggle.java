package com.jachai.app.ui;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.animation.DecelerateInterpolator;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.jachai.app.R;

/**
 * An oversized ON/OFF switch. It doesn't flip itself on tap: the owner decides (turning the bubble on needs
 * permissions that the user may refuse) and then calls {@link #setChecked}.
 */
public class BigToggle extends View {
    private static final int WIDTH_DP = 232, HEIGHT_DP = 112;

    private final Paint track = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint thumb = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint label = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF rect = new RectF();
    private final String onText, offText;

    private boolean checked;
    private float position;  // 0 = off, 1 = on
    private ValueAnimator animator;

    public BigToggle(Context context, AttributeSet attrs) {
        super(context, attrs);
        onText = context.getString(R.string.toggle_on);
        offText = context.getString(R.string.toggle_off);
        stroke.setStyle(Paint.Style.STROKE);
        stroke.setStrokeWidth(dp(3));
        label.setTypeface(Typeface.DEFAULT_BOLD);
        label.setTextAlign(Paint.Align.CENTER);
        label.setTextSize(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, 28, getResources().getDisplayMetrics()));
        setClickable(true);
        setFocusable(true);
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked, boolean animate) {
        if (this.checked == checked && (animator == null || !animator.isRunning())) {
            position = checked ? 1f : 0f;
            invalidate();
            return;
        }
        this.checked = checked;
        if (animator != null) animator.cancel();
        if (!animate) {
            position = checked ? 1f : 0f;
            invalidate();
        } else {
            animator = ValueAnimator.ofFloat(position, checked ? 1f : 0f).setDuration(260);
            animator.setInterpolator(new DecelerateInterpolator());
            animator.addUpdateListener(a -> {
                position = (float) a.getAnimatedValue();
                invalidate();
            });
            animator.start();
            performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK);
        }
        sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_VIEW_SELECTED);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        setMeasuredDimension(resolveSize(dp(WIDTH_DP), widthMeasureSpec), resolveSize(dp(HEIGHT_DP), heightMeasureSpec));
    }

    @Override
    protected void onDraw(@NonNull Canvas canvas) {
        float w = getWidth(), h = getHeight(), inset = dp(2), r = (h - 2 * inset) / 2f;
        int accent = color(R.color.accent), onAccent = color(R.color.on_accent);
        int field = color(R.color.field_bg), outline = color(R.color.text_muted);

        rect.set(inset, inset, w - inset, h - inset);
        track.setColor(position > 0.5f ? accent : field);
        canvas.drawRoundRect(rect, r, r, track);
        if (position <= 0.5f) {
            stroke.setColor(color(R.color.outline));
            canvas.drawRoundRect(rect, r, r, stroke);
        }

        float pad = dp(10), thumbR = r - pad;
        float left = inset + pad + thumbR, right = w - inset - pad - thumbR;
        float cx = left + (right - left) * position, cy = h / 2f;
        thumb.setColor(position > 0.5f ? 0xFFFFFFFF : outline);
        canvas.drawCircle(cx, cy, thumbR, thumb);

        // The label sits on the side the thumb isn't on.
        boolean on = position > 0.5f;
        label.setColor(on ? onAccent : color(R.color.text_primary));
        float textX = on ? (inset + (cx - thumbR)) / 2f : (cx + thumbR + w - inset) / 2f;
        float textY = cy - (label.descent() + label.ascent()) / 2f;
        canvas.drawText(on ? onText : offText, textX, textY, label);
    }

    @Override
    public void onInitializeAccessibilityNodeInfo(AccessibilityNodeInfo info) {
        super.onInitializeAccessibilityNodeInfo(info);
        info.setClassName("android.widget.Switch");
        info.setCheckable(true);
        info.setChecked(checked);
    }

    private int color(int res) {
        return ContextCompat.getColor(getContext(), res);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
