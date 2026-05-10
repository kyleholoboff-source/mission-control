"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckSquare,
  Plus,
  Square,
  Trash2,
} from "lucide-react";
import { AvatarTag } from "@/components/AvatarTag";
import { PriorityBadge, Pill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLocalCollection, STORAGE } from "@/lib/storage";
import { SEED_PROJECTS, SEED_TASKS } from "@/lib/seed";
import type { Milestone, Project, Task } from "@/lib/types";
import { cn, formatDate, relativeTime, uid } from "@/lib/utils";

export function ProjectDetailClient({ id }: { id: string }) {
  const [projects, setProjects, hydrated] = useLocalCollection<Project[]>(
    STORAGE.projects,
    SEED_PROJECTS,
  );
  const [tasks] = useLocalCollection<Task[]>(STORAGE.tasks, SEED_TASKS);
  const router = useRouter();

  const project = projects.find((p) => p.id === id);
  const linked = useMemo(
    () => tasks.filter((t) => t.projectId === id),
    [tasks, id],
  );

  const [newMilestone, setNewMilestone] = useState("");

  if (!hydrated) {
    return (
      <div className="px-6 py-12 max-w-4xl mx-auto text-sm text-fg-subtle">
        Loading…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to projects
        </Link>
        <p className="mt-6 text-fg-muted">Project not found.</p>
      </div>
    );
  }

  function update(patch: Partial<Project>) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...patch, updatedAt: new Date().toISOString() }
          : p,
      ),
    );
  }

  function setMilestones(ms: Milestone[]) {
    update({ milestones: ms });
  }

  function addMilestone() {
    const t = newMilestone.trim();
    if (!t) return;
    setMilestones([
      ...project!.milestones,
      { id: uid("ms"), title: t, completed: false },
    ]);
    setNewMilestone("");
  }

  function toggleMilestone(msId: string) {
    setMilestones(
      project!.milestones.map((m) =>
        m.id === msId ? { ...m, completed: !m.completed } : m,
      ),
    );
  }

  function removeMilestone(msId: string) {
    setMilestones(project!.milestones.filter((m) => m.id !== msId));
  }

  function deleteProject() {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    router.push("/projects");
  }

  const msDone = project.milestones.filter((m) => m.completed).length;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All projects
      </Link>

      <div className="rounded-xl border border-border bg-bg-panel p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <input
              value={project.name}
              onChange={(e) => update({ name: e.target.value })}
              className="w-full bg-transparent border-0 text-xl font-semibold tracking-tight text-fg focus:outline-none p-0"
            />
            <textarea
              value={project.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Describe this project…"
              rows={2}
              className="mt-2 w-full bg-transparent border-0 text-sm text-fg-muted focus:outline-none p-0 resize-none"
            />
          </div>
          <Button size="sm" variant="danger" onClick={deleteProject}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
              Progress
            </span>
            <span className="text-sm font-medium text-fg tabular-nums">
              {project.progress}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={project.progress}
            onChange={(e) =>
              update({ progress: parseInt(e.target.value, 10) })
            }
            className="w-full accent-indigo-500"
          />
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-bg-elev">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Milestones */}
        <section className="rounded-xl border border-border bg-bg-panel shadow-card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-fg">Milestones</h2>
            <span className="text-2xs text-fg-subtle">
              {msDone}/{project.milestones.length} done
            </span>
          </div>
          <ul className="divide-y divide-border-subtle">
            {project.milestones.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-2 px-5 py-2.5 group hover:bg-bg-elev/40"
              >
                <button
                  onClick={() => toggleMilestone(m.id)}
                  className="text-fg-muted hover:text-fg"
                  aria-label={m.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {m.completed ? (
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    m.completed
                      ? "line-through text-fg-subtle"
                      : "text-fg",
                  )}
                >
                  {m.title}
                </span>
                <button
                  onClick={() => removeMilestone(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-fg-subtle hover:text-rose-300"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {project.milestones.length === 0 && (
              <li className="px-5 py-6 text-sm text-fg-subtle">
                No milestones yet.
              </li>
            )}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMilestone();
            }}
            className="flex gap-2 p-3 border-t border-border-subtle"
          >
            <input
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="Add a milestone…"
              className="input-base !py-1.5 !text-sm"
            />
            <Button type="submit" variant="primary" size="sm" className="shrink-0">
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </form>
        </section>

        {/* Notes */}
        <section className="rounded-xl border border-border bg-bg-panel shadow-card">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-fg">Notes</h2>
          </div>
          <div className="p-5">
            <textarea
              value={project.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Internal notes, decisions, blockers…"
              className="input-base"
              rows={10}
            />
            <p className="mt-2 text-2xs text-fg-subtle">
              Auto-saved · Last updated {relativeTime(project.updatedAt)}
            </p>
          </div>
        </section>
      </div>

      {/* Linked tasks */}
      <section className="mt-4 rounded-xl border border-border bg-bg-panel shadow-card">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-semibold text-fg">Linked Tasks</h2>
          <Link
            href="/board"
            className="text-xs text-fg-muted hover:text-fg"
          >
            Open board →
          </Link>
        </div>
        <ul className="divide-y divide-border-subtle">
          {linked.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-bg-elev/40"
            >
              <AvatarTag name={t.assignee} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-fg truncate">{t.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <Pill>{t.status.replace("-", " ")}</Pill>
                  {t.dueDate && (
                    <span className="text-2xs text-fg-subtle">
                      Due {formatDate(t.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
          {linked.length === 0 && (
            <li className="px-5 py-6 text-sm text-fg-subtle">
              No tasks linked to this project yet. Link one from the{" "}
              <Link
                href="/board"
                className="text-accent hover:text-accent-hover"
              >
                board
              </Link>
              .
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
