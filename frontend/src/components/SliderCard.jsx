import { useState, useEffect } from "react";
import { Container, Box, Slider, Grid, Typography } from "@mui/material";
import "../assets/style.css";

const SliderCard = ({ id, handleNext, subHeading }) => {
  const [sliderValue, setSliderValue] = useState(50);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleNext(sliderValue);
    }, 500); // 0.5s delay to simulate auto-submit

    return () => clearTimeout(debounce);
  }, [sliderValue]);

  return (
    <Container maxWidth="lg" className="app-card-container">
      <Box className="content-box">
        <p className="card-subhead">{subHeading}</p>

        <Slider
          min={0}
          max={100}
          value={sliderValue}
          onChange={(e, val) => setSliderValue(val)}
          valueLabelDisplay="on"
          sx={{
            marginTop:"3%",
            "& .MuiSlider-track": { backgroundColor: "rgb(239, 156, 0)", height: 20, border: "none" },
            "& .MuiSlider-rail": { backgroundColor: "#DEDEDE", height: 20 },
            "& .MuiSlider-thumb": {
              backgroundColor: "rgb(239, 156, 0)",
              border: "2px solid white",
              width: 25,
              height: 25,
              "&:hover, &:focus, &.Mui-active": { boxShadow: "none" },
            },
            "& .MuiSlider-valueLabel": {
              backgroundColor: "#DCF7FF",
              color: "black",
              fontWeight: "bold",
              top: "-2px",
              borderRadius: "20px",
              padding: "8px",
              paddingX: "16px",
              "&:before": { display: "none" },
              "& *": { transform: "none" },
            },
          }}
        />

        <Grid item xs={12} md={6} lg={6}>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="h4" fontSize={20}>0</Typography>
            <Typography variant="h4" fontSize={20}>100</Typography>
          </Box>
        </Grid>
      </Box>
    </Container>
  );
};

export default SliderCard;
