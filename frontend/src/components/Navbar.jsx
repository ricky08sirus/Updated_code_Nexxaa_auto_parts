import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import logoImage from "../assets/images/brands/Nexxa Logo (2).png";
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

  // ✅ STATIC BRAND DATA (NO BACKEND)
  const brands = [
    { id: 1, title: "Acura" },
    { id: 2, title: "BMW" },
    { id: 3, title: "Buick" },
    { id: 4, title: "Cadillac" },
    { id: 5, title: "Chevy" },
    { id: 6, title: "Chrysler" },
    { id: 7, title: "Daewoo" },
    { id: 8, title: "Daihatsu" },
    { id: 9, title: "Dodge" },
    { id: 10, title: "Eagle" },
    { id: 11, title: "Ford" },
    { id: 12, title: "GMC" },
    { id: 13, title: "Honda" },
    { id: 14, title: "Hyundai" },
    { id: 15, title: "Infiniti" },
    { id: 16, title: "Isuzu" },
    { id: 17, title: "Jaguar" },
    { id: 18, title: "Jeep" },
    { id: 19, title: "Kia" },
    { id: 20, title: "Land Rover" },
    { id: 21, title: "Lexus" },
    { id: 22, title: "Lincoln" },
    { id: 23, title: "Mazda" },
    { id: 24, title: "Mercedes" },
    { id: 25, title: "Mercury" },
    { id: 26, title: "Mini Cooper" },
    { id: 27, title: "Mitsubishi" },
    { id: 28, title: "Nissan" },
    { id: 29, title: "Oldsmobile" },
    { id: 30, title: "Playmouth" },
    { id: 31, title: "Pontiac" },
    { id: 32, title: "Porshe" },
    { id: 33, title: "Saab" },
    { id: 34, title: "Saturn" },
    { id: 35, title: "Scion" },
    { id: 36, title: "Subaru" },
    { id: 37, title: "Suzuki" },
    { id: 38, title: "Toyota" },
    { id: 39, title: "Volkswagen" },
    { id: 40, title: "Volvo" },
  ];

  return (
    <div className="bg-gray-50">
      <nav className="bg-black text-white relative z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center h-16 mx-auto w-[95%] gap-[29px]">

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
                    to={`/brand/${brand.id}`}
                    className="scroll-item"
                  >
                    Used {brand.title} Parts
                  </Link>
                ))}

                {/* DUPLICATE FOR SMOOTH SCROLL */}
                {brands.map((brand) => (
                  <Link
                    key={`dup-${brand.id}`}
                    to={`/brand/${brand.id}`}
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