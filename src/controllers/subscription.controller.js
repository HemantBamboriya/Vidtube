import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) throw new ApiError(400, "invalid channel id");
  if (channelId === req.user._id.toString()) throw new ApiError(400, "you cannot subscribe to yourself");
  if (!(await User.exists({ _id: channelId }))) throw new ApiError(404, "channel not found");
  const criteria = { subscriber: req.user._id, channel: channelId };
  const subscription = await Subscription.findOne(criteria);
  if (subscription) {
    await subscription.deleteOne();
    return res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "unsubscribed successfully"));
  }
  await Subscription.create(criteria);
  return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "subscribed successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) throw new ApiError(400, "invalid channel id");
  const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "username fullName avatar").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, subscribers.map((item) => item.subscriber), "channel subscribers fetched"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) throw new ApiError(400, "invalid subscriber id");
  const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "username fullName avatar").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, channels.map((item) => item.channel), "subscribed channels fetched"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
