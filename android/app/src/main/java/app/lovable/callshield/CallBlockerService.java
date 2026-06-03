package app.lovable.callshield;

import android.content.ContentResolver;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.telecom.Call;
import android.telecom.CallScreeningService;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class CallBlockerService extends CallScreeningService {

    private static List<String> cachedWhitelist = null;

    @Override
    public void onScreenCall(@NonNull Call.Details callDetails) {
        String phoneNumber = "";
        try {
            if (callDetails.getHandle() != null) {
                phoneNumber = callDetails.getHandle().getSchemeSpecificPart();
            }
        } catch (Exception ignored) {}
        if (phoneNumber == null) phoneNumber = "";

        boolean allow = false;

        if (phoneNumber.isEmpty()) {
            // Sem número (privado/oculto) — manter regra de bloqueio por padrão
            allow = false;
        } else if (isContact(phoneNumber)) {
            allow = true;
        } else if (isInPublicWhitelist(phoneNumber)) {
            allow = true;
        }

        CallResponse.Builder response = new CallResponse.Builder();
        if (!allow) {
            response.setDisallowCall(true);
            response.setRejectCall(true);
            response.setSkipNotification(true);
            response.setSkipCallLog(false);
        }
        respondToCall(callDetails, response.build());
    }

    private boolean isContact(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) return false;

        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.READ_CONTACTS)
                != PackageManager.PERMISSION_GRANTED) {
            // Sem permissão, não conseguimos validar — por segurança, permite
            return true;
        }

        Cursor cursor = null;
        try {
            Uri uri = Uri.withAppendedPath(
                    ContactsContract.PhoneLookup.CONTENT_FILTER_URI,
                    Uri.encode(phoneNumber));
            ContentResolver cr = getContentResolver();
            cursor = cr.query(uri,
                    new String[]{ContactsContract.PhoneLookup._ID},
                    null, null, null);
            return cursor != null && cursor.moveToFirst();
        } catch (Exception e) {
            return true;
        } finally {
            if (cursor != null) {
                try { cursor.close(); } catch (Exception ignored) {}
            }
        }
    }

    private boolean isInPublicWhitelist(String phoneNumber) {
        List<String> list = loadPublicWhitelist();
        if (list == null || list.isEmpty()) return false;

        String normalized = normalize(phoneNumber);
        for (String entry : list) {
            String e = normalize(entry);
            if (e.isEmpty()) continue;
            // Match exato OU número de entrada começa com o prefixo da lista (ex: "0800")
            if (normalized.equals(e) || normalized.startsWith(e)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.replaceAll("[^0-9+]", "");
    }

    private synchronized List<String> loadPublicWhitelist() {
        if (cachedWhitelist != null) return cachedWhitelist;
        List<String> result = new ArrayList<>();
        InputStream is = null;
        try {
            AssetManager am = getAssets();
            is = am.open("public_whitelist.json");
            BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            JSONObject obj = new JSONObject(sb.toString());
            JSONArray arr = obj.optJSONArray("numbers");
            if (arr != null) {
                for (int i = 0; i < arr.length(); i++) {
                    String n = arr.optString(i, "");
                    if (n != null && !n.isEmpty()) result.add(n);
                }
            }
        } catch (Exception ignored) {
        } finally {
            if (is != null) try { is.close(); } catch (Exception ignored) {}
        }
        cachedWhitelist = result;
        return result;
    }
}
