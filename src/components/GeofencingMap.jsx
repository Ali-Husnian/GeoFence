/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useRef, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Polyline,
  Circle,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const geofenceRadius = 10; // in meters
const defaultLatitude = 31.492164;
const defaultLongitude = 74.446499;

function GeofencingMap() {
  const [latitude, setLatitude] = useState(defaultLatitude);
  const [longitude, setLongitude] = useState(defaultLongitude);
  const [markers, setMarkers] = useState([]);
  const [entryExitData, setEntryExitData] = useState([]);
  const [path, setPath] = useState([]);
  const [liveTrackingMarker, setLiveTrackingMarker] = useState(null);
  const [insideGeofence, setInsideGeofence] = useState(false);
  const [directions, setDirections] = useState(null);
  const [distanceDuration, setDistanceDuration] = useState(null);

  const autocompleteRef = useRef();
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDd-nvVSObBhAlLcpUNKW4dRissQVI4hJ4",
    libraries,
  });

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
      setPath((current) => [
        ...current,
        { lat: newMarker.lat, lng: newMarker.lng },
      ]);

      const distance = getDistanceFromLatLonInKm(
        newMarker.lat,
        newMarker.lng,
        defaultLatitude,
        defaultLongitude
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

      // Check if new marker is inside geofence for live tracking
      if (distance < geofenceRadius / 1000) {
        setLiveTrackingMarker({ lat: newMarker.lat, lng: newMarker.lng });
        setInsideGeofence(true);
      } else {
        setInsideGeofence(false);
      }
    },
    [latitude, longitude]
  );

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const newMarker = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        time: new Date(),
      };
      setMarkers((current) => [...current, newMarker]);
      setPath((current) => [
        ...current,
        { lat: newMarker.lat, lng: newMarker.lng },
      ]);

      const distance = getDistanceFromLatLonInKm(
        newMarker.lat,
        newMarker.lng,
        defaultLatitude,
        defaultLongitude
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

      // Check if new marker is inside geofence for live tracking
      if (distance < geofenceRadius / 1000) {
        setLiveTrackingMarker({ lat: newMarker.lat, lng: newMarker.lng });
        setInsideGeofence(true);
      } else {
        setInsideGeofence(false);
      }
    }
  };

  const handleDirectionsResponse = (result, status) => {
    if (status === "OK") {
      setDirections(result);
      const route = result.routes[0].legs[0];
      setDistanceDuration({
        distance: route.distance.text,
        duration: route.duration.text,
      });
    }
  };

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

  const center = {
    lat: latitude,
    lng: longitude,
  };

  const geofenceCenter = {
    lat: latitude,
    lng: longitude,
  };

  const saveDataAsJson = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "entryExitData.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMapTypeChange = () => {
    const map = mapRef.current;
    if (map) {
      const currentMapType = map.getMapTypeId();
      const newMapType = currentMapType === "roadmap" ? "satellite" : "roadmap";
      map.setMapTypeId(newMapType);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceSelect}
      >
        <input
          type="text"
          placeholder="Search a location"
          style={{
            boxSizing: " border-box",
            border: " 1px solid transparent",
            width: "240px",
            height: "32px",
            padding: "0 12px",
            borderRadius: "3px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
            fontSize: "14px",
            outline: "none",
            textOverflow: "ellipses",
            position: "absolute",
            top: "10px",
            left: "50%",
            marginLeft: "-120px",
            zIndex: 1,
          }}
        />
      </Autocomplete>
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={19}
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
        {liveTrackingMarker && insideGeofence && (
          <Marker
            position={liveTrackingMarker}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        )}
        <Polyline
          path={path}
          options={{
            strokeColor: "blue",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
        />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Entry/Exit Log</h2>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(entryExitData, null, 2)}
        </pre>
        <button
          onClick={() => saveDataAsJson(entryExitData)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save Data as JSON
        </button>
        {distanceDuration && (
          <div className="mt-4">
            <h3>Directions Info:</h3>
            <p>Distance: {distanceDuration.distance}</p>
            <p>Duration: {distanceDuration.duration}</p>
          </div>
        )}
      </div>
      <button
        onClick={handleMapTypeChange}
        className="absolute top-4 right-4 bg-white border border-gray-300 px-2 py-1 rounded shadow-md z-10"
      >
        Toggle Satellite
      </button>
    </div>
  );
}

export default GeofencingMap;
