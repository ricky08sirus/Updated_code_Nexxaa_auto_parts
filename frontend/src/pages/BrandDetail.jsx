// import { useParams, Link } from "react-router-dom";
// import VehicleSearchForm from "../components/VehicleSearchForm";
// import brandData from "../assets/brandData";
// import "./BrandDetail.css";

// export default function BrandDetail() {
//   const { id } = useParams();
//   const brand = brandData[id];

//   if (!brand) {
//     return (
//       <div className="brand-not-found">
//         <h2 className="brand-not-found-title">Brand not found</h2>
//         <Link to="/" className="brand-not-found-link">
//           Go back to Home
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="brand-detail-container">
//       {/* HEADER SECTION WITH BRAND TITLE */}
//       <div className="brand-header">
//         <h1 className="brand-title">
//           Find Quality Used <span className="brand-title-highlight">{brand.title.toUpperCase()}</span> Parts
//         </h1>
//       </div>

//       {/* MAIN CONTENT CONTAINER */}
//       <div className="brand-content">
//         {/* TWO COLUMN LAYOUT: LEFT (LOGO + DESCRIPTION) | RIGHT (FORM) */}
//         <div className="brand-grid">
//           {/* LEFT COLUMN - LOGO AND DESCRIPTION */}
//           <div className="brand-left-section">
//             {/* BRAND LOGO */}
//             <div className="brand-logo-container">
//               <img
//                 src={brand.image}
//                 alt={`${brand.title} logo`}
//                 className="brand-logo"
//               />
//             </div>

//             {/* DESCRIPTION */}
//             <div className="brand-description-section">
//               <h2 className="brand-description-title">
//                 Used {brand.title} Parts
//               </h2>
//               <p className="brand-description-text">
//                 {brand.description}
//               </p>
//             </div>
//           </div>

//           {/* RIGHT COLUMN - SEARCH FORM */}
//           <div className="brand-search-section">
//             <VehicleSearchForm brandName={brand.title} />
//           </div>
//         </div>

//         {/* MODELS SECTION */}
//         <div className="brand-models-section">
//           <h2 className="brand-models-title">
//             {brand.title} Models
//           </h2>
          
//           <div className="brand-models-grid">
//             {brand.models.map((model, index) => (
//               <button
//                 key={index}
//                 to={model.path}
//                 className="brand-model-link"
//               >
//                 <h3 className="brand-model-title">
//                   Used {brand.title} {model.name} Parts
//                 </h3>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useParams, Link } from "react-router-dom";
import VehicleSearchForm from "../components/VehicleSearchForm";
import brandData from "../assets/brandData";
import "./BrandDetail.css";

export default function BrandDetail() {
  const { id } = useParams();
  
  // ✅ FIX: Handle both numeric IDs (like "18") and brand names (like "jeep")
  let brand = brandData[id]; // Try numeric ID first
  
  // If not found by numeric ID, search by brand name
  if (!brand) {
    // Convert URL parameter to match brand title (e.g., "jeep" -> "Jeep", "mini-cooper" -> "Mini Cooper")
    const searchName = id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Search through all brands to find a matching title
    brand = Object.values(brandData).find(
      b => b.title.toLowerCase() === searchName.toLowerCase()
    );
  }

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
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="brand-content">
        {/* TWO COLUMN LAYOUT: LEFT (LOGO + DESCRIPTION) | RIGHT (FORM) */}
        <div className="brand-grid">
          {/* LEFT COLUMN - LOGO AND DESCRIPTION */}
          <div className="brand-left-section">
            {/* BRAND LOGO */}
            <div className="brand-logo-container">
              <img
                src={brand.image}
                alt={`${brand.title} logo`}
                className="brand-logo"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="brand-description-section">
              <h2 className="brand-description-title">
                Used {brand.title} Parts
              </h2>
              <p className="brand-description-text">
                {brand.description}
              </p>
            </div>
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