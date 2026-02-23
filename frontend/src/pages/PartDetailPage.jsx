import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { partsData } from "../assets/PartsData.js";  
import { allModels } from "../assets/ModelsData.js";
import './Anti_Lock_Brake_Pumb.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function PartDetailPage() {
  const navigate = useNavigate();
  const { partSlug } = useParams(); // Get the part slug from URL

  // Get the part data based on URL parameter
  const partData = Object.values(partsData).find(part => part.slug === partSlug);


  // Form selections state
  const [formData, setFormData] = useState({
    year: '',
    manufacturer: '',
    model: '',
    part: ''
  });

  // Backend data state
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [partCategories, setPartCategories] = useState([]);

  // Loading states
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingParts, setLoadingParts] = useState(true);

  // Generate years from 1990 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1989 },
    (_, i) => currentYear + 1 - i
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If part not found, redirect to home
  useEffect(() => {
    if (!partData) {
      console.error(`Part not found: ${partSlug}`);
      navigate('/');
    }
  }, [partData, partSlug, navigate]);

  // Fetch manufacturers on mount
  useEffect(() => {
    fetchManufacturers();
    fetchPartCategories();
  }, []);

  // Fetch models when manufacturer changes
  useEffect(() => {
    if (formData.manufacturer) {
      fetchModelsByManufacturer(formData.manufacturer);
    } else {
      setModels([]);
      setFormData(prev => ({ ...prev, model: '' }));
    }
  }, [formData.manufacturer]);

  const fetchManufacturers = async () => {
    try {
      setLoadingManufacturers(true);
      const response = await fetch(`${API_BASE_URL}/manufacturers/`);
      const data = await response.json();

      if (data.success && data.data) {
        setManufacturers(data.data);
      } else {
        console.error("Failed to load manufacturers");
      }
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
    } finally {
      setLoadingManufacturers(false);
    }
  };

  const fetchModelsByManufacturer = async (manufacturerId) => {
    try {
      setLoadingModels(true);
      const response = await fetch(
        `${API_BASE_URL}/manufacturers/${manufacturerId}/models/`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setModels(data.data);
      } else {
        console.error("Failed to load models");
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchPartCategories = async () => {
    try {
      setLoadingParts(true);
      const response = await fetch(`${API_BASE_URL}/part-categories/`);
      const data = await response.json();

      if (data.success && data.data) {
        setPartCategories(data.data);
      } else {
        console.error("Failed to load part categories");
      }
    } catch (error) {
      console.error("Error fetching part categories:", error);
    } finally {
      setLoadingParts(false);
    }
  };

  // Handle manufacturer change
  const handleManufacturerChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      manufacturer: value,
      model: '' // Reset model when manufacturer changes
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.year) {
      alert("Please select a year");
      return;
    }
    if (!formData.manufacturer) {
      alert("Please select a manufacturer");
      return;
    }
    if (!formData.model) {
      alert("Please select a model");
      return;
    }
    if (!formData.part) {
      alert("Please select a part category");
      return;
    }

    // Find the selected items' details
    const manufacturerData = manufacturers.find(
      (m) => m.id === parseInt(formData.manufacturer)
    );
    const modelData = models.find((m) => m.id === parseInt(formData.model));
    const partCategory = partCategories.find(
      (p) => p.id === parseInt(formData.part)
    );

    // Navigate to product details page with URL parameters
    const params = new URLSearchParams({
      year: formData.year,
      manufacturerId: formData.manufacturer,
      manufacturerName: manufacturerData?.name || "",
      modelId: formData.model,
      modelName: modelData?.name || "",
      partCategoryId: formData.part,
      partCategoryName: partCategory?.name || "",
    });

    navigate(`/product-details?${params.toString()}`);
  };

  // If part data doesn't exist, show loading or return null
  if (!partData) {
    return null;
  }

  // Extract highlight word for the heading (last word in red)
  const getHighlightedHeading = (heading) => {
    const words = heading.split(' ');
    const lastWord = words[words.length - 1];
    const restWords = words.slice(0, -1).join(' ');
    
    return (
      <>
        {restWords} <span className="abs-pump-text-red">{lastWord}</span>
      </>
    );
  };

  return (
    <div className="abs-pump-page-wrapper">
      {/* Hero Section */}
      <section className="abs-pump-hero-section">
        <div className="abs-pump-container">
          <div className="abs-pump-hero-grid">
            {/* Left side - Small Image with overlay text */}
            <div className="abs-pump-image-container">
              <div className="abs-pump-image-wrapper">
                <img 
                  src={partData.image}
                  alt={partData.name}
                  className="abs-pump-image"
                />
                <div className="abs-pump-image-overlay">
                  <div className="abs-pump-overlay-text">
                    <h3 className="abs-pump-overlay-title">{partData.overlayTitle1}</h3>
                    <h3 className="abs-pump-overlay-title">
                      <span className="abs-pump-text-red">{partData.overlayTitle2}</span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content and Form */}
            <div className="abs-pump-content-section">
              {/* Heading at the top - Dynamically highlighted */}
              <h1 className="abs-pump-main-heading">
                {getHighlightedHeading(partData.heading)}
              </h1>

              {/* Horizontal layout: Paragraph LEFT, Search Form RIGHT */}
              <div className="abs-pump-content-horizontal">
                {/* Left: Paragraphs - Dynamic descriptions */}
                <div className="abs-pump-description-section">
                  <p className="abs-pump-description">
                    {partData.description1}
                  </p>

                  <p className="abs-pump-description">
                    {partData.description2}
                  </p>
                </div>

                {/* Right: Search Form with API Integration */}
                <div className="abs-pump-search-container">
                  <p className="abs-pump-form-title">One smart search. Your perfect fit starts here.</p>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="abs-pump-form-row">
                      {/* Year Selector */}
                      <select 
                        name="year"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        className="abs-pump-form-select"
                      >
                        <option value="">Year</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>

                      {/* Manufacturer Selector */}
                      <select 
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleManufacturerChange}
                        className="abs-pump-form-select"
                        disabled={loadingManufacturers}
                      >
                        <option value="">Make</option>
                        {manufacturers.map((mfg) => (
                          <option key={mfg.id} value={mfg.id}>
                            {mfg.name}
                          </option>
                        ))}
                      </select>

                      {/* Model Selector */}
                      <select 
                        name="model"
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        className="abs-pump-form-select"
                        disabled={!formData.manufacturer || loadingModels}
                      >
                        <option value="">Model</option>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>

                      {/* Parts Selector */}
                      <select 
                        name="part"
                        value={formData.part}
                        onChange={(e) => setFormData(prev => ({ ...prev, part: e.target.value }))}
                        className="abs-pump-form-select"
                        disabled={loadingParts}
                      >
                        <option value="">Parts</option>
                        {partCategories.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="abs-pump-submit-button"
                    >
                      Search Now
                    </button>

                    <p className="abs-pump-vin-link">
                      Don't know your vehicle? <span className="abs-pump-link-highlight">Enter VIN</span>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="abs-pump-features-section">
        <div className="abs-pump-container">
          <div className="abs-pump-features-layout">
            {/* Left side - Customer Story */}
            <div className="abs-pump-left-section">
              <div className="abs-pump-customer-story">
                <h3 className="abs-pump-story-heading">Recent Customer Stories :</h3>
                <p className="abs-pump-story-text">Just Shipped 2015 Accura CL Control Arm, Another Happy customer From Florida.</p>
              </div>
            </div>

            {/* Right side - Features and Pricing */}
            <div className="abs-pump-right-section">
              {/* Feature Icons */}
              <div className="abs-pump-features-grid">
                <div className="abs-pump-feature-item">
                  <div className="abs-pump-feature-icon">
                    <svg className="abs-pump-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="abs-pump-feature-title">Real Part Image</h3>
                </div>

                <div className="abs-pump-feature-item">
                  <div className="abs-pump-feature-icon">
                    <svg className="abs-pump-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="abs-pump-feature-title">Fitment Guaranteed</h3>
                  <p className="abs-pump-feature-subtitle">VIN Matched Parts</p>
                </div>

                <div className="abs-pump-feature-item">
                  <div className="abs-pump-feature-icon">
                    <svg className="abs-pump-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <h3 className="abs-pump-feature-title">Fast Shipping</h3>
                  <p className="abs-pump-feature-subtitle">Nationwide Delivery</p>
                </div>
              </div>

              {/* Price Point */}
              <div className="abs-pump-price-section">
                <h3 className="abs-pump-price-heading">Price Point Approx*</h3>
                <div className="abs-pump-price-grid">
                  <div className="abs-pump-price-card abs-pump-dealership">
                    <p className="abs-pump-price-label">Delership New</p>
                    <p className="abs-pump-price-value">$1000</p>
                  </div>
                  <div className="abs-pump-price-card abs-pump-nexxa">
                    <p className="abs-pump-price-label">Nexxa Certified used</p>
                    <p className="abs-pump-price-value">$300</p>
                  </div>
                  <div className="abs-pump-price-card abs-pump-discount">
                    <p className="abs-pump-discount-text">Upto 70% off</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
{partData.seoContent && (
  <div className="abs-pump-seo-content">
    <div className="abs-pump-zigzag-container">

      {/* Intro as the FIRST zigzag block (left) */}
      {/* Intro as the FIRST zigzag block (left) */}
<div className="abs-pump-zigzag-block abs-pump-zigzag-left">
  <h2 className="abs-pump-seo-heading">{partData.seoContent.intro.heading}</h2>

  {partData.seoContent.intro.paragraphs?.map((p, i) => (
    <p key={i} className="abs-pump-seo-paragraph">{p}</p>
  ))}

  {partData.seoContent.intro.bullets?.length > 0 && (
    <ul className="abs-pump-seo-list">
      {partData.seoContent.intro.bullets.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  )}

  {/* FIX: render checkItems in intro if present (radio-controller, mechanical-parts) */}
  {partData.seoContent.intro.checkItems && (
    <div className="abs-pump-check-items">
      {partData.seoContent.intro.checkItems.map((item, i) => (
        <div key={i} className="abs-pump-check-item">
          <strong>{item.label}</strong>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  )}

  {partData.seoContent.intro.footer && (
    <p className="abs-pump-seo-paragraph abs-pump-footer-note">
      {partData.seoContent.intro.footer}
    </p>
  )}
</div>

      {/* All sections continue the zigzag: index 0 = right, 1 = left, 2 = right ... */}
      {partData.seoContent.sections.map((section, idx) => (
        <div
          key={idx}
          className={`abs-pump-zigzag-block ${idx % 2 === 0 ? 'abs-pump-zigzag-right' : 'abs-pump-zigzag-left'}`}
        >
          <h2 className="abs-pump-seo-heading">{section.heading}</h2>

          {section.paragraphs?.map((p, i) => (
            <p key={i} className="abs-pump-seo-paragraph">{p}</p>
          ))}

          {section.bullets && (
            <ul className="abs-pump-seo-list">
              {section.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}

          {section.checkItems && (
            <div className="abs-pump-check-items">
              {section.checkItems.map((item, i) => (
                <div key={i} className="abs-pump-check-item">
                  <strong>{item.label}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          )}

          {section.subParagraphs?.map((p, i) => (
            <p key={i} className="abs-pump-seo-paragraph abs-pump-sub-para">{p}</p>
          ))}

          {section.subBullets && (
            <ul className="abs-pump-seo-list abs-pump-sub-list">
              {section.subBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}

          {section.footer && (
            <p className="abs-pump-seo-paragraph abs-pump-footer-note">{section.footer}</p>
          )}
        </div>
      ))}

    </div>
  </div>
)}
          {/* SEO Section - ALL 750+ Models in H2 Tags */}
          <div className="abs-pump-models-section">
            <h2 className="abs-pump-models-heading">{partData.modelsHeading}</h2>
            
            {/* Display ALL 750 models in H2 tags for SEO */}
           <div className="abs-pump-seo-models-container">
  {allModels.map((model, index) => (
    <h2 key={index} className="abs-pump-seo-model-h2">
      {model} {partData.name}
    </h2>
  ))}
</div>
          </div>
        </div>
      </section>
    </div>
  );
}