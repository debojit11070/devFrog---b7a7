// Server-side configuration. Only read on the server; the browser talks to /api/backend.
export const API_BASE_URL = (process.env.BACKEND_API_URL ?? "http://localhost:5000/api/v1").replace(/\/+$/, "");
