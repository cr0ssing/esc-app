import { v } from "convex/values";

export const voteStateValidator = v.object({
  schemaVersion: v.literal(1),
  pointsBySongId: v.record(v.string(), v.union(v.number(), v.null())),
  notesBySongId: v.record(v.string(), v.string()),
  winnerPredictionId: v.union(v.string(), v.null()),
  personalPickId: v.union(v.string(), v.null()),
  manualRankOrder: v.array(v.string()),
});

export type VoteStateValue = {
  schemaVersion: 1;
  pointsBySongId: Record<string, number | null>;
  notesBySongId: Record<string, string>;
  winnerPredictionId: string | null;
  personalPickId: string | null;
  manualRankOrder: string[];
};

export const emptyVoteState = (): VoteStateValue => ({
  schemaVersion: 1,
  pointsBySongId: {},
  notesBySongId: {},
  winnerPredictionId: null,
  personalPickId: null,
  manualRankOrder: [],
});

export function hasAnyScores(voteState: VoteStateValue): boolean {
  return Object.values(voteState.pointsBySongId).some((points) => points !== null);
}
