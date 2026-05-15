import { Heart, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { getFlagUrl } from "../lib/flags";
import type { Song } from "../types";
import { PointsPicker } from "./PointsPicker";
import { SparkleButton } from "./SparkleButton";

type SongCardProps = {
  song: Song;
  points: number | null;
  note: string;
  isWinnerPrediction: boolean;
  isPersonalPick: boolean;
  rank?: number;
  layout?: boolean;
  onPointsChange: (points: number | null) => void;
  onNoteChange: (note: string) => void;
  onWinnerPredictionChange: () => void;
  onPersonalPickChange: () => void;
};

export function SongCard({
  song,
  points,
  note,
  isWinnerPrediction,
  isPersonalPick,
  rank,
  layout = true,
  onPointsChange,
  onNoteChange,
  onWinnerPredictionChange,
  onPersonalPickChange,
}: SongCardProps) {
  const flagUrl = getFlagUrl(song.countryCode);

  return (
    <motion.article
      className="song-card"
      layout={layout}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="song-media" href={song.participantUrl} target="_blank" rel="noreferrer" aria-label={`${song.artist} bei Eurovision öffnen`}>
        <img src={song.imageUrl} alt={song.imageAlt || song.artist} loading="lazy" />
      </a>

      <div className="song-body">
        <div className="song-kicker">
          <div className="country-meta">
            <span>{rank ? `#${rank}` : song.runningOrder.toString().padStart(2, "0")}</span>
            {flagUrl ? <img className="flag-icon" src={flagUrl} alt="" aria-hidden="true" /> : null}
            <span>{song.countryDe}</span>
          </div>
          <div className="song-actions">
            <SparkleButton
              whileTap={{ scale: 0.9, rotate: -5 }}
              sparkleVariant="winner"
              className={isWinnerPrediction ? "winner is-active" : "winner"}
              type="button"
              onClick={onWinnerPredictionChange}
              aria-label="Sieger"
              aria-pressed={isWinnerPrediction}
            >
              <Trophy
                size={18}
                aria-hidden="true"
                fill={isWinnerPrediction ? "currentColor" : "none"}
                strokeWidth={isWinnerPrediction ? 1.75 : 2}
              />
            </SparkleButton>
            <SparkleButton
              whileTap={{ scale: 0.9, rotate: 5 }}
              sparkleVariant="favorite"
              className={isPersonalPick ? "favorite is-active" : "favorite"}
              type="button"
              onClick={onPersonalPickChange}
              aria-label="Favorit"
              aria-pressed={isPersonalPick}
            >
              <Heart
                size={18}
                aria-hidden="true"
                fill={isPersonalPick ? "currentColor" : "none"}
                strokeWidth={isPersonalPick ? 1.75 : 2}
              />
            </SparkleButton>
          </div>
        </div>

        <a className="song-title" href={song.participantUrl} target="_blank" rel="noreferrer">
          <h2>{song.artist}</h2>
          <p>{song.title}</p>
        </a>

        <input
          className="note-input"
          aria-label={`Notiz zu ${song.artist}`}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Notiz hinzufügen"
        />

        <PointsPicker value={points} onChange={onPointsChange} />
      </div>
    </motion.article>
  );
}
