import { v } from "convex/values";
import { type MutationCtx, mutation, query } from "./_generated/server";
import {
  assertNotInWatchparty,
  deleteSessionAndMember,
  generateId,
  generateInviteCode,
  generateToken,
  getSessionByToken,
  requireMember,
  requireSession,
} from "./lib/session";
import { emptyVoteState, voteActivityToken, voteStateValidator, type VoteStateValue } from "./lib/voteState";

const sessionTokenArg = v.string();

const sessionInfoValidator = v.object({
  watchpartyId: v.id("watchparties"),
  userId: v.string(),
  displayName: v.string(),
  inviteCode: v.string(),
});

const createJoinResultValidator = v.object({
  sessionToken: v.string(),
  userId: v.string(),
  inviteCode: v.string(),
});

const memberSummaryValidator = v.object({
  userId: v.string(),
  displayName: v.string(),
  updatedAt: v.number(),
  voteSignature: v.string(),
});

const aggregateEntryValidator = v.object({
  songId: v.string(),
  totalPoints: v.number(),
});

async function uniqueInviteCode(ctx: MutationCtx) {
  const candidates = Array.from({ length: 10 }, () => generateInviteCode());
  const lookups = await Promise.all(
    candidates.map((inviteCode) =>
      ctx.db
        .query("watchparties")
        .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
        .unique(),
    ),
  );

  const available = candidates.find((_, index) => !lookups[index]);
  if (available) {
    return available;
  }

  throw new Error("Invite-Code konnte nicht erzeugt werden");
}

function parseInviteCodeFromInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Invite-Link oder Code fehlt");
  }

  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("party");
    if (fromQuery) {
      return fromQuery.trim().toUpperCase();
    }
    const pathPart = url.pathname.split("/").filter(Boolean).at(-1);
    if (pathPart) {
      return pathPart.trim().toUpperCase();
    }
  } catch {
    // Not a URL — treat as raw code
  }

  return trimmed.toUpperCase();
}

function mergeInitialVoteState(initial: VoteStateValue | undefined): VoteStateValue {
  if (!initial) {
    return emptyVoteState();
  }
  return initial;
}

export const createWatchparty = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    displayName: v.string(),
    initialVoteState: v.optional(voteStateValidator),
  },
  returns: createJoinResultValidator,
  handler: async (ctx, args) => {
    const displayName = args.displayName.trim();
    if (!displayName) {
      throw new Error("Name fehlt");
    }

    await assertNotInWatchparty(ctx, args.sessionToken);

    const inviteCode = await uniqueInviteCode(ctx);
    const watchpartyId = await ctx.db.insert("watchparties", {
      inviteCode,
      createdAt: Date.now(),
    });

    const userId = generateId();
    const token = generateToken();
    const voteState = mergeInitialVoteState(args.initialVoteState);

    await ctx.db.insert("members", {
      watchpartyId,
      userId,
      displayName,
      voteState,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("sessions", {
      token,
      userId,
      watchpartyId,
      createdAt: Date.now(),
    });

    return { sessionToken: token, userId, inviteCode };
  },
});

export const joinWatchparty = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    inviteInput: v.string(),
    displayName: v.string(),
    initialVoteState: v.optional(voteStateValidator),
  },
  returns: createJoinResultValidator,
  handler: async (ctx, args) => {
    const displayName = args.displayName.trim();
    if (!displayName) {
      throw new Error("Name fehlt");
    }

    await assertNotInWatchparty(ctx, args.sessionToken);

    const inviteCode = parseInviteCodeFromInput(args.inviteInput);
    const watchparty = await ctx.db
      .query("watchparties")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
      .unique();

    if (!watchparty) {
      throw new Error("Watchparty nicht gefunden");
    }

    const userId = generateId();
    const token = generateToken();
    const voteState = mergeInitialVoteState(args.initialVoteState);

    await ctx.db.insert("members", {
      watchpartyId: watchparty._id,
      userId,
      displayName,
      voteState,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("sessions", {
      token,
      userId,
      watchpartyId: watchparty._id,
      createdAt: Date.now(),
    });

    return { sessionToken: token, userId, inviteCode: watchparty.inviteCode };
  },
});

export const leaveWatchparty = mutation({
  args: { sessionToken: sessionTokenArg },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await requireSession(ctx, args.sessionToken);
    await deleteSessionAndMember(ctx, session);
    return null;
  },
});

export const getMySession = query({
  args: { sessionToken: sessionTokenArg },
  returns: v.union(sessionInfoValidator, v.null()),
  handler: async (ctx, args) => {
    const session = await getSessionByToken(ctx, args.sessionToken);
    if (!session) {
      return null;
    }

    const watchparty = await ctx.db.get(session.watchpartyId);
    if (!watchparty) {
      return null;
    }

    const member = await requireMember(ctx, {
      sessionId: session._id,
      token: session.token,
      userId: session.userId,
      watchpartyId: session.watchpartyId,
    });

    return {
      watchpartyId: session.watchpartyId,
      userId: session.userId,
      displayName: member.displayName,
      inviteCode: watchparty.inviteCode,
    };
  },
});

export const getMyVoteState = query({
  args: { sessionToken: sessionTokenArg },
  returns: v.union(
    v.object({
      voteState: voteStateValidator,
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const session = await requireSession(ctx, args.sessionToken);
    const member = await requireMember(ctx, session);
    return {
      voteState: member.voteState,
      updatedAt: member.updatedAt,
    };
  },
});

export const updateVoteState = mutation({
  args: {
    sessionToken: sessionTokenArg,
    voteState: voteStateValidator,
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const session = await requireSession(ctx, args.sessionToken);
    const member = await requireMember(ctx, session);
    const updatedAt = Date.now();
    await ctx.db.patch(member._id, {
      voteState: args.voteState,
      updatedAt,
    });
    return updatedAt;
  },
});

export const getWatchpartyMembers = query({
  args: { sessionToken: sessionTokenArg },
  returns: v.array(memberSummaryValidator),
  handler: async (ctx, args) => {
    const session = await requireSession(ctx, args.sessionToken);
    await requireMember(ctx, session);

    const members = await ctx.db
      .query("members")
      .withIndex("by_watchparty", (q) => q.eq("watchpartyId", session.watchpartyId))
      .collect();

    return members.map((m) => ({
      userId: m.userId,
      displayName: m.displayName,
      updatedAt: m.updatedAt,
      voteSignature: voteActivityToken(m.voteState),
    }));
  },
});

export const getMemberVoteState = query({
  args: {
    sessionToken: sessionTokenArg,
    targetUserId: v.string(),
  },
  returns: v.union(voteStateValidator, v.null()),
  handler: async (ctx, args) => {
    const session = await requireSession(ctx, args.sessionToken);
    await requireMember(ctx, session);

    const target = await ctx.db
      .query("members")
      .withIndex("by_watchparty_user", (q) =>
        q.eq("watchpartyId", session.watchpartyId).eq("userId", args.targetUserId),
      )
      .unique();

    return target?.voteState ?? null;
  },
});

export const getWatchpartyAggregate = query({
  args: { sessionToken: sessionTokenArg },
  returns: v.array(aggregateEntryValidator),
  handler: async (ctx, args) => {
    const session = await requireSession(ctx, args.sessionToken);
    await requireMember(ctx, session);

    const members = await ctx.db
      .query("members")
      .withIndex("by_watchparty", (q) => q.eq("watchpartyId", session.watchpartyId))
      .collect();

    const totals = new Map<string, number>();

    for (const member of members) {
      for (const [songId, points] of Object.entries(member.voteState.pointsBySongId)) {
        if (points === null) {
          continue;
        }
        totals.set(songId, (totals.get(songId) ?? 0) + points);
      }
    }

    return [...totals.entries()]
      .map(([songId, totalPoints]) => ({ songId, totalPoints }))
      .toSorted((a, b) => b.totalPoints - a.totalPoints);
  },
});
