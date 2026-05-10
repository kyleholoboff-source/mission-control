"use client";

import { useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { useLocalCollection, STORAGE } from "@/lib/storage";
import { SEED_TASKS, SEED_PROJECTS } from "@/lib/seed";
import { TASK_COLUMNS, type Task, type TaskStatus, type Project } from "@/lib/types";
import { cn, uid } from "@/lib/utils";

export function BoardClient() {
  const [tasks, setTasks, hydrated] = useLocalCollection<Task[]>(
    STORAGE.tasks,
    SEED_TASKS,
  );
  const [projects] = useLocalCollection<Project[]>(
    STORAGE.projects,
    SEED_PROJECTS,
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      "in-progress": [],
      "in-review": [],
      done: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    setTasks((prev) => {
      const next = [...prev];
      const moved = next.find((t) => t.id === draggableId);
      if (!moved) return prev;

      // Remove from current position
      const filtered = next.filter((t) => t.id !== draggableId);

      // Insert into target column at the target index, computing absolute index
      const targetStatus = destination.droppableId as TaskStatus;
      const updated: Task = { ...moved, status: targetStatus };

      // Build column-grouped insertion
      const out: Task[] = [];
      const inserted = new Set<TaskStatus>();
      const colLists: Record<TaskStatus, Task[]> = {
        backlog: [],
        "in-progress": [],
        "in-review": [],
        done: [],
      };
      for (const t of filtered) colLists[t.status].push(t);
      colLists[targetStatus].splice(destination.index, 0, updated);
      for (const col of TASK_COLUMNS) {
        for (const t of colLists[col.id]) out.push(t);
        inserted.add(col.id);
      }
      return out;
    });
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveTaskId(null);
  }

  function addTask(status: TaskStatus, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    const t: Task = {
      id: uid("task"),
      title: trimmed,
      description: "",
      assignee: "Kyle",
      status,
      priority: "medium",
      createdAt: new Date().toISOString(),
      notes: "",
    };
    setTasks((prev) => [...prev, t]);
    setNewTitle("");
    setAddingTo(null);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg">
            Task Board
          </h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            Drag cards across columns. Click a card to edit details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-subtle">
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 min-w-[1100px]">
            {TASK_COLUMNS.map((col) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    className={cn(
                      "flex flex-col rounded-xl border border-border bg-bg-subtle/60 min-h-0",
                      snapshot.isDraggingOver && "border-accent/40 bg-accent-subtle/20",
                    )}
                  >
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <ColumnDot status={col.id} />
                        <h2 className="text-sm font-medium text-fg">
                          {col.title}
                        </h2>
                        <span className="text-2xs text-fg-subtle bg-bg-elev px-1.5 py-0.5 rounded">
                          {grouped[col.id].length}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAddingTo(col.id);
                          setNewTitle("");
                        }}
                        className="text-fg-subtle hover:text-fg p-0.5 -m-0.5 rounded transition-colors"
                        aria-label={`Add task to ${col.title}`}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>

                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 overflow-y-auto p-2 space-y-2"
                    >
                      {grouped[col.id].map((t, idx) => (
                        <Draggable key={t.id} draggableId={t.id} index={idx}>
                          {(p, snap) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              style={p.draggableProps.style}
                            >
                              <TaskCard
                                task={t}
                                project={projects.find(
                                  (pr) => pr.id === t.projectId,
                                )}
                                dragging={snap.isDragging}
                                onClick={() => setActiveTaskId(t.id)}
                                onTitleChange={(title) =>
                                  updateTask(t.id, { title })
                                }
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {addingTo === col.id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            addTask(col.id, newTitle);
                          }}
                          className="rounded-lg border border-accent/40 bg-bg-panel p-2.5 shadow-card"
                        >
                          <input
                            autoFocus
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={() => {
                              if (!newTitle.trim()) setAddingTo(null);
                              else addTask(col.id, newTitle);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setAddingTo(null);
                                setNewTitle("");
                              }
                            }}
                            placeholder="Task title…"
                            className="input-base !py-1 !text-sm"
                          />
                          <div className="mt-2 flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setAddingTo(null);
                                setNewTitle("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" variant="primary" type="submit">
                              Add
                            </Button>
                          </div>
                        </form>
                      )}

                      {addingTo !== col.id && (
                        <button
                          onClick={() => {
                            setAddingTo(col.id);
                            setNewTitle("");
                          }}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-subtle text-fg-subtle hover:border-border hover:text-fg-muted text-xs py-2 transition-colors"
                        >
                          <Plus className="h-3 w-3" /> Add a card
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>

      <TaskDetailModal
        task={activeTask}
        projects={projects}
        onClose={() => setActiveTaskId(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />

      {!hydrated && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden />
      )}
    </div>
  );
}

function ColumnDot({ status }: { status: TaskStatus }) {
  const color =
    status === "backlog"
      ? "bg-slate-400"
      : status === "in-progress"
        ? "bg-indigo-400"
        : status === "in-review"
          ? "bg-amber-400"
          : "bg-emerald-400";
  return <span className={cn("h-1.5 w-1.5 rounded-full", color)} />;
}
