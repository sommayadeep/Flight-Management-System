'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Flight = {
  id: number;
  flight_number: string;
  origin: string;
  destination: string;
  status: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  delay_minutes: number;
};

type TrackingMapProps = {
  flights: Flight[];
  selectedFlight?: Flight | null;
  onSelectFlight?: (flight: Flight) => void;
};

const AIRPORTS: Record<string, [number, number]> = {
  JFK: [40.6413, -73.7781],
  LAX: [33.9425, -118.4081],
  ORD: [41.9742, -87.9073],
  DFW: [32.8975, -97.038],
  DEN: [39.8561, -104.6737],
  SFO: [37.6213, -122.379],
  MIA: [25.7959, -80.287],
  BOS: [42.3656, -71.0096],
  LAS: [36.084, -115.1537],
  SJC: [37.3382, -121.9052],
};

const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

function getAirportCoords(code: string, fallback: [number, number]) {
  return AIRPORTS[code] || fallback;
}

function createFlightIcon(isActive: boolean) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:9999px;background:${isActive ? '#2563eb' : '#94a3b8'};box-shadow:0 4px 12px rgba(37,99,235,0.25);border:2px solid white;">
        <div style="width:6px;height:6px;border-radius:9999px;background:white;"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export const TrackingMap: React.FC<TrackingMapProps> = ({ flights, selectedFlight, onSelectFlight }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pathsLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeFlightId, setActiveFlightId] = useState<number | null>(selectedFlight?.id ?? null);

  const orderedFlights = useMemo(() => flights.slice().sort((left, right) => left.flight_number.localeCompare(right.flight_number)), [flights]);

  useEffect(() => {
    setActiveFlightId(selectedFlight?.id ?? orderedFlights[0]?.id ?? null);
  }, [orderedFlights, selectedFlight]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      worldCopyJump: true,
    }).setView([38, -96], 4);

    mapRef.current = map;

    L.tileLayer(lightTileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    pathsLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      pathsLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    const pathsLayer = pathsLayerRef.current;
    if (!map || !markersLayer || !pathsLayer) return;

    markersLayer.clearLayers();
    pathsLayer.clearLayers();

    orderedFlights.forEach((flight) => {
      const isActive = flight.id === activeFlightId;
      const position: [number, number] = [flight.latitude, flight.longitude];
      const originCoords = getAirportCoords(flight.origin, position);
      const destinationCoords = getAirportCoords(flight.destination, position);

      const route = L.polyline([originCoords, position, destinationCoords], {
        color: isActive ? '#2563eb' : '#cbd5e1',
        weight: isActive ? 4 : 2,
        opacity: isActive ? 0.9 : 0.6,
        dashArray: '8 10',
        lineCap: 'round',
      }).addTo(pathsLayer);

      const marker = L.marker(position, {
        icon: createFlightIcon(isActive),
        keyboard: false,
      }).addTo(markersLayer);

      marker.bindTooltip(
        `<div style="text-align:left;min-width:140px;padding:8px">
          <div style="font-weight:800;color:#0f172a;font-size:14px">${flight.flight_number}</div>
          <div style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;margin-top:2px">${flight.origin} → ${flight.destination}</div>
          <div style="color:#2563eb;font-size:11px;font-weight:800;margin-top:6px">${flight.status}</div>
        </div>`,
        { 
          direction: 'top', 
          offset: L.point(0, -10), 
          className: 'flight-tooltip-light' 
        }
      );

      marker.on('click', () => {
        setActiveFlightId(flight.id);
        onSelectFlight?.(flight);
      });

      marker.on('mouseover', () => {
        marker.openTooltip();
      });

      marker.on('mouseout', () => {
        marker.closeTooltip();
      });

      if (isActive) {
        map.flyTo(position, 5, { duration: 0.8 });
      }
    });
  }, [activeFlightId, orderedFlights, onSelectFlight]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-slate-100">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.02),transparent_60%)] shadow-inner" />
      <div className="pointer-events-none absolute left-6 top-6 z-20 rounded-full border border-blue-100 bg-white/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 shadow-lg backdrop-blur-md">
        Live Radar
      </div>
    </div>
  );
};

export default TrackingMap;