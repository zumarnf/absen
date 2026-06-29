import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Provide a valid signing secret BEFORE any code reads it. getJwtSecret()
// reads process.env lazily (at call time), so setting it here is sufficient
// and keeps the fail-fast secret validation intact.
process.env.JWT_SECRET =
  "test_only_jwt_secret_value_at_least_32_chars_long";
process.env.JWT_EXPIRE = "1d";
process.env.NODE_ENV = "test";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  // Clean every collection between tests for full isolation.
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
