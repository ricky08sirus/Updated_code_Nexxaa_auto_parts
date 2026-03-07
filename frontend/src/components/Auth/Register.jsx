import React, { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { Alert } from '../Ui/Alert';
import { Input } from '../Ui/Input';
import { useNavigate } from 'react-router-dom';
import './Style.css'

export const Register = ({ isModal = false, onSuccess, switchToSignIn }) => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      await register(payload);
      if (isModal && onSuccess) {
        onSuccess(); 
    } else {
        navigate('/signin');
    }
 // ✅ redirect after register
    } catch (error) {
      setAlert({ type: 'error', message: 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join Nexxa Auto Parts</p>

        {alert && <Alert type={alert.type} message={alert.message} />}

        <div className="grid-2">
          <Input icon={User} placeholder="First Name" />
          <Input icon={User} placeholder="Last Name" />
        </div>

        <Input icon={Mail} placeholder="Email Address" />
        <Input icon={Lock} type="password" placeholder="Password" />
        <Input icon={Lock} type="password" placeholder="Confirm Password" />

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>

        <p className="auth-switch">
            Already have an account?{' '}
            <span onClick={() => isModal ? switchToSignIn() : navigate('/signin')}>
                Sign In
                </span>
                </p>
      </div>
    </div>
  );
};
