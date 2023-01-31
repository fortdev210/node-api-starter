import { createClient } from "redis";

import logging from "../logging";

const redisUrl = "redis://localhost:6379";

const redisClient = createClient({
  url: redisUrl,
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    logging.info("Connected to redis successfully");
    redisClient.set("try", "Welcome to Express and TypeScript with Prisma");
  } catch (error) {
    logging.error("Failed to connect to Redis", error);
    setTimeout(connectRedis, 5000);
  }
};

connectRedis();

export default redisClient;
