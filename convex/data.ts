import { query, mutation, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

async function theIdea(ctx : QueryCtx, id: Id<"ideas">) {
  const idea = await ctx.db.get("ideas", id);
  if (!idea) { throw new ConvexError("Idea not found."); }
  return idea;
}
async function theType(ctx : QueryCtx, id: Id<"types">) {
  const type = await ctx.db.get("types", id);
  if (!type) { throw new ConvexError("Type not found."); }
  return type;
}
async function theComment(ctx : QueryCtx, id: Id<"comments">) {
  const comment = await ctx.db.get("comments", id);
  if (!comment) { throw new ConvexError("Comment not found."); }
  return comment;
}
async function theAuthorName(ctx : QueryCtx, id: Id<"users">) {
  const user = await ctx.runQuery(api.users.get, {id: id});
  return user ? user.name : "";
}
async function addAuthorNames(ctx : QueryCtx, ar : Array<any>) {
  for (let i=0;i<ar.length;++i) {
    ar[i].authorname = await theAuthorName(ctx, ar[i].author);
  }
}
function niceTry() { throw new ConvexError("Nice try."); }

export const listIdeas = query({
  args: {}, async handler(ctx) {
    const ideas = await ctx.db.query("ideas").collect();
    await addAuthorNames(ctx, ideas);
    return ideas;
  }
})
export const getIdea = query({
  args: {id: v.id("ideas")}, async handler(ctx, {id}) {
    return await theIdea(ctx, id);
  }
})
export const upvoteIdea = mutation({
  args: {id: v.id("ideas")}, async handler(ctx, {id}) {
    const userId = await ctx.runQuery(api.users.getAuthId);
    const idea = await theIdea(ctx, id);
    if (idea.upvotesArray.includes(userId)) { niceTry(); }
    await ctx.db.patch("ideas", id, {
      upvotesArray: [...idea.upvotesArray, userId],
      upvotesTotal: BigInt(idea.upvotesArray.length + 1)});
  }
})
export const downvoteIdea = mutation({
  args: {id: v.id("ideas")}, async handler(ctx, {id}) {
    const userId = await ctx.runQuery(api.users.getAuthId);
    const idea = await theIdea(ctx, id);
    if (!idea.upvotesArray.includes(userId)) { niceTry(); }
    await ctx.db.patch("ideas", id, {
      upvotesArray: idea.upvotesArray.filter((v)=>v!==userId),
      upvotesTotal: BigInt(idea.upvotesArray.length - 1)});
  }
})
export const fetchTypes = query({
  args: {}, async handler(ctx) {
    const types = await ctx.db.query("types").collect();
    const map : Record<string, Id<"types">> = {};
    for (const type of types) { map[type.name] = type._id; }
    return map;
  }
})
export const ensureTypes = mutation({
  args: {names: v.array(v.string())}, async handler(ctx, {names}) {
    await ctx.runQuery(api.users.getAuthId);
    const types = await ctx.db.query("types").collect();
    const map : Record<string, Id<"types">> = {};
    for (const type of types) { map[type.name] = type._id; }
    for (const name of names) {
      if (!name) { niceTry(); }
      if (!map[name]) { map[name] = await ctx.db.insert("types", {name}); }
    }
    return map;
  }
})
export const fetchTopics = query({
  args: {}, async handler(ctx) {
    const topics = await ctx.db.query("topics").collect();
    const map : Record<string, Id<"topics">> = {};
    for (const topic of topics) { map[topic.name] = topic._id; }
    return map;
  }
})
export const addIdea = mutation({
  args: {
    parent: v.nullable(v.id("ideas")),
    title: v.string(),
    desc: v.string(),
    amend: v.string(),
    type: v.id("types"),
  },
  async handler(ctx, {parent, title, desc, amend, type}) {
    const userId = await ctx.runQuery(api.users.getAuthId);
    if (parent) { await theIdea(ctx, parent); } await theType(ctx, type);
    if (!title || !desc || !amend) { niceTry(); }

    let parentId : null | Id<"ideas"> = parent;
    let cnt = 0n;
    while (parentId) {
      const parentData : any = await ctx.db.get("ideas", parentId);
      if (!parentData) { break; }
      await ctx.db.patch("ideas", parentId, { nodesTotal: parentData.nodesTotal + 1n });
      parentId = parentData.parent;
      ++cnt;
    }
    const add = await ctx.db.insert("ideas", {
      author: userId, break: Date.now(), type: type,
      parent, title, desc,
      upvotesTotal: 0n, upvotesArray: [], nodesPrev: cnt, nodesTotal: cnt+1n, amendsTotal: 0n,
    })
    await ctx.db.insert("amends", {author: userId, idea: add, text: amend, inspoComments: []});

    return 1;
  }
})
export const allComments = query({
  args: {idea: v.id("ideas")}, async handler(ctx, {idea}) {
    await theIdea(ctx, idea);
    const comments = await ctx.db.query("comments").withIndex("idea", (v)=>v.eq("idea", idea)).collect();
    await addAuthorNames(ctx, comments);
    return comments;
  }
})
export const addComment = mutation({
  args: {idea: v.id("ideas"), comment: v.nullable(v.id("comments")), text: v.string(), isProject: v.boolean()},
  async handler(ctx, {idea, comment, text, isProject}) {
    await theIdea(ctx, idea);
    if (comment) { await theComment(ctx, comment); }
    if (!text) { niceTry(); }
    const userId = await ctx.runQuery(api.users.getAuthId);
    await ctx.db.insert("comments", {
      author: userId, idea: idea, upvotesTotal: 0n, upvotesArray: [],
      isProject: isProject, text: text, parent: comment,
    });
  }
})







