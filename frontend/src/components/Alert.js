import React, { useState, useEffect } from 'react';
import './Alert.css';

function Alert({ type, message, onClose, autoClose = true, autoCloseTime = 5000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, message, onClose]);

  if (!message || !visible) return null;

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-message">{message}</span>
      <button className="alert-close" onClick={handleClose}>×</button>
    </div>
  );
}

export default Alert; 