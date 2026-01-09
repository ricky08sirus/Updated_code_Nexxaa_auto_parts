import React from 'react';
import './Input.css';

export const Input = ({ icon: Icon, type = 'text', error, ...props }) => {
  return (
    <div className="auth-input-wrapper">
      <div className="relative">
        <input
          type={type}
          className={`auth-input ${error ? 'auth-input-error' : ''}`}
          {...props}
        />

        {Icon && <Icon className="auth-input-icon" size={18} />}
      </div>

      {error && <p className="auth-input-error-text">{error}</p>}
    </div>
  );
};
