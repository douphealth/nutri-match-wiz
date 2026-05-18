import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  reasons: string[];
  variant?: "gate" | "inline";
}

export function SafetyWarnings({ reasons, variant = "gate" }: Props) {
  if (!reasons.length) return null;
  const Icon = variant === "gate" ? ShieldAlert : AlertTriangle;
  return (
    <Alert className="border-amber-500/40 bg-amber-500/5">
      <Icon className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700 dark:text-amber-400">
        {variant === "gate" ? "Clinician guidance recommended" : "Safety notes"}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/80">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        {variant === "gate" && (
          <p className="mt-3 text-xs text-muted-foreground">
            This tool is educational. Please talk with a qualified clinician, pharmacist, or registered dietitian
            before starting, stopping, or changing supplements.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
