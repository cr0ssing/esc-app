declare global {
  interface Window {
    __ESC_RUNTIME__?: {
      convexUrl?: string;
      impress?: {
        name?: string;
        address?: string;
        email?: string;
      };
    };
  }
}

export type ImpressConfig = {
  name: string;
  address: string;
  email: string;
};

function normalizeMultiline(value: string): string {
  return value.replace(/\\n/g, "\n");
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

export function getImpressConfig(): ImpressConfig | null {
  const runtime = window.__ESC_RUNTIME__?.impress;
  if (runtime?.name && runtime?.address && runtime?.email) {
    return {
      name: runtime.name,
      address: normalizeMultiline(runtime.address),
      email: runtime.email,
    };
  }

  const name = import.meta.env.VITE_IMPRESS_NAME;
  const address = import.meta.env.VITE_IMPRESS_ADDRESS;
  const email = import.meta.env.VITE_IMPRESS_EMAIL;
  if (name && address && email) {
    return {
      name,
      address: normalizeMultiline(address),
      email,
    };
  }

  return null;
}
