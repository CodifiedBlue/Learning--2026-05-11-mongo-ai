import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from "./models/User.js"
import Subreddit from './models/Subreddit.js';
import Thread from './models/Thread.js';

// Find user by email (diana@example.com)
async function query1() {
  const user = await User.findOne({ email: 'diana@example.com'})
  console.log('query1', user)
}

async function query2() {
  const subreddit = await Subreddit.findOne({ name: "programming" })
  const threads = await Thread.find({ subreddit: subreddit._id})
  console.log('query2', threads)
}

async function query3() {
  const user = await User.findOne({ name: 'Ethan' })
  const threads = await Thread
    .find({ author: user._id })
    .populate('subreddit')
  console.log('query3', threads)
}

async function query4() {
  // All unique user IDs from the 'author' field of all documents in the threads collection
  const authorIds = await Thread.distinct('author')
  // All users whose ids are in the array of authorIds
  const users = await User.find({ _id: { $in: authorIds } })
  console.log('query4', users)
}

async function query5 () {
  const threads = await Thread.find({ upvotes: { $gte: 2 } })
  console.log('query5', threads)
}

async function query6 () {
  const date = new Date('2024-01-01')
  const threads = await Thread.find({
    createdAt: { $gte: date }
  })
  console.log('query6', threads)
}

async function query7 () {
  const subreddit = await Subreddit.findOne({ name: 'devops' })
  const author = await User.findOne({ name: 'Ethan' })

  const thread = await Thread.create({
    subreddit: subreddit._id,
    author: author._id,
    title: 'test',
    content: 'test',
    upvotes: 0,
    downvotes: 0,
    voteCount: 0,
    createdAt: new Date()
  })
  console.log('query7', thread)
}

async function query8 () {
  const thread = await Thread.findOne({ title: "Docker and kubernetes?" })
  if (!thread) {
    // throw new Error('Thread not found')
    console.warn('Thread not found, skipping query8')
    return
  }
  thread.title = 'update test'
  await thread.save()
  console.log('query8', thread)
}

async function query9 () {
  const user = await User.findOne({ name: 'Ethan' })
  const result = await Thread.deleteMany({ author: user._id })
  console.log('query9', result)
}

async function query10 () {
  const subreddits = await Subreddit.find()
  for (const subreddit of subreddits) {
    await Thread.deleteMany({ subreddit: subreddit._id })
    await subreddit.deleteOne()
  }
  console.log('query10 complete')
}

async function query11 () {
  const result = await Thread.aggregate([
    { $group: { _id: "$author", count: { $sum: 1 } } }
  ])
  console.log('query11', result)
}

async function query12 () {
  const result = await Thread.aggregate([
    { $group: { _id: "$author", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ])
  console.log('query12', result)
}


// more queries

async function runQueries() {
    // Uncomment the query you want to run
    // await query1();
    // await query2();
    // await query3();
    // await query4();
    // await query5();
    // await query6();
    // await query7();
    // await query8();
    // await query9();
    // await query10();
    await query11();
    await query12()
    // more
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