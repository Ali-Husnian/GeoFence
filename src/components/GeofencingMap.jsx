/* eslint-disable react-hooks/exhaustive-deps */
// src/components/GeofencingMap.js
import { useCallback, useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Circle,
} from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const geofenceRadius = 5000; // in meters

function GeofencingMap() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [entryExitData, setEntryExitData] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    });
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDd-nvVSObBhAlLcpUNKW4dRissQVI4hJ4",
    libraries,
  });

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback(
    (event) => {
      const newMarker = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      };
      setMarkers((current) => [...current, newMarker]);

      const distance = getDistanceFromLatLonInKm(
        newMarker.lat,
        newMarker.lng,
        latitude,
        longitude
      );

      if (distance < geofenceRadius / 1000) {
        alert("Entered geofence zone");
        setEntryExitData((current) => [
          ...current,
          { ...newMarker, type: "entry" },
        ]);
      } else {
        alert("Exited geofence zone");
        setEntryExitData((current) => [
          ...current,
          { ...newMarker, type: "exit" },
        ]);
      }
    },
    [latitude, longitude]
  );

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";

  if (latitude === null || longitude === null) {
    return "Loading location...";
  }

  const center = {
    lat: latitude,
    lng: longitude,
  };

  const geofenceCenter = {
    lat: latitude,
    lng: longitude,
  };

  return (
    <div>
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        <Circle
          center={geofenceCenter}
          radius={geofenceRadius}
          options={{
            fillColor: "lightblue",
            fillOpacity: 0.2,
            strokeColor: "blue",
            strokeOpacity: 0.5,
          }}
        />
        {markers.map((marker) => (
          <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
          />
        ))}
      </GoogleMap>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Entry/Exit Log</h2>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(entryExitData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default GeofencingMap;
