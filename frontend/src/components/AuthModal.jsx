import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Register } from './Auth/Register';
import { SignIn } from './Auth/SignIn';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('register'); 

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {mode === 'register' ? (
          <Register
            isModal
            onSuccess={onSuccess}
            switchToSignIn={() => setMode('signin')}
          />
        ) : (
          <SignIn
            isModal
            onSuccess={onSuccess}
            switchToRegister={() => setMode('register')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
