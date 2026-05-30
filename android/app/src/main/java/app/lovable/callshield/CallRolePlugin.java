package app.lovable.callshield;

import android.app.Activity;
import android.app.role.RoleManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;

@CapacitorPlugin(name = "CallRole")
public class CallRolePlugin extends Plugin {

    private static final String PREFS = "CallShieldPrefs";
    private static final String KEY_RULES = "rules";
    private static final String KEY_LOG = "log";

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

    @PluginMethod
    public void openDefaultAppsSettings(PluginCall call) {
        try {
            Intent intent;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                intent = new Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS);
            } else {
                intent = new Intent(Settings.ACTION_SETTINGS);
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Não foi possível abrir as configurações: " + e.getMessage());
        }
    }

    @PluginMethod
    public void isDefaultCallScreeningApp(PluginCall call) {
        JSObject ret = new JSObject();
        boolean held = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            RoleManager rm = getContext().getSystemService(RoleManager.class);
            held = rm != null && rm.isRoleHeld(RoleManager.ROLE_CALL_SCREENING);
        }
        ret.put("isDefault", held);
        call.resolve(ret);
    }

    @PluginMethod
    public void syncRules(PluginCall call) {
        try {
            //JSONArray rules = call.getArray("rules", new JSONArray());
			// O Capacitor espera um JSArray como valor padrão se a chave não existir
com.getcapacitor.JSArray rules = call.getArray("rules", new com.getcapacitor.JSArray());
            SharedPreferences prefs = getContext().getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE);
            prefs.edit().putString(KEY_RULES, rules.toString()).apply();
            call.resolve();
        } catch (Exception e) {
            call.reject("Falha ao sincronizar regras: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getBlockedLog(PluginCall call) {
        try {
            SharedPreferences prefs = getContext().getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE);
            String log = prefs.getString(KEY_LOG, "[]");
            JSObject ret = new JSObject();
            ret.put("log", new JSONArray(log));
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Falha ao ler log: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearBlockedLog(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE);
        prefs.edit().remove(KEY_LOG).apply();
        call.resolve();
    }
}
