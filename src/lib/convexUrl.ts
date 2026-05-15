declare global {
  interface Window {
    __ESC_RUNTIME__?: {
      convexUrl?: string;
    };
  }
}

export function getConvexUrl(): string {
  const runtimeUrl = window.__ESC_RUNTIME__?.convexUrl;
  if (runtimeUrl) {
    return runtimeUrl;
  }

  const viteUrl = import.meta.env.VITE_CONVEX_URL;
  if (viteUrl) {
    return viteUrl;
  }

  throw new Error(
    "Convex URL is not configured. Set CONVEX_URL at container runtime or VITE_CONVEX_URL in .env.local.",
  );
}
