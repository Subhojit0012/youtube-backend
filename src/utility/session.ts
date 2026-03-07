import { RedisStore } from "connect-redis";
import { createClient } from "redis";
// import { RedisStore } from "connect-redis";
import type { RedisClientType } from "redis";

export const client: RedisClientType = createClient();
    
client.on("error", (err)=> console.error("redis error: ", err))
client.on("connect", ()=> console.log("redis connected"))

export const redisStore = new RedisStore({
    client: client
})
