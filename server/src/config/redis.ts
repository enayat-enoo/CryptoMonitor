import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export const connectRedis = async (url: string) => {
  if (!redisClient) {
    redisClient = createClient({ url });
    redisClient.on("error", (err) => console.error("Redis error:", err));
    await redisClient.connect();
  }
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient)
    throw new Error("Redis client not initialized. Call connectRedis first.");
  return redisClient;
};
