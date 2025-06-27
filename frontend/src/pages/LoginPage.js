import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { userApi } from '../services/api';
import './AuthPages.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, we'd have a dedicated login endpoint.
      // For this app, we'll use the getAllUsers endpoint and find the matching user
      const response = await userApi.getAllUsers();
      
      const user = response.data.find(user => 
        user.username === username && user.password === password
      );
      
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login to FairSplit</h1>
        <p className="subtitle">Sign in to manage your shared expenses</p>
        
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
          >
            {loading ? <Loader size="small" /> : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 