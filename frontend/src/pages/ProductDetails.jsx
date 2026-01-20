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
import React, { useState, useEffect } from 'react';
import { Heart, Share2, ChevronLeft, ChevronRight, Package, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from "react-router-dom";
import './ProductPage.css';
import logoImage from "../assets/images/brands/logo-white.png";
import AuthModal from "../components/AuthModal";
import visaIcon from "../assets/images/visa.png";
import amexIcon from "../assets/images/amex.png";
import discoverIcon from "../assets/images/discover.png";
import mastercardIcon from "../assets/images/images.png";

// API Configuration
const API_BASE = 'https://nexxaauto.com/api';
const IMAGE_BASE = 'https://images.nexxaauto.com';
const R2_DEV_URL = 'https://pub-243a0890b1b15283d9c78a97866ba995.r2.dev';

// Convert R2.dev URL to custom domain
const fixImageUrl = (url) => {
  if (!url) return null;
  return url.replace(R2_DEV_URL, IMAGE_BASE);
};

// Get the first image URL from a gallery object
const getFirstImageUrl = (gallery) => {
  if (gallery.primary_image && gallery.primary_image.url) {
    return fixImageUrl(gallery.primary_image.url);
  }
  if (gallery.primary_image && gallery.primary_image.thumbnail) {
    return fixImageUrl(gallery.primary_image.thumbnail);
  }
  if (gallery.images && gallery.images.length > 0) {
    const firstImage = gallery.images[0];
    return fixImageUrl(firstImage.image_url || firstImage.url || firstImage.image);
  }
  return null;
};

// Calculate remaining delivery days
const calculateRemainingDays = (orderDate, totalDeliveryDays) => {
  if (!orderDate) return totalDeliveryDays;
  const now = new Date();
  const ordered = new Date(orderDate);
  const daysPassed = Math.floor((now - ordered) / (1000 * 60 * 60 * 24));
  const remainingDays = totalDeliveryDays - daysPassed;
  return Math.max(0, remainingDays);
};

// Check if user is authenticated
const isUserAuthenticated = () => {
  const token = localStorage.getItem('nexxaToken');
  const user = localStorage.getItem('nexxaUser');
  return token && user;
};

// Call Modal Component
const CallModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="call-modal-overlay"
      onClick={onClose}
    >
      <div 
        className="call-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="call-modal-close"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="call-modal-header">
          <h2>Call Us <span className="highlight">Now!</span></h2>
          <p>Contact Part Expert Now</p>
        </div>

        <div className="call-modal-phone">
          <a href="tel:+18882660007">
            <span className="phone-icon">📞</span>
            +1 (888) 266-0007
          </a>
        </div>

        <div className="call-modal-buttons">
          <a href="tel:+18882660007" className="call-modal-btn btn-call">
            <span>📞</span> Call Now
          </a>
        </div>
      </div>
    </div>
  );
};

const ProductPage = () => {
  const navigate = useNavigate();
  const { slug, id } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState(null);
  const [userZipCode, setUserZipCode] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  // Function for opening modal
  const openModal = (type) => {
    let title = '';
    let content = '';
    
    switch(type) {
      case 'shipping':
        title = 'Shipping';
        content = `
          All orders are shipped via standard shipping only within the United States, Canada, and Mexico. At this time, we do not offer expedited shipping, Once the part is inspected, which typically takes 24–32 business hours, we will promptly send you the shipping confirmation along with the tracking details.
        `;
        break;
      case 'returns':
        title = 'Return & Support';
        content = `
          If you feel the part does not fit your vehicle or arrives damaged during transit, please contact our support team at support@nexxaauto.com as soon as possible. We kindly request that all return requests be submitted within 12 days of receiving the part to ensure quick and smooth assistance
        `;
        break;
      case 'confidence':
        title = 'Shop with Confidence';
        content = `
If the part doesn't match your VIN or arrives damaged during shipping, we've got you covered. We'll pay for the return shipping and send you the correct replacement one time at no extra cost, so you don't have to worry about any additional shipping fees        `;
        break;
      default:
        content = '<p>No details available.</p>';
    }
    
    setModalContent({ title, content });
    setShowModal(true);
  };

  // Fetch all images for a specific gallery
  const fetchGalleryImages = async (galleryId) => {
    try {
      setLoadingImages(true);
      const response = await fetch(`${API_BASE}/part-galleries/${galleryId}/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery images');
      }
      
      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        const images = data.images.map(img => ({
          url: fixImageUrl(img.image_url || img.url || img.image),
          thumbnail: fixImageUrl(img.thumbnail_url || img.thumbnail || img.image_url || img.url || img.image)
        }));
        setProductImages(images);
        return images;
      }
      
      if (data.primary_image) {
        const images = [{
          url: fixImageUrl(data.primary_image.url),
          thumbnail: fixImageUrl(data.primary_image.thumbnail || data.primary_image.url)
        }];
        setProductImages(images);
        return images;
      }
      
      setProductImages([]);
      return [];
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      setProductImages([]);
      return [];
    } finally {
      setLoadingImages(false);
    }
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/part-galleries/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // ✅ FIX: Handle both array and paginated response formats
        const productsArray = Array.isArray(data) ? data : (data.results || []);
        
        if (!Array.isArray(productsArray) || productsArray.length === 0) {
          console.warn('No products found in API response');
          setAllProducts([]);
          setLoading(false);
          return;
        }
        
        const transformedProducts = productsArray.map(item => {
          const primaryImageUrl = getFirstImageUrl(item);
          
          const backendPrice = item.prices && item.prices.length > 0
            ? parseFloat(item.prices[0].price || item.prices[0].total_price)
            : null;

          return {
            id: item.id,
            title: `${item.year} ${item.manufacturer_name} ${item.model_name} ${item.part_name}`,
            price: backendPrice,
            shipping: item.shipping_cost || 40,
            condition: item.condition || 'Grade A',
            manufacturer: item.manufacturer_name,
            model: item.model_name,
            year: item.year.toString(),
            primaryImage: primaryImageUrl,
            description: item.description || 'No description available',
            returns: '12 days Return, For Returns & Support',
            delivery: item.delivery_estimate || null,
            partCategory: item.part_category_name,
            partNumber: item.part_number || 'N/A',
            slug: item.slug,
            imageCount: item.image_count || 0,
            isFeatured: item.is_featured || false,
            orderDate: item.order_date || null,
            estimatedDeliveryDays: item.estimated_delivery_days || 7,
            zipCode: item.delivery_zip_code || null,
          };
        });
        
        setAllProducts(transformedProducts);
        
        // Load product based on slug
        if (slug && id) {
          const productToLoad = transformedProducts.find(p => p.slug === slug && p.id.toString() === id);
          if (productToLoad) {
            await loadProductWithImages(productToLoad);
          } else {
            setError('Product not found');
          }
        } else if (transformedProducts.length > 0) {
          navigate(`/product/${transformedProducts[0].slug}/${transformedProducts[0].id}`, { replace: true });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, id, navigate]);

  const loadProductWithImages = async (product) => {
    setCurrentProduct(product);
    setSelectedImage(0);
    await fetchGalleryImages(product.id);
  };

  const alternativeProducts = currentProduct
    ? allProducts.filter(product =>
        product.id !== currentProduct.id &&
        product.manufacturer === currentProduct.manufacturer &&
        product.year === currentProduct.year &&
        product.partCategory === currentProduct.partCategory
      )
    : [];

  const handlePrevImage = () => {
    if (productImages.length > 0) {
      setSelectedImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (productImages.length > 0) {
      setSelectedImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    }
  };

  const handleBuyNow = () => {
    if (!currentProduct) return;
    setShowCallModal(true);
  };

  const handleAuthSuccess = (userData) => {
    console.log('User authenticated:', userData);
    setShowAuthModal(false);
    
    if (pendingNavigation && currentProduct) {
      navigate(`/order/${currentProduct.slug}/${currentProduct.id}`, {
        state: pendingNavigation
      });
      setPendingNavigation(null);
    }
  };

  const handleWishlist = () => {
    setIsWishlist(!isWishlist);
  };

  const handleProductChange = async (product) => {
    setIsWishlist(false);
    setUserZipCode('');
    navigate(`/product/${product.slug}/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (!currentProduct) return;
    
    const url = window.location.href;
    const title = currentProduct.title;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      }).catch(err => {
        console.log('Error copying to clipboard:', err);
      });
    }
  };

  useEffect(() => {
    setSelectedImage(0);
  }, [currentProduct?.id]);

  if (loading) {
    return (
      <div>
        <header className="nexxa-header">
          <Link to="/" className="nexxa-logo-link">
            <img src={logoImage} alt="Nexxa Logo" className="nexxa-logo-img" />
          </Link>
        </header>
        <div className="nexxa-loading">
          <div className="nexxa-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="nexxa-header">
          <Link to="/" className="nexxa-logo-link">
            <img src={logoImage} alt="Nexxa Logo" className="nexxa-logo-img" />
          </Link>
        </header>
        <div className="nexxa-error">
          <div className="nexxa-error-card">
            <p className="nexxa-error-title">Error loading products</p>
            <p className="nexxa-error-message">{error}</p>
            <Link to="/" style={{color: '#1976d2', textDecoration: 'underline', marginTop: '16px', display: 'inline-block'}}>
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div>
        <header className="nexxa-header">
          <Link to="/" className="nexxa-logo-link">
            <img src={logoImage} alt="Nexxa Logo" className="nexxa-logo-img" />
          </Link>
        </header>
        <div className="nexxa-loading">
          <p>No products available</p>
        </div>
      </div>
    );
  }

  const currentImage = productImages.length > 0 ? productImages[selectedImage] : null;
  const remainingDeliveryDays = calculateRemainingDays(
    currentProduct.orderDate, 
    currentProduct.estimatedDeliveryDays
  );

  return (
    <div>
      <header className="nexxa-header">
        <Link to="/" className="nexxa-logo-link">
          <img src={logoImage} alt="Nexxa Logo" className="nexxa-logo-img" />
        </Link>
        <button onClick={handleWishlist} className="nexxa-heart-btn">
          <Heart
            fill={isWishlist ? '#ff4757' : 'none'}
            stroke={isWishlist ? '#ff4757' : '#fff'}
            size={28}
          />
        </button>
      </header>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <CallModal 
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
      />

      <div className="nexxa-container">
        <div className="nexxa-product-grid">
          <div className="nexxa-image-section">
            {loadingImages ? (
              <div className="nexxa-thumbnails">
                <div className="nexxa-thumbnail" style={{backgroundColor: '#e0e0e0'}}></div>
                <div className="nexxa-thumbnail" style={{backgroundColor: '#e0e0e0'}}></div>
                <div className="nexxa-thumbnail" style={{backgroundColor: '#e0e0e0'}}></div>
              </div>
            ) : productImages.length > 0 ? (
              <div className="nexxa-thumbnails">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`nexxa-thumbnail ${selectedImage === index ? 'active' : ''}`}
                  >
                    <img
                      src={img.thumbnail}
                      alt={`View ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f0f0f0" width="80" height="80"/%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="nexxa-main-image-container">
              {productImages.length > 1 && (
                <button onClick={handlePrevImage} className="nexxa-nav-btn left">
                  <ChevronLeft size={32} />
                </button>
              )}
              
              <div className="nexxa-main-image">
                {loadingImages ? (
                  <div className="nexxa-spinner"></div>
                ) : currentImage ? (
                  <img
                    src={currentImage.url}
                    alt="Main product view"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <Package size={64} style={{color: '#ccc'}} />
                )}
              </div>

              {productImages.length > 1 && (
                <button onClick={handleNextImage} className="nexxa-nav-btn right">
                  <ChevronRight size={32} />
                </button>
              )}

              {productImages.length > 0 && (
                <div className="nexxa-image-counter">
                  {selectedImage + 1} / {productImages.length}
                </div>
              )}
            </div>

            <button onClick={handleShare} className="nexxa-share-btn">
              <Share2 size={18} />
              Share
            </button>
          </div>

          <div className="nexxa-details-section">
            <h1 className="nexxa-title">{currentProduct.title}</h1>

            {currentProduct.description && currentProduct.description !== 'No description available' && (
              <div className="nexxa-description-box">
                <p className="nexxa-description-text">{currentProduct.description}</p>
              </div>
            )}

            {(currentProduct.price !== null && currentProduct.price !== undefined) ? (
              <div className="nexxa-price">${currentProduct.price.toFixed(2)}</div>
            ) : (
              <div className="nexxa-price" style={{color: '#999', fontSize: '18px', fontStyle: 'italic'}}>
                Price will be updated soon
              </div>
            )}

            <div className="nexxa-info-row">
              <span className="nexxa-info-label">Condition :</span>
              <span className="nexxa-condition-badge">{currentProduct.condition}</span>
            </div>

            <div className="nexxa-section">
              <div className="nexxa-section-title">Zip Code:</div>
              <div className="nexxa-section-content">
                <input
                  type="text"
                  placeholder="Enter your zip code"
                  value={userZipCode}
                  onChange={(e) => setUserZipCode(e.target.value)}
                  className="nexxa-quantity-input"
                  style={{width: '200px', padding: '8px'}}
                />
                {userZipCode && (
                  <p style={{fontSize: '14px', color: '#1976d2', marginTop: '8px'}}>
                    Delivering to: {userZipCode}
                  </p>
                )}
              </div>
            </div>

            <button onClick={handleBuyNow} className="nexxa-buy-btn">
              Buy It Now
            </button>

            <button onClick={handleWishlist} className="nexxa-watchlist-btn">
              <Heart
                size={20}
                fill={isWishlist ? '#c41e3a' : 'none'}
                stroke={isWishlist ? '#c41e3a' : '#333'}
              />
              Add to Whatchlist
            </button>

            <div className="nexxa-info-card">
              <ShieldCheck size={20} style={{ color: '#1976d2', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span className="nexxa-info-card-text">
                  Shop with confidence — Returns with no shipping fees
                </span>
                <a 
                  className="nexxa-link" 
                  onClick={() => openModal('confidence')}
                  style={{ marginLeft: '8px', cursor: 'pointer' }}
                >
                  See details...
                </a>
              </div>
            </div>

            <div className="nexxa-section">
              <div className="nexxa-section-title">Shipping:</div>
              <div className="nexxa-section-content">
                <p>All orders are shipped via standard shipping</p>
                {currentProduct.orderDate ? (
                  <p style={{fontSize: '16px', fontWeight: '600', color: '#1976d2', marginTop: '8px'}}>
                    {remainingDeliveryDays > 0 
                      ? `Estimated delivery in ${remainingDeliveryDays} ${remainingDeliveryDays === 1 ? 'day' : 'days'}`
                      : 'Your order should arrive today or has been delivered!'
                    }
                  </p>
                ) : null}
                <a className="nexxa-link" onClick={() => openModal('shipping')}>See details...</a>
              </div>
            </div>

            <div className="nexxa-section">
              <div className="nexxa-section-title">Delivery:</div>
              <div className="nexxa-section-content">
                <p style={{color: '#666'}}>
                  {currentProduct.delivery || 'Estimated between Tue,Feb 3 and Thu, Mar 5 to 562114'}
                </p>
              </div>
            </div>

            <div className="nexxa-section">
              <div className="nexxa-section-title">Returns:</div>
              <div className="nexxa-section-content">
                <p>{currentProduct.returns}</p>
                <a className="nexxa-link" onClick={() => openModal('returns')}>See details...</a>
              </div>
            </div>

            <div className="nexxa-section">
              <div className="nexxa-section-title">Payments:</div>
              <div className="nexxa-payment-icons">
                <img src={visaIcon} alt="Visa" className="payment-card-img" />
                <img src={amexIcon} alt="American Express" className="payment-card-img" />
                <img src={discoverIcon} alt="Discover" className="payment-card-img" />
                <img src={mastercardIcon} alt="Mastercard" className="payment-card-img" />
              </div>
            </div>
          </div>
        </div>

        {alternativeProducts.length > 0 && (
          <div className="nexxa-alternative-section">
            <div className="nexxa-alternative-header">
              <h2 className="nexxa-alternative-title">Alternative Spec</h2>
              <a href="#" className="nexxa-see-all">({alternativeProducts.length} Specs)</a>
            </div>

            <div className="nexxa-alternative-grid">
              {alternativeProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductChange(product)}
                  className="nexxa-alternative-card"
                >
                  <div className="nexxa-alternative-image">
                    {product.primaryImage ? (
                      <img
                        src={product.primaryImage}
                        alt={product.title}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f0f0f0" width="300" height="300"/%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div style={{fontSize: '48px'}}>📦</div>
                    )}
                  </div>
                  <div className="nexxa-alternative-body">
                    <span className="nexxa-alternative-year">{product.year}</span>
                    <h3 className="nexxa-alternative-name">{product.title}</h3>
                    <p className="nexxa-alternative-condition">{product.condition}</p>
                    {(product.price !== null && product.price !== undefined) ? (
                      <>
                        <div className="nexxa-alternative-price">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="nexxa-alternative-shipping">
                          + ${product.shipping || 0}.00 shipping
                        </div>
                      </>
                    ) : (
                      <div className="nexxa-alternative-price" style={{fontSize: '14px', color: '#999', fontStyle: 'italic'}}>
                        Price coming soon
                      </div>
                    )}
                    {/* <p className="nexxa-alternative-seller">Seller with 100% positive feedback</p> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h2 className="modal-title">{modalContent.title}</h2>
            <div 
              className="modal-body" 
              dangerouslySetInnerHTML={{ __html: modalContent.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;