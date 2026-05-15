import type { Song, VoteState } from "../types";

export const ESC_POINTS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12] as const;

export function getRankedSongs(songs: Song[], state: VoteState) {
  const rankIndex = new Map(state.manualRankOrder.map((id, index) => [id, index]));

  return songs.toSorted((a, b) => {
    const manualA = rankIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const manualB = rankIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER;

    if (manualA !== manualB) {
      return manualA - manualB;
    }

    return a.runningOrder - b.runningOrder;
  });
}

export function createPointsOrder(songs: Song[], pointsBySongId: VoteState["pointsBySongId"]) {
  return songs
    .toSorted((a, b) => {
      const pointsA = pointsBySongId[a.id] ?? -1;
      const pointsB = pointsBySongId[b.id] ?? -1;

      if (pointsA !== pointsB) {
        return pointsB - pointsA;
      }

      return a.runningOrder - b.runningOrder;
    })
    .map((song) => song.id);
}

export function placeSongByPoints(order: string[], songId: string, pointsBySongId: VoteState["pointsBySongId"]) {
  const next = order.filter((id) => id !== songId);
  const songPoints = pointsBySongId[songId] ?? -1;
  let insertIndex = next.length;

  while (insertIndex > 0) {
    const previousId = next[insertIndex - 1];
    const previousPoints = pointsBySongId[previousId] ?? -1;

    if (songPoints <= previousPoints) {
      break;
    }

    insertIndex -= 1;
  }

  next.splice(insertIndex, 0, songId);
  return next;
}
