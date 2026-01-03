// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./ProductDetails.css";

// const ProductDetails = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const { year, make, model, partCategory } = location.state || {};

//   // Safety check if user opens page directly
//   if (!year || !make || !model || !partCategory) {
//     return (
//       <div className="product-page">
//         <div className="product-error">
//           <h2>No product selected</h2>
//           <p>Please search for a product first.</p>
//           <button onClick={() => navigate("/")}>Go to Home</button>
//         </div>
//       </div>
//     );
//   }

//   const [formData, setFormData] = useState({
//     year,
//     make,
//     model,
//     partCategory,
//     name: "",
//     email: "",
//     phone: "",
//     message: "",
//   });

//   const [success, setSuccess] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(
//         "http://127.0.0.1:8000/api/product-request/",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(formData),
//         }
//       );

//       if (response.ok) {
//         setSuccess(true);
//         setFormData({
//           ...formData,
//           name: "",
//           email: "",
//           phone: "",
//           message: "",
//         });
//       } else {
//         alert("Failed to send request.");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Server error.");
//     }
//   };

//   return (
//     <div className="product-page">
//       <section className="product-form-section">

//         {/* ✅ Dynamic Heading */}
//         <h1 className="product-heading">
//           Find Qualified Quality Used {partCategory} for {year} {make} {model}
//         </h1>

//         <p className="product-subheading">
//           Fill the form below and our team will contact you shortly.
//         </p>

//         {success && (
//           <div className="success-message">
//             ✅ Message sent successfully. Our team will contact you soon.
//           </div>
//         )}

//         <form className="product-form" onSubmit={handleSubmit}>
//           {/* Auto-filled fields */}
//           <input type="text" value={formData.year} readOnly />
//           <input type="text" value={formData.make} readOnly />
//           <input type="text" value={formData.model} readOnly />
//           <input type="text" value={formData.partCategory} readOnly />

//           {/* User inputs */}
//           <input
//             type="text"
//             name="name"
//             placeholder="Your Name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />

//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />

//           <input
//             type="text"
//             name="phone"
//             placeholder="Phone Number"
//             value={formData.phone}
//             onChange={handleChange}
//             required
//           />

//           <textarea
//             name="message"
//             placeholder="Additional Message (optional)"
//             value={formData.message}
//             onChange={handleChange}
//           />

//           <button type="submit">Request a Part</button>
//         </form>
//       </section>
//     </div>
//   );
// };

// export default ProductDetails;

// ProductDetails.jsx - Backend Integrated Version
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProductDetails.css";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
console.log("API Base URL:", API_BASE_URL);

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from navigation state
  const {
    year,
    manufacturerId,
    manufacturerName,
    modelId,
    modelName,
    partCategoryId,
    partCategoryName,
  } = location.state || {};

  // Safety check if user opens page directly
  if (!year || !manufacturerId || !modelId || !partCategoryId) {
    return (
      <div className="product-page">
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
        year: year,
        manufacturer: manufacturerId,
        model: modelId,
        part_category: partCategoryId,
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
          }, 300); // Wait for popup animation to complete
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

  return (
    <div className="product-page">
      {/* Animated Success Popup */}
      {showPopup && (
        <div className="success-popup-overlay" onClick={handleClosePopup}>
          <div
            className="success-popup"
            onClick={(e) => e.stopPropagation()}
          >
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
                Our team will review your request and contact you within 24-48
                hours with availability and pricing information.
              </p>

              <button
                className="success-popup-close"
                onClick={handleClosePopup}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
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

              {/* <div className="form-group">
                <label htmlFor="additional_notes">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="additional_notes"
                  name="additional_notes"
                  placeholder="Any specific requirements or questions about the part..."
                  value={formData.additional_notes}
                  onChange={handleChange}
                  rows="4"
                  disabled={submitting}
                />
              </div> */}
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
      </section>
    </div>
  );
};

export default ProductDetails;

