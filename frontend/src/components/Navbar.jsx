import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import brandData from "../assets/brandData"; // Import brandData

import logoImage from "../assets/images/brands/logo-white.png";
import "./Navbar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faInfoCircle,
  faPhone,
  faFileShield,
  faFileContract,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  // ✅ GET BRANDS FROM brandData.js
  const brands = Object.values(brandData);

  return (
    <div className="bg-gray-50">
      <nav className="bg-black text-white relative z-50">
        <div className="max-w-full mx-auto px-4">
          <div
            className="flex items-center"
            style={{
              display: "flex",
              alignItems: "center",
              height: "4rem",
              width: "95%",
              gap: "29px",
              margin: "0 auto",
            }}
          >
            {/* LOGO */}
            <Link to="/" className="flex items-center shrink-0">
              <img src={logoImage} alt="Nexxa Logo" className="h-9 w-auto" />
            </Link>

            {/* SCROLLING BRANDS */}
            <div className="scroll-container flex-1 mx-2 min-w-0">
              <div className="scrolling-text">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/used/${brand.slug}/parts`}
                    className="scroll-item"
                  >
                    Used {brand.title} Parts
                  </Link>
                ))}

                {/* DUPLICATE FOR SMOOTH SCROLL */}
                {brands.map((brand) => (
                  <Link
                    key={`dup-${brand.id}`}
                    to={`/used/${brand.slug}/parts`}
                    className="scroll-item"
                  >
                    Used {brand.title} Parts
                  </Link>
                ))}
              </div>
            </div>

            {/* HAMBURGER */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="hover:text-red-600 shrink-0"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50">
            <div className="absolute right-0 top-0 h-full w-72 bg-black border-l border-gray-800 p-6">
              <div className="flex justify-end mb-6">
                <button onClick={closeMenu} className="hover:text-red-600">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col space-y-3 text-lg">
                <Link to="/" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faHome} /> Home
                </Link>
                <Link to="/about" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faInfoCircle} /> About Us
                </Link>
                <Link to="/contact" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faPhone} /> Contact
                </Link>
                <Link to="/privacy-policy" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faFileShield} /> Privacy Policy
                </Link>
                <Link to="/warranty" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faRotateLeft} /> Warranty & Return
                </Link>
                <Link to="/terms-and-condition" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faFileContract} /> Terms & Conditions
                </Link>
              </nav>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}