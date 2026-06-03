import { registerPlugin, Capacitor } from '@capacitor/core';

export interface NativeLogEntry {
  id: string;
  number: string;
  matchedRule: string;
  blockedAt: string;
}

interface CallRolePlugin {
  requestCallRole(): Promise<{ status: 'granted' | 'already_held' }>;
  openDefaultAppsSettings(): Promise<void>;
  isDefaultCallScreeningApp(): Promise<{ isDefault: boolean }>;
  syncRules(options: { rules: Array<{ pattern: string; label: string; enabled: boolean }> }): Promise<void>;
  getBlockedLog(): Promise<{ log: NativeLogEntry[] }>;
  clearBlockedLog(): Promise<void>;
  requestIgnoreBatteryOptimizations(): Promise<{ status: 'already_ignored' | 'requested' | 'unsupported' }>;
  checkRuntimePermissions(): Promise<{ contacts: boolean; callLog: boolean }>;
  requestRuntimePermissions(): Promise<{ status: 'requested' }>;
}


const CallRole = registerPlugin<CallRolePlugin>('CallRole');

export const isNative = () => Capacitor.getPlatform() === 'android';

export const ativarBloqueio = async (): Promise<string> => {
  const result = await CallRole.requestCallRole();
  return result.status;
};

export const abrirEscolhaAppBloqueio = async (): Promise<void> => {
  await CallRole.openDefaultAppsSettings();
};

export const isAppPadraoBloqueio = async (): Promise<boolean> => {
  if (!isNative()) return false;
  try {
    const { isDefault } = await CallRole.isDefaultCallScreeningApp();
    return isDefault;
  } catch {
    return false;
  }
};

export const syncRulesNative = async (
  rules: Array<{ pattern: string; label: string; enabled: boolean }>
): Promise<void> => {
  if (!isNative()) return;
  try {
    await CallRole.syncRules({ rules });
  } catch (e) {
    console.warn('[CallRole] syncRules falhou:', e);
  }
};

export const getNativeLog = async (): Promise<NativeLogEntry[]> => {
  if (!isNative()) return [];
  try {
    const { log } = await CallRole.getBlockedLog();
    return log || [];
  } catch {
    return [];
  }
};

export const clearNativeLog = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    await CallRole.clearBlockedLog();
  } catch {}
};

export const requestIgnoreBatteryOptimizations = async (): Promise<string> => {
  if (!isNative()) return 'unsupported';
  try {
    const { status } = await CallRole.requestIgnoreBatteryOptimizations();
    return status;
  } catch {
    return 'unsupported';
  }
};

export const checkRuntimePermissions = async (): Promise<{ contacts: boolean; callLog: boolean }> => {
  if (!isNative()) return { contacts: true, callLog: true };
  try {
    return await CallRole.checkRuntimePermissions();
  } catch {
    return { contacts: false, callLog: false };
  }
};

export const requestRuntimePermissions = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    await CallRole.requestRuntimePermissions();
  } catch {}
};
