import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../assets/images/brands/nexxa logo.png";
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

  const scrollItems = [
    { label: "Used Acura Parts", path: "/acura-parts" },
    { label: "Used BMW Parts", path: "/bmw-parts" },
    { label: "Used Buick Parts", path: "/buick-parts" },
    { label: "Used Cadillac Parts", path: "/cadillac-parts" },
    { label: "Used Chevy Parts", path: "/chevy-parts" },
    { label: "Used Chrysler Parts", path: "/chrysler-parts" },
    { label: "Used Daewoo Parts", path: "/daewoo-parts" },
    { label: "Used Daihatsu Parts", path: "/daihatsu-parts" },
    { label: "Used Dodge Parts", path: "/dodge-parts" },
    { label: "Used Eagle Parts", path: "/eagle-parts" },
    { label: "Used Ford Parts", path: "/ford-parts" },
    { label: "Used GMC Parts", path: "/gmc-parts" },
    { label: "Used Honda Parts", path: "/honda-parts" },
    { label: "Used Hyundai Parts", path: "/hyundai-parts" },
    { label: "Used Infiniti Parts", path: "/infiniti-parts" },
    { label: "Used Isuzu Parts", path: "/isuzu-parts" },
    { label: "Used Jaguar Parts", path: "/jaguar-parts" },
    { label: "Used Kia Parts", path: "/kia-parts" },
    { label: "Used Landrover Parts", path: "/landrover-parts" },
    { label: "Used Lexus Parts", path: "/lexus-parts" },
    { label: "Used Lincoln Parts", path: "/lincoln-parts" },
    { label: "Used Mazda Parts", path: "/mazda-parts" },
    { label: "Used Mercedes Parts", path: "/mercedes-parts" },
    { label: "Used Mercury Parts", path: "/mercury-parts" },
    { label: "Used Mini Cooper Parts", path: "/mini-cooper-parts" },
    { label: "Used Mitsubishi Parts", path: "/mitsubishi-parts" },
    { label: "Used Nissan Parts", path: "/nissan-parts" },
    { label: "Used Oldsmobile Parts", path: "/oldsmobile-parts" },
    { label: "Used Plymouth Parts", path: "/plymouth-parts" },
    { label: "Used Pontiac Parts", path: "/pontiac-parts" },
    { label: "Used Porsche Parts", path: "/porsche-parts" },
    { label: "Used Saab Parts", path: "/saab-parts" },
    { label: "Used Saturn Parts", path: "/saturn-parts" },
    { label: "Used Scion Parts", path: "/scion-parts" },
    { label: "Used Subaru Parts", path: "/subaru-parts" },
    { label: "Used Suzuki Parts", path: "/suzuki-parts" },
    { label: "Used Toyota Parts", path: "/toyota-parts" },
    { label: "Used Volvo Parts", path: "/volvo-parts" },
    { label: "Used Volkswagen Parts", path: "/volkswagen-parts" }
  ];

  return (
    <div className="bg-gray-50">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-black text-white relative z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center h-16 gap-2">

            {/* LOGO */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={logoImage}
                alt="Nexxa Logo"
                className="h-9 w-auto"
              />
            </Link>

            <div className="scroll-container flex-1 mx-2 min-w-0">
  <div className="scrolling-text">
    {scrollItems.map((item, index) => (
      <Link
        to={item.path}
        key={index}
        className="scroll-item"
      >
        {item.label}
      </Link>
    ))}

    {/* duplicate for seamless loop */}
    {scrollItems.map((item, index) => (
      <Link
        to={item.path}
        key={`dup-${index}`}
        className="scroll-item"
      >
        {item.label}
      </Link>
    ))}
  </div>
</div>

            {/* HAMBURGER */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="hover:text-red-600 shrink-0"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

 {/* ================= MOBILE MENU ================= */}
{isMenuOpen && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50">
    <div className="absolute right-0 top-0 h-full w-72 bg-black border-l border-gray-800 p-6">
      <div className="flex justify-end mb-6">
        <button
          onClick={closeMenu}
          className="hover:text-red-600"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex flex-col space-y-2 text-lg">
        <Link to="/" onClick={closeMenu}>
          <FontAwesomeIcon icon={faHome} /> <span>Home</span>
        </Link>
        <Link to="/about" onClick={closeMenu}>
          <FontAwesomeIcon icon={faInfoCircle} /> <span>About Us</span>
        </Link>
        <Link to="/contact-us" onClick={closeMenu}>
          <FontAwesomeIcon icon={faPhone} /> <span>Contact</span>
        </Link>
        <Link to="/privacy-policy" onClick={closeMenu}>
          <FontAwesomeIcon icon={faFileShield} /> <span>Privacy Policy</span>
        </Link>
        <Link to="/warranty" onClick={closeMenu}>
          <FontAwesomeIcon icon={faRotateLeft} /> <span>Warranty & Return</span>
        </Link>
        <Link to="/terms-and-conditions" onClick={closeMenu}>
          <FontAwesomeIcon icon={faFileContract} /> <span>Terms & Conditions</span>
        </Link>
      </nav>
    </div>
  </div>
)}

  
      </nav>
    </div>
  );
}