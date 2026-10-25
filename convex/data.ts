import { query, mutation, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { theAuthUserId, theUser } from "./users";

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
  const user = await theUser(ctx, id);
  return user ? user.name : "";
}
async function theBough(ctx: QueryCtx, id: Id<"boughs">) {
  const bough = await ctx.db.get("boughs", id);
  if (!bough) { throw new ConvexError("Bough not found."); }
  return bough;
}
async function addAuthorNames(ctx : QueryCtx, ar : Array<any>) {
  for (let i=0;i<ar.length;++i) {
    ar[i].authorname = await theAuthorName(ctx, ar[i].author);
  }
}
async function addImageUrls(ctx : QueryCtx, ar : Array<any>) {
  for (let i=0;i<ar.length;++i) {
    const urls = await Promise.all((ar[i].images ?? []).map((id : Id<"_storage">)=>ctx.storage.getUrl(id)));
    ar[i].imageUrls = urls.filter((u)=>u);
  }
}
function niceTry() { throw new ConvexError("Nice try."); }

export const listIdeas = query({
  args: {}, async handler(ctx) {
    const ideas = await ctx.db.query("ideas").collect();
    await addAuthorNames(ctx, ideas);
    await addImageUrls(ctx, ideas);
    return ideas;
  }
})
export const getIdea = query({
  args: {id: v.id("ideas")}, async handler(ctx, {id}) {
    const idea = await theIdea(ctx, id);
    return {...idea, authorname: await theAuthorName(ctx, idea.author)};
  }
})
export const upvoteIdea = mutation({
  args: {id: v.id("ideas")}, async handler(ctx, {id}) {
    const userId = await theAuthUserId(ctx)
    const idea = await theIdea(ctx, id);
    if (idea.upvotesArray.includes(userId)) { niceTry(); }
    await ctx.db.patch("ideas", id, {
      upvotesArray: [...idea.upvotesArray, userId],
      upvotesTotal: BigInt(idea.upvotesArray.length + 1)});
  }
})
export const downvoteIdea = mutation({
  args: {id: v.id("ideas")}, async handler(ctx, {id}) {
    const userId = await theAuthUserId(ctx);
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
    init: v.string(),
    type: v.id("types"),
    images: v.optional(v.array(v.id("_storage"))),
  },
  async handler(ctx, {parent, title, desc, init, type, images}) {
    const userId = await ctx.runQuery(api.users.getAuthId);

    let b : null | Id<"boughs"> = null;
    let pData : any = null;
    if (parent) { pData = await theIdea(ctx, parent); b = pData.bough; } await theType(ctx, type);
    if (!title || !desc || !init) { niceTry(); }

    let parentId : null | Id<"ideas"> = parent;
    let cnt = 0n;
    while (parentId) {
      const parentData : any = await ctx.db.get("ideas", parentId);
      if (!parentData) { break; }
      await ctx.db.patch("ideas", parentId, { nodesTotal: parentData.nodesTotal + 1n });
      parentId = parentData.parent;
      ++cnt;
    }
    if (!b) {
      b = await ctx.db.insert("boughs", {});
    }

    const add = await ctx.db.insert("ideas", {
      author: userId, break: Date.now(), type: type, bough: b, init: init,
      parent, title, desc,
      upvotesTotal: 0n, upvotesArray: [], nodesPrev: cnt, nodesTotal: cnt+1n, amendsTotal: 0n,
      images,
    })

    if (parent) {
      const bData = await theBough(ctx, b);
      if (!bData.json) { await ctx.db.patch("boughs", b, {json: `{"_id":"${parent}","name":"${pData.title}","children":[{"_id":"${add}","name":"${title}","children":[]}]}`}); return; }

      const data : any = JSON.parse(bData.json);

      function TRY(object : any) {
        if (object._id as Id<"ideas"> === parent) { return object; }
        for (const child of object.children) { // Invariant: "children": [] must always exist!
          const result : any = TRY(child);
          if (result === null) { continue; }
          return result;
        }
      }

      const newleaf = {_id: add, name: title, children:[]};
      TRY(data).children.push(newleaf);
      const newdata = JSON.stringify(data);

      await ctx.db.patch("boughs", b, {json: newdata});

    }
  }
})
export const getBough = query({
  args: {bough: v.id("boughs")}, async handler(ctx, {bough}) {
    return await theBough(ctx, bough);
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
export const addAmend = mutation({
  args: {idea: v.id("ideas"), text: v.string()}, async handler (ctx, {idea, text}) {
    await theIdea(ctx, idea);
    const author = await theAuthUserId(ctx);
    await ctx.db.insert("amends", {idea, text, author, inspoComments: []})
  }
})



export const generateUploadUrl = mutation({
  args: {}, async handler(ctx) {
    await ctx.runQuery(api.users.getAuthId);
    return await ctx.storage.generateUploadUrl();
  }
})
