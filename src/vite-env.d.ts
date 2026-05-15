/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_IMPRESS_NAME?: string;
  readonly VITE_IMPRESS_ADDRESS?: string;
  readonly VITE_IMPRESS_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
