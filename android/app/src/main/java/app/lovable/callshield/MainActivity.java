package app.lovable.callshield;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Registra o plugin interno para o Capacitor
        this.registerPlugin(CallRolePlugin.class);
    }
}
