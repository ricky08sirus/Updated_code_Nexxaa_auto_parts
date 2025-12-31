// components/Footer.jsx
import React from "react";
import "./Footer.css";
import logo from "../assets/images/brands/nexxa logo.png"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faWhatsapp,
  faLinkedin
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* 1 Logo & About */}
        <div className="footer-col">
  <img src={logo} alt="Nexxa Auto Parts Logo" className="footer-logo" />
  <p>
    Nexxa Auto Parts provides quality used OEM auto parts at affordable
    prices. Trusted by mechanics and vehicle owners nationwide.
  </p>

  {/* Social Media Icons */}
  <div className="social-icons">
    <a
      href="https://www.facebook.com/profile.php?id=61583498656059"
      target="_blank"
      rel="noopener noreferrer"
      className="facebook"
    >
      <FontAwesomeIcon icon={faFacebook} />
    </a>
    <a
      href="https://www.instagram.com/nexxaauto?igsh=bHh3dHRhdXY2ajE4"
      target="_blank"
      rel="noopener noreferrer"
      className="instagram"
    >
      <FontAwesomeIcon icon={faInstagram} />
    </a>
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp"
    >
      <FontAwesomeIcon icon={faWhatsapp} />
    </a>
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      className="linkedin"
    >
      <FontAwesomeIcon icon={faLinkedin} />
    </a>
  </div>
</div>


        {/* 2️Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms & Services</a></li>
          </ul>
        </div>

        {/* 3️⃣ Contact Us */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>Nexxa Auto Parts<br />550 Congressional Blvd Suite 350<br />Carmel, IN 46032</p>
          <p>Phone: +1 (888) 266-0007</p>
          <p>Email: info@nexxaauto.com</p>
        </div>

        {/* 4️⃣ Newsletter */}
        <div className="footer-col">
          <h4>Newsletter</h4>
          <p>Subscribe for updates on new arrivals, restocks, and exclusive offers from Nexxa Auto Parts.</p>
          <div className="newsletter">
            <input
              type="email"
              placeholder="Enter your email"
            />
            <button>Subscribe</button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Nexxa Auto Parts. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
