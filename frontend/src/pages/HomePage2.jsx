import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import brandData from "../assets/brandData"; 

import "./Home.css";

// Import Images
import bannerImage from "../assets/images/banner-image.webp";

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



// why nexxa images
import headset from "../assets/images/icons/Headset.svg";
import lowMileage from "../assets/images/icons/Tumble Dry Low Heat.svg";
import delivery from "../assets/images/icons/Document Delivery.svg";
import radiator from "../assets/images/icons/Car Radiator.svg";
import { ChevronLeft, ChevronRight } from "lucide-react";

// API Configuration

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
console.log("API Base URL:", API_BASE_URL);

// Parts images array
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
  { img: part12, name: "Axle Assembly" },
  { img: part13, name: "Drive Shaft" },
  { img: part14, name: "Rims" },
];


// Brands array
// const brands = [
//   brand1,
//   brand2,
//   brand3,
//   brand4,
//   brand5,
//   brand6,
//   brand7,
//   brand8,
//   brand9,
//   brand10,
//   brand11,
//   brand12,
//   brand13,
//   brand14,
//   brand15,
//   brand16,
//   brand17,
//   brand18,
//   brand19,
//   brand20,
//   brand21,
//   brand22,
//   brand23,
//   brand24,
//   brand25,
//   brand26,
//   brand27,
//   brand28,
//   brand29,
//   brand30,
//   brand31,
//   brand32,
//   brand33,
//   brand34,
//   brand35,
//   brand36,
//   brand37,
//   brand38,
//   brand39,
//   brand40,
//   brand41,
//   brand42,
//   brand43,
  
// ];

const brands = [
  { id: 1, image: brand1, name: "Acura", slug: "acura" },
  { id: 2, image: brand5, name: "BMW", slug: "bmw" },
  { id: 3, image: brand6, name: "Buick", slug: "buick" }, // ✅ Fixed slug
  { id: 4, image: brand7, name: "Cadillac", slug: "cadillac" },
  { id: 6, image: brand8, name: "Chevrolet", slug: "chevrolet" },
  { id: 7, image: brand9, name: "Chrysler", slug: "chrysler" },
  { id: 8, image: brand10, name: "Daewoo", slug: "daewoo" },
  { id: 9, image: brand11, name: "Daihatsu", slug: "daihatsu" }, // ✅ Fixed spelling
  { id: 10, image: brand12, name: "Dodge", slug: "dodge" },
  { id: 11, image: brand13, name: "Eagle", slug: "eagle" },
  { id: 14, image: brand14, name: "Ford", slug: "ford" },
  { id: 15, image: brand15, name: "GMC", slug: "gmc" },
  { id: 16, image: brand16, name: "Honda", slug: "honda" },
  { id: 17, image: brand17, name: "Hyundai", slug: "hyundai" }, // ✅ Fixed spelling
  { id: 20, image: brand2, name: "Infiniti", slug: "infiniti" },
  { id: 21, image: brand18, name: "Isuzu", slug: "isuzu" },
  { id: 22, image: brand19, name: "Jaguar", slug: "jaguar" },
  { id: 18, image: brand20, name: "Jeep", slug: "jeep" },
  { id: 24, image: brand20, name: "Kia", slug: "kia" },
  { id: 26, image: brand34, name: "Land Rover", slug: "land-rover" }, // ✅ Fixed
  { id: 27, image: brand22, name: "Lexus", slug: "lexus" },
  { id: 28, image: brand23, name: "Lincoln", slug: "lincoln" },
  { id: 30, image: brand25, name: "Mazda", slug: "mazda" },
  { id: 31, image: brand4, name: "Mercedes-Benz", slug: "mercedes-benz" },
  { id: 32, image: brand26, name: "Mercury", slug: "mercury" },
  { id: 33, image: brand27, name: "Mini Cooper", slug: "mini-cooper" },
  { id: 34, image: brand28, name: "Mitsubishi", slug: "mitsubishi" },
  { id: 35, image: brand29, name: "Nissan", slug: "nissan" },
  { id: 36, image: brand30, name: "Oldsmobile", slug: "oldsmobile" },
  { id: 37, image: brand31, name: "Plymouth", slug: "plymouth" }, // ✅ Fixed spelling
  { id: 38, image: brand32, name: "Pontiac", slug: "pontiac" },
  { id: 39, image: brand33, name: "Porsche", slug: "porsche" },
  { id: 41, image: brand35, name: "Saab", slug: "saab" },
  { id: 42, image: brand36, name: "Saturn", slug: "saturn" },
  { id: 43, image: brand37, name: "Scion", slug: "scion" },
  { id: 44, image: brand38, name: "Subaru", slug: "subaru" },
  { id: 45, image: brand39, name: "Suzuki", slug: "suzuki" },
  { id: 46, image: brand40, name: "Tesla", slug: "tesla" },
  { id: 41, image: brand41, name: "Toyota", slug: "toyota" },
  { id: 48, image: brand3, name: "Volkswagen", slug: "volkswagen" },
  { id: 49, image: brand42, name: "Volvo", slug: "volvo" },
];


const Home = () => {
  const navigate = useNavigate();
  const scrollRef = React.useRef(null);

  useEffect(() => {
    const preloadBanner = new Image();
    preloadBanner.src = bannerImage;
  }, []);

  // Form selections state
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedPart, setSelectedPart] = useState("");

  // Backend data state
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [partCategories, setPartCategories] = useState([]);

  // Loading states
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingParts, setLoadingParts] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchManufacturers = async () => {
    try {
      setLoadingManufacturers(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/manufacturers/`);
      const data = await response.json();

      if (data.success && data.data) {
        setManufacturers(data.data);
      } else {
        throw new Error("Failed to load manufacturers");
      }
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      setError("Failed to load manufacturers. Please refresh the page.");
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
      } else {
        throw new Error("Failed to load models");
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      alert("Failed to load models. Please try again.");
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
        throw new Error("Failed to load part categories");
      }
    } catch (error) {
      console.error("Error fetching part categories:", error);
      setError("Failed to load part categories. Please refresh the page.");
    } finally {
      setLoadingParts(false);
    }
  };

  const handleManufacturerChange = (e) => {
    const value = e.target.value;
    setSelectedManufacturer(value);
    setSelectedModel(""); 
  };

  const handleSearch = () => {

    if (!selectedYear) {
      alert("Please select a year");
      return;
    }
    if (!selectedManufacturer) {
      alert("Please select a manufacturer");
      return;
    }
    if (!selectedModel) {
      alert("Please select a model");
      return;
    }
    if (!selectedPart) {
      alert("Please select a part category");
      return;
    }

    // Find the selected items' details
    const manufacturerData = manufacturers.find(
      (m) => m.id === parseInt(selectedManufacturer),
    );
    const modelData = models.find((m) => m.id === parseInt(selectedModel));
    const partData = partCategories.find(
      (p) => p.id === parseInt(selectedPart),
    );

    // Navigate to product details page with complete data
    navigate("/order-a-part", {
      state: {
        year: parseInt(selectedYear),
        manufacturerId: parseInt(selectedManufacturer),
        manufacturerName: manufacturerData?.name || "",
        modelId: parseInt(selectedModel),
        modelName: modelData?.name || "",
        partCategoryId: parseInt(selectedPart),
        partCategoryName: partData?.name || "",
      },
    });
  };

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      if (direction === "left") current.scrollLeft -= 300;
      else current.scrollLeft += 300;
    }
  };

  // Generate years array (1990 to current year + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1969 },
    (_, i) => currentYear + 1 - i,
  );

  return (
    <div>
      {/* Error Message */}
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

      {/* Banner Section with Search Form */}
<section
  className="banner"
  style={{ backgroundImage: `url(${bannerImage})` }}
>
  <div className="banner-overlay"></div>
  <div className="banner-gradient"></div>

  <div className="banner-inner">
    <div className="banner-left">
      <h1>
        At <span className="highlight">Nexxa Auto</span> <br />
        Millions of <br />
        <span className="highlight">OEM Used Parts.</span> <br />
        Matched to Your Vehicle.
      </h1>

      <p className="why-description">
        Nexxa Auto Parts offers reliable OEM used car parts with nationwide
        shipping, expert support, and accurate VIN matching.
      </p>
    </div>

    <div className="banner-right">
      {/* ✅ TEXT OUTSIDE / ABOVE SEARCH BOX */}
      <p className="search-heading">
        One Smart Search, Your Perfect Fit Starts Here.
      </p>

      {/* 🔲 BLACK SEARCH BOX */}
      <div className="banner-form">
        <div className="row">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
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
            onChange={(e) => setSelectedModel(e.target.value)}
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
          onChange={(e) => setSelectedPart(e.target.value)}
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

  {/* WHY NEXXA INSIDE BANNER */}
<div className="why-nexxa banner-why">
  {/* 🔹 HORIZONTAL ROW */}
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

  {/* 🔹 PARAGRAPH BELOW */}
  <p className="why-desc">
    Free Expert Support: Get guidance from experienced auto parts specialists to
    find the right fit fast. Low Mileage Parts: Quality-tested OEM used parts with
    low mileage for long-lasting performance. Nationwide Shipping: Fast and
    reliable nationwide shipping straight to your doorstep. VIN-Matched Parts:
    Exact OEM parts matched to your vehicle using precise VIN verification.
  </p>
</div>
</section>


      {/* Explore Our Premium Used Auto Parts */}
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
          <div className="part-card" key={idx}>
            <img src={part.img} alt={part.name} />
            <p className="part-name">{part.name}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* How It Works Section */}
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

      {/* Customer Reviews */}
      {/* Customer Reviews */}
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
            "I found this company online as I was hit with a big expense on my Jeep. Pete was so fast in finding exactly what I needed. It took about a week to get to me, and followed through every step to ensure I got a finished great driving Jeep! Their team is extremely empathetic and well deserving of this review!! Don’t hesitate in using them. You’ll be happy you did.",
        },
        {
          name: "Melvin Vaughm",
          review:
            "Great auto parts service provider. Honest upfront throughout the entire process. They unfortunately couldn’t locate a respectable part in ideal condition. They were amenable to a complete and total refund. Although it took a bit of time, Dennis worked with me consistently.",
        },
        {
          name: "Jake Carter",
          review:
            "Had to get a rear end for 06 Toyota, Pete was extremely helpful and professional. Replied promptly back to texts and calls.",
        },
      ]
        // Duplicate the array for infinite loop effect
        .concat([
          {
            name: "Garza Prosser",
            review:
              "I found this company online — great service, excellent prices, and honest people. Deliveries are always on time. Honestly, I highly recommend them. I give them 10 out of 10!",
          },
          {
            name: "Jon Heter",
            review:
              "I found this company online as I was hit with a big expense on my Jeep. Pete was so fast in finding exactly what I needed. It took about a week to get to me, and followed through every step to ensure I got a finished great driving Jeep! Their team is extremely empathetic and well deserving of this review!! Don’t hesitate in using them. You’ll be happy you did.",
          },
          {
            name: "Melvin Vaughm",
            review:
              "Great auto parts service provider. Honest upfront throughout the entire process. They unfortunately couldn’t locate a respectable part in ideal condition. They were amenable to a complete and total refund. Although it took a bit of time, Dennis worked with me consistently.",
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

      {/* Brands Section */}
{/* Brands Section */}
<section className="brands-section">
  <h2>Search by Brands</h2>
  <p>We stock parts for all major automotive brands</p>
  <div className="brands-marquee">
    <div className="brands-track">
      {brands.map((brand, idx) => (
        <div 
          className="brand-card" 
          key={idx}
        >
          <img src={brand.image} alt={brand.name} />
        </div>
      ))}
      {/* Duplicate for smooth infinite scroll */}
      {brands.map((brand, idx) => (
        <div 
          className="brand-card" 
          key={`dup-${idx}`}
        >
          <img src={brand.image} alt={brand.name} />
        </div>
      ))}
    </div>
  </div>
</section>
    </div>
  );
};

export default Home;
