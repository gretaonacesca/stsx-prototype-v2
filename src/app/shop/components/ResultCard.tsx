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
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
      }}
    >
      <p
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 400,
          fontSize: 16,
          color: C.text,
        }}
      >
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

export function ResultField({ label, value }: { label: string; value: string }) {
  return <ShopReadonly label={label} value={value} />;
}
