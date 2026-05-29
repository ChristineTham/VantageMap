import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/lib/types";

const healthConfig: Record<HealthStatus, { color: string; label: string }> = {
  Excellent: { color: "bg-rosely-teal", label: "Excellent" },
  Good: { color: "bg-rosely-teal", label: "Good" },
  Fair: { color: "bg-rosely-golden", label: "Fair" },
  Poor: { color: "bg-rosely-flamingo", label: "Poor" },
  Critical: { color: "bg-rosely-rose", label: "Critical" },
};

interface HealthIndicatorProps {
  health: HealthStatus | null;
  showLabel?: boolean;
  className?: string;
}

/**
 * A small coloured dot indicating health status, optionally with a text label.
 */
export function HealthIndicator({
  health,
  showLabel = false,
  className,
}: HealthIndicatorProps) {
  if (!health) return null;

  const config = healthConfig[health];

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn("inline-block h-2 w-2 rounded-full", config.color)}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-xs text-rosely-dusk">{config.label}</span>
      )}
    </span>
  );
}
