"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icon in Next.js
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  });
};

interface LocationMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'spk' | 'borrowPit' | string;
}

interface DashboardMapProps {
  locations: LocationMarker[];
  center?: [number, number]; // [latitude, longitude]
  zoom?: number;
}

export default function DashboardMap({ 
  locations = [], 
  center = [-0.789275, 113.921327], // Default center of Indonesia
  zoom = 5 
}: DashboardMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcon();
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>;

  // If there are locations, center the map on the first one
  if (locations.length > 0) {
    const firstValidLocation = locations.find(loc => loc.latitude && loc.longitude);
    if (firstValidLocation) {
      center = [firstValidLocation.latitude, firstValidLocation.longitude];
      zoom = 7; // Closer zoom when we have actual data
    }
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.filter(loc => loc.latitude && loc.longitude).map((location) => (
          <Marker 
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={getMarkerIcon(location.type)}
          >
            <Popup>
              <div className="dark:bg-gray-800 dark:text-white p-1">
                <strong>{location.name}</strong>
                <p>Type: {location.type === 'spk' ? 'SPK Location' : 'Borrow Pit'}</p>
                <p>Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// Custom marker icons based on type
function getMarkerIcon(type: string) {
  const iconUrl = type === 'spk' 
    ? '/images/marker-icon-blue.png'
    : '/images/marker-icon-red.png';
    
  return new L.Icon({
    iconUrl,
    iconRetinaUrl: iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
}
