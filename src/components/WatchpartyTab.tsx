import { useMutation, useQuery } from "convex/react";
import { m } from "motion/react";
import { useEffect, useReducer, useRef } from "react";
import { api } from "../../convex/_generated/api";
import { cn } from "../lib/cn";
import { buildInviteUrl, clearPartyCodeFromUrl } from "../lib/invite";
import { createDefaultVoteState } from "../lib/storage";
import { hasAnyScores } from "../lib/voteState";
import { controlButtonBase, controlButtonDisabled, controlButtonIdle } from "../lib/ui";
import type { Song, VoteState } from "../types";
import { InviteLinkOverlay, JoinNameOverlay, JoinOverlay } from "./WatchpartyOverlay";
import { WatchpartyMemberBar } from "./WatchpartyMemberBar";
import { WatchpartyRankingList } from "./WatchpartyRankingList";
import { ReadOnlyRankedList } from "./ReadOnlyRankedList";

type SessionInfo = {
  watchpartyId: string;
  userId: string;
  displayName: string;
  inviteCode: string;
};

type WatchpartyTabProps = {
  songs: Song[];
  voteState: VoteState;
  sessionToken: string | null;
  session: SessionInfo | null;
  isActive: boolean;
  isLoading: boolean;
  initialPartyCode: string | null;
  onPersistSession: (token: string) => void;
  onCreate: (args: {
    displayName: string;
    initialVoteState: VoteState;
  }) => Promise<{ sessionToken: string; inviteCode: string }>;
  onJoin: (args: {
    inviteInput: string;
    displayName: string;
    initialVoteState: VoteState;
  }) => Promise<{ sessionToken: string }>;
};

type OverlayMode = "none" | "create" | "join" | "joinFromLink";

type WatchpartyUiState = {
  displayName: string;
  overlay: OverlayMode;
  inviteInput: string;
  createdInviteUrl: string | null;
  selectedUserId: string | null;
  busy: boolean;
  error: string | null;
};

type WatchpartyUiAction =
  | { type: "setDisplayName"; value: string }
  | { type: "setOverlay"; value: OverlayMode }
  | { type: "setInviteInput"; value: string }
  | { type: "setCreatedInviteUrl"; value: string | null }
  | { type: "setSelectedUserId"; value: string | null }
  | { type: "setBusy"; value: boolean }
  | { type: "setError"; value: string | null }
  | { type: "resetAfterLeave" };

function watchpartyUiReducer(state: WatchpartyUiState, action: WatchpartyUiAction): WatchpartyUiState {
  switch (action.type) {
    case "setDisplayName":
      return { ...state, displayName: action.value };
    case "setOverlay":
      return { ...state, overlay: action.value };
    case "setInviteInput":
      return { ...state, inviteInput: action.value };
    case "setCreatedInviteUrl":
      return { ...state, createdInviteUrl: action.value };
    case "setSelectedUserId":
      return { ...state, selectedUserId: action.value };
    case "setBusy":
      return { ...state, busy: action.value };
    case "setError":
      return { ...state, error: action.value };
    case "resetAfterLeave":
      return {
        ...state,
        overlay: "none",
        createdInviteUrl: null,
        error: null,
        selectedUserId: null,
      };
    default:
      return state;
  }
}

export function WatchpartyTab({
  songs,
  voteState,
  sessionToken,
  session,
  isActive,
  isLoading,
  initialPartyCode,
  onPersistSession,
  onCreate,
  onJoin,
}: WatchpartyTabProps) {
  const updateVoteState = useMutation(api.watchparties.updateVoteState);

  const [ui, dispatch] = useReducer(watchpartyUiReducer, {
    displayName: session?.displayName ?? "",
    overlay: initialPartyCode ? "joinFromLink" : "none",
    inviteInput: initialPartyCode ?? "",
    createdInviteUrl: null,
    selectedUserId: null,
    busy: false,
    error: null,
  });

  const { displayName, overlay, inviteInput, createdInviteUrl, selectedUserId, busy, error } = ui;

  const members = useQuery(api.watchparties.getWatchpartyMembers, isActive && sessionToken ? { sessionToken } : "skip");
  const memberVoteState = useQuery(
    api.watchparties.getMemberVoteState,
    isActive && sessionToken && selectedUserId ? { sessionToken, targetUserId: selectedUserId } : "skip",
  );

  const nameReady = displayName.trim().length > 0;

  const wasActiveRef = useRef(isActive);
  useEffect(() => {
    if (wasActiveRef.current && !isActive && !isLoading) {
      dispatch({ type: "resetAfterLeave" });
    }
    wasActiveRef.current = isActive;
  }, [isActive, isLoading]);

  async function pushLocalVotesIfNeeded(token: string) {
    if (!hasAnyScores(voteState)) {
      return;
    }
    await updateVoteState({ sessionToken: token, voteState });
  }

  async function handleCreate() {
    dispatch({ type: "setBusy", value: true });
    dispatch({ type: "setError", value: null });
    try {
      const result = await onCreate({
        displayName: displayName.trim(),
        initialVoteState: voteState,
      });
      onPersistSession(result.sessionToken);
      await pushLocalVotesIfNeeded(result.sessionToken);
      dispatch({ type: "setCreatedInviteUrl", value: buildInviteUrl(result.inviteCode) });
      dispatch({ type: "setOverlay", value: "create" });
      clearPartyCodeFromUrl();
    } catch (cause) {
      dispatch({
        type: "setError",
        value: cause instanceof Error ? cause.message : "Watchparty konnte nicht erstellt werden",
      });
    } finally {
      dispatch({ type: "setBusy", value: false });
    }
  }

  async function handleJoin() {
    dispatch({ type: "setBusy", value: true });
    dispatch({ type: "setError", value: null });
    try {
      const result = await onJoin({
        inviteInput,
        displayName: displayName.trim(),
        initialVoteState: voteState,
      });
      onPersistSession(result.sessionToken);
      await pushLocalVotesIfNeeded(result.sessionToken);
      dispatch({ type: "setOverlay", value: "none" });
      clearPartyCodeFromUrl();
    } catch (cause) {
      dispatch({
        type: "setError",
        value: cause instanceof Error ? cause.message : "Beitritt fehlgeschlagen",
      });
    } finally {
      dispatch({ type: "setBusy", value: false });
    }
  }

  if (isLoading) {
    return <p className="m-0 text-sm text-muted-foreground">Watchparty wird geladen…</p>;
  }

  if (!isActive || !session || !sessionToken) {
    if (initialPartyCode && overlay === "joinFromLink") {
      return (
        <JoinNameOverlay
          displayName={displayName}
          onDisplayNameChange={(value) => dispatch({ type: "setDisplayName", value })}
          onJoin={() => void handleJoin()}
          onClose={() => {
            dispatch({ type: "setOverlay", value: "none" });
            dispatch({ type: "setError", value: null });
            clearPartyCodeFromUrl();
          }}
          isJoining={busy}
          error={error}
        />
      );
    }

    return (
      <>
        <div className="relative mx-auto h-full min-h-0 w-2/3 max-w-full">
          <h1 className="absolute inset-x-0 -top-10 m-0 flex h-1/2 items-center justify-center text-center text-[clamp(2.75rem,14vw,5.5rem)] leading-[0.9] font-semibold text-foreground">
            Watchparty
          </h1>
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col gap-2">
            <input
              id="watchparty-name"
              className="m-0 box-border h-10 w-full border border-border bg-input/45 px-2.5 text-center text-sm text-foreground placeholder:text-center outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/70"
              value={displayName}
              onChange={(event) => dispatch({ type: "setDisplayName", value: event.target.value })}
              placeholder="Name eingeben"
              autoComplete="nickname"
              aria-label="Dein Name"
            />
            <button
              type="button"
              className={cn(
                controlButtonBase,
                controlButtonIdle,
                "min-h-11 w-full",
                (!nameReady || busy) && controlButtonDisabled,
              )}
              disabled={!nameReady || busy}
              onClick={() => dispatch({ type: "setOverlay", value: "join" })}
            >
              Watchparty beitreten
            </button>
            <button
              type="button"
              className={cn(
                controlButtonBase,
                controlButtonIdle,
                "min-h-11 w-full",
                (!nameReady || busy) && controlButtonDisabled,
              )}
              disabled={!nameReady || busy}
              onClick={() => void handleCreate()}
            >
              Neue Watchparty
            </button>
            {error && !overlay ? <p className="m-0 text-center text-sm text-emphasis">{error}</p> : null}
          </div>
        </div>

        {overlay === "create" && createdInviteUrl ? (
          <InviteLinkOverlay inviteUrl={createdInviteUrl} onClose={() => dispatch({ type: "setOverlay", value: "none" })} />
        ) : null}

        {overlay === "join" ? (
          <JoinOverlay
            inviteInput={inviteInput}
            onInviteInputChange={(value) => dispatch({ type: "setInviteInput", value })}
            onJoin={() => void handleJoin()}
            onClose={() => {
              dispatch({ type: "setOverlay", value: "none" });
              dispatch({ type: "setError", value: null });
            }}
            isJoining={busy}
            error={error}
          />
        ) : null}
      </>
    );
  }

  const selectedMember = members?.find((member) => member.userId === selectedUserId);
  const personalState =
    memberVoteState && selectedUserId
      ? { ...createDefaultVoteState(songs), ...memberVoteState, schemaVersion: 1 as const }
      : null;

  return (
    <m.div className="grid gap-4">
      {overlay === "create" && createdInviteUrl ? (
        <InviteLinkOverlay inviteUrl={createdInviteUrl} onClose={() => dispatch({ type: "setOverlay", value: "none" })} />
      ) : null}

      <WatchpartyMemberBar
        members={members ?? []}
        currentUserId={session.userId}
        selectedMember={selectedMember ?? null}
        onSelectMember={(userId) => dispatch({ type: "setSelectedUserId", value: userId })}
        onBack={() => dispatch({ type: "setSelectedUserId", value: null })}
      />

      {selectedUserId && selectedMember ? (
        personalState ? (
          <ReadOnlyRankedList songs={songs} state={personalState} />
        ) : (
          <p className="m-0 text-sm text-muted-foreground">Lade Wertung…</p>
        )
      ) : (
        <WatchpartyRankingList songs={songs} sessionToken={sessionToken} />
      )}
    </m.div>
  );
}
