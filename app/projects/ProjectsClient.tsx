"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useLocalCollection, STORAGE } from "@/lib/storage";
import { SEED_PROJECTS, SEED_TASKS } from "@/lib/seed";
import type { Project, Task } from "@/lib/types";
import { formatDate, relativeTime, uid } from "@/lib/utils";

export function ProjectsClient() {
  const [projects, setProjects] = useLocalCollection<Project[]>(
    STORAGE.projects,
    SEED_PROJECTS,
  );
  const [tasks] = useLocalCollection<Task[]>(STORAGE.tasks, SEED_TASKS);

  const taskCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tasks) {
      if (t.projectId) m.set(t.projectId, (m.get(t.projectId) ?? 0) + 1);
    }
    return m;
  }, [tasks]);

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function create() {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const p: Project = {
      id: uid("prj"),
      name: name.trim(),
      description: description.trim(),
      progress: 0,
      milestones: [],
      notes: "",
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [p, ...prev]);
    setName("");
    setDescription("");
    setAddOpen(false);
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg">
            Projects
          </h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            Major projects with progress and linked work.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="group card-lift rounded-xl border border-border bg-bg-panel p-5 shadow-card flex flex-col"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-fg leading-snug">
                {p.name}
              </h2>
              <span className="text-xs text-fg-muted tabular-nums shrink-0">
                {p.progress}%
              </span>
            </div>
            <p className="mt-1.5 text-sm text-fg-muted line-clamp-2 min-h-[2.5em]">
              {p.description}
            </p>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-bg-elev">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${p.progress}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-2xs text-fg-subtle">
              <span className="flex items-center gap-1.5">
                <ListTodo className="h-3 w-3" />
                {taskCounts.get(p.id) ?? 0} task
                {(taskCounts.get(p.id) ?? 0) === 1 ? "" : "s"}
              </span>
              <span>Updated {relativeTime(p.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={
          <h3 className="text-base font-semibold tracking-tight text-fg">
            New Project
          </h3>
        }
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={create}>
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
              placeholder="Project name"
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project?"
              className="input-base"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
