import { useState } from "react";
import { Container, Box, TextField } from "@mui/material";
import "../assets/style.css";

const InputCta = ({ id, handleNext, subHeading, subHeading2 }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const submitIfValid = () => {
    if (inputValue.trim() !== "") {
      handleNext(inputValue);
    }
  };

  return (
    <Container maxWidth="lg" className="app-card-container">
      <Box className="content-box">
        <p className="card-subhead">{subHeading}</p>

        <TextField
          fullWidth
          variant="outlined"
          placeholder={subHeading2 || "Type here..."}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={submitIfValid}
          onKeyDown={(e) => e.key === "Enter" && submitIfValid()}
sx={{
    mt: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '& fieldset': {
        borderColor: 'grey',
      },
      '&:hover fieldset': {
        borderColor: 'black', 
      },
      '&.Mui-focused fieldset': {
        borderColor: '#EF9C00', 
        boxShadow: '0 0 0 2px rgba(255,87,34,0.2)', 
      },
    },
  }}        />
      </Box>
    </Container>
  );
};

export default InputCta;
