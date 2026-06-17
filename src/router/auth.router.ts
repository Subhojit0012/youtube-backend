import { Router } from "express";
import { createUser, login, deleteUser } from "../service/user.service.js";
import { encodeToken } from "../utility/token.utility.js";

const router = Router();

/* 

implement the authentication procedure in express router e.g. login, signup, so when the token will be created or updated we can set it to the /trpc middleware header so the tRPC Context can get the JWT token, but if the token is not found in the request header in /trpc/* route it will thorw error by the trpc protected-procedure.

*/

router.post("/signup", async (req, res, next) => {
  const { name, email, password } = req.body;
  const id = await createUser({ name, email, password });

  const token = encodeToken(String(id));

  res.status(200);

  next(res.set("Authentication", "Bearer " + token));
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const id = await login({ email, password });
  const token = encodeToken(String(id));

  res.status(200);

  next(res.set("Authentication", "Bearer " + token));
});

export default router;
