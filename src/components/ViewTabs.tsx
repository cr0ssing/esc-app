import { ListMusic, Trophy } from "lucide-react";
import { cn } from "../lib/cn";
import { controlButtonActive, controlButtonBase, controlButtonIdle } from "../lib/ui";
import type { ViewMode } from "../types";

type ViewTabsProps = {
  value: Exclude<ViewMode, "credits">;
  onChange: (value: Exclude<ViewMode, "credits">) => void;
};

const tabButtonBase = cn(controlButtonBase, "min-h-[58px] border-0 text-[0.84rem] font-extrabold uppercase");

export function ViewTabs({ value, onChange }: ViewTabsProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-10 mx-auto grid w-full grid-cols-2 gap-px border-0 border-t border-border-accent bg-muted shadow-elevated"
      aria-label="Ansicht"
    >
      <button
        className={cn(tabButtonBase, value === "show" ? controlButtonActive : controlButtonIdle)}
        type="button"
        aria-pressed={value === "show"}
        onClick={() => onChange("show")}
      >
        <ListMusic size={17} aria-hidden="true" />
        <span>Show</span>
      </button>
      <button
        className={cn(tabButtonBase, value === "ranking" ? controlButtonActive : controlButtonIdle)}
        type="button"
        aria-pressed={value === "ranking"}
        onClick={() => onChange("ranking")}
      >
        <Trophy size={17} aria-hidden="true" />
        <span>Ranking</span>
      </button>
    </div>
  );
}
