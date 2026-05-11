import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

dotenv.config();

// Import models
import User from "../models/User.js";
import Subreddit from "../models/Subreddit.js";
import Thread from "../models/Thread.js";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to generate timestamps across the last 60 days
function getRandomDateInLast60Days() {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  return new Date(
    sixtyDaysAgo.getTime() +
      Math.random() * (now.getTime() - sixtyDaysAgo.getTime()),
  );
}

// Helper to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...\n");

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI environment variable is not set in .env file",
      );
    }

    console.log(
      `📡 Connecting to MongoDB at ${mongoUri.split("@")[1] || mongoUri}...`,
    );
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Subreddit.deleteMany({});
    await Thread.deleteMany({});
    console.log("✅ Existing data cleared\n");

    // Load user data from JSON file
    console.log("👥 Seeding users...");
    const usersPath = path.join(__dirname, "../data/users.json");
    const usersData = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

    const createdUsers = await User.insertMany(
      usersData.map((user) => ({
        ...user,
        createdAt: getRandomDateInLast60Days(),
      })),
    );
    console.log(`✅ Created ${createdUsers.length} users`);
    const userIds = createdUsers.map((u) => u._id);

    // Load subreddit data from JSON file
    console.log("\n🌍 Seeding subreddits...");
    const subredditsPath = path.join(__dirname, "../data/subreddits.json");
    const subredditsData = JSON.parse(fs.readFileSync(subredditsPath, "utf-8"));

    const createdSubreddits = await Subreddit.insertMany(
      subredditsData.map((subreddit) => ({
        name: subreddit.name,
        description: subreddit.description,
        author: userIds[subreddit.authorIndex],
        createdAt: getRandomDateInLast60Days(),
      })),
    );
    console.log(`✅ Created ${createdSubreddits.length} subreddits`);
    const subredditIds = createdSubreddits.map((s) => s._id);

    // Load thread data from JSON file
    console.log("\n💬 Seeding threads...");
    const threadsPath = path.join(__dirname, "../data/threads.json");
    const threadsData = JSON.parse(fs.readFileSync(threadsPath, "utf-8"));

    const createdThreads = await Thread.insertMany(
      threadsData.map((thread) => ({
        title: thread.title,
        content: thread.content,
        author: userIds[thread.authorIndex],
        subreddit: subredditIds[thread.subredditIndex],
        upvotes: thread.upvotes,
        downvotes: thread.downvotes,
        voteCount: thread.upvotes - thread.downvotes,
        createdAt: getRandomDateInLast60Days(),
      })),
    );
    console.log(`✅ Created ${createdThreads.length} threads`);

    // Summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Database seeding completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 Summary:`);
    console.log(`   • Users:       ${createdUsers.length}`);
    console.log(`   • Subreddits:  ${createdSubreddits.length}`);
    console.log(`   • Threads:     ${createdThreads.length}`);
    console.log(
      `   • Total docs:  ${createdUsers.length + createdSubreddits.length + createdThreads.length}`,
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
