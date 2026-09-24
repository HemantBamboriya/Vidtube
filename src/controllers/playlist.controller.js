import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlists.model.js";
import { Video } from "../models/video.model.js";

const ensureOwner = async (playlistId, userId) => {
  if (!isValidObjectId(playlistId)) throw new ApiError(400, "invalid playlist id");
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "playlist not found");
  if (playlist.owner.toString() !== userId.toString()) throw new ApiError(403, "you do not own this playlist");
  return playlist;
};

const createPlaylist = asyncHandler(async (req, res) => {
  const name = req.body?.name?.trim();
  const description = req.body?.description?.trim();
  if (!name || !description) throw new ApiError(400, "name and description are required");
  const playlist = await Playlist.create({ name, description, videos: [], owner: req.user._id });
  return res.status(201).json(new ApiResponse(201, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "invalid user id");
  const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1 }).populate({ path: "videos", select: "thumbnail title duration views" });
  return res.status(200).json(new ApiResponse(200, playlists, "user playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) throw new ApiError(400, "invalid playlist id");
  const playlist = await Playlist.findById(playlistId).populate({ path: "videos", select: "thumbnail title duration views owner createdAt", populate: { path: "owner", select: "username fullName avatar" } });
  if (!playlist) throw new ApiError(404, "playlist not found");
  return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid video id");
  await ensureOwner(playlistId, req.user._id);
  if (!(await Video.exists({ _id: videoId }))) throw new ApiError(404, "video not found");
  const playlist = await Playlist.findByIdAndUpdate(playlistId, { $addToSet: { videos: videoId } }, { new: true });
  return res.status(200).json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid video id");
  await ensureOwner(playlistId, req.user._id);
  const playlist = await Playlist.findByIdAndUpdate(playlistId, { $pull: { videos: videoId } }, { new: true });
  return res.status(200).json(new ApiResponse(200, playlist, "video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const playlist = await ensureOwner(playlistId, req.user._id);
  await playlist.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const name = req.body?.name?.trim();
  const description = req.body?.description?.trim();
  if (!name || !description) throw new ApiError(400, "name and description are required");
  const playlist = await ensureOwner(playlistId, req.user._id);
  playlist.name = name;
  playlist.description = description;
  await playlist.save();
  return res.status(200).json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist };
