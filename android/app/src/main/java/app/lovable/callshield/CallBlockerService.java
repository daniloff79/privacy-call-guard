package app.lovable.callshield;

import android.content.SharedPreferences;
import android.telecom.Call;
import android.telecom.CallScreeningService;
import androidx.annotation.NonNull;
import org.json.JSONArray;
import org.json.JSONObject;

public class CallBlockerService extends CallScreeningService {

    private static final String PREFS = "CallShieldPrefs";
    private static final String KEY_RULES = "rules";
    private static final String KEY_LOG = "log";
    private static final int MAX_LOG = 100;

    @Override
    public void onScreenCall(@NonNull Call.Details callDetails) {
        String phoneNumber = "";
        try {
            if (callDetails.getHandle() != null) {
                phoneNumber = callDetails.getHandle().getSchemeSpecificPart();
            }
        } catch (Exception ignored) {}
        if (phoneNumber == null) phoneNumber = "";

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        String rulesJson = prefs.getString(KEY_RULES, "[]");

        String matchedLabel = null;
        try {
            JSONArray arr = new JSONArray(rulesJson);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject r = arr.getJSONObject(i);
                if (!r.optBoolean("enabled", true)) continue;
                String pattern = r.optString("pattern", "");
                if (pattern.isEmpty()) continue;
                if (matches(phoneNumber, pattern)) {
                    matchedLabel = r.optString("label", pattern);
                    break;
                }
            }
        } catch (Exception ignored) {}

        CallResponse.Builder response = new CallResponse.Builder();

        if (matchedLabel != null) {
            response.setDisallowCall(true);
            response.setRejectCall(true);
            response.setSkipNotification(true);
            response.setSkipCallLog(false);
            appendLog(prefs, phoneNumber, matchedLabel);
        }

        respondToCall(callDetails, response.build());
    }

    /** Wildcard match: '*' matches any sequence of digits. */
    private boolean matches(String number, String pattern) {
        if (number == null) number = "";
        String regex = "^" + java.util.regex.Pattern.quote(pattern)
                .replace("*", "\\E.*\\Q") + "$";
        try {
            return number.matches(regex);
        } catch (Exception e) {
            return false;
        }
    }

    private void appendLog(SharedPreferences prefs, String number, String label) {
        try {
            JSONArray log = new JSONArray(prefs.getString(KEY_LOG, "[]"));
            JSONObject entry = new JSONObject();
            entry.put("id", java.util.UUID.randomUUID().toString());
            entry.put("number", number);
            entry.put("matchedRule", label);
            entry.put("blockedAt", new java.text.SimpleDateFormat(
                    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                    java.util.Locale.US).format(new java.util.Date()));
            JSONArray next = new JSONArray();
            next.put(entry);
            for (int i = 0; i < log.length() && next.length() < MAX_LOG; i++) {
                next.put(log.get(i));
            }
            prefs.edit().putString(KEY_LOG, next.toString()).apply();
        } catch (Exception ignored) {}
    }
}
