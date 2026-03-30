package app.lovable.callshield;

import android.telecom.Call;
import android.telecom.CallScreeningService;
import androidx.annotation.NonNull;

public class CallBlockerService extends CallScreeningService {

    @Override
    public void onScreenCall(@NonNull Call.Details callDetails) {
        // Obtém o número de quem está ligando
        String phoneNumber = callDetails.getHandle().getSchemeSpecificPart();

        // Lógica inicial: bloqueia prefixos comuns de spam (011 e 0800)
        // Depois conectaremos isso aos seus Wildcards do Supabase
        boolean shouldBlock = phoneNumber.startsWith("011") || phoneNumber.startsWith("0800");

        CallResponse.Builder response = new CallResponse.Builder();

        if (shouldBlock) {
            response.setDisallowCall(true);      // Rejeita a chamada
            response.setRejectCall(true);        // Dá sinal de ocupado
            response.setSkipNotification(true);  // Não deixa o celular tocar/vibrar
            response.setSkipCallLog(false);      // Mantém no histórico para você saber que bloqueou
        }

        respondToCall(callDetails, response.build());
    }
}