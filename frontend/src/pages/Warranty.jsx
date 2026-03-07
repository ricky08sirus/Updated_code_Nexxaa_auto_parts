import React from "react";
import "./Warranty.css";

const Warranty = () => {
  return (
    <section className="warranty-page">
      <div className="warranty-wrapper">
        <h1>Warranty & Return Policy</h1>

        <div className="warranty-section">
          <h2>1. Warranty Policy</h2>
          <p>
            At Nexxa, we stand behind the quality of our products. This warranty
            covers defective components and incorrectly shipped items. Our
            warranty is strictly parts-only — labor costs are not covered under
            any circumstance.
          </p>
        </div>

        <div className="warranty-section">
          <h2>2. Replacement and Refund Policy</h2>
          <p>
            If a part is found to be defective, we will first attempt to provide
            a replacement. If a replacement is not available, we will issue a
            full refund for the purchase price. If you reorder a replacement
            part before returning the original, the new order will be charged in
            full, and the previous purchase will be refunded upon return of the
            defective part. Return shipping costs are the responsibility of the
            customer and will not be reimbursed. When contacting Nexxa regarding
            a return, please include a detailed explanation of the reason for
            return.
          </p>
        </div>

        <div className="warranty-section">
          <h2>3. Return Policy</h2>
          <p>
            Parts must be returned within 90 days from the original delivery
            date to qualify for a refund or replacement. Returned parts that do
            not meet warranty criteria may be subject to a 25% restocking fee,
            and shipping costs may be deducted from the refund. Items ordered
            for testing purposes or incorrectly ordered by the customer are not
            eligible for return. Please confirm compatibility with your mechanic
            or body shop before purchasing. Items returned after the 90-day
            warranty period will be sent back to the sender without
            reimbursement.
          </p>
        </div>

        <div className="warranty-section">
          <h2>4. Delivery Responsibility</h2>
          <p>
            Nexxa Auto Parts is not responsible for orders shipped to the
            address provided at checkout but not claimed or received by the
            customer.
          </p>
        </div>

        <div className="warranty-section">
          <h2>5. Warranty Exclusions</h2>
          <p>
            Certain parts or conditions will void the warranty or are not
            covered under our standard 90-day guarantee.
          </p>
        </div>

        <div className="warranty-section">
          <h2>6. Engines</h2>
          <p>
            Engines are sold as complete assemblies, which may include manifolds,
            oil pans, timing belts, covers, and fuel systems. However, the
            warranty covers only the long block (engine block, cylinder head,
            and internal components). The following items are not covered unless
            purchased separately: Turbos, Starters, Air compressors,
            Alternators, Power steering pumps, Electrical water pumps, Optical
            distributors. High-wear components such as water pumps, distributor
            caps, spark plugs, wires, gaskets, seals, and timing chains may
            need to be replaced before installation and are not covered under
            warranty.
          </p>
        </div>

        <div className="warranty-section">
          <h2>7. Transmissions</h2>
          <p>
            All transmissions are guaranteed to shift properly and have good
            gears and bearings. Before installation, the following steps must be
            taken to maintain warranty coverage: Thoroughly clean the
            transmission and oil pan. Replace all seals and gaskets. Change oil
            and filter in automatic transmissions. Flush and test the cooler and
            lines for proper flow. Fully seat the torque converter in the front
            pump. For manual transmissions: replace the clutch, pressure plate,
            and slave cylinder, and resurface the flywheel. Fill with proper
            fluid and check levels carefully.
          </p>
        </div>

        <div className="warranty-section">
          <h2>8. Turbos</h2>
          <p>
            Turbo seals are not guaranteed to be perfect. These seals may require
            replacement during the warranty period.
          </p>
        </div>

        <div className="warranty-section">
          <h2>9. Contact Us</h2>
          <p>
            Nexxa Auto Parts <br />
            550 Congressional Blvd, Suite 350 <br />
            Carmel, IN 46032 <br />
            Phone: +1 (888) 266-0007 <br />
            Email: info@nexxaauto.com
          </p>
        </div>
      </div>
    </section>
  );
};

export default Warranty;
