import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import { clearSessionToken, getSessionToken, setSessionToken } from "../lib/sessionCookie";

export function useWatchpartySession() {
  const [sessionToken, setSessionTokenState] = useState<string | null>(() => getSessionToken());
  const session = useQuery(api.watchparties.getMySession, sessionToken ? { sessionToken } : "skip");

  const createWatchparty = useMutation(api.watchparties.createWatchparty);
  const joinWatchparty = useMutation(api.watchparties.joinWatchparty);
  const leaveWatchpartyMutation = useMutation(api.watchparties.leaveWatchparty);

  const isLoading = sessionToken !== null && session === undefined;
  const isActive = session !== null && session !== undefined;

  const persistSession = useCallback((token: string) => {
    setSessionToken(token);
    setSessionTokenState(token);
  }, []);

  const leaveWatchparty = useCallback(async () => {
    if (sessionToken) {
      await leaveWatchpartyMutation({ sessionToken });
    }
    clearSessionToken();
    setSessionTokenState(null);
  }, [leaveWatchpartyMutation, sessionToken]);

  return useMemo(
    () => ({
      sessionToken,
      session: session ?? null,
      isLoading,
      isActive,
      createWatchparty,
      joinWatchparty,
      leaveWatchparty,
      persistSession,
    }),
    [sessionToken, session, isLoading, isActive, createWatchparty, joinWatchparty, leaveWatchparty, persistSession],
  );
}
