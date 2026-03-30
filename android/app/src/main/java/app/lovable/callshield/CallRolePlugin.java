package app.lovable.callshield;

import android.app.Activity;
import android.app.role.RoleManager;
import android.content.Intent;
import android.os.Build;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CallRole")
public class CallRolePlugin extends Plugin {

    @PluginMethod
    public void requestCallRole(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.reject("Versão do Android incompatível (Requer Android 10+).");
            return;
        }

        RoleManager roleManager = getContext().getSystemService(RoleManager.class);
        if (roleManager == null || !roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
            call.reject("Papel de Call Screening não disponível neste dispositivo.");
            return;
        }

        if (roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
            JSObject ret = new JSObject();
            ret.put("status", "already_held");
            call.resolve(ret);
            return;
        }

        Intent intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING);
        startActivityForResult(call, intent, "handleRoleResult");
    }

    @ActivityCallback
    private void handleRoleResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        if (result.getResultCode() == Activity.RESULT_OK) {
            JSObject ret = new JSObject();
            ret.put("status", "granted");
            call.resolve(ret);
        } else {
            call.reject("Permissão de Call Screening negada.");
        }
    }
}
