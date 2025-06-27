import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { groupApi, userApi } from '../services/api';
import './CreateGroupPage.css';

function CreateGroupPage({ user }) {
  const [groupName, setGroupName] = useState('');
  const [usernamesInput, setUsernamesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!groupName.trim()) {
      setError('Please enter a group name.');
      return;
    }
    
    // Parse usernames (comma or space separated)
    const enteredUsernames = usernamesInput
      .split(/[,\s]+/)
      .map(u => u.trim())
      .filter(u => u.length > 0 && u !== user.username);
    
    if (enteredUsernames.length < 1) {
      setError('Please enter at least one other username.');
      return;
    }
    
    setLoading(true);
    try {
      // Validate usernames via API
      const response = await userApi.getAllUsers();
      const allUsers = response.data;
      const foundUsers = allUsers.filter(u => enteredUsernames.includes(u.username));
      if (foundUsers.length !== enteredUsernames.length) {
        setError('One or more usernames are invalid.');
        setLoading(false);
        return;
      }
      // Always include the current user
      const userObjects = [user, ...foundUsers].map(u => ({ id: u.id }));
      const groupData = {
        name: groupName.trim(),
        isActive: true,
        users: userObjects
      };
      const groupResp = await groupApi.createGroup(groupData);
      setSuccess('Group created successfully!');
      setTimeout(() => {
        navigate(`/groups/${groupResp.data.id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to create group. Please try again.');
      console.error('Error creating group:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <h1>Create New Group</h1>
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              type="text"
              id="groupName"
              className="form-control"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="usernames">Other Members (usernames, comma or space separated)</label>
            <input
              type="text"
              id="usernames"
              className="form-control"
              value={usernamesInput}
              onChange={e => setUsernamesInput(e.target.value)}
              placeholder="e.g. alice, bob, charlie"
              disabled={loading}
            />
            <small className="form-text text-muted">You are always included as a member.</small>
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/groups')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? <Loader size="small" /> : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupPage; 