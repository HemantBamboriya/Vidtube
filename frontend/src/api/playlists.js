import api from "./client";
export const getPlaylists = (id) => api.get(`/playlist/user/${id}`).then((r) => r.data.data);
export const getPlaylist = (id) => api.get(`/playlist/${id}`).then((r) => r.data.data);
export const createPlaylist = (data) => api.post("/playlist", data).then((r) => r.data.data);
export const updatePlaylist = (id, data) => api.patch(`/playlist/${id}`, data).then((r) => r.data.data);
export const deletePlaylist = (id) => api.delete(`/playlist/${id}`);
export const addVideoToPlaylist = (videoId, playlistId) => api.patch(`/playlist/add/${videoId}/${playlistId}`);
export const removeVideoFromPlaylist = (videoId, playlistId) => api.patch(`/playlist/remove/${videoId}/${playlistId}`);
