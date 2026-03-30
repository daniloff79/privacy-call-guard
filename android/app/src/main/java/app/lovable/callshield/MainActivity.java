package app.lovable.callshield;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        this.registerPlugin(CallRolePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
