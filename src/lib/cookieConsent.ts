const STORAGE_KEY = "esc2026.cookieConsent.v1";
const CONSENT_VERSION = 1 as const;

export type CookieConsent = {
  version: typeof CONSENT_VERSION;
  /** User acknowledged the cookie / storage notice. */
  acknowledged: true;
  acknowledgedAt: number;
};

export function getCookieConsent(): CookieConsent | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.version !== CONSENT_VERSION || parsed.acknowledged !== true) {
      return null;
    }
    return {
      version: CONSENT_VERSION,
      acknowledged: true,
      acknowledgedAt: parsed.acknowledgedAt ?? 0,
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(): CookieConsent {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    acknowledged: true,
    acknowledgedAt: Date.now(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  return consent;
}
