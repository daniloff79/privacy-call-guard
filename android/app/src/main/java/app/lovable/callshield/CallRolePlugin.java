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
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            RoleManager roleManager = getContext().getSystemService(RoleManager.class);
            
            if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
                if (!roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                    Intent intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING);
                    startActivityForResult(call, intent, "handleRoleResult");
                } else {
                    JSObject ret = new JSObject();
                    ret.put("status", "already_held");
                    call.resolve(ret);
                }
            } else {
                call.reject("Papel de Call Screening não disponível neste dispositivo.");
            }
        } else {
            call.reject("Versão do Android incompatível (Requer Android 10+).");
        }
    }

    @ActivityCallback
    private void handleRoleResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK) {
            JSObject ret = new JSObject();
            ret.put("status", "granted");
            call.resolve(ret);
        } else {
            call.reject("Permissão de Call Screening negada.");
        }
    }
}
