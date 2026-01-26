import React from "react";
import "./Privacypolicy.css";
import { Helmet } from 'react-helmet';


const PrivacyPolicy = () => {
  return (
    <>
    <Helmet>
  <title>Privacy Policy - How We Protect Your Data | Nexxa Auto Parts</title>
  <meta 
    name="description" 
    content="Read Nexxa Auto Parts privacy policy to understand how we collect, use, and protect your personal information when you shop for auto parts."
  />
  <link rel="canonical" href="https://nexxaauto.com/privacy-policy" />
</Helmet>
    <div className="privacy-container">
      <div className="privacy-content">
        <h1 className="privacy-title">Privacy Policy</h1>

        <section className="privacy-section">
          <h2>1. Customer Consent to Contact</h2>
          <p>
            By submitting your information through our website, phone call, or
            any online form, you expressly consent to be contacted by Nexxa Auto
            Parts and its authorized representatives via:
          </p>
          <ul>
            <li>Telephone calls (including recorded or monitored calls)</li>
            <li>Text messages (SMS/MMS)</li>
            <li>
              Mobile Opt in, SMS Consent, and phone numbers collected for SMS
              communication purposes will not be shared with any third party or
              affiliates for marketing purposes.
            </li>
            <li>
              Emails or other electronic means
            </li>
          </ul>
          <p>
            This consent applies even if your phone number is on any Do Not Call
            registry, and is provided so we may:
          </p>
          <ul>
            <li>
              Respond to your inquiry about a vehicle part or accessory
            </li>
            <li>
              Confirm part availability and pricing
            </li>
            <li>
              Provide shipping or order updates
            </li>
            <li>
              Offer related auto part products or services
            </li>
          </ul>
          <p>
            You may withdraw your consent at any time by replying “STOP” to text
            messages, clicking “Unsubscribe” in emails, or contacting us at
            Email: info@nexxaauto.com or Phone: +1 (888) 266-0007. We respect
            your communication preferences and will promptly process any opt-out
            requests.
          </p>
        </section>

        <section className="privacy-section">
          <h2>
            2. Information We Collect
          </h2>
          <p>
            When you use our website or lead forms, Nexxa Auto Parts may collect
            the following information:
          </p>
          <ul>
            <li>
              Full name
            </li>
            <li>
              Email address
            </li>
            <li>
              Phone number
            </li>
            <li>
              ZIP code
            </li>
            <li>
              Vehicle details (Year, Make, Model, Part type)
            </li>
            <li>
              Any additional comments you provide
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>
            3. How We Use Your Information
          </h2>
          <p>
            Your information is used solely for legitimate business purposes,
            including locating the correct auto part for your vehicle, providing
            price quotes, processing orders, and customer support. We do not
            sell or rent your personal data to third parties.
          </p>
        </section>

        <section className="privacy-section">
          <h2>
            4. Sharing & Disclosure
          </h2>
          <p>
            We may share limited data only with trusted suppliers and service
            providers for communication, shipping, and order fulfillment. We do
            not share, sell, or rent phone numbers or SMS consent information
            with third parties or affiliates for marketing or promotional
            purposes All partners are required to maintain confidentiality and
            security standards consistent with this policy.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. Data Security</h2>
          <p>
            We use industry-standard security measures, including encryption,
            secure servers, and access controls. While we strive to ensure full
            protection, no method of online transmission is 100% secure.
          </p>
        </section>
        <section className="privacy-section">
          <h2>
            6. Data Retention
          </h2>
          <p>
            We retain customer data only as long as necessary to fulfill your
            order or provide after-sales support, unless required by law. You
            may request deletion or correction of your data anytime by emailing
            Email: privacy@nexxaauto.com.
          </p>
        </section>
        <section className="privacy-section">
          <h2>
            7. Your Rights
          </h2>
          <p>
            Under U.S. privacy laws, you have the right to access, correct, or
            delete your personal information, withdraw marketing consent, and
            request a copy of your data. To exercise these rights, contact us at
            Email: info@nexxaauto.com.
          </p>
        </section>
        <section className="privacy-section">
          <h2>8. Cookies & Tracking</h2>
          <p>
            Our website may use cookies and analytics tools like Google
            Analytics or Microsoft Clarity to improve performance. You can
            disable cookies in your browser, though some features may not
            function properly.
          </p>
        </section>
        <section className="privacy-section">
          <h2>9. Policy Updates</h2>
          <p>
            Nexxa Auto Parts may update this policy periodically. Any updates
            will be posted here with a revised “Effective Date.” Continued use
            of our site implies acceptance of the updated policy.
          </p>
        </section>
        <section className="privacy-section">
          <h2>10. Contact Us</h2>
          <p>
            Nexxa Auto Parts 550 Congressional Blvd, Suite 350 Carmel, IN 46032
          </p>
          <p>Phone: +1 (888) 266-0007 Email: info@nexxaauto.com</p>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us using the above details.
          </p>
          <p>
            🔗 You can also view our full Terms and Conditions here:
            https://nexxaauto.com/terms-and-condition
          </p>
        </section>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;
