import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.string(),
    image: v.nullable(v.int64()), // lookup between set avatars for now
    fallbackHue: v.int64(),       // just a number between 0-360
    bio: v.string(),

    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  })
    .index("email", ["email"]) // convex
    .index("phone", ["phone"]) // convex
  ,

  types: defineTable({
    name: v.string(),
  }),
  topics: defineTable({
    name: v.string(),
  }),
  topicidea: defineTable({
    topic: v.id("topics"),
    ideas: v.id("ideas"),
  })
    .index("topic", ["topic"])
  ,

  ideas: defineTable({
    author: v.id("users"),
    parent: v.nullable(v.id("ideas")),
    break: v.number(), // date/time

    type: v.id("types"),

    title: v.string(),
    desc: v.string(),

    amendsTotal: v.int64(),
    nodesPrev: v.int64(),
    nodesTotal: v.int64(),
    upvotesTotal: v.int64(),
    upvotesArray: v.array(v.id("users")),
  })
    .index("author", ["author"])
    .index("parent", ["parent"])
  ,

  comments: defineTable({
    author: v.id("users"),
    idea: v.id("ideas"),
    upvotesTotal: v.int64(),
    upvotesArray: v.array(v.id("users")),

    isProject: v.boolean(),
    isKicked: v.boolean(),
    text: v.string(),
  })
    .index("idea", ["idea"])
  ,

  amends: defineTable({
    author: v.id("users"),
    idea: v.id("ideas"),
    text: v.string(),
    inspoComments: v.array(v.id("comments")),
    inspoQomments: v.array(v.id("qomments")),
  })
    .index("idea", ["idea"])
  ,

  qomments: defineTable({
    author: v.id("users"),
    comment: v.id("comments"),
    upvotesTotal: v.int64(),
    upvotesArray: v.array(v.id("users")),

    text: v.string(),
    isEdit: v.boolean(),
  })
    .index("comment", ["comment"]),
});
