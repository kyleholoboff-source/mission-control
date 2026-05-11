"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FOLDER_COLOR,
  FOLDER_LABEL,
  type VaultGraph,
  type VaultNode,
} from "@/lib/vault-graph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-fg-subtle">
      Loading graph…
    </div>
  ),
});

interface MemoryClientProps {
  graph: VaultGraph | null;
}

const ALL_FOLDERS = [
  "00-meta",
  "10-daily",
  "20-projects",
  "30-people",
  "40-knowledge",
  "50-decisions",
  "60-inbox",
];

export function MemoryClient({ graph }: MemoryClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<{ centerAt?: (x: number, y: number, ms?: number) => void; zoom?: (z: number, ms?: number) => void }>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [selected, setSelected] = useState<VaultNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [enabledFolders, setEnabledFolders] = useState<Set<string>>(
    () => new Set(ALL_FOLDERS),
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      setDims({ width: e.contentRect.width, height: e.contentRect.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const filtered = useMemo(() => {
    if (!graph) return null;
    const q = search.trim().toLowerCase();
    const nodes = graph.nodes.filter((n) => {
      if (!enabledFolders.has(n.folder)) return false;
      if (!q) return true;
      return (
        n.id.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    const allow = new Set(nodes.map((n) => n.id));
    const links = graph.links.filter(
      (l) => allow.has(l.source as string) && allow.has(l.target as string),
    );
    return { nodes, links };
  }, [graph, search, enabledFolders]);

  const focusNode = useCallback((node: VaultNode & { x?: number; y?: number }) => {
    if (!graphRef.current) return;
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    graphRef.current.centerAt?.(x, y, 600);
    graphRef.current.zoom?.(3, 600);
  }, []);

  if (!graph) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center px-8 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-xl font-semibold text-fg">Memory graph not built yet</h1>
          <p className="text-sm text-fg-muted">
            Run <code className="rounded bg-bg-panel px-1.5 py-0.5 text-fg">npm run build:graph</code>{" "}
            from the project root to generate <code className="text-fg">public/vault-graph.json</code>.
            The script reads <code className="text-fg">~/vicbot-vault</code> by default; override with{" "}
            <code className="text-fg">VAULT_PATH</code>.
          </p>
        </div>
      </div>
    );
  }

  const obsidianUrl = (node: VaultNode) => {
    const vault = "vicbot-vault";
    const file = encodeURIComponent(node.path.replace(/\.md$/, ""));
    return `obsidian://open?vault=${vault}&file=${file}`;
  };

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-bg-subtle px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-fg">Memory</h1>
          <span className="text-2xs text-fg-subtle">
            {graph.stats.nodeCount} notes · {graph.stats.linkCount} links · indexed{" "}
            {new Date(graph.generatedAt).toLocaleString()}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, tags, summaries…"
            className="w-72 rounded-md border border-border bg-bg-panel py-1.5 pl-8 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="relative flex flex-1 min-h-0">
        <div ref={containerRef} className="relative flex-1 dotted-bg">
          {dims.width > 0 && filtered && (
            <ForceGraph2D
              ref={graphRef as never}
              width={dims.width}
              height={dims.height}
              graphData={filtered}
              backgroundColor="#0a0a0b"
              nodeRelSize={4}
              nodeVal={(raw) => {
                const n = raw as VaultNode;
                return 1 + Math.min(n.degree, 12) * 0.6;
              }}
              nodeLabel={(raw) => {
                const n = raw as VaultNode;
                return `<div style="font:500 12px Inter, sans-serif;color:#e8e8ea;background:#141417;border:1px solid #2e2e36;padding:6px 8px;border-radius:6px;max-width:280px;">
                  <div style="font-weight:600;">${escapeHtml(n.id)}</div>
                  <div style="color:#a0a0a8;font-size:11px;margin-top:2px;">${escapeHtml(FOLDER_LABEL[n.folder] || n.folder)}${n.status ? " · " + escapeHtml(n.status) : ""}</div>
                  ${n.summary ? `<div style=\"color:#a0a0a8;font-size:11px;margin-top:4px;line-height:1.4;\">${escapeHtml(n.summary)}</div>` : ""}
                </div>`;
              }}
              nodeColor={(raw) => {
                const n = raw as VaultNode;
                return hovered && hovered !== n.id ? dim(n.color) : n.color;
              }}
              linkColor={() => "rgba(255,255,255,0.08)"}
              linkWidth={(raw) => {
                const l = raw as { source: VaultNode | string; target: VaultNode | string };
                const s = typeof l.source === "string" ? l.source : l.source.id;
                const t = typeof l.target === "string" ? l.target : l.target.id;
                return hovered && (hovered === s || hovered === t) ? 1.5 : 0.6;
              }}
              linkDirectionalParticles={0}
              cooldownTicks={120}
              warmupTicks={50}
              d3VelocityDecay={0.25}
              d3AlphaDecay={0.02}
              onNodeHover={(raw) => setHovered((raw as VaultNode | null)?.id ?? null)}
              onNodeClick={(raw) => {
                const n = raw as VaultNode & { x?: number; y?: number };
                setSelected(n);
                focusNode(n);
              }}
              onBackgroundClick={() => setSelected(null)}
              nodeCanvasObjectMode={() => "after"}
              nodeCanvasObject={(raw, ctx, scale) => {
                const n = raw as VaultNode & { x?: number; y?: number };
                if (scale < 1.5 && n.degree < 5) return;
                const fontSize = Math.max(10 / scale, 3);
                ctx.font = `500 ${fontSize}px Inter, sans-serif`;
                ctx.fillStyle = "rgba(232,232,234,0.85)";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                const r = 1 + Math.min(n.degree, 12) * 0.6;
                ctx.fillText(n.id, n.x ?? 0, (n.y ?? 0) + r + 1);
              }}
            />
          )}

          <Legend
            byFolder={graph.stats.byFolder}
            enabled={enabledFolders}
            onToggle={(folder) => {
              setEnabledFolders((prev) => {
                const next = new Set(prev);
                if (next.has(folder)) next.delete(folder);
                else next.add(folder);
                return next;
              });
            }}
          />
        </div>

        {selected && (
          <NotePanel node={selected} onClose={() => setSelected(null)} obsidianUrl={obsidianUrl(selected)} />
        )}
      </div>
    </div>
  );
}

function Legend({
  byFolder,
  enabled,
  onToggle,
}: {
  byFolder: Record<string, number>;
  enabled: Set<string>;
  onToggle: (folder: string) => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 rounded-lg border border-border bg-bg-panel/90 p-3 backdrop-blur-sm">
      <div className="mb-2 text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
        Folders — click to toggle
      </div>
      <div className="flex flex-col gap-1">
        {ALL_FOLDERS.map((folder) => {
          const count = byFolder[folder] ?? 0;
          const isOn = enabled.has(folder);
          return (
            <button
              key={folder}
              onClick={() => onToggle(folder)}
              className={cn(
                "flex items-center gap-2 rounded px-1.5 py-0.5 text-left text-xs transition-opacity",
                isOn ? "text-fg" : "text-fg-subtle opacity-50",
              )}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: FOLDER_COLOR[folder] }}
              />
              <span className="flex-1">{FOLDER_LABEL[folder]}</span>
              <span className="text-2xs text-fg-subtle">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NotePanel({
  node,
  onClose,
  obsidianUrl,
}: {
  node: VaultNode;
  onClose: () => void;
  obsidianUrl: string;
}) {
  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-border bg-bg-subtle">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: node.color }}
            />
            <span className="text-2xs uppercase tracking-wider text-fg-subtle">
              {FOLDER_LABEL[node.folder] || node.folder}
            </span>
          </div>
          <h2 className="mt-1 break-words text-sm font-semibold text-fg">{node.id}</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-fg-subtle transition-colors hover:bg-bg-panel hover:text-fg"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {node.summary && (
          <div className="text-sm leading-relaxed text-fg-muted">{node.summary}</div>
        )}

        <div className="space-y-1.5 text-xs">
          <Field label="Path" value={node.path} mono />
          {node.status && <Field label="Status" value={node.status} />}
          <Field label="Type" value={node.type} />
          {node.updated && <Field label="Updated" value={node.updated} />}
          <Field label="Connections" value={`${node.degree}`} />
        </div>

        {node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {node.tags.map((t) => (
              <span
                key={t}
                className="rounded bg-bg-panel px-1.5 py-0.5 text-2xs text-fg-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-5 py-3">
        <a
          href={obsidianUrl}
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-fg transition-colors hover:border-accent hover:bg-accent/10"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in Obsidian
        </a>
      </div>
    </aside>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-2xs uppercase tracking-wider text-fg-subtle">{label}</span>
      <span className={cn("min-w-0 truncate text-right text-fg-muted", mono && "font-mono text-2xs")}>
        {value}
      </span>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dim(hex: string): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r}, ${g}, ${b}, 0.25)`;
}
