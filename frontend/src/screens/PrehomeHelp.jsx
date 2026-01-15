import {
  Typography,
  Container,
  Box,
  Grid,
  TextField,
} from "@mui/material";
import ChatIcon from "../assets/Frame 645.png";
import ChevronIcon from "../assets/chevron_forward.png";
import SendIcon from "../assets/send.png";
import "../assets/style.css";
import ChatbotCta from "../components/ChatbotCta";
import ChatbotOutlineCta from "../components/ChatbotOutlineCta";

import { chatbotNodes } from "../data/chatbotData";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const PrehomeHelp = () => {
  const [currentNode, setCurrentNode] = useState(chatbotNodes.root);
  const [chatHistory, setChatHistory] = useState([
    { message: chatbotNodes.root.message, type: "bot" },
  ]);
  const [userInput, setUserInput] = useState("");
  const chatContainerRef = useRef(null);

  const userId = localStorage.getItem("user_id"); // You can use "user_email" instead

  // Save chat messages to MongoDB
  const saveChatToServer = async (newMessages) => {
    if (!userId) return;

    try {
      const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';
      await axios.post(`${BASE_URL}/api/chat/save-chat`, {
        userId,
        messages: newMessages,
      });
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const handleOptionClick = (option) => {
    const nextNode = chatbotNodes[option.nextId];
    if (nextNode) {
      const newMessages = [
        { message: option.text, type: "user" },
        { message: nextNode.message, type: "bot" },
      ];
      setChatHistory((prev) => [...prev, ...newMessages]);
      setCurrentNode(nextNode);
      saveChatToServer(newMessages);
    }
  };

  const handleSend = () => {
    if (userInput.trim() === "") return;

    const newMessages = [
      { message: userInput, type: "user" },
      {
        message: "Thank you for your query. Please select an option or start over.",
        type: "bot",
      },
    ];

    setChatHistory((prev) => [...prev, ...newMessages]);
    setUserInput("");
    saveChatToServer(newMessages);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <Container maxWidth="xl" className="chatbot-body">
      <Container maxWidth="xl" className="chatbot-parent">
        <Container maxWidth="lg" className="chat-container">
          <Container maxWidth="lg" className="chatbot-header">
            <Box className="chatbot-head">
              <Grid>
                <Box item xs={12} md={4} lg={4}>
                  <img src={ChatIcon} alt="" />
                </Box>
              </Grid>
              <Grid>
                <Box item xs={12} md={4} lg={4}>
                  <p className="chatbot-heading">Chatbot</p>
                </Box>
              </Grid>
              <Grid>
                <Box item xs={12} md={4} lg={4}>
                  <img src={ChevronIcon} alt="" />
                </Box>
              </Grid>
            </Box>
          </Container>

          {/* Chat Messages */}
          <Box
            className="chat-card"
            ref={chatContainerRef}
            sx={{
              maxHeight: { xs: "450px", md: "370px" },
              overflowY: "auto",
              paddingRight: "10px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {chatHistory.map((item, index) => (
              <Grid
                key={index}
                xs={12}
                sm={12}
                md={12}
                lg={12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 2,
                  alignItems: item.type === "bot" ? "flex-start" : "flex-end",
                }}
              >
                {item.type === "bot" ? (
                  <ChatbotCta text={item.message} />
                ) : (
                  <ChatbotCta
                    text={item.message}
                    className="chatbot-cta color-cta"
                  />
                )}
              </Grid>
            ))}

            {/* Options */}
            {currentNode.options && (
              <Grid
                xs={12}
                sm={12}
                md={12}
                lg={12}
                sx={{ display: "flex", flexDirection: "column", marginBottom: 2 }}
              >
                <ChatbotCta text="Select one of the following:" />
                <Box className="cta-container-chatbot mt-3">
                  {currentNode.options.map((option, idx) => (
                    <ChatbotOutlineCta
                      key={idx}
                      text={option.text}
                      onClick={() => handleOptionClick(option)}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Box>

          {/* Input Footer */}
          <Container maxWidth="lg" className="chatbot-footer">
            <Box className="footer" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Enter your query here"
                className="chatbot-input"
                variant="outlined"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "Poppins",
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center" }} onClick={handleSend}>
                <img src={SendIcon} alt="Send" style={{ width: 32, height: 32, cursor: "pointer" }} />
              </Box>
            </Box>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default PrehomeHelp;
