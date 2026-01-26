import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './OrderPage.css';
import logoImage from "../assets/images/brands/logowhite.webp";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug, id } = useParams();
  const productData = location.state?.product;
  const quantity = location.state?.quantity || 1;

  const [formData, setFormData] = useState({
    country: 'United States',
    first_name: '',
    last_name: '',
    street_address: '',
    street_address_2: '',
    city: '',
    state: '',
    zip_code: '',
    email: '',
    country_code: 'US +1',
    phone: ''
  });

  const [orderQuantity, setOrderQuantity] = useState(quantity);
  const [dynamicPrice, setDynamicPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [savedAddressId, setSavedAddressId] = useState(null);

  // API Configuration - Docker + Nginx setup
  // Use the Nginx proxy URL (port 8080)
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'https://nexxaauto.com/api';

  // ============================================
  // HELPER FUNCTION: Normalize Phone Number to E.164 Format
  // ============================================
  const normalizePhoneNumber = (phone) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different US phone formats
    if (cleaned.length === 10) {
      // 10 digits: add +1
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // 11 digits starting with 1: add +
      return `+${cleaned}`;
    } else if (cleaned.length === 11) {
      // 11 digits not starting with 1: add +1
      return `+1${cleaned}`;
    } else if (cleaned.length > 11) {
      // More than 11 digits: take last 10 and add +1
      return `+1${cleaned.slice(-10)}`;
    } else {
      // Less than 10 digits: add +1 anyway (validation will catch it)
      return `+1${cleaned}`;
    }
  };

  // Fetch product data if coming from direct URL
  useEffect(() => {
    const fetchProductData = async () => {
      if (productData) {
        setFetchedProduct(productData);
        return;
      }

      if (slug && id) {
        try {
          const response = await fetch(`${API_BASE}/part-galleries/${id}/`);
          if (response.ok) {
            const data = await response.json();
            
            const transformedProduct = {
              id: data.id,
              title: `${data.year} ${data.manufacturer_name} ${data.model_name} ${data.part_name}`,
              price: data.price || data.part_price || data.selling_price || null,
              shipping: data.shipping_cost || 40,
              condition: data.condition || 'Grade A',
              primaryImage: data.primary_image?.url || data.primary_image?.thumbnail || null,
              slug: data.slug,
            };
            
            setFetchedProduct(transformedProduct);
          } else {
            console.error('Failed to fetch product');
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          navigate('/');
        }
      } else if (!productData) {
        console.log('No product data or URL params, redirecting home');
        navigate('/');
      }
    };

    fetchProductData();
  }, [slug, id, productData, navigate]);

  // Fetch dynamic price from backend
  useEffect(() => {
    const fetchProductPrice = async () => {
      const currentProduct = fetchedProduct || productData;
      if (!currentProduct?.id) {
        setPriceLoading(false);
        return;
      }

      try {
        setPriceLoading(true);
        
        const response = await fetch(`${API_BASE}/part-galleries/${currentProduct.id}/`);
        
        if (response.ok) {
          const data = await response.json();
          const backendPrice = data.price || data.part_price || data.selling_price || null;
          setDynamicPrice(backendPrice ? parseFloat(backendPrice) : null);
        } else {
          setDynamicPrice(currentProduct.price || null);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
        setDynamicPrice(currentProduct.price || null);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchProductPrice();
  }, [fetchedProduct?.id, fetchedProduct?.price, productData?.id, productData?.price]);

  const currentProduct = fetchedProduct || productData;

  if (!currentProduct) {
    return (
      <div className="order-loading">
        <p>Loading order details...</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setOrderQuantity(prev => prev + 1);
    } else if (type === 'decrease' && orderQuantity > 1) {
      setOrderQuantity(prev => prev - 1);
    }
  };

  // ============================================
  // UPDATED: Enhanced Form Validation
  // ============================================
  const validateForm = () => {
    const errors = {};
    const requiredFields = {
      first_name: 'First name',
      last_name: 'Last name',
      street_address: 'Street address',
      city: 'City',
      state: 'State',
      zip_code: 'ZIP code',
      email: 'Email',
      phone: 'Phone number'
    };

    // Check required fields
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${requiredFields[field]} is required`;
      }
    });

    // Validate email format
    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }

    // Enhanced phone validation
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      } else if (cleanPhone.length > 11) {
        errors.phone = 'Phone number should not exceed 11 digits';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================
  // FIXED: Enhanced handleDone with Better Error Handling
  // ============================================
  const handleDone = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize phone number to E.164 format
      const normalizedPhone = normalizePhoneNumber(formData.phone);

      // Prepare payload with trimmed values
      const payload = {
        country: formData.country.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        street_address: formData.street_address.trim(),
        street_address_2: formData.street_address_2?.trim() || '',
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zip_code.trim(),
        email: formData.email.trim().toLowerCase(),
        country_code: formData.country_code,
        phone: normalizedPhone,
      };

      console.log('📤 Sending payload:', payload);
      console.log('🌐 API URL:', `${API_BASE}/shipping-addresses/`);

      const response = await fetch(`${API_BASE}/shipping-addresses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response OK:', response.ok);
      console.log('📊 Response headers:', response.headers);

      // ✅ HANDLE 404 ERROR
      if (response.status === 404) {
        console.error('❌ 404 Error: API endpoint not found');
        alert(
          '❌ API Endpoint Not Found (404)\n\n' +
          'The shipping address endpoint does not exist on the server.\n\n' +
          'Please verify:\n' +
          '1. Backend URL pattern is correctly configured in urls.py\n' +
          '2. The endpoint path matches: /api/shipping-addresses/\n' +
          '3. Django server is running\n\n' +
          `Current URL: ${API_BASE}/shipping-addresses/`
        );
        return;
      }

      // ✅ CHECK CONTENT TYPE BEFORE PARSING
      const contentType = response.headers.get('content-type');
      console.log('📊 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Server returned non-JSON response');
        console.error('Content-Type:', contentType);
        
        // Get response text for debugging
        const responseText = await response.text();
        console.error('Response body (first 500 chars):', responseText.substring(0, 500));
        
        alert(
          '❌ Server Configuration Error\n\n' +
          'Expected JSON response but received HTML/text.\n\n' +
          'This usually means:\n' +
          '1. The API endpoint does not exist (404 page returned)\n' +
          '2. Django URL pattern is misconfigured\n' +
          '3. CORS is blocking the request\n' +
          '4. Server error occurred\n\n' +
          'Check the browser console for details.'
        );
        return;
      }

      // ✅ SAFE TO PARSE JSON NOW
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok && data.success) {
        setSavedAddressId(data.data.id);
        alert('✅ Shipping address saved successfully!');
        console.log('✅ Saved address ID:', data.data.id);
        console.log('✅ Full address data:', data.data);
      } else {
        // Handle validation errors from backend
        if (data.errors) {
          // Map backend errors to form errors
          const backendErrors = {};
          Object.keys(data.errors).forEach(key => {
            // Handle both array and string error formats
            const errorMsg = Array.isArray(data.errors[key]) 
              ? data.errors[key][0] 
              : data.errors[key];
            backendErrors[key] = errorMsg;
          });
          
          setFormErrors(backendErrors);
          
          // Show the first error message to user
          const firstErrorField = Object.keys(backendErrors)[0];
          const firstErrorMsg = backendErrors[firstErrorField];
          alert(`❌ Validation Error: ${firstErrorMsg}`);
          
          console.error('❌ Backend validation errors:', backendErrors);
        } else {
          alert(data.message || '❌ Failed to save shipping address. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // More specific error messages
      if (error.message.includes('Failed to fetch')) {
        alert(
          '❌ Network Connection Error\n\n' +
          'Cannot connect to the backend server.\n\n' +
          'Please check:\n' +
          '1. Backend server is running on https://nexxaauto.com\n' +
          '2. Network connection is stable\n' +
          '3. CORS headers are configured correctly\n' +
          '4. Firewall/antivirus is not blocking the request\n\n' +
          `API URL: ${API_BASE}/shipping-addresses/`
        );
      } else if (error.name === 'SyntaxError') {
        alert(
          '❌ Invalid JSON Response\n\n' +
          'The server returned an invalid JSON response.\n\n' +
          'This usually means:\n' +
          '1. The endpoint returned HTML instead of JSON (404 error)\n' +
          '2. Server error occurred\n' +
          '3. Response is malformed\n\n' +
          'Check the browser console for the actual response.'
        );
      } else {
        alert(
          '❌ Unexpected Error\n\n' +
          `Error: ${error.message}\n\n` +
          'Please contact support or check the console for details.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPay = () => {
    if (!dynamicPrice && !priceLoading) {
      alert('Price is pending. Please wait for price confirmation before proceeding.');
      return;
    }

    if (!savedAddressId) {
      alert('Please save your shipping address first by clicking the "Done" button');
      return;
    }
    
    // Proceed to payment with saved address ID
    console.log('Proceeding to payment with address ID:', savedAddressId);
    alert(`Proceeding to payment gateway with address ID: ${savedAddressId}`);
    // Here you would navigate to payment page or integrate payment gateway
  };

  const partPrice = dynamicPrice ? parseFloat(dynamicPrice) : 0;
  const shipping = currentProduct.shipping || 40;
  const totalPrice = dynamicPrice ? (partPrice * orderQuantity) + shipping : null;

  return (
    <div className="order-page">
      <header className="order-header">
        <Link to="/" className="order-logo-link">
          <img src={logoImage} alt="Nexxa Logo" className="order-logo-img" />
        </Link>
        <button className="order-heart-btn">
          <Heart size={28} stroke="#c41e3a" fill="none" />
        </button>
      </header>

      <div className="order-container">
        <div className="order-main-content">
          <div className="review-order-section">
            <h1 className="section-title">Review Order</h1>
            
            <div className="seller-info">
              <div className="seller-details">
                <div className="seller-name">NEXXA AUTO PARTS</div>
                <div className="seller-feedback">100% positive feedback</div>
              </div>
            </div>

            <div className="order-product-card">
              <div className="product-image-wrapper">
                {currentProduct.primaryImage ? (
                  <img 
                    src={currentProduct.primaryImage}  
                    alt={currentProduct.title}
                    className="order-product-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="order-product-placeholder">📦</div>
                )}
              </div>

              <div className="product-detail">
                <h3 className="product-title">{currentProduct.title}</h3>
                
                {priceLoading ? (
                  <div className="product-price-loading">
                    <span className="loading-spinner">⏳</span> Loading price...
                  </div>
                ) : dynamicPrice ? (
                  <div className="product-price">US ${partPrice.toFixed(2)}</div>
                ) : (
                  <div className="product-price-pending">
                    <span style={{ color: '#ff9800' }}>⚠️</span> Price Pending
                  </div>
                )}

                <div className="quantity-selector">
                  <input 
                    type="number" 
                    value={orderQuantity} 
                    readOnly 
                    className="qty-input"
                  />
                </div>

                <div className="returns-text">Returns accepted</div>
              </div>
            </div>
          </div>

          <div className="ship-to-section">
            <h2 className="section-title">Ship to</h2>
            
            <div className="form-group">
              <select 
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="form-select full-width"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
              </select>
              <label className="form-label" style={{color:"white"}}>Country or region</label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.first_name ? 'error' : ''}`}
                  placeholder="First name"
                />
                {formErrors.first_name && (
                  <span className="error-message">{formErrors.first_name}</span>
                )}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.last_name ? 'error' : ''}`}
                  placeholder="Last name"
                />
                {formErrors.last_name && (
                  <span className="error-message">{formErrors.last_name}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <input
                type="text"
                name="street_address"
                value={formData.street_address}
                onChange={handleInputChange}
                className={`form-input full-width ${formErrors.street_address ? 'error' : ''}`}
                placeholder="Street address"
              />
              {formErrors.street_address && (
                <span className="error-message">{formErrors.street_address}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="street_address_2"
                value={formData.street_address_2}
                onChange={handleInputChange}
                className="form-input full-width"
                placeholder="Street address 2 (optional)"
              />
            </div>

            <div className="form-row-three">
              <div className="form-group">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.city ? 'error' : ''}`}
                  placeholder="City"
                />
                {formErrors.city && (
                  <span className="error-message">{formErrors.city}</span>
                )}
              </div>
              <div className="form-group">
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`form-select ${formErrors.state ? 'error' : ''}`}
                >
                  <option value="">State/Province/Region</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
                {formErrors.state && (
                  <span className="error-message">{formErrors.state}</span>
                )}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.zip_code ? 'error' : ''}`}
                  placeholder="ZIP code"
                />
                {formErrors.zip_code && (
                  <span className="error-message">{formErrors.zip_code}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input full-width ${formErrors.email ? 'error' : ''}`}
                placeholder="Email"
              />
              {formErrors.email && (
                <span className="error-message">{formErrors.email}</span>
              )}
            </div>

            <div className="form-row-phone">
              <div className="form-group" style={{width: '150px'}}>
                <select
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="US +1">US +1</option>
                  <option value="CA +1">CA +1</option>
                  <option value="UK +44">UK +44</option>
                  <option value="MX +52">MX +52</option>
                </select>
                <label className="form-label-small" style={{ color: "white" }}>Country code</label>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input full-width ${formErrors.phone ? 'error' : ''}`}
                  placeholder="Phone number (10 digits)"
                />
                {formErrors.phone && (
                  <span className="error-message">{formErrors.phone}</span>
                )}
                <div className="form-hint">We only use this number if there's a shipping issue.</div>
              </div>
            </div>

            <button 
              onClick={handleDone} 
              className="done-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : savedAddressId ? 'Update Address' : 'Done'}
            </button>
            
            {savedAddressId && (
              <div style={{ marginTop: '10px', color: '#4caf50', fontSize: '14px' }}>
                ✓ Shipping address saved successfully!
              </div>
            )}
          </div>
        </div>

        <div className="order-summary-sidebar">
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="summary-row">
            <span className="summary-label">Part Price</span>
            {priceLoading ? (
              <span className="summary-value">Loading...</span>
            ) : dynamicPrice ? (
              <span className="summary-value">${(partPrice * orderQuantity).toFixed(2)}</span>
            ) : (
              <span className="summary-value" style={{ color: '#ff9800' }}>Pending</span>
            )}
          </div>

          <div className="summary-row">
            <span className="summary-label">Shipping</span>
            <span className="summary-value">${shipping}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row summary-total">
            <span className="summary-label">Order Total</span>
            {priceLoading ? (
              <span className="summary-value">Calculating...</span>
            ) : totalPrice ? (
              <span className="summary-value">${totalPrice.toFixed(2)}</span>
            ) : (
              <span className="summary-value" style={{ color: '#ff9800' }}>Pending</span>
            )}
          </div>

          <button 
            onClick={handleConfirmPay} 
            className="confirm-pay-btn"
            disabled={!dynamicPrice || priceLoading || !savedAddressId}
            style={{
              opacity: (!dynamicPrice || priceLoading || !savedAddressId) ? 0.6 : 1,
              cursor: (!dynamicPrice || priceLoading || !savedAddressId) ? 'not-allowed' : 'pointer'
            }}
          >
            {/* {priceLoading ? 'Loading Price...' : !dynamicPrice ? 'Price Pending' : !savedAddressId ? 'Save Address First' : 'Confirm and Pay'} */}
          </button>

          <div className="shipping-address-prompt">
            {!dynamicPrice && !priceLoading ? 
              'Waiting for price confirmation...' : 
              !savedAddressId ? 
              'Save shipping address to continue' :
              'Ready to proceed to payment'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;