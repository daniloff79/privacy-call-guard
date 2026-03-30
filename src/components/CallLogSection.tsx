import { PhoneIncoming, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CallLogEntry } from "@/hooks/useCallLog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CallLogSectionProps {
  log: CallLogEntry[];
  onClear: () => void;
}

export default function CallLogSection({ log, onClear }: CallLogSectionProps) {
  if (log.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="h-4 w-4" />
          Log de Chamadas Bloqueadas
        </h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-10 text-center">
          <PhoneIncoming className="mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhuma chamada bloqueada ainda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="h-4 w-4" />
          Log de Chamadas Bloqueadas
        </h2>
        <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={onClear}>
          <Trash2 className="h-3.5 w-3.5" />
          Limpar
        </Button>
      </div>

      <div className="space-y-2">
        {log.map((entry) => {
          const date = new Date(entry.blockedAt);
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                  <PhoneIncoming className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{entry.number}</p>
                  <p className="text-xs text-muted-foreground">
                    Regra: <span className="font-medium">{entry.matchedRule}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-card-foreground">
                  {format(date, "HH:mm:ss")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(date, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
