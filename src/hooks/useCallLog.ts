import { useState, useCallback } from "react";

export interface CallLogEntry {
  id: string;
  number: string;
  matchedRule: string;
  blockedAt: string; // ISO string
}

const STORAGE_KEY = "call-log";

function loadLog(): CallLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLog(log: CallLogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function useCallLog() {
  const [log, setLog] = useState<CallLogEntry[]>(loadLog);

  const addEntry = useCallback((number: string, matchedRule: string) => {
    setLog((prev) => {
      const entry: CallLogEntry = {
        id: crypto.randomUUID(),
        number,
        matchedRule,
        blockedAt: new Date().toISOString(),
      };
      const next = [entry, ...prev].slice(0, 100); // keep last 100
      saveLog(next);
      return next;
    });
  }, []);

  const clearLog = useCallback(() => {
    setLog([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { log, addEntry, clearLog };
}
