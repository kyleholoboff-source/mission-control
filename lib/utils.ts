import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDate(iso?: string, fallback = "—"): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso?: string, fallback = "—"): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = d - now;
  const abs = Math.abs(diff);
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  const sign = diff < 0 ? "ago" : "from now";
  if (abs < min) return diff < 0 ? "just now" : "in a moment";
  if (abs < hr) return `${Math.round(abs / min)}m ${sign}`;
  if (abs < day) return `${Math.round(abs / hr)}h ${sign}`;
  if (abs < 30 * day) return `${Math.round(abs / day)}d ${sign}`;
  return formatDate(iso);
}

const DOW: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function parseField(field: string, min: number, max: number): number[] {
  if (field === "*") {
    const arr: number[] = [];
    for (let i = min; i <= max; i++) arr.push(i);
    return arr;
  }
  const out = new Set<number>();
  for (const part of field.split(",")) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    let base = stepMatch ? stepMatch[1] : part;
    const step = stepMatch ? parseInt(stepMatch[2], 10) : 1;
    let start = min;
    let end = max;
    if (base !== "*") {
      if (base.includes("-")) {
        const [a, b] = base.split("-");
        start = parseDow(a, min);
        end = parseDow(b, max);
      } else {
        start = end = parseDow(base, min);
      }
    }
    for (let i = start; i <= end; i += step) out.add(i);
  }
  return Array.from(out).sort((a, b) => a - b);
}

function parseDow(s: string, fallback: number): number {
  const t = s.toLowerCase();
  if (t in DOW) return DOW[t];
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? fallback : n;
}

/**
 * Minimal cron parser → next fire time. Supports 5-field "m h dom mon dow".
 * Returns null if it can't determine a next run within a year.
 */
export function nextCronRun(
  expr: string,
  from: Date = new Date(),
): Date | null {
  try {
    const fields = expr.trim().split(/\s+/);
    if (fields.length !== 5) return null;
    const [mF, hF, domF, monF, dowF] = fields;
    const minutes = parseField(mF, 0, 59);
    const hours = parseField(hF, 0, 23);
    const doms = parseField(domF, 1, 31);
    const months = parseField(monF, 1, 12);
    const dows = parseField(dowF, 0, 6);

    const start = new Date(from.getTime() + 60_000);
    start.setSeconds(0, 0);
    const end = new Date(start.getTime() + 366 * 24 * 60 * 60 * 1000);

    const cur = new Date(start);
    while (cur < end) {
      const m = cur.getMonth() + 1;
      const dom = cur.getDate();
      const dow = cur.getDay();
      const h = cur.getHours();
      const mi = cur.getMinutes();
      if (
        months.includes(m) &&
        (domF === "*" || dowF === "*"
          ? doms.includes(dom) && dows.includes(dow)
          : doms.includes(dom) || dows.includes(dow)) &&
        hours.includes(h) &&
        minutes.includes(mi)
      ) {
        return new Date(cur);
      }
      cur.setMinutes(cur.getMinutes() + 1);
    }
    return null;
  } catch {
    return null;
  }
}

export function describeCron(expr: string): string {
  const f = expr.trim().split(/\s+/);
  if (f.length !== 5) return expr;
  const [m, h, dom, mon, dow] = f;
  if (m === "0" && h === "*" && dom === "*" && mon === "*" && dow === "*")
    return "Every hour";
  if (m === "*/5" && h === "*") return "Every 5 minutes";
  if (m === "*/10" && h === "*") return "Every 10 minutes";
  if (m === "*/15" && h === "*") return "Every 15 minutes";
  if (m === "*/30" && h === "*") return "Every 30 minutes";
  if (dom === "*" && mon === "*" && dow === "*") {
    if (h.startsWith("*/")) return `Every ${h.slice(2)} hours`;
    return `Daily at ${pad(h)}:${pad(m)}`;
  }
  if (dom === "*" && mon === "*") {
    return `Weekly (${dow}) at ${pad(h)}:${pad(m)}`;
  }
  return expr;
}

function pad(s: string) {
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return s;
  return n.toString().padStart(2, "0");
}
