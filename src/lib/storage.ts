import type { Song, VoteState } from "../types";

const STORAGE_KEY = "esc2026.personalVotes.v1";

export function createDefaultVoteState(songs: Song[]): VoteState {
  return {
    schemaVersion: 1,
    pointsBySongId: Object.fromEntries(songs.map((song) => [song.id, null])),
    notesBySongId: {},
    winnerPredictionId: null,
    personalPickId: null,
    manualRankOrder: songs.map((song) => song.id),
  };
}

export function loadVoteState(songs: Song[]): VoteState {
  const fallback = createDefaultVoteState(songs);
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<VoteState>;
    if (parsed.schemaVersion !== 1) {
      return fallback;
    }

    const knownIds = new Set(songs.map((song) => song.id));
    const savedOrder = parsed.manualRankOrder ?? [];
    const manualRankOrder: string[] = [];
    const seen = new Set<string>();

    for (const id of savedOrder) {
      if (knownIds.has(id) && !seen.has(id)) {
        manualRankOrder.push(id);
        seen.add(id);
      }
    }

    for (const song of songs) {
      if (!seen.has(song.id)) {
        manualRankOrder.push(song.id);
        seen.add(song.id);
      }
    }

    return {
      schemaVersion: 1,
      pointsBySongId: { ...fallback.pointsBySongId, ...parsed.pointsBySongId },
      notesBySongId: parsed.notesBySongId ?? {},
      winnerPredictionId: parsed.winnerPredictionId && knownIds.has(parsed.winnerPredictionId) ? parsed.winnerPredictionId : null,
      personalPickId: parsed.personalPickId && knownIds.has(parsed.personalPickId) ? parsed.personalPickId : null,
      manualRankOrder,
    };
  } catch {
    return fallback;
  }
}

export function saveVoteState(state: VoteState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
