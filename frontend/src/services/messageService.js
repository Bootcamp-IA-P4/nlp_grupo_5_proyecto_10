// frontend/src/services/messageService.js

import api from '../api/axios';

// Get all messages
export const getMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

// Create a new message
export const createMessage = async (message) => {
  const response = await api.post('/messages', message);
  return response.data;
};

// Update an existing message by ID
export const updateMessage = async (id, message) => {
  const response = await api.put(`/messages/${id}`, message);
  return response.data;
};

// Delete a message by ID
export const deleteMessage = async (id) => {
  const response = await api.delete(`/messages/${id}`);
  return response.data;
};

// Predict sentiment of text
export const predictMessage = async (text) => {
  const response = await api.post('/predict', { text });

  // Map prediction to sentiment here
  const predictionValue = response.data.prediction;
  const sentiment = predictionValue === 0 ? "positive" : "negative";

  return { prediction: predictionValue, sentiment };
};

// Analyze text and save message with sentiment
export const analyzeAndSaveMessage = async (text) => {
  // Get sentiment prediction
  const prediction = await predictMessage(text);

  // Build message object
  const messageToSave = {
    text,
    sentiment: prediction.sentiment,
    timestamp: new Date().toISOString(),
  };

  // Save message to DB
  const savedMessage = await createMessage(messageToSave);
  return savedMessage;
};
