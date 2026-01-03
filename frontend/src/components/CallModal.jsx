import React, { useState } from 'react';
import './CallModal.css';

const CallModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCallModal = () => {
    setIsModalOpen(true);
  };

  const closeCallModal = () => {
    setIsModalOpen(false);
  };

  const openMessage = () => {
    // You can integrate with your messaging system or WhatsApp
    // Example: window.open('https://wa.me/18882660007', '_blank');
    console.log('Opening message...');
    alert('Message feature coming soon!');
  };

  return (
    <>
      {/* Fixed Floating Call Button */}
      <div className="call-btn-fixed" onClick={openCallModal}>
        <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="28" 
  height="28" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="white" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round"
>
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
</svg>
      </div>

      {/* Call Modal Overlay */}
      {isModalOpen && (
        <div className="call-modal-overlay" onClick={closeCallModal}>
          <div className="call-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="call-modal-close" onClick={closeCallModal}>
              &times;
            </button>

            {/* Modal Header */}
            <div className="call-modal-header">
              <h2>Call Us <span className="highlight">Now!</span></h2>
              <p>Contact Part Expert Now</p>
            </div>

            {/* Phone Number Display */}
            <div className="call-modal-phone">
              <a href="tel:+18882660007">
                <span className="phone-icon">📞</span>
                +1 (888) 266-0007
              </a>
            </div>

            {/* Action Buttons */}
            <div className="call-modal-buttons">
              <a href="tel:+18882660007" className="call-modal-btn btn-call">
                <span>📞</span> Call Now
              </a>
              <button 
                className="call-modal-btn btn-message" 
                onClick={() => {
                  openMessage();
                  closeCallModal();
                }}
              >
                <span>💬</span> Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallModal;