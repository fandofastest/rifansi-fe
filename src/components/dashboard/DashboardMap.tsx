"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
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
  spkNo?: string;
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
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Spread overlapping points slightly so all become visible
  const adjustedLocations = useMemo(() => {
    const byKey = new Map<string, LocationMarker[]>();
    const keyOf = (lat: number, lng: number) => `${lat.toFixed(6)}_${lng.toFixed(6)}`;
    for (const loc of locations) {
      if (!Number.isFinite(loc.latitude) || !Number.isFinite(loc.longitude)) continue;
      const key = keyOf(loc.latitude, loc.longitude);
      const arr = byKey.get(key) || [];
      arr.push(loc);
      byKey.set(key, arr);
    }
    const out: LocationMarker[] = [];
    byKey.forEach((group, _key) => {
      if (group.length === 1) {
        out.push(group[0]);
        return;
      }
      const n = group.length;
      const radiusDeg = 0.0003; // ~30m
      const angleStep = (2 * Math.PI) / n;
      const baseLat = group[0].latitude;
      const cosLat = Math.cos((baseLat * Math.PI) / 180);
      group.forEach((loc, idx) => {
        const angle = idx * angleStep;
        const dLat = radiusDeg * Math.cos(angle);
        const dLng = (radiusDeg * Math.sin(angle)) / (cosLat || 1);
        out.push({ ...loc, latitude: loc.latitude + dLat, longitude: loc.longitude + dLng });
      });
    });
    // Include any items without finite coords unchanged (they will be filtered later)
    for (const loc of locations) {
      if (!Number.isFinite(loc.latitude) || !Number.isFinite(loc.longitude)) out.push(loc);
    }
    return out;
  }, [locations]);

  useEffect(() => {
    fixLeafletIcon();
    setIsMounted(true);
  }, []);

  // Observe visibility so we only create the map when the container is laid out
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  // Guard initial render
  if (!isMounted) {
    return <div ref={containerRef} className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />;
  }

  // If there are locations, set initial center; then FitBoundsOnData will adjust to include all markers
  let initialCenter = center;
  let initialZoom = zoom;
  if (locations.length > 0) {
    const firstValidLocation = locations.find(loc => Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude));
    if (firstValidLocation) {
      initialCenter = [firstValidLocation.latitude, firstValidLocation.longitude];
      initialZoom = 7; // initial; will refit to show all markers
    }
  }

  return (
    <div ref={containerRef} className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Only render the MapContainer once visible to avoid Leaflet layout errors */}
      {isVisible && (
        <MapContainer 
          key={`${initialCenter[0]}-${initialCenter[1]}-${initialZoom}`}
          center={initialCenter} 
          zoom={initialZoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <InvalidateSizeOnMount />
          <FitBoundsOnData
            positions={adjustedLocations
              .filter(loc => Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude))
              // Avoid including [0,0] placeholder in bounds
              .filter(loc => !(loc.latitude === 0 && loc.longitude === 0))
              .map(loc => [loc.latitude, loc.longitude] as [number, number])}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {adjustedLocations
            .filter(loc => Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude))
            .map((location) => (
              <Marker 
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={getMarkerIcon(location.type)}
              >
                <Tooltip direction="top" opacity={0.9} permanent={false}>
                  {location.type === 'spk' ? `No SPK: ${location.spkNo ?? location.name}` : location.name}
                </Tooltip>
                <Popup>
                  <div className="dark:bg-gray-800 dark:text-white p-1">
                    <strong>{location.name}</strong>
                    {location.type === 'spk' && (
                      <p>No SPK: {location.spkNo ?? '-'}</p>
                    )}
                    <p>Type: {location.type === 'spk' ? 'SPK Location' : 'Borrow Pit'}</p>
                    <p>Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      )}
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

// Internal helper component to invalidate map size after mount
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        // ignore
      }
    }, 0);
    return () => clearTimeout(id);
  }, [map]);
  return null;
}

// Fit bounds to include all provided positions whenever they change
function FitBoundsOnData({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (positions && positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (e) {
        // ignore fit errors
      }
    }
  }, [map, positions]);
  return null;
}
