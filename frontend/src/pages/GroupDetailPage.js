import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { groupApi, expenseApi, userApi } from '../services/api';
import './GroupDetailPage.css';

function GroupDetailPage({ user }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [expenseFormVisible, setExpenseFormVisible] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    amount: '',
    category: 'General',
    assignedUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch group, expenses, and members
  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true);
      try {
        // Fetch group
        const groupResponse = await groupApi.getGroup(groupId);
        setGroup(groupResponse.data);
        setMembers(groupResponse.data.users);
        
        // Set all members as assigned by default in expense form
        setExpenseForm(prev => ({
          ...prev,
          assignedUsers: groupResponse.data.users.map(member => member.id)
        }));
        
        // Fetch expenses
        const expensesResponse = await expenseApi.getGroupExpenses(groupId);
        setExpenses(expensesResponse.data);
        
        // Fetch all users for adding new members
        const usersResponse = await userApi.getAllUsers();
        const nonMembers = usersResponse.data.filter(
          u => !groupResponse.data.users.some(member => member.id === u.id)
        );
        setAvailableUsers(nonMembers);
      } catch (err) {
        setError('Failed to load group data. Please try again.');
        console.error('Error fetching group data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupData();
  }, [groupId]);

  const handleExpenseFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleAssignedUser = (userId) => {
    setExpenseForm(prev => {
      const { assignedUsers } = prev;
      if (assignedUsers.includes(userId)) {
        return {
          ...prev,
          assignedUsers: assignedUsers.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          assignedUsers: [...assignedUsers, userId]
        };
      }
    });
  };

  const handleAddMember = async (userId) => {
    try {
      await groupApi.addUserToGroup(groupId, userId);
      
      // Refresh members list
      const groupResponse = await groupApi.getGroup(groupId);
      setGroup(groupResponse.data);
      setMembers(groupResponse.data.users);
      
      // Update available users
      const usersResponse = await userApi.getAllUsers();
      const nonMembers = usersResponse.data.filter(
        u => !groupResponse.data.users.some(member => member.id === u.id)
      );
      setAvailableUsers(nonMembers);
      
      setSuccess('Member added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add member. Please try again.');
      console.error('Error adding member:', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (userId === user.id) {
      if (!window.confirm('Are you sure you want to leave this group?')) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to remove this member?')) {
        return;
      }
    }
    
    try {
      await groupApi.removeUserFromGroup(groupId, userId);
      
      if (userId === user.id) {
        // If current user left the group, redirect to groups page
        navigate('/groups');
        return;
      }
      
      // Refresh members list
      const groupResponse = await groupApi.getGroup(groupId);
      setGroup(groupResponse.data);
      setMembers(groupResponse.data.users);
      
      // Update available users
      const usersResponse = await userApi.getAllUsers();
      const nonMembers = usersResponse.data.filter(
        u => !groupResponse.data.users.some(member => member.id === u.id)
      );
      setAvailableUsers(nonMembers);
      
      setSuccess('Member removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove member. Please try again.');
      console.error('Error removing member:', err);
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!expenseForm.name.trim()) {
      setError('Please enter an expense name.');
      return;
    }
    
    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    if (expenseForm.assignedUsers.length === 0) {
      setError('Please select at least one member to split with.');
      return;
    }
    
    try {
      const expenseData = {
        name: expenseForm.name.trim(),
        amount: amount,
        category: expenseForm.category,
        payer: { id: user.id },
        group: { id: parseInt(groupId) },
        assignedUsers: expenseForm.assignedUsers.map(id => ({ id }))
      };
      
      await expenseApi.createExpense(expenseData);
      
      // Reset form and hide it
      setExpenseForm({
        name: '',
        amount: '',
        category: 'General',
        assignedUsers: members.map(member => member.id)
      });
      setExpenseFormVisible(false);
      
      // Refresh expenses
      const expensesResponse = await expenseApi.getGroupExpenses(groupId);
      setExpenses(expensesResponse.data);
      
      setSuccess('Expense added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add expense. Please try again.');
      console.error('Error adding expense:', err);
    }
  };

  if (loading) {
    return <Loader center size="large" />;
  }

  if (!group) {
    return (
      <div className="group-detail-page">
        <Alert type="danger" message="Group not found." />
        <Link to="/groups" className="btn">Back to Groups</Link>
      </div>
    );
  }

  return (
    <div className="group-detail-page">
      <div className="page-header">
        <h1>{group.name}</h1>
        <div className="action-buttons">
          <button 
            className="btn"
            onClick={() => setExpenseFormVisible(!expenseFormVisible)}
          >
            {expenseFormVisible ? 'Cancel' : 'Add Expense'}
          </button>
        </div>
      </div>
      
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      
      {/* Expense Form */}
      {expenseFormVisible && (
        <div className="form-container">
          <h2>Add New Expense</h2>
          <form onSubmit={handleSubmitExpense}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Expense Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={expenseForm.name}
                  onChange={handleExpenseFormChange}
                  placeholder="Enter expense name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-control"
                  value={expenseForm.amount}
                  onChange={handleExpenseFormChange}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0.01"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={expenseForm.category}
                  onChange={handleExpenseFormChange}
                >
                  <option value="General">General</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Split with</label>
              <div className="user-grid">
                {members.map(member => (
                  <div 
                    key={member.id} 
                    className={`user-checkbox ${expenseForm.assignedUsers.includes(member.id) ? 'checked' : ''}`}
                    onClick={() => handleToggleAssignedUser(member.id)}
                  >
                    <span className="user-name">
                      {member.fullname || member.username}
                      {member.id === user.id && ' (You)'}
                    </span>
                    <span className="checkbox">
                      {expenseForm.assignedUsers.includes(member.id) && '✓'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setExpenseFormVisible(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="group-content">
        <div className="group-sidebar">
          <div className="members-card">
            <div className="card-header">
              <h2>Members ({members.length})</h2>
              <button 
                className="btn btn-sm"
                onClick={() => setShowAddMember(!showAddMember)}
              >
                {showAddMember ? 'Cancel' : 'Add'}
              </button>
            </div>
            
            {showAddMember && (
              <div className="add-member-section">
                <h3>Add Member</h3>
                {availableUsers.length > 0 ? (
                  <ul className="user-list">
                    {availableUsers.map(availableUser => (
                      <li key={availableUser.id} className="user-item">
                        <span className="user-name">{availableUser.fullname || availableUser.username}</span>
                        <button 
                          className="btn btn-sm"
                          onClick={() => handleAddMember(availableUser.id)}
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-message">No available users to add.</p>
                )}
              </div>
            )}
            
            <ul className="member-list">
              {members.map(member => (
                <li key={member.id} className="member-item">
                  <span className="member-name">
                    {member.fullname || member.username}
                    {member.id === user.id && ' (You)'}
                  </span>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    {member.id === user.id ? 'Leave' : 'Remove'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="group-main">
          <div className="expenses-card">
            <h2>Expenses</h2>
            
            {expenses.length > 0 ? (
              <div className="expense-list">
                <div className="expense-header">
                  <span className="expense-name-header">Name</span>
                  <span className="expense-amount-header">Amount</span>
                  <span className="expense-payer-header">Paid by</span>
                  <span className="expense-category-header">Category</span>
                </div>
                
                {expenses.map(expense => (
                  <div key={expense.id} className="expense-item">
                    <span className="expense-name">{expense.name}</span>
                    <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                    <span className="expense-payer">
                      {expense.payer.id === user.id ? 'You' : expense.payer.username}
                    </span>
                    <span className="expense-category">{expense.category}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No expenses yet. Add one to get started!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetailPage; 