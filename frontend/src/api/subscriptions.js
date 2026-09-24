import api from "./client";
export const toggleSubscription = (id) => api.post(`/subscriptions/c/${id}`).then((r) => r.data.data);
export const getSubscribers = (id) => api.get(`/subscriptions/c/${id}`).then((r) => r.data.data);
export const getSubscribedChannels = (id) => api.get(`/subscriptions/u/${id}`).then((r) => r.data.data);
