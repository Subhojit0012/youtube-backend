import { Router } from "express";
import { createUser, login, deleteUser } from "../service/user.service.js";
import { encodeToken } from "../utility/token.utility.js";

const router = Router();

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
