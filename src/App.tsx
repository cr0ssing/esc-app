import { ArrowUpDown, LogOut, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import rawSongs from "./data/songs.json";
import { useVoteSync } from "./hooks/useVoteSync";
import { useWatchpartySession } from "./hooks/useWatchpartySession";
import { createPointsOrder, getRankedSongs, placeSongByPoints } from "./lib/ranking";
import { buildInviteUrl, getPartyCodeFromUrl } from "./lib/invite";
import { loadVoteState, saveVoteState } from "./lib/storage";
import { cn } from "./lib/cn";
import { controlButtonBase, controlButtonIdle, headerControlButtonClass, headerMetricClass } from "./lib/ui";
import { RankedList } from "./components/RankedList";
import { SongCard } from "./components/SongCard";
import { ViewTabs } from "./components/ViewTabs";
import { WatchpartyTab } from "./components/WatchpartyTab";
import { InviteLinkOverlay } from "./components/WatchpartyOverlay";
import type { Song, ViewMode, VoteState } from "./types";

const songs = rawSongs as Song[];

export function App() {
  const [view, setView] = useState<ViewMode>("show");
  const [state, setState] = useState<VoteState>(() => loadVoteState(songs));
  const [showInviteOverlay, setShowInviteOverlay] = useState(false);
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

  useEffect(() => {
    if (initialPartyCode && !isActive && !isLoading) {
      setView("watchparty");
    }
  }, [initialPartyCode, isActive, isLoading]);

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

  function contentForView() {
    if (view === "credits") {
      return (
        <motion.section
          key="credits"
          aria-label="Bildnachweise"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="my-3 mb-4">
            <p className="m-0 mb-1 text-xs font-extrabold uppercase text-muted-foreground">Credits</p>
            <h2 className="m-0 text-[1.7rem] font-extrabold text-foreground">Bildnachweise</h2>
          </div>
          <motion.div className="grid gap-2">
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
          </motion.div>
        </motion.section>
      );
    }

    if (view === "ranking") {
      return (
        <motion.section
          key="ranking"
          aria-label="Ranking"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <RankedList songs={rankedSongs} state={state} onPatch={patchState} onPointsChange={setSongPoints} onReorder={(ids) => patchState({ manualRankOrder: ids })} />
        </motion.section>
      );
    }

    if (view === "watchparty") {
      return (
        <motion.section
          key="watchparty"
          aria-label="Watchparty"
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
        </motion.section>
      );
    }

    return (
      <motion.section
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
      </motion.section>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[820px] px-3 pb-[104px] pt-[18px] min-[680px]:px-[18px]">
      <header className="flex items-end justify-between gap-[18px] px-0.5 pb-[18px] pt-3">
        <div>
          <p className="m-0 mb-1 text-[0.76rem] font-bold tracking-[0.08em] uppercase text-muted-foreground">Vienna · 16.05.2026</p>
          <h1 className="m-0 text-[clamp(2rem,10vw,4.8rem)] leading-[0.9] font-extrabold text-foreground">ESC 2026</h1>
        </div>
        <div className="flex items-stretch gap-2">
          {view === "watchparty" && isActive && inviteUrl ? (
            <>
              <button
                type="button"
                className={cn(controlButtonBase, controlButtonIdle, headerControlButtonClass)}
                aria-label="Einladungslink teilen"
                onClick={() => setShowInviteOverlay(true)}
              >
                <Share2 size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cn(controlButtonBase, controlButtonIdle, headerControlButtonClass)}
                aria-label="Watchparty verlassen"
                onClick={() => {
                  setShowInviteOverlay(false);
                  void leaveWatchparty();
                }}
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </>
          ) : null}
          {view === "ranking" ? (
            <button
              type="button"
              className={cn(controlButtonBase, controlButtonIdle, headerControlButtonClass)}
              aria-label="Nach Punkten sortieren"
              onClick={() => patchState({ manualRankOrder: createPointsOrder(songs, state.pointsBySongId) })}
            >
              <ArrowUpDown size={18} aria-hidden="true" />
            </button>
          ) : null}
          {view !== "watchparty" ? (
            <div className={headerMetricClass}>
              {Object.values(state.pointsBySongId).filter((points) => points !== null).length}/25
            </div>
          ) : null}
        </div>
      </header>

      <AnimatePresence mode="wait">{contentForView()}</AnimatePresence>

      {view === "watchparty" && !isActive ? null : (
        <footer className="flex justify-center px-0 py-[26px] pb-1">
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent text-xs font-extrabold text-muted-foreground underline underline-offset-4"
            onClick={() => setView(view === "credits" ? "show" : "credits")}
          >
            {view === "credits" ? "Zurück" : "Bildnachweise"}
          </button>
        </footer>
      )}

      <ViewTabs value={view === "credits" ? "show" : view} onChange={setView} />

      {showInviteOverlay && inviteUrl ? (
        <InviteLinkOverlay inviteUrl={inviteUrl} onClose={() => setShowInviteOverlay(false)} />
      ) : null}
    </main>
  );
}
