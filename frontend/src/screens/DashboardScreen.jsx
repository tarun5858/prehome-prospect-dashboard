import { useState, useEffect } from "react";
import { Container, Box, Typography } from "@mui/material";
import axios from "axios";

import "../assets/style.css";
import CtaCards from "../components/CtaCards";
import SliderCard from "../components/SliderCard";
import InputCta from "../components/InputCta";

// ------------------- Form Sections --------------------
const formSections = [
  {
    sectionId: "L1",
    sectionName: "Personal Information",
    questions: [
      { id: 1, label: "First Name", inputType: "text" },
      { id: 2, label: "Last Name", inputType: "text" },
      { id: 3, label: "DOB", inputType: "date" },
      { id: 4, label: "Email Address", inputType: "prefilled" },
      { id: 5, label: "Mobile Number", inputType: "number" },
      {
        id: 6,
        label: "Marital Status",
        inputType: "radio",
        options: ["Single", "Widowed", "Divorced", "Married"],
      },
    ],
  },
  {
    sectionId: "L2",
    sectionName: "Qualifying Criteria",
    questions: [
      {
        id: 7,
        label: "Are you an Indian citizen?",
        inputType: "radio",
        options: ["Yes", "No"],
      },
      {
        id: 8,
        label: "Do you have any legal case filed against your name?",
        inputType: "radio",
        options: ["Yes", "No"],
      },
      {
        id: 9,
        label:
          "Have you missed any payments in the last 6 months? (Eg: EMI, Rent, Credit card bills or similar bills)",
        inputType: "radio",
        options: ["Yes", "No"],
      },
      {
        id: 10,
        label: "What would be the range of your combined household income?",
        inputType: "slider",
        min: 50000,
        max: 1000000,
        step: 50000,
        unit: "₹",
      },
      {
        id: 11,
        label: "What would be the average monthly rent?",
        inputType: "slider",
        min: 30000,
        max: 250000,
        step: 20000,
        unit: "₹",
      },
    ],
  },
  {
    sectionId: "L3",
    sectionName: "Property Information",
    questions: [
      {
        id: 12,
        label: "What is your current living location?",
        inputType: "text",
      },
      {
        id: 13,
        label: "Do you own a car?",
        inputType: "radio",
        options: ["Yes", "No"],
      },
      {
        id: 14,
        label: "What is the location where you are looking for a home?",
        inputType: "text",
      },
    ],
  },
  {
    sectionId: "L4",
    sectionName: "Family Information",
    questions: [
      {
        id: 15,
        label: "What type of family consideration do you have for the new home?",
        inputType: "radio",
        options: ["Nuclear", "Joint", "Family with pet", "Single", "Bachelors"],
      },
      {
        id: 16,
        label: "Do you believe in Vaastu compliance?",
        inputType: "radio",
        options: ["Yes", "No"],
      },
      {
        id: 17,
        label: "If yes, specify your criteria",
        inputType: "text",
        conditionalOn: { id: 16, value: "Yes" },
      },
    ],
  },
  {
    sectionId: "L5",
    sectionName: "Contact Information",
    questions: [
      {
        id: 18,
        label: "What would be your most preferred mode of contact to reach you?",
        inputType: "radio",
        options: ["Email", "Mobile"],
      },
      {
        id: 19,
        label: "Should you be interested, what would be the most preferred time to connect with you?",
        inputType: "text",
      },
      {
        id: 20,
        label: "Do you have any alternate contact information for this purpose?",
        inputType: "text",
      },
    ],
  },
];

// ------------------- Component --------------------
const DashboardScreen = () => {
  const userId = localStorage.getItem("user_id");

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [sectionAnswers, setSectionAnswers] = useState({});

  const section = formSections[currentSectionIndex];
  const allQuestions = formSections.flatMap((s) => s.questions);
  const progressPercent = Math.min(
    100,
    Math.round((currentSectionIndex / formSections.length) * 100)
  );

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/form/load-progress/${userId}`
        );
        const saved = res.data.responses || [];
        setResponses(saved);

        if (saved.length > 0) {
          const lastId = saved[saved.length - 1].questionId;
          const index = formSections.findIndex((sec) =>
            sec.questions.some((q) => q.id === lastId)
          );
          setCurrentSectionIndex(index + 1);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };

    if (userId) loadProgress();
  }, [userId]);

  const handleAnswer = (question, value) => {
    const updated = { ...sectionAnswers, [question.id]: value };
    setSectionAnswers(updated);

    const allAnswered = section.questions.every((q) =>
      !q.conditionalOn || updated[q.conditionalOn.id] === q.conditionalOn.value
        ? updated[q.id] !== undefined && updated[q.id] !== ""
        : true
    );

    if (allAnswered) {
      const newResponses = section.questions
        .filter(
          (q) =>
            !q.conditionalOn || updated[q.conditionalOn.id] === q.conditionalOn.value
        )
        .map((q) => ({
          questionId: q.id,
          question: q.label,
          answer: String(updated[q.id]),
        }));

      const updatedResponses = [...responses, ...newResponses];
      setResponses(updatedResponses);
      setSectionAnswers({});

      axios
        .post("http://localhost:5000/api/form/save-progress", {
          userId,
          responses: updatedResponses,
        })
        .then(() => {
          setCurrentSectionIndex((prev) => prev + 1);
        })
        .catch((err) => {
          console.error("Failed to save:", err);
        });
    }
  };

  const renderQuestion = (q) => {
    const shouldShow =
      !q.conditionalOn ||
      sectionAnswers[q.conditionalOn.id] === q.conditionalOn.value;
    if (!shouldShow) return null;

    if (q.inputType === "slider") {
      return (
        <SliderCard
          key={q.id}
          id={q.id}
          subHeading={q.label}
          defaultValue={sectionAnswers[q.id] || q.min}
          handleNext={(val) => handleAnswer(q, val)}
        />
      );
    }

    if (["text", "number", "date", "autocomplete", "prefilled"].includes(q.inputType)) {
      return (
        <InputCta
          key={q.id}
          id={q.id}
          subHeading={q.label}
          inputType={q.inputType}
          defaultValue={sectionAnswers[q.id] || ""}
          handleNext={(val) => handleAnswer(q, val)}
        />
      );
    }

    if (q.inputType === "radio") {
      return (
        <CtaCards
          key={q.id}
          subHeading={q.label}
          options={q.options}
          handleNext={(val) => handleAnswer(q, val)}
          text="Skip"
        />
      );
    }

    return null;
  };

  if (currentSectionIndex >= formSections.length) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="primary">
          🎉 Thank you! We&aposre on the job, coming soon to you with homes of your choice.
        </Typography>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ backgroundColor: "#ECECEC", minHeight: "100vh", pt: 7,pb:5 }}
    >
      <Box
        className="fixed-card"
        sx={{
          background: "#fff",
          borderRadius: "32px",
          p: { xs: 2, md: 3 },
          pt: 10,
          mb: 0,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          width: "100%",
          maxWidth: "1128px",
          minHeight: "164px",
          mx: "auto",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              fontSize: 24,
              color: "#222",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Start your home ownership journey
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#7BA1A7",
              fontSize: 16,
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {progressPercent}% Complete
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <Typography
            sx={{
              fontWeight: 500,
              color: "#222",
              fontSize: 16,
              fontFamily: "Poppins, sans-serif",
              mr: 3,
            }}
          >
            {section.sectionName}
          </Typography>
        </Box>

        {/* Custom Progress Bar */}
        <Box sx={{ position: "relative", width: "100%", mt: 1 }}>
          <Box
            sx={{
              width: "100%",
              height: 20,
              background: "#D6EEF5",
              borderRadius: "16px",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `calc(${progressPercent}% + 60px)`,
                background: "#0086AD",
                borderRadius: "16px",
                transition: "width 0.4s",
                zIndex: 1,
              }}
            />
            {formSections.map((sec, idx) => {
              if (idx === 0) return null;
              return (
                <Box
                  key={sec.sectionId}
                  sx={{
                    position: "absolute",
                    left: `${(idx / (formSections.length - 0.97)) * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 16,
                    height: 16,
                    background: "#fff",
                    borderRadius: "50%",
                    zIndex: 2,
                    border: "3px solid #D6EEF5",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                />
              );
            })}
            <Box
              sx={{
                position: "absolute",
                left: `calc(${progressPercent}% + 44px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                background: "#fff",
                borderRadius: "50%",
                zIndex: 3,
                border: "4px solid #0086AD",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                transition: "left 0.4s",
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box className="question-section" sx={{ mt: 4, zIndex: 0 }}>
        {section.questions.map(renderQuestion)}
      </Box>
    </Container>
  );
};

export default DashboardScreen;
