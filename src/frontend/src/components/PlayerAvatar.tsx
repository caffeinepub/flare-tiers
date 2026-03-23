import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function PlayerAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: PlayerAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Use mc-heads style avatar or provided URL
  const mcUrl =
    avatarUrl || `https://mc-heads.net/avatar/${encodeURIComponent(name)}/64`;

  return (
    <Avatar
      className={cn(sizeClasses[size], "border-2 border-border", className)}
    >
      <AvatarImage src={mcUrl} alt={name} />
      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-xs">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
