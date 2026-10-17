import { QueryCtx, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

async function theAuthUserId(ctx : QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) { throw new ConvexError("Not authenticated."); }
  return userId;
}
async function theUser(ctx : QueryCtx, id: Id<"users">) {
  const user = await ctx.db.get("users", id);
  if (!user) { return new ConvexError("User not found."); }
  return user
}

export const get = query({
  args: {id: v.id("users")},
  async handler(ctx, {id}) {
    return await theUser(ctx, id);
  }
})
export const getAuthId = query({
  args: {},
  async handler(ctx) {
    return await theAuthUserId(ctx);
  }
})
export const getAuth = query({
  args: {},
  async handler(ctx) {
    return await theUser(ctx, await theAuthUserId(ctx));
  }
})
