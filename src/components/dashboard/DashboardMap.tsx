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

// Custom marker icons based on type using SVG directly
function getMarkerIcon(type: string) {
  // SVG untuk lokasi SPK (biru)
  const spkSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#2563eb" />
      <circle cx="12" cy="12" r="5" fill="white" />
    </svg>
  `;

  // SVG untuk Borrow Pit (merah)
  const borrowPitSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#dc2626" />
      <path d="M7 12 L12 7 L17 12 L12 17 Z" fill="white" />
    </svg>
  `;

  const svgString = type === 'spk' ? spkSvg : borrowPitSvg;
  const iconUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  return L.icon({
    iconUrl,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
    tooltipAnchor: [16, -28]
  });
}
