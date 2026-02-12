import {
  Box,
  Typography,
  Container,
  useMediaQuery,
  Slider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OutlineCta from "../components/OutlineCta";
import LeftArrow from "../assets/Component 13.png";
import ShortlistCTA from "../components/ShortListCta";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import MapComponent from "../components/MapComponent";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [property, setProperty] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [radius, setRadius] = useState(2000);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("user_id"));
  const [selectedView, setSelectedView] = useState(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [visitDate, setVisitDate] = useState(null);
  const [propertyVisited, setPropertyVisited] = useState(false);
  const [status, setStatus] = useState("");
  const [clickedIndex, setClickedIndex] = useState(null);

  useEffect(() => {
    const checkUserChange = () => {
      const currentUserId = localStorage.getItem("user_id");
      if (currentUserId !== userId) {
        setUserId(currentUserId);
      }
    };
    const interval = setInterval(checkUserChange, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!id) {
      navigate("/available-property");
      return;
    }
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (property?.generalInfo?.propertyType) {
      fetchNearbyPlaces(property.location, property.generalInfo.propertyType);
    }
  }, [property, radius]);

  useEffect(() => {
    if (property?.features?.views?.length > 0) {
      const defaultView =
        property.features.views.find((v) => v.selected)?.label ||
        property.features.views[0].label;
      setSelectedView(defaultView);
    }
  }, [property]);

 const fetchProperty = async () => {
  try {
    const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';

    const res = await axios.get(
      `${BASE_URL}/api/properties/${id}`
      // `http://localhost:5000/api/properties/${id}`
    );

    const propertyData = res.data;

    // Convert all image URLs to absolute URLs if they are relative
    const fixedImages = propertyData.images.map((img) => ({
      ...img,
      url: img.url.startsWith("http")
        ? img.url
        : `${BASE_URL}${img.url}`,
    }));

    propertyData.images = fixedImages;

    setProperty(propertyData);
    setSelectedImageUrl(fixedImages[0]?.url);
  } catch (err) {
    console.error("Error fetching property:", err);
  }
};


  // Updated fetchNearbyPlaces to loop through multiple types
 const VALID_TYPES = [
  "hospital",
  "school",
  "restaurant",
  "shopping_mall",
  "atm",
  "bank",
  "gym",
  "park",
  "doctor",
  "pharmacy",
  "university",
  "library",
  "police",
  "fire_station",
  "grocery_or_supermarket",
];

const fetchNearbyPlaces = async (location, propertyTypes) => {
  try {
    const types = Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes];

    // ✅ filter invalid types
    const filteredTypes = types.filter(type => VALID_TYPES.includes(type));

    if (filteredTypes.length === 0) return; // nothing valid to search

    const results = await Promise.all(
      filteredTypes.map(async (type) => {
        const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';
        const res = await axios.post(
          
          `${BASE_URL}/api/properties/nearby-places`,
          // "http://localhost:5000/api/properties/nearby-places",
          { location, type, radius }
        );
        return res.data;
      })
    );

    const merged = results.flat();
    setNearbyPlaces(merged);
  } catch (error) {
    console.error("Error fetching nearby places:", error);
  }
};



  const handleRadiusChange = (event, newValue) => {
    setRadius(newValue);
  };

 const handleImageLabelClick = (url, index) => {
  const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';
  
  const fullUrl = url.startsWith("http")
    ? url
    : `${BASE_URL}${url}`;
  setSelectedImageUrl(fullUrl);
  setClickedIndex(index);
};


  if (!property) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" mt={5}>
          Loading property details...
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: { xs: "#fff", sm: "#fff", md: "#fff", lg: "#ECECEC" }, minHeight: "100vh", p: 0 }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: { xs: 0, md: 2 },
            mb: { xs: 0, md: 2 },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <img
                src={LeftArrow}
                alt="Back"
                style={{ cursor: "pointer", marginRight: 12 }}
                onClick={() => navigate("/available-property")}
              />
              <Typography fontWeight={600} sx={{ fontSize: { xs: 16, md: 24 } }}>
                Property Details
              </Typography>
            </Box>

            <Box className="cta-container">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                  mb: 2,
                  width: "100%",
                }}
              >
                <Typography
                  fontWeight={600}
                  sx={{ mr: 2, flexShrink: 0, fontSize: { xs: 16, md: 24 } }}
                >
                  {property.title}
                </Typography>

                {status === "Visited" && (
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <Box className="prop-details-prop-visited">Property Visited</Box>
                    {visitDate && (
                      <Box className="prop-details-prop-visit-date">
                        Property Visit on{" "}
                        {new Date(visitDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {(property.features?.views || []).map((view, idx) => {
                const isSelected = view.label === selectedView;
                return (
                  <Box
                    key={idx}
                    onClick={() => setSelectedView(view.label)}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: "30px",
                      border: isSelected ? "none" : "2px solid #222",
                      backgroundColor: isSelected ? "#D4EDF4" : "transparent",
                      color: isSelected ? "#fff" : "#222",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: isSelected ? "#D4EDF4" : "#f0f0f0",
                      },
                    }}
                  >
                    {view.label}
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: { xs: "flex-start", md: "flex-end" },
              gap: 2,
              mb: 2,
            }}
          >
            {status !== "Visited" && (
              <>
                {(isShortlisted || visitDate) && (
                  <Box
                    sx={{
                      display: "none",
                      flexDirection: "row",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: isMobile ? "flex-start" : "flex-end",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {isShortlisted && (
                      <Box className="prop-details-shortlist-cta">Shortlisted</Box>
                    )}
                  

                    {/* {visitDate && (
                      <Box
                        sx={{
                          background: "#D4EDF4",
                          color: "#3E3E3E",
                          fontWeight: 600,
                          px: 3,
                          py: 1.2,
                          borderRadius: "20px",
                          fontSize: 16,
                          textAlign: "center",
                          minWidth: 200,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                          // display: "none",
                        }}
                      >
                        Property Visit on{" "}
                        {new Date(visitDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Box>
                    )} */}
                  </Box>
                )}

                <ShortlistCTA
                  propertyId={property._id}
                  userId={userId}
                  onUpdate={(updated) => {
                    // setPropertyVisited(updated.propertyVisited || false)
                    setIsShortlisted(updated.shortlisted || false);
                    setVisitDate(updated.visitDate ? new Date(updated.visitDate) : null);
                    setStatus(updated.status || "");
                  }}
                />
              </>
            )}
          </Box>
        </Box>

        <Box className="cta-container" sx={{ mb: 2 }}>
          {property.images?.map((image, index) => (
            <OutlineCta
              key={index}
              text={image.label}
              isClicked={clickedIndex === index}
              onClick={() => handleImageLabelClick(image.url, index)}
            />
          ))}
        </Box>

        {selectedImageUrl && (
          <Box sx={{ mt: 2 }}>
            <img
              src={selectedImageUrl}
              alt="Selected"
              style={{
                width: "100%",
                height: "517px",
                objectFit: "cover",
                borderRadius: "16px",
              }}
            />
          </Box>
        )}
      </Container>

      <Box className="text-card-container">
        <Box className="text-card">
          <p className="Heading-text-card">Property Features</p>
          <p className="sub-Heading-1">Interior Features</p>
          <p className="sub-Heading">{property.features.interior.join(", ")}</p>
          <p className="sub-Heading-1">Exterior Features</p>
          <p className="sub-Heading">{property.features.exterior.join(", ")}</p>
          <p className="sub-Heading-1">Basement</p>
          <p className="sub-Heading">{property.features.basement}</p>
        </Box>

        <Box className="text-card">
          <p className="Heading-text-card">General Property Information</p>
          <p className="sub-Heading-1">Address</p>
          <p className="sub-Heading">{property.generalInfo.propertyAddress}</p>
          <p className="sub-Heading-1">Property Type</p>
          <p className="sub-Heading">
  {Array.isArray(property.generalInfo.propertyType)
    ? property.generalInfo.propertyType.join(", ")
    : property.generalInfo.propertyType}
</p>
          <p className="sub-Heading-1">Year Built</p>
          <p className="sub-Heading">{property.generalInfo.yearBuilt}</p>
          <p className="sub-Heading-1">Square Footage</p>
          <p className="sub-Heading">{property.generalInfo.squareFootage}</p>
          <p className="sub-Heading-1">Bedrooms</p>
          <p className="sub-Heading">{property.generalInfo.numberOfBedrooms}</p>
          <p className="sub-Heading-1">Bathrooms</p>
          <p className="sub-Heading">{property.generalInfo.numberOfBathrooms}</p>
          <p className="sub-Heading-1">Floors</p>
          <p className="sub-Heading">{property.generalInfo.numberOfFloors}</p>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: "none" }}>
          <Typography gutterBottom>
            Set Nearby Search Radius (meters): {radius}
          </Typography>
          <Slider
            value={radius}
            min={500}
            max={5000}
            step={100}
            onChange={handleRadiusChange}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box
          sx={{
            boxShadow: "1px 1px 10px 0px rgba(1, 29, 80, 0.6)",
            marginBottom: "1%",
            borderRadius: "16px",
          }}
        >
          <MapComponent
            sx={{ border: "1px solid grey" }}
            center={{ lat: property.latitude, lng: property.longitude }}
            places={nearbyPlaces}
            propertyAddress={property.generalInfo.propertyAddress}
  propertyName={property.title}
            
          />
        </Box>
      </Container>
    </Box>
  );
};

export default PropertyDetails;
