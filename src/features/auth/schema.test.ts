import { describe, it, expect } from "vitest";
import { loginSchema, createUserSchema } from "./schema";

describe("loginSchema", () => {
  it("accepts a valid username/password", () => {
    const result = loginSchema.safeParse({ username: "alice", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects a too-short username", () => {
    const result = loginSchema.safeParse({ username: "ab", password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short password", () => {
    const result = loginSchema.safeParse({ username: "alice", password: "123" });
    expect(result.success).toBe(false);
  });
});

describe("createUserSchema", () => {
  it("accepts a valid lowercase username", () => {
    const result = createUserSchema.safeParse({
      username: "new_user1",
      password: "secret123",
      nama: "New User",
      role: "user",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a username with uppercase or spaces", () => {
    const result = createUserSchema.safeParse({
      username: "New User",
      password: "secret123",
      nama: "New User",
      role: "user",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid role", () => {
    const result = createUserSchema.safeParse({
      username: "valid_user",
      password: "secret123",
      nama: "Valid User",
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });
});
