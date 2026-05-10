"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

function crumbsFor(pathname: string): { href: string; label: string }[] {
  if (pathname === "/" || pathname === "")
    return [{ href: "/", label: "Overview" }];

  const parts = pathname.split("/").filter(Boolean);
  const out: { href: string; label: string }[] = [
    { href: "/", label: "Mission Control" },
  ];
  let acc = "";
  for (const p of parts) {
    acc += `/${p}`;
    out.push({ href: acc, label: titleize(p) });
  }
  return out;
}

function titleize(s: string): string {
  if (s.startsWith("prj_")) return "Project";
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TopNav() {
  const pathname = usePathname() || "/";
  const crumbs = crumbsFor(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg/80 px-6 backdrop-blur">
      <nav className="flex items-center gap-1.5 text-sm min-w-0">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={c.href} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-fg-dim shrink-0"
                  strokeWidth={2}
                />
              )}
              {last ? (
                <span className="font-medium text-fg truncate">{c.label}</span>
              ) : (
                <Link
                  href={c.href}
                  className="text-fg-muted hover:text-fg truncate transition-colors"
                >
                  {c.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-bg-panel px-2.5 py-1.5 text-xs text-fg-subtle">
          <Search className="h-3.5 w-3.5" strokeWidth={2} />
          <span>Search</span>
          <span className="rounded border border-border-strong bg-bg-elev px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
            ⌘K
          </span>
        </div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 ring-1 ring-white/10 flex items-center justify-center text-xs font-semibold text-white">
          K
        </div>
      </div>
    </header>
  );
}
