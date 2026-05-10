"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  KanbanSquare,
  LayoutGrid,
  ListTodo,
  Plus,
  Timer,
} from "lucide-react";
import { AvatarTag } from "@/components/AvatarTag";
import { Button } from "@/components/ui/Button";
import { PriorityBadge } from "@/components/ui/Badge";
import { useLocalCollection, STORAGE } from "@/lib/storage";
import { SEED_TASKS, SEED_CRONS, SEED_PROJECTS } from "@/lib/seed";
import type { CronJob, Project, Task } from "@/lib/types";
import { formatDate, greeting, relativeTime, uid } from "@/lib/utils";

export function OverviewClient() {
  const [tasks, setTasks] = useLocalCollection<Task[]>(
    STORAGE.tasks,
    SEED_TASKS,
  );
  const [crons] = useLocalCollection<CronJob[]>(STORAGE.crons, SEED_CRONS);
  const [projects] = useLocalCollection<Project[]>(
    STORAGE.projects,
    SEED_PROJECTS,
  );
  const [quickTitle, setQuickTitle] = useState("");

  const stats = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 86_400_000;
    const completedThisWeek = tasks.filter(
      (t) =>
        t.status === "done" &&
        new Date(t.createdAt).getTime() >= sevenDaysAgo,
    ).length;
    const activeTasks = tasks.filter((t) => t.status !== "done").length;
    const activeCrons = crons.filter((c) => c.status === "active").length;
    return {
      activeTasks,
      projects: projects.length,
      crons: activeCrons,
      completedThisWeek,
    };
  }, [tasks, projects, crons]);

  const recent = useMemo(() => {
    const items: { id: string; text: string; when: string; href: string }[] = [];
    for (const t of tasks) {
      items.push({
        id: `task-${t.id}`,
        text: `Task “${t.title}” · ${t.status.replace("-", " ")}`,
        when: t.createdAt,
        href: "/board",
      });
    }
    for (const p of projects) {
      items.push({
        id: `prj-${p.id}`,
        text: `Project “${p.name}” updated · ${p.progress}%`,
        when: p.updatedAt,
        href: `/projects/${p.id}`,
      });
    }
    for (const c of crons) {
      if (c.lastRun)
        items.push({
          id: `cron-${c.id}`,
          text: `Cron “${c.name}” ran`,
          when: c.lastRun,
          href: "/calendar",
        });
    }
    return items
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, 8);
  }, [tasks, projects, crons]);

  const upcoming = useMemo(() => {
    return tasks
      .filter((t) => t.status !== "done" && t.dueDate)
      .sort(
        (a, b) =>
          new Date(a.dueDate as string).getTime() -
          new Date(b.dueDate as string).getTime(),
      )
      .slice(0, 5);
  }, [tasks]);

  function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quickTitle.trim();
    if (!title) return;
    const t: Task = {
      id: uid("task"),
      title,
      description: "",
      assignee: "Kyle",
      status: "backlog",
      priority: "medium",
      createdAt: new Date().toISOString(),
      notes: "",
    };
    setTasks((prev) => [t, ...prev]);
    setQuickTitle("");
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <section className="mb-8">
        <div className="rounded-xl border border-border bg-gradient-to-br from-bg-panel via-bg-panel to-bg-subtle p-6 shadow-card overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-40 dotted-bg" />
          <div className="relative">
            <p className="text-xs uppercase tracking-wider text-fg-subtle font-medium">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">
              {greeting()}, Kyle
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Here&apos;s where things stand across your projects, tasks, and
              automations.
            </p>

            <form onSubmit={quickAdd} className="mt-5 flex gap-2 max-w-xl">
              <input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Quick add a task — what needs doing?"
                className="input-base"
              />
              <Button type="submit" variant="primary" size="md" className="shrink-0">
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                Add
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Tasks"
          value={stats.activeTasks}
          icon={<ListTodo className="h-4 w-4" />}
          tone="indigo"
          href="/board"
        />
        <StatCard
          label="Projects"
          value={stats.projects}
          icon={<LayoutGrid className="h-4 w-4" />}
          tone="emerald"
          href="/projects"
        />
        <StatCard
          label="Active Cron Jobs"
          value={stats.crons}
          icon={<Timer className="h-4 w-4" />}
          tone="amber"
          href="/calendar"
        />
        <StatCard
          label="Completed This Week"
          value={stats.completedThisWeek}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="rose"
          href="/board"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-bg-panel shadow-card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-fg">Recent Activity</h2>
            <Link
              href="/board"
              className="text-xs text-fg-muted hover:text-fg flex items-center gap-1"
            >
              View board <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border-subtle">
            {recent.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-bg-elev/40 transition-colors"
                >
                  <span className="text-sm text-fg-muted truncate flex-1">
                    {item.text}
                  </span>
                  <span className="text-2xs text-fg-subtle shrink-0">
                    {relativeTime(item.when)}
                  </span>
                </Link>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="px-5 py-6 text-sm text-fg-subtle">
                No activity yet.
              </li>
            )}
          </ul>
        </div>

        {/* Upcoming due dates */}
        <div className="rounded-xl border border-border bg-bg-panel shadow-card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-fg flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-fg-subtle" /> Due Next
            </h2>
            <Link
              href="/board"
              className="text-xs text-fg-muted hover:text-fg flex items-center gap-1"
            >
              All tasks <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border-subtle">
            {upcoming.map((t) => (
              <li
                key={t.id}
                className="px-5 py-3 hover:bg-bg-elev/40 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <AvatarTag name={t.assignee} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-fg truncate">{t.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <span className="text-2xs text-fg-subtle">
                        Due {formatDate(t.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {upcoming.length === 0 && (
              <li className="px-5 py-6 text-sm text-fg-subtle">
                Nothing scheduled.
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-border bg-bg-panel shadow-card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-fg flex items-center gap-2">
              <KanbanSquare className="h-3.5 w-3.5 text-fg-subtle" /> Project
              Snapshot
            </h2>
            <Link
              href="/projects"
              className="text-xs text-fg-muted hover:text-fg flex items-center gap-1"
            >
              All projects <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="card-lift rounded-lg border border-border bg-bg-subtle/60 p-3 hover:bg-bg-elev/60"
              >
                <p className="text-xs font-medium text-fg line-clamp-2 min-h-[2.5em]">
                  {p.name}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg-elev">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-2xs text-fg-subtle">
                  {p.progress}% complete
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const TONE: Record<string, string> = {
  indigo: "from-indigo-500/15 ring-indigo-500/25 text-indigo-300",
  emerald: "from-emerald-500/15 ring-emerald-500/25 text-emerald-300",
  amber: "from-amber-500/15 ring-amber-500/25 text-amber-300",
  rose: "from-rose-500/15 ring-rose-500/25 text-rose-300",
};

function StatCard({
  label,
  value,
  icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: keyof typeof TONE;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group card-lift rounded-xl border border-border bg-bg-panel p-4 shadow-card"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-fg-muted">{label}</span>
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br to-transparent ring-1 ring-inset ${TONE[tone]}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-fg tabular-nums">
          {value}
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-fg-dim group-hover:text-fg-muted transition-colors" />
      </div>
    </Link>
  );
}
