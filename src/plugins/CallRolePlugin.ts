import { registerPlugin } from '@capacitor/core';

interface CallRolePlugin {
  requestCallRole(): Promise<{ status: 'granted' | 'already_held' }>;
}

const CallRole = registerPlugin<CallRolePlugin>('CallRole');

export const ativarBloqueio = async (): Promise<string> => {
  try {
    const result = await CallRole.requestCallRole();
    console.log('[CallRole] Status retornado:', result.status);
    return result.status;
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (msg.includes('not implemented')) {
      console.error('[CallRole] Plugin não encontrado. Verifique se o app está rodando no Android e se registerPlugin(CallRolePlugin.class) está no MainActivity.', e);
    } else {
      console.error('[CallRole] Erro ao solicitar papel:', msg, e);
    }
    throw e;
  }
};
