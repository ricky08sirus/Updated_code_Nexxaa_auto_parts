// import React, { useState } from 'react';
// import { X } from 'lucide-react';
// import './AuthModal.css';

// const API_BASE = 'http://localhost:8000/api';

// const AuthModal = ({ isOpen, onClose, onSuccess }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     firstName: '',
//     lastName: '',
//     phone_number: ''
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   if (!isOpen) return null;

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     // Basic validation
//     if (!formData.email || !formData.password) {
//       setError('Please fill in all required fields');
//       setLoading(false);
//       return;
//     }

//     if (!isLogin) {
//       // Registration validation
//       if (!formData.firstName || !formData.lastName) {
//         setError('Please enter your full name');
//         setLoading(false);
//         return;
//       }
//       if (formData.password !== formData.confirmPassword) {
//         setError('Passwords do not match');
//         setLoading(false);
//         return;
//       }
//       if (formData.password.length < 6) {
//         setError('Password must be at least 6 characters');
//         setLoading(false);
//         return;
//       }
//     }

//     try {
//       // Make API call to backend
//       const endpoint = isLogin ? '/auth/login/' : '/auth/register/';
//       const payload = isLogin 
//         ? {
//             email: formData.email,
//             password: formData.password
//           }
//         : {
//             email: formData.email,
//             password: formData.password,
//             first_name: formData.firstName,
//             last_name: formData.lastName,
//             phone_number: formData.phone_number
//           };

//       const response = await fetch(`${API_BASE}${endpoint}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Handle API errors
//         if (data.details) {
//           // Extract first error message from details
//           const firstError = Object.values(data.details)[0];
//           throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
//         }
//         throw new Error(data.message || data.error || 'Authentication failed');
//       }

//       // Success - store token and user data
//       const userData = {
//         email: data.user?.email || data.email,
//         firstName: data.user?.first_name || data.first_name,
//         lastName: data.user?.last_name || data.last_name,
//         id: data.user?.id || data.id,
//         token: data.token || data.access_token
//       };

//       // Save to localStorage
//       localStorage.setItem('nexxaUser', JSON.stringify(userData));
//       localStorage.setItem('nexxaToken', userData.token);

//       // Call success callback
//       onSuccess(userData);
      
//       // Reset form
//       setFormData({
//         email: '',
//         password: '',
//         confirmPassword: '',
//         firstName: '',
//         lastName: '',
//         phone_number: ''
//       });
//       setLoading(false);

//     } catch (err) {
//       console.error('Auth error:', err);
//       setError(err.message || 'Something went wrong. Please try again.');
//       setLoading(false);
//     }
//   };

//   const toggleMode = () => {
//     setIsLogin(!isLogin);
//     setError('');
//     setFormData({
//       email: '',
//       password: '',
//       confirmPassword: '',
//       firstName: '',
//       lastName: '',
//       phone_number: ''
//     });
//   };

//   return (
//     <div className="auth-modal-overlay" onClick={onClose}>
//       <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
//         <button className="auth-modal-close" onClick={onClose}>
//           <X size={24} />
//         </button>

//         <div className="auth-modal-header">
//           <h2 className="auth-modal-title">
//             {isLogin ? 'Welcome Back' : 'Create Account'}
//           </h2>
//           <p className="auth-modal-subtitle">
//             {isLogin ? 'Sign in to continue' : 'Sign up to place your order'}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="auth-form">
//           {!isLogin && (
//             <div className="auth-form-row">
//               <div className="auth-form-group">
//                 <label className="auth-label">First Name</label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleInputChange}
//                   className="auth-input"
//                   placeholder="John"
//                   required={!isLogin}
//                   disabled={loading}
//                 />
//               </div>
//               <div className="auth-form-group">
//                 <label className="auth-label">Last Name</label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleInputChange}
//                   className="auth-input"
//                   placeholder="Doe"
//                   required={!isLogin}
//                   disabled={loading}
//                 />
//               </div>
//             </div>
//           )}

//           <div className="auth-form-group">
//             <label className="auth-label">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               className="auth-input"
//               placeholder="your@email.com"
//               required
//               disabled={loading}
//             />
//           </div>

//           <div className="auth-form-group">
//             <label className="auth-label">Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleInputChange}
//               className="auth-input"
//               placeholder="••••••••"
//               required
//               disabled={loading}
//             />
//           </div>

//           {!isLogin && (
//             <>
//               <div className="auth-form-group">
//                 <label className="auth-label">Confirm Password</label>
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleInputChange}
//                   className="auth-input"
//                   placeholder="••••••••"
//                   required
//                   disabled={loading}
//                 />
//               </div>
              
//               <div className="auth-form-group">
//                 <label className="auth-label">Phone Number (Optional)</label>
//                 <input
//                   type="tel"
//                   name="phone_number"
//                   value={formData.phone_number}
//                   onChange={handleInputChange}
//                   className="auth-input"
//                   placeholder="1234567890"
//                   disabled={loading}
//                 />
//               </div>
//             </>
//           )}

//           {error && (
//             <div className="auth-error">
//               {error}
//             </div>
//           )}

//           <button type="submit" className="auth-submit-btn" disabled={loading}>
//             {loading ? (
//               <span>Processing...</span>
//             ) : (
//               <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
//             )}
//           </button>

//           <div className="auth-divider">
//             <span>or</span>
//           </div>

//           <button 
//             type="button" 
//             onClick={toggleMode} 
//             className="auth-toggle-btn"
//             disabled={loading}
//           >
//             {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AuthModal;

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
