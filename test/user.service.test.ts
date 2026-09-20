import assert from "node:assert/strict";
import test from "node:test";
import { createUser, login } from "../src/service/user.service.js";

test("createUser rejects missing required fields", async () => {
  await assert.rejects(
    createUser({ email: "", name: "", password: "" }),
    (error: unknown) => {
      assert.strictEqual(
        error && typeof error === "object" && "code" in error
          ? error.code
          : undefined,
        "BAD_REQUEST",
      );
      assert.strictEqual(
        error && typeof error === "object" && "message" in error
          ? error.message
          : undefined,
        "Missing required fields",
      );
      return true;
    },
  );
});

test("login rejects missing email or password", async () => {
  await assert.rejects(
    login({ email: "", password: "" }),
    (error: unknown) => {
      assert.strictEqual(
        error && typeof error === "object" && "code" in error
          ? error.code
          : undefined,
        "BAD_REQUEST",
      );
      assert.strictEqual(
        error && typeof error === "object" && "message" in error
          ? error.message
          : undefined,
        "Email and password are required",
      );
      return true;
    },
  );
});