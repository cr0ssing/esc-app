/**
 * Detects “installed” / home-screen web app contexts where CSS `(display-mode: standalone)`
 * is missing or unreliable (notably some iOS WebKit builds).
 */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const { navigator } = window;
  const iosHomeScreen =
    "standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  if (iosHomeScreen) {
    return true;
  }

  const queries = ["(display-mode: standalone)", "(display-mode: fullscreen)"] as const;
  return queries.some((q) => window.matchMedia(q).matches);
}

/** Sets `data-standalone-pwa` on `<html>` so CSS can adjust layout before first paint. */
export function syncStandalonePwaAttribute(): void {
  document.documentElement.toggleAttribute("data-standalone-pwa", isStandaloneDisplayMode());
}
