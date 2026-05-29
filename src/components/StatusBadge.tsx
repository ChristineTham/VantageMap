import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/lib/types";
import { healthBg } from "@/lib/types";

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

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {status}
    </span>
  );
}

/**
 * Specialised StatusBadge for HealthStatus values with pre-configured colours.
 */
export function HealthBadge({
  health,
  className,
}: {
  health: HealthStatus | null;
  className?: string;
}) {
  if (!health) return null;
  return <StatusBadge status={health} colorMap={healthBg} className={className} />;
}
