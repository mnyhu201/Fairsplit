import React, { useState } from 'react';
import './GuestUserPage.css';

function GuestUserPage() {
  const [total, setTotal] = useState('');
  const [members, setMembers] = useState('');
  const [each, setEach] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();
    const t = parseFloat(total);
    const m = parseInt(members, 10);
    if (m > 0) setEach((t / m).toFixed(2));
  };

  return (
    <>
      <main className="guest-page">
        <div className="guest-card">
          <h2 className="guest-title">Payment Splitter</h2>
          <p className="guest-subtitle">Enter total amount and number of members</p>

          <form className="guest-form" onSubmit={handleSubmit}>
            <div className="guest-form-group">
              <input
                type="number"
                placeholder="Total payment"
                min="0"
                step="0.01"
                required
                className="guest-input"
                value={total}
                onChange={e => setTotal(e.target.value)}
              />
            </div>
            <div className="guest-form-group">
              <input
                type="number"
                placeholder="# of members"
                min="1"
                step="1"
                required
                className="guest-input"
                value={members}
                onChange={e => setMembers(e.target.value)}
              />
            </div>
            <button type="submit" className="guest-button">
              Split
            </button>
          </form>

          {each !== null && (
            <div className="guest-result">Each pays: ${each}</div>
          )}
        </div>
      </main>

    </>
  );
}

export default GuestUserPage;