import { Toaster } from "sonner";

export function AppToaster({ isDark }: { isDark?: boolean }) {
  return (
    <Toaster
      position="top-center"
      richColors
      theme={isDark ? "dark" : "light"}
    />
  );
}
