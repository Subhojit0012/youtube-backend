import { User } from "../db/models/user.model.js";
import { router, procedure } from "./../utility/context.utility.js";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { createUser, login, updateUser } from "../service/user.service.js";
import jwt from "jsonwebtoken";

export const userRouter = router({
  // /signup route
  signup: procedure
    .input(z.object({ name: string(), email: string(), password: string() }))
    .mutation(async ({ input, ctx }) => {
      const id = await createUser(input);

      // Generate JWT token and set it in the response header
      ctx.res?.setHeader("Authorization", "Bearer " + jwt.sign({id: id}, process.env.JWT_SECRET!, { expiresIn: "1D"}))
    }),

  //login

  login: procedure
    .input(z.object({ email: string(), password: string() }))
    .mutation(async ({ input }) => {
      await login(input);
    }),
  // /deleteUser route
  // updateUser route
  update: procedure
    .input(
      z.object({
        name: string(),
        email: string(),
        password: string(),
      }),
    )
    .mutation(async ({ input }) => {
      await updateUser(input);
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
});
