import { useEffect, useState } from "react";
import { Plus, ShieldCheck, PhoneOff, Activity, Settings as SettingsIcon, CheckCircle2 } from "lucide-react";
import iconSvg from "@/assets/icon.svg";
import { useBlockingRules } from "@/hooks/useBlockingRules";
import { useCallLog } from "@/hooks/useCallLog";
import { abrirEscolhaAppBloqueio, isAppPadraoBloqueio, isNative } from "@/plugins/CallRolePlugin";
import { toast } from "sonner";
import RuleItem from "@/components/RuleItem";
import AddRuleDialog from "@/components/AddRuleDialog";
import CallLogSection from "@/components/CallLogSection";
import { Button } from "@/components/ui/button";

export default function Index() {
  const { rules, addRule, toggleRule, deleteRule } = useBlockingRules();
  const { log, clearLog, refresh } = useCallLog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

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

  const { log, clearLog } = useCallLog();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCount = rules.filter((r) => r.enabled).length;
  const wildcardCount = rules.filter((r) => r.pattern.includes("*")).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
          <img src={iconSvg} alt="CallShield" className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-card-foreground">CallShield</h1>
            <p className="text-sm text-muted-foreground">Bloqueio de chamadas com privacidade</p>
          </div>
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
        {/* Status + escolher app padrão */}
        <div className="mb-4 flex flex-col gap-2 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {isDefault ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">CallShield é o app de bloqueio padrão</p>
                  <p className="text-xs text-muted-foreground">Toque ao lado para trocar o app responsável.</p>
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

            }
          }}
        >
          <Shield className="h-4 w-4" />
          Ativar Bloqueio de Chamadas
        </Button>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard icon={<PhoneOff className="h-4 w-4" />} value={rules.length} label="Regras" />
          <StatCard icon={<ShieldCheck className="h-4 w-4" />} value={activeCount} label="Ativas" />
          <StatCard icon={<Activity className="h-4 w-4" />} value={wildcardCount} label="Wildcards" />
        </div>

        {/* Rule list */}
        {rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
            <ShieldCheck className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">Nenhuma regra cadastrada</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Toque no botão <strong>+</strong> para adicionar sua primeira regra.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <RuleItem key={rule.id} rule={rule} onToggle={toggleRule} onDelete={deleteRule} />
            ))}
          </div>
        )}

        {/* Call Log */}
        <CallLogSection log={log} onClear={clearLog} />
      </main>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setDialogOpen(true)}
        aria-label="Adicionar regra"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddRuleDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addRule} />
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
    </div>
  );
}
