import type { ReactNode } from "react";
import { C } from "../../colorTokens";
import { ShopReadonly } from "./ShopField";

export function ResultCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2 flex flex-col gap-0"
      style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
      }}
    >
      <p
        className="py-1"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 400,
          fontSize: 14,
          color: C.text,
        }}
      >
        {title}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

export function ResultField({ label, value }: { label: string; value: string }) {
  return <ShopReadonly label={label} value={value} />;
}
