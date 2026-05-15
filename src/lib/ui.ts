export const participantLinkClass =
  "text-inherit no-underline hover:underline focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2";

export const controlButtonBase =
  "inline-flex cursor-pointer items-center justify-center gap-[7px] transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out-quint focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2";

export const controlButtonIdle =
  "border border-border-subtle bg-secondary text-secondary-foreground hover:-translate-y-px hover:border-border-hover hover:bg-secondary-hover hover:text-secondary-foreground";

export const controlButtonActive =
  "border border-accent bg-accent text-accent-foreground shadow-inset hover:translate-y-0 hover:border-accent hover:bg-accent-hover hover:text-accent-foreground";

export const controlButtonDisabled =
  "cursor-not-allowed opacity-40 hover:translate-y-0 hover:border-border-subtle hover:bg-secondary hover:text-muted-foreground";

export const headerControlButtonClass = "size-[42px] shrink-0 p-0";

export const headerMetricClass =
  "flex min-h-[42px] min-w-16 items-center justify-center border border-border-accent bg-raised px-2.5 text-center text-[0.85rem] font-extrabold text-foreground-subtle";
