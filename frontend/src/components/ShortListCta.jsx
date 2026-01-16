import React, { useState, useEffect } from 'react';
import { FaCheckDouble } from 'react-icons/fa';
import ViewPropButton from './ViewPropButton';
import shortlistIcon from "../assets/event_upcoming.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { addMonths, isSameMonth, isSameYear, format } from 'date-fns';
import { Box, Button } from "@mui/material";

const ShortlistCTA = ({ userId, propertyId, onUpdate }) => {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [visitDate, setVisitDate] = useState(null);
  const [status, setStatus] = useState("");

  const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';
  
  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        
        const res = await axios.get(`${BASE_URL}/api/activity/${userId}/${propertyId}`);
        if (res.data) {
          setIsShortlisted(res.data.shortlisted || false);
          setVisitDate(res.data.visitDate ? new Date(res.data.visitDate) : null);
          setStatus(res.data.status || "");
        }
      } catch (err) {
        console.error("Error fetching user activity:", err);
      }
    };

    if (userId && propertyId) {
      fetchUserActivity();
    }
  }, [userId, propertyId,BASE_URL]);

  const saveActivity = async (updatedFields) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/activity/save`, {
        userId,
        propertyId,
        ...updatedFields,
      });

      if (onUpdate) onUpdate(res.data);

      if (updatedFields.shortlisted !== undefined) setIsShortlisted(updatedFields.shortlisted);
      if (updatedFields.visitDate) setVisitDate(new Date(updatedFields.visitDate));
      if (updatedFields.status) setStatus(updatedFields.status);
    } catch (err) {
      console.error("Error saving activity:", err);
    }
  };

  const handleShortlistClick = () => {
    saveActivity({ shortlisted: true, status: "Interested" });
  };

  const handleScheduleVisitClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateSelect = (date) => {
    saveActivity({ visitDate: date, status: "Visit Scheduled" });
    setShowCalendar(false);
  };

  const isDateSelectable = (date) => {
    const today = new Date();
    const nextMonth = addMonths(today, 1);
    return (
      (isSameMonth(date, today) && isSameYear(date, today)) ||
      (isSameMonth(date, nextMonth) && isSameYear(date, nextMonth))
    );
  };

 const formattedDate = visitDate ? format(visitDate, "d/M/yyyy") : null;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Shortlist Button */}
      {!isShortlisted && (
        <button onClick={handleShortlistClick} className="view-prop-btn">
          <ViewPropButton
            text="Shortlist Property"
            img={shortlistIcon}
            className="view-prop-btn icon-margin"
          />
        </button>
      )}

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        {isShortlisted && !visitDate && status !== "Visited" && (
          <Button sx={btnStyle("#FFD580", "#222")}>Shortlisted</Button>
        )}
        
        {/* Case 1: Just shortlisted */}

        {/* Case 2: Date set but not visited */}
        {visitDate && status !== "Visited" && (
          <Button sx={btnStyle("#C7F6FE", "#3E3E3E")}>
            Property Visit on {formattedDate}
          </Button>
        )}

        {/* Case 3: Admin marked visited */}
        {status === "Visited" && (
          <Button sx={btnStyle("#90EE90", "#222")}>Property Visited</Button>
        )}

        {/* Schedule/Reschedule button if not visited */}
        {isShortlisted && status !== "Visited" && (
          <button
            onClick={handleScheduleVisitClick}
            style={scheduleBtnStyle}
          >
            <FaCheckDouble />
            {visitDate ? "Reschedule Visit" : "Schedule Visit"}
          </button>
        )}
      </Box>

      {/* Calendar */}
      {showCalendar && (
        <Box sx={{ marginTop: "10px", position: "absolute", top: {xs:"350px",md:"150px"}, right:{xs:"117px",md:"60px"}  }}>
          <DatePicker
            selected={visitDate}
            onChange={handleDateSelect}
            filterDate={isDateSelectable}
            inline
          />
        </Box>
      )}
    </div>
  );
};

const btnStyle = (bg, color) => ({
  background: bg,
  color: color,
  fontWeight: "bold",
  padding: "10px 24px",
  borderRadius: "30px",
  fontSize: { xs: 12, md: 14 },
  textTransform: "capitalize",
  fontFamily: "Poppins",
  width: "fit-content",
  textAlign: "center",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
});

const scheduleBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: "10px 24px",
  fontSize: 16,
  borderRadius: "30px",
  backgroundColor: "#0086AD",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  border: "none"
};

export default ShortlistCTA;
