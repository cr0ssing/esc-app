import { useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";

export type WatchpartyMember = {
  userId: string;
  displayName: string;
  updatedAt: number;
  voteSignature: string;
};

function memberActivityToken(member: WatchpartyMember): string {
  return `${member.updatedAt}:${member.voteSignature}`;
}

export function useWatchpartyMembers(sessionToken: string | null, isActive: boolean) {
  return useQuery(
    api.watchparties.getWatchpartyMembers,
    isActive && sessionToken ? { sessionToken } : "skip",
  );
}

export function useMemberVotePulses(members: WatchpartyMember[] | undefined) {
  const previousTokensRef = useRef<Map<string, string>>(new Map());
  const [pulseGenerationByUser, setPulseGenerationByUser] = useState<Record<string, number>>({});

  const list = members ?? [];

  const activityFingerprint = useMemo(
    () => list.map((member) => `${member.userId}\x00${memberActivityToken(member)}`).join("\x1e"),
    [list],
  );

  useEffect(() => {
    const previous = previousTokensRef.current;
    const pulseIncrements: Record<string, number> = {};

    for (const member of list) {
      const token = memberActivityToken(member);
      const prior = previous.get(member.userId);
      if (prior !== undefined && prior !== token) {
        pulseIncrements[member.userId] = 1;
      }
      previous.set(member.userId, token);
    }

    if (Object.keys(pulseIncrements).length === 0) {
      return;
    }

    setPulseGenerationByUser((current) => {
      const next = { ...current };
      for (const userId of Object.keys(pulseIncrements)) {
        next[userId] = (current[userId] ?? 0) + 1;
      }
      return next;
    });
  }, [activityFingerprint, list]);

  return pulseGenerationByUser;
}
