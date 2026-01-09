// import React, { useState } from 'react';
// import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
// import { useAuth } from '../../Context/AuthContext';
// import { Alert } from '../Ui/Alert';
// import { Input } from '../Ui/Input';

// export const SignIn = ({ onSwitchToRegister }) => {
//   const { login } = useAuth();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validate = () => {
//     const newErrors = {};
    
//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
    
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     }
    
//     return newErrors;
//   };

//   const handleSubmit = async () => {
//     setAlert(null);
    
//     const newErrors = validate();
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setLoading(true);
    
//     try {
//       await login(formData.email, formData.password);
//       setAlert({ type: 'success', message: 'Login successful! Welcome back!' });
//     } catch (error) {
//       setAlert({ 
//         type: 'error', 
//         message: error.message || 'Login failed. Please check your credentials.' 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   return (
//     <div className="w-full max-w-md">
//       <div className="bg-white rounded-2xl shadow-xl p-8">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
//           <p className="text-gray-600 mt-2">Sign in to your account</p>
//         </div>

//         {alert && (
//           <div className="mb-6">
//             <Alert type={alert.type} message={alert.message} />
//           </div>
//         )}

//         <div className="space-y-4">
//           <Input
//             icon={Mail}
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             value={formData.email}
//             onChange={handleChange}
//             onKeyPress={handleKeyPress}
//             error={errors.email}
//           />

//           <div className="relative">
//             <Input
//               icon={Lock}
//               type={showPassword ? 'text' : 'password'}
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               onKeyPress={handleKeyPress}
//               error={errors.password}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>

//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? 'Signing In...' : 'Sign In'}
//           </button>
//         </div>

//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             Don't have an account?{' '}
//             <button
//               onClick={onSwitchToRegister}
//               className="text-blue-600 font-semibold hover:text-blue-700"
//             >
//               Create Account
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

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
