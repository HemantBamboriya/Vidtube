export const formatDuration = (value = 0) => {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
};
export const formatViews = (value = 0) => new Intl.NumberFormat("en", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value) + " views";
export const timeAgo = (date) => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
  if (days < 1) return "today"; if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`; return `${Math.floor(days / 365)} years ago`;
};
export const getPlayableVideoUrl = (value) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.hostname === "res.cloudinary.com" && url.pathname.includes("/video/upload/")) {
      url.protocol = "https:";
      url.pathname = url.pathname.replace("/video/upload/", "/video/upload/f_auto,vc_auto/");
    }
    return url.toString();
  } catch {
    return value;
  }
};
