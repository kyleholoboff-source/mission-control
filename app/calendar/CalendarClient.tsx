"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useLocalCollection, STORAGE } from "@/lib/storage";
import { SEED_CRONS } from "@/lib/seed";
import type { CronJob, CronStatus } from "@/lib/types";
import {
  cn,
  describeCron,
  formatDateTime,
  nextCronRun,
  relativeTime,
  uid,
} from "@/lib/utils";

export function CalendarClient() {
  const [crons, setCrons] = useLocalCollection<CronJob[]>(
    STORAGE.crons,
    SEED_CRONS,
  );
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [addOpen, setAddOpen] = useState(false);
  const [activeCron, setActiveCron] = useState<string | null>(null);

  const month = cursor.getMonth();
  const year = cursor.getFullYear();

  // Project next-30-day occurrences for each cron
  const occurrencesByDay = useMemo(() => {
    const map = new Map<string, { cron: CronJob; at: Date }[]>();
    const from = new Date(year, month, 1, 0, 0, 0, 0);
    const to = new Date(year, month + 1, 1, 0, 0, 0, 0);

    for (const c of crons) {
      if (c.status !== "active") continue;
      let pivot = new Date(from.getTime() - 60_000);
      for (let i = 0; i < 200; i++) {
        const nxt = nextCronRun(c.schedule, pivot);
        if (!nxt) break;
        if (nxt >= to) break;
        const key = dayKey(nxt);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ cron: c, at: nxt });
        pivot = nxt;
      }
    }
    return map;
  }, [crons, month, year]);

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  function addCron(data: { name: string; schedule: string; description: string }) {
    const trimmed = data.schedule.trim();
    const next = nextCronRun(trimmed);
    const c: CronJob = {
      id: uid("cron"),
      name: data.name.trim() || "Untitled job",
      schedule: trimmed,
      description: data.description.trim(),
      nextRun: (next ?? new Date(Date.now() + 86_400_000)).toISOString(),
      status: "active",
    };
    setCrons((prev) => [c, ...prev]);
  }

  function toggleStatus(id: string) {
    setCrons((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status:
                c.status === "active"
                  ? "paused"
                  : c.status === "paused"
                    ? "active"
                    : "active",
            }
          : c,
      ),
    );
  }

  function removeCron(id: string) {
    setCrons((prev) => prev.filter((c) => c.id !== id));
    setActiveCron(null);
  }

  const active = crons.find((c) => c.id === activeCron) ?? null;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg">
            Calendar
          </h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            Scheduled cron jobs and recurring automations.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Cron Job
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Calendar grid */}
        <div className="rounded-xl border border-border bg-bg-panel shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-fg-muted" />
              <h2 className="text-sm font-semibold text-fg">
                {cursor.toLocaleString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const d = new Date();
                  d.setDate(1);
                  d.setHours(0, 0, 0, 0);
                  setCursor(d);
                }}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-border bg-bg-subtle/40">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-fg-subtle text-center"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const inMonth = cell.getMonth() === month;
              const isToday = isSameDay(cell, new Date());
              const evts = occurrencesByDay.get(dayKey(cell)) ?? [];
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[96px] border-b border-r border-border-subtle p-1.5 flex flex-col gap-1",
                    !inMonth && "bg-bg-subtle/20 opacity-50",
                    (i + 1) % 7 === 0 && "border-r-0",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-2xs font-medium",
                        isToday
                          ? "rounded-full bg-accent text-white px-1.5 py-0.5"
                          : "text-fg-muted",
                      )}
                    >
                      {cell.getDate()}
                    </span>
                    {evts.length > 0 && (
                      <span className="text-2xs text-fg-subtle">
                        {evts.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {evts.slice(0, 3).map((e, j) => (
                      <button
                        key={`${e.cron.id}_${j}`}
                        onClick={() => setActiveCron(e.cron.id)}
                        className="w-full truncate text-left text-2xs rounded px-1 py-0.5 bg-accent-subtle/50 text-accent hover:bg-accent-subtle ring-1 ring-inset ring-accent/20"
                        title={`${e.cron.name} · ${formatDateTime(e.at.toISOString())}`}
                      >
                        {e.at
                          .toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                          .replace(" ", "")}{" "}
                        {e.cron.name}
                      </button>
                    ))}
                    {evts.length > 3 && (
                      <span className="text-2xs text-fg-subtle">
                        +{evts.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <aside className="rounded-xl border border-border bg-bg-panel shadow-card flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-fg">Cron Jobs</h2>
            <p className="text-2xs text-fg-subtle">
              {crons.length} total · {crons.filter((c) => c.status === "active").length} active
            </p>
          </div>
          <ul className="flex-1 overflow-y-auto divide-y divide-border-subtle">
            {crons.map((c) => (
              <li
                key={c.id}
                className="px-4 py-3 hover:bg-bg-elev/40 transition-colors cursor-pointer"
                onClick={() => setActiveCron(c.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">
                      {c.name}
                    </p>
                    <p className="text-2xs text-fg-subtle mt-0.5">
                      {describeCron(c.schedule)} ·{" "}
                      <span className="font-mono">{c.schedule}</span>
                    </p>
                  </div>
                  <StatusDot status={c.status} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-2xs">
                  <div className="text-fg-subtle">
                    <span className="block text-fg-dim">Next run</span>
                    {formatDateTime(c.nextRun)}
                  </div>
                  <div className="text-fg-subtle">
                    <span className="block text-fg-dim">Last run</span>
                    {c.lastRun ? relativeTime(c.lastRun) : "—"}
                  </div>
                </div>
              </li>
            ))}
            {crons.length === 0 && (
              <li className="px-4 py-8 text-sm text-fg-subtle text-center">
                No cron jobs yet.
              </li>
            )}
          </ul>
        </aside>
      </div>

      <AddCronModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(d) => {
          addCron(d);
          setAddOpen(false);
        }}
      />

      <CronDetailModal
        cron={active}
        onClose={() => setActiveCron(null)}
        onToggle={() => active && toggleStatus(active.id)}
        onDelete={() => active && removeCron(active.id)}
        onUpdate={(patch) => {
          if (!active) return;
          setCrons((prev) =>
            prev.map((c) =>
              c.id === active.id
                ? {
                    ...c,
                    ...patch,
                    nextRun: patch.schedule
                      ? (
                          nextCronRun(patch.schedule) ?? new Date()
                        ).toISOString()
                      : c.nextRun,
                  }
                : c,
            ),
          );
        }}
      />
    </div>
  );
}

function AddCronModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: { name: string; schedule: string; description: string }) => void;
}) {
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("0 9 * * *");
  const [description, setDescription] = useState("");

  const preview = nextCronRun(schedule);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <h3 className="text-base font-semibold tracking-tight text-fg">
          New Cron Job
        </h3>
      }
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              if (!name.trim() || !schedule.trim()) return;
              onSubmit({ name, schedule, description });
              setName("");
              setSchedule("0 9 * * *");
              setDescription("");
            }}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daily knowledge mining"
            className="input-base"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
            Schedule (cron expression)
          </label>
          <input
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="m h dom mon dow"
            className="input-base font-mono"
          />
          <p className="mt-1.5 text-2xs text-fg-subtle">
            {describeCron(schedule)} ·{" "}
            {preview ? `Next: ${formatDateTime(preview.toISOString())}` : "Invalid expression"}
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this job do?"
            className="input-base"
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
}

function CronDetailModal({
  cron,
  onClose,
  onToggle,
  onDelete,
  onUpdate,
}: {
  cron: CronJob | null;
  onClose: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<CronJob>) => void;
}) {
  if (!cron) return <Modal open={false} onClose={onClose}>{null}</Modal>;
  return (
    <Modal
      open={!!cron}
      onClose={onClose}
      title={
        <div>
          <input
            value={cron.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-transparent border-0 text-base font-semibold tracking-tight text-fg focus:outline-none p-0"
          />
          <div className="mt-1 flex items-center gap-3">
            <StatusDot status={cron.status} />
            <span className="text-2xs text-fg-subtle">
              Next: {formatDateTime(cron.nextRun)}
            </span>
          </div>
        </div>
      }
      footer={
        <>
          <Button size="sm" variant="danger" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" variant="secondary" onClick={onToggle}>
            {cron.status === "active" ? "Pause" : "Resume"}
          </Button>
          <Button size="sm" variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
            Schedule
          </label>
          <input
            value={cron.schedule}
            onChange={(e) => onUpdate({ schedule: e.target.value })}
            className="input-base font-mono"
          />
          <p className="mt-1.5 text-2xs text-fg-subtle">
            {describeCron(cron.schedule)}
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
            Description
          </label>
          <textarea
            value={cron.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="input-base"
            rows={3}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
            Status
          </label>
          <select
            value={cron.status}
            onChange={(e) =>
              onUpdate({ status: e.target.value as CronStatus })
            }
            className="input-base"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}
