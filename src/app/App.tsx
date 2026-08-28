import { useEffect, useState } from "react";
import { LoginPage, type LoginCredentials } from "./LoginPage";
import { C, applyColorTokens } from "./colorTokens";
import { delay } from "./feedback";
import { Sidebar, TopBar, crumbsFor } from "./shell/chrome";
import { DashboardPage } from "./dashboard/DashboardPage";
import { OperationModal } from "./ops/OperationModal";
import { renderOperation } from "./ops/registry";
import { PdfBuilderPage, type PdfBlockKind } from "./pdf/PdfBuilderPage";
import { ShopApp } from "./shop/ShopApp";
import { findOperation, type OperationId } from "./nav/catalog";
import type { VizWidgetId } from "./dashboard/widgetCatalog";
import { AppToaster, StatusBanner, useOnlineStatus } from "./feedback";

const SHOP_BREAKPOINT = 1024;

/** Maze / tester shortcut — set to `false` to restore the ASCII login page. */
const SKIP_LOGIN_FOR_TESTING = true;

function useIsShop() {
  const [shop, setShop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < SHOP_BREAKPOINT : false
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SHOP_BREAKPOINT - 1}px)`);
    const onChange = () => setShop(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return shop;
}

type Mode = "dashboard" | "pdf";

export default function App() {
  const isShop = useIsShop();
  const online = useOnlineStatus();
  const [offlineDismissed, setOfflineDismissed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(SKIP_LOGIN_FOR_TESTING);
  const [isDark, setIsDark] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<Mode>("dashboard");
  const [activeOp, setActiveOp] = useState<OperationId | null>(null);
  const [minimizedOps, setMinimizedOps] = useState<OperationId[]>([]);
  const [pdfSeed, setPdfSeed] = useState<PdfBlockKind | null>(null);
  const [pdfKey, setPdfKey] = useState(0);

  // Apply synchronously during render so C + CSS vars match isDark before paint.
  applyColorTokens(isLoggedIn ? isDark : false);

  const setDark = (next: boolean) => {
    applyColorTokens(next);
    setIsDark(next);
  };

  const logout = () => {
    if (!SKIP_LOGIN_FOR_TESTING) setIsLoggedIn(false);
    setIsEditing(false);
    setActiveOp(null);
    setMinimizedOps([]);
    setMode("dashboard");
    setDark(false);
  };

  const openPdf = (seed?: PdfBlockKind | null) => {
    setIsEditing(false);
    setActiveOp(null);
    setMinimizedOps([]);
    setPdfSeed(seed ?? null);
    setPdfKey((k) => k + 1);
    setMode("pdf");
  };

  const handleLogin = async (creds: LoginCredentials) => {
    await delay(600);
    if (creds.username.toLowerCase() === "license") {
      const err = new Error("All license seats are in use.");
      (err as Error & { code?: string }).code = "LICENSE_EXHAUSTED";
      throw err;
    }
    if (creds.username.toLowerCase() === "bad" || !creds.password.trim()) {
      throw new Error("Invalid username or password");
    }
    setIsLoggedIn(true);
  };

  if (!SKIP_LOGIN_FOR_TESTING && !isLoggedIn) {
    return (
      <>
        <LoginPage C={C} onLogin={handleLogin} />
        <AppToaster isDark={false} />
      </>
    );
  }

  if (isShop) {
    return (
      <>
        <ShopApp isDark={isDark} onToggleDark={setDark} onLogout={logout} online={online} />
        <AppToaster isDark={isDark} />
      </>
    );
  }

  const crumbs = crumbsFor(activeOp, mode === "pdf");
  const windowTabs = minimizedOps.map((id) => ({
    id,
    label: findOperation(id)?.leaf.label ?? id,
    active: activeOp === id,
  }));

  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: C.bg }}>
        {!online && !offlineDismissed && (
          <StatusBanner
            variant="warning"
            message="You appear to be offline. Some actions are disabled until connection is restored."
            onDismiss={() => setOfflineDismissed(true)}
          />
        )}
        <TopBar
        crumbs={crumbs}
        windowTabs={windowTabs}
        onOpenTab={(id) => {
          setMode("dashboard");
          setIsEditing(false);
          setActiveOp(id);
          setMinimizedOps((prev) => prev.filter((op) => op !== id));
        }}
        onCloseTab={(id) => {
          setMinimizedOps((prev) => prev.filter((op) => op !== id));
        }}
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
        onToggleDark={setDark}
        onLogout={logout}
      />

      <div className="flex-1 min-h-0 flex">
        {mode === "dashboard" && (
          <Sidebar
            activeOp={activeOp}
            onOpenOp={(id) => {
              setIsEditing(false);
              setActiveOp(id);
              setMinimizedOps((prev) => prev.filter((op) => op !== id));
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
        <OperationModal
          opId={activeOp}
          onClose={() => setActiveOp(null)}
          onMinimize={() => {
            setMinimizedOps((prev) => (prev.includes(activeOp) ? prev : [...prev, activeOp]));
            setActiveOp(null);
          }}
        >
          {renderOperation(activeOp)}
        </OperationModal>
      )}
      </div>
      <AppToaster isDark={isDark} />
    </>
  );
}
