import { Router } from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient, type RedisClientType } from "redis";

const router: Router = Router();

export let redisClient: RedisClientType | null = null;

export function initRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      username: process.env.REDIS_CLIENT_NAME as string,
      password: process.env.REDIS_CLIENT_PASSWORD as string,
      socket: {
        host: process.env.REDIS_HOST as string,
        port: parseInt(process.env.REDIS_PORT as string),
      },
    });

    redisClient.on("error", (err) => console.error("Redis Client Error", err));

    redisClient.on("connect", () => console.log("Redis client connected"));
  }
}

async function getClientSession(userId: string) {
  const sessionKey = "sess:" + userId;
  let value;

  if (redisClient?.get(sessionKey)) {
    value = await redisClient.get(sessionKey);
    return value;
  }

  throw new Error("Session not found");
}

async function setSessionClient(userId: string) {
  const key = "sess:" + userId;

  if (!redisClient?.get(key)) {
    await redisClient?.set(key, JSON.stringify({ userId }));
  }
}

router.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "sumit",
    resave: false,
    saveUninitialized: false,
  }),
);

router.get("/:id", (req, res) => {
  const { id } = req.params;

  getClientSession(id)
    .then((session) => res.json(session))
    .catch((err) => res.status(500).json({ error: err }));
});

export default router;
