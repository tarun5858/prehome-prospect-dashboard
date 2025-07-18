import { Box, Typography, Container } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import PropertyCards from "../components/PropertyCards";
import "../assets/style.css";

const AvailablePropertyScreen = () => {
  const [properties, setProperties] = useState([]);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
      fetchProperties();
    } else {
      console.warn("User ID not found in localStorage");
    }
  }, [userId]);

  const fetchProperties = async () => {
    try {
      const res = await axios.get(`https://prehome-prospect-dashboard.onrender.com/api/properties?userId=${userId}`);
      setProperties(res.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  return (
    <Box sx={{ background: "#ECECEC", minHeight: "100vh", width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          background: "#ECECEC",
          px: { xs: 2, md: 5 },
          py: 4,
          mt: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#222",fontFamily:"Poppins" }}>
          Available Properties
        </Typography>
      </Box>

      <Container maxWidth="lg">
        {properties.map((property) => {
          let status = "";
          let visitDate = "";

          if (property.status?.toLowerCase() === "visited") {
            status = "visited";
            visitDate = property.visitDate;
          } else if (property.shortlisted && property.visitDate) {
            status = "scheduled";
            visitDate = property.visitDate;
          } else if (property.shortlisted && !property.visitDate) {
            status = "shortlisted";
          }
  console.log("Property Status:", status, "Visit Date:", visitDate);
          return (
            <Box
              key={property._id}
              sx={{
                backgroundColor: "#fff",
                borderRadius:{ xs: "22px", md: "24px" },
                boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.05)",
                pt: { xs: 0, md: 3 },
                pb: { xs: 0, md: 2 },
                px: { xs: 0, md: 1 },
                mb: 4,
                margin:{xs:"8% 2%"}
              }}
            >
              <PropertyCards
                propertyId={property._id}
                Heading={property.title}
                SubHeading={
                  property.generalInfo?.propertyAddress || property.location
                }
                images={property.images}
                status={status}
                visitDate={visitDate}
                description={property.description}
                tags={property.tags}
              />
            </Box>
          );
        })}
      </Container>
    </Box>
  );
};

export default AvailablePropertyScreen;
