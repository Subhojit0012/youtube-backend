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

  return {
    ctx: user,
  };
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

async function deleteUser(params: object) {}

async function updateUser(params: object) {}

export { createUser, login };
