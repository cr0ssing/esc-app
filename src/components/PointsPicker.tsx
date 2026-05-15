import { ESC_POINTS } from "../lib/ranking";
import { SparkleButton } from "./SparkleButton";

type PointsPickerProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function PointsPicker({ value, onChange }: PointsPickerProps) {
  return (
    <div className="points-picker" aria-label="Punkte">
      {ESC_POINTS.map((points) => (
        <SparkleButton
          whileTap={{ scale: 0.86 }}
          className={value === points ? "is-selected" : ""}
          key={points}
          type="button"
          onClick={() => onChange(value === points ? null : points)}
          aria-pressed={value === points}
        >
          {points}
        </SparkleButton>
      ))}
    </div>
  );
}
