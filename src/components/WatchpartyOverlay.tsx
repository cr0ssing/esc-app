import { Copy, X } from "lucide-react";
import { m } from "motion/react";
import { useEffect } from "react";
import { cn } from "../lib/cn";
import { controlButtonBase, controlButtonIdle } from "../lib/ui";

type WatchpartyOverlayProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function WatchpartyOverlay({ title, onClose, children }: WatchpartyOverlayProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <m.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/55 p-3 min-[680px]:items-center"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <m.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="watchparty-overlay-title"
        className="app-surface w-full max-w-md border border-border-strong p-4 shadow-elevated min-[680px]:p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="watchparty-overlay-title" className="m-0 text-lg font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            className={cn(controlButtonBase, controlButtonIdle, "size-9 shrink-0 p-0")}
            aria-label="Schließen"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </m.div>
    </m.div>
  );
}

type InviteLinkOverlayProps = {
  inviteUrl: string;
  onClose: () => void;
};

export function InviteLinkOverlay({ inviteUrl, onClose }: InviteLinkOverlayProps) {
  async function copyToClipboard() {
    await navigator.clipboard.writeText(inviteUrl);
    onClose();
  }

  return (
    <WatchpartyOverlay title="Einladungslink" onClose={onClose}>
      <p className="m-0 mb-3 text-sm text-secondary-foreground">Teile diesen Link, damit andere deiner Watchparty beitreten können.</p>
      <input
        className="m-0 mb-3 box-border h-10 w-full border border-border bg-input/45 px-2.5 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/70"
        readOnly
        value={inviteUrl}
        aria-label="Einladungslink"
        onFocus={(event) => event.currentTarget.select()}
      />
      <button
        type="button"
        className={cn(controlButtonBase, controlButtonIdle, "w-full min-h-11")}
        onClick={() => void copyToClipboard()}
      >
        <Copy size={17} aria-hidden="true" />
        In Zwischenablage
      </button>
    </WatchpartyOverlay>
  );
}

type JoinNameOverlayProps = {
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  onJoin: () => void;
  onClose: () => void;
  isJoining: boolean;
  error: string | null;
};

export function JoinNameOverlay({
  displayName,
  onDisplayNameChange,
  onJoin,
  onClose,
  isJoining,
  error,
}: JoinNameOverlayProps) {
  const nameReady = displayName.trim().length > 0;

  return (
    <WatchpartyOverlay title="Watchparty beitreten" onClose={onClose}>
      <p className="m-0 mb-3 text-sm text-secondary-foreground">Gib deinen Namen ein, um der Watchparty beizutreten.</p>
      <label className="mb-1.5 block text-xs font-extrabold uppercase text-muted-foreground" htmlFor="join-display-name">
        Dein Name
      </label>
      <input
        id="join-display-name"
        className="m-0 mb-3 box-border h-10 w-full border border-border bg-input/45 px-2.5 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/70"
        value={displayName}
        onChange={(event) => onDisplayNameChange(event.target.value)}
        placeholder="Name eingeben"
        autoComplete="nickname"
      />
      {error ? <p className="m-0 mb-3 text-sm text-emphasis">{error}</p> : null}
      <button
        type="button"
        className={cn(controlButtonBase, controlButtonIdle, "w-full min-h-11")}
        disabled={!nameReady || isJoining}
        onClick={onJoin}
      >
        Beitreten
      </button>
    </WatchpartyOverlay>
  );
}

type JoinOverlayProps = {
  inviteInput: string;
  onInviteInputChange: (value: string) => void;
  onJoin: () => void;
  onClose: () => void;
  isJoining: boolean;
  error: string | null;
};

type LeaveWatchpartyOverlayProps = {
  onConfirm: () => void;
  onClose: () => void;
  isLeaving?: boolean;
};

type ReorderByPointsOverlayProps = {
  onConfirm: () => void;
  onClose: () => void;
};

export function ReorderByPointsOverlay({ onConfirm, onClose }: ReorderByPointsOverlayProps) {
  return (
    <WatchpartyOverlay title="Nach Punkten sortieren?" onClose={onClose}>
      <p className="m-0 mb-4 text-sm text-secondary-foreground">
        Deine manuelle Reihenfolge wird durch die Punkte ersetzt.
      </p>
      <m.div
        className="flex flex-col gap-2 min-[480px]:flex-row"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          type="button"
          className={cn(controlButtonBase, controlButtonIdle, "min-h-11 flex-1")}
          onClick={onClose}
        >
          Abbrechen
        </button>
        <button
          type="button"
          className={cn(
            controlButtonBase,
            "min-h-11 flex-1 border border-emphasis/55 bg-emphasis/12 text-emphasis",
            "hover:-translate-y-px hover:border-emphasis hover:bg-emphasis/22",
          )}
          onClick={onConfirm}
        >
          Sortieren
        </button>
      </m.div>
    </WatchpartyOverlay>
  );
}

export function LeaveWatchpartyOverlay({ onConfirm, onClose, isLeaving = false }: LeaveWatchpartyOverlayProps) {
  return (
    <WatchpartyOverlay title="Watchparty verlassen?" onClose={onClose}>
      <p className="m-0 mb-4 text-sm text-secondary-foreground">
        Du verlässt die gemeinsame Wertung. Deine Punkte bleiben lokal auf diesem Gerät gespeichert.
      </p>
      <m.div
        className="flex flex-col gap-2 min-[480px]:flex-row"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          type="button"
          className={cn(controlButtonBase, controlButtonIdle, "min-h-11 flex-1")}
          disabled={isLeaving}
          onClick={onClose}
        >
          Abbrechen
        </button>
        <button
          type="button"
          className={cn(
            controlButtonBase,
            "min-h-11 flex-1 border border-emphasis/55 bg-emphasis/12 text-emphasis",
            "hover:-translate-y-px hover:border-emphasis hover:bg-emphasis/22",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
          )}
          disabled={isLeaving}
          onClick={onConfirm}
        >
          {isLeaving ? "Wird verlassen…" : "Verlassen"}
        </button>
      </m.div>
    </WatchpartyOverlay>
  );
}

export function JoinOverlay({
  inviteInput,
  onInviteInputChange,
  onJoin,
  onClose,
  isJoining,
  error,
}: JoinOverlayProps) {
  return (
    <WatchpartyOverlay title="Watchparty beitreten" onClose={onClose}>
      <label className="mb-1.5 block text-xs font-extrabold uppercase text-muted-foreground" htmlFor="invite-input">
        Einladungslink oder Code
      </label>
      <input
        id="invite-input"
        className="m-0 mb-3 box-border h-10 w-full border border-border bg-input/45 px-2.5 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/70"
        value={inviteInput}
        onChange={(event) => onInviteInputChange(event.target.value)}
        placeholder="Link oder Code einfügen"
        autoComplete="off"
      />
      {error ? <p className="m-0 mb-3 text-sm text-emphasis">{error}</p> : null}
      <button
        type="button"
        className={cn(controlButtonBase, controlButtonIdle, "w-full min-h-11")}
        disabled={!inviteInput.trim() || isJoining}
        onClick={onJoin}
      >
        Beitreten
      </button>
    </WatchpartyOverlay>
  );
}
