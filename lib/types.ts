export type Assignee = "Kyle" | "Vic";
export type TaskStatus = "backlog" | "in-progress" | "in-review" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";
export type CronStatus = "active" | "paused" | "error";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: Assignee;
  status: TaskStatus;
  priority: Priority;
  projectId?: string;
  dueDate?: string;
  createdAt: string;
  notes: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  description: string;
  nextRun: string;
  lastRun?: string;
  status: CronStatus;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  milestones: Milestone[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const TASK_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "done", title: "Done" },
];

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
