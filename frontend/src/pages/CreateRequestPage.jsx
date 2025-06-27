import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupApi, userApi } from '../services/api';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import './CreateRequestPage.css';

const CreateRequestPage = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    debtorId: '',
    groupId: ''
  });
  const [errors, setErrors] = useState({});
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const currentUser = user;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock data for development
        setGroups([
          { id: '1', name: 'Roommates' },
          { id: '2', name: 'Trip to France' }
        ]);
        
        setUsers([
          { id: '1', fullname: 'John Doe', username: 'johndoe' },
          { id: '2', fullname: 'Jane Smith', username: 'janesmith' }
        ]);
      } catch (err) {
        setError('Failed to load data. Please refresh the page.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateRequestData = (data) => {
    const errors = {};
    
    if (!data.title) {
      errors.title = 'Title is required';
    }
    
    if (!data.description) {
      errors.description = 'Description is required';
    }
    
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate form data
    const validation = validateRequestData({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    if (!formData.debtorId) {
      setErrors({
        ...errors,
        debtorId: 'Please select a person to request from'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Request created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        debtorId: '',
        groupId: ''
      });
      
      // Navigate to requests page after a short delay
      setTimeout(() => {
        navigate('/requests');
      }, 2000);
    } catch (err) {
      setError('Failed to create request. Please try again.');
      console.error('Error creating request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="create-request-container">
      <div className="create-request-header">
        <h1>Create Payment Request</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="create-request-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter request title"
              disabled={submitting}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this request is for"
              rows="3"
              disabled={submitting}
            ></textarea>
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
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
                className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                disabled={submitting}
              />
            </div>
            {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="debtorId">Request From</label>
            <select
              id="debtorId"
              name="debtorId"
              className={`form-control ${errors.debtorId ? 'is-invalid' : ''}`}
              value={formData.debtorId}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">Select a person</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullname || user.username}
                </option>
              ))}
            </select>
            {errors.debtorId && <div className="invalid-feedback">{errors.debtorId}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="groupId">Group (Optional)</label>
            <select
              id="groupId"
              name="groupId"
              className="form-control"
              value={formData.groupId}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">None (Personal request)</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/requests')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestPage; 