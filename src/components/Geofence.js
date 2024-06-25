/* eslint-disable react/prop-types */
// src/components/Geofence.js
import { useState, useEffect } from "react";
import { isInsideGeofence } from "../utils/geofence";

const Geofence = ({ geofence, onEnter, onExit }) => {
  const [position, setPosition] = useState(null);
  const [insideGeofence, setInsideGeofence] = useState(false);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const location = { latitude, longitude };
      setPosition(location);
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (position) {
      const isInside = isInsideGeofence(position, geofence);

      if (isInside && !insideGeofence) {
        onEnter(position);
        setInsideGeofence(true);
      } else if (!isInside && insideGeofence) {
        onExit(position);
        setInsideGeofence(false);
      }
    }
  }, [position, geofence, insideGeofence, onEnter, onExit]);

  return (
    <div>
      <h2>Geofence Monitoring</h2>
      {position && (
        <p>
          Current Position: Latitude {position.latitude}, Longitude{" "}
          {position.longitude}
        </p>
      )}
    </div>
  );
};

export default Geofence;
