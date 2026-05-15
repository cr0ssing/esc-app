import { RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import rawSongs from "./data/songs.json";
import { createPointsOrder, getRankedSongs, placeSongByPoints } from "./lib/ranking";
import { loadVoteState, saveVoteState } from "./lib/storage";
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
          className="credits-page"
          aria-label="Bildnachweise"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="page-title">
            <p>Credits</p>
            <h2>Bildnachweise</h2>
          </div>
          <div className="credits-list">
            {songs.map((song) => (
              <a key={song.id} href={song.participantUrl} target="_blank" rel="noreferrer">
                <span>{song.countryDe}</span>
                <strong>{song.artist}</strong>
                <small>{song.imageCredit ?? "Eurovision Song Contest"}</small>
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
          <div className="ranking-tools">
            <span>Punkte</span>
            <button type="button" onClick={() => patchState({ manualRankOrder: createPointsOrder(songs, state.pointsBySongId) })}>
              <RotateCcw size={16} aria-hidden="true" />
              <span>Sortieren</span>
            </button>
          </div>
          <RankedList songs={rankedSongs} state={state} onPatch={patchState} onPointsChange={setSongPoints} onReorder={(ids) => patchState({ manualRankOrder: ids })} />
        </motion.section>
      );
    }

    return (
      <motion.section
        key="show"
        className="song-list"
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
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p>Vienna · 16.05.2026</p>
          <h1>ESC 2026</h1>
        </div>
        <div className="score-chip">{Object.values(state.pointsBySongId).filter((points) => points !== null).length}/25</div>
      </header>

      <AnimatePresence mode="wait">{contentForView()}</AnimatePresence>

      <footer className="app-footer">
        <button type="button" onClick={() => setView(view === "credits" ? "show" : "credits")}>
          {view === "credits" ? "Zurück" : "Bildnachweise"}
        </button>
      </footer>

      <ViewTabs value={view === "credits" ? "show" : view} onChange={setView} />
    </main>
  );
}
