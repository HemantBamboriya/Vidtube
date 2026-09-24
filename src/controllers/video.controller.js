import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadONCloudinary, uploadVideoONCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

const ensureOwner = async (videoId, userId) => {
  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid video id");
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "video not found");
  if (video.owner.toString() !== userId.toString()) throw new ApiError(403, "you do not own this video");
  return video;
};

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;
  const allowedSorts = ["createdAt", "views", "duration", "title"];
  if (userId && !isValidObjectId(userId)) throw new ApiError(400, "invalid user id");
  const match = userId ? { owner: new mongoose.Types.ObjectId(userId) } : {};
  if (req.user?._id) match.$or = [{ isPublished: true }, { owner: new mongoose.Types.ObjectId(req.user._id) }];
  else match.isPublished = true;
  if (query?.trim()) match.title = { $regex: query.trim(), $options: "i" };
  const sortField = allowedSorts.includes(sortBy) ? sortBy : "createdAt";
  const pipeline = Video.aggregate([
    { $match: match }, { $sort: { [sortField]: sortType === "asc" ? 1 : -1 } },
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner", pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }] } },
    { $addFields: { owner: { $first: "$owner" } } }
  ]);
  const result = await Video.aggregatePaginate(pipeline, { page: Number(page), limit: Number(limit) });
  return res.status(200).json(new ApiResponse(200, result, "videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const title = req.body?.title?.trim();
  const description = req.body?.description?.trim();
  if (!title || !description) throw new ApiError(400, "title and description are required");
  const videoPath = req.files?.videoFile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  if (!videoPath || !thumbnailPath) throw new ApiError(400, "video and thumbnail files are required");
  const videoFile = await uploadVideoONCloudinary(videoPath);
  const thumbnail = await uploadONCloudinary(thumbnailPath);
  if (!videoFile?.url || !thumbnail?.url) throw new ApiError(502, "media upload failed; check the Cloudinary connection and try again");
  const video = await Video.create({ videoFile: videoFile.secure_url || videoFile.url, thumbnail: thumbnail.secure_url || thumbnail.url, title, description, duration: videoFile.duration, owner: req.user._id });
  return res.status(201).json(new ApiResponse(201, video, "video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid video id");
  const currentUserId = req.user._id;
  const pipeline = Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner", pipeline: [
      { $lookup: { from: "subscriptions", localField: "_id", foreignField: "channel", as: "subscribers" } },
      { $lookup: { from: "subscriptions", let: { channelId: "$_id" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$channel", "$$channelId"] }, { $eq: ["$subscriber", new mongoose.Types.ObjectId(currentUserId)] }] } } }], as: "currentSubscription" } },
      { $project: { username: 1, fullName: 1, avatar: 1, subscribersCount: { $size: "$subscribers" }, isSubscribed: { $gt: [{ $size: "$currentSubscription" }, 0] } } }
    ] } },
    { $addFields: { owner: { $first: "$owner" } } },
    { $lookup: { from: "likes", let: { videoId: "$_id" }, pipeline: [{ $match: { $expr: { $eq: ["$video", "$$videoId"] } } }], as: "likes" } },
    { $addFields: { likesCount: { $size: "$likes" }, isLiked: { $in: [new mongoose.Types.ObjectId(currentUserId), "$likes.likedBy"] } } },
    { $project: { likes: 0 } }
  ]);
  const [video] = await pipeline;
  if (!video || (!video.isPublished && video.owner?._id?.toString() !== currentUserId.toString())) throw new ApiError(404, "video not found");
  await Video.updateOne({ _id: video._id }, { $inc: { views: 1 } });
  await User.updateOne({ _id: currentUserId }, { $addToSet: { watchHistory: video._id } });
  video.views += 1;
  return res.status(200).json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const video = await ensureOwner(req.params.videoId, req.user._id);
  const title = req.body?.title?.trim();
  const description = req.body?.description?.trim();
  if (title) video.title = title;
  if (description) video.description = description;
  if (req.file?.path) {
    const thumbnail = await uploadONCloudinary(req.file.path);
    if (!thumbnail?.url) throw new ApiError(400, "error while uploading thumbnail");
    video.thumbnail = thumbnail.url;
  }
  await video.save();
  return res.status(200).json(new ApiResponse(200, video, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const video = await ensureOwner(req.params.videoId, req.user._id);
  await Promise.all([Like.deleteMany({ video: video._id }), Comment.deleteMany({ video: video._id })]);
  await video.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const video = await ensureOwner(req.params.videoId, req.user._id);
  video.isPublished = !video.isPublished;
  await video.save();
  return res.status(200).json(new ApiResponse(200, { isPublished: video.isPublished }, "publish status updated"));
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
