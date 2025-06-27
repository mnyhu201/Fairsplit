import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { userApi } from './services/api.js';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import CreateGroupPage from './pages/CreateGroupPage';
import CreateRequestPage from './pages/CreateRequestPage.jsx';
import RequestsPage from './pages/RequestsPage';
import PaymentsPage from './pages/PaymentsPage';
import ExpensesPage from './pages/ExpensesPage';
import GuestUserPage from './pages/GuestUserPage.js';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

// Placeholder Components
const ExpensesPlaceholder = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    groupId: '',
    assignedUsers: []
  });
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all expenses from API
        const response = await axios.get('/api/expenses');
        setExpenses(response.data);
        
        // Fetch user's groups
        const groupsResponse = await axios.get('/api/groups');
        const userGroups = groupsResponse.data.filter(group => 
          group.users.some(u => u.id === user.id)
        );
        setGroups(userGroups);
        
        // Fetch all users
        const usersResponse = await axios.get('/api/users');
        setUsers(usersResponse.data);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError('Failed to load expenses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user.id]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'groupId' && value) {
      // When group is selected, get its users for assignment
      const selectedGroup = groups.find(g => g.id.toString() === value);
      if (selectedGroup) {
        setSelectedGroupUsers(selectedGroup.users.filter(u => u.id !== user.id));
        // Reset assigned users when group changes
        setFormData({
          ...formData,
          [name]: value,
          assignedUsers: []
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleUserAssignment = (e) => {
    const { checked, value } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        assignedUsers: [...formData.assignedUsers, value]
      });
    } else {
      setFormData({
        ...formData,
        assignedUsers: formData.assignedUsers.filter(id => id !== value)
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || formData.assignedUsers.length === 0) {
      setError('Please fill in all fields and assign at least one user.');
      return;
    }
    
    setProcessing(true);
    
    try {
      const expenseData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        userId: user.id,
        groupId: formData.groupId || null,
        category: formData.category,
        assignedUsers: formData.assignedUsers.map(id => ({ id }))
      };
      
      // Create expense
      await axios.post('/api/expenses', expenseData);
      
      // Refresh expenses
      const response = await axios.get('/api/expenses');
      setExpenses(response.data);
      
      // Reset form and show success
      setFormData({
        name: '',
        amount: '',
        category: 'Food',
        groupId: '',
        assignedUsers: []
      });
      
      setSuccess('Expense created successfully!');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Failed to create expense. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const filterByCategory = (category) => {
    // Filter expenses by selected category
    if (!category) {
      // Refresh expenses from API
      const fetchData = async () => {
        try {
          const response = await axios.get('/api/expenses');
          setExpenses(response.data);
        } catch (err) {
          console.error('Error fetching expenses:', err);
          setError('Failed to refresh expenses. Please try again.');
        }
      };
      fetchData();
    } else {
      setExpenses(prevExpenses => 
        prevExpenses.filter(expense => expense.category === category)
      );
    }
  };
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="expenses-header">
        <h1>Expenses</h1>
        <div className="d-flex align-items-center">
          <select 
            className="form-control form-control-sm me-2"
            onChange={(e) => filterByCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
            <option value="Rent">Rent</option>
            <option value="Other">Other</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Expense
          </button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="list-group list-group-flush">
          {expenses.length > 0 ? (
            expenses.map(expense => (
              <div key={expense.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{expense.name}</h5>
                    <p className="mb-1 text-muted">
                      {new Date(expense.createdAt).toLocaleDateString()} • 
                      {expense.group ? expense.group.name : 'Personal'} • 
                      {expense.category}
                    </p>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className={`badge ${expense.paid ? 'bg-success' : 'bg-warning'} me-2`}>
                      {expense.paid ? 'Paid' : 'Pending'}
                    </span>
                    <span className="fw-bold">${expense.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state p-4 text-center">
              <p>No expenses found.</p>
              <p>Create your first expense by clicking the "Create New Expense" button.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Expense Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Expense</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Expense Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    id="amount"
                    name="amount"
                    className="form-control"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Food">Food</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="groupId">Group (Optional)</label>
                <select
                  id="groupId"
                  name="groupId"
                  className="form-control"
                  value={formData.groupId}
                  onChange={handleInputChange}
                >
                  <option value="">Select a group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.groupId && (
                <div className="form-group">
                  <label>Assign To Users</label>
                  <div className="user-assignment">
                    {selectedGroupUsers.length > 0 ? (
                      selectedGroupUsers.map(user => (
                        <div key={user.id} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`user-${user.id}`}
                            value={user.id}
                            checked={formData.assignedUsers.includes(user.id.toString())}
                            onChange={handleUserAssignment}
                          />
                          <label className="form-check-label" htmlFor={`user-${user.id}`}>
                            {user.fullname || user.username}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No other users in this group</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? 'Creating...' : 'Create Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentsPlaceholder = ({ user }) => (
  <div className="container mt-4">
    <h1>Payments</h1>
    <div className="alert alert-info">
      <p>No payments found. Your payment history will appear here.</p>
      <Link to="/requests" className="btn btn-primary mt-2">View Requests</Link>
    </div>
  </div>
);

const ProfilePlaceholder = ({ user, setUser }) => (
  <div className="container mt-4">
    <h1>Profile</h1>
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{user.fullname || user.username}</h5>
        <p className="card-text">Username: {user.username}</p>
        <p className="card-text">User ID: {user.id}</p>
        <button className="btn btn-primary">Edit Profile</button>
      </div>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const userId = Cookies.get('userId');
      if (userId) {
        try {
          const response = await userApi.getUser(userId); 
          login(response.data); // ✅ pass resolved user object
        } catch (err) {
          console.error('Failed to fetch user from cookie:', err);
          Cookies.remove('userId');
        }
      }
      setLoading(false); 
    };
  
    checkLogin();
  }, []);
  

  const login = (userData) => {
    setUser(userData);
    Cookies.set('userId', userData.id, { expires: 7 }); // Cookie expires in 7 days
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('userId');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={login} />} />
            <Route path="/splitter" element={<GuestUserPage />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={login} />} />
            <Route path="/dashboard" element={user ? <DashboardPage user={user} /> : <GuestUserPage />} />
            <Route path="/groups" element={user ? <GroupsPage user={user} /> : <GuestUserPage />} />
            <Route path="/groups/create" element={user ? <CreateGroupPage user={user} /> : <GuestUserPage />} />
            <Route path="/groups/:groupId" element={user ? <GroupDetailPage user={user} /> : <GuestUserPage />} />
            <Route path="/requests" element={user ? <RequestsPage user={user} /> : <GuestUserPage />} />
            <Route path="/requests/create" element={user ? <CreateRequestPage user={user} /> : <GuestUserPage />} />
            <Route path="/expenses" element={user ? <ExpensesPage user={user} /> : <GuestUserPage />} />
            <Route path="/payments" element={user ? <PaymentsPage user={user} /> : <GuestUserPage />} />
            <Route path="/profile" element={user ? <ProfilePlaceholder user={user} setUser={setUser} /> : <GuestUserPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 