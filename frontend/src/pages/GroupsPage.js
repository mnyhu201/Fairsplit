import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { groupApi } from '../services/api';
import './GroupsPage.css';

function GroupsPage({ user }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await groupApi.getAllGroups();
        // Filter groups where user is a member
        const userGroups = response.data.filter(group => 
          group.users.some(u => u.id === user.id)
        );
        setGroups(userGroups);
      } catch (err) {
        setError('Failed to load groups. Please try again.');
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user.id]);

  if (loading) {
    return <Loader center size="large" />;
  }

  return (
    <div className="groups-page">
      <div className="page-header">
        <h1>My Groups</h1>
        <Link to="/groups/create" className="btn">Create New Group</Link>
      </div>
      
      {error && <Alert type="danger" message={error} />}
      
      {groups.length === 0 ? (
        <div className="empty-state">
          <p>You're not part of any groups yet.</p>
          <p>Create a group to start splitting expenses with friends and family.</p>
          <Link to="/groups/create" className="btn">Create Your First Group</Link>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map(group => (
            <div key={group.id} className="group-card">
              <h2 className="group-title">{group.name}</h2>
              <div className="group-members">
                <h3>Members ({group.users.length})</h3>
                <ul className="member-list">
                  {group.users.slice(0, 5).map(member => (
                    <li key={member.id} className="member-item">
                      <span className="member-name">{member.fullname || member.username}</span>
                      {member.id === user.id && <span className="member-tag">(You)</span>}
                    </li>
                  ))}
                  {group.users.length > 5 && (
                    <li className="member-item more-members">
                      +{group.users.length - 5} more members
                    </li>
                  )}
                </ul>
              </div>
              <div className="group-actions">
                <Link to={`/groups/${group.id}`} className="btn btn-primary">View Group</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupsPage; 