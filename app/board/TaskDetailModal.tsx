"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AvatarTag } from "@/components/AvatarTag";
import type {
  Assignee,
  Priority,
  Project,
  Task,
  TaskStatus,
} from "@/lib/types";
import { TASK_COLUMNS } from "@/lib/types";

interface Props {
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];
const ASSIGNEES: Assignee[] = ["Kyle", "Vic"];

export function TaskDetailModal({
  task,
  projects,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const [local, setLocal] = useState<Task | null>(task);

  useEffect(() => {
    setLocal(task);
  }, [task]);

  if (!task || !local) {
    return <Modal open={false} onClose={onClose}>{null}</Modal>;
  }

  function set<K extends keyof Task>(key: K, value: Task[K]) {
    if (!local) return;
    const next = { ...local, [key]: value };
    setLocal(next);
    onUpdate(next.id, { [key]: value } as Partial<Task>);
  }

  return (
    <Modal
      open={!!task}
      onClose={onClose}
      size="lg"
      title={
        <div>
          <input
            value={local.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full bg-transparent border-0 text-base font-semibold tracking-tight text-fg focus:outline-none p-0"
          />
          <p className="mt-0.5 text-2xs text-fg-subtle">
            Created {new Date(local.createdAt).toLocaleString()}
          </p>
        </div>
      }
      footer={
        <>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(local.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-4">
          <Field label="Description">
            <textarea
              value={local.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What's this task about?"
              className="input-base"
              rows={4}
            />
          </Field>
          <Field label="Notes">
            <textarea
              value={local.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Internal notes, links, blockers…"
              className="input-base"
              rows={5}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <Field label="Status">
            <select
              value={local.status}
              onChange={(e) => set("status", e.target.value as TaskStatus)}
              className="input-base"
            >
              {TASK_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Assignee">
            <div className="grid grid-cols-2 gap-1.5">
              {ASSIGNEES.map((a) => (
                <button
                  key={a}
                  onClick={() => set("assignee", a)}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                    local.assignee === a
                      ? "border-accent/50 bg-accent-subtle/40 text-fg"
                      : "border-border bg-bg-elev text-fg-muted hover:text-fg"
                  }`}
                >
                  <AvatarTag name={a} size="xs" />
                  {a}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Priority">
            <select
              value={local.priority}
              onChange={(e) => set("priority", e.target.value as Priority)}
              className="input-base"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Due Date">
            <input
              type="date"
              value={local.dueDate ? local.dueDate.slice(0, 10) : ""}
              onChange={(e) =>
                set(
                  "dueDate",
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                )
              }
              className="input-base"
            />
          </Field>

          <Field label="Project">
            <select
              value={local.projectId ?? ""}
              onChange={(e) =>
                set("projectId", e.target.value || undefined)
              }
              className="input-base"
            >
              <option value="">— No project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
        {label}
      </label>
      {children}
    </div>
  );
}
