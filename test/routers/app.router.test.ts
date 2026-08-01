import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { connectTestDatabase, clearTestDatabase, disconnectTestDatabase } from "../helpers/database.js";
import { createTestCaller } from "../helpers/caller.js";
import { User } from "../../src/db/models/user.model.js";
import { Video } from "../../src/db/models/video.model.js";
import { Playlist } from "../../src/db/models/playlist.model.js";

describe("app router server-side callers", () => {
  beforeAll(connectTestDatabase);
  beforeEach(clearTestDatabase);
  afterAll(disconnectTestDatabase);

  it("signs up and logs in a user", async () => {
    const caller = createTestCaller();

    await expect(
      caller.signup({
        name: "Test User",
        email: "user@example.com",
        password: "secret",
      }),
    ).resolves.toBeUndefined();

    await expect(
      caller.login({ email: "user@example.com", password: "secret" }),
    ).resolves.toEqual({ message: "Login successful" });
  });

  it("rejects protected calls without a token", async () => {
    await expect(createTestCaller().getHistory()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("returns the authenticated user's profile", async () => {
    const user = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "secret",
    });

    await expect(createTestCaller(user.id).profile(user.id)).resolves.toMatchObject({
      ctx: { email: "user@example.com" },
    });
  });

  it("updates and deletes a user through protected procedures", async () => {
    const user = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "secret",
    });
    const caller = createTestCaller(user.id);

    await expect(
      caller.update({
        name: "Updated User",
        email: user.email,
        password: user.password,
      }),
    ).resolves.toBeUndefined();

    await expect(caller.deleteUser(user.id)).resolves.toBeUndefined();
    await expect(User.findById(user.id)).resolves.toBeNull();
  });

  it("uploads and retrieves a video through the router", async () => {
    const user = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "secret",
    });
    const caller = createTestCaller(user.id);

    await expect(
      caller.upload({
        title: "Test video",
        description: "Description",
        videoFile: "video.mp4",
        thumbnail: "thumbnail.jpg",
      }),
    ).resolves.toEqual({ message: "Video uploaded successfully" });

    const video = await Video.findOne({ title: "Test video" });
    expect(video).not.toBeNull();
    expect(video!.owner?.toString()).toBe(user.id);
    await expect(caller.getVideoById(video!.id)).resolves.toMatchObject({
      title: "Test video",
    });
  });

  it("creates a playlist and adds a video for its owner", async () => {
    const user = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "secret",
    });
    const video = await Video.create({
      title: "Test video",
      videoFile: "video.mp4",
      thumbnail: "thumbnail.jpg",
      owner: user.id,
    });
    const caller = createTestCaller(user.id);

    await expect(caller.createPlaylist({ name: "Watch later" })).resolves.toEqual({
      message: "playlist created",
    });
    const playlist = await Playlist.findOne({ owner: user.id });
    await expect(
      caller.addVideoToPlayList({
        playListId: playlist!.id,
        videoId: video.id,
      }),
    ).resolves.toEqual({ message: "successful" });
    const updatedPlaylist = await Playlist.findById(playlist!.id);
    expect(updatedPlaylist!.contents[0]!.toString()).toBe(video.id);
  });

  it("adds and reads history for an authenticated user", async () => {
    const user = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "secret",
    });
    const video = await Video.create({
      title: "Test video",
      videoFile: "video.mp4",
      thumbnail: "thumbnail.jpg",
      owner: new mongoose.Types.ObjectId(user.id),
    });

    const caller = createTestCaller(user.id);
    await expect(caller.addToHistory({ videoId: video.id })).resolves.toEqual({
      message: "Video added to history",
    });
    const historyResult = await caller.getHistory();
    expect(historyResult.history[0]!.id).toBe(video.id);
    expect(historyResult.history[0]!.title).toBe("Test video");
  });
});
