import { Heart, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "../lib/cn";
import { getFlagUrl } from "../lib/flags";
import { participantLinkClass } from "../lib/ui";
import type { Song } from "../types";
import { PointsPicker } from "./PointsPicker";
import { SparkleButton } from "./SparkleButton";

type SongCardVariant = "show" | "ranking";

type SongCardProps = {
  song: Song;
  points: number | null;
  note: string;
  isWinnerPrediction: boolean;
  isPersonalPick: boolean;
  rank?: number;
  layout?: boolean;
  variant?: SongCardVariant;
  isSortable?: boolean;
  onPointsChange: (points: number | null) => void;
  onNoteChange: (note: string) => void;
  onWinnerPredictionChange: () => void;
  onPersonalPickChange: () => void;
};

const iconButtonBase =
  "inline-flex size-[34px] min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center border border-transparent bg-transparent p-0 shadow-none transition-[color,transform] duration-150 ease-out-quint hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 [&_svg]:stroke-current";

function winnerIconClasses(selected: boolean) {
  return cn(
    iconButtonBase,
    selected ? "text-highlight hover:text-highlight" : "text-foreground hover:text-foreground",
  );
}

function favoriteIconClasses(selected: boolean) {
  return cn(
    iconButtonBase,
    selected ? "text-emphasis hover:text-emphasis" : "text-foreground hover:text-foreground",
  );
}

type ParticipantLinkProps = {
  song: Song;
  className?: string;
  ariaLabel: string;
  onPointerDown?: (event: PointerEvent) => void;
  children: ReactNode;
};

function ParticipantLink({ song, className, ariaLabel, onPointerDown, children }: ParticipantLinkProps) {
  return (
    <a
      className={cn(participantLinkClass, className)}
      href={song.participantUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
    >
      {children}
    </a>
  );
}

export function SongCard({
  song,
  points,
  note,
  isWinnerPrediction,
  isPersonalPick,
  rank,
  layout = true,
  variant = "show",
  isSortable = false,
  onPointsChange,
  onNoteChange,
  onWinnerPredictionChange,
  onPersonalPickChange,
}: SongCardProps) {
  const flagUrl = getFlagUrl(song.countryCode);
  const linkImage = variant === "show";
  const stopSortDrag = isSortable
    ? (event: PointerEvent) => {
      event.stopPropagation();
    }
    : undefined;

  const image = (
    <img
      className="h-full min-h-[216px] w-full object-cover min-[680px]:min-h-[238px]"
      src={song.imageUrl}
      alt={song.imageAlt || song.artist}
      loading="lazy"
    />
  );

  return (
    <motion.article
      className="app-surface grid min-h-[216px] grid-cols-[132px_1fr] border border-border-strong shadow-card min-[680px]:min-h-[238px] min-[680px]:grid-cols-[224px_1fr]"
      layout={layout}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {linkImage ? (
        <ParticipantLink
          song={song}
          className="relative overflow-hidden border-r border-border bg-sunken"
          ariaLabel={`${song.artist} bei Eurovision öffnen`}
          onPointerDown={stopSortDrag}
        >
          {image}
        </ParticipantLink>
      ) : (
        <div className="relative overflow-hidden border-r border-border bg-sunken">{image}</div>
      )}

      <div className="grid min-w-0 gap-2 p-3 min-[680px]:p-4">
        <div className="flex min-w-0 items-center justify-between gap-[7px] text-xs font-extrabold uppercase text-muted-foreground">
          <div className="flex min-w-0 items-center gap-[7px]">
            <span>{rank ? `#${rank}` : song.runningOrder.toString().padStart(2, "0")}</span>
            {flagUrl ? (
              <img
                className="h-[13.5px] w-[18px] border border-accent-faint object-cover"
                src={flagUrl}
                alt=""
                aria-hidden="true"
              />
            ) : null}
            <span className="truncate">{song.countryDe}</span>
          </div>
          <div className="-mr-1.5 flex shrink-0 justify-start gap-0">
            <SparkleButton
              sparkleVariant="golden"
              whileTap={{ scale: 0.9, rotate: -5 }}
              className={winnerIconClasses(isWinnerPrediction)}
              type="button"
              onClick={onWinnerPredictionChange}
              onPointerDown={stopSortDrag}
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
              sparkleVariant="red"
              whileTap={{ scale: 0.9, rotate: 5 }}
              className={favoriteIconClasses(isPersonalPick)}
              type="button"
              onClick={onPersonalPickChange}
              onPointerDown={stopSortDrag}
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

        <div className="-mt-1 flex min-w-0 flex-col items-start">
          <ParticipantLink
            song={song}
            className="max-w-full"
            ariaLabel={`${song.artist} bei Eurovision öffnen`}
            onPointerDown={stopSortDrag}
          >
            <h2 className="m-0 inline text-[1.08rem] leading-[1.05] font-extrabold text-foreground break-anywhere min-[680px]:text-[1.28rem]">
              {song.artist}
            </h2>
          </ParticipantLink>
          <ParticipantLink
            song={song}
            className="max-w-full"
            ariaLabel={`${song.title} bei Eurovision öffnen`}
            onPointerDown={stopSortDrag}
          >
            <p className="m-0 inline text-[0.9rem] leading-tight text-foreground-subtle break-anywhere">{song.title}</p>
          </ParticipantLink>
        </div>

        <div onPointerDown={stopSortDrag}>
          <PointsPicker value={points} onChange={onPointsChange} />
        </div>

        <input
          className="m-0 box-border h-7 w-full min-w-0 rounded-none border-0 bg-input/45 px-2 text-sm text-foreground-subtle placeholder:text-placeholder outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/70"
          aria-label={`Notiz zu ${song.artist}`}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          onPointerDown={stopSortDrag}
          placeholder="Notiz hinzufügen"
        />
      </div>
    </motion.article>
  );
}
