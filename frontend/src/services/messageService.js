import api from '../api/axios';

export const getMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

export const createMessage = async (message) => {
  const response = await api.post('/messages', message);
  return response.data;
};

export const updateMessage = async (id, message) => {
  const response = await api.put(`/messages/${id}`, message);
  return response.data;
};

export const deleteMessage = async (id) => {
  const response = await api.delete(`/messages/${id}`);
  return response.data;
};

export const predictMessage = async (text) => {
  const response = await api.post('/predict', { text });
  return response.data;
};
