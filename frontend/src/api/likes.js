import api from "./client";
export const toggleVideoLike = (id) => api.post(`/likes/toggle/v/${id}`).then((r) => r.data.data);
export const toggleCommentLike = (id) => api.post(`/likes/toggle/c/${id}`).then((r) => r.data.data);
export const toggleTweetLike = (id) => api.post(`/likes/toggle/t/${id}`).then((r) => r.data.data);
export const getLikedVideos = () => api.get("/likes/videos").then((r) => r.data.data);
