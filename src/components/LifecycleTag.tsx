import { cn } from "@/lib/utils";
import type { LifecyclePhase } from "@/lib/types";
import { lifecycleColour } from "@/lib/types";

interface LifecycleTagProps {
  lifecycle: LifecyclePhase | null;
  className?: string;
}

/**
 * A badge displaying the lifecycle phase of a fact sheet.
 */
export function LifecycleTag({ lifecycle, className }: LifecycleTagProps) {
  if (!lifecycle) return null;

  const colorClass = lifecycleColour[lifecycle];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {lifecycle}
    </span>
  );
}
