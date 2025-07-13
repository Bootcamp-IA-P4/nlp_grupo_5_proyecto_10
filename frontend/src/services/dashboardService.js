import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Dashboard API Error:", error);
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - is the backend running on port 8000?");
    }
    return Promise.reject(error);
  }
);

export const dashboardService = {
  // Get comprehensive analytics data
  async getAnalytics() {
    try {
      const response = await api.get("/messages/analytics");
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  },

  // Get video comparison data
  async getVideoComparison() {
    try {
      const response = await api.get("/messages/video-comparison");
      return response.data;
    } catch (error) {
      console.error("Error fetching video comparison:", error);
      throw error;
    }
  },

  // Get toxicity patterns
  async getToxicityPatterns() {
    try {
      const response = await api.get("/messages/toxicity-patterns");
      return response.data;
    } catch (error) {
      console.error("Error fetching toxicity patterns:", error);
      throw error;
    }
  },

  // Get basic stats
  async getStats() {
    try {
      const response = await api.get("/messages/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },
};
