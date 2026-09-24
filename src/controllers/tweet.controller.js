import { isValidObjectId, Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const content = req.body?.content?.trim();
  if (!content) throw new ApiError(400, "content is required");
  if (!isValidObjectId(req.user?._id)) throw new ApiError(400, "invalid user id");
  const tweet = await Tweet.create({ content, owner: req.user._id });
  return res.status(201).json(new ApiResponse(201, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!isValidObjectId(userId)) throw new ApiError(400, "invalid user id");
  if (!(await User.exists({ _id: userId }))) throw new ApiError(404, "user not found");
  const pipeline = Tweet.aggregate([
    { $match: { owner: new Types.ObjectId(userId) } }, { $sort: { createdAt: -1 } },
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner", pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }] } },
    { $addFields: { owner: { $first: "$owner" } } }
  ]);
  const result = await Tweet.aggregatePaginate(pipeline, { page: Number(page), limit: Number(limit) });
  return res.status(200).json(new ApiResponse(200, result, "user tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const content = req.body?.content?.trim();
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "invalid tweet id");
  if (!content) throw new ApiError(400, "content is required");
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "tweet not found");
  if (tweet.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "you cannot update this tweet");
  tweet.content = content;
  await tweet.save();
  return res.status(200).json(new ApiResponse(200, tweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "invalid tweet id");
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "tweet not found");
  if (tweet.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "you cannot delete this tweet");
  await tweet.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
