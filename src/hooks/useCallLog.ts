import { useState, useCallback, useEffect } from "react";
import { App } from "@capacitor/app";
import { clearNativeLog, getNativeLog, isNative } from "@/plugins/CallRolePlugin";

export interface CallLogEntry {
  id: string;
  number: string;
  matchedRule: string;
  blockedAt: string; // ISO string
}

const STORAGE_KEY = "call-log";

function loadLocal(): CallLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function useCallLog() {
  const [log, setLog] = useState<CallLogEntry[]>(loadLocal);

  const refresh = useCallback(async () => {
    if (isNative()) {
      const native = await getNativeLog();
      setLog(native);
    } else {
      setLog(loadLocal());
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!isNative()) return;
    // Atualiza ao voltar pro app (após uma chamada bloqueada)
    const sub = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) refresh();
    });
    const interval = window.setInterval(refresh, 5000);
    return () => {
      sub.then((h) => h.remove());
      window.clearInterval(interval);
    };
  }, [refresh]);

  const clearLog = useCallback(async () => {
    setLog([]);
    if (isNative()) {
      await clearNativeLog();
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { log, clearLog, refresh };
}
