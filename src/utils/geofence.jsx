import { isPointInPolygon } from "geolib";

export const isInsideGeofence = (location, geofence) => {
  return isPointInPolygon(location, geofence);
};
