import React from "react";
import "./About.css";
import aboutImg1 from "../assets/images/aboutimg1.png";
import aboutImg2 from "../assets/images/boutimg2.png";
import { Helmet } from 'react-helmet';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Leading OEM Used Auto Parts Provider | Nexxa Auto</title>
        <meta 
          name="description" 
          content="Learn about Nexxa Auto Parts - your trusted source for quality OEM used auto parts. Serving customers nationwide with expert support and low mileage parts."
        />
        <link rel="canonical" href="https://nexxaauto.com/about" />
      </Helmet>
    <div className="about-page">

      {/* SECTION 1 - Left: Text, Right: Image */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-text">
            <h1>Welcome to <span>Nexxa</span></h1>
            <p>
              At Nexxa, we are dedicated to delivering high-quality used OEM auto parts and accessories that meet or exceed industry standards. As one of America's leading distributors of automobile components and replacement parts, Nexxa stands for reliability, affordability, and trust.
            </p>
            <p>
              With a strong network of over 6,000 verified suppliers and coverage across 90+ locations in all 50 states, we ensure that our customers always have access to the right parts—no matter where they are in the United States. Our commitment to excellence has made us a trusted partner for mechanics, body shops, and vehicle owners nationwide.
            </p>
          </div>

          <div className="about-image">
            <img src={aboutImg1} alt="Car Engine" />
          </div>
        </div>
      </section>

      {/* SECTION 2 - Full Width Text Only */}
      <section className="about-section about-full">
        <div className="about-container-full">
          <h2>Our Headquarters & Operations</h2>
          <h6>550 Congressional Blvd, Suite 350, Carmel, IN 46032</h6>
          <p>We operate 12 strategically located warehouses across the country, enabling us to ship parts anywhere in the U.S. within 7–10 business days.          </p>
          <p>At Nexxa, we take pride in offering not only the best parts at competitive prices, but also exceptional customer service—because your satisfaction drives our success.</p>
        </div>
      </section>

      {/* SECTION 3 - Left: Image, Right: Text */}
      <section className="about-section">
        <div className="about-container about-reverse">
          <div className="about-image">
            <img src={aboutImg2} alt="Our Services" />
          </div>

          <div className="about-text">
            <h2>What We <span>offers</span></h2>
<p>At Nexxa, we specialize in providing top-quality second-hand OEM auto parts sourced from trusted suppliers across the United States. Every part we deliver undergoes rigorous inspection to ensure performance, durability, and value — giving you reliable replacements without the high cost of new parts.</p>
<ul>
  <li>✔️ Certified pre-owned OEM car parts</li>
  <li>✔️ Nationwide delivery across all 50 states</li>
  <li>✔️ 6,000+ verified suppliers and trusted partners</li>
  <li>✔️ Affordable pricing without compromising quality</li>
  <li>✔️24/7 customer support for machanics and car owners</li>
</ul>
          </div>
        </div>
      </section>

    </div>
    </>
  );
};

export default About;