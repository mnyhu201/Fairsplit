import React from 'react';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {year} FairSplit. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer; 