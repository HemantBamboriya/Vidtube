import api from "./client";
export const getTweets = (id, page = 1) => api.get(`/tweet/user/${id}`, { params: { page, limit: 10 } }).then((r) => r.data.data);
export const createTweet = (content) => api.post("/tweet/create-tweet", { content }).then((r) => r.data.data);
export const editTweet = (id, content) => api.patch(`/tweet/update-tweet/${id}`, { content }).then((r) => r.data.data);
export const deleteTweet = (id) => api.delete(`/tweet/delete-tweet/${id}`);
