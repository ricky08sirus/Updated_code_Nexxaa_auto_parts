// RequestSuccess.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Thankyou.css";

const Thankyou = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackData = {
  partCategoryName: "Engine",
  year: "2018",
  manufacturerName: "Toyota",
  modelName: "Innova",
};

const { partCategoryName, year, manufacturerName, modelName } =
  location.state || fallbackData;


  if (!partCategoryName || !year || !manufacturerName || !modelName) {
    return (
      <div className="product-details">
        <div className="product-error">
          <h2>Nothing to show</h2>
          <p>Please submit a product inquiry first.</p>
          <button onClick={() => navigate("/")}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details">
      <div className="success-popup-overlay">
        <div className="success-popup">
          <div className="confetti"></div>
          <div className="confetti"></div>
          <div className="confetti"></div>

          <div className="success-popup-content">
            <div className="success-icon-wrapper">
              <div className="success-icon">✓</div>
            </div>

            <h1>Request Received!</h1>
            <p>
              Thank you for your inquiry! We've received your request for the{" "}
              <strong>{partCategoryName}</strong> for your {year}{" "}
              {manufacturerName} {modelName}.
            </p>
            <p>
              Our team will review your request and contact you within 2-45
              minutes with availability and pricing information.
            </p>

            <button
              className="success-popup-close"
              onClick={() => navigate("/")}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thankyou;
