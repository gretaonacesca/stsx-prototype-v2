import type { ReactNode } from "react";
import { C, PRINT } from "../colorTokens";

export function StatusPill({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "danger" | "accent" | "muted";
  children: ReactNode;
}) {
  const styles =
    tone === "ok"
      ? { color: C.primary, background: `${C.primary}2E`, border: `1.5px solid ${C.primary}AA` }
      : tone === "warn"
      ? { color: C.warning, background: `${C.warning}33`, border: `1.5px solid ${C.warning}BB` }
      : tone === "danger"
      ? { color: C.danger, background: `${C.danger}2E`, border: `1.5px solid ${C.danger}AA` }
      : tone === "accent"
      ? { color: C.accent, background: `${C.accent}22`, border: `1.5px solid ${C.accent}88` }
      : { color: C.textMuted, background: C.surfaceAlt, border: `1.5px solid ${C.border}` };
  return (
    <span
      className="px-1.5 py-0.5 rounded"
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        fontWeight: 400,
        letterSpacing: "0.04em",
        ...styles,
      }}
    >
      {children}
    </span>
  );
}

export function loadStatusTone(status: string): "ok" | "warn" | "danger" | "accent" | "muted" {
  switch (status) {
    case "Arriving":
    case "Delivered":
      return "ok";
    case "Loading":
    case "On hold":
      return "warn";
    case "Staging":
    case "In transit":
      return "accent";
    default:
      return "muted";
  }
}

export function queueStatusTone(status: string): "ok" | "warn" | "danger" | "accent" {
  if (status === "Failed") return "danger";
  if (status === "Running") return "ok";
  return "accent";
}

export function PanelHeader({
  title,
  accent,
  print,
  onClick,
}: {
  title: string;
  accent: string;
  print?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      data-panel-header
      className="flex-none flex items-center px-4 py-2.5"
      style={{
        background: print ? (PRINT.surface) : accent,
        borderBottom: print ? `1px solid ${PRINT.border}` : "none",
        minHeight: 36,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        cursor: onClick ? "pointer" : undefined,
      }}
      onClick={onClick}
    >
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 15,
          fontWeight: 400,
          color: print ? accent : "#FFFFFF",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
    </div>
  );
}
