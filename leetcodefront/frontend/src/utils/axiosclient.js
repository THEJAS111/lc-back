import axios from "axios"

const axiosClient = axios.create({
  baseURL: isDev
    ? "http://localhost:3000" // local backend when developing
    : "https://your-backend.vercel.app", // change this to your deployed backend
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default axiosClient;
