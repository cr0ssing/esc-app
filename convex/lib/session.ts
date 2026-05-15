import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel, Id } from "../_generated/dataModel";

type ReadCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;
type WriteCtx = GenericMutationCtx<DataModel>;

const INVITE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateInviteCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => INVITE_ALPHABET[b % INVITE_ALPHABET.length]).join("");
}

export type SessionInfo = {
  sessionId: Id<"sessions">;
  token: string;
  userId: string;
  watchpartyId: Id<"watchparties">;
};

export async function getSessionByToken(ctx: ReadCtx, token: string) {
  return await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
}

export async function requireSession(ctx: ReadCtx, token: string): Promise<SessionInfo> {
  const session = await getSessionByToken(ctx, token);
  if (!session) {
    throw new Error("Ungültige Sitzung");
  }
  return {
    sessionId: session._id,
    token: session.token,
    userId: session.userId,
    watchpartyId: session.watchpartyId,
  };
}

export async function requireMember(ctx: ReadCtx, session: SessionInfo) {
  const member = await ctx.db
    .query("members")
    .withIndex("by_watchparty_user", (q) =>
      q.eq("watchpartyId", session.watchpartyId).eq("userId", session.userId),
    )
    .unique();

  if (!member) {
    throw new Error("Mitglied nicht gefunden");
  }

  return member;
}

export async function assertNotInWatchparty(ctx: ReadCtx, token: string | undefined) {
  if (!token) {
    return;
  }
  const existing = await getSessionByToken(ctx, token);
  if (existing) {
    throw new Error("Du bist bereits in einer Watchparty");
  }
}

export async function deleteSessionAndMember(ctx: WriteCtx, session: SessionInfo) {
  const member = await ctx.db
    .query("members")
    .withIndex("by_watchparty_user", (q) =>
      q.eq("watchpartyId", session.watchpartyId).eq("userId", session.userId),
    )
    .unique();

  if (member) {
    await ctx.db.delete(member._id);
  }
  await ctx.db.delete(session.sessionId);
}
