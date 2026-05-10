import { cn } from "@/lib/utils";
import type { Assignee } from "@/lib/types";

const COLORS: Record<Assignee, string> = {
  Kyle: "bg-gradient-to-br from-indigo-500 to-purple-500",
  Vic: "bg-gradient-to-br from-emerald-500 to-teal-600",
};

export function AvatarTag({
  name,
  size = "sm",
}: {
  name: Assignee;
  size?: "xs" | "sm" | "md";
}) {
  const dim =
    size === "xs" ? "h-4 w-4 text-[9px]" : size === "md" ? "h-7 w-7 text-xs" : "h-5 w-5 text-[10px]";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white ring-1 ring-white/10 shrink-0",
        dim,
        COLORS[name],
      )}
      title={name}
    >
      {name.charAt(0)}
    </span>
  );
}
