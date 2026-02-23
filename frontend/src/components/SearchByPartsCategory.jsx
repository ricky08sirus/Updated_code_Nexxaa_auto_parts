// src/components/SearchByPartsCategory.jsx
// Popup uses position:fixed + close delay so it stays open when moving mouse to it

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { partCategoryBoxes } from "../assets/partsCategoryData";
import "./SearchByPartsCategory.css";

const SearchByPartsCategory = () => {
  const navigate = useNavigate();
  const [popup, setPopup] = useState(null);
  const boxRefs = useRef([]);
  const closeTimer = useRef(null); // delay timer so popup doesn't vanish instantly

  const openPopup = (idx) => {
    // Cancel any pending close
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    const el = boxRefs.current[idx];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const isRightCol = idx % 2 !== 0;

    // Clamp top so popup never bleeds off viewport
    const popupMaxHeight = window.innerHeight * 0.6;
    const idealTop = rect.top + rect.height / 2;
    const minTop = popupMaxHeight / 2 + 8;
    const maxTop = window.innerHeight - popupMaxHeight / 2 - 8;
    const clampedTop = Math.min(Math.max(idealTop, minTop), maxTop);

    setPopup({
      idx,
      top: clampedTop,
      left: isRightCol ? rect.left - 12 : rect.right + 12,
      side: isRightCol ? "left" : "right",
    });
  };

  const scheduleClose = () => {
    // Give user 120ms to move mouse from box → popup without it closing
    closeTimer.current = setTimeout(() => {
      setPopup(null);
    }, 120);
  };

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const activeBox = popup !== null ? partCategoryBoxes[popup.idx] : null;

  return (
    <section className="parts-category-section">
      <h2 className="parts-category-title">Search By Parts Category</h2>

      <div className="parts-category-grid">
        {partCategoryBoxes.map((box, idx) => (
          <div
            className="category-box"
            key={idx}
            ref={(el) => (boxRefs.current[idx] = el)}
            onMouseEnter={() => openPopup(idx)}
            onMouseLeave={scheduleClose}
          >
            <h2 className="category-box-title">{box.label}</h2>
            <span className="category-arrow">»</span>
          </div>
        ))}
      </div>

      {/* Popup rendered outside grid — fixed position, always on top */}
      {popup && activeBox?.subItems?.length > 0 && (
        <div
          className={`category-popup popup-${popup.side}`}
          style={{
            position: "fixed",
            top: popup.top,
            ...(popup.side === "right"
              ? { left: popup.left }
              : { left: popup.left - 260 }),
            transform: "translateY(-50%)",
            zIndex: 99999,
          }}
          onMouseEnter={cancelClose}   // moving onto popup cancels the close timer
          onMouseLeave={scheduleClose} // leaving popup starts close timer
        >
          {activeBox.subItems.map((item, i) => (
            <div
              className="popup-item"
              key={i}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchByPartsCategory;