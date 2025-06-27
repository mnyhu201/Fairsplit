import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { userApi } from '../services/api';
import './AuthPages.css';

function RegisterPage({ onRegister }) {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { fullname, username, password, confirmPassword } = formData;
    
    // Basic validation
    if (!fullname || !username || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        fullname,
        username,
        password
      };
      
      const response = await userApi.register(userData);
      onRegister(response.data);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError('Username already exists. Please choose another username.');
      } else {
        setError('Registration failed. Please try again.');
        console.error('Registration error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create an Account</h1>
        <p className="subtitle">Join FairSplit to share expenses with friends and family</p>
        
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              className="form-control"
              value={formData.fullname}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
          >
            {loading ? <Loader size="small" /> : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage; 