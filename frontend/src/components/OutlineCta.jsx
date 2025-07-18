import "../assets/style.css";
// import { useState } from "react";

const OutlineCta = ({ text, isClicked, onClick, ...props }) => {
  return (
    <button
      type="button"
      className={`outline-cta ${isClicked ? 'clicked' : ''}`}
      onClick={onClick}
      {...props}
    >
      {text}
    </button>
  );
};

export default OutlineCta;
