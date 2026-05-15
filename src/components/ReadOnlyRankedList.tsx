import { motion } from "motion/react";
import { getRankedSongs } from "../lib/ranking";
import type { Song, VoteState } from "../types";
import { SongCard } from "./SongCard";

type ReadOnlyRankedListProps = {
  songs: Song[];
  state: VoteState;
};

export function ReadOnlyRankedList({ songs, state }: ReadOnlyRankedListProps) {
  const rankedSongs = getRankedSongs(songs, state);

  return (
    <motion.div className="grid gap-3">
      {rankedSongs.map((song, index) => (
        <SongCard
          key={song.id}
          song={song}
          rank={index + 1}
          layout={false}
          variant="ranking"
          readOnly
          points={state.pointsBySongId[song.id] ?? null}
          note={state.notesBySongId[song.id] ?? ""}
          isWinnerPrediction={state.winnerPredictionId === song.id}
          isPersonalPick={state.personalPickId === song.id}
          onPointsChange={() => {}}
          onNoteChange={() => {}}
          onWinnerPredictionChange={() => {}}
          onPersonalPickChange={() => {}}
        />
      ))}
    </motion.div>
  );
}
