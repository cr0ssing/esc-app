import { cn } from "../lib/cn";
import { saveCookieConsent } from "../lib/cookieConsent";
import { controlButtonActive, controlButtonBase, controlButtonIdle } from "../lib/ui";

type CookieBannerProps = {
  visible: boolean;
  onClose: () => void;
  onOpenDatenschutz: () => void;
};

export function CookieBanner({ visible, onClose, onOpenDatenschutz }: CookieBannerProps) {
  if (!visible) {
    return null;
  }

  function acknowledge() {
    saveCookieConsent();
    onClose();
  }

  return (
    <div
      className="fixed inset-x-0 bottom-[58px] z-20 mx-auto w-full max-w-[820px] px-3 min-[680px]:px-[18px]"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="app-surface border border-border-strong p-4 shadow-elevated">
        <h2 id="cookie-banner-title" className="m-0 mb-2 text-base font-semibold text-foreground">
          Cookies &amp; Speicherung
        </h2>
        <p id="cookie-banner-desc" className="m-0 mb-3 text-sm leading-relaxed text-secondary-foreground">
          Wir verwenden ausschließlich technisch notwendige Speicher (localStorage für deine Wertung, ein Session-Cookie
          für die Watchparty sowie ggf. PWA-Cache). Es gibt keine Analyse- oder Marketing-Cookies. Details in der{" "}
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-foreground underline underline-offset-4"
            onClick={onOpenDatenschutz}
          >
            Datenschutzerklärung
          </button>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={cn(controlButtonBase, controlButtonActive, "min-h-10 px-4 text-sm")}
            onClick={acknowledge}
          >
            Verstanden
          </button>
          <button
            type="button"
            className={cn(controlButtonBase, controlButtonIdle, "min-h-10 px-4 text-sm")}
            onClick={onOpenDatenschutz}
          >
            Datenschutz
          </button>
        </div>
      </div>
    </div>
  );
}
