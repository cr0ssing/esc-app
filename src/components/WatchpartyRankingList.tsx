import { useQuery } from "convex/react";
import { LayoutGroup, m } from "motion/react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import type { Song } from "../types";
import { SongCard } from "./SongCard";

type WatchpartyRankingListProps = {
  songs: Song[];
  sessionToken: string;
};

export function WatchpartyRankingList({ songs, sessionToken }: WatchpartyRankingListProps) {
  const aggregate = useQuery(
    api.watchparties.getWatchpartyAggregate,
    sessionToken ? { sessionToken } : "skip",
  );

  const rankedSongs = useMemo(() => {
    if (!aggregate) {
      return songs;
    }

    const totals = new Map(aggregate.map((entry) => [entry.songId, entry.totalPoints]));
    return songs.toSorted((a, b) => {
      const totalA = totals.get(a.id) ?? -1;
      const totalB = totals.get(b.id) ?? -1;
      if (totalA !== totalB) {
        return totalB - totalA;
      }
      return a.runningOrder - b.runningOrder;
    });
  }, [aggregate, songs]);

  const totalsBySongId = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of aggregate ?? []) {
      map.set(entry.songId, entry.totalPoints);
    }
    return map;
  }, [aggregate]);

  if (aggregate === undefined) {
    return <p className="m-0 text-sm text-muted-foreground">Lade Watchparty-Ranking…</p>;
  }

  return (
    <LayoutGroup id="watchparty-ranking">
      <m.div className="grid gap-3" layout>
        {rankedSongs.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            rank={index + 1}
            layout
            variant="watchparty"
            readOnly
            points={totalsBySongId.get(song.id) ?? null}
            note=""
            isWinnerPrediction={false}
            isPersonalPick={false}
            onPointsChange={() => { }}
            onNoteChange={() => { }}
            onWinnerPredictionChange={() => { }}
            onPersonalPickChange={() => { }}
          />
        ))}
      </m.div>
    </LayoutGroup>
  );
}
