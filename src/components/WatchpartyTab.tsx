import { useMutation, useQuery } from "convex/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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

  const [displayName, setDisplayName] = useState(session?.displayName ?? "");
  const [overlay, setOverlay] = useState<OverlayMode>(initialPartyCode ? "joinFromLink" : "none");
  const [inviteInput, setInviteInput] = useState(initialPartyCode ?? "");
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const members = useQuery(api.watchparties.getWatchpartyMembers, isActive && sessionToken ? { sessionToken } : "skip");
  const memberVoteState = useQuery(
    api.watchparties.getMemberVoteState,
    isActive && sessionToken && selectedUserId ? { sessionToken, targetUserId: selectedUserId } : "skip",
  );

  const nameReady = displayName.trim().length > 0;

  const wasActiveRef = useRef(isActive);
  useEffect(() => {
    if (wasActiveRef.current && !isActive && !isLoading) {
      setOverlay("none");
      setCreatedInviteUrl(null);
      setError(null);
      setSelectedUserId(null);
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
    setBusy(true);
    setError(null);
    try {
      const result = await onCreate({
        displayName: displayName.trim(),
        initialVoteState: voteState,
      });
      onPersistSession(result.sessionToken);
      await pushLocalVotesIfNeeded(result.sessionToken);
      setCreatedInviteUrl(buildInviteUrl(result.inviteCode));
      setOverlay("create");
      clearPartyCodeFromUrl();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Watchparty konnte nicht erstellt werden");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    setBusy(true);
    setError(null);
    try {
      const result = await onJoin({
        inviteInput,
        displayName: displayName.trim(),
        initialVoteState: voteState,
      });
      onPersistSession(result.sessionToken);
      await pushLocalVotesIfNeeded(result.sessionToken);
      setOverlay("none");
      clearPartyCodeFromUrl();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Beitritt fehlgeschlagen");
    } finally {
      setBusy(false);
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
          onDisplayNameChange={setDisplayName}
          onJoin={() => void handleJoin()}
          onClose={() => {
            setOverlay("none");
            setError(null);
            clearPartyCodeFromUrl();
          }}
          isJoining={busy}
          error={error}
        />
      );
    }

    return (
      <>
        <motion.div className="mx-auto flex min-h-[calc(100dvh-11rem)] w-2/3 max-w-full flex-col justify-center gap-2">
          <input
            id="watchparty-name"
            className="m-0 box-border h-10 w-full border border-border bg-input/45 px-2.5 text-center text-sm text-foreground placeholder:text-center outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/70"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
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
            onClick={() => setOverlay("join")}
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
        </motion.div>

        {overlay === "create" && createdInviteUrl ? (
          <InviteLinkOverlay inviteUrl={createdInviteUrl} onClose={() => setOverlay("none")} />
        ) : null}

        {overlay === "join" ? (
          <JoinOverlay
            inviteInput={inviteInput}
            onInviteInputChange={setInviteInput}
            onJoin={() => void handleJoin()}
            onClose={() => {
              setOverlay("none");
              setError(null);
            }}
            isJoining={busy}
            error={error}
          />
        ) : null}
      </>
    );
  }

  const selectedMember = members?.find((m) => m.userId === selectedUserId);
  const personalState =
    memberVoteState && selectedUserId
      ? { ...createDefaultVoteState(songs), ...memberVoteState, schemaVersion: 1 as const }
      : null;

  return (
    <motion.div className="grid gap-4">
      {overlay === "create" && createdInviteUrl ? (
        <InviteLinkOverlay inviteUrl={createdInviteUrl} onClose={() => setOverlay("none")} />
      ) : null}

      <WatchpartyMemberBar
        members={members ?? []}
        currentUserId={session.userId}
        selectedMember={selectedMember ?? null}
        onSelectMember={setSelectedUserId}
        onBack={() => setSelectedUserId(null)}
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
    </motion.div>
  );
}
