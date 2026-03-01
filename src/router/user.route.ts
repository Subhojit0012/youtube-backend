import { User } from "../db/models/user.model.js";
import { router, procedure } from "./../utility/context.utility.js";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { Session } from "../db/models/session.model.js";

export const userRouter = router({
  // /signup route
  signup: procedure
    .input(z.object({ name: string(), email: string(), password: string() }))
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

      if (!name || !email || !password)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing required fields",
          cause: "Invalid input",
        });

      const existingUser = await User.findOne({});

      const user = await User.create({ name, email, password });

      if (!user)
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "User creation failed",
          cause: "Database issue",
        });

      const session = await Session.create({ userId: user._id });

      if (!session) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Session creation failed",
          cause: "Database issue",
        });
      }

      return {
        ctx: user,
      };
    }),

  //login

  login: procedure
    .input(z.object({ email: string(), password: string() }))
    .mutation(async ({ input }) => {
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
    }),
  // /deleteUser route
  // updateUser route
  update: procedure
    .input(
      z.object({
        name: string().optional(),
        email: string().optional(),
        password: string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

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
    }),
  // /getUserById route

  getUserById: procedure.input(string()).query(async ({ input }) => {
    if (!input) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User ID is required",
        cause: "Invalid input",
      });
    }

    const user = await User.findById({ _id: input });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
        cause: "Invalid ID",
      });
    }

    return {
      ctx: user,
    };
  }),

  // test
  param: procedure.input(string()).query((opts) => {
    if (!opts.input || opts.input.trim() === "") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Parameter is required",
        cause: "Invalid input",
      });
    }

    return { param: opts.input };
  }),
});
