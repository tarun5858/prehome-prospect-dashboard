import { Container, Box, Grid, Button } from "@mui/material";
import ApplicationCta from "./ApplicationCta";
import { useState } from "react";
import "../assets/style.css";

const CtaCards = ({ subHeading, options, handleNext, text }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (value) => {
    setSelected(value);
    handleNext(value); // Send selected option up
  };

  return (
    <Container maxWidth="lg" className="app-card-container">
      <Box className="content-box">
        <Box
          className="subhead-text-cont"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <p className="card-subhead">{subHeading}</p>

          <Button
            onClick={() => handleNext("Skipped")}
            variant="text"
            sx={{  color: "#7BA1A7", fontSize: 16, textTransform: "none", cursor: "pointer",fontWeight: 600, }}
          >
            {text}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {options.map((opt, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <ApplicationCta
                text={opt}
                value={opt}
                handleNext={handleSelect}
                isSelected={selected === opt}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default CtaCards;
