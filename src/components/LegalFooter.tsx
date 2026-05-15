import { LICENSE_URL, SOURCE_CODE_URL } from "../config/legal";
import type { ViewMode } from "../types";

type LegalFooterProps = {
  view: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onReopenCookies: () => void;
};

const linkClass =
  "cursor-pointer border-0 bg-transparent p-0 text-xs font-extrabold text-muted-foreground underline underline-offset-4";

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function LegalFooter({ view, onNavigate, onReopenCookies }: LegalFooterProps) {
  const onLegalPage = view === "credits" || view === "impressum" || view === "datenschutz";

  return (
    <footer className="flex flex-col items-center gap-2 px-0 py-[26px] pb-1">
      {onLegalPage ? (
        <button type="button" className={linkClass} onClick={() => onNavigate("show")}>
          Zurück
        </button>
      ) : null}
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2" aria-label="Rechtliches und Quellcode">
        <button type="button" className={linkClass} onClick={() => onNavigate("credits")}>
          Bildnachweise
        </button>
        <button type="button" className={linkClass} onClick={() => onNavigate("impressum")}>
          Impressum
        </button>
        <button type="button" className={linkClass} onClick={() => onNavigate("datenschutz")}>
          Datenschutz
        </button>
        <button type="button" className={linkClass} onClick={onReopenCookies}>
          Cookies
        </button>
        <button type="button" className={linkClass} onClick={() => openExternal(SOURCE_CODE_URL)}>
          Quellcode
        </button>
        <button type="button" className={linkClass} onClick={() => openExternal(LICENSE_URL)}>
          Lizenz (AGPL-3.0)
        </button>
      </nav>
    </footer>
  );
}
