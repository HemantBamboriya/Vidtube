# Vidtube frontend

React 18, Vite, Tailwind CSS, React Router, TanStack Query and Axios client for the Vidtube API.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and set `VITE_API_URL` if your API differs.
3. Start the backend with credentials-enabled CORS for `http://localhost:5173`.
4. Run `npm run dev` and open http://localhost:5173. Use `npm run build` for production output.

## Structure

`src/api` contains the shared Axios client and endpoint modules; `src/context` provides auth and theme; `src/hooks` contains reusable queries; `src/components` holds UI/layout/video/comment components; `src/pages` contains route views; `src/utils` contains formatting helpers.
