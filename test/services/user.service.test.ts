import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { User } from "../../src/db/models/user.model.js";
import {
  createUser,
  deleteUser,
  login,
  updateUser,
} from "../../src/service/user.service.js";

describe("user service", () => {
  it("rejects incomplete signup data", async () => {
    await expect(
      createUser({ name: "", email: "user@example.com", password: "secret" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("creates a user when the email is available", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue(null);
    vi.spyOn(User, "create").mockResolvedValue({ _id: "user-id" } as never);

    await expect(
      createUser({
        name: "Test User",
        email: "user@example.com",
        password: "secret",
      }),
    ).resolves.toBe("user-id");
  });

  it("rejects duplicate signup emails", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue({ _id: "existing" } as never);

    await expect(
      createUser({
        name: "Test User",
        email: "user@example.com",
        password: "secret",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("logs in with matching credentials", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue({ _id: "user-id" } as never);

    await expect(
      login({ email: "user@example.com", password: "secret" }),
    ).resolves.toBe("user-id");
  });

  it("rejects invalid login credentials", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue(null);

    await expect(
      login({ email: "user@example.com", password: "wrong" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("deletes an existing user", async () => {
    vi.spyOn(User, "findByIdAndDelete").mockResolvedValue({ _id: "user-id" } as never);

    await expect(deleteUser({ userId: "user-id" })).resolves.toEqual({
      message: "User deleted successfully",
    });
  });

  it("returns a not found error when deleting a missing user", async () => {
    vi.spyOn(User, "findByIdAndDelete").mockResolvedValue(null);

    await expect(deleteUser({ userId: "missing" })).rejects.toBeInstanceOf(
      TRPCError,
    );
  });

  it("updates the requested fields", async () => {
    const update = vi.spyOn(User, "updateOne").mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });

    await updateUser({ email: "user@example.com", name: "Updated" });

    expect(update).toHaveBeenCalledWith(
      { email: "user@example.com" },
      { $set: { name: "Updated" } },
    );
  });
});
