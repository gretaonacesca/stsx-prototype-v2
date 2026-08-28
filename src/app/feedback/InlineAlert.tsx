import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { C } from "../colorTokens";

type Variant = "error" | "warning" | "info";

const STYLES: Record<Variant, { bg: string; border: string; color: string; Icon: typeof AlertCircle }> = {
  error: { bg: C.dangerBg, border: C.danger, color: C.danger, Icon: AlertCircle },
  warning: { bg: C.warningBg, border: C.warning, color: C.warning, Icon: AlertTriangle },
  info: { bg: C.surfaceAlt, border: C.accent, color: C.text, Icon: Info },
};

export function InlineAlert({
  variant = "error",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const s = STYLES[variant];
  const Icon = s.Icon;
  return (
    <div
      role="alert"
      className="flex gap-2 rounded-lg px-3 py-2.5"
      style={{
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        color: s.color,
      }}
    >
      <Icon size={16} className="shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        {title && (
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            {title}
          </p>
        )}
        <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, lineHeight: 1.5 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
