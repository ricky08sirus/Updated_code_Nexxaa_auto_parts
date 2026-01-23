import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import VehicleSearchForm from "../components/VehicleSearchForm";
import brandData from "../assets/brandData";
import "./BrandDetail.css";
import logoImage from "../assets/images/brands/logowhite.webp";

export default function BrandDetail() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();

  // Coupon states
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const couponCode = "WEL-NAP-1002";

  // Debug
  console.log("URL brandSlug:", brandSlug);
  console.log("Available slugs:", Object.values(brandData).map(b => b.slug));

  // Safe slug match
  const brand = Object.values(brandData).find(
    b => b.slug.toLowerCase() === brandSlug.toLowerCase()
  );

  // Show popup after delay for ALL screen sizes
  useEffect(() => {
    setTimeout(() => {
      setShowPopup(true);
    }, 500);
  }, []);

  // Copy coupon code
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Close popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Toggle terms
  const toggleTerms = () => {
    setTermsOpen(!termsOpen);
  };

  if (!brand) {
    return (
      <div className="brand-not-found">
        <h2 className="brand-not-found-title">Brand not found</h2>
        <Link to="/" className="brand-not-found-link">
          Go back to Home
        </Link>
      </div>
    );
  }

  // Universal Popup Coupon (Works for both mobile and desktop)
  const PopupCoupon = () => (
    <div className="coupon-overlay" onClick={handleClosePopup}>
      <div className="coupon-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={handleClosePopup}>
          ×
        </button>
        
        <div className="popup-coupon-content">
          <div className="popup-logo">
            <Link to="/" className="popup-logo-link">
              <img src={logoImage} alt="Nexxa Logo" className="popup-logo-img" />
            </Link>
          </div>
          
          <div className="popup-welcome-text">Welcome Offer</div>
          
          <div className="popup-offer-box">
            <div className="popup-get-text">GET</div>
            <div className="popup-discount-text">15% OFF</div>
            <div className="popup-first-text">YOUR FIRST</div>
            <div className="popup-purchase-text">PURCHASE*</div>
          </div>
          
          <div className="popup-code-section">
            <div className="popup-use-code">USE CODE:</div>
            <div className="popup-code-box">
              <input 
                type="text" 
                value={couponCode} 
                readOnly 
                className="popup-code-input"
              />
              <button 
                className="popup-copy-btn" 
                onClick={handleCopyCoupon}
                title="Copy code"
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
            {copied && <div className="popup-copied">Copied!</div>}
          </div>
          
          <div className="popup-auto-text">
            This Coupon Code<br />
            Automatically Send's to Your E-Mail
          </div>
        </div>
        
        <div className="popup-terms-section">
          <button className="popup-terms-toggle" onClick={toggleTerms}>
            <span>TERMS & CONDITIONS</span>
            <svg 
              className={`popup-terms-arrow ${termsOpen ? 'open' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {termsOpen && (
            <div className="popup-terms-content">
              <p>
                <strong>1. New Customers Only:</strong> Require account creation or while placing the order over call. 
                The coupon will only work for the email/user ID/Order Number from Nexxa Auto Parts used at checkout for the first time.
              </p>
              <p>
                <strong>2. One-Time Use:</strong> The code can only be used once per customer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Below Form Coupon (Shows after closing popup)
  const BelowFormCoupon = () => (
    <div className="below-form-coupon">
      <div className="below-coupon-inner">
        <div className="below-logo">
          <Link to="/" className="below-logo-link">
            <img src={logoImage} alt="Nexxa Logo" className="below-logo-img" />
          </Link>
        </div>
        
        <div className="below-welcome-text">Welcome Offer</div>
        
        <div className="below-offer-box">
          <div className="below-get-text">GET</div>
          <div className="below-discount-text">15% OFF</div>
          <div className="below-first-text">YOUR FIRST</div>
          <div className="below-purchase-text">PURCHASE*</div>
        </div>
        
        <div className="below-code-section">
          <div className="below-use-code">USE CODE:</div>
          <div className="below-code-box">
            <input 
              type="text" 
              value={couponCode} 
              readOnly 
              className="below-code-input"
            />
            <button 
              className="below-copy-btn" 
              onClick={handleCopyCoupon}
              title="Copy code"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
          {copied && <div className="below-copied">Copied!</div>}
        </div>
        
        <div className="below-auto-text">
          This Coupon Code<br />
          Automatically Send's to Your E-Mail
        </div>
      </div>
      
      <div className="below-terms-section">
        <button className="below-terms-toggle" onClick={toggleTerms}>
          <span>TERMS & CONDITIONS</span>
          <svg 
            className={`below-terms-arrow ${termsOpen ? 'open' : ''}`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {termsOpen && (
          <div className="below-terms-content">
            <p>
              <strong>1. New Customers Only:</strong> Require account creation or while placing the order over call. 
              The coupon will only work for the email/user ID/Order Number from Nexxa Auto Parts used at checkout for the first time.
            </p>
            <p>
              <strong>2. One-Time Use:</strong> The code can only be used once per customer.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="brand-detail-container">
      {/* Universal Popup for ALL screen sizes */}
      {showPopup && <PopupCoupon />}

      {/* Main Heading */}
      <div className="brand-header">
        <h1 className="brand-title">
          Find Quality Used{" "}
          <span className="brand-title-highlight">
            {brand.title.toUpperCase()}
          </span>{" "}
          Parts
        </h1>
      </div>

      <div className="brand-content">
        {/* MOBILE VIEW ORDER: Logo → Search Form → Description → Models */}
        {/* DESKTOP VIEW: Logo + Description on Left, Search Form on Right */}
        
        <div className="brand-grid">
          {/* Left Section - Logo and Description */}
          <div className="brand-left-section">
            {/* Logo */}
            <div className="brand-logo-container">
              <img
                src={brand.image}
                alt={`${brand.title} logo`}
                className="brand-logo"
              />
            </div>

            {/* Description - Shows below search on mobile, here on desktop */}
            <div className="brand-description-section desktop-only">
              <h2 className="brand-description-title">
                Used {brand.title} Parts
              </h2>
              <p className="brand-description-text">
                {brand.description}
              </p>
            </div>
          </div>

          {/* Right Section - Search Form */}
          <div className="brand-search-section">
            <VehicleSearchForm brandName={brand.title} />
            
            {/* Description - Shows after search form on mobile only */}
        <div className="brand-description-section mobile-only">
          <h2 className="brand-description-title">
            Used {brand.title} Parts
          </h2>
          <p className="brand-description-text">
            {brand.description}
          </p>
        </div>
            
            {/* Show coupon below form after closing popup */}
            {!showPopup && <BelowFormCoupon />}
          </div>
        </div>


        {/* Models Section */}
        <div className="brand-models-section">
          <h2 className="brand-models-title">
            {brand.title} Models
          </h2>

          <div className="brand-models-grid">
            {brand.models.map((model, index) => (
              <button
                key={index}
                className="brand-model-link"
              >
                <h3 className="brand-model-title">
                  Used {brand.title} {model.name} Parts
                </h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}