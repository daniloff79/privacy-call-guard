import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (pattern: string, label: string) => void;
}

const PATTERN_REGEX = /^[0-9*+\-() ]+$/;

export default function AddRuleDialog({ open, onOpenChange, onAdd }: Props) {
  const [pattern, setPattern] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = pattern.trim();
    if (!trimmed) {
      setError("Informe um número ou padrão.");
      return;
    }
    if (!PATTERN_REGEX.test(trimmed)) {
      setError("Apenas números, *, +, -, (, ) e espaços são permitidos.");
      return;
    }
    onAdd(trimmed, label.trim() || trimmed);
    setPattern("");
    setLabel("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Regra de Bloqueio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pattern">Número ou Padrão (wildcard)</Label>
            <Input
              id="pattern"
              placeholder="Ex: *0800*, *4004*, +5511..."
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Use <code className="rounded bg-muted px-1 py-0.5 font-mono text-accent-foreground">*</code> como curinga. Ex: <code className="rounded bg-muted px-1 py-0.5 font-mono text-accent-foreground">*0800*</code> bloqueia qualquer número contendo "0800".
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Rótulo (opcional)</Label>
            <Input
              id="label"
              placeholder="Ex: Telemarketing, Spam..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
