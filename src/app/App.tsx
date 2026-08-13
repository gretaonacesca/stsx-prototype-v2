import { useEffect, useState } from "react";
import { LoginPage } from "./LoginPage";
import { C, applyColorTokens } from "./colorTokens";
import { Sidebar, TopBar, crumbsFor } from "./shell/chrome";
import { DashboardPage } from "./dashboard/DashboardPage";
import { OperationModal } from "./ops/OperationModal";
import { renderOperation } from "./ops/registry";
import { PdfBuilderPage, type PdfBlockKind } from "./pdf/PdfBuilderPage";
import type { OperationId } from "./nav/catalog";
import type { VizWidgetId } from "./dashboard/widgetCatalog";

type Mode = "dashboard" | "pdf";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<Mode>("dashboard");
  const [activeOp, setActiveOp] = useState<OperationId | null>(null);
  const [pdfSeed, setPdfSeed] = useState<PdfBlockKind | null>(null);
  const [pdfKey, setPdfKey] = useState(0);

  useEffect(() => {
    applyColorTokens(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const openPdf = (seed?: PdfBlockKind | null) => {
    setIsEditing(false);
    setActiveOp(null);
    setPdfSeed(seed ?? null);
    setPdfKey((k) => k + 1);
    setMode("pdf");
  };

  if (!isLoggedIn) {
    applyColorTokens(false);
    return <LoginPage C={C} onLogin={() => setIsLoggedIn(true)} />;
  }

  const crumbs = crumbsFor(activeOp, mode === "pdf");

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: C.bg }}>
      <TopBar
        crumbs={crumbs}
        isEditing={isEditing}
        isDark={isDark}
        pdfMode={mode === "pdf"}
        onToggleEdit={() => {
          setIsEditing((v) => !v);
          setActiveOp(null);
        }}
        onOpenPdf={() => openPdf(null)}
        onExitPdf={() => {
          setMode("dashboard");
          setPdfSeed(null);
        }}
        onToggleDark={() => setIsDark((v) => !v)}
        onLogout={() => {
          setIsLoggedIn(false);
          setIsEditing(false);
          setActiveOp(null);
          setMode("dashboard");
        }}
      />

      <div className="flex-1 min-h-0 flex">
        {mode === "dashboard" && (
          <Sidebar
            activeOp={activeOp}
            onOpenOp={(id) => {
              setIsEditing(false);
              setActiveOp(id);
            }}
          />
        )}

        <main
          className="flex-1 min-w-0 flex flex-col min-h-0"
          style={{
            opacity: activeOp && mode === "dashboard" ? 0.58 : 1,
            filter: activeOp && mode === "dashboard" ? "saturate(0.58)" : "none",
            transition: "opacity 180ms ease, filter 180ms ease",
          }}
        >
          {mode === "dashboard" ? (
            <DashboardPage
              isEditing={isEditing}
              onAddToPdf={(widgetId: VizWidgetId) => openPdf(widgetId)}
            />
          ) : (
            <PdfBuilderPage key={pdfKey} seedKind={pdfSeed} />
          )}
        </main>
      </div>

      {activeOp && mode === "dashboard" && (
        <OperationModal opId={activeOp} onClose={() => setActiveOp(null)}>
          {renderOperation(activeOp)}
        </OperationModal>
      )}
    </div>
  );
}
