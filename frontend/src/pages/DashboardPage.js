import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupApi, requestApi, paymentApi, userApi } from '../services/api';
import './DashboardPage.css';

function DashboardPage({ user }) {
  const [groups, setGroups] = useState([]);
  const [unfulfilledRequests, setUnfulfilledRequests] = useState([]);
  const [receivableRequests, setReceivableRequests] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [updatedUser, setUpdatedUser] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showWithdrawBalanceModal, setShowWithdrawBalanceModal] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [amountToWithdraw, setAmountToWithdraw] = useState('');
  const [addingBalance, setAddingBalance] = useState(false);
  const [withdrawingBalance, setWithdrawingBalance] = useState(false);
  const [success, setSuccess] = useState('');

  // Update updatedUser when user prop changes
  useEffect(() => {
    setUpdatedUser(user);
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get latest user data with updated balance
        const userResponse = await userApi.getUser(user.id);
        setUpdatedUser(userResponse.data);
        
        // Fetch user's groups
        try {
          const groupsResponse = await groupApi.getAllGroups();
          // Filter groups where user is a member
          const userGroups = groupsResponse.data.filter(group => 
            group.users && group.users.some(u => u.id === user.id)
          );
          setGroups(userGroups);
        } catch (err) {
          console.error('Error fetching groups:', err);
          setGroups([]);
        }
        
        // Fetch unfulfilled requests where user is the debtor
        try {
          const unfulfilledRequestsResponse = await requestApi.getUnfulfilledDebtorRequests(user.id);
          setUnfulfilledRequests(unfulfilledRequestsResponse.data || []);
        } catch (err) {
          console.error('Error fetching unfulfilled requests:', err);
          setUnfulfilledRequests([]);
        }
        
        // Fetch requests where user is the debtee (receivables)
        try {
          const receivableRequestsResponse = await requestApi.getDebteeRequests(user.id);
          const pendingRequests = receivableRequestsResponse.data || [];
          const receivable = pendingRequests.filter(req => !req.fulfilled);
          setReceivableRequests(receivable);
        } catch (err) {
          console.error('Error fetching receivable requests:', err);
          setReceivableRequests([]);
        }
        
        // Fetch all payments related to the user
        try {
          const debtorPaymentsResponse = await paymentApi.getDebtorPayments(user.id);
          const debteePaymentsResponse = await paymentApi.getDebteePayments(user.id);
          
          // Combine and sort payments
          const allPayments = [
            ...(debtorPaymentsResponse.data || []), 
            ...(debteePaymentsResponse.data || [])
          ];
          
          const sortedPayments = allPayments
            .filter(payment => payment && payment.createdAt) // Ensure payment has createdAt
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5); // Get 5 most recent
          
          setRecentPayments(sortedPayments);
        } catch (err) {
          console.error('Error fetching payments:', err);
          setRecentPayments([]);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please refresh the page.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id, user]);

  const handleAddBalance = async (e) => {
    e.preventDefault();
    
    if (!amountToAdd || isNaN(parseFloat(amountToAdd)) || parseFloat(amountToAdd) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    setAddingBalance(true);
    setError('');
    setSuccess('');
    
    try {
      // Call API to add balance
      const amount = parseFloat(amountToAdd);
      const response = await userApi.addBalance(user.id, amount);
      
      // Update user with new balance
      setUpdatedUser(response.data);
      
      // Reset and close modal
      setAmountToAdd('');
      setShowAddBalanceModal(false);
      setSuccess('Money added successfully!');
    } catch (err) {
      setError('Failed to add balance. Please try again.');
      console.error('Error adding balance:', err);
    } finally {
      setAddingBalance(false);
    }
  };

  const handleWithdrawBalance = async (e) => {
    e.preventDefault();
    
    if (!amountToWithdraw || isNaN(parseFloat(amountToWithdraw)) || parseFloat(amountToWithdraw) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    // Check if user has enough balance
    if (parseFloat(amountToWithdraw) > (updatedUser.amount || 0)) {
      setError('Insufficient balance. You cannot withdraw more than your current balance.');
      return;
    }
    
    setWithdrawingBalance(true);
    setError('');
    setSuccess('');
    
    try {
      // Call API to subtract balance (negative value for withdrawal)
      const amount = -parseFloat(amountToWithdraw);
      const response = await userApi.addBalance(user.id, amount);
      
      // Update user with new balance
      setUpdatedUser(response.data);
      
      // Reset and close modal
      setAmountToWithdraw('');
      setShowWithdrawBalanceModal(false);
      setSuccess('Money withdrawn successfully!');
    } catch (err) {
      setError('Failed to withdraw balance. Please try again.');
      console.error('Error withdrawing balance:', err);
    } finally {
      setWithdrawingBalance(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Welcome, {updatedUser.fullname || updatedUser.username || 'User'}!</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="balance-card">
        <div className="balance-header">
          <h2>Your Balance</h2>
          <div className="balance-actions">
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setShowAddBalanceModal(true)}
            >
              Add Money
            </button>
            <button 
              className="btn btn-outline-primary btn-sm" 
              onClick={() => setShowWithdrawBalanceModal(true)}
              disabled={(updatedUser.amount || 0) <= 0}
            >
              Withdraw
            </button>
          </div>
        </div>
        <div className={`balance-amount ${(updatedUser.amount || 0) >= 0 ? 'positive' : 'negative'}`}>
          ${(updatedUser.amount || 0).toFixed(2)}
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>My Groups</h2>
            <Link to="/groups/create" className="btn btn-sm">Create Group</Link>
          </div>
          
          {groups.length > 0 ? (
            <ul className="group-list">
              {groups.map(group => (
                <li key={group.id} className="group-item">
                  <Link to={`/groups/${group.id}`} className="group-link">
                    <span className="group-name">{group.name}</span>
                    <span className="group-members">{group.users.length} members</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-message">You're not part of any groups yet.</p>
          )}
          
          {groups.length > 0 && (
            <div className="card-footer">
              <Link to="/groups" className="btn btn-link">View all groups</Link>
            </div>
          )}
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Due Payments</h2>
          </div>
          
          {unfulfilledRequests.length > 0 ? (
            <ul className="request-list">
              {unfulfilledRequests.map(request => (
                <li key={request.id} className="request-item">
                  <div className="request-details">
                    <div className="request-name">{request.expense?.name || 'Unnamed request'}</div>
                    <div className="request-info">
                      <span>To: {request.debtee?.username || 'Unknown'}</span>
                      <span className="request-amount">${(request.amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <Link 
                    to={`/requests`} 
                    className="btn btn-sm btn-success"
                  >
                    Pay
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-message">You don't have any payments due.</p>
          )}
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>To Receive</h2>
          </div>
          
          {receivableRequests.length > 0 ? (
            <ul className="request-list">
              {receivableRequests.map(request => (
                <li key={request.id} className="request-item">
                  <div className="request-details">
                    <div className="request-name">{request.expense?.name || 'Unnamed request'}</div>
                    <div className="request-info">
                      <span>From: {request.debtor?.username || 'Unknown'}</span>
                      <span className="request-amount">${(request.amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-message">You don't have any receivable payments.</p>
          )}
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>
          
          {recentPayments.length > 0 ? (
            <ul className="payment-list">
              {recentPayments.map(payment => (
                <li key={payment.id} className="payment-item">
                  <div className="payment-icon">
                    {payment.debtor?.id === user.id ? '↑' : '↓'}
                  </div>
                  <div className="payment-details">
                    <div className="payment-name">{payment.name || 'Unnamed payment'}</div>
                    <div className="payment-info">
                      {payment.debtor?.id === user.id 
                        ? `Paid to ${payment.debtee?.username || 'Unknown'}` 
                        : `Received from ${payment.debtor?.username || 'Unknown'}`}
                    </div>
                  </div>
                  <div className={`payment-amount ${payment.debtor?.id === user.id ? 'negative' : 'positive'}`}>
                    {payment.debtor?.id === user.id ? '-' : '+'}${(payment.amount || 0).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-message">No recent payment activity.</p>
          )}
          
          {recentPayments.length > 0 && (
            <div className="card-footer">
              <Link to="/payments" className="btn btn-link">View all payments</Link>
            </div>
          )}
        </div>
      </div>

      {/* Add Balance Modal */}
      {showAddBalanceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Money</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddBalanceModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddBalance}>
              <div className="form-group">
                <label htmlFor="amount">Amount to Add</label>
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
                    value={amountToAdd}
                    onChange={(e) => setAmountToAdd(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddBalanceModal(false)}
                  disabled={addingBalance}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addingBalance}
                >
                  {addingBalance ? 'Adding...' : 'Add Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Balance Modal */}
      {showWithdrawBalanceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Withdraw Money</h3>
              <button 
                className="modal-close"
                onClick={() => setShowWithdrawBalanceModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleWithdrawBalance}>
              <div className="form-group">
                <label htmlFor="withdraw-amount">Amount to Withdraw</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={(updatedUser.amount || 0).toString()}
                    id="withdraw-amount"
                    name="withdraw-amount"
                    className="form-control"
                    value={amountToWithdraw}
                    onChange={(e) => setAmountToWithdraw(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <small className="form-text text-muted">
                  Available balance: ${(updatedUser.amount || 0).toFixed(2)}
                </small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowWithdrawBalanceModal(false)}
                  disabled={withdrawingBalance}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={withdrawingBalance}
                >
                  {withdrawingBalance ? 'Withdrawing...' : 'Withdraw Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage; 