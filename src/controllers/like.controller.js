import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggle = async (res, userId, field, id) => {
  if (!isValidObjectId(id)) throw new ApiError(400, `invalid ${field} id`);
  const criteria = { [field]: id, likedBy: userId };
  const existing = await Like.findOne(criteria);
  if (existing) {
    await existing.deleteOne();
    return res.status(200).json(new ApiResponse(200, { isLiked: false }, "like removed"));
  }
  await Like.create(criteria);
  return res.status(200).json(new ApiResponse(200, { isLiked: true }, "liked successfully"));
};

const toggleVideoLike = asyncHandler(async (req, res) => toggle(res, req.user._id, "video", req.params.videoId));
const toggleCommentLike = asyncHandler(async (req, res) => toggle(res, req.user._id, "comment", req.params.commentId));
const toggleTweetLike = asyncHandler(async (req, res) => toggle(res, req.user._id, "tweet", req.params.tweetId));

const getLikedVideos = asyncHandler(async (req, res) => {
  const videos = await Like.aggregate([
    { $match: { likedBy: req.user._id, video: { $exists: true } } },
    { $sort: { createdAt: -1 } },
    { $lookup: { from: "videos", localField: "video", foreignField: "_id", as: "video" } }, { $unwind: "$video" },
    { $replaceRoot: { newRoot: "$video" } },
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner", pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }] } },
    { $addFields: { owner: { $first: "$owner" } } }
  ]);
  return res.status(200).json(new ApiResponse(200, videos, "liked videos fetched successfully"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
