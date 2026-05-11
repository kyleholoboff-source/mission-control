#!/usr/bin/env node
/**
 * Scan the Obsidian vault and emit public/vault-graph.json — a static snapshot
 * the /memory page renders into a force-directed graph.
 *
 * Run manually: `npm run build:graph`
 * Auto-run before `next build` via the `prebuild` script.
 *
 * Override the vault path with VAULT_PATH env var. Defaults to ~/vicbot-vault.
 */

import { readFileSync, readdirSync, writeFileSync, statSync, existsSync } from "node:fs";
import { join, relative, basename, extname } from "node:path";
import { homedir } from "node:os";

const VAULT = process.env.VAULT_PATH || join(homedir(), "vicbot-vault");
const OUT = join(process.cwd(), "public", "vault-graph.json");

const EXCLUDE_DIRS = new Set([
  ".cache",
  ".git",
  ".claude",
  ".obsidian",
  ".memory",
  "90-archive",
  "archive",
]);

const FOLDER_META = {
  "00-meta": { group: "meta", color: "#ef476f" },
  "10-daily": { group: "daily", color: "#6c757d" },
  "20-projects": { group: "projects", color: "#3a86ff" },
  "30-people": { group: "people", color: "#06d6a0" },
  "40-knowledge": { group: "knowledge", color: "#ffd166" },
  "50-decisions": { group: "decisions", color: "#c77dff" },
  "60-inbox": { group: "inbox", color: "#fb5607" },
};
const DEFAULT_META = { group: "other", color: "#8d99ae" };

const WIKILINK = /\[\[([^\]|#]+?)(?:[|#][^\]]*)?\]\]/g;
const FRONTMATTER = /^---\n([\s\S]*?)\n---/;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (st.isFile() && extname(entry) === ".md") {
      out.push(full);
    }
  }
  return out;
}

function parseFrontmatter(text) {
  const m = text.match(FRONTMATTER);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      val = val.replace(/^["']|["']$/g, "");
    }
    fm[key] = val;
  }
  return fm;
}

function summarize(text) {
  const body = text.replace(FRONTMATTER, "").trim();
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;
    if (t.startsWith(">")) continue;
    return t.slice(0, 220);
  }
  return "";
}

function topFolder(rel) {
  const parts = rel.split("/");
  return parts[0] || "other";
}

function main() {
  if (!existsSync(VAULT)) {
    console.error(`vault not found at ${VAULT}`);
    process.exit(1);
  }

  const files = walk(VAULT);
  const nodes = [];
  const idByStem = new Map();
  const idByPath = new Map();

  for (const f of files) {
    const rel = relative(VAULT, f).replace(/\\/g, "/");
    const stem = basename(f, ".md");
    if (idByStem.has(stem)) continue;
    const text = readFileSync(f, "utf8");
    const fm = parseFrontmatter(text);
    const folder = topFolder(rel);
    const meta = FOLDER_META[folder] || DEFAULT_META;
    const tags = Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : [];
    const node = {
      id: stem,
      path: rel,
      folder,
      group: meta.group,
      color: meta.color,
      type: fm.type || meta.group,
      status: fm.status || null,
      tags,
      updated: fm.updated || null,
      summary: summarize(text),
      degree: 0,
    };
    nodes.push(node);
    idByStem.set(stem, node);
    idByPath.set(rel, node);
  }

  const links = [];
  const seen = new Set();
  for (const f of files) {
    const rel = relative(VAULT, f).replace(/\\/g, "/");
    const stem = basename(f, ".md");
    const text = readFileSync(f, "utf8");
    const body = text.replace(FRONTMATTER, "");
    let m;
    WIKILINK.lastIndex = 0;
    while ((m = WIKILINK.exec(body)) !== null) {
      const target = m[1].trim();
      if (!idByStem.has(target)) continue;
      if (target === stem) continue;
      const key = `${stem}→${target}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ source: stem, target });
      idByStem.get(stem).degree += 1;
      idByStem.get(target).degree += 1;
    }
  }

  const byFolder = {};
  for (const n of nodes) {
    byFolder[n.folder] = (byFolder[n.folder] || 0) + 1;
  }

  const out = {
    generatedAt: new Date().toISOString(),
    vault: VAULT.replace(homedir(), "~"),
    stats: {
      nodeCount: nodes.length,
      linkCount: links.length,
      byFolder,
    },
    nodes,
    links,
  };

  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(
    `wrote ${relative(process.cwd(), OUT)} — ${nodes.length} nodes, ${links.length} links`,
  );
}

main();
