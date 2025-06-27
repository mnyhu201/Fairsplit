import React, { useState, useEffect } from 'react';
import { requestApi, userApi, paymentApi } from '../services/api';
import './RequestsPage.css';

function RequestsPage({ user }) {
  const [myRequests, setMyRequests] = useState([]);
  const [receivableRequests, setReceivableRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('toPay');
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [showRequestMoneyModal, setShowRequestMoneyModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    username: '',
    amount: '',
    description: ''
  });
  const [requestData, setRequestData] = useState({
    username: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      
      try {
        // Fetch requests where user is debtor (needs to pay)
        const debtorResponse = await requestApi.getDebtorRequests(user.id);
        setMyRequests(debtorResponse.data);
        
        // Fetch requests where user is debtee (needs to receive)
        const debteeResponse = await requestApi.getDebteeRequests(user.id);
        setReceivableRequests(debteeResponse.data);
      } catch (err) {
        setError('Failed to load requests. Please try again.');
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [user.id]);

  const handleAcceptRequest = async (requestId) => {
    setProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      // Use the accept request endpoint (this will also create a payment and update balances)
      await requestApi.acceptRequest(requestId);
      
      // Refresh the requests
      const debtorResponse = await requestApi.getDebtorRequests(user.id);
      setMyRequests(debtorResponse.data);
      
      const debteeResponse = await requestApi.getDebteeRequests(user.id);
      setReceivableRequests(debteeResponse.data);
      
      setSuccess('Payment successful! Your balance has been updated.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("You don't have enough balance to pay this request. Please add funds to your account.");
      } else {
        setError('Failed to process payment. Please try again.');
        console.error('Error accepting request:', err);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMoney = async (e) => {
    e.preventDefault();
    
    if (!paymentData.username || !paymentData.amount || !paymentData.description) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (isNaN(parseFloat(paymentData.amount)) || parseFloat(paymentData.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    setProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      // Create a direct payment without a request
      const payment = {
        name: paymentData.description,
        amount: parseFloat(paymentData.amount),
        debtor: { username: user.username },
        debtee: { username: paymentData.username }
      };
      
      await paymentApi.createPayment(payment);
      
      // Refresh the data
      const debtorResponse = await requestApi.getDebtorRequests(user.id);
      setMyRequests(debtorResponse.data);
      
      const debteeResponse = await requestApi.getDebteeRequests(user.id);
      setReceivableRequests(debteeResponse.data);
      
      // Reset form and show success
      setPaymentData({
        username: '',
        amount: '',
        description: ''
      });
      
      setSuccess('Payment sent successfully!');
      setShowSendMoneyModal(false);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          setError(`User '${paymentData.username}' not found. Please check the username and try again.`);
        } else if (err.response.status === 400) {
          setError("You don't have enough balance to make this payment. Please add funds to your account.");
        } else {
          setError('Failed to send payment. Please try again.');
        }
      } else {
        setError('Network error. Please try again later.');
      }
      console.error('Error sending payment:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });
  };

  const handleRequestMoney = async (e) => {
    e.preventDefault();
    if (!requestData.username || !requestData.amount || !requestData.description) {
      setError('Please fill in all fields.');
      return;
    }
    if (isNaN(parseFloat(requestData.amount)) || parseFloat(requestData.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      const req = {
        debtor: { username: requestData.username },
        debtee: { username: user.username },
        amount: parseFloat(requestData.amount),
        description: requestData.description
      };
      await requestApi.createStandaloneRequest(req);
      // Refresh requests
      const debtorResponse = await requestApi.getDebtorRequests(user.id);
      setMyRequests(debtorResponse.data);
      const debteeResponse = await requestApi.getDebteeRequests(user.id);
      setReceivableRequests(debteeResponse.data);
      setRequestData({ username: '', amount: '', description: '' });
      setSuccess('Request sent successfully!');
      setShowRequestMoneyModal(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError(`User '${requestData.username}' not found. Please check the username and try again.`);
      } else {
        setError('Failed to send request. Please try again.');
      }
      console.error('Error sending request:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: value });
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  const unfulfilledRequests = myRequests.filter(request => !request.fulfilled);
  const fulfilledRequests = myRequests.filter(request => request.fulfilled);
  const unfulfilledReceivables = receivableRequests.filter(request => !request.fulfilled);
  const fulfilledReceivables = receivableRequests.filter(request => request.fulfilled);

  return (
    <div className="requests-page">
      <h1>Requests</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      
      <div className="request-tabs">
        <button 
          className={`tab-button ${activeTab === 'toPay' ? 'active' : ''}`}
          onClick={() => setActiveTab('toPay')}
        >
          To Pay ({unfulfilledRequests.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'toReceive' ? 'active' : ''}`}
          onClick={() => setActiveTab('toReceive')}
        >
          To Receive ({unfulfilledReceivables.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>
      
      {activeTab === 'toPay' && (
        <div className="tab-content">
          <h2>Payments Due</h2>
          
          {unfulfilledRequests.length > 0 ? (
            <div className="requests-container">
              {unfulfilledRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.expense?.name || 'Unnamed request'}</h3>
                    <span className="request-amount">${(request.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="request-details">
                    <p><strong>Group:</strong> {request.group?.name || 'Personal'}</p>
                    <p><strong>To:</strong> {request.debtee?.username || 'Unknown'}</p>
                    <p><strong>For:</strong> {request.expense?.name || 'Expense'}</p>
                    <p><strong>Category:</strong> {request.expense?.category || 'Misc'}</p>
                    <p className="status-badge pending">Pending</p>
                  </div>
                  <div className="request-footer">
                    <button 
                      className="btn btn-success"
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">You don't have any payments due.</p>
          )}
        </div>
      )}
      
      {activeTab === 'toReceive' && (
        <div className="tab-content">
          <h2>Payments to Receive</h2>
          
          {unfulfilledReceivables.length > 0 ? (
            <div className="requests-container">
              {unfulfilledReceivables.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.expense?.name || 'Unnamed request'}</h3>
                    <span className="request-amount">${(request.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="request-details">
                    <p><strong>Group:</strong> {request.group?.name || 'Personal'}</p>
                    <p><strong>From:</strong> {request.debtor?.username || 'Unknown'}</p>
                    <p><strong>For:</strong> {request.expense?.name || 'Expense'}</p>
                    <p><strong>Category:</strong> {request.expense?.category || 'Misc'}</p>
                    <p className="status-badge pending">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">You don't have any payments to receive.</p>
          )}
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="tab-content">
          <h2>Payment History</h2>
          
          {fulfilledRequests.length > 0 || fulfilledReceivables.length > 0 ? (
            <div className="history-list">
              <div className="history-header">
                <span>Description</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              
              {fulfilledRequests.map(request => (
                <div key={`paid-${request.id}`} className="history-item">
                  <div className="history-description">
                    <p><strong>Paid to {request.debtee?.username || 'Unknown'}</strong></p>
                    <p className="history-group">Group: {request.group?.name || 'Personal'}</p>
                  </div>
                  <span className="history-amount negative">-${(request.amount || 0).toFixed(2)}</span>
                  <span className="status-badge completed">Paid</span>
                </div>
              ))}
              
              {fulfilledReceivables.map(request => (
                <div key={`received-${request.id}`} className="history-item">
                  <div className="history-description">
                    <p><strong>Received from {request.debtor?.username || 'Unknown'}</strong></p>
                    <p className="history-group">Group: {request.group?.name || 'Personal'}</p>
                  </div>
                  <span className="history-amount positive">+${(request.amount || 0).toFixed(2)}</span>
                  <span className="status-badge completed">Received</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No payment history available.</p>
          )}
        </div>
      )}
      
      {/* Send Money Modal */}
      {showSendMoneyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Send Money</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSendMoneyModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSendMoney}>
              <div className="form-group">
                <label htmlFor="username">Recipient Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  value={paymentData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
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
                    value={paymentData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="form-control"
                  value={paymentData.description}
                  onChange={handleInputChange}
                  placeholder="What's this payment for?"
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSendMoneyModal(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? 'Sending...' : 'Send Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Request Money Modal */}
      {showRequestMoneyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Money</h3>
              <button
                className="modal-close"
                onClick={() => setShowRequestMoneyModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRequestMoney}>
              <div className="form-group">
                <label htmlFor="request-username">From Username</label>
                <input
                  type="text"
                  id="request-username"
                  name="username"
                  className="form-control"
                  value={requestData.username}
                  onChange={handleRequestInputChange}
                  placeholder="Enter username to request from"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="request-amount">Amount</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    id="request-amount"
                    name="amount"
                    className="form-control"
                    value={requestData.amount}
                    onChange={handleRequestInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="request-description">Description</label>
                <input
                  type="text"
                  id="request-description"
                  name="description"
                  className="form-control"
                  value={requestData.description}
                  onChange={handleRequestInputChange}
                  placeholder="What's this request for?"
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRequestMoneyModal(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? 'Requesting...' : 'Request Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestsPage; 