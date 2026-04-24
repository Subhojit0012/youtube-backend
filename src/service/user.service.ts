import { User } from "../db/models/user.model.js";
import { TRPCError } from "@trpc/server";

/**
 * @param {Object} params - The parameters for creating a user.
 */
async function createUser({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) {
  if (!name || !email || !password)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing required fields",
      cause: "Invalid input",
    });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User with this email already exists",
      cause: "Duplicate entry",
    });

  const user = await User.create({ name, email, password });
  if (!user)
    throw new TRPCError({
      code: "NOT_IMPLEMENTED",
      message: "User creation failed",
      cause: "Database issue",
    });

  return user._id;
}

async function login(input: { email: string; password: string }) {
  if (!input.email || !input.password) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email and password are required",
      cause: "Invalid input",
    });
  }

  const { email, password } = input;

  const user = await User.findOne({ email: email, password: password });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invalid email or password",
      cause: "Authentication failed",
    });
  }

  return { message: "Login successful" };
}

async function deleteUser(input: { userId: string }) {
  const { userId } = input;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
      cause: "Invalid user ID",
    });
  }

  return {
    message: "User deleted successfully",
  };
}

async function updateUser({
  name,
  email,
  password,
}: {
  name?: string;
  email?: string;
  password?: string;
}) {
  let updatedUser;

  if (name && email) {
    updatedUser = await User.updateOne(
      { email: email },
      { $set: { name: name } },
    );
  }

  if (password && email) {
    updatedUser = await User.updateOne(
      { email: email },
      { $set: { password: password } },
    );
  }

  return {
    ctx: updatedUser,
  };
}

export { createUser, login, updateUser, deleteUser };
