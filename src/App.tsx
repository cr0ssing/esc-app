import { ArrowUpDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import rawSongs from "./data/songs.json";
import { createPointsOrder, getRankedSongs, placeSongByPoints } from "./lib/ranking";
import { loadVoteState, saveVoteState } from "./lib/storage";
import { cn } from "./lib/cn";
import { controlButtonBase, controlButtonIdle } from "./lib/ui";
import { RankedList } from "./components/RankedList";
import { SongCard } from "./components/SongCard";
import { ViewTabs } from "./components/ViewTabs";
import type { Song, ViewMode, VoteState } from "./types";

const songs = rawSongs as Song[];

export function App() {
  const [view, setView] = useState<ViewMode>("show");
  const [state, setState] = useState<VoteState>(() => loadVoteState(songs));
  const rankedSongs = useMemo(() => getRankedSongs(songs, state), [state]);

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
          <div className="grid gap-2">
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
          </div>
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
          {view === "ranking" ? (
            <button
              type="button"
              className={cn(controlButtonBase, controlButtonIdle, "min-h-[42px] min-w-[42px] shrink-0 p-0")}
              aria-label="Nach Punkten sortieren"
              onClick={() => patchState({ manualRankOrder: createPointsOrder(songs, state.pointsBySongId) })}
            >
              <ArrowUpDown size={18} aria-hidden="true" />
            </button>
          ) : null}
          <div className="min-w-16 border border-border-accent bg-raised px-2.5 py-2 text-center text-[0.85rem] font-extrabold text-foreground-subtle">
            {Object.values(state.pointsBySongId).filter((points) => points !== null).length}/25
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">{contentForView()}</AnimatePresence>

      <footer className="flex justify-center px-0 py-[26px] pb-1">
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent text-xs font-extrabold text-muted-foreground underline underline-offset-4"
          onClick={() => setView(view === "credits" ? "show" : "credits")}
        >
          {view === "credits" ? "Zurück" : "Bildnachweise"}
        </button>
      </footer>

      <ViewTabs value={view === "credits" ? "show" : view} onChange={setView} />
    </main>
  );
}
