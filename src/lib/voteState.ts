import type { VoteState } from "../types";

export function hasAnyScores(state: VoteState): boolean {
  return Object.values(state.pointsBySongId).some((points) => points !== null);
}

export function voteStatesEqual(a: VoteState, b: VoteState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
