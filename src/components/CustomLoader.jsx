import React from "react";
import "assests/CSS/CustomLoader.css";

const CustomLoader = () => {
  return (
    <div className="custom-loader">
      <h2 className="animate d-flex flex-column mb-0">
        <div className="mb-0">
          <span className="let1">L</span>
          <span className="let2">O</span>
          <span className="let3">A</span>
          <span className="let4">D</span>
          <span className="let5">I</span>
          <span className="let6">N</span>
          <span className="let7">G</span>
        </div>
      </h2>
    </div>
  );
};

export default CustomLoader;
