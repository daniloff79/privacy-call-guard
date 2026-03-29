import { registerPlugin } from '@capacitor/core';

interface CallRolePlugin {
  requestCallRole(): Promise<void>;
}

const CallRole = registerPlugin<CallRolePlugin>('CallRole');

export async function ativarBloqueio() {
  try {
    await CallRole.requestCallRole();
    console.log("Solicitação enviada ao sistema");
  } catch (e) {
    console.error("Erro ao solicitar papel de bloqueador:", e);
    throw e;
  }
}
