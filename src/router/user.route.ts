import { User } from "../db/models/user.model.js";
import { router, procedure } from "./../utility/context.utility.js";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { createUser, deleteUser, login, updateUser } from "../service/user.service.js";
import jwt from "jsonwebtoken";
import { authProcedure } from "./../utility/context.utility.js";

export const userRouter = router({
  // /signup route
  signup: procedure
    .input(z.object({ name: string(), email: string(), password: string() }))
    .mutation(async ({ input, ctx }) => {
      const id = await createUser(input);

      // Generate JWT token and set it in the response header
      ctx.res?.setHeader(
        "Authorization",
        "Bearer " +
          jwt.sign({ id: id }, process.env.JWT_SECRET!, { expiresIn: "1D" }),
      );
    }),

  //login

  login: procedure
    .input(z.object({ email: string(), password: string() }))
    .mutation(async ({ input, ctx }) => {
      const _id = await login(input);

      ctx.res?.setHeader(
        "Authorization",
        "Bearer " +
          jwt.sign({ id: _id }, process.env.JWT_SECRET!, { expiresIn: "1D" }),
      );

      return { message: "Login successful" };
    }),
  // /deleteUser route
  deleteUser: authProcedure.input(string()).mutation(async ({ input, ctx }) => {
    if (
      ctx.payload === undefined ||
      typeof ctx.payload !== "object" ||
      ctx.payload === null
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
    }

    if (!input) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User ID is required",
        cause: "Invalid input",
      });
    }

    await deleteUser({ userId: input });
  }),
  // updateUser route
  update: authProcedure
    .input(
      z.object({
        name: string(),
        email: string(),
        password: string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.payload === undefined ||
        typeof ctx.payload !== "object" ||
        ctx.payload === null
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
      }

      await updateUser(input);
    }),
  // /getUserById route

  getUserById: authProcedure.input(string()).query(async ({ input, ctx }) => {
    if (
      ctx.payload === undefined ||
      typeof ctx.payload !== "object" ||
      ctx.payload === null
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
    }

    if (!input) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User ID is required",
        cause: "Invalid input",
      });
    }

    const user = await User.findById({ _id: ctx.payload.id });

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
});
