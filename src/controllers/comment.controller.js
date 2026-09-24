import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid video id");
  if (!(await Video.exists({ _id: videoId }))) throw new ApiError(404, "video not found");
  const pipeline = Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } }, { $sort: { createdAt: -1 } },
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner", pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }] } },
    { $addFields: { owner: { $first: "$owner" } } }
  ]);
  const result = await Comment.aggregatePaginate(pipeline, { page: Number(page), limit: Number(limit) });
  return res.status(200).json(new ApiResponse(200, result, "comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const content = req.body?.content?.trim();
  const { videoId } = req.params;
  if (!content) throw new ApiError(400, "content is required");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid video id");
  if (!(await Video.exists({ _id: videoId }))) throw new ApiError(404, "video not found");
  const comment = await Comment.create({ content, video: videoId, owner: req.user._id });
  return res.status(201).json(new ApiResponse(201, comment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const content = req.body?.content?.trim();
  if (!isValidObjectId(commentId)) throw new ApiError(400, "invalid comment id");
  if (!content) throw new ApiError(400, "content is required");
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "comment not found");
  if (comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "you cannot update this comment");
  comment.content = content;
  await comment.save();
  return res.status(200).json(new ApiResponse(200, comment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) throw new ApiError(400, "invalid comment id");
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "comment not found");
  if (comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "you cannot delete this comment");
  await comment.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
