import { useState, useEffect, useRef } from "react";
import type { FormEvent, CSSProperties } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  imageToAsciiFrame,
  renderFrameToCanvas,
  DEFAULT_OPTIONS,
} from "asciify-engine";
import type { AsciiFrame, AsciiOptions, AsciiCell } from "asciify-engine";
import logoUrl from "../assets/stsx-logo.png";
import type { ColorTokens } from "./colorTokens";
import { InlineAlert } from "./feedback/InlineAlert";
import { delay } from "./feedback/normalizeError";

export type LoginCredentials = { username: string; password: string };
export type LoginErrorKind = "invalid" | "license";

/** Reveal in → hold → dissolve out → pause, looping. */
const PHASE = {
  revealMs: 2200,
  holdMs: 2800,
  dissolveMs: 1400,
  pauseMs: 600,
} as const;

const CYCLE_MS =
  PHASE.revealMs + PHASE.holdMs + PHASE.dissolveMs + PHASE.pauseMs;

/** Matrix cascade speed (ms per glyph step). Higher = slower rain. */
const MATRIX_CASCADE_MS = 360;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function cloneFrame(frame: AsciiFrame): AsciiFrame {
  return frame.map((row) => row.map((cell) => ({ ...cell })));
}

type ScanPhase = "reveal" | "hold" | "dissolve" | "pause";

type ScanState = {
  phase: ScanPhase;
  /** 0–1 progress within the active scan (reveal or dissolve). */
  progress: number;
};

const MATRIX_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>*+-=:.|/\\#_@%!?";

function matrixGlyph(col: number, row: number, timeMs: number): string {
  const fall = Math.floor(timeMs / MATRIX_CASCADE_MS + row * 0.55);
  const flicker = Math.floor(timeMs / (MATRIX_CASCADE_MS * 1.4));
  const idx =
    ((col * 131 + row * 17 + fall * 7 + flicker * 3) % MATRIX_CHARS.length + MATRIX_CHARS.length) %
    MATRIX_CHARS.length;
  return MATRIX_CHARS[idx]!;
}

/** Top→bottom barcode wipe + matrix scramble inside the logo shape. */
function applyScan(source: AsciiFrame, state: ScanState, timeMs: number): AsciiFrame {
  const rows = source.length;
  const cols = source[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return source;
  if (state.phase === "pause") return emptyLike(source);

  const out = cloneFrame(source);
  const edge = state.progress * rows;
  const feather = 1.8;

  for (let r = 0; r < rows; r++) {
    let visible = true;
    let edgeFade = 1;

    if (state.phase === "reveal") {
      visible = r < edge;
      if (r >= edge - feather && r < edge) edgeFade = (edge - r) / feather;
    } else if (state.phase === "dissolve") {
      visible = r >= edge;
      if (r >= edge && r < edge + feather) edgeFade = (r - edge) / feather;
    }

    for (let c = 0; c < cols; c++) {
      const cell = out[r][c];
      if (!visible) {
        cell.char = " ";
        cell.a = 0;
        continue;
      }

      if (cell.a >= 10 && cell.char !== " ") {
        cell.char = matrixGlyph(c, r, timeMs);
        const pulse =
          0.72 +
          0.28 * Math.sin((timeMs / (MATRIX_CASCADE_MS * 2.5) + c * 0.4 + r * 0.15) * Math.PI);
        cell.a = Math.round(Math.min(255, cell.a * pulse * edgeFade));
      } else if (edgeFade < 1) {
        cell.a = Math.round(cell.a * edgeFade);
      }
    }
  }
  return out;
}

function scanStateForTime(t: number): ScanState {
  const x = t % CYCLE_MS;
  if (x < PHASE.revealMs) return { phase: "reveal", progress: x / PHASE.revealMs };
  if (x < PHASE.revealMs + PHASE.holdMs) return { phase: "hold", progress: 1 };
  if (x < PHASE.revealMs + PHASE.holdMs + PHASE.dissolveMs) {
    const d = x - PHASE.revealMs - PHASE.holdMs;
    return { phase: "dissolve", progress: d / PHASE.dissolveMs };
  }
  return { phase: "pause", progress: 1 };
}

function emptyLike(source: AsciiFrame): AsciiFrame {
  return source.map((row) =>
    row.map(
      (cell): AsciiCell => ({
        ...cell,
        char: " ",
        a: 0,
      })
    )
  );
}

function drawScanBar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: ScanState,
  accent: string
) {
  if (state.phase !== "reveal" && state.phase !== "dissolve") return;
  const y = state.progress * h;
  const grad = ctx.createLinearGradient(0, y - 10, 0, y + 10);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.45, accent + "66");
  grad.addColorStop(0.5, accent);
  grad.addColorStop(0.55, accent + "66");
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, y - 10, w, 20);
}

function AsciiLogoField({
  bg,
  scanColor,
  onLogoError,
}: {
  bg: string;
  scanColor: string;
  onLogoError?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<AsciiFrame | null>(null);
  const optsRef = useRef<AsciiOptions | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const reducedRef = useRef(false);
  const startRef = useRef(0);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let raf = 0;
    let ro: ResizeObserver | null = null;

    const optsBase: AsciiOptions = {
      ...DEFAULT_OPTIONS,
      fontSize: 6,
      // Must stay > 0 — engine multiplies fontSize by charSpacing for cell size
      charSpacing: 1,
      colorMode: "fullcolor",
      animationStyle: "none",
      invert: false,
      normalize: true,
      charset: DEFAULT_OPTIONS.charset,
      chromaKey: "#FFFFFF",
      chromaKeyTolerance: 40,
    };
    optsRef.current = optsBase;

    const paint = (state: ScanState, timeMs: number) => {
      const canvas = canvasRef.current;
      const source = sourceRef.current;
      const opts = optsRef.current;
      if (!canvas || !source || !opts || source.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const frame = applyScan(source, state, timeMs);
      renderFrameToCanvas(ctx, frame, opts, w, h, timeMs / 1000);
      drawScanBar(ctx, w, h, state, scanColor);
    };

    const rebuild = () => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!wrap || !canvas || !img) return;

      const w = Math.max(2, Math.floor(wrap.clientWidth));
      const h = Math.max(2, Math.floor(wrap.clientHeight));
      if (w < 2 || h < 2) return;

      canvas.width = w;
      canvas.height = h;

      const fontSize = w < 420 ? 3 : w < 700 ? 4 : 5;
      const opts: AsciiOptions = { ...optsBase, fontSize };
      optsRef.current = opts;

      const { frame, cols, rows } = imageToAsciiFrame(img, opts, w, h);
      if (cols === 0 || rows === 0 || frame.length === 0) {
        console.warn("[AsciiLogoField] empty ASCII frame", { w, h, fontSize });
        return;
      }
      sourceRef.current = frame;

      if (reducedRef.current) paint({ phase: "hold", progress: 1 }, 0);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      paint(scanStateForTime(elapsed), elapsed);
      raf = requestAnimationFrame(tick);
    };

    loadImage(logoUrl)
      .then((img) => {
        if (cancelled) return;
        imgRef.current = img;
        rebuild();
        if (wrapRef.current) {
          ro = new ResizeObserver(() => rebuild());
          ro.observe(wrapRef.current);
        }
        if (!reducedRef.current) {
          startRef.current = 0;
          raf = requestAnimationFrame(tick);
        } else {
          paint({ phase: "hold", progress: 1 }, 0);
        }
      })
      .catch((err) => {
        console.error("[AsciiLogoField]", err);
        onLogoError?.();
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [bg, scanColor]);

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: bg }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export function LoginPage({
  C,
  onLogin,
}: {
  C: ColorTokens;
  onLogin: (creds: LoginCredentials) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<LoginErrorKind | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError("invalid");
      return;
    }
    setBusy(true);
    try {
      await onLogin({ username: username.trim(), password });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "LICENSE_EXHAUSTED") setError("license");
      else setError("invalid");
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    height: 44,
    padding: "0 14px",
    fontFamily: "'Lato', sans-serif",
    fontSize: 17,
    fontWeight: 400,
    color: C.text,
    background: C.surface,
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
  };

  if (error === "license") {
    return (
      <div
        className="h-screen w-full flex items-center justify-center px-6"
        style={{ background: C.bg }}
      >
        <div className="w-full max-w-md flex flex-col gap-4 text-center">
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 24, color: C.text }}>
            All license seats in use
          </p>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.textMuted, lineHeight: 1.6 }}>
            8 of 8 concurrent seats are logged on. Ask an administrator to free a seat, or try again later.
          </p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="self-center px-4 py-2 rounded-md"
            style={{
              background: C.accent,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
            }}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full flex flex-col lg:flex-row"
      style={{
        background: `
          radial-gradient(ellipse 60% 50% at 75% 40%, ${C.accent}40 0%, transparent 55%),
          linear-gradient(165deg, ${C.bg} 0%, ${C.surfaceAlt} 100%)
        `,
      }}
    >
      <div
        className="relative w-full lg:w-1/2 h-[42vh] lg:h-full shrink-0"
        style={{ borderBottom: `1.5px solid ${C.border}` }}
      >
        <div
          className="hidden lg:block absolute inset-y-0 right-0 w-px pointer-events-none z-10"
          style={{ background: C.border }}
        />
        <AsciiLogoField bg={C.bg} scanColor={C.primary} onLogoError={() => setLogoFailed(true)} />
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center px-6 py-10">
        <form
          onSubmit={submit}
          className="w-full flex flex-col items-center gap-8"
          style={{ maxWidth: 340 }}
        >
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: 33,
              letterSpacing: "0.18em",
              color: C.text,
              lineHeight: 1,
            }}
          >
            STSX
          </span>

          <div className="w-full flex flex-col gap-3">
            <input
              type="text"
              name="username"
              placeholder="User Name"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={busy}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = C.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
              }}
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                }}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{
                  color: C.textMuted,
                  cursor: "pointer",
                  lineHeight: 0,
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {logoFailed && (
            <InlineAlert variant="warning" title="Logo animation unavailable">
              Using static branding. Sign-in still works normally.
            </InlineAlert>
          )}

          {error === "invalid" && (
            <InlineAlert variant="error" title="Sign-in failed">
              Invalid username or password. Try again or contact your administrator.
            </InlineAlert>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full login-submit"
            style={{
              height: 46,
              borderRadius: 8,
              border: "none",
              cursor: busy ? "wait" : "pointer",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: 18,
              letterSpacing: "0.04em",
              color: "#FFFFFF",
              background: C.accent,
              boxShadow: `0 4px 14px ${C.accent}28`,
              transition: "box-shadow 180ms ease, transform 180ms ease",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Signing in…" : "Login"}
          </button>
          <style>{`
            .login-submit:hover {
              box-shadow: 0 10px 28px ${C.accent}44;
              transform: translateY(-1px);
            }
          `}</style>
        </form>
      </div>
    </div>
  );
}
