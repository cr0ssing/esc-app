import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";
import { hasAnyScores, voteStatesEqual } from "../lib/voteState";
import type { VoteState } from "../types";

type UseVoteSyncOptions = {
  sessionToken: string | null;
  isActive: boolean;
  state: VoteState;
  setState: React.Dispatch<React.SetStateAction<VoteState>>;
};

export function useVoteSync({ sessionToken, isActive, state, setState }: UseVoteSyncOptions) {
  const remote = useQuery(api.watchparties.getMyVoteState, isActive && sessionToken ? { sessionToken } : "skip");
  const updateVoteState = useMutation(api.watchparties.updateVoteState);

  const lastPushedAt = useRef(0);
  const skipNextPush = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialPullDone = useRef(false);

  useEffect(() => {
    if (!isActive || !sessionToken || remote === undefined) {
      return;
    }
    if (remote === null) {
      return;
    }

    const shouldPull =
      !initialPullDone.current ||
      (remote.updatedAt > lastPushedAt.current && !voteStatesEqual(state, remote.voteState));

    if (shouldPull && remote.updatedAt > lastPushedAt.current) {
      if (!hasAnyScores(state) && hasAnyScores(remote.voteState)) {
        skipNextPush.current = true;
        lastPushedAt.current = remote.updatedAt;
        setState(remote.voteState);
        initialPullDone.current = true;
        return;
      }

      if (initialPullDone.current && remote.updatedAt > lastPushedAt.current && !voteStatesEqual(state, remote.voteState)) {
        skipNextPush.current = true;
        lastPushedAt.current = remote.updatedAt;
        setState(remote.voteState);
      }
    }

    initialPullDone.current = true;
  }, [isActive, sessionToken, remote, setState, state]);

  useEffect(() => {
    if (!isActive || !sessionToken) {
      return;
    }

    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void updateVoteState({ sessionToken, voteState: state }).then((updatedAt) => {
        lastPushedAt.current = updatedAt;
      });
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isActive, sessionToken, state, updateVoteState]);

  return { remote };
}
