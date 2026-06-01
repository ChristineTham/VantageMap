import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  className?: string;
}

/**
 * A small rounded pill badge for displaying status values.
 * Accepts a custom colour map or defaults to a neutral style.
 */
export function StatusBadge({ status, colorMap, className }: StatusBadgeProps) {
  const colorClass = colorMap?.[status] ?? "bg-rosely-mist/20 text-rosely-dusk";

  return <Badge className={cn("border-transparent", colorClass, className)}>{status}</Badge>;
}

const healthVariantMap: Record<HealthStatus, BadgeVariant> = {
  Excellent: "success",
  Good: "success",
  Fair: "warning",
  Poor: "destructive",
  Critical: "destructive",
};

/**
 * Specialised badge for HealthStatus values with pre-configured Rosely variants.
 */
export function HealthBadge({
  health,
  className,
}: {
  health: HealthStatus | null;
  className?: string;
}) {
  if (!health) return null;
  return (
    <Badge variant={healthVariantMap[health]} className={className}>
      {health}
    </Badge>
  );
}
