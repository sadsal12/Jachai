package com.jachai.app;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.appcompat.app.AppCompatDelegate;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * On-device UI settings and usage stats. Kept apart from ApiClient's prefs; nothing here is sent to the server.
 */
public final class UiPrefs {
    private static final String PREFS = "jachai_ui";
    private static final String KEY_THEME = "theme";
    private static final String KEY_TEXT_SIZE = "text_size";
    private static final String KEY_VIBRATE = "vibrate_on_fake";
    private static final String KEY_CHECKS = "stat_checks";
    private static final String KEY_FAKES = "stat_fakes";
    private static final String KEY_RECENT = "recent";
    private static final String KEY_DAYS = "day_counts";
    private static final int MAX_RECENT = 5;
    private static final int MAX_DAYS = 14;

    public static final String THEME_SYSTEM = "system", THEME_LIGHT = "light", THEME_DARK = "dark";
    public static final int SIZE_SMALL = 0, SIZE_MEDIUM = 1, SIZE_LARGE = 2;
    private static final float[] FONT_SCALES = {0.9f, 1.0f, 1.15f};

    private UiPrefs() {}

    // ---------------------------------------------------------------- appearance

    public static String theme(Context c) {
        return prefs(c).getString(KEY_THEME, THEME_SYSTEM);
    }

    public static void setTheme(Context c, String theme) {
        prefs(c).edit().putString(KEY_THEME, theme).apply();
        applyTheme(theme);
    }

    static void applyTheme(String theme) {
        AppCompatDelegate.setDefaultNightMode(THEME_LIGHT.equals(theme) ? AppCompatDelegate.MODE_NIGHT_NO
                : THEME_DARK.equals(theme) ? AppCompatDelegate.MODE_NIGHT_YES
                : AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);
    }

    /** Defaults to Large: the app is built for older readers first. */
    public static int textSize(Context c) {
        return prefs(c).getInt(KEY_TEXT_SIZE, SIZE_LARGE);
    }

    public static void setTextSize(Context c, int size) {
        prefs(c).edit().putInt(KEY_TEXT_SIZE, size).apply();
    }

    public static float fontScale(Context c) {
        int size = textSize(c);
        return FONT_SCALES[size >= 0 && size < FONT_SCALES.length ? size : SIZE_LARGE];
    }

    public static boolean vibrateOnFake(Context c) {
        return prefs(c).getBoolean(KEY_VIBRATE, true);
    }

    public static void setVibrateOnFake(Context c, boolean on) {
        prefs(c).edit().putBoolean(KEY_VIBRATE, on).apply();
    }

    // ---------------------------------------------------------------- stats

    public static final class Check {
        public final long time;
        public final boolean red;
        public final String kind;

        Check(long time, boolean red, String kind) {
            this.time = time;
            this.red = red;
            this.kind = kind;
        }
    }

    public static void recordCheck(Context c, boolean red, String kind) {
        SharedPreferences p = prefs(c);
        StringBuilder recent = new StringBuilder()
                .append(System.currentTimeMillis()).append('|').append(red ? 1 : 0).append('|').append(kindOf(kind));
        List<Check> old = recentChecks(c);
        for (int i = 0; i < old.size() && i < MAX_RECENT - 1; i++) {
            Check k = old.get(i);
            recent.append(';').append(k.time).append('|').append(k.red ? 1 : 0).append('|').append(k.kind);
        }
        p.edit()
                .putInt(KEY_CHECKS, p.getInt(KEY_CHECKS, 0) + 1)
                .putInt(KEY_FAKES, p.getInt(KEY_FAKES, 0) + (red ? 1 : 0))
                .putString(KEY_RECENT, recent.toString())
                .putString(KEY_DAYS, bumpToday(p.getString(KEY_DAYS, "")))
                .apply();
    }

    public static int checksDone(Context c) {
        return prefs(c).getInt(KEY_CHECKS, 0);
    }

    public static int fakesCaught(Context c) {
        return prefs(c).getInt(KEY_FAKES, 0);
    }

    /** Newest first. */
    public static List<Check> recentChecks(Context c) {
        List<Check> out = new ArrayList<>();
        String raw = prefs(c).getString(KEY_RECENT, "");
        if (raw.isEmpty()) return out;
        for (String entry : raw.split(";")) {
            String[] f = entry.split("\\|");
            if (f.length != 3) continue;
            try {
                out.add(new Check(Long.parseLong(f[0]), "1".equals(f[1]), f[2]));
            } catch (NumberFormatException ignored) {
                // skip a corrupt entry rather than lose the rest
            }
        }
        return out;
    }

    /** Checks per day for the last {@code days} days, oldest first; the last entry is today. */
    public static int[] checksPerDay(Context c, int days) {
        Map<String, Integer> counts = parseDays(prefs(c).getString(KEY_DAYS, ""));
        int[] out = new int[days];
        Calendar day = Calendar.getInstance();
        for (int i = days - 1; i >= 0; i--) {
            Integer n = counts.get(dayKey(day.getTime()));
            out[i] = n != null ? n : 0;
            day.add(Calendar.DAY_OF_YEAR, -1);
        }
        return out;
    }

    /** Stored as "yyyyMMdd:n;..." newest first, trimmed to MAX_DAYS entries. */
    private static String bumpToday(String raw) {
        String today = dayKey(new Date());
        Map<String, Integer> counts = parseDays(raw);
        Integer n = counts.get(today);
        StringBuilder out = new StringBuilder(today).append(':').append(n != null ? n + 1 : 1);
        int kept = 1;
        for (String entry : raw.split(";")) {
            if (kept >= MAX_DAYS) break;
            if (entry.isEmpty() || entry.startsWith(today + ":")) continue;
            out.append(';').append(entry);
            kept++;
        }
        return out.toString();
    }

    private static Map<String, Integer> parseDays(String raw) {
        Map<String, Integer> out = new HashMap<>();
        for (String entry : raw.split(";")) {
            String[] f = entry.split(":");
            if (f.length != 2) continue;
            try {
                out.put(f[0], Integer.parseInt(f[1]));
            } catch (NumberFormatException ignored) {
                // skip a corrupt entry
            }
        }
        return out;
    }

    private static String dayKey(Date date) {
        return new SimpleDateFormat("yyyyMMdd", Locale.US).format(date);
    }

    /** Normalises the backend's "kind" to text / photo / video. */
    private static String kindOf(String kind) {
        if (kind == null) return "text";
        if (kind.contains("video")) return "video";
        if (kind.contains("image") || kind.contains("photo")) return "photo";
        return "text";
    }

    private static SharedPreferences prefs(Context c) {
        return c.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
