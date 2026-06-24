import React from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

// FOR DELIVERY BOY LOCATION ICON
const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// FOR CUSTOMER LOCATION ICON
const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// DELIVERY BOY DASHBOARD - MAP TRACKING PART
function DeliveryBoyTracking({ data }) {
  const deliveryBoyLat = data.deliveryBoyLocation.lat;
  const deliveryBoyLong = data.deliveryBoyLocation.long;
  const customerLat = data.customerLocation.lat;
  const customerLong = data.customerLocation.long;

  // LINE BETWEEN DELIVERY BOY AND CUSTOMER
  const path = [
    [deliveryBoyLat, deliveryBoyLong],
    [customerLat, customerLong],
  ];

  const center = [deliveryBoyLat, deliveryBoyLong];

  return (
    <div className="w-full h-64 mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer
        className="w-full h-full"
        center={center} // focus on those lat and long
        zoom={16} // More zoom More things to see around better 16-18
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[deliveryBoyLat, deliveryBoyLong]}
          icon={deliveryBoyIcon}
        >
          <Popup>Delivery Boy</Popup>
        </Marker>

        <Marker position={[customerLat, customerLong]} icon={customerIcon}>
          <Popup>Customer</Popup>
        </Marker>

        {/* SHOW LINE BETWEEN BOTH  */}
        <Polyline positions={path} color="blue" weight={3} />
      </MapContainer>
    </div>
  );
}

export default DeliveryBoyTracking;
