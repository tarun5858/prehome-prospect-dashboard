import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

const PropertyCards = ({
  Heading,
  propertyId,
  SubHeading,
  images = [],
  status,
  visitDate,
  description,
  tags = [],
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getStatusBadge = () => {
    if (status === "visited") {
      return <Box className="property-visited">Property Visited</Box>;
    }

    if (status === "scheduled" && visitDate) {
      const formattedDate = new Date(visitDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return (
        <Box className="scheduled-visit">
          Visit Scheduled on {formattedDate}
        </Box>
      );
    }

    if (status === "shortlisted") {
      return <Box className="shortlisted">Shortlisted</Box>;
    }

    return null;
  };

  const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';
  return (
    <Box className="property-card-container">
      {/* Image Section */}
      <Box className="prop-card-img-section">
        {getStatusBadge()}

        {images && images.length > 0 ? (
          <>
            <img
              src={
                images[currentImageIndex].url.startsWith("http")
                  ? images[currentImageIndex].url
                  : `${BASE_URL}${images[currentImageIndex].url}`
                  // : `http://localhost:5000${images[currentImageIndex].url}`
              }
              alt={images[currentImageIndex].label || "Property"}
              className="prop-card-img"
              style={{ objectFit: "cover" }}
            />
            {images.length > 1 && (
              <>
                <Box onClick={prevImage} className="prev-icon">
                  <ChevronLeft color="#222" size={32} />
                </Box>
                <Box onClick={nextImage} className="next-icon">
                  <ChevronRight color="#222" size={32} />
                </Box>
              </>
            )}
          </>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#D9D9D9",
            }}
          >
            <ImageIcon size={64} color="#aaa" />
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <Box className="prop-card-content-sec">
        {/* Title */}
        <h5 className="prop-card-heading">{Heading}</h5>

        {/* Subtitle */}
        <p className="prop-card-subhead">{SubHeading}</p>

        {/* Description */}
        <p className="prop-card-subhead">{description}</p>

        {/* Tags */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
          {tags.map((tag, idx) => (
            <Box key={idx} className="prop-card-cta">
              {tag}
            </Box>
          ))}
        </Box>

        {/* View Property Button */}
        <Link
          to={`/property/${propertyId}`}
                    className="prop-card-cta-parent"

        >
          <button className="view-prop-btn">View Property</button>
        </Link>
      </Box>
    </Box>
  );
};

export default PropertyCards;
