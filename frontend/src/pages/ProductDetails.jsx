// // ProductDetails.jsx - Backend Integrated Version
// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./ProductDetails.css";

// // API Configuration
// const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
// console.log("API Base URL:", API_BASE_URL);

// const ProductDetails = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Get data from navigation state
//   const {
//     year,
//     manufacturerId,
//     manufacturerName,
//     modelId,
//     modelName,
//     partCategoryId,
//     partCategoryName,
//   } = location.state || {};

//   // Safety check if user opens page directly
//   if (!year || !manufacturerId || !modelId || !partCategoryId) {
//     return (
//       <div className="product-details">
//         <div className="product-error">
//           <h2>No product selected</h2>
//           <p>Please search for a product first.</p>
//           <button onClick={() => navigate("/")}>Go to Home</button>
//         </div>
//       </div>
//     );
//   }

//   // Form state
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     zipcode: "",
//     additional_notes: "",
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // Clear error when user starts typing
//     if (error) setError(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.name.trim()) {
//       setError("Please enter your name");
//       return;
//     }
//     if (!formData.email.trim() || !formData.email.includes("@")) {
//       setError("Please enter a valid email address");
//       return;
//     }
//     if (!formData.phone.trim() || formData.phone.length < 10) {
//       setError("Please enter a valid phone number");
//       return;
//     }
//     if (!formData.zipcode.trim() || formData.zipcode.length < 5) {
//       setError("Please enter a valid ZIP code");
//       return;
//     }

//     setSubmitting(true);
//     setError(null);

//     try {
//       // Prepare data for backend
//       const requestData = {
//         year: year,
//         manufacturer: manufacturerId,
//         model: modelId,
//         part_category: partCategoryId,
//         name: formData.name.trim(),
//         email: formData.email.trim(),
//         phone: formData.phone.trim(),
//         zipcode: formData.zipcode.trim(),
//         additional_notes: formData.additional_notes.trim(),
//       };

//       console.log("Submitting parts inquiry:", requestData);

//       const response = await fetch(`${API_BASE_URL}/parts-inquiry/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestData),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess(true);
//         setShowPopup(true);

//         // Reset form
//         setFormData({
//           name: "",
//           email: "",
//           phone: "",
//           zipcode: "",
//           additional_notes: "",
//         });

//         // Auto-close popup and redirect after 5 seconds
//         setTimeout(() => {
//           setShowPopup(false);
//           setTimeout(() => {
//             navigate("/");
//           }, 300); 
//         }, 5000);
//       } else {
//         // Handle validation errors from backend
//         if (data.errors) {
//           const errorMessages = Object.entries(data.errors)
//             .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
//             .join("\n");
//           setError(errorMessages);
//         } else {
//           setError(data.error || "Failed to submit request. Please try again.");
//         }
//       }
//     } catch (err) {
//       console.error("Error submitting parts inquiry:", err);
//       setError("Server error. Please check your connection and try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleClosePopup = () => {
//     setShowPopup(false);
//     setTimeout(() => {
//       navigate("/");
//     }, 300);
//   };

//   return (
//     <div className="product-details">
//       {/* Animated Success Popup */}
//       {showPopup && (
//         <div className="success-popup-overlay" onClick={handleClosePopup}>
//           <div
//             className="success-popup"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Confetti elements */}
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>

//             <div className="success-popup-content">
//               <div className="success-icon-wrapper">
//                 <div className="success-icon">✓</div>
//               </div>

//               <h3>Request Received!</h3>
//               <p>
//                 Thank you for your inquiry! We've received your request for the
//                 {" "}
//                 <strong>{partCategoryName}</strong> for your {year}{" "}
//                 {manufacturerName} {modelName}.
//               </p>
//               <p>
//                 Our team will review your request and contact you within 2-45
//                 minutes with availability and pricing information.
//               </p>

//               <button
//                 className="success-popup-close"
//                 onClick={handleClosePopup}
//               >
//                 Got it!
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <section className="product-form-section">
//         {/* Dynamic Heading */}
//         <h1 className="product-heading">
//           Find Qualified Quality Used {partCategoryName} for {year}{" "}
//           {manufacturerName} {modelName}
//         </h1>

//         <p className="product-subheading">
//           Fill the form below and our team will contact you shortly with
//           availability and pricing.
//         </p>

//         {/* Error Message */}
//         {error && (
//           <div className="error-message">
//             <div className="error-icon">⚠️</div>
//             <p>{error}</p>
//           </div>
//         )}

//         {/* Parts Inquiry Form */}
//         {!success && (
//           <form className="product-form" onSubmit={handleSubmit}>
//             {/* Vehicle Information (Read-only) */}
//             <div className="form-section">
//               <h3 className="form-section-title">Vehicle Information</h3>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Year</label>
//                   <input
//                     type="text"
//                     value={year}
//                     readOnly
//                     className="readonly-input"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Manufacturer</label>
//                   <input
//                     type="text"
//                     value={manufacturerName}
//                     readOnly
//                     className="readonly-input"
//                   />
//                 </div>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Model</label>
//                   <input
//                     type="text"
//                     value={modelName}
//                     readOnly
//                     className="readonly-input"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Part Needed</label>
//                   <input
//                     type="text"
//                     value={partCategoryName}
//                     readOnly
//                     className="readonly-input"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Customer Information */}
//             <div className="form-section">
//               <h3 className="form-section-title">Your Contact Information</h3>

//               <div className="form-group">
//                 <label htmlFor="name">
//                   Full Name <span className="required">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   placeholder="Enter your full name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                   disabled={submitting}
//                 />
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label htmlFor="email">
//                     Email Address <span className="required">*</span>
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     placeholder="your.email@example.com"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     disabled={submitting}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label htmlFor="phone">
//                     Phone Number <span className="required">*</span>
//                   </label>
//                   <input
//                     type="tel"
//                     id="phone"
//                     name="phone"
//                     placeholder="(123) 456-7890"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label htmlFor="zipcode">
//                   ZIP Code <span className="required">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="zipcode"
//                   name="zipcode"
//                   placeholder="12345"
//                   value={formData.zipcode}
//                   onChange={handleChange}
//                   required
//                   disabled={submitting}
//                   maxLength="10"
//                 />
//               </div>

//               {/* <div className="form-group">
//                 <label htmlFor="additional_notes">
//                   Additional Notes (Optional)
//                 </label>
//                 <textarea
//                   id="additional_notes"
//                   name="additional_notes"
//                   placeholder="Any specific requirements or questions about the part..."
//                   value={formData.additional_notes}
//                   onChange={handleChange}
//                   rows="4"
//                   disabled={submitting}
//                 />
//               </div> */}
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               className="submit-button"
//               disabled={submitting}
//             >
//               {submitting
//                 ? (
//                   <>
//                     <span className="spinner"></span>
//                     Submitting...
//                   </>
//                 )
//                 : (
//                   "Search Parts"
//                 )}
//             </button>

//             <p className="form-note">
//               <strong>Note:</strong> All fields marked with{" "}
//               <span className="required">*</span>{" "}
//               are required. We typically respond within 24-48 hours.
//             </p>
//           </form>
//         )}

//         {/* Features Section */}
//         <div className="features-grid">
//           <div className="feature-item">
//             <span className="feature-icon">⚡</span>
//             <div>
//               <h4>Fast Response</h4>
//               <p>24-48 hour quote turnaround</p>
//             </div>
//           </div>
//           <div className="feature-item">
//             <span className="feature-icon">💰</span>
//             <div>
//               <h4>Competitive Pricing</h4>
//               <p>Best deals on quality parts</p>
//             </div>
//           </div>
//           <div className="feature-item">
//             <span className="feature-icon">✅</span>
//             <div>
//               <h4>Quality Guaranteed</h4>
//               <p>Tested and verified parts</p>
//             </div>
//           </div>
//           <div className="feature-item">
//             <span className="feature-icon">🚚</span>
//             <div>
//               <h4>Nationwide Shipping</h4>
//               <p>Fast delivery across USA</p>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default ProductDetails;

// ProductDetails.jsx - Backend Integrated Version with Welcome Offer
// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";
// import "./ProductDetails.css";
// import "./WelcomeOffer.css";
// import logoImage from "../assets/images/brands/Nexxa Logo (2).png";


// // API Configuration
// const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
// console.log("API Base URL:", API_BASE_URL);

// const ProductDetails = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Get data from navigation state
//   const {
//     year,
//     manufacturerId,
//     manufacturerName,
//     modelId,
//     modelName,
//     partCategoryId,
//     partCategoryName,
//   } = location.state || {};

//   // Safety check if user opens page directly
//   if (!year || !manufacturerId || !modelId || !partCategoryId) {
//     return (
//       <div className="product-details">
//         <div className="product-error">
//           <h2>No product selected</h2>
//           <p>Please search for a product first.</p>
//           <button onClick={() => navigate("/")}>Go to Home</button>
//         </div>
//       </div>
//     );
//   }

//   // Form state
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     zipcode: "",
//     additional_notes: "",
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);

//   // Welcome Offer states
//   const [showWelcomePopup, setShowWelcomePopup] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [copied, setCopied] = useState(false);

//   const couponCode = "WEL-NAP-1002";

//   // Check if mobile and show popup on mount
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 992);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);

//     // Show popup on mobile after a short delay
//     if (window.innerWidth < 992) {
//       setTimeout(() => {
//         setShowWelcomePopup(true);
//       }, 500);
//     }

//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Copy coupon code
//   const handleCopyCoupon = () => {
//     navigator.clipboard.writeText(couponCode).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     });
//   };

//   // Close welcome popup
//   const handleCloseWelcomePopup = () => {
//     setShowWelcomePopup(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // Clear error when user starts typing
//     if (error) setError(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.name.trim()) {
//       setError("Please enter your name");
//       return;
//     }
//     if (!formData.email.trim() || !formData.email.includes("@")) {
//       setError("Please enter a valid email address");
//       return;
//     }
//     if (!formData.phone.trim() || formData.phone.length < 10) {
//       setError("Please enter a valid phone number");
//       return;
//     }
//     if (!formData.zipcode.trim() || formData.zipcode.length < 5) {
//       setError("Please enter a valid ZIP code");
//       return;
//     }

//     setSubmitting(true);
//     setError(null);

//     try {
//       // Prepare data for backend
//       const requestData = {
//         year: year,
//         manufacturer: manufacturerId,
//         model: modelId,
//         part_category: partCategoryId,
//         name: formData.name.trim(),
//         email: formData.email.trim(),
//         phone: formData.phone.trim(),
//         zipcode: formData.zipcode.trim(),
//         additional_notes: formData.additional_notes.trim(),
//       };

//       console.log("Submitting parts inquiry:", requestData);

//       const response = await fetch(`${API_BASE_URL}/parts-inquiry/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestData),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess(true);
//         setShowPopup(true);

//         // Reset form
//         setFormData({
//           name: "",
//           email: "",
//           phone: "",
//           zipcode: "",
//           additional_notes: "",
//         });

//         // Auto-close popup and redirect after 5 seconds
//         setTimeout(() => {
//           setShowPopup(false);
//           setTimeout(() => {
//             navigate("/");
//           }, 300); 
//         }, 5000);
//       } else {
//         // Handle validation errors from backend
//         if (data.errors) {
//           const errorMessages = Object.entries(data.errors)
//             .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
//             .join("\n");
//           setError(errorMessages);
//         } else {
//           setError(data.error || "Failed to submit request. Please try again.");
//         }
//       }
//     } catch (err) {
//       console.error("Error submitting parts inquiry:", err);
//       setError("Server error. Please check your connection and try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleClosePopup = () => {
//     setShowPopup(false);
//     setTimeout(() => {
//       navigate("/");
//     }, 300);
//   };

//   // Welcome Offer Component
//   const WelcomeOfferPoster = ({ isPopup = false }) => (
//     <div className={`welcome-offer-poster ${isPopup ? 'popup-version' : 'sidebar-version'}`}>
//       <div className="poster-background"></div>
      
//       <div className="poster-content">
//         <div className="poster-logo">
//           <Link to="/" className="flex items-center shrink-0">
//               <img src={logoImage} alt="Nexxa Logo" className="h-9 w-auto" />
//             </Link>
//         </div>

//         <div className="welcome-badge">
//           <span className="welcome-text">Welcome</span>
//           <span className="offer-text">Offer</span>
//         </div>

//         <div className="discount-box">
//           <div className="get-text">GET</div>
//           <div className="discount-percent">
//             <span className="percent-number">15</span>
//             <span className="percent-symbol">%</span>
//             <span className="off-text">OFF</span>
//           </div>
//           <div className="purchase-text">YOUR FIRST</div>
//           <div className="purchase-text-large">PURCHASE*</div>
//         </div>

//         <div className="code-section">
//           <div className="use-code-text">USE CODE :</div>
//           <div className="coupon-code-box">
//             <input 
//               type="text" 
//               value={couponCode} 
//               readOnly 
//               className="coupon-input"
//             />
//             <button 
//               className="copy-button" 
//               onClick={handleCopyCoupon}
//               title="Copy code"
//             >
//               {copied ? (
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <polyline points="20 6 9 17 4 12"></polyline>
//                 </svg>
//               ) : (
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
//                   <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
//                 </svg>
//               )}
//             </button>
//           </div>
//           {copied && <div className="copied-message">Copied!</div>}
//         </div>

//         <div className="auto-send-text">
//           This Coupon Code<br />
//           Automatically Send's to Your E-Mail
//         </div>

//         <div className="floating-gears">
//           <div className="gear gear-1"></div>
//           <div className="gear gear-2"></div>
//           <div className="gear gear-3"></div>
//         </div>
        
//       </div>
      
//     </div>
    
//   );

//   return (
//     <div className="product-details">
//       {/* Mobile Welcome Popup */}
//       {isMobile && showWelcomePopup && (
//         <div className="welcome-popup-overlay" onClick={handleCloseWelcomePopup}>
//           <div className="welcome-popup-container" onClick={(e) => e.stopPropagation()}>
//             <button className="close-popup-btn" onClick={handleCloseWelcomePopup}>
//               ×
//             </button>
//             <WelcomeOfferPoster isPopup={true} />
//           </div>
//         </div>
//       )}

//       {/* Animated Success Popup */}
//       {showPopup && (
//         <div className="success-popup-overlay" onClick={handleClosePopup}>
//           <div
//             className="success-popup"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Confetti elements */}
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>
//             <div className="confetti"></div>

//             <div className="success-popup-content">
//               <div className="success-icon-wrapper">
//                 <div className="success-icon">✓</div>
//               </div>

//               <h3>Request Received!</h3>
//               <p>
//                 Thank you for your inquiry! We've received your request for the
//                 {" "}
//                 <strong>{partCategoryName}</strong> for your {year}{" "}
//                 {manufacturerName} {modelName}.
//               </p>
//               <p>
//                 Our team will review your request and contact you within 2-45
//                 minutes with availability and pricing information.
//               </p>

//               <button
//                 className="success-popup-close"
//                 onClick={handleClosePopup}
//               >
//                 Got it!
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="product-details-container">
//         {/* Desktop Sidebar Welcome Offer */}
//         {!isMobile && (
//           <aside className="welcome-offer-sidebar">
//             <WelcomeOfferPoster />
//           </aside>
          
//         )}

//         <section className="product-form-section">
//           {/* Dynamic Heading */}
//           <h1 className="product-heading">
//             Find Qualified Quality Used {partCategoryName} for {year}{" "}
//             {manufacturerName} {modelName}
//           </h1>

//           <p className="product-subheading">
//             Fill the form below and our team will contact you shortly with
//             availability and pricing.
//           </p>

//           {/* Error Message */}
//           {error && (
//             <div className="error-message">
//               <div className="error-icon">⚠️</div>
//               <p>{error}</p>
//             </div>
//           )}

//           {/* Parts Inquiry Form */}
//           {!success && (
//             <form className="product-form" onSubmit={handleSubmit}>
//               {/* Vehicle Information (Read-only) */}
//               <div className="form-section">
//                 <h3 className="form-section-title">Vehicle Information</h3>

//                 <div className="form-row">
//                   <div className="form-group">
//                     <label>Year</label>
//                     <input
//                       type="text"
//                       value={year}
//                       readOnly
//                       className="readonly-input"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Manufacturer</label>
//                     <input
//                       type="text"
//                       value={manufacturerName}
//                       readOnly
//                       className="readonly-input"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-row">
//                   <div className="form-group">
//                     <label>Model</label>
//                     <input
//                       type="text"
//                       value={modelName}
//                       readOnly
//                       className="readonly-input"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Part Needed</label>
//                     <input
//                       type="text"
//                       value={partCategoryName}
//                       readOnly
//                       className="readonly-input"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Customer Information */}
//               <div className="form-section">
//                 <h3 className="form-section-title">Your Contact Information</h3>

//                 <div className="form-group">
//                   <label htmlFor="name">
//                     Full Name <span className="required">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     id="name"
//                     name="name"
//                     placeholder="Enter your full name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                     disabled={submitting}
//                   />
//                 </div>

//                 <div className="form-row">
//                   <div className="form-group">
//                     <label htmlFor="email">
//                       Email Address <span className="required">*</span>
//                     </label>
//                     <input
//                       type="email"
//                       id="email"
//                       name="email"
//                       placeholder="your.email@example.com"
//                       value={formData.email}
//                       onChange={handleChange}
//                       required
//                       disabled={submitting}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="phone">
//                       Phone Number <span className="required">*</span>
//                     </label>
//                     <input
//                       type="tel"
//                       id="phone"
//                       name="phone"
//                       placeholder="(123) 456-7890"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       required
//                       disabled={submitting}
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label htmlFor="zipcode">
//                     ZIP Code <span className="required">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     id="zipcode"
//                     name="zipcode"
//                     placeholder="12345"
//                     value={formData.zipcode}
//                     onChange={handleChange}
//                     required
//                     disabled={submitting}
//                     maxLength="10"
//                   />
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 className="submit-button"
//                 disabled={submitting}
//               >
//                 {submitting
//                   ? (
//                     <>
//                       <span className="spinner"></span>
//                       Submitting...
//                     </>
//                   )
//                   : (
//                     "Search Parts"
//                   )}
//               </button>

//               <p className="form-note">
//                 <strong>Note:</strong> All fields marked with{" "}
//                 <span className="required">*</span>{" "}
//                 are required. We typically respond within 24-48 hours.
//               </p>
//             </form>
//           )}

//           {/* Features Section */}
//           <div className="features-grid">
//             <div className="feature-item">
//               <span className="feature-icon">⚡</span>
//               <div>
//                 <h4>Fast Response</h4>
//                 <p>24-48 hour quote turnaround</p>
//               </div>
//             </div>
//             <div className="feature-item">
//               <span className="feature-icon">💰</span>
//               <div>
//                 <h4>Competitive Pricing</h4>
//                 <p>Best deals on quality parts</p>
//               </div>
//             </div>
//             <div className="feature-item">
//               <span className="feature-icon">✅</span>
//               <div>
//                 <h4>Quality Guaranteed</h4>
//                 <p>Tested and verified parts</p>
//               </div>
//             </div>
//             <div className="feature-item">
//               <span className="feature-icon">🚚</span>
//               <div>
//                 <h4>Nationwide Shipping</h4>
//                 <p>Fast delivery across USA</p>
//               </div>
//             </div>
//           </div>

//           {/* Mobile: Welcome Offer Below Form */}
//           {isMobile && !showWelcomePopup && (
//             <div className="welcome-offer-mobile-section">
//               <WelcomeOfferPoster />
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// };

// export default ProductDetails;


// ProductDetails.jsx - Backend Integrated Version with Welcome Offer and Terms
import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "./ProductDetails.css";
import "./WelcomeOffer.css";
import logoImage from "../assets/images/brands/Nexxa Logo (2).png";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
console.log("API Base URL:", API_BASE_URL);

const ProductDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get data from URL parameters
  const year = searchParams.get('year');
  const manufacturerId = searchParams.get('manufacturerId');
  const manufacturerName = searchParams.get('manufacturerName');
  const modelId = searchParams.get('modelId');
  const modelName = searchParams.get('modelName');
  const partCategoryId = searchParams.get('partCategoryId');
  const partCategoryName = searchParams.get('partCategoryName');


  // Safety check if user opens page directly
  if (!year || !manufacturerId || !modelId || !partCategoryId) {
    return (
      <div className="product-details">
        <div className="product-error">
          <h2>No product selected</h2>
          <p>Please search for a product first.</p>
          <button onClick={() => navigate("/")}>Go to Home</button>
        </div>
      </div>
    );
  }

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zipcode: "",
    additional_notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Welcome Offer states
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const couponCode = "WEL-NAP-1002";

  // Check if mobile and show popup on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Show popup on mobile after a short delay
    if (window.innerWidth < 992) {
      setTimeout(() => {
        setShowWelcomePopup(true);
      }, 500);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Copy coupon code
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Close welcome popup
  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
  };

  // Toggle terms
  const toggleTerms = () => {
    setTermsOpen(!termsOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    if (!formData.zipcode.trim() || formData.zipcode.length < 5) {
      setError("Please enter a valid ZIP code");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare data for backend
      const requestData = {
        year: parseInt(year),
        manufacturer: parseInt(manufacturerId),
        model: parseInt(modelId),
        part_category: parseInt(partCategoryId),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        zipcode: formData.zipcode.trim(),
        additional_notes: formData.additional_notes.trim(),
      };

      console.log("Submitting parts inquiry:", requestData);

      const response = await fetch(`${API_BASE_URL}/parts-inquiry/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setShowPopup(true);

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          zipcode: "",
          additional_notes: "",
        });

        // Auto-close popup and redirect after 5 seconds
        setTimeout(() => {
          setShowPopup(false);
          setTimeout(() => {
            navigate("/");
          }, 300); 
        }, 5000);
      } else {
        // Handle validation errors from backend
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          setError(errorMessages);
        } else {
          setError(data.error || "Failed to submit request. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error submitting parts inquiry:", err);
      setError("Server error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

  // Welcome Offer Component
  const WelcomeOfferPoster = ({ isPopup = false }) => (
    <div className={`welcome-offer-poster ${isPopup ? 'popup-version' : 'sidebar-version'}`}>
      <div className="poster-background"></div>
      
      <div className="poster-content">
        <div className="poster-logo">
          <Link to="/" className="flex items-center shrink-0">
            <img src={logoImage} alt="Nexxa Logo" className="h-9 w-auto" />
          </Link>
        </div>

        <div className="welcome-badge">
          <span className="welcome-text">Welcome</span>
          <span className="offer-text">Offer</span>
        </div>

        <div className="discount-box">
          <div className="get-text">GET</div>
          <div className="discount-percent">
            <span className="percent-number">15</span>
            <span className="percent-symbol">%</span>
            <span className="off-text">OFF</span>
          </div>
          <div className="purchase-text">YOUR FIRST</div>
          <div className="purchase-text-large">PURCHASE*</div>
        </div>

        <div className="code-section">
          <div className="use-code-text">USE CODE :</div>
          <div className="coupon-code-box">
            <input 
              type="text" 
              value={couponCode} 
              readOnly 
              className="coupon-input"
            />
            <button 
              className="copy-button" 
              onClick={handleCopyCoupon}
              title="Copy code"
            >
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
          {copied && <div className="copied-message">Copied!</div>}
        </div>

        <div className="auto-send-text">
          This Coupon Code<br />
          Automatically Send's to Your E-Mail
        </div>

        <div className="floating-gears">
          <div className="gear gear-1"></div>
          <div className="gear gear-2"></div>
          <div className="gear gear-3"></div>
        </div>
      </div>
    </div>
  );

  // Terms & Conditions Component
  const TermsAndConditions = () => (
    <div className="terms-section">
      <div className="terms-header" onClick={toggleTerms}>
        <span className="terms-title">TERMS & CONDITIONS</span>
        <svg 
          className={`terms-toggle ${termsOpen ? 'open' : ''}`}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div className={`terms-content ${termsOpen ? 'open' : ''}`}>
        <div className="terms-text">
          <p>
            <strong>1. New Customers Only:</strong> Require account creation or while placing the order over call. The coupon will only work for the email/user ID/Order Number from Nexxa Auto Parts used at checkout for the first time.
          </p>
          <p>
            <strong>2. One-Time Use:</strong> The code can only be used once per customer.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="product-details">
      {/* Mobile Welcome Popup */}
      {isMobile && showWelcomePopup && (
        <div className="welcome-popup-overlay" onClick={handleCloseWelcomePopup}>
          <div className="welcome-popup-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup-btn" onClick={handleCloseWelcomePopup}>
              ×
            </button>
            <WelcomeOfferPoster isPopup={true} />
          </div>
        </div>
      )}

      {/* Animated Success Popup */}
      {showPopup && (
        <div className="success-popup-overlay" onClick={handleClosePopup}>
          <div className="success-popup" onClick={(e) => e.stopPropagation()}>
            {/* Confetti elements */}
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>

            <div className="success-popup-content">
              <div className="success-icon-wrapper">
                <div className="success-icon">✓</div>
              </div>

              <h3>Request Received!</h3>
              <p>
                Thank you for your inquiry! We've received your request for the
                {" "}
                <strong>{partCategoryName}</strong> for your {year}{" "}
                {manufacturerName} {modelName}.
              </p>
              <p>
                Our team will review your request and contact you within 2-45
                minutes with availability and pricing information.
              </p>

              <button className="success-popup-close" onClick={handleClosePopup}>
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="product-details-container">
        {/* Desktop Sidebar Welcome Offer */}
        {!isMobile && (
          <aside className="welcome-offer-sidebar">
            <WelcomeOfferPoster />
            <TermsAndConditions />
          </aside>
        )}

        <section className="product-form-section">
          {/* Dynamic Heading */}
          <h1 className="product-heading">
            Find Qualified Quality Used {partCategoryName} for {year}{" "}
            {manufacturerName} {modelName}
          </h1>

          <p className="product-subheading">
            Fill the form below and our team will contact you shortly with
            availability and pricing.
          </p>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
            </div>
          )}

          {/* Parts Inquiry Form */}
          {!success && (
            <form className="product-form" onSubmit={handleSubmit}>
              {/* Vehicle Information (Read-only) */}
              <div className="form-section">
                <h3 className="form-section-title">Vehicle Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="text"
                      value={year}
                      readOnly
                      className="readonly-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Manufacturer</label>
                    <input
                      type="text"
                      value={manufacturerName}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Model</label>
                    <input
                      type="text"
                      value={modelName}
                      readOnly
                      className="readonly-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Part Needed</label>
                    <input
                      type="text"
                      value={partCategoryName}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="form-section">
                <h3 className="form-section-title">Your Contact Information</h3>

                <div className="form-group">
                  <label htmlFor="name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Phone Number <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="(123) 456-7890"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="zipcode">
                    ZIP Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    placeholder="12345"
                    value={formData.zipcode}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    maxLength="10"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting
                  ? (
                    <>
                      <span className="spinner"></span>
                      Submitting...
                    </>
                  )
                  : (
                    "Search Parts"
                  )}
              </button>

              <p className="form-note">
                <strong>Note:</strong> All fields marked with{" "}
                <span className="required">*</span>{" "}
                are required. We typically respond within 24-48 hours.
              </p>
            </form>
          )}

          {/* Features Section */}
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <h4>Fast Response</h4>
                <p>24-48 hour quote turnaround</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <div>
                <h4>Competitive Pricing</h4>
                <p>Best deals on quality parts</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <div>
                <h4>Quality Guaranteed</h4>
                <p>Tested and verified parts</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <div>
                <h4>Nationwide Shipping</h4>
                <p>Fast delivery across USA</p>
              </div>
            </div>
          </div>

          {/* Mobile: Welcome Offer Below Form */}
          {isMobile && !showWelcomePopup && (
            <div className="welcome-offer-mobile-section">
              <WelcomeOfferPoster />
              <TermsAndConditions />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;
