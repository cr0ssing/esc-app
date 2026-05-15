import { ChevronLeft } from "lucide-react";
import { AnimatePresence, LayoutGroup, m } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { getAvatarUrl } from "../lib/avatar";
import { controlButtonBase, controlButtonIdle } from "../lib/ui";

type WatchpartyMember = {
  userId: string;
  displayName: string;
};

type WatchpartyMemberBarProps = {
  members: WatchpartyMember[];
  currentUserId: string | null;
  selectedMember: WatchpartyMember | null;
  onSelectMember: (userId: string) => void;
  onBack: () => void;
};

function MemberAvatar({
  userId,
  highlighted = false,
  layoutId,
}: {
  userId: string;
  highlighted?: boolean;
  layoutId: string;
}) {
  return (
    <m.img
      layoutId={layoutId}
      src={getAvatarUrl(userId)}
      alt=""
      className={cn(
        "size-14 rounded-full border-2 border-border bg-sunken object-cover",
        highlighted && "border-accent",
      )}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
    />
  );
}

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

export function WatchpartyMemberBar({
  members,
  currentUserId,
  selectedMember,
  onSelectMember,
  onBack,
}: WatchpartyMemberBarProps) {
  const isDetail = selectedMember !== null;
  const { isScrolling, onScroll } = useScrollbarWhileScrolling();

  return (
    <LayoutGroup id="watchparty-members">
      <div className="relative min-h-[88px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {isDetail && selectedMember ? (
            <m.div
              key="detail"
              className="grid grid-cols-[42px_1fr_42px] gap-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              aria-label={`Wertung von ${selectedMember.displayName}`}
            >
              <div className="flex h-14 items-center justify-center">
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
                  highlighted
                  layoutId={`watchparty-avatar-${selectedMember.userId}`}
                />
                <m.span
                  layout
                  className="max-w-[min(100%,220px)] truncate text-center text-[0.72rem] font-extrabold text-foreground"
                >
                  {selectedMember.displayName}
                  {currentUserId === selectedMember.userId ? " (du)" : ""}
                </m.span>
              </m.div>

              <m.div aria-hidden="true" className="h-14 w-[42px]" />
            </m.div>
          ) : (
            <m.div
              key="list"
              className={cn(
                "scrollbar-overlay -mx-1 flex max-h-46 min-w-0 max-w-full flex-wrap gap-3 overflow-y-auto overflow-x-hidden px-1 pb-1",
                isScrolling && "is-scrolling",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              aria-label="Watchparty-Teilnehmer"
              onScroll={onScroll}
            >
              {members.map((member) => {
                const isSelf = currentUserId === member.userId;

                return (
                  <button
                    key={member.userId}
                    type="button"
                    className={cn(
                      "flex w-[72px] shrink-0 flex-col items-center gap-1.5 border-0 bg-transparent p-0",
                      "cursor-pointer focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2",
                    )}
                    onClick={() => onSelectMember(member.userId)}
                  >
                    <MemberAvatar
                      userId={member.userId}
                      layoutId={`watchparty-avatar-${member.userId}`}
                    />
                    <span className="max-w-full truncate text-center text-[0.72rem] font-extrabold text-foreground">
                      {member.displayName}
                      {isSelf ? " (du)" : ""}
                    </span>
                  </button>
                );
              })}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
