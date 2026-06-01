import type { LifecyclePhase } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";

interface LifecycleTagProps {
  lifecycle: LifecyclePhase | null;
  className?: string;
}

const lifecycleVariantMap: Record<LifecyclePhase, BadgeVariant> = {
  Plan: "info",
  "Phase In": "info",
  Active: "success",
  "Phase Out": "warning",
  "End of Life": "destructive",
};

/**
 * A badge displaying the lifecycle phase of a fact sheet.
 */
export function LifecycleTag({ lifecycle, className }: LifecycleTagProps) {
  if (!lifecycle) return null;

  return (
    <Badge variant={lifecycleVariantMap[lifecycle]} className={className}>
      {lifecycle}
    </Badge>
  );
}
