import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { Avatar, Badge, Dropdown, IconButton } from "../ui";
import { formatDuration, formatViews, timeAgo } from "../../utils/formatters";

export function VideoCard({ video }) {
  return <article className="video-card"><Link to={`/watch/${video._id}`} className="thumb-link" aria-label={`Watch ${video.title}`}><div className="video-thumb"><img src={video.thumbnail} alt="" loading="lazy" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"; }}/><span className="duration">{formatDuration(video.duration)}</span>{!video.isPublished && <Badge tone="warning">Unpublished</Badge>}</div></Link><div className="video-card-info"><Link to={`/channel/${video.owner?.username}`}><Avatar src={video.owner?.avatar} name={video.owner?.fullName} size="sm"/></Link><div className="video-card-copy"><Link to={`/watch/${video._id}`} className="video-title">{video.title}</Link><Link className="video-channel" to={`/channel/${video.owner?.username}`}>{video.owner?.fullName || video.owner?.username}</Link><p>{formatViews(video.views)} <span>·</span> {timeAgo(video.createdAt)}</p></div><Dropdown trigger={<IconButton label="Video options"><MoreVertical size={19}/></IconButton>}><div className="dropdown-actions"><Link to={`/watch/${video._id}`}>Open video</Link></div></Dropdown></div></article>;
}

export function VideoGrid({ videos = [], loading = false }) { if (loading && !videos.length) return <div className="video-grid">{Array.from({ length: 8 }, (_, i) => <div className="video-skeleton" key={i}><div className="skeleton skeleton-thumb"/><div className="skeleton-row"><SkeletonCircle/><div><div className="skeleton skeleton-line"/><div className="skeleton skeleton-line short"/></div></div></div>)}</div>; return <div className="video-grid">{videos.map((video) => <VideoCard video={video} key={video._id}/>)}</div>; }
function SkeletonCircle() { return <div className="skeleton skeleton-circle"/>; }
