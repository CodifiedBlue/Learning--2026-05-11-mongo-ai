import mongoose from "mongoose";
import User from "../models/User.js";
import Subreddit from "../models/Subreddit.js";
import Thread from "../models/Thread.js";
import dotenv from "dotenv";

dotenv.config();

// Test utilities
let passedTests = 0;
let failedTests = 0;

function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`✓ ${testName}`);
    passedTests++;
  } else {
    console.log(`✗ ${testName} - Expected: ${expected}, Got: ${actual}`);
    failedTests++;
  }
}

function assertExists(value, testName) {
  if (value !== null && value !== undefined) {
    console.log(`✓ ${testName}`);
    passedTests++;
  } else {
    console.log(`✗ ${testName} - Value does not exist`);
    failedTests++;
  }
}

function assertNotExists(value, testName) {
  if (value === null || value === undefined) {
    console.log(`✓ ${testName}`);
    passedTests++;
  } else {
    console.log(`✗ ${testName} - Value should not exist`);
    failedTests++;
  }
}

function assert(condition, testName) {
  if (condition) {
    console.log(`✓ ${testName}`);
    passedTests++;
  } else {
    console.log(`✗ ${testName}`);
    failedTests++;
  }
}

// Main test suite
async function runTests() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI environment variable is not set in .env file",
      );
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB\n");

    // Clear collections
    await User.deleteMany({});
    await Subreddit.deleteMany({});
    await Thread.deleteMany({});

    console.log("=== USER CRUD TESTS ===\n");

    // TEST 1: Create a new user
    const user1 = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
    assertExists(user1._id, "Test 1: Create user successfully");

    // TEST 2: Find user by ID
    const foundUser = await User.findById(user1._id);
    assertEqual(foundUser.name, "John Doe", "Test 2: Find user by ID");

    // TEST 3: Find user by email
    const userByEmail = await User.findOne({ email: "john@example.com" });
    assertEqual(
      userByEmail.email,
      "john@example.com",
      "Test 3: Find user by email",
    );

    // TEST 4: Update user name
    const updatedUser = await User.findByIdAndUpdate(
      user1._id,
      { name: "Jane Doe" },
      { new: true },
    );
    assertEqual(updatedUser.name, "Jane Doe", "Test 4: Update user name");

    // TEST 5: Update user email
    const updatedUserEmail = await User.findByIdAndUpdate(
      user1._id,
      { email: "jane@example.com" },
      { new: true },
    );
    assertEqual(
      updatedUserEmail.email,
      "jane@example.com",
      "Test 5: Update user email",
    );

    // TEST 6: Create another user for relationship testing
    const user2 = await User.create({
      name: "Bob Smith",
      email: "bob@example.com",
      password: "password456",
    });
    assertExists(user2._id, "Test 6: Create second user");

    // TEST 7: Delete user by ID
    await User.findByIdAndDelete(user2._id);
    const deletedUser = await User.findById(user2._id);
    assertNotExists(deletedUser, "Test 7: Delete user and verify deletion");

    console.log("\n=== SUBREDDIT CRUD TESTS ===\n");

    // TEST 8: Create a new subreddit
    const subreddit1 = await Subreddit.create({
      name: "nodejs",
      description: "Node.js discussions",
      author: user1._id,
    });
    assertExists(subreddit1._id, "Test 8: Create subreddit successfully");

    // TEST 9: Find subreddit by ID
    const foundSubreddit = await Subreddit.findById(subreddit1._id);
    assertEqual(foundSubreddit.name, "nodejs", "Test 9: Find subreddit by ID");

    // TEST 10: Find subreddit by name
    const subredditByName = await Subreddit.findOne({ name: "nodejs" });
    assertEqual(
      subredditByName.description,
      "Node.js discussions",
      "Test 10: Find subreddit by name",
    );

    // TEST 11: Update subreddit description
    const updatedSubreddit = await Subreddit.findByIdAndUpdate(
      subreddit1._id,
      { description: "All about Node.js and JavaScript runtime" },
      { new: true },
    );
    assertEqual(
      updatedSubreddit.description,
      "All about Node.js and JavaScript runtime",
      "Test 11: Update subreddit description",
    );

    // TEST 12: Update subreddit name
    const updatedSubredditName = await Subreddit.findByIdAndUpdate(
      subreddit1._id,
      { name: "node" },
      { new: true },
    );
    assertEqual(
      updatedSubredditName.name,
      "node",
      "Test 12: Update subreddit name",
    );

    // TEST 13: Create another subreddit for deletion testing
    const subreddit2 = await Subreddit.create({
      name: "mongodb",
      description: "MongoDB discussions",
      author: user1._id,
    });
    assertExists(subreddit2._id, "Test 13: Create second subreddit");

    // TEST 14: Delete subreddit by ID
    await Subreddit.findByIdAndDelete(subreddit2._id);
    const deletedSubreddit = await Subreddit.findById(subreddit2._id);
    assertNotExists(
      deletedSubreddit,
      "Test 14: Delete subreddit and verify deletion",
    );

    console.log("\n=== THREAD CRUD TESTS ===\n");

    // TEST 15: Create a new thread
    const thread1 = await Thread.create({
      title: "Getting started with Node.js",
      content: "How to start learning Node.js",
      author: user1._id,
      subreddit: subreddit1._id,
    });
    assertExists(thread1._id, "Test 15: Create thread successfully");

    // TEST 16: Find thread by ID
    const foundThread = await Thread.findById(thread1._id)
      .populate("author")
      .populate("subreddit");
    assertEqual(
      foundThread.title,
      "Getting started with Node.js",
      "Test 16: Find thread by ID",
    );

    // TEST 17: Find threads by subreddit
    const threadsBySubreddit = await Thread.find({ subreddit: subreddit1._id });
    assert(threadsBySubreddit.length > 0, "Test 17: Find threads by subreddit");

    // TEST 18: Update thread title
    const updatedThread = await Thread.findByIdAndUpdate(
      thread1._id,
      { title: "Beginner Guide to Node.js" },
      { new: true },
    );
    assertEqual(
      updatedThread.title,
      "Beginner Guide to Node.js",
      "Test 18: Update thread title",
    );

    // TEST 19: Update thread upvotes
    const updatedThreadUpvotes = await Thread.findByIdAndUpdate(
      thread1._id,
      { upvotes: 42, voteCount: 42 },
      { new: true },
    );
    assertEqual(
      updatedThreadUpvotes.upvotes,
      42,
      "Test 19: Update thread upvotes",
    );

    // TEST 20: Delete thread by ID
    const thread2 = await Thread.create({
      title: "Advanced Node.js patterns",
      content: "Deep dive into Node.js patterns",
      author: user1._id,
      subreddit: subreddit1._id,
    });
    await Thread.findByIdAndDelete(thread2._id);
    const deletedThread = await Thread.findById(thread2._id);
    assertNotExists(
      deletedThread,
      "Test 20: Delete thread and verify deletion",
    );

    console.log("\n=== TEST SUMMARY ===");
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Total: ${passedTests + failedTests}`);

    if (failedTests === 0) {
      console.log("\n✓ All tests passed!");
    } else {
      console.log(`\n✗ ${failedTests} test(s) failed`);
    }
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Run the tests
runTests();
