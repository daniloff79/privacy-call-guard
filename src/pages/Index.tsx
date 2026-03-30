import { useState } from "react";
import { Plus, ShieldCheck, PhoneOff, Activity, Shield } from "lucide-react";
import { useBlockingRules } from "@/hooks/useBlockingRules";
import { useCallLog } from "@/hooks/useCallLog";
import { ativarBloqueio } from "@/plugins/CallRolePlugin";
import { toast } from "sonner";
import RuleItem from "@/components/RuleItem";
import AddRuleDialog from "@/components/AddRuleDialog";
import CallLogSection from "@/components/CallLogSection";
import { Button } from "@/components/ui/button";

export default function Index() {
  const { rules, addRule, toggleRule, deleteRule } = useBlockingRules();
  const { log, clearLog } = useCallLog();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCount = rules.filter((r) => r.enabled).length;
  const wildcardCount = rules.filter((r) => r.pattern.includes("*")).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-card-foreground">CallShield</h1>
            <p className="text-sm text-muted-foreground">Bloqueio de chamadas com privacidade</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
        {/* Ativar bloqueio */}
        <Button
          variant="outline"
          className="mb-4 w-full gap-2"
          onClick={async () => {
            try {
              const status = await ativarBloqueio();
              if (status === 'already_held') {
                toast.info("O app já é o bloqueador de chamadas padrão.");
              } else {
                toast.success("Permissão de bloqueio concedida!");
              }
            } catch (e: any) {
              const msg = e?.message || String(e);
              if (msg.includes('not implemented')) {
                toast.error("Plugin indisponível. Execute no dispositivo Android.");
              } else {
                toast.error("Permissão negada: " + msg);
              }
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
