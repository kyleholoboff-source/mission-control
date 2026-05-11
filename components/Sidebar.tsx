"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Calendar,
  KanbanSquare,
  LayoutGrid,
  Rocket,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: Sparkles },
  { href: "/board", label: "Task Board", icon: KanbanSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/projects", label: "Projects", icon: LayoutGrid },
  { href: "/memory", label: "Memory", icon: Brain },
] as const;

export function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-border bg-bg-subtle">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 ring-1 ring-accent/30">
          <Rocket className="h-4 w-4 text-accent" strokeWidth={2.2} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          Mission Control
        </span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="px-2 pb-2 text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
          Workspace
        </div>
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-bg-panel text-fg shadow-card"
                      : "text-fg-muted hover:bg-bg-panel/60 hover:text-fg",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active
                        ? "text-accent"
                        : "text-fg-subtle group-hover:text-fg-muted",
                    )}
                    strokeWidth={2}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 ring-1 ring-white/10 flex items-center justify-center text-xs font-semibold text-white">
            K
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-fg truncate">
              Kyle Holoboff
            </span>
            <span className="text-2xs text-fg-subtle truncate">
              Founder · Victor
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
