import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import VehicleSearchForm from "../components/VehicleSearchForm";
import brandData from "../assets/brandData";
import "./BrandDetail.css";
import logoImage from "../assets/images/brands/logo-white.png";

export default function BrandDetail() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();

  // Coupon states
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  // Check mobile and show popup
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Show mobile popup after delay
    if (window.innerWidth < 992) {
      setTimeout(() => {
        setShowMobilePopup(true);
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

  // Close mobile popup
  const handleCloseMobilePopup = () => {
    setShowMobilePopup(false);
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

  // Mobile Popup Coupon
  const MobilePopupCoupon = () => (
    <div className="mobile-coupon-overlay" onClick={handleCloseMobilePopup}>
      <div className="mobile-coupon-popup" onClick={(e) => e.stopPropagation()}>
        <button className="mobile-close-btn" onClick={handleCloseMobilePopup}>
          ×
        </button>
        
        <div className="mobile-coupon-content">
          <div className="mobile-logo">
            <Link to="/" className="mobile-logo-link">
              <img src={logoImage} alt="Nexxa Logo" className="mobile-logo-img" />
            </Link>
          </div>
          
          <div className="mobile-welcome-text">Welcome Offer</div>
          
          <div className="mobile-offer-box">
            <div className="mobile-get-text">GET</div>
            <div className="mobile-discount-text">15% OFF</div>
            <div className="mobile-first-text">YOUR FIRST</div>
            <div className="mobile-purchase-text">PURCHASE*</div>
          </div>
          
          <div className="mobile-code-section">
            <div className="mobile-use-code">USE CODE:</div>
            <div className="mobile-code-box">
              <input 
                type="text" 
                value={couponCode} 
                readOnly 
                className="mobile-code-input"
              />
              <button 
                className="mobile-copy-btn" 
                onClick={handleCopyCoupon}
                title="Copy code"
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
            {copied && <div className="mobile-copied">Copied!</div>}
          </div>
          
          <div className="mobile-auto-text">
            This Coupon Code<br />
            Automatically Send's to Your E-Mail
          </div>
        </div>
        
        <div className="mobile-terms-section">
          <button className="mobile-terms-toggle" onClick={toggleTerms}>
            <span>TERMS & CONDITIONS</span>
            <svg 
              className={`mobile-terms-arrow ${termsOpen ? 'open' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {termsOpen && (
            <div className="mobile-terms-content">
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

  // Below Form Coupon (Shows on Desktop and Mobile after closing popup)
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
      {/* Mobile Popup Coupon Only */}
      {isMobile && showMobilePopup && <MobilePopupCoupon />}

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
        <div className="brand-grid">
          <div className="brand-left-section">
            <div className="brand-logo-container">
              <img
                src={brand.image}
                alt={`${brand.title} logo`}
                className="brand-logo"
              />
            </div>

            <div className="brand-description-section">
              <h2 className="brand-description-title">
                Used {brand.title} Parts
              </h2>
              <p className="brand-description-text">
                {brand.description}
              </p>
            </div>
          </div>

          <div className="brand-search-section">
            <VehicleSearchForm brandName={brand.title} />
            
            {/* Desktop: Always show coupon below form */}
            {!isMobile && <BelowFormCoupon />}
          </div>
        </div>

        {/* Mobile: Show coupon below form after closing popup */}
        {isMobile && !showMobilePopup && <BelowFormCoupon />}

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