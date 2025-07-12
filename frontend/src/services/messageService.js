import axios from "axios";

// Base URL for the API - Make sure this matches your backend
const API_BASE_URL = "http://localhost:8000";

// Create axios instance with default config and better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - is the backend running on port 8000?");
    }
    if (error.response?.status === 404) {
      console.error("Endpoint not found - check backend routes");
    }
    return Promise.reject(error);
  }
);

export const getMessages = async () => {
  try {
    const response = await api.get("/messages");
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const analyzeAndSaveMessage = async (text) => {
  try {
    const response = await api.post("/messages", { text });
    return response.data;
  } catch (error) {
    console.error("Error analyzing message:", error);
    throw error;
  }
};

export const deleteMessage = async (id) => {
  try {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const updateMessage = async (id, text) => {
  try {
    const response = await api.put(`/messages/${id}`, { text });
    return response.data;
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

// Add this new function for filtered messages
export const getFilteredMessages = async (
  filters = {},
  page = 1,
  limit = 100
) => {
  try {
    const params = new URLSearchParams();

    // Add filters to params
    if (filters.sentiment) params.append("sentiment", filters.sentiment);
    if (filters.source) params.append("source", filters.source);
    if (filters.confidence_min)
      params.append("confidence_min", filters.confidence_min);
    if (filters.confidence_max)
      params.append("confidence_max", filters.confidence_max);
    if (filters.search_text) params.append("search_text", filters.search_text);

    // Add pagination
    params.append("limit", limit);
    params.append("offset", (page - 1) * limit);

    const response = await api.get(`/messages/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - is the backend running on port 8000?");
    }
    throw error;
  }
};

export const messageService = {
  // Get filter options
  async getFilterOptions() {
    try {
      const response = await api.get("/messages/filter-options");
      return response.data;
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw error;
    }
  },
};
