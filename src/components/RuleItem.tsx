import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { BlockingRule } from "@/hooks/useBlockingRules";

interface Props {
  rule: BlockingRule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RuleItem({ rule, onToggle, onDelete }: Props) {
  const isWildcard = rule.pattern.includes("*");

  return (
    <div className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
        {rule.enabled ? (
          <ShieldCheck className="h-5 w-5 text-primary" />
        ) : (
          <ShieldOff className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-card-foreground">{rule.label}</p>
        <p className="truncate font-mono text-sm text-muted-foreground">
          {rule.pattern}
          {isWildcard && (
            <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
              wildcard
            </span>
          )}
        </p>
      </div>

      <Switch checked={rule.enabled} onCheckedChange={() => onToggle(rule.id)} />

      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
        onClick={() => onDelete(rule.id)}
        aria-label="Excluir regra"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
