import { useEffect, useState } from "react";
import { ShieldCheck, Users, ListChecks, Settings as SettingsIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import publicWhitelist from "@/data/public_whitelist.json";
import iconSvg from "@/assets/icon.svg";
import { useCallLog } from "@/hooks/useCallLog";
import {
  abrirEscolhaAppBloqueio,
  isAppPadraoBloqueio,
  isNative,
  requestIgnoreBatteryOptimizations,
  checkRuntimePermissions,
  requestRuntimePermissions,
  getContactsCount,
} from "@/plugins/CallRolePlugin";
import { toast } from "sonner";
import CallLogSection from "@/components/CallLogSection";
import { Button } from "@/components/ui/button";

export default function Index() {
  const { log, clearLog } = useCallLog();
  const [isDefault, setIsDefault] = useState(false);
  const [perms, setPerms] = useState<{ contacts: boolean; callLog: boolean; phoneState: boolean }>({
    contacts: true,
    callLog: true,
    phoneState: true,
  });
  const [contactsCount, setContactsCount] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const v = await isAppPadraoBloqueio();
      if (active) setIsDefault(v);
    };
    check();
    const id = window.setInterval(check, 4000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  // Fluxo de inicialização sequencial: permissões -> pausa -> bateria
  useEffect(() => {
    if (!isNative()) return;
    (async () => {
      // FASE 1: solicita permissões e aguarda decisão do usuário
      let p = await checkRuntimePermissions();
      if (!p.contacts || !p.callLog || !p.phoneState) {
        await requestRuntimePermissions();
        // Poll até o usuário responder ao diálogo do sistema (máx ~45s)
        const start = Date.now();
        while (Date.now() - start < 45000) {
          await new Promise((r) => setTimeout(r, 600));
          p = await checkRuntimePermissions();
          if (p.contacts && p.callLog && p.phoneState) break;
          // Se concedeu ao menos um, dá mais um ciclo curto e segue
          if (Date.now() - start > 8000 && (p.contacts || p.callLog || p.phoneState)) break;
        }
      }
      setPerms(p);

      if (p.contacts) {
        const n = await getContactsCount();
        setContactsCount(n);
        toast.success(`Lista de contatos: ${n} números liberados.`);
      }

      // FASE 2: pausa para o usuário respirar antes da próxima tela do sistema
      await new Promise((r) => setTimeout(r, 800));

      // FASE 3: verifica/solicita isenção da otimização de bateria
      const status = await requestIgnoreBatteryOptimizations();
      if (status === "already_ignored") {
        toast.success("Otimização de bateria já desativada para o CallShield.");
      } else if (status === "requested") {
        toast.info("Aprove a isenção de bateria para manter o bloqueio ativo.");
      }
    })();
  }, []);

  // Atualiza contagem se permissão for concedida depois
  useEffect(() => {
    if (perms.contacts) {
      getContactsCount().then(setContactsCount);
    }
  }, [perms.contacts]);

  const missingPerms = !perms.contacts || !perms.callLog || !perms.phoneState;
  const missingList = [
    !perms.contacts && "Contatos",
    !perms.callLog && "Registro de Chamadas",
    !perms.phoneState && "Estado do Telefone",
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
          <img src={iconSvg} alt="CallShield" className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-card-foreground">CallShield</h1>
            <p className="text-sm text-muted-foreground">Bloqueio de chamadas fora da agenda</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-12">
        {/* Aviso de permissões */}
        {isNative() && missingPerms && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Permissões necessárias</p>
              <p className="text-xs text-muted-foreground">
                Sem acesso a {missingList} o bloqueio pode não funcionar corretamente.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={async () => {
                  await requestRuntimePermissions();
                  setTimeout(async () => setPerms(await checkRuntimePermissions()), 1200);
                }}
              >
                Conceder permissões
              </Button>
            </div>
          </div>
        )}

        {/* Status + escolher app padrão */}
        <div className="mb-4 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {isDefault ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">CallShield é o app de bloqueio padrão</p>
                  <p className="text-xs text-muted-foreground">Toque no botão seguinte para trocar o app responsável.</p>
                </div>
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Escolha o app de bloqueio</p>
                  <p className="text-xs text-muted-foreground">Defina qual app fará a triagem das chamadas.</p>
                </div>
              </>
            )}
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              try {
                if (!isNative()) {
                  toast.error("Disponível apenas no Android.");
                  return;
                }
                await abrirEscolhaAppBloqueio();
              } catch (e: any) {
                toast.error("Não foi possível abrir as configurações: " + (e?.message || e));
              }
            }}
          >
            <SettingsIcon className="h-4 w-4" />
            {isDefault ? "Trocar app" : "Escolher app"}
          </Button>
        </div>

        {/* Contatos liberados + Whitelist pública */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Users className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Contatos liberados</p>
              <p className="text-2xl font-bold text-card-foreground">{contactsCount}</p>
              <p className="text-xs text-muted-foreground">Números da sua agenda.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
              <ListChecks className="h-6 w-6 text-sky-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Whitelist pública</p>
              <p className="text-2xl font-bold text-card-foreground">{publicWhitelist.numbers?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Números de utilidade pública.</p>
            </div>
          </div>
        </div>

        {/* Call Log */}
        <CallLogSection log={log} onClear={clearLog} />
      </main>
    </div>
  );
}
