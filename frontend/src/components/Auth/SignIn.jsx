import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { Alert } from '../Ui/Alert';
import { Input } from '../Ui/Input';
import { useNavigate } from 'react-router-dom';
import './Style.css'

export const SignIn = ({ isModal = false, onSuccess, switchToRegister }) => {

  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setAlert(null);

    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? 'Email is required' : '',
        password: !formData.password ? 'Password is required' : ''
      });
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      if (isModal && onSuccess) {
        onSuccess(); 
    } else {
        navigate('/');
    } 
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {alert && <Alert type={alert.type} message={alert.message} />}

        <Input
          icon={Mail}
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
        />

        <div className="relative">
          <Input
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="auth-switch">
  Don’t have an account?{' '}
  <span onClick={() => isModal ? switchToRegister() : navigate('/register')}>
    Create Account
  </span>
</p>

      </div>
    </div>
  );
};
