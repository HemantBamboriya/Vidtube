import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import { ApiError } from "./utils/ApiError.js";
import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import videoRouter from "./routes/video.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use((req, res) => res.status(404).json({ success: false, statusCode: 404, message: "route not found" }));
app.use((err, req, res, next) => {
  const statusCode = err instanceof multer.MulterError ? 400 : (err.statusCode || 500);
  res.status(statusCode).json({ success: false, statusCode, message: err.message || "Internal server error", errors: err.errors || [] });
});

export { app };
