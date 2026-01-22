import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
// ============================================================================

//
// import {
//   trackEvent,
//   trackButtonClick,
//   trackLinkClick,
//   trackSearch,
//   initScrollTracking,
//   resetPageTimer,
//   trackTimeOnPage,
//   trackFilterChange,
//   trackCarouselInteraction,
//   trackBrandClick,
//   trackPartCategoryClick,
//   trackCTAClick,
//   trackAPIError,
//   trackFormFieldInteraction,
// } from "../utils/analytics";
//
// REPLACE your current analytics imports with this:
import {
  trackEvent,
  trackButtonClick,
  trackLinkClick,
  trackSearch,
  initScrollTracking,
  resetPageTimer,
  trackTimeOnPage,
  trackFilterChange,
  trackCarouselInteraction,
  trackBrandClick,
  trackPartCategoryClick,
  trackCTAClick,
  trackAPIError,
  trackFormFieldInteraction,
} from "../utils/analytics";

// // Add these debug lines RIGHT AFTER the import
// console.log('🔍 AFTER IMPORT CHECK:');
// console.log('  trackFilterChange:', typeof trackFilterChange);
// console.log('  trackEvent:', typeof trackEvent);
// console.log('  All imported:', {
//   trackEvent: typeof trackEvent,
//   trackFilterChange: typeof trackFilterChange,
//   trackFormFieldInteraction: typeof trackFormFieldInteraction
// });
// Import Images
import bannerImage from "../assets/images/banner-img.webp";

import part1 from "../assets/images/WhatsApp Image 2026-01-03 at 10.40.38 AM.jpeg";
import part2 from "../assets/images/Radio controller- Display.webp";
import part3 from "../assets/images/Display.webp";
import part4 from "../assets/images/Speedometer - Instr. Cluster.jpeg";
import part5 from "../assets/images/Steering Column.jpeg";
import part6 from "../assets/images/Mechanical Parts.webp";
import part7 from "../assets/images/Body Parts.webp";
import part8 from "../assets/images/Engine Computers.webp";
import part9 from "../assets/images/Engine.webp";
import part10 from "../assets/images/transmission.webp";
import part11 from "../assets/images/Transfer Case.jpeg";
import part12 from "../assets/images/Axle Assembly.jpeg";
import part13 from "../assets/images/Drive Shaft.jpeg";
import part14 from "../assets/images/Rims.webp";

// Brand Images
import brand1 from "../assets/images/brands/accura.webp";
import brand2 from "../assets/images/brands/american moters.webp";
import brand3 from "../assets/images/brands/audi.webp";
import brand4 from "../assets/images/brands/benz.webp";
import brand5 from "../assets/images/brands/bmw.webp";
import brand6 from "../assets/images/brands/buik.webp";
import brand7 from "../assets/images/brands/cadillac.webp";
import brand8 from "../assets/images/brands/chevrolet.webp";
import brand9 from "../assets/images/brands/chrysler.webp";
import brand10 from "../assets/images/brands/daewoo.webp";
import brand11 from "../assets/images/brands/daihatsu.webp";
import brand12 from "../assets/images/brands/dodge.webp";
import brand13 from "../assets/images/brands/eagle.webp";
import brand14 from "../assets/images/brands/ford.webp";
import brand15 from "../assets/images/brands/gmc.webp";
import brand16 from "../assets/images/brands/honda.webp";
import brand17 from "../assets/images/brands/hyundai.webp";
import brand18 from "../assets/images/brands/isuzu.webp";
import brand19 from "../assets/images/brands/jaguar.webp";
import brand20 from "../assets/images/brands/kia.webp";
import brand21 from "../assets/images/brands/lamborghini.webp";
import brand22 from "../assets/images/brands/lexus.webp";
import brand23 from "../assets/images/brands/lincoln.webp";
import brand24 from "../assets/images/brands/maybach.webp";
import brand25 from "../assets/images/brands/mazda.webp";
import brand26 from "../assets/images/brands/mercury.webp";
import brand27 from "../assets/images/brands/minicooper.webp";
import brand28 from "../assets/images/brands/mitsubishi.webp";
import brand29 from "../assets/images/brands/nissan.webp";
import brand30 from "../assets/images/brands/oldmobile.webp";
import brand31 from "../assets/images/brands/plymouth.webp";
import brand32 from "../assets/images/brands/pontiac.webp";
import brand33 from "../assets/images/brands/porsche.webp";
import brand34 from "../assets/images/brands/range rover.webp";
import brand35 from "../assets/images/brands/saab.webp";
import brand36 from "../assets/images/brands/saturn.webp";
import brand37 from "../assets/images/brands/scion.webp";
import brand38 from "../assets/images/brands/subaru.webp";
import brand39 from "../assets/images/brands/suzuki.webp";
import brand40 from "../assets/images/brands/tesla.webp";
import brand41 from "../assets/images/brands/toyota.webp";
import brand42 from "../assets/images/brands/volvo.webp";
import brand43 from "../assets/images/brands/datsun.webp";

// Why nexxa images
import headset from "../assets/images/icons/Headset.svg";
import lowMileage from "../assets/images/icons/Tumble Dry Low Heat.svg";
import delivery from "../assets/images/icons/Document Delivery.svg";
import radiator from "../assets/images/icons/Car Radiator.svg";
import { ChevronLeft, ChevronRight, Heading2 } from "lucide-react";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
console.log("API Base URL:", API_BASE_URL);

// Parts images array with names
const partsImages = [
  { img: part1, name: "Anti Brake Module Pump" },
  { img: part2, name: "Radio Controller" },
  { img: part3, name: "Display Unit" },
  { img: part4, name: "Speedometer - Instr.Cluster" },
  { img: part5, name: "Steering Column" },
  { img: part6, name: "Mechanical Parts" },
  { img: part7, name: "Body Parts" },
  { img: part8, name: "Engine Computers" },
  { img: part9, name: "Engine" },
  { img: part10, name: "Transmission" },
  { img: part11, name: "Transfercase" },
  { img: part12, name: "Axel Assembly" },
  { img: part13, name: "Drive Shaft" },
  { img: part14, name: "Rims" },
];

// Brand image mapping for matching with API data
const brandImageMap = {
  'acura': brand1,
  'american motors': brand2,
  'audi': brand3,
  'mercedes-benz': brand4,
  'mercedes benz': brand4,
  'benz': brand4,
  'bmw': brand5,
  'buick': brand6,
  'cadillac': brand7,
  'chevrolet': brand8,
  'chrysler': brand9,
  'daewoo': brand10,
  'daihatsu': brand11,
  'dodge': brand12,
  'eagle': brand13,
  'ford': brand14,
  'gmc': brand15,
  'honda': brand16,
  'hyundai': brand17,
  'isuzu': brand18,
  'jaguar': brand19,
  'kia': brand20,
  'lamborghini': brand21,
  'lexus': brand22,
  'lincoln': brand23,
  'maybach': brand24,
  'mazda': brand25,
  'mercury': brand26,
  'mini cooper': brand27,
  'mini': brand27,
  'mitsubishi': brand28,
  'nissan': brand29,
  'oldsmobile': brand30,
  'plymouth': brand31,
  'pontiac': brand32,
  'porsche': brand33,
  'range rover': brand34,
  'land rover': brand34,
  'saab': brand35,
  'saturn': brand36,
  'scion': brand37,
  'subaru': brand38,
  'suzuki': brand39,
  'tesla': brand40,
  'toyota': brand41,
  'volvo': brand42,
  'datsun': brand43,
};

// Fallback brands array (in case API is not available)
const brandsWithData = [
  { img: brand1, name: "Acura", slug: "acura" },
  { img: brand2, name: "American Motors", slug: "american-motors" },
  { img: brand3, name: "Audi", slug: "audi" },
  { img: brand4, name: "Mercedes-Benz", slug: "mercedes-benz" },
  { img: brand5, name: "BMW", slug: "bmw" },
  { img: brand6, name: "Buick", slug: "buick" },
  { img: brand7, name: "Cadillac", slug: "cadillac" },
  { img: brand8, name: "Chevrolet", slug: "chevrolet" },
  { img: brand9, name: "Chrysler", slug: "chrysler" },
  { img: brand10, name: "Daewoo", slug: "daewoo" },
  { img: brand11, name: "Daihatsu", slug: "daihatsu" },
  { img: brand12, name: "Dodge", slug: "dodge" },
  { img: brand13, name: "Eagle", slug: "eagle" },
  { img: brand14, name: "Ford", slug: "ford" },
  { img: brand15, name: "GMC", slug: "gmc" },
  { img: brand16, name: "Honda", slug: "honda" },
  { img: brand17, name: "Hyundai", slug: "hyundai" },
  { img: brand18, name: "Isuzu", slug: "isuzu" },
  { img: brand19, name: "Jaguar", slug: "jaguar" },
  { img: brand20, name: "Kia", slug: "kia" },
  { img: brand21, name: "Lamborghini", slug: "lamborghini" },
  { img: brand22, name: "Lexus", slug: "lexus" },
  { img: brand23, name: "Lincoln", slug: "lincoln" },
  { img: brand24, name: "Maybach", slug: "maybach" },
  { img: brand25, name: "Mazda", slug: "mazda" },
  { img: brand26, name: "Mercury", slug: "mercury" },
  { img: brand27, name: "Mini Cooper", slug: "mini-cooper" },
  { img: brand28, name: "Mitsubishi", slug: "mitsubishi" },
  { img: brand29, name: "Nissan", slug: "nissan" },
  { img: brand30, name: "Oldsmobile", slug: "oldsmobile" },
  { img: brand31, name: "Plymouth", slug: "plymouth" },
  { img: brand32, name: "Pontiac", slug: "pontiac" },
  { img: brand33, name: "Porsche", slug: "porsche" },
  { img: brand34, name: "Range Rover", slug: "range-rover" },
  { img: brand35, name: "Saab", slug: "saab" },
  { img: brand36, name: "Saturn", slug: "saturn" },
  { img: brand37, name: "Scion", slug: "scion" },
  { img: brand38, name: "Subaru", slug: "subaru" },
  { img: brand39, name: "Suzuki", slug: "suzuki" },
  { img: brand40, name: "Tesla", slug: "tesla" },
  { img: brand41, name: "Toyota", slug: "toyota" },
  { img: brand42, name: "Volvo", slug: "volvo" },
  { img: brand43, name: "Datsun", slug: "datsun" },
];

const Home = () => {
  const navigate = useNavigate();
  const scrollRef = React.useRef(null);
  
  // Form selections state
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedPart, setSelectedPart] = useState("");

  // Backend data state
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [partCategories, setPartCategories] = useState([]);
  const [brandsWithManufacturers, setBrandsWithManufacturers] = useState([]);

  // Loading states
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingParts, setLoadingParts] = useState(true);
  const [error, setError] = useState(null);
  const [searchFormStarted, setSearchFormStarted] = useState(false);

  // Initialize tracking on mount
  useEffect(() => {
    resetPageTimer();
    const cleanupScroll = initScrollTracking();
    
    trackEvent('home_page_loaded', {
      page_location: window.location.href,
      referrer: document.referrer,
    });
    
    return () => {
      trackTimeOnPage('/');
      cleanupScroll();
    };
  }, []);

  // Preload banner image
  useEffect(() => {
    const preloadBanner = new Image();
    preloadBanner.src = bannerImage;
  }, []);

  // Fetch manufacturers on mount
  useEffect(() => {
    fetchManufacturers();
    fetchPartCategories();
  }, []);

  // Fetch models when manufacturer changes
  useEffect(() => {
    if (selectedManufacturer) {
      fetchModelsByManufacturer(selectedManufacturer);
    } else {
      setModels([]);
      setSelectedModel("");
    }
  }, [selectedManufacturer]);

  // Match manufacturers with brand images
  useEffect(() => {
    if (manufacturers.length > 0) {
      const matched = manufacturers
        .map(mfg => {
          const nameKey = mfg.name.toLowerCase();
          const img = brandImageMap[nameKey];

          if (img) {
            return {
              id: mfg.id,
              name: mfg.name,
              slug: mfg.slug,
              img: img
            };
          }
          return null;
        })
        .filter(Boolean);

      setBrandsWithManufacturers(matched);
    }
  }, [manufacturers]);

  const handleSearchFormStart = () => {
    if (!searchFormStarted) {
      setSearchFormStarted(true);
      trackEvent('search_form_started', {
        form_location: 'home_banner',
      });
    }
  };

  const fetchManufacturers = async () => {
    try {
      setLoadingManufacturers(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/manufacturers/`);
      const data = await response.json();

      if (data.success && data.data) {
        setManufacturers(data.data);
        trackEvent('manufacturers_loaded', {
          count: data.data.length,
        });
      } else {
        throw new Error("Failed to load manufacturers");
      }
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      setError("Failed to load manufacturers. Please refresh the page.");
      trackAPIError('/manufacturers/', 'unknown', error.message);
    } finally {
      setLoadingManufacturers(false);
    }
  };

  const fetchModelsByManufacturer = async (manufacturerId) => {
    try {
      setLoadingModels(true);

      const response = await fetch(
        `${API_BASE_URL}/manufacturers/${manufacturerId}/models/`,
      );
      const data = await response.json();

      if (data.success && data.data) {
        setModels(data.data);
        trackEvent('models_loaded', {
          manufacturer_id: manufacturerId,
          count: data.data.length,
        });
      } else {
        throw new Error("Failed to load models");
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      alert("Failed to load models. Please try again.");
      trackAPIError(`/manufacturers/${manufacturerId}/models/`, 'unknown', error.message);
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
        trackEvent('part_categories_loaded', {
          count: data.data.length,
        });
      } else {
        throw new Error("Failed to load part categories");
      }
    } catch (error) {
      console.error("Error fetching part categories:", error);
      setError("Failed to load part categories. Please refresh the page.");
      trackAPIError('/part-categories/', 'unknown', error.message);
    } finally {
      setLoadingParts(false);
    }
  };

  const handleYearChange = (e) => {
  const value = e.target.value;
  setSelectedYear(value);
  handleSearchFormStart();
  
  if (value) {
    trackFilterChange('year', value, 'home_page_search');
    trackFormFieldInteraction('vehicle_search', 'year', value);
  }
};  
  const handleManufacturerChange = (e) => {
    const value = e.target.value;
    setSelectedManufacturer(value);
    setSelectedModel("");
    handleSearchFormStart();
    
    if (value) {
      const mfgData = manufacturers.find(m => m.id === parseInt(value));
      if (mfgData) {
        trackFilterChange('manufacturer', mfgData.name, 'home_page_search');
        trackFormFieldInteraction('vehicle_search', 'manufacturer', mfgData.name);
      }
    }
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    setSelectedModel(value);
    handleSearchFormStart();
    
    if (value) {
      const modelData = models.find(m => m.id === parseInt(value));
      if (modelData) {
        trackFilterChange('model', modelData.name, 'home_page_search');
        trackFormFieldInteraction('vehicle_search', 'model', modelData.name);
      }
    }
  };

  const handlePartChange = (e) => {
    const value = e.target.value;
    setSelectedPart(value);
    handleSearchFormStart();
    
    if (value) {
      const partData = partCategories.find(p => p.id === parseInt(value));
      if (partData) {
        trackFilterChange('part_category', partData.name, 'home_page_search');
        trackFormFieldInteraction('vehicle_search', 'part_category', partData.name);
      }
    }
  };

  const handleSearch = () => {
    if (!selectedYear) {
      alert("Please select a year");
      trackEvent('search_validation_failed', { missing_field: 'year' });
      return;
    }
    if (!selectedManufacturer) {
      alert("Please select a manufacturer");
      trackEvent('search_validation_failed', { missing_field: 'manufacturer' });
      return;
    }
    if (!selectedModel) {
      alert("Please select a model");
      trackEvent('search_validation_failed', { missing_field: 'model' });
      return;
    }
    if (!selectedPart) {
      alert("Please select a part category");
      trackEvent('search_validation_failed', { missing_field: 'part_category' });
      return;
    }

    const manufacturerData = manufacturers.find(
      (m) => m.id === parseInt(selectedManufacturer),
    );
    const modelData = models.find((m) => m.id === parseInt(selectedModel));
    const partData = partCategories.find(
      (p) => p.id === parseInt(selectedPart),
    );
    
    const searchQuery = `${selectedYear} ${manufacturerData?.name} ${modelData?.name} ${partData?.name}`;
    trackSearch(searchQuery, 0);
    
    trackEvent('parts_search_submitted', {
      year: selectedYear,
      manufacturer: manufacturerData?.name,
      model: modelData?.name,
      part_category: partData?.name,
      search_location: 'home_page_banner',
    });
    
    trackCTAClick('Search Now', 'home_banner', 'primary_button');

    const params = new URLSearchParams({
      year: selectedYear,
      manufacturerId: selectedManufacturer,
      manufacturerName: manufacturerData?.name || "",
      modelId: selectedModel,
      modelName: modelData?.name || "",
      partCategoryId: selectedPart,
      partCategoryName: partData?.name || "",
    });

    navigate(`/product-details?${params.toString()}`);
  };

  const handleBrandClick = (brand) => {
    trackBrandClick(brand.name, brand.slug, 'brands_marquee');
    navigate(`/used/${brand.slug}/parts`);
  };

  const handlePartCardClick = (partName) => {
    trackPartCategoryClick(partName, 'parts_carousel');
  };

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      if (direction === "left") current.scrollLeft -= 300;
      else current.scrollLeft += 300;

      trackCarouselInteraction('parts_carousel', 'manual_scroll', direction);
    }
  };

  // Generate years array (1970 to current year + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1969 },
    (_, i) => currentYear + 1 - i,
  );

  // Use API-matched brands if available, otherwise fallback to static data
  const displayBrands = brandsWithManufacturers.length > 0 
    ? brandsWithManufacturers 
    : brandsWithData;

  return (
    <div>
      {error && (
        <div
          style={{
            background: "#fee",
            color: "#c00",
            padding: "15px",
            textAlign: "center",
            borderBottom: "2px solid #c00",
          }}
        >
          {error}
        </div>
      )}

      <section
        className="banner"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="banner-overlay"></div>
        <div className="banner-gradient"></div>

        <div className="banner-inner">
          <div className="banner-left">
  <h1>Premium OEM Used Auto Parts - Nationwide Shipping for All Vehicle Makes and Models</h1>
  
  {/* Keep your styled version visually, but hide it from SEO */}
  <div className="banner-title" aria-hidden="true">
    At <span className="highlight">Nexxa Auto</span> <br />
    Millions of <br />
    <span className="highlight">OEM Used Parts.</span> <br />
    Matched to Your Vehicle.
  </div>

  <p className="why-description">
    Nexxa Auto Parts offers reliable OEM used car parts with nationwide
    shipping, expert support, and accurate VIN matching.
  </p>
</div>

          <div className="banner-right">

            <p className="search-heading"></p>

            <h2 className="search-heading">

              One Smart Search, Your Perfect Fit Starts Here.
            </h2>

            <div className="banner-form">
              <div className="row">
                <select value={selectedYear} onChange={handleYearChange}>
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  value={selectedManufacturer}
                  onChange={handleManufacturerChange}
                  disabled={loadingManufacturers}
                >
                  <option value="">Make</option>
                  {manufacturers.map((mfg) => (
                    <option key={mfg.id} value={mfg.id}>{mfg.name}</option>
                  ))}
                </select>

                <select
                  value={selectedModel}
                  onChange={handleModelChange}
                  disabled={!selectedManufacturer || loadingModels}
                >
                  <option value="">Model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>

              <select
                className="full"
                value={selectedPart}
                onChange={handlePartChange}
              >
                <option value="">Parts</option>
                {partCategories.map((part) => (
                  <option key={part.id} value={part.id}>{part.name}</option>
                ))}
              </select>

              <button onClick={handleSearch}>Search Now</button>
            </div>

            <p className="vin-link">
              Don't know your vehicle? <a href="#vin">Enter VIN</a>
            </p>
          </div>
        </div>

        <div className="why-nexxa banner-why">
          <div className="why-top-row">
            <h2 className="why-heading">Why Nexxa Auto Parts</h2>

            <div className="why-box">
              <img src={headset} alt="Free expert support" />
              <span>Free expert support</span>
            </div>

            <div className="why-box">
              <img src={lowMileage} alt="Low mileage parts" />
              <span>Low mileage parts</span>
            </div>

            <div className="why-box">
              <img src={delivery} alt="Nationwide shipping" />
              <span>Nationwide shipping</span>
            </div>

            <div className="why-box">
              <img src={radiator} alt="VIN-matched parts" />
              <span>VIN-matched parts</span>
            </div>
          </div>

          <p className="why-desc">
            Free Expert Support: Get guidance from experienced auto parts specialists to
            find the right fit fast. Low Mileage Parts: Quality-tested OEM used parts with
            low mileage for long-lasting performance. Nationwide Shipping: Fast and
            reliable nationwide shipping straight to your doorstep. VIN-Matched Parts:
            Exact OEM parts matched to your vehicle using precise VIN verification.
          </p>
        </div>
      </section>

      <section className="explore-parts">
        <h2>
          Explore Our <span className="highlight">Premium</span> Used Auto Parts
        </h2>

        <p className="section-description">
          Explore OEM used auto parts—engines, transmissions, modules, rims, and body components for major brands.
        </p>

        <div className="scroll-wrapper">
          <div className="cards-container">
            <div className="cards-track">
              {[...partsImages, ...partsImages].map((part, idx) => (
                <div 
                  className="part-card" 
                  key={idx}
                  onClick={() => handlePartCardClick(part.name)}
                >
                  <img src={part.img} alt={part.name} />
                  <p className="part-name">{part.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-header">
              <span className="icon">🔍</span>
              <h3>Find Your Part</h3>
            </div>
            <p>
              Search our extensive inventory by entering your vehicle details
              and part requirements.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="icon">💬</span>
              <h3>Get a Quote</h3>
            </div>
            <p>
              Receive a competitive quote with detailed information about part
              condition and warranty.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="icon">🚚</span>
              <h3>Fast Shipping</h3>
            </div>
            <p>
              We ship your part quickly with nationwide delivery and tracking
              information.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="icon">🛡️</span>
              <h3>Warranty Support</h3>
            </div>
            <p>
              Enjoy peace of mind with standard warranty and responsive customer
              service.
            </p>
          </div>
        </div>
      </section>

      <section className="customer-reviews">
        <h2>
          What Our <span>Customers Say</span>
        </h2>
        <div className="reviews-slider">
          <div className="reviews-track">
            {[
              {
                name: "Garza Prosser",
                review:
                  "I found this company online — great service, excellent prices, and honest people. Deliveries are always on time. Honestly, I highly recommend them. I give them 10 out of 10!",
              },
              {
                name: "Jon Heter",
                review:
                  "I found this company online as I was hit with a big expense on my Jeep. Pete was so fast in finding exactly what I needed. It took about a week to get to me, and followed through every step to ensure I got a finished great driving Jeep! Their team is extremely empathetic and well deserving of this review!! Don't hesitate in using them. You'll be happy you did.",
              },
              {
                name: "Melvin Vaughm",
                review:
                  "Great auto parts service provider. Honest upfront throughout the entire process. They unfortunately couldn't locate a respectable part in ideal condition. They were amenable to a complete and total refund. Although it took a bit of time, Dennis worked with me consistently.",
              },
              {
                name: "Jake Carter",
                review:
                  "Had to get a rear end for 06 Toyota, Pete was extremely helpful and professional. Replied promptly back to texts and calls.",
              },
            ]
              .concat([
                {
                  name: "Garza Prosser",
                  review:
                    "I found this company online — great service, excellent prices, and honest people. Deliveries are always on time. Honestly, I highly recommend them. I give them 10 out of 10!",
                },
                {
                  name: "Jon Heter",
                  review:
                    "I found this company online as I was hit with a big expense on my Jeep. Pete was so fast in finding exactly what I needed. It took about a week to get to me, and followed through every step to ensure I got a finished great driving Jeep! Their team is extremely empathetic and well deserving of this review!! Don't hesitate in using them. You'll be happy you did.",
                },
                {
                  name: "Melvin Vaughm",
                  review:
                    "Great auto parts service provider. Honest upfront throughout the entire process. They unfortunately couldn't locate a respectable part in ideal condition. They were amenable to a complete and total refund. Although it took a bit of time, Dennis worked with me consistently.",
                },
                {
                  name: "Jake Carter",
                  review:
                    "Had to get a rear end for 06 Toyota, Pete was extremely helpful and professional. Replied promptly back to texts and calls.",
                },
              ])
              .map((item, index) => (
                <div className="review-card" key={index}>
                  <div className="review-header">
                    <span className="user-icon">👤</span>
                    <h4>{item.name}</h4>
                  </div>
                  <span className="review-time">4 weeks ago</span>
                  <div className="review-stars">★★★★★</div>
                  <p className="review-text">{item.review}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="brands-section">
        <h2>Search by Brands</h2>
        <p>We stock parts for all major automotive brands</p>
        <div className="brands-marquee">
          <div className="brands-track">
            {displayBrands.map((brand, idx) => (
              <div 
                className="brand-card" 
                key={idx}
                onClick={() => handleBrandClick(brand)}
                style={{ cursor: 'pointer' }}
              >
                <img src={brand.img} alt={brand.name} title={brand.name} />
              </div>
            ))}
            {displayBrands.map((brand, idx) => (
              <div 
                className="brand-card" 
                key={`dup-${idx}`}
                onClick={() => handleBrandClick(brand)}
                style={{ cursor: 'pointer' }}
              >
                <img src={brand.img} alt={brand.name} title={brand.name} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
