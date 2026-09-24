import api from "./client";
export const listVideos = (params) => api.get("/videos", { params }).then((r) => r.data.data);
export const getVideo = (id) => api.get(`/videos/${id}`).then((r) => r.data.data);
export const uploadVideo = (data, onUploadProgress) => api.post("/videos", data, { onUploadProgress, headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data.data);
export const updateVideo = (id, data) => api.patch(`/videos/${id}`, data).then((r) => r.data.data);
export const deleteVideo = (id) => api.delete(`/videos/${id}`);
export const togglePublish = (id) => api.patch(`/videos/toggle/publish/${id}`).then((r) => r.data.data);
