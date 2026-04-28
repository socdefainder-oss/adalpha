import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error";
import routes from "./routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  }),
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);
app.use(errorHandler);

export default app;
