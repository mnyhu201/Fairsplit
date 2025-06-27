import axios from 'axios';
import { API_URL } from '../config';

// Helper function to get the authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all requests (sent or received) for the current user
export const fetchRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/requests`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

// Create a new request
export const createRequest = async (requestData) => {
  try {
    const response = await axios.post(`${API_URL}/requests`, requestData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

// Update the status of a request (approve/reject)
export const updateRequestStatus = async (requestId, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/requests/${requestId}`, 
      { status }, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

// Delete a request
export const deleteRequest = async (requestId) => {
  try {
    const response = await axios.delete(`${API_URL}/requests/${requestId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
}; 