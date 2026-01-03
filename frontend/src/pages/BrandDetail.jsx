import { useParams, Link } from "react-router-dom";
import VehicleSearchForm from "../components/VehicleSearchForm";
import brandData from "../assets/brandData";
import "./BrandDetail.css";

export default function BrandDetail() {
  const { id } = useParams();
  const brand = brandData[id];

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

  return (
    <div className="brand-detail-container">
      {/* HEADER SECTION WITH BRAND TITLE */}
      <div className="brand-header">
        <h1 className="brand-title">
          Find Quality Used <span className="brand-title-highlight">{brand.title.toUpperCase()}</span> Parts
        </h1>
        
        {/* BRAND LOGO */}
        <div className="brand-logo-container">
          <img
            src={brand.image}
            alt={`${brand.title} logo`}
            className="brand-logo"
          />
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="brand-content">
        <div className="brand-grid">
          {/* LEFT COLUMN - DESCRIPTION */}
          <div className="brand-description-section">
            <h2 className="brand-description-title">
              Used {brand.title} Parts
            </h2>
            <p className="brand-description-text">
              {brand.description}
            </p>
          </div>

          {/* RIGHT COLUMN - SEARCH FORM */}
          <div className="brand-search-section">
            <VehicleSearchForm brandName={brand.title} />
          </div>
        </div>

        {/* MODELS SECTION */}
        <div className="brand-models-section">
          <h2 className="brand-models-title">
            {brand.title} Models
          </h2>
          
          <div className="brand-models-grid">
            {brand.models.map((model, index) => (
              <button
                key={index}
                to={model.path}
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