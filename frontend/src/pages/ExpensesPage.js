import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expenseApi, groupApi, requestApi, userApi } from '../services/api';
import './ExpensesPage.css';

function ExpensesPage({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [expenseRequests, setExpenseRequests] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    groupId: '',
    assignedUsers: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const groupsResponse = await groupApi.getAllGroups();
        const userGroups = groupsResponse.data.filter(group =>
          group.users?.some(u => u.id === user.id)
        );
        setGroups(userGroups);

        const expensesResponse = await expenseApi.getAllExpenses();
        const allExpenses = expensesResponse.data;
        const userGroupIds = userGroups.map(g => g.id);
        const filteredExpenses = allExpenses.filter(exp =>
          exp.group?.id && userGroupIds.includes(exp.group.id)
        );
        setExpenses(filteredExpenses);

        const usersResponse = await userApi.getAllUsers();
        setUsers(usersResponse.data.filter(u => u.id !== user.id));
 
        const requestsObj = {};
        for (const expense of filteredExpenses) {
          try {
            const reqRes = await requestApi.getExpenseRequests(expense.id);
            requestsObj[expense.id] = reqRes.data;
          } catch (err) {
            console.error(`Error fetching requests for expense ${expense.id}:`, err);
          }
        }
        setExpenseRequests(requestsObj);
  
      } catch (err) {
        console.error('Error fetching expenses data:', err);
        setError('Failed to load expenses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user.id]);


  const filterExpenses = () => {
    return expenses.filter(expense => {
      const categoryMatch = !selectedCategory || expense.category === selectedCategory;
      const groupMatch = !selectedGroup || (expense.group?.id.toString() === selectedGroup);
      return categoryMatch && groupMatch;
    });
  };

  const getExpenseStatus = (expenseId) => {
    const requests = expenseRequests[expenseId] || [];
    if (requests.length === 0) return 'Unknown';
    
    const allFulfilled = requests.every(req => req.fulfilled);
    const someFulfilled = requests.some(req => req.fulfilled);
    
    if (allFulfilled) return 'Paid';
    if (someFulfilled) return 'Partially Paid';
    return 'Pending';
  };

  const getGroupName = (groupId) => {
    if (!groupId) return 'Personal';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  const filteredExpenses = filterExpenses();

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <h1>Expenses</h1>
        <div className="filters">
          <select 
            className="form-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
            <option value="Rent">Rent</option>
            <option value="Other">Other</option>
          </select>
          
          <select 
            className="form-control"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="expenses-container">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="expense-card">
              <div className="expense-header">
                <h2>{expense.name}</h2>
                <div className="expense-amount">${parseFloat(expense.amount).toFixed(2)}</div>
              </div>
              
              <div className="expense-details">
                <div className="expense-info">
                  <div>
                    <span className="label">Date:</span> 
                    <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="label">Category:</span> 
                    <span>{expense.category}</span>
                  </div>
                  <div>
                    <span className="label">Group:</span> 
                    <span>{getGroupName(expense.groupId)}</span>
                  </div>
                  <div>
                    <span className="label">Paid by:</span> 
                    <span>{expense.user && expense.user.username}</span>
                  </div>
                </div>
                
                <div className="expense-status">
                  <span className={`status-badge ${getExpenseStatus(expense.id).toLowerCase().replace(' ', '-')}`}>
                    {getExpenseStatus(expense.id)}
                  </span>
                </div>
              </div>
              
              {expenseRequests[expense.id] && expenseRequests[expense.id].length > 0 && (
                <div className="expense-requests">
                  <h3>Payment Requests</h3>
                  <div className="requests-list">
                    {expenseRequests[expense.id].map(request => (
                      <div key={request.id} className="request-item">
                        <div className="request-info">
                          <span>{request.debtor.username} owes {request.debtee.username}</span>
                          <span>${parseFloat(request.amount).toFixed(2)}</span>
                        </div>
                        <span className={`status-badge ${request.fulfilled ? 'completed' : 'pending'}`}>
                          {request.fulfilled ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No expenses found matching your filters.</p>
            <p>Create a new expense by clicking the "Create New Expense" button.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}

export default ExpensesPage; 