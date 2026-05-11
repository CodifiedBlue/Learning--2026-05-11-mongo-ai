import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Subreddit from "./models/Subreddit.js";
import Thread from "./models/Thread.js";

// Find user by email (diana@example.com)
async function query1() {
  const user = await User.findOne({ email: "diana@example.com" });
  console.log("query1", user);
}

async function query2() {
  const subreddit = await Subreddit.findOne({ name: "programming" });
  const threads = await Thread.find({ subreddit: subreddit._id });
  console.log("query2", threads);
}

async function query3() {
  const user = await User.findOne({ name: "Ethan" });
  const threads = await Thread.find({ author: user._id }).populate("subreddit");
  console.log("query3", threads);
}

async function query4() {
  // All unique user IDs from the 'author' field of all documents in the threads collection
  const authorIds = await Thread.distinct("author");
  // All users whose ids are in the array of authorIds
  const users = await User.find({ _id: { $in: authorIds } });
  console.log("query4", users);
}

async function query5() {}

async function query6() {}

async function query7() {}

async function query8() {}

async function query9() {}

async function query10() {}

async function query11() {}

async function query12() {}

// more queries
async function runQueries() {
  // Uncomment the query you want to run
  // await query1();
  // await query2();
  // await query3();
  // await query4();
  await query5();
}

async function main() {
  try {
    dotenv.config();
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");
    await runQueries();
  } catch (err) {
    console.error("DB connection failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB");
  }
}

main();
