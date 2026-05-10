import type { CronJob, Project, Task } from "./types";
import { nextCronRun } from "./utils";

function isoIn(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}
function isoAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export const SEED_PROJECTS: Project[] = [
  {
    id: "prj_superstore",
    name: "Superstore Bot (Tara Shop Bot)",
    description:
      "Automated shopping assistant for Tara — scrapes price lists, monitors stock, drafts orders.",
    progress: 75,
    milestones: [
      { id: "ms_1", title: "Scrape source catalog", completed: true },
      { id: "ms_2", title: "Normalize SKU schema", completed: true },
      { id: "ms_3", title: "Order draft generator", completed: true },
      { id: "ms_4", title: "Approval workflow", completed: false },
      { id: "ms_5", title: "Production deploy", completed: false },
    ],
    notes:
      "Tara reviewed the latest order drafts — happy with format. Approval flow next.",
    createdAt: isoAgo(45),
    updatedAt: isoAgo(2),
  },
  {
    id: "prj_vicstockbot",
    name: "VicStockBot",
    description:
      "Real-time stock signal bot — scans Victor's racquet inventory, flags reorder thresholds.",
    progress: 30,
    milestones: [
      { id: "ms_6", title: "Inventory data feed", completed: true },
      { id: "ms_7", title: "Threshold rules engine", completed: false },
      { id: "ms_8", title: "Slack alerts", completed: false },
      { id: "ms_9", title: "Weekly report", completed: false },
    ],
    notes: "Waiting on warehouse to confirm reorder thresholds per SKU class.",
    createdAt: isoAgo(30),
    updatedAt: isoAgo(5),
  },
  {
    id: "prj_victorlinker",
    name: "Victor Linker",
    description:
      "Cross-platform LinkedIn-to-CRM bridge for Victor — auto-enriches leads, syncs to pipeline.",
    progress: 60,
    milestones: [
      { id: "ms_10", title: "LinkedIn scraper", completed: true },
      { id: "ms_11", title: "Enrichment pipeline", completed: true },
      { id: "ms_12", title: "CRM sync", completed: true },
      { id: "ms_13", title: "Duplicate detection", completed: false },
      { id: "ms_14", title: "Launch dashboard", completed: false },
    ],
    notes:
      "Duplicate detection is non-trivial — Vic suggested fuzzy match on company + name.",
    createdAt: isoAgo(60),
    updatedAt: isoAgo(1),
  },
  {
    id: "prj_stikine",
    name: "Stikine Outfitters — Contact Harvesting",
    description:
      "Outreach engine for Stikine Outfitters — harvests qualified contacts from regional fishing/hunting databases.",
    progress: 85,
    milestones: [
      { id: "ms_15", title: "Source list audit", completed: true },
      { id: "ms_16", title: "Harvest engine", completed: true },
      { id: "ms_17", title: "Email validator", completed: true },
      { id: "ms_18", title: "Outreach templates", completed: true },
      { id: "ms_19", title: "Send + track", completed: false },
    ],
    notes: "Almost there — just need final approval on outreach copy.",
    createdAt: isoAgo(50),
    updatedAt: isoAgo(3),
  },
  {
    id: "prj_booking",
    name: "Booking Bot",
    description:
      "Automated booking assistant — handles inbound reservation requests across email + DMs.",
    progress: 50,
    milestones: [
      { id: "ms_20", title: "Inbox connectors", completed: true },
      { id: "ms_21", title: "Intent classifier", completed: true },
      { id: "ms_22", title: "Calendar integration", completed: false },
      { id: "ms_23", title: "Confirmation flow", completed: false },
    ],
    notes: "Calendar integration blocked on Google Workspace OAuth scopes.",
    createdAt: isoAgo(20),
    updatedAt: isoAgo(4),
  },
];

export const SEED_TASKS: Task[] = [
  {
    id: "task_1",
    title: "Wire up approval workflow for Superstore drafts",
    description:
      "Tara needs a one-click approve/reject UI for each generated order draft. Email + SMS notify on approval.",
    assignee: "Vic",
    status: "in-progress",
    priority: "high",
    projectId: "prj_superstore",
    dueDate: isoIn(3),
    createdAt: isoAgo(2),
    notes: "Use the existing /approve endpoint scaffolding from VicStockBot.",
  },
  {
    id: "task_2",
    title: "Define reorder thresholds per racquet class",
    description:
      "Sit with warehouse to lock thresholds for: junior, intermediate, performance, elite.",
    assignee: "Kyle",
    status: "backlog",
    priority: "medium",
    projectId: "prj_vicstockbot",
    dueDate: isoIn(7),
    createdAt: isoAgo(5),
    notes: "",
  },
  {
    id: "task_3",
    title: "Fuzzy dedup for Victor Linker contacts",
    description:
      "Implement fuzzy match on (company_name, full_name) before pushing to CRM. Threshold 0.85.",
    assignee: "Vic",
    status: "in-review",
    priority: "high",
    projectId: "prj_victorlinker",
    dueDate: isoIn(2),
    createdAt: isoAgo(4),
    notes: "PR opened — needs final review.",
  },
  {
    id: "task_4",
    title: "Approve Stikine outreach copy v3",
    description:
      "Review the three outreach variants and approve one for launch.",
    assignee: "Kyle",
    status: "in-review",
    priority: "urgent",
    projectId: "prj_stikine",
    dueDate: isoIn(1),
    createdAt: isoAgo(1),
    notes: "Variant B feels strongest, but variant C tested better in preview.",
  },
  {
    id: "task_5",
    title: "Unblock Google Workspace OAuth scopes",
    description:
      "Booking bot stuck — need calendar.events scope approved on the workspace project.",
    assignee: "Kyle",
    status: "backlog",
    priority: "high",
    projectId: "prj_booking",
    createdAt: isoAgo(3),
    notes: "Submit verification form before Friday.",
  },
  {
    id: "task_6",
    title: "Mission Control v1 launch",
    description: "Ship Mission Control internally and start dogfooding.",
    assignee: "Vic",
    status: "done",
    priority: "medium",
    dueDate: isoAgo(0),
    createdAt: isoAgo(7),
    notes: "Done.",
  },
  {
    id: "task_7",
    title: "Weekly status digest template",
    description:
      "Stand up a Friday status template that pulls from Projects + Cron Jobs and emails Kyle.",
    assignee: "Vic",
    status: "backlog",
    priority: "low",
    createdAt: isoAgo(6),
    notes: "",
  },
  {
    id: "task_8",
    title: "Audit cron job failure rates",
    description:
      "Pull last 7 days of cron runs, identify any with >5% failure rate, root cause.",
    assignee: "Vic",
    status: "in-progress",
    priority: "medium",
    dueDate: isoIn(4),
    createdAt: isoAgo(3),
    notes: "",
  },
];

function nextRunFor(expr: string): string {
  const next = nextCronRun(expr);
  return next ? next.toISOString() : isoIn(1);
}

export const SEED_CRONS: CronJob[] = [
  {
    id: "cron_1",
    name: "Daily knowledge mining",
    schedule: "0 6 * * *",
    description:
      "Crawl curated sources, summarize, dedupe, store in knowledge base.",
    nextRun: nextRunFor("0 6 * * *"),
    lastRun: isoAgo(1),
    status: "active",
  },
  {
    id: "cron_2",
    name: "Heartbeat check — all bots",
    schedule: "*/15 * * * *",
    description:
      "Pings each production bot's /health endpoint. Alerts Slack on failure.",
    nextRun: nextRunFor("*/15 * * * *"),
    lastRun: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "cron_3",
    name: "Weekly project digest",
    schedule: "0 9 * * 1",
    description:
      "Compiles project progress + flagged tasks, emails Kyle Monday 9am.",
    nextRun: nextRunFor("0 9 * * 1"),
    lastRun: isoAgo(6),
    status: "active",
  },
  {
    id: "cron_4",
    name: "Stock-bot sweep",
    schedule: "0 */4 * * *",
    description: "VicStockBot inventory sweep every 4 hours.",
    nextRun: nextRunFor("0 */4 * * *"),
    lastRun: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "cron_5",
    name: "Stikine outreach send",
    schedule: "30 10 * * 2,4",
    description: "Sends batched outreach Tue + Thu at 10:30am.",
    nextRun: nextRunFor("30 10 * * 2,4"),
    lastRun: isoAgo(3),
    status: "paused",
  },
  {
    id: "cron_6",
    name: "Linker CRM sync",
    schedule: "*/30 * * * *",
    description: "Pushes enriched contacts from Victor Linker into CRM.",
    nextRun: nextRunFor("*/30 * * * *"),
    lastRun: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    status: "error",
  },
  {
    id: "cron_7",
    name: "Nightly DB backup",
    schedule: "0 2 * * *",
    description: "Snapshot + ship to remote storage.",
    nextRun: nextRunFor("0 2 * * *"),
    lastRun: isoAgo(1),
    status: "active",
  },
];
