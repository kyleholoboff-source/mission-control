import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0b",
          subtle: "#0f0f11",
          panel: "#141417",
          elev: "#191920",
        },
        border: {
          DEFAULT: "#23232a",
          subtle: "#1c1c22",
          strong: "#2e2e36",
        },
        fg: {
          DEFAULT: "#e8e8ea",
          muted: "#a0a0a8",
          subtle: "#6e6e78",
          dim: "#494951",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#7c7ff2",
          subtle: "#1e1f3a",
        },
        priority: {
          urgent: "#f43f5e",
          high: "#fb923c",
          medium: "#facc15",
          low: "#94a3b8",
        },
        status: {
          active: "#10b981",
          paused: "#f59e0b",
          error: "#ef4444",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 0 0 1px rgba(255,255,255,0.02)",
        elev:
          "0 8px 24px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
