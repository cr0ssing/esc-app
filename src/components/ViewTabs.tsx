import { ListMusic, Trophy } from "lucide-react";
import type { ViewMode } from "../types";

type ViewTabsProps = {
  value: Exclude<ViewMode, "credits">;
  onChange: (value: Exclude<ViewMode, "credits">) => void;
};

export function ViewTabs({ value, onChange }: ViewTabsProps) {
  return (
    <div className="view-tabs" aria-label="Ansicht">
      <button className={value === "show" ? "is-active" : ""} type="button" onClick={() => onChange("show")}>
        <ListMusic size={17} aria-hidden="true" />
        <span>Show</span>
      </button>
      <button className={value === "ranking" ? "is-active" : ""} type="button" onClick={() => onChange("ranking")}>
        <Trophy size={17} aria-hidden="true" />
        <span>Ranking</span>
      </button>
    </div>
  );
}
