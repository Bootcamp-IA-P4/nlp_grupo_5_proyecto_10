import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: false,
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      console.error("Backend server is not running on http://localhost:8000");
      alert(
        "Backend server is not available. Please start the backend server."
      );
    }
    return Promise.reject(error);
  }
);

export default api;
