import { cn } from "@/lib/utils";
import type { Tier } from "../backend";
import { getTierClass, tierLabel } from "../hooks/useQueries";

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}

export default function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-[9px]",
    md: "w-8 h-8 text-xs",
    lg: "w-12 h-12 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-pixel font-bold",
        getTierClass(tier),
        sizeClasses[size],
      )}
    >
      {tierLabel(tier)}
    </span>
  );
}
