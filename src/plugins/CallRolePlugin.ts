import { registerPlugin } from '@capacitor/core';

// Define a interface para o TypeScript não reclamar
interface CallRolePlugin {
  requestCallRole(): Promise<{ status: string }>;
}

const CallRole = registerPlugin<CallRolePlugin>('CallRole');

export const ativarBloqueio = async () => {
  try {
    const result = await CallRole.requestCallRole();
    console.log("Status da permissão:", result.status);
  } catch (e) {
    // É aqui que está dando o erro "Não foi possível solicitar..."
    console.error("Erro detalhado:", e);
    alert("Erro ao solicitar: " + (e.message || "Verifique o Logcat no Android Studio"));
  }
};