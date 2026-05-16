import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, LayoutGroup, m } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WatchpartyMember } from "../hooks/useWatchpartyMembers";
import { cn } from "../lib/cn";
import { getAvatarUrl } from "../lib/avatar";
import { controlButtonBase, controlButtonIdle } from "../lib/ui";

type WatchpartyMemberBarProps = {
  members: WatchpartyMember[];
  memberVotePulses: Record<string, number>;
  currentUserId: string | null;
  selectedMember: WatchpartyMember | null;
  onSelectMember: (userId: string) => void;
  onBack: () => void;
};

function MemberAvatar({
  userId,
  pulseGeneration,
  highlighted = false,
  layoutId,
}: {
  userId: string;
  pulseGeneration: number;
  highlighted?: boolean;
  layoutId: string;
}) {
  return (
    <m.div
      layoutId={layoutId}
      className="relative grid size-16 shrink-0 place-items-center"
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
    >
      <div
        key={pulseGeneration}
        className={cn("size-14 rounded-full", pulseGeneration > 0 && "avatar-vote-pulse-ring")}
      >
        <img
          src={getAvatarUrl(userId)}
          alt=""
          draggable={false}
          className={cn(
            "size-full rounded-full border-2 border-border bg-sunken object-cover",
            highlighted && "border-accent",
          )}
        />
      </div>
    </m.div>
  );
}

function isLongDisplayName(name: string): boolean {
  return name.length >= 8;
}

function MemberName({
  displayName,
  suffix = "",
  className,
}: {
  displayName: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block w-full min-w-0 truncate text-center font-extrabold text-foreground",
        isLongDisplayName(displayName) ? "text-[0.58rem]" : "text-[0.72rem]",
        className,
      )}
    >
      {displayName}
      {suffix}
    </span>
  );
}

const DRAG_CLICK_THRESHOLD_PX = 4;
const SCROLL_EDGE_THRESHOLD_PX = 2;

function useScrollbarWhileScrolling(timeoutMs = 800) {
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onScroll = useCallback(() => {
    setIsScrolling(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsScrolling(false), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return { isScrolling, onScroll };
}

function useHorizontalScrollEdges(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  contentKey: string,
) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollEdges = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(element.scrollLeft > SCROLL_EDGE_THRESHOLD_PX);
    setCanScrollRight(
      maxScrollLeft > SCROLL_EDGE_THRESHOLD_PX &&
      element.scrollLeft < maxScrollLeft - SCROLL_EDGE_THRESHOLD_PX,
    );
  }, [scrollRef]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    updateScrollEdges();

    const resizeObserver = new ResizeObserver(updateScrollEdges);
    resizeObserver.observe(element);

    const frameId = requestAnimationFrame(updateScrollEdges);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [scrollRef, contentKey, updateScrollEdges]);

  return { canScrollLeft, canScrollRight, updateScrollEdges };
}

/** Vertical center of `size-16` avatars inside the list row (`py-2` + half avatar). */
const SCROLL_HINT_AVATAR_CENTER_CLASS = "top-[calc(0.5rem+2rem)]";

function ScrollEdgeHint({ side, visible }: { side: "left" | "right"; visible: boolean }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <AnimatePresence>
      {visible ? (
        <m.div
          key={side}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "pointer-events-none absolute z-10 -translate-y-1/2",
            SCROLL_HINT_AVATAR_CENTER_CLASS,
            side === "left" ? "left-1" : "right-1",
          )}
          aria-hidden="true"
        >
          <div className="grid size-9 place-items-center rounded-full border border-foreground/10 bg-background/65 shadow-sm backdrop-blur-sm">
            <Icon size={18} strokeWidth={2.25} className="text-foreground/45" />
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

function useHorizontalDragScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: element.scrollLeft,
      moved: false,
    };
    element.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) {
      return;
    }
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    const deltaX = event.clientX - dragRef.current.startX;
    if (Math.abs(deltaX) > DRAG_CLICK_THRESHOLD_PX) {
      dragRef.current.moved = true;
      event.preventDefault();
    }
    element.scrollLeft = dragRef.current.startScrollLeft - deltaX;
  }, []);

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element || !dragRef.current.active) {
      return;
    }
    element.releasePointerCapture(event.pointerId);
    dragRef.current.active = false;
    setIsDragging(false);
  }, []);

  const consumeDragClick = useCallback(() => {
    const wasDrag = dragRef.current.moved;
    dragRef.current.moved = false;
    return wasDrag;
  }, []);

  return {
    scrollRef,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    consumeDragClick,
  };
}

export function WatchpartyMemberBar({
  members,
  memberVotePulses,
  currentUserId,
  selectedMember,
  onSelectMember,
  onBack,
}: WatchpartyMemberBarProps) {
  const isDetail = selectedMember !== null;
  const { isScrolling, onScroll } = useScrollbarWhileScrolling();
  const {
    scrollRef,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    consumeDragClick,
  } = useHorizontalDragScroll();

  const membersKey = members.map((member) => member.userId).join(",");
  const { canScrollLeft, canScrollRight, updateScrollEdges } = useHorizontalScrollEdges(
    scrollRef,
    membersKey,
  );

  const handleListScroll = useCallback(() => {
    onScroll();
    updateScrollEdges();
  }, [onScroll, updateScrollEdges]);

  return (
    <LayoutGroup id="watchparty-members">
      <m.div className="relative min-h-[96px] w-full min-w-0 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {isDetail && selectedMember ? (
            <m.div
              key="detail"
              className="grid grid-cols-[42px_1fr_42px] gap-x-2 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              aria-label={`Wertung von ${selectedMember.displayName}`}
            >
              <div className="flex h-16 items-center justify-center">
                <button
                  type="button"
                  className={cn(controlButtonBase, controlButtonIdle, "size-[42px] shrink-0 p-0")}
                  aria-label="Zurück zur Gesamtwertung"
                  onClick={onBack}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
              </div>

              <m.div
                className="flex flex-col items-center gap-1.5 justify-self-center"
                layout
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              >
                <MemberAvatar
                  userId={selectedMember.userId}
                  pulseGeneration={memberVotePulses[selectedMember.userId] ?? 0}
                  highlighted
                  layoutId={`watchparty-avatar-${selectedMember.userId}`}
                />
                <m.div layout className="max-w-[min(100%,220px)] min-w-0">
                  <MemberName
                    displayName={selectedMember.displayName}
                    suffix={currentUserId === selectedMember.userId ? " (du)" : ""}
                  />
                </m.div>
              </m.div>

              <m.div aria-hidden="true" className="h-16 w-[42px]" />
            </m.div>
          ) : (
            <m.div
              key="list"
              className="relative w-full min-w-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ScrollEdgeHint side="left" visible={canScrollLeft} />
              <ScrollEdgeHint side="right" visible={canScrollRight} />
              <m.div
                ref={scrollRef}
                aria-label="Watchparty-Teilnehmer"
                className={cn(
                  "scrollbar-overlay flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain py-2",
                  "touch-none select-none",
                  isScrolling && "is-scrolling",
                  isDragging ? "cursor-grabbing" : "cursor-grab",
                )}
                onScroll={handleListScroll}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={(event) => {
                  onPointerUp(event);
                  updateScrollEdges();
                }}
                onPointerCancel={(event) => {
                  onPointerCancel(event);
                  updateScrollEdges();
                }}
              >
                {members.map((member) => {
                  return (
                    <button
                      key={member.userId}
                      type="button"
                      className={cn(
                        "flex w-[72px] shrink-0 flex-col items-center gap-1.5 border-0 bg-transparent p-0",
                        "cursor-pointer focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2",
                      )}
                      onClick={() => {
                        if (consumeDragClick()) {
                          return;
                        }
                        onSelectMember(member.userId);
                      }}
                    >
                      <MemberAvatar
                        userId={member.userId}
                        pulseGeneration={memberVotePulses[member.userId] ?? 0}
                        layoutId={`watchparty-avatar-${member.userId}`}
                      />
                      <MemberName displayName={member.displayName} />
                    </button>
                  );
                })}
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </LayoutGroup>
  );
}
