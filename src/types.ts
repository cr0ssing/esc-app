export type Song = {
  id: string;
  runningOrder: number;
  country: string;
  countryDe: string;
  countryCode: string;
  artist: string;
  title: string;
  participantUrl: string;
  imageUrl: string;
  imageAlt: string;
  imageCredit?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
};

export type VoteState = {
  schemaVersion: 1;
  pointsBySongId: Record<string, number | null>;
  notesBySongId: Record<string, string>;
  winnerPredictionId: string | null;
  personalPickId: string | null;
  manualRankOrder: string[];
};

export type ViewMode = "show" | "ranking" | "watchparty" | "credits";
