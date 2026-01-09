// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import './EmailPage.css';
// import logoImage from "../assets/images/brands/nexxa logo.png";

// const EmailPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // Get user request data from location state or props
//   const requestData = location.state || {
//     userName: 'Customer',
//     year: '2020',
//     make: 'Ford',
//     model: 'F150',
//     partCategory: 'Headlight Assembly'
//   };

//   const [suggestedParts, setSuggestedParts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const API_BASE = 'https://nexxaauto.com/api';
//   const IMAGE_BASE = 'https://images.nexxaauto.com';
//   const R2_DEV_URL = 'https://pub-243a0890b1b15283d9c78a97866ba995.r2.dev';

//   const fixImageUrl = (url) => {
//     if (!url) return null;
//     return url.replace(R2_DEV_URL, IMAGE_BASE);
//   };

//   const getFirstImageUrl = (gallery) => {
//     if (gallery.primary_image && gallery.primary_image.url) {
//       return fixImageUrl(gallery.primary_image.url);
//     }
//     if (gallery.primary_image && gallery.primary_image.thumbnail) {
//       return fixImageUrl(gallery.primary_image.thumbnail);
//     }
//     if (gallery.images && gallery.images.length > 0) {
//       const firstImage = gallery.images[0];
//       return fixImageUrl(firstImage.image_url || firstImage.url || firstImage.image);
//     }
//     return null;
//   };

//   useEffect(() => {
//     const fetchSuggestedParts = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${API_BASE}/part-galleries/`);
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch parts');
//         }
        
//         const data = await response.json();
        
//         // Filter parts based on user's request (year, make, model)
//         const filteredParts = data.results
//           .filter(item => 
//             item.year.toString() === requestData.year &&
//             item.manufacturer_name.toLowerCase() === requestData.make.toLowerCase() &&
//             item.model_name.toLowerCase() === requestData.model.toLowerCase()
//           )
//           .slice(0, 6) // Get first 6 matching parts
//           .map(item => {
//             const primaryImageUrl = getFirstImageUrl(item);
//             const backendPrice = item.price || item.part_price || item.selling_price || null;
            
//             return {
//               id: item.id,
//               title: `${item.year} ${item.manufacturer_name} ${item.model_name} ${item.part_name}`,
//               description: `${item.part_name} - ${item.condition || 'Grade A'}`,
//               price: backendPrice ? parseFloat(backendPrice) : null,
//               condition: item.condition || 'Grade A',
//               primaryImage: primaryImageUrl,
//               slug: item.slug,
//               partName: item.part_name,
//               year: item.year,
//               manufacturer: item.manufacturer_name,
//               model: item.model_name,
//             };
//           });
        
//         setSuggestedParts(filteredParts);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching suggested parts:', error);
//         setLoading(false);
//       }
//     };

//     fetchSuggestedParts();
//   }, [requestData.year, requestData.make, requestData.model]);

//   const handlePartClick = (part) => {
//     // Navigate to product page with slug and id
//     navigate(`/product/${part.slug}/${part.id}`, {
//       state: { product: part }
//     });
//   };

//   return (
//     <div className="email-page-container">
//       <div className="email-card">
//         {/* Logo */}
//         <div className="email-logo-section">
//           <img src={logoImage} alt="Nexxa Auto Parts" className="email-logo" />
//         </div>

//         {/* Greeting */}
//         <div className="email-greeting">
//           <h2 className="email-greeting-text">Hello {requestData.userName},</h2>
//         </div>

//         {/* Main Message */}
//         <div className="email-main-message">
//           <p className="email-message-text">
//             As discussed, please find below the part details and secure link for the requested part for your{' '}
//             <strong>{requestData.year} {requestData.make} {requestData.model}</strong>.
//           </p>
//         </div>

//         {/* Section Title */}
//         <div className="email-section-title">
//           <span className="email-emoji-icon">👉</span>
//           <span className="email-title-text">View Part Description & Link:</span>
//         </div>

//         {/* Suggested Parts Grid */}
//         {loading ? (
//           <div className="email-loading-container">
//             <div className="email-spinner"></div>
//             <p className="email-loading-text">Loading suggested parts...</p>
//           </div>
//         ) : suggestedParts.length > 0 ? (
//           <div className="email-parts-grid">
//             {suggestedParts.map((part) => (
//               <div 
//                 key={part.id} 
//                 className="email-part-card"
//                 onClick={() => handlePartClick(part)}
//               >
//                 <div className="email-part-image-wrapper">
//                   {part.primaryImage ? (
//                     <img 
//                       src={part.primaryImage} 
//                       alt={part.title}
//                       className="email-part-image"
//                       onError={(e) => {
//                         e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23dc143c" width="150" height="150"/%3E%3C/svg%3E';
//                       }}
//                     />
//                   ) : (
//                     <div className="email-placeholder-image">📦</div>
//                   )}
//                 </div>
//                 <div className="email-part-info">
//                   <h3 className="email-part-title">{part.title}</h3>
//                   <p className="email-part-description">{part.description}</p>
//                   <span className="email-part-link">
//                     https://nexxaauto.com/product
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="email-no-parts-message">
//             <p>No matching parts found for your request.</p>
//           </div>
//         )}

//         {/* Footer Message */}
//         <div className="email-footer-message">
//           <p className="email-footer-text">
//             Please review the details carefully. If everything looks good, you may proceed using the link or reply to this email if you have any questions.
//           </p>
//           <p className="email-footer-text">
//             For final compatibility confirmation, we strongly recommend sharing your <strong>**VIN number**</strong> before placing the order.
//           </p>
//           <p className="email-footer-text">
//             Thank you for choosing <strong>**Nexxa Auto Parts**</strong>. We look forward to assisting you.
//           </p>
//         </div>

//         {/* Signature */}
//         <div className="email-signature">
//           <p className="email-signature-text">Best regards,</p>
//           <p className="email-signature-text">Parts Specialist Team</p>
//           <p className="email-company-name">Nexxa Auto Parts</p>
//           <p className="email-contact-info">📞 +1 888-266-0007</p>
//           <p className="email-contact-info">🌐 nexxaauto.com</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmailPage;