import axios from "axios";

// Base URL for the API
const API_BASE_URL = "http://localhost:8000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
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
