import api from "./client";
export const getComments = (id, page = 1) => api.get(`/comments/${id}`, { params: { page, limit: 10 } }).then((r) => r.data.data);
export const addComment = (id, content) => api.post(`/comments/${id}`, { content }).then((r) => r.data.data);
export const editComment = (id, content) => api.patch(`/comments/c/${id}`, { content }).then((r) => r.data.data);
export const deleteComment = (id) => api.delete(`/comments/c/${id}`);
