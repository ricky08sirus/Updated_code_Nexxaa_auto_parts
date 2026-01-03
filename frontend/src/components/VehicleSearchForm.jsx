import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VehicleSearchForm.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function VehicleSearchForm({ brandName = null }) {
  const navigate = useNavigate();

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

  // Set manufacturer if brandName is provided
  useEffect(() => {
    if (brandName && manufacturers.length > 0) {
      const matchedManufacturer = manufacturers.find(
        m => m.name.toLowerCase() === brandName.toLowerCase()
      );
      if (matchedManufacturer) {
        setFormData(prev => ({ ...prev, manufacturer: matchedManufacturer.id.toString() }));
      }
    }
  }, [brandName, manufacturers]);

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

  // Handle manufacturer change exactly like Home.jsx does
  const handleManufacturerChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      manufacturer: value,
      model: '' // Reset model when manufacturer changes
    }));
  };

  const handleSubmit = () => {
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
    const partData = partCategories.find(
      (p) => p.id === parseInt(formData.part)
    );

    // Navigate to product details page with complete data
    navigate("/product-details", {
      state: {
        year: parseInt(formData.year),
        manufacturerId: parseInt(formData.manufacturer),
        manufacturerName: manufacturerData?.name || "",
        modelId: parseInt(formData.model),
        modelName: modelData?.name || "",
        partCategoryId: parseInt(formData.part),
        partCategoryName: partData?.name || "",
      },
    });
  };

  return (
    <div className="vehicle-search-form">
      {/* Header */}
      <div className="search-form-header">
        <p className="search-form-title">
          One smart search. Your perfect fit starts here.
        </p>
      </div>

      {/* Form */}
      <div className="search-form-container">
        {/* Year, Make, Model Row */}
        <div className="search-input-row">
          {/* Year Selector */}
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
            className="search-select"
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
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleManufacturerChange}
            className="search-select"
            disabled={loadingManufacturers || (brandName !== null)}
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
            id="model"
            name="model"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            className="search-select"
            disabled={!formData.manufacturer || loadingModels}
          >
            <option value="">Model</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Parts Selector - Full Width */}
        <div className="search-parts-row">
          <select
            id="part"
            name="part"
            value={formData.part}
            onChange={(e) => setFormData(prev => ({ ...prev, part: e.target.value }))}
            className="search-select"
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

        {/* Search Button */}
        <button
          onClick={handleSubmit}
          className="search-submit-btn"
        >
          Search Now
        </button>
      </div>

      {/* Footer */}
      <div className="search-form-footer">
        <p className="search-footer-text">
          Don't know your vehicle? <span className="search-footer-link">Enter VIN</span>
        </p>
      </div>
    </div>
  );
}