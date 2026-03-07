import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import VehicleSearchForm from "../components/VehicleSearchForm";
import brandData from "../assets/brandData";
import "./BrandDetail.css";
import logoImage from "../assets/images/brands/logowhite.webp";
import { Helmet } from 'react-helmet';

export default function BrandDetail() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();

  // Coupon states
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const couponCode = "WEL-NAP-1002";

  // Safe slug match
  const brand = Object.values(brandData).find(
    b => b.slug.toLowerCase() === brandSlug.toLowerCase()
  );

  // Recent customer stories (dynamic data based on brand)
  const getRecentStories = () => {
    if (!brand) return [];
    
    // Dynamic stories based on the brand
    const brandStories = {
      acura: [
        {
          id: 1,
          text: `Just Shipped 2015 Acura TLX Control Arm, Another Happy customer From Florida.`,
          date: "2 days ago"
        },
        {
          id: 2,
          text: `2018 Acura MDX Transmission delivered to California - Perfect condition!`,
          date: "5 days ago"
        }
      ],
      honda: [
        {
          id: 1,
          text: `Just Shipped 2016 Honda Civic Engine, Another Happy customer From Texas.`,
          date: "1 day ago"
        },
        {
          id: 2,
          text: `2019 Honda Accord Suspension parts delivered to New York - Great quality!`,
          date: "3 days ago"
        }
      ],
      toyota: [
        {
          id: 1,
          text: `Just Shipped 2017 Toyota Camry Transmission, Another Happy customer From Arizona.`,
          date: "2 days ago"
        },
        {
          id: 2,
          text: `2020 Toyota RAV4 Engine parts delivered to Washington - Excellent service!`,
          date: "4 days ago"
        }
      ],
      // Default stories for other brands
      default: [
        {
          id: 1,
          text: `Just Shipped ${new Date().getFullYear() - 7} ${brand?.title} Parts, Another Happy customer From Florida.`,
          date: "2 days ago"
        },
        {
          id: 2,
          text: `${new Date().getFullYear() - 5} ${brand?.title} Quality parts delivered - Customer satisfied!`,
          date: "5 days ago"
        }
      ]
    };

    return brandStories[brand.slug.toLowerCase()] || brandStories.default;
  };

  const [recentStories, setRecentStories] = useState([]);

  // Update stories when brand changes
  useEffect(() => {
    if (brand) {
      setRecentStories(getRecentStories());
    }
  }, [brand]);

  // Feature images (for the 3 icons below search)
  const featureImages = [
    {
      icon: "📷",
      title: "Real Part Image",
      description: ""
    },
    {
      icon: "✓",
      title: "Fitment Guaranteed",
      description: "VIN Matched Parts"
    },
    {
      icon: "🚚",
      title: "Fast Shipping",
      description: "Nationwide Delivery"
    }
  ];

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

  // Below Price Point Coupon (Shows after closing popup)
  const BelowPricePointCoupon = () => (
    <div className="below-price-coupon">
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
      <Helmet>
        <title>Used {brand.title} Parts - OEM Quality Auto Parts | Nexxa Auto</title>
        <meta 
          name="description" 
          content={`Find high-quality used ${brand.title} parts at competitive prices. OEM certified auto parts with warranty. Fast shipping across USA. Get quotes in 2-45 minutes.`}
        />
        <link rel="canonical" href={`https://nexxaauto.com/brand/${brand.slug}`} />
      </Helmet>

      {/* Universal Popup for ALL screen sizes */}
      {showPopup && <PopupCoupon />}

      <div className="brand-content">
        {/* TOP SECTION - Heading and Logo in one line */}
        <div className="brand-top-section">
          <div className="brand-logo-container">
            <img
              src={brand.image}
              alt={`${brand.title} logo`}
              className="brand-logo"
            />
          </div>
          <h1 className="brand-title">
            Find Quality Used{" "}
            <span className="brand-title-highlight">
              {brand.title.toUpperCase()}
            </span>{" "}
            Parts
          </h1>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="desktop-layout">
          {/* MIDDLE SECTION - Description and Search Form side by side */}
          <div className="brand-middle-section">
            {/* Left - Description */}
            <div className="brand-description-section">
              <h2 className="brand-description-title">
                Used {brand.title} Parts
              </h2>
              <p className="brand-description-text">
                {brand.description}
              </p>
            </div>

            {/* Right - Search Form */}
            <div className="brand-search-section">
              <VehicleSearchForm brandName={brand.title} />
            </div>
          </div>

          {/* Feature Images, Price Points, Stories, and Coupon */}
          <div className="brand-features-stories-wrapper">
            {/* Left Side - Feature Images, Price Points, and Coupon */}
            <div className="brand-features-left">
              <div className="feature-images-grid">
                {featureImages.map((feature, index) => (
                  <div key={index} className="feature-image-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3 className="feature-title">{feature.title}</h3>
                    {feature.description && (
                      <p className="feature-description">{feature.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Price Point Approx Section */}
              <div className="price-point-section">
                <h3 className="price-point-title">Price Point Approx*</h3>
                <div className="price-boxes-grid">
                  <div className="price-box dealership">
                    <div className="price-box-label">Dealership New</div>
                    <div className="price-box-amount">$1000</div>
                  </div>
                  <div className="price-box certified">
                    <div className="price-box-label">Nexxa Certified Used</div>
                    <div className="price-box-amount">$300</div>
                  </div>
                  <div className="price-box discount">
                    <div className="price-box-amount">Upto 70% off</div>
                  </div>
                </div>
              </div>

              {/* Coupon Below Price Point - Desktop */}
              {!showPopup && <BelowPricePointCoupon />}
            </div>

            {/* Right Side - Recent Customer Stories */}
            <div className="brand-stories-right">
              <div className="recent-stories-container">
                <h3 className="recent-stories-title">Recent Customer Stories :</h3>
                <div className="stories-list">
                  {recentStories.map((story) => (
                    <div key={story.id} className="story-card">
                      <p className="story-text">{story.text}</p>
                      <span className="story-date">{story.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="mobile-layout">
          {/* Search Form */}
          <div className="brand-search-section-mobile">
            <VehicleSearchForm brandName={brand.title} />
          </div>

          {/* Feature Images Grid */}
          <div className="feature-images-grid-mobile">
            {featureImages.map((feature, index) => (
              <div key={index} className="feature-image-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                {feature.description && (
                  <p className="feature-description">{feature.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Recent Customer Stories */}
          <div className="brand-stories-mobile">
            <div className="recent-stories-container">
              <h3 className="recent-stories-title">Recent Customer Stories :</h3>
              <div className="stories-list">
                {recentStories.map((story) => (
                  <div key={story.id} className="story-card">
                    <p className="story-text">{story.text}</p>
                    <span className="story-date">{story.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price Point Approx Section */}
          <div className="price-point-section-mobile">
            <h3 className="price-point-title">Price Point Approx*</h3>
            <div className="price-boxes-grid">
              <div className="price-box dealership">
                <div className="price-box-label">Dealership New</div>
                <div className="price-box-amount">$1000</div>
              </div>
              <div className="price-box certified">
                <div className="price-box-label">Nexxa Certified Used</div>
                <div className="price-box-amount">$300</div>
              </div>
              <div className="price-box discount">
                <div className="price-box-amount">Upto 70% off</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="brand-description-section-mobile">
            <h2 className="brand-description-title">
              Used {brand.title} Parts
            </h2>
            <p className="brand-description-text">
              {brand.description}
            </p>
          </div>

          {/* Coupon Below Description - Mobile */}
          {!showPopup && <BelowPricePointCoupon />}
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
                <h2 className="brand-model-title">
                  Used {brand.title} {model.name} Parts
                </h2>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}