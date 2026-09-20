import assert from "node:assert/strict";
import test from "node:test";
import { getVideoById } from "../src/service/video.service.js";

test("getVideoById rejects an empty video ID", async () => {
  await assert.rejects(getVideoById(""), (error: unknown) => {
    assert.strictEqual(
      error && typeof error === "object" && "code" in error ? error.code : undefined,
      "BAD_REQUEST",
    );
    assert.strictEqual(
      error && typeof error === "object" && "message" in error
        ? error.message
        : undefined,
      "Video ID is required",
    );
    return true;
  });
});
