import { ESC_POINTS } from "../lib/ranking";
import { cn } from "../lib/cn";
import { controlButtonActive, controlButtonBase, controlButtonIdle } from "../lib/ui";
import { SparkleButton } from "./SparkleButton";

type PointsPickerProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

const pointsButtonBase = cn(
  controlButtonBase,
  "relative min-h-[34px] min-w-0 overflow-visible p-0 text-[0.8rem] font-extrabold",
);

export function PointsPicker({ value, onChange }: PointsPickerProps) {
  return (
    <div
      className="grid grid-cols-5 gap-1 overflow-visible min-[680px]:grid-cols-10"
      aria-label="Punkte"
    >
      {ESC_POINTS.map((points) => {
        const selected = value === points;
        const isDouzePoints = points === 12;
        return (
          <SparkleButton
            key={points}
            sparkleVariant="golden"
            celebration={isDouzePoints}
            whileTap={isDouzePoints ? { scale: 0.8, rotate: -4 } : { scale: 0.86 }}
            className={cn(
              pointsButtonBase,
              isDouzePoints &&
              "border-highlight/35 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-highlight)_18%,transparent)]",
              isDouzePoints && selected && "border-highlight shadow-none",
              selected ? cn(controlButtonActive, "shadow-none") : controlButtonIdle,
            )}
            type="button"
            onClick={() => onChange(selected ? null : points)}
            aria-pressed={selected}
          >
            {points}
          </SparkleButton>
        );
      })}
    </div>
  );
}
