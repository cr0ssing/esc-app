import { ArrowUpDown, GripVertical, LogOut, Share2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useMemo, useReducer, useState } from "react";
import { getCookieConsent } from "./lib/cookieConsent";
import rawSongs from "./data/songs.json";
import { useVoteSync } from "./hooks/useVoteSync";
import { useWatchpartySession } from "./hooks/useWatchpartySession";
import { createPointsOrder, getRankedSongs, placeSongByPoints } from "./lib/ranking";
import { buildInviteUrl, getPartyCodeFromUrl } from "./lib/invite";
import { loadVoteState, saveVoteState } from "./lib/storage";
import { cn } from "./lib/cn";
import { controlButtonActive, controlButtonBase, controlButtonIdle, headerControlButtonClass, headerMetricClass } from "./lib/ui";
import { RankedList } from "./components/RankedList";
import { SongCard } from "./components/SongCard";
import { ViewTabs } from "./components/ViewTabs";
import { WatchpartyTab } from "./components/WatchpartyTab";
import { CookieBanner } from "./components/CookieBanner";
import { DatenschutzView } from "./components/DatenschutzView";
import { ImpressumView } from "./components/ImpressumView";
import { LegalFooter } from "./components/LegalFooter";
import { InviteLinkOverlay, LeaveWatchpartyOverlay, ReorderByPointsOverlay } from "./components/WatchpartyOverlay";
import type { Song, ViewMode, VoteState } from "./types";

const songs = rawSongs as Song[];

type WatchpartyChromeState = {
  showInviteOverlay: boolean;
  showLeaveConfirm: boolean;
  isLeavingWatchparty: boolean;
};

type WatchpartyChromeAction =
  | { type: "openInvite" }
  | { type: "openLeaveConfirm" }
  | { type: "closeOverlays" }
  | { type: "startLeaving" }
  | { type: "finishLeaving" }
  | { type: "resetAfterInactive" };

const initialWatchpartyChrome: WatchpartyChromeState = {
  showInviteOverlay: false,
  showLeaveConfirm: false,
  isLeavingWatchparty: false,
};

function watchpartyChromeReducer(
  state: WatchpartyChromeState,
  action: WatchpartyChromeAction,
): WatchpartyChromeState {
  switch (action.type) {
    case "openInvite":
      return { ...state, showInviteOverlay: true };
    case "openLeaveConfirm":
      return { showInviteOverlay: false, showLeaveConfirm: true, isLeavingWatchparty: false };
    case "closeOverlays":
      return initialWatchpartyChrome;
    case "startLeaving":
      return { ...state, isLeavingWatchparty: true };
    case "finishLeaving":
      return initialWatchpartyChrome;
    case "resetAfterInactive":
      return { ...state, showLeaveConfirm: false, isLeavingWatchparty: false };
    default:
      return state;
  }
}

export function App() {
  const [explicitView, setExplicitView] = useState<ViewMode | null>(null);
  const [state, setState] = useState<VoteState>(() => loadVoteState(songs));
  const [watchpartyChrome, dispatchWatchpartyChrome] = useReducer(
    watchpartyChromeReducer,
    initialWatchpartyChrome,
  );
  const [showReorderConfirm, setShowReorderConfirm] = useState(false);
  const [rankingDragEnabled, setRankingDragEnabled] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(() => getCookieConsent() === null);
  const initialPartyCode = useMemo(() => getPartyCodeFromUrl(), []);

  const {
    sessionToken,
    session,
    isActive,
    isLoading,
    createWatchparty,
    joinWatchparty,
    leaveWatchparty,
    persistSession,
  } = useWatchpartySession();

  const defaultView: ViewMode =
    initialPartyCode && !isActive && !isLoading ? "watchparty" : "show";
  const view = explicitView ?? defaultView;
  const setView = setExplicitView;

  useEffect(() => {
    if (!isActive) {
      dispatchWatchpartyChrome({ type: "resetAfterInactive" });
    }
  }, [isActive]);

  useVoteSync({ sessionToken, isActive, state, setState });

  const rankedSongs = useMemo(() => getRankedSongs(songs, state), [state]);
  const inviteUrl = session ? buildInviteUrl(session.inviteCode) : null;

  useEffect(() => {
    saveVoteState(state);
  }, [state]);

  function patchState(patch: Partial<VoteState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function setSongPoints(songId: string, points: number | null) {
    setState((current) => {
      const pointsBySongId = { ...current.pointsBySongId, [songId]: points };
      return {
        ...current,
        pointsBySongId,
        manualRankOrder: placeSongByPoints(current.manualRankOrder, songId, pointsBySongId),
      };
    });
  }

  async function handleCreateWatchparty(args: { displayName: string; initialVoteState: VoteState }) {
    return await createWatchparty({
      sessionToken: sessionToken ?? undefined,
      displayName: args.displayName,
      initialVoteState: args.initialVoteState,
    });
  }

  async function handleJoinWatchparty(args: {
    inviteInput: string;
    displayName: string;
    initialVoteState: VoteState;
  }) {
    return await joinWatchparty({
      sessionToken: sessionToken ?? undefined,
      inviteInput: args.inviteInput,
      displayName: args.displayName,
      initialVoteState: args.initialVoteState,
    });
  }

  function openDatenschutz() {
    setExplicitView("datenschutz");
  }

  function contentForView() {
    if (view === "impressum") {
      return <ImpressumView key="impressum" />;
    }

    if (view === "datenschutz") {
      return <DatenschutzView key="datenschutz" />;
    }

    if (view === "credits") {
      return (
        <m.section
          key="credits"
          aria-label="Bildnachweise"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="my-3 mb-4">
            <p className="m-0 mb-1 text-xs font-extrabold uppercase text-muted-foreground">Credits</p>
            <h2 className="m-0 text-[1.7rem] font-semibold text-foreground">Bildnachweise</h2>
          </div>
          <m.div className="grid gap-2">
            {songs.map((song) => (
              <a
                key={song.id}
                href={song.participantUrl}
                target="_blank"
                rel="noreferrer"
                className="grid grid-cols-[96px_1fr] gap-x-2.5 gap-y-0.5 border border-border bg-card p-2.5 text-inherit no-underline min-[680px]:grid-cols-[150px_1fr]"
              >
                <span className="row-span-2 text-[0.76rem] font-extrabold uppercase text-muted-foreground">{song.countryDe}</span>
                <strong className="text-[0.9rem] text-foreground">{song.artist}</strong>
                <small className="text-xs text-secondary-foreground">{song.imageCredit ?? "Eurovision Song Contest"}</small>
              </a>
            ))}
          </m.div>
        </m.section>
      );
    }

    if (view === "ranking") {
      return (
        <m.section
          key="ranking"
          aria-label="Ranking"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <RankedList
            songs={rankedSongs}
            state={state}
            dragEnabled={rankingDragEnabled}
            onPatch={patchState}
            onPointsChange={setSongPoints}
            onReorder={(ids) => patchState({ manualRankOrder: ids })}
          />
        </m.section>
      );
    }

    if (view === "watchparty") {
      return (
        <m.section
          key="watchparty"
          aria-label="Watchparty"
          className={!isActive ? "flex min-h-0 flex-1 flex-col *:min-h-0 *:flex-1" : undefined}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <WatchpartyTab
            songs={songs}
            voteState={state}
            sessionToken={sessionToken}
            session={session}
            isActive={isActive}
            isLoading={isLoading}
            initialPartyCode={initialPartyCode}
            onPersistSession={persistSession}
            onCreate={handleCreateWatchparty}
            onJoin={handleJoinWatchparty}
          />
        </m.section>
      );
    }

    return (
      <m.section
        key="show"
        className="grid gap-3"
        aria-label="Show-Reihenfolge"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            points={state.pointsBySongId[song.id] ?? null}
            note={state.notesBySongId[song.id] ?? ""}
            isWinnerPrediction={state.winnerPredictionId === song.id}
            isPersonalPick={state.personalPickId === song.id}
            onPointsChange={(points) => setSongPoints(song.id, points)}
            onNoteChange={(note) => patchState({ notesBySongId: { ...state.notesBySongId, [song.id]: note } })}
            onWinnerPredictionChange={() => patchState({ winnerPredictionId: state.winnerPredictionId === song.id ? null : song.id })}
            onPersonalPickChange={() => patchState({ personalPickId: state.personalPickId === song.id ? null : song.id })}
          />
        ))}
      </m.section>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[820px] flex-col px-3 pb-[calc(104px+var(--pwa-tab-bar-extra-bottom))] pt-[calc(var(--pwa-main-padding-top-base)+env(safe-area-inset-top,0))] min-[680px]:px-[18px]">
      <header className="flex items-end justify-between gap-[18px] px-0.5 pb-[18px] pt-3">
        <div>
          <p className="m-0 mb-1 text-[0.76rem] font-bold tracking-[0.08em] uppercase text-muted-foreground">Vienna · 16.05.2026</p>
          <h1 className="m-0 text-[clamp(2rem,10vw,4.8rem)] leading-[0.9] font-semibold text-foreground">ESC 2026</h1>
        </div>
        <div className="flex items-stretch gap-2">
          {view === "watchparty" && isActive && inviteUrl ? (
            <>
              <button
                type="button"
                className={cn(controlButtonBase, controlButtonIdle, headerControlButtonClass)}
                aria-label="Einladungslink teilen"
                onClick={() => dispatchWatchpartyChrome({ type: "openInvite" })}
              >
                <Share2 size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cn(controlButtonBase, controlButtonIdle, headerControlButtonClass)}
                aria-label="Watchparty verlassen"
                onClick={() => dispatchWatchpartyChrome({ type: "openLeaveConfirm" })}
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </>
          ) : null}
          {view === "ranking" ? (
            <>
              <button
                type="button"
                className={cn(
                  controlButtonBase,
                  rankingDragEnabled ? controlButtonActive : controlButtonIdle,
                  headerControlButtonClass,
                )}
                aria-label={rankingDragEnabled ? "Verschieben deaktivieren" : "Verschieben aktivieren"}
                aria-pressed={rankingDragEnabled}
                onClick={() => setRankingDragEnabled((enabled) => !enabled)}
              >
                <GripVertical size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cn(controlButtonBase, controlButtonIdle, headerControlButtonClass)}
                aria-label="Nach Punkten sortieren"
                onClick={() => setShowReorderConfirm(true)}
              >
                <ArrowUpDown size={18} aria-hidden="true" />
              </button>
            </>
          ) : null}
          {view === "show" ? (
            <div className={headerMetricClass}>
              {Object.values(state.pointsBySongId).filter((points) => points !== null).length}/25
            </div>
          ) : null}
        </div>
      </header>

      <div className={cn("min-h-0", view === "watchparty" && !isActive && "flex flex-1 flex-col")}>
        <AnimatePresence mode="wait">{contentForView()}</AnimatePresence>
      </div>

      <LegalFooter
        view={view}
        onNavigate={setView}
        onReopenCookies={() => setShowCookieBanner(true)}
      />

      <ViewTabs
        value={view === "credits" || view === "impressum" || view === "datenschutz" ? "show" : view}
        onChange={setView}
      />

      <CookieBanner
        visible={showCookieBanner}
        onClose={() => setShowCookieBanner(false)}
        onOpenDatenschutz={openDatenschutz}
      />

      {watchpartyChrome.showInviteOverlay && inviteUrl ? (
        <InviteLinkOverlay
          inviteUrl={inviteUrl}
          onClose={() => dispatchWatchpartyChrome({ type: "closeOverlays" })}
        />
      ) : null}

      {watchpartyChrome.showLeaveConfirm ? (
        <LeaveWatchpartyOverlay
          isLeaving={watchpartyChrome.isLeavingWatchparty}
          onClose={() => {
            if (!watchpartyChrome.isLeavingWatchparty) {
              dispatchWatchpartyChrome({ type: "closeOverlays" });
            }
          }}
          onConfirm={() => {
            dispatchWatchpartyChrome({ type: "startLeaving" });
            void leaveWatchparty().finally(() => {
              dispatchWatchpartyChrome({ type: "finishLeaving" });
            });
          }}
        />
      ) : null}

      {showReorderConfirm ? (
        <ReorderByPointsOverlay
          onClose={() => setShowReorderConfirm(false)}
          onConfirm={() => {
            patchState({ manualRankOrder: createPointsOrder(songs, state.pointsBySongId) });
            setShowReorderConfirm(false);
          }}
        />
      ) : null}
    </main>
  );
}
