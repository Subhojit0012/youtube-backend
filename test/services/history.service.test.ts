import { describe, expect, it, vi } from "vitest";
import { History } from "../../src/db/models/history.model.js";
import { addToHistory, getHistory } from "../../src/service/history.service.js";

describe("history service", () => {
  it("creates history for a user without existing history", async () => {
    vi.spyOn(History, "findOne").mockResolvedValue(null);
    const save = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(History.prototype, "save").mockImplementation(save);

    await addToHistory("user-id", "video-id");

    expect(save).toHaveBeenCalled();
  });

  it("moves an existing video to the front", async () => {
    const history = {
      videoId: ["older", "video-id"],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(History, "findOne").mockResolvedValue(history as never);

    await addToHistory("user-id", "video-id");

    expect(history.videoId).toEqual(["video-id", "older"]);
    expect(history.save).toHaveBeenCalled();
  });

  it("returns an empty history for a new user", async () => {
    vi.spyOn(History, "findOne").mockReturnValue({
      populate: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(getHistory("user-id")).resolves.toEqual([]);
  });
});
