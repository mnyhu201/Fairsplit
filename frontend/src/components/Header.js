import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to={user ? '/dashboard' : '/'}>FairSplit</Link>
        </div>
        
        {user ? (
          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/groups">Groups</Link>
              </li>
              <li className="nav-item">
                <Link to="/expenses">Expenses</Link>
              </li>
              <li className="nav-item">
                <Link to="/requests">Requests</Link>
              </li>
              <li className="nav-item">
                <Link to="/payments">Payments</Link>
              </li>
              <li className="nav-item">
                <Link to="/splitter">Split Calculator</Link>
              </li>
              <li className="nav-item user-menu">
                <span>{user.username} </span>
                <div className="dropdown-menu">
                  <Link to="/profile">Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </li>
            </ul>
          </nav>
        ) : (
          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register">Register</Link>
              </li>
              <li className="nav-item">
                <Link to="/splitter">Split Calculator</Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header; 