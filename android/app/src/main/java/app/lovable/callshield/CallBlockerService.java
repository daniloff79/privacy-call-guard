package app.lovable.callshield;

import android.content.ContentResolver;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.telecom.Call;
import android.telecom.CallScreeningService;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

public class CallBlockerService extends CallScreeningService {

    @Override
    public void onScreenCall(@NonNull Call.Details callDetails) {
        String phoneNumber = "";
        try {
            if (callDetails.getHandle() != null) {
                phoneNumber = callDetails.getHandle().getSchemeSpecificPart();
            }
        } catch (Exception ignored) {}
        if (phoneNumber == null) phoneNumber = "";

        boolean isKnownContact = isContact(phoneNumber);

        CallResponse.Builder response = new CallResponse.Builder();

        if (!isKnownContact && !phoneNumber.isEmpty()) {
            // Bloqueia desconhecidos silenciosamente
            response.setDisallowCall(true);
            response.setRejectCall(true);
            response.setSkipNotification(true);
            response.setSkipCallLog(false);
        }
        // Caso contrário, response vazio = permite a chamada normalmente

        respondToCall(callDetails, response.build());
    }

    private boolean isContact(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) return false;

        // Sem permissão de contatos, por segurança considera como contato (não bloqueia)
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.READ_CONTACTS)
                != PackageManager.PERMISSION_GRANTED) {
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
            return true; // em caso de erro, não bloqueia
        } finally {
            if (cursor != null) {
                try { cursor.close(); } catch (Exception ignored) {}
            }
        }
    }
}
