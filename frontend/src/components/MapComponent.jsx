import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import logo from "../assets/logo.png";

const MapComponent = ({
  center,
  places = [],
  propertyAddress = "",
  propertyName = "Property Location",
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [mapCenter, setMapCenter] = useState(center);
  const [zoom, setZoom] = useState(15);
  const mapRef = useRef(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [addressCoords, setAddressCoords] = useState(null);

  const handleOnLoad = (map) => {
    mapRef.current = map;
  };

  const handleMarkerClick = useCallback((place) => {
    setSelectedPlace(place);
    setMapCenter({ lat: place.latitude, lng: place.longitude });
    setZoom(18);
    if (mapRef.current) mapRef.current.setZoom(18);
  }, []);

  // ✅ Geocode the property address to get lat/lng
  useEffect(() => {
    if (!propertyAddress) return;

    const fetchCoords = async () => {
      try {
        const res = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: propertyAddress,
              key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Same key
              // key: "AIzaSyA08jwhkUMNssPvaWsRlYE-S--IBpa4mUc", // Same key
            },
          },
        );

        if (res.data.status === "OK") {
          const location = res.data.results[0].geometry.location;
          setAddressCoords({ lat: location.lat, lng: location.lng });
        } else {
          console.error("Geocoding error:", res.data.status);
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    };

    fetchCoords();
  }, [propertyAddress]);

  if (!isLoaded) return <div>Loading...</div>;

  // const getMarkerIcon = (placeTypes = []) => {
  //   if (placeTypes.includes("restaurant")) return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
  //   if (placeTypes.includes("hospital")) return "https://maps.google.com/mapfiles/ms/icons/hospitals.png";
  //   if (placeTypes.includes("school")) return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  //   if (placeTypes.includes("gym")) return "https://maps.google.com/mapfiles/ms/icons/purple-dot.png";
  //   if (placeTypes.includes("shopping_mall") || placeTypes.includes("shopping_mall")) return "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  //   if (placeTypes.includes("park")) return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
  //   return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
  // };

  // const getMarkerIcon = (placeTypes = []) => {
  //   const types = placeTypes.map((t) => t.toLowerCase()); // Case-insensitive check

  //   if (types.includes("restaurant") || types.includes("food"))
  //     return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";

  //   if (
  //     types.includes("hospital") ||
  //     types.includes("doctor")
  //   )
  //     return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";

  //   if (placeTypes.includes("gym"))
  //     return "https://maps.google.com/mapfiles/ms/icons/purple-dot.png";

  //   if (types.includes("school") || types.includes("university"))
  //     return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

  //   if (types.includes("shopping_mall") || types.includes("department_store")) {
  //     return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  //   }

  //   if (types.includes("park"))
  //     return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";

  //   return "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // Default
  // };

  const getMarkerIcon = (placeTypes = []) => {
    // Ensure types is an array and lowercase everything for safe comparison
    const types = Array.isArray(placeTypes)
      ? placeTypes.map((t) => t.toLowerCase())
      : [];

    if (types.includes("restaurant"))
      return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    if (types.includes("hospital"))
      return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
    if (types.includes("school"))
      return "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    if (types.includes("gym"))
      return "https://maps.google.com/mapfiles/ms/icons/purple-dot.png";
    if (types.includes("park"))
      return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";

    // ✅ FIX: Match the Google 'shopping_mall' type and use a reliable Blue Icon
    if (
      types.includes("shopping_mall") ||
      types.includes("mall") ||
      types.includes("department_store")
    ) {
      return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    }

    // Fallback for anything else
    return "https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png";
  };

  return (
    <GoogleMap
      // height: "560px"
      mapContainerStyle={{ width: "100%", height: "70vh", borderRadius: 16 }}
      center={mapCenter}
      zoom={zoom}
      onLoad={handleOnLoad}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Address marker (big red) */}
      {addressCoords && (
        <Marker
          position={addressCoords}
          title={propertyAddress}
          zIndex={1000}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(60, 60),
          }}
        />
      )}

      {/* Property marker */}
      <Marker
        position={mapCenter}
        title={propertyName}
        icon={{
          // url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          url: logo,
          scaledSize: new window.google.maps.Size(50, 50),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(25, 25),
        }}
      />

      {/* Nearby places markers */}
      {places.map((place, index) => {
        // Add this log to see what the "Mall" data actually looks like
        if (
          place.name.toLowerCase().includes("mall") ||
          place.types.includes("shopping_mall")
        ) {
          console.log("Mall Data Found:", place);
        }

        return (
          <Marker
            key={index}
            position={{ lat: place.latitude, lng: place.longitude }}
            icon={{
              url: getMarkerIcon(place.types || []),
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            title={place.name}
            onClick={() => handleMarkerClick(place)}
          />
        );
      })}

      {/* InfoWindow for selected nearby place */}
      {selectedPlace && (
        <InfoWindow
          position={{
            lat: selectedPlace.latitude,
            lng: selectedPlace.longitude,
          }}
          onCloseClick={() => setSelectedPlace(null)}
        >
          <div>
            <h4>{selectedPlace.name}</h4>
            {selectedPlace.types && (
              <p>
                <strong>Types:</strong> {selectedPlace.types.join(", ")}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapComponent;
