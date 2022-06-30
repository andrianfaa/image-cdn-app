/* eslint-disable no-console */
import type { CorsOptionsDelegate } from "cors";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import type { Request } from "express";
import express, { NextFunction, Response } from "express";
import type { HelmetOptions } from "helmet";
import helmet from "helmet";
import http from "http";
import type { ConnectOptions } from "mongoose";
import mongoose from "mongoose";
import morgan from "morgan";
import { ImageController } from "./controllers";
import { SendResponse } from "./helpers";
import routes from "./routes";

const isDev = process.env.NODE_ENV === "development";

dotenv.config({
  path: `${process.cwd()}/config/.env`,
});

// Initialize express
const app = express();
const server = http.createServer(app);
const allowedOrigins: string[] = process.env.ORIGINS?.split(",").filter((origin) => origin.trim()) ?? ["http://localhost:3000"];
const mongodbUri: string = process.env.MONGODB_URI as string;
const corsOptionsDelegate: CorsOptionsDelegate<Request> = (req, callback) => {
  const corsOptions: CorsOptions = { origin: false };
  const reqOrigin = req.headers.origin || req.header("Origin") || null;

  if (reqOrigin && allowedOrigins.indexOf(reqOrigin) !== -1) {
    corsOptions.origin = reqOrigin;
  }

  callback(null, corsOptions);
};
const helmetOptions: HelmetOptions = {
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },
};

// Connect to MongoDB
mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log("Connected to MongoDB");
});

// Middleware
app.use(express.json());
app.use(cors(corsOptionsDelegate));
app.use(helmet(helmetOptions));
if (isDev) app.use(morgan("dev"));

app.use((req: Request, res: Response, next: NextFunction) => {
  const reqOrigin = req.headers.origin || req.header("Origin") || null;

  if (req.path === "/") return next();
  if (req.path.includes("/image/")) return next();
  if (reqOrigin && allowedOrigins.indexOf(reqOrigin) !== -1) return next();

  return SendResponse(res, 404, {
    message: "Endpoint not found",
  });
});

// Routes
app.get("/", (_req: Request, res: Response) => {
  SendResponse(res, 200, {
    message: "Server is running",
  });
});

app.use("/api/v1", routes);
app.use("/image/:filename", ImageController.getImage);

export default server;
