// stores api urls to call

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// User API
export const userApi = {
  register: (userData) => api.post('/users/register', userData),
  
  getUser: (userId) => api.get(`/users/${userId}`),
  
  getUserByUsername: (username) => api.get(`/users/username/${username}`),

  getAllUsers: () => api.get('/users'),
  
  getUsersByGroup: (groupId) => api.get(`/users/group/${groupId}`),
  
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  
  updateBalance: (userId, balance) => api.put(`/users/${userId}/balance`, balance),
  
  addBalance: (userId, amount) => api.put(`/users/${userId}/add-balance`, amount),
  
  deleteUser: (userId) => api.delete(`/users/${userId}`)
};

// Group API
export const groupApi = {
  getAllGroups: () => api.get('/groups'),
  
  getGroup: (groupId) => api.get(`/groups/${groupId}`),
  
  createGroup: (groupData) => api.post('/groups', groupData),
  
  updateGroup: (groupId, groupData) => api.put(`/groups/${groupId}`, groupData),
  
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
  
  addUserToGroup: (groupId, userId) => api.post(`/groups/${groupId}/users/${userId}`),
  
  removeUserFromGroup: (groupId, userId) => api.delete(`/groups/${groupId}/users/${userId}`)
};

// Expense API
export const expenseApi = {
  getAllExpenses: () => api.get('/expenses'),
  
  getExpense: (expenseId) => api.get(`/expenses/${expenseId}`),
  
  createExpense: (expenseData) => api.post('/expenses', expenseData),
  
  updateExpense: (expenseId, expenseData) => api.put(`/expenses/${expenseId}`, expenseData),
  
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`),
  
  getGroupExpenses: (groupId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    return api.get(`/expenses/group/${groupId}${params.toString() ? '?' + params.toString() : ''}`);
  }
};

// Request API
export const requestApi = {
  getAllRequests: () => api.get('/requests'),
  
  getRequest: (requestId) => api.get(`/requests/${requestId}`),
  
  createRequest: (requestData) => api.post('/requests', requestData),
  
  updateRequest: (requestId, requestData) => api.put(`/requests/${requestId}`, requestData),
  
  acceptRequest: (requestId) => api.post(`/requests/${requestId}/accept`),
  
  deleteRequest: (requestId) => api.delete(`/requests/${requestId}`),
  
  getExpenseRequests: (expenseId) => api.get(`/requests/expense/${expenseId}`),
  
  getDebtorRequests: (userId) => api.get(`/requests/debtor/${userId}`),
  
  getUnfulfilledDebtorRequests: (userId) => api.get(`/requests/debtor/${userId}/unfulfilled`),
  
  getDebteeRequests: (userId) => api.get(`/requests/debtee/${userId}`),
  
  getGroupRequests: (groupId) => api.get(`/requests/group/${groupId}`),
  
  getUnfulfilledGroupRequests: (groupId) => api.get(`/requests/group/${groupId}/unfulfilled`),
  
  createStandaloneRequest: (data) => api.post('/requests/standalone', data)
};

// Payment API
export const paymentApi = {
  getAllPayments: () => api.get('/payments'),
  
  getPayment: (paymentId) => api.get(`/payments/${paymentId}`),
  
  createPayment: (paymentData) => api.post('/payments', paymentData),
  
  deletePayment: (paymentId) => api.delete(`/payments/${paymentId}`),
  
  getDebtorPayments: (userId) => api.get(`/payments/debtor/${userId}`),
  
  getDebteePayments: (userId) => api.get(`/payments/debtee/${userId}`),
  
  getGroupPayments: (groupId) => api.get(`/payments/group/${groupId}`)
};

export default {
  user: userApi,
  group: groupApi,
  expense: expenseApi,
  request: requestApi,
  payment: paymentApi
}; 
