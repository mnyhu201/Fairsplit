import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentApi, userApi } from '../services/api';
import './PaymentsPage.css';

function PaymentsPage({ user }) {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    username: '',
    groupId: null
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch all users except current user
        const usersResponse = await userApi.getAllUsers();
        const otherUsers = usersResponse.data.filter(u => u.id !== user.id);
        setUsers(otherUsers);
        
        // Fetch all payments where user is either debtor or debtee
        const debtorPaymentsResponse = await paymentApi.getDebtorPayments(user.id);
        const debteePaymentsResponse = await paymentApi.getDebteePayments(user.id);
        
        // Combine and sort by date (newest first)
        const allPayments = [
          ...debtorPaymentsResponse.data,
          ...debteePaymentsResponse.data
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setPayments(allPayments);
      } catch (err) {
        setError('Failed to load payments data. Please try again.');
        console.error('Error loading payments:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    console.log("name:", formData.name)
    console.log("username:", formData.username)
    console.log("amount:", formData.amount)
    

    // return; // DEBUGGING!

    // input validation
    if (!formData.name || !formData.amount || !formData.username) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    setProcessing(true);
    
    try {
      // get the debteeId
      let debtee = null
      try {
        const debteeResp = await userApi.getUserByUsername(formData.username)
        debtee = await debteeResp.data
      } catch(err) {
        if (err.response && err.response.status === 404) {
          alert("Invalid user, please confirm the username.")
        } else {
          alert("An error ocurred, please try again.")
        }
        return 
      }

      if (user.id == debtee.id){
        alert("You cannot send a payment to yourself.")
        return
      }


      // Create payment payload
      const paymentData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        debtor: user,
        debtee: debtee,
        group: null
      };
      
      // Send payment request
      await paymentApi.createPayment(paymentData);
      
      // Reset form and show success message
      setFormData({
        name: '',
        amount: '',
        username: '',
        groupId: null
      });
      
      // Refresh payments
      const debtorPaymentsResponse = await paymentApi.getDebtorPayments(user.id);
      const debteePaymentsResponse = await paymentApi.getDebteePayments(user.id);
      const allPayments = [
        ...debtorPaymentsResponse.data,
        ...debteePaymentsResponse.data
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setPayments(allPayments);
      setSuccess('Payment sent successfully!');
      setShowPaymentModal(false);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Insufficient funds. Please add money to your account.");
      } else {
        setError('Failed to send payment. Please try again.');
      }
      console.error('Error sending payment:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h1>Payments</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowPaymentModal(true)}
        >
          Send Money
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="payments-container">
        <h2>Payment History</h2>
        
        {payments.length > 0 ? (
          <div className="payment-history">
            {payments.map(payment => (
              <div key={payment.id} className="payment-card">
                <div className="payment-icon">
                  {payment.debtor.id === user.id ? '↑' : '↓'}
                </div>
                <div className="payment-details">
                  <div className="payment-primary">
                    <h3 className="payment-name">{payment.name}</h3>
                    <span className={`payment-amount ${payment.debtor.id === user.id ? 'negative' : 'positive'}`}>
                      {payment.debtor.id === user.id ? '-' : '+'}${payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="payment-secondary">
                    <div className="payment-info">
                      {payment.debtor.id === user.id 
                        ? `To: ${payment.debtee.username}` 
                        : `From: ${payment.debtor.username}`}
                    </div>
                    <div className="payment-date">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {payment.group && (
                    <div className="payment-group">
                      Group: {payment.group.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No payment history found.</p>
            <p>Send your first payment by clicking the "Send Money" button.</p>
          </div>
        )}
      </div>
      
      {/* Send Money Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Send Money</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitPayment}>
              <div className="form-group">
                <label htmlFor="name">Description</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="What's this payment for?"
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
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="username">Pay To</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Who's this payment for?"
                  required
                />
              </div>

              {/* <div className="form-group">
                <label htmlFor="debteeId">Pay To</label>
                <select
                  id="debteeId"
                  name="debteeId"
                  className="form-control"
                  value={formData.debteeId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a person</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullname || user.username}
                    </option>
                  ))}
                </select>
              </div> */}
              
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? 'Sending...' : 'Send Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsPage; 
