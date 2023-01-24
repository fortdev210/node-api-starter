import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";

const app: Express = express();
const port = process.env.PORT || 3000;

dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined")); //todo remove in prod?
app.get("/", (req: Request, res: Response) => {
  //todo remove
  res.send("TRIM Express App");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
