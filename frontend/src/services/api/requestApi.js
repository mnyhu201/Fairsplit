import api from './api';

export const requestApi = {
  // Get requests where user is the debtor (needs to pay)
  getDebtorRequests: async (userId) => {
    try {
      const response = await api.get(`/requests?debtorId=${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get requests where user is the debtee (needs to receive)
  getDebteeRequests: async (userId) => {
    try {
      const response = await api.get(`/requests?debteeId=${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get history of completed requests
  getRequestHistory: async (userId) => {
    try {
      const response = await api.get(`/requests/history?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new request
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/requests', requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a request (e.g., mark as completed)
  updateRequest: async (requestId, updateData) => {
    try {
      const response = await api.put(`/requests/${requestId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Accept a payment request
  acceptRequest: async (requestId) => {
    try {
      const response = await api.post(`/requests/${requestId}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Decline a payment request
  declineRequest: async (requestId) => {
    try {
      const response = await api.post(`/requests/${requestId}/decline`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default requestApi; 