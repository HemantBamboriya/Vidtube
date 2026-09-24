# Vidtube Backend

## Setup

1. Run `npm install`.
2. Copy `.env.sample` to `.env` and fill in the secrets and Cloudinary credentials.
3. Start MongoDB locally, then run `npm run dev` (or `npm start`).

All routes except `GET /api/v1/health`, user registration, login, and token refresh require a JWT access token or access cookie.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/health` | Health status |
| POST | `/api/v1/users/register` | Register with avatar and optional cover image |
| POST | `/api/v1/users/login` | Login |
| POST | `/api/v1/users/logout` | Logout |
| POST | `/api/v1/users/refresh-token` | Refresh tokens |
| POST | `/api/v1/users/change-password` | Change password |
| GET | `/api/v1/users/current-user` | Get current user |
| PATCH | `/api/v1/users/update-account` | Update account details |
| PATCH | `/api/v1/users/avatar` | Update avatar |
| PATCH | `/api/v1/users/cover-image` | Update cover image |
| GET | `/api/v1/users/c/:username` | Get channel profile |
| GET | `/api/v1/users/history` | Get watch history |
| GET | `/api/v1/videos` | Search and paginate published videos |
| POST | `/api/v1/videos` | Publish video and thumbnail |
| GET | `/api/v1/videos/:videoId` | Get video details |
| PATCH | `/api/v1/videos/:videoId` | Update video |
| DELETE | `/api/v1/videos/:videoId` | Delete video |
| PATCH | `/api/v1/videos/toggle/publish/:videoId` | Toggle publishing |
| POST | `/api/v1/tweet/create-tweet` | Create tweet |
| GET | `/api/v1/tweet/user/:userId` | List a user's tweets |
| PATCH | `/api/v1/tweet/update-tweet/:tweetId` | Update tweet |
| DELETE | `/api/v1/tweet/delete-tweet/:tweetId` | Delete tweet |
| GET | `/api/v1/comments/:videoId` | List video comments |
| POST | `/api/v1/comments/:videoId` | Add comment |
| PATCH | `/api/v1/comments/c/:commentId` | Update comment |
| DELETE | `/api/v1/comments/c/:commentId` | Delete comment |
| POST | `/api/v1/playlist` | Create playlist |
| GET | `/api/v1/playlist/:playlistId` | Get playlist |
| PATCH | `/api/v1/playlist/:playlistId` | Update playlist |
| DELETE | `/api/v1/playlist/:playlistId` | Delete playlist |
| PATCH | `/api/v1/playlist/add/:videoId/:playlistId` | Add video to playlist |
| PATCH | `/api/v1/playlist/remove/:videoId/:playlistId` | Remove video from playlist |
| GET | `/api/v1/playlist/user/:userId` | List user's playlists |
| POST | `/api/v1/likes/toggle/v/:videoId` | Toggle video like |
| POST | `/api/v1/likes/toggle/c/:commentId` | Toggle comment like |
| POST | `/api/v1/likes/toggle/t/:tweetId` | Toggle tweet like |
| GET | `/api/v1/likes/videos` | List liked videos |
| POST | `/api/v1/subscriptions/c/:channelId` | Toggle channel subscription |
| GET | `/api/v1/subscriptions/c/:channelId` | List channel subscribers |
| GET | `/api/v1/subscriptions/u/:subscriberId` | List subscribed channels |
