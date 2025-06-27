import React from 'react';
import { updateRequestStatus } from '../api/requestsApi';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const RequestCard = ({ request, refreshRequests }) => {
  const { currentUser } = useAuth();
  const isDebtor = currentUser.id === request.debtorId;
  
  const handleAction = async (status) => {
    try {
      await updateRequestStatus(request.id, status);
      refreshRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const statusBadge = () => {
    let badgeClass = 'status-badge ';
    
    switch(request.status) {
      case 'pending':
        badgeClass += 'pending';
        break;
      case 'approved':
        badgeClass += 'success';
        break;
      case 'rejected':
        badgeClass += 'danger';
        break;
      default:
        badgeClass += 'pending';
    }
    
    return (
      <span className={badgeClass}>
        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
      </span>
    );
  };

  return (
    <div className="request-card">
      <div className="request-header">
        <div className="request-amount">{formatCurrency(request.amount)}</div>
        {statusBadge()}
      </div>
      
      <div className="request-details">
        <div className="request-description">{request.description}</div>
        <div className="request-participants">
          <div><strong>From:</strong> {request.creditorName}</div>
          <div><strong>To:</strong> {request.debtorName}</div>
        </div>
        <div className="request-date">
          <strong>Requested on:</strong> {formatDate(request.createdAt)}
        </div>
      </div>
      
      {request.status === 'pending' && isDebtor && (
        <div className="request-actions">
          <button 
            className="action-button approve" 
            onClick={() => handleAction('approved')}
          >
            Approve
          </button>
          <button 
            className="action-button reject" 
            onClick={() => handleAction('rejected')}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard; 