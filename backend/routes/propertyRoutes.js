const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  getProperties,
  getPropertyById,
  createProperty,
} = require("../controllers/propertyController");
const Property = require('../models/propertyModel');

// Valid Google Place types to avoid typos like "hospitals"
const validPlaceTypes = [
  "hospital", "school", "restaurant", "atm", "bank", "gym", "park", "doctor",
  "pharmacy", "university", "library", "police", "fire_station", 
  "grocery_or_supermarket", "shopping_mall", "department_store"
];

// Existing routes
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", createProperty);

// ✅ POST: Search Nearby Places by Address
router.post("/nearby-places", async (req, res) => {
  const { location, type, radius } = req.body;

  const placeType = type?.trim().toLowerCase();

  if (placeType === "mall") {
  placeType = "shopping_mall";
}

  if (!location || !placeType || !radius) {
    return res.status(400).json({ message: "Location, type, and radius are required" });
  }
  if (!validPlaceTypes.includes(placeType)) {
    return res.status(400).json({ message: `Invalid type. Valid types: ${validPlaceTypes.join(', ')}` });
  }

  try {
    const API_KEY = "AIzaSyA08jwhkUMNssPvaWsRlYE-S--IBpa4mUc";

    const geoResponse = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { address: location, key: API_KEY },
    });

    if (geoResponse.data.status !== "OK") {
      return res.status(404).json({ message: "Location not found" });
    }

    const { lat, lng } = geoResponse.data.results[0].geometry.location;

    const placesResponse = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", {
      params: { location: `${lat},${lng}`, radius, type: placeType, key: API_KEY },
    });

    const formattedPlaces = placesResponse.data.results.map(place => ({
      name: place.name,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      types: place.types,
    }));

    res.json(formattedPlaces);
  } catch (error) {
    console.error("Error fetching nearby places:", error.message);
    res.status(500).json({ message: "Error fetching nearby places" });
  }
});

// ✅ GET: Nearby Places by Property ID
router.get("/:id/nearby", async (req, res) => {
  const propertyId = req.params.id;
  const placeType = req.query.type?.trim().toLowerCase();

  if (placeType === "mall") {
  placeType = "shopping_mall";
}

  if (!placeType) {
    return res.status(400).json({ message: "Place type is required (e.g., hospital)" });
  }

  if (!validPlaceTypes.includes(placeType)) {
    return res.status(400).json({ message: `Invalid place type. Valid types are: ${validPlaceTypes.join(", ")}` });
  }

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    const geoResponse = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { address: property.location, key: API_KEY },
    });

    if (geoResponse.data.status !== "OK") {
      return res.status(400).json({ message: "Failed to geocode property location" });
    }

    const { lat, lng } = geoResponse.data.results[0].geometry.location;
    const radius = property.radius || 1000;

    const placesResponse = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius,
          type: placeType,
          key: API_KEY,
        },
      }
    );

    const formattedPlaces = placesResponse.data.results.map((place) => ({
      name: place.name,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      types: place.types,
    }));

    res.json({
      location: property.location,
      coordinates: { lat, lng },
      radius,
      type: placeType,
      results: formattedPlaces,
    });
  } catch (error) {
    console.error("Nearby search failed:", error.message);
    res.status(500).json({ message: "Error fetching nearby places" });
  }
});

module.exports = router;
