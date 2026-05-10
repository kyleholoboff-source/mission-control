"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { AvatarTag } from "@/components/AvatarTag";
import { PriorityBadge, Pill } from "@/components/ui/Badge";
import type { Project, Task } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface Props {
  task: Task;
  project?: Project;
  dragging?: boolean;
  onClick: () => void;
  onTitleChange: (title: string) => void;
}

export function TaskCard({
  task,
  project,
  dragging,
  onClick,
  onTitleChange,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(task.title);
  }, [task.title]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const t = draft.trim();
    if (t && t !== task.title) onTitleChange(t);
    else setDraft(task.title);
    setEditing(false);
  }

  const overdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate).getTime() < Date.now() - 86_400_000;

  return (
    <div
      onClick={() => {
        if (!editing) onClick();
      }}
      className={cn(
        "group rounded-lg border border-border bg-bg-panel p-3 shadow-card cursor-pointer card-lift",
        dragging && "ring-1 ring-accent/50 border-accent/40 rotate-[0.6deg]",
      )}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(task.title);
              setEditing(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="input-base !py-1 !text-sm"
        />
      ) : (
        <h3
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className="text-sm font-medium text-fg leading-snug line-clamp-3"
          title="Click to edit"
        >
          {task.title}
        </h3>
      )}

      {project && (
        <div className="mt-2">
          <Pill className="!text-2xs">{project.name}</Pill>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-2xs",
                overdue ? "text-rose-300" : "text-fg-subtle",
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <AvatarTag name={task.assignee} size="sm" />
      </div>
    </div>
  );
}
