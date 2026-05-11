export interface VaultNode {
  id: string;
  path: string;
  folder: string;
  group: string;
  color: string;
  type: string;
  status: string | null;
  tags: string[];
  updated: string | null;
  summary: string;
  degree: number;
}

export interface VaultLink {
  source: string;
  target: string;
}

export interface VaultGraph {
  generatedAt: string;
  vault: string;
  stats: {
    nodeCount: number;
    linkCount: number;
    byFolder: Record<string, number>;
  };
  nodes: VaultNode[];
  links: VaultLink[];
}

export const FOLDER_LABEL: Record<string, string> = {
  "00-meta": "Meta",
  "10-daily": "Daily",
  "20-projects": "Projects",
  "30-people": "People",
  "40-knowledge": "Knowledge",
  "50-decisions": "Decisions",
  "60-inbox": "Inbox",
};

export const FOLDER_COLOR: Record<string, string> = {
  "00-meta": "#ef476f",
  "10-daily": "#6c757d",
  "20-projects": "#3a86ff",
  "30-people": "#06d6a0",
  "40-knowledge": "#ffd166",
  "50-decisions": "#c77dff",
  "60-inbox": "#fb5607",
};
