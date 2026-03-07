import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import "./Landing.css";

const AcuraPartsFinder = () => {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [partCategory, setPartCategory] = useState("");

  const years = Array.from({ length: 30 }, (_, i) => 2025 - i);
  const makes = [
    "Acura",
    "Honda",
    "Toyota",
    "Ford",
    "Chevrolet",
    "BMW",
    "Mercedes",
  ];
  const models = [
    "CL",
    "CSX",
    "EL",
    "Integra",
    "Legend",
    "MDX",
    "RDX",
    "RSX",
    "TSX",
    "TL",
    "Vigor",
    "ZDX",
  ];
  const categories = [
    "Engine Parts",
    "Transmission",
    "Body Parts",
    "Interior",
    "Electrical",
    "Suspension",
    "Brakes",
    "Exhaust",
  ];

  const handleSearch = () => {
    if (!year || !make || !model || !partCategory) {
      alert("Please fill all fields before searching");
      return;
    }
    alert(`Searching for: ${year} ${make} ${model} - ${partCategory}`);
  };

  const handleModelClick = (modelName) => {
    alert(`Viewing parts for Acura ${modelName}`);
  };

  const handleVinEntry = () => {
    const vin = prompt("Enter your VIN (Vehicle Identification Number):");
    if (vin && vin.trim()) {
      alert(`Searching for VIN: ${vin}`);
    }
  };

  return (
    <>
      <div className="acura-parts-container">
        <header className="header">
          <h1>
            Find Quality Used <span className="acura-red">ACURA</span> Parts
          </h1>
        </header>

        <div className="content-wrapper">
          <div className="left-section">
            <div className="logo-container">
              <div className="acura-logo">
                <svg viewBox="0 0 100 100" className="logo-svg">
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#001f3f"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 50 22 L 33 72 M 50 22 L 67 72 M 28 72 L 72 72"
                    stroke="#001f3f"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="acura-text">ACURA</div>
            </div>

            <div className="description">
              <h2>Used Acura Parts</h2>
              <p>
                We have taken the time to inventory all wrecked and salvaged
                Acura vehicles to make sure you have instant access to any used
                Acura parts you are searching for online. You simply need to
                complete the used auto parts request form, so we can quickly
                quote you the best price guaranteed. Nexxaauto.com our one stop
                shop when it comes to any of your used auto part needs, and we
                can't wait to have the opportunity to help you today.
              </p>
            </div>
          </div>

          <div className="right-section">
            <div className="search-form">
              <div className="form-row">
                <select
                  className="form-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Year</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>

                <select
                  className="form-select"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                >
                  <option value="">Make</option>
                  {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>

                <select
                  className="form-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="">Model</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-row">
                <select
                  className="form-select full-width"
                  value={partCategory}
                  onChange={(e) => setPartCategory(e.target.value)}
                >
                  <option value="">Part Category Category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}
                  </option>)}
                </select>
              </div>

              <button className="search-button" onClick={handleSearch}>
                Search Now
              </button>

              <div className="vin-link" onClick={handleVinEntry}>
                Don't Know your vehicle ? Enter VIN
              </div>
            </div>
          </div>
        </div>

        <section className="models-section">
          <h2 className="models-title">Acura Models</h2>

          <div className="models-grid">
            <button
              className="model-button"
              onClick={() => handleModelClick("CL")}
            >
              Used Acura CL Parts
            </button>
            <button
              className="model-button"
              onClick={() => handleModelClick("CSX")}
            >
              Used Acura CSX Parts
            </button>
            <button
              className="model-button"
              onClick={() => handleModelClick("EL")}
            >
              Used Acura EL Parts
            </button>

            <button
              className="model-button"
              onClick={() => handleModelClick("Integra")}
            >
              Used Acura Integra Parts
            </button>
            <button
              className="model-button"
              onClick={() => handleModelClick("Legend")}
            >
              Used Acura Legend Parts
            </button>
            <button
              className="model-button"
              onClick={() => handleModelClick("MDX")}
            >
              Used Acura MDX Parts
            </button>

            <button
              className="model-button"
              onClick={() => handleModelClick("RDX")}
            >
              Used Acura RDX Parts
            </button>
            <button
              className="model-button"
              onClick={() => handleModelClick("RSX")}
            >
              Used Acura RSX Parts
            </button>
            <button
              className="model-button"
              onClick={() => handleModelClick("TSX")}
            >
              Used Acura TSX Parts
            </button>

            <button
              className="model-button"
              onClick={() => handleModelClick("TL")}
            >
              Used Acura TL Parts
            </button>
            <button
              className="model-button"
              onClick={() => handleModelClick("Vigor")}
            >
              Used Acura Vigor Parts
            </button>
            <button
              className="model-button"
              onClick={() => handleModelClick("ZDX")}
            >
              Used Acura ZDX Parts
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default AcuraPartsFinder;

