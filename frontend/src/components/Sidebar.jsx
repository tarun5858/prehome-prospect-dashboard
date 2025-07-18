import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Paper,
} from "@mui/material";
import {
  Menu as MenuIcon,
  // People as PeopleIcon,
  // Assessment as AssessmentIcon,
  // Settings as SettingsIcon,
  // Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/logo.png";
import axios from "axios";
import assignment from "../assets/assignment_ind.png";
import properties from "../assets/Property.png";
import help from "../assets/help.png";
import NotificationsIcon from "../assets/notifications.png";

const drawerWidth = 260;

export default function Sidebar() {
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const [notifications, setNotifications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef();

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleListItemClick = (text) => {
    if (text.route === "logout") {
      localStorage.removeItem("user_id");
      localStorage.removeItem("authToken");
      navigate("/login");
      return;
    }

    navigate(`/${text.route}`);
    setSelectedItem(text.name);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const res = await axios.get(
          `https://prehome-prospect-dashboard.onrender.com/api/notifications/${userId}`
        );
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar
        disableGutters
        sx={{
          alignItems: "flex-start",
          justifyContent: "flex-start",
          px: 2,
          pt: 2,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            width: "92px",
            height: "70.4px",
            objectFit: "contain",
          }}
        />
      </Toolbar>

      <Box sx={{ height: "16px", cursor: "pointer" }} />

      <List>
        {[
          {
            name: "Dashboard",
            route: "dashboard",
            icon: <img src={assignment} />,
          },
          {
            name: "Properties",
            route: "available-property",
            icon: <img src={properties} />,
          },
          {
            name: "PreHome Help",
            route: "prehome-help",
            icon: <img src={help} />,
          },
        ].map((item) => (
          <Box
            key={item.name}
            sx={{
              mx: 2,
              my: 0.5,
              borderRadius: "12px",
              cursor: "pointer",
              backgroundColor:
                selectedItem === item.name ? "#fdf0d9" : "transparent",
              transition: "background-color 0.3s ease",
              "&:hover": {
                backgroundColor:
                  selectedItem === item.name ? "#fdf0d9" : "#f5f5f5",
              },
            }}
          >
            <ListItem
              button
              onClick={() => handleListItemClick(item)}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: "12px",
              }}
            >
              <ListItemIcon sx={{ minWidth: "35px", color: "#000000" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  className: "sidebar-text",
                  sx: {
                    fontWeight: selectedItem === item.name ? "bold" : "normal",
                    color: "#000000",
                  },
                }}
              />
            </ListItem>
          </Box>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Logout */}
      <Box
        sx={{
          mx: 2,
          mb: 2,
          borderRadius: "12px",
          backgroundColor:
            selectedItem === "Logout" ? "#fdf0d9" : "transparent",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <ListItem
          button
          onClick={() =>
            handleListItemClick({ name: "Logout", route: "logout" })
          }
          sx={{
            px: 2,
            py: 1.2,
            borderRadius: "12px",
          }}
        >
          <ListItemIcon sx={{ minWidth: "35px", color: "#000000" }}>
            <MdLogout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              className: "poppins-bold-16",
              sx: {
                fontWeight: selectedItem === "Logout" ? "bold" : "normal",
                color: "#000000",
              },
            }}
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          backgroundColor: "white",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, color: "black" }}
          />

          <Box sx={{ position: "relative" }} ref={dropdownRef}>
            <IconButton
              color="inherit"
              sx={{ color: "black" }}
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <Badge badgeContent={notifications.length} color="error">
                {/* <NotificationsIcon /> */}
                <img src={NotificationsIcon} />
              </Badge>
            </IconButton>

            {openDropdown && (
              <Paper
                sx={{
                  position: "absolute",
                  right: -8,
                  top: -5,
                  width: 325,
                  height: 375,
                  // maxHeight: 350,
                  overflowY: "auto",
                  scrollbarWidth:"none",
                  zIndex: 999,
                  p: 2,
                  borderRadius: "16px",
                  padding: "12px",
                  gap: 12,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    // position:"fixed",
                  }}
                >
                  <Typography className="poppins-bold-16" sx={{ mb: 1 }}>
                    Notifications
                  </Typography>
                  <IconButton
                    color="inherit"
                    sx={{ color: "black" }}
                    onClick={() => setOpenDropdown(!openDropdown)}
                  >
                    <Badge badgeContent={notifications.length} color="error">
                      {/* <NotificationsIcon /> */}
                      <img src={NotificationsIcon} />
                    </Badge>
                  </IconButton>
                </Box>
                {notifications.length === 0 ? (
                  <Typography className="poppins-bold-12">
                    No notifications
                  </Typography>
                ) : (
                  notifications.map((note, idx) => (
                    <Box
                      key={idx}
                      sx={{
                          width: 293,
                          height: 80,
                          marginTop: "10px",
                          color: "gray",
                          borderRadius: "16px",
                          padding: "12px",
                          gap: 12,
                          background: "#FFE6E6",
                        }}
                    >
                      <Typography className="poppins-bold-10 ">
                        {note.message}
                      </Typography>
                      <Typography
                        
                      >
                        {new Date(note.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                )}
              </Paper>
            )}
          </Box>

          {isMobile && (
            <IconButton
              sx={{ color: "black", ml: 1 }}
              onClick={() =>
                handleListItemClick({ name: "Logout", route: "logout" })
              }
            >
              <MdLogout />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {!isMobile && (
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="permanent"
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
      )}
    </Box>
  );
}
