import React, { useState, useEffect } from 'react';
import { requestApi } from '../services/api';
import './RequestsPage.css';

function RequestsPage({ user }) {
  const [myRequests, setMyRequests] = useState([]);
  const [receivableRequests, setReceivableRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('toPay');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const debtorResponse = await requestApi.getDebtorRequests(user.id);
        setMyRequests(debtorResponse.data);
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
      await requestApi.acceptRequest(requestId);
      const [debtorResponse, debteeResponse] = await Promise.all([
        requestApi.getDebtorRequests(user.id),
        requestApi.getDebteeRequests(user.id),
      ]);
      setMyRequests(debtorResponse.data);
      setReceivableRequests(debteeResponse.data);
      setSuccess('Payment successful! Your balance has been updated.');
    } catch (err) {
      if (err.response?.status === 400) {
        setError("You don't have enough balance to pay this request. Please add funds to your account.");
      } else {
        setError('Failed to process payment. Please try again.');
        console.error('Error accepting request:', err);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  const unfulfilledRequests = myRequests.filter(r => !r.fulfilled);
  const fulfilledRequests   = myRequests.filter(r => r.fulfilled);
  const unfulfilledReceivables = receivableRequests.filter(r => !r.fulfilled);
  const fulfilledReceivables   = receivableRequests.filter(r => r.fulfilled);

  return (
    <div className="requests-page">
      <h1>Requests</h1>
      {error   && <div className="alert alert-danger">{error}</div>}
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
                    <span className="request-amount">
                      ${(request.amount || 0).toFixed(2)}
                    </span>
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
                    <span className="request-amount">
                      ${(request.amount || 0).toFixed(2)}
                    </span>
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
          {(fulfilledRequests.length > 0 || fulfilledReceivables.length > 0) ? (
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
                  <span className="history-amount negative">
                    -${(request.amount || 0).toFixed(2)}
                  </span>
                  <span className="status-badge completed">Paid</span>
                </div>
              ))}
              {fulfilledReceivables.map(request => (
                <div key={`received-${request.id}`} className="history-item">
                  <div className="history-description">
                    <p><strong>Received from {request.debtor?.username || 'Unknown'}</strong></p>
                    <p className="history-group">Group: {request.group?.name || 'Personal'}</p>
                  </div>
                  <span className="history-amount positive">
                    +${(request.amount || 0).toFixed(2)}
                  </span>
                  <span className="status-badge completed">Received</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No payment history available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RequestsPage;
