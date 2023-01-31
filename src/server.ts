import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";

import authRouter from "./api/auth/auth.route";
import logger from "./logging";
import redisClient from "./utils/connect-redis";
import validateEnv from "./utils/validate-env";

const app: Express = express();
const port = process.env.PORT || 3001;

dotenv.config();
validateEnv();
const prisma = new PrismaClient();

async function bootstrap() {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(morgan("combined")); //todo remove in prod?

  // api end point health check
  app.get("/api/v1/healthcheck", async (req: Request, res: Response) => {
    const message = await redisClient.get("try");
    res.status(200).json({
      status: "success",
      message,
    });
  });

  // add router here
  app.use("/api/v1/auth/", authRouter);

  app.listen(port, () => {
    logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

bootstrap()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
