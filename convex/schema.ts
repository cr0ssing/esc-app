import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { voteStateValidator } from "./lib/voteState";

export default defineSchema({
  watchparties: defineTable({
    inviteCode: v.string(),
    createdAt: v.number(),
  }).index("by_inviteCode", ["inviteCode"]),

  members: defineTable({
    watchpartyId: v.id("watchparties"),
    userId: v.string(),
    displayName: v.string(),
    voteState: voteStateValidator,
    updatedAt: v.number(),
  })
    .index("by_watchparty", ["watchpartyId"])
    .index("by_watchparty_user", ["watchpartyId", "userId"]),

  sessions: defineTable({
    token: v.string(),
    userId: v.string(),
    watchpartyId: v.id("watchparties"),
    createdAt: v.number(),
  }).index("by_token", ["token"]),
});
