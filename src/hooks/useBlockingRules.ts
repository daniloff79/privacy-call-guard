import { useState, useCallback } from "react";

export interface BlockingRule {
  id: string;
  pattern: string;
  label: string;
  enabled: boolean;
  createdAt: Date;
}

const STORAGE_KEY = "blocking-rules";

function loadRules(): BlockingRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) }));
  } catch {
    return [];
  }
}

function saveRules(rules: BlockingRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function useBlockingRules() {
  const [rules, setRules] = useState<BlockingRule[]>(loadRules);

  const addRule = useCallback((pattern: string, label: string) => {
    setRules((prev) => {
      const next = [
        ...prev,
        { id: crypto.randomUUID(), pattern, label, enabled: true, createdAt: new Date() },
      ];
      saveRules(next);
      return next;
    });
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      saveRules(next);
      return next;
    });
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveRules(next);
      return next;
    });
  }, []);

  return { rules, addRule, toggleRule, deleteRule };
}
