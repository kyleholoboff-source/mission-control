import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { MemoryClient } from "./MemoryClient";
import type { VaultGraph } from "@/lib/vault-graph";

export const dynamic = "force-static";

function loadGraph(): VaultGraph | null {
  const path = join(process.cwd(), "public", "vault-graph.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as VaultGraph;
  } catch {
    return null;
  }
}

export default function MemoryPage() {
  const graph = loadGraph();
  return <MemoryClient graph={graph} />;
}
