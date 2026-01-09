// import React, { useState } from 'react';
// import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';
// import { useAuth } from '../../Context/AuthContext';
// import { Alert } from '../Ui/Alert';
// import { Input } from '../Ui/Input';

// export const Register = ({ onSwitchToSignIn }) => {
//   const { register } = useAuth();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     first_name: '',
//     last_name: '',
//     phone_number: ''
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
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }
    
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     if (!formData.first_name) {
//       newErrors.first_name = 'First name is required';
//     }
    
//     if (!formData.last_name) {
//       newErrors.last_name = 'Last name is required';
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
//       const { confirmPassword, ...registerData } = formData;
//       await register(registerData);
//       setAlert({ type: 'success', message: 'Registration successful! Welcome!' });
//     } catch (error) {
//       setAlert({ 
//         type: 'error', 
//         message: error.message || 'Registration failed. Please try again.' 
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
//           <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
//           <p className="text-gray-600 mt-2">Sign up to get started</p>
//         </div>

//         {alert && (
//           <div className="mb-6">
//             <Alert type={alert.type} message={alert.message} />
//           </div>
//         )}

//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               icon={User}
//               name="first_name"
//               placeholder="First Name"
//               value={formData.first_name}
//               onChange={handleChange}
//               onKeyPress={handleKeyPress}
//               error={errors.first_name}
//             />
//             <Input
//               icon={User}
//               name="last_name"
//               placeholder="Last Name"
//               value={formData.last_name}
//               onChange={handleChange}
//               onKeyPress={handleKeyPress}
//               error={errors.last_name}
//             />
//           </div>

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

//           <Input
//             icon={Phone}
//             type="tel"
//             name="phone_number"
//             placeholder="Phone Number (Optional)"
//             value={formData.phone_number}
//             onChange={handleChange}
//             onKeyPress={handleKeyPress}
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

//           <Input
//             icon={Lock}
//             type="password"
//             name="confirmPassword"
//             placeholder="Confirm Password"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             onKeyPress={handleKeyPress}
//             error={errors.confirmPassword}
//           />

//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? 'Creating Account...' : 'Create Account'}
//           </button>
//         </div>

//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             Already have an account?{' '}
//             <button
//               onClick={onSwitchToSignIn}
//               className="text-blue-600 font-semibold hover:text-blue-700"
//             >
//               Sign In
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

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
