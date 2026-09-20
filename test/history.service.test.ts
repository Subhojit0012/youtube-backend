import assert from "node:assert/strict";
import test from "node:test";
import { History } from "../src/db/models/history.model.js";
import { getHistory } from "../src/service/history.service.js";

test("getHistory returns an empty list when no history exists", async (t) => {
  t.mock.method(History, "findOne", async () => null);

  const history = await getHistory("user-id");

  assert.deepStrictEqual(history, []);
});
