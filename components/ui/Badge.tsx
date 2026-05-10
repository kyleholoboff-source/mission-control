import { cn } from "@/lib/utils";
import type { Priority, CronStatus } from "@/lib/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  urgent: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
  high: "bg-orange-500/10 text-orange-300 ring-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/30",
  low: "bg-slate-500/10 text-slate-300 ring-slate-500/30",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs font-medium ring-1 ring-inset capitalize",
        PRIORITY_STYLES[priority],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

const CRON_STYLES: Record<CronStatus, { dot: string; text: string }> = {
  active: { dot: "bg-emerald-400", text: "text-emerald-300" },
  paused: { dot: "bg-amber-400", text: "text-amber-300" },
  error: { dot: "bg-rose-400", text: "text-rose-300" },
};

export function StatusDot({
  status,
  label,
}: {
  status: CronStatus;
  label?: string;
}) {
  const s = CRON_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", s.text)}>
      <span className={cn("h-2 w-2 rounded-full", s.dot, status === "active" && "pulse-dot")} />
      {label ?? status}
    </span>
  );
}

export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-2xs font-medium ring-1 ring-inset ring-border-strong bg-bg-elev text-fg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
