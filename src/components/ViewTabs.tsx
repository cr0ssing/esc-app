import { ListMusic, PartyPopper, Trophy } from "lucide-react";
import { cn } from "../lib/cn";
import type { ViewMode } from "../types";

type ViewTabsProps = {
  value: Exclude<ViewMode, "credits">;
  onChange: (value: Exclude<ViewMode, "credits">) => void;
};

const tabIdleChrome =
  "bg-secondary text-secondary-foreground hover:bg-secondary-hover hover:text-secondary-foreground";

const tabActiveChrome =
  "bg-accent text-accent-foreground shadow-inset hover:bg-accent-hover hover:text-accent-foreground hover:shadow-inset";

const tabButtonBase = cn(
  "inline-flex cursor-pointer items-center justify-center gap-[7px] transition-colors duration-150 ease-out-quint focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2",
  "min-h-[58px] flex-col gap-1 border-0 py-2 text-[0.65rem] font-extrabold leading-tight pb-[var(--pwa-view-tabs-padding-bottom)]",
);

function tabButtonClass(isActive: boolean) {
  return cn(tabButtonBase, isActive ? tabActiveChrome : tabIdleChrome);
}

const iconSize = 22;

export function ViewTabs({ value, onChange }: ViewTabsProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-10 grid w-full grid-cols-3 gap-0 border-t border-border-accent bg-muted shadow-none"
      aria-label="Ansicht"
    >
      <button
        className={tabButtonClass(value === "show")}
        type="button"
        aria-pressed={value === "show"}
        onClick={() => onChange("show")}
      >
        <ListMusic size={iconSize} aria-hidden="true" />
        <span>Show</span>
      </button>
      <button
        className={tabButtonClass(value === "ranking")}
        type="button"
        aria-pressed={value === "ranking"}
        onClick={() => onChange("ranking")}
      >
        <Trophy size={iconSize} aria-hidden="true" />
        <span>Ranking</span>
      </button>
      <button
        className={tabButtonClass(value === "watchparty")}
        type="button"
        aria-pressed={value === "watchparty"}
        onClick={() => onChange("watchparty")}
      >
        <PartyPopper size={iconSize} aria-hidden="true" />
        <span>Watchparty</span>
      </button>
    </div>
  );
}
