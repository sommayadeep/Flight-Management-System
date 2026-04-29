'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildTooltipContent, createAircraftIcon, LiveFlight } from './FlightMarker';

type FlightMapProps = {
  flights: LiveFlight[];
  selectedFlight?: LiveFlight | null;
  onSelectFlight?: (flight: LiveFlight) => void;
};

const AIRPORTS: Record<string, [number, number]> = {
  DEL: [28.5562, 77.1],
  BOM: [19.0896, 72.8656],
  BLR: [13.1986, 77.7066],
  MAA: [12.9941, 80.1709],
  HYD: [17.2403, 78.4294],
  GOI: [15.38, 73.8278],
  PNQ: [18.582, 73.9197],
  AMD: [23.0779, 72.6347],
  COK: [8.4824, 76.9204],
  CCU: [22.6536, 88.4467],
};

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function getAirportCoords(code: string, fallback: [number, number]) {
  return AIRPORTS[code] || fallback;
}

function getBearing(start: [number, number], end: [number, number]) {
  const startLat = (start[0] * Math.PI) / 180;
  const endLat = (end[0] * Math.PI) / 180;
  const deltaLon = ((end[1] - start[1]) * Math.PI) / 180;
  const y = Math.sin(deltaLon) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function buildArcPath(start: [number, number], end: [number, number], segments = 64) {
  const midLat = (start[0] + end[0]) / 2 + Math.max(Math.abs(start[0] - end[0]), 1.5) * 0.18;
  const midLon = (start[1] + end[1]) / 2;
  const control: [number, number] = [midLat, midLon];

  return Array.from({ length: segments }, (_, index) => {
    const t = index / (segments - 1);
    const oneMinusT = 1 - t;
    const lat = oneMinusT * oneMinusT * start[0] + 2 * oneMinusT * t * control[0] + t * t * end[0];
    const lon = oneMinusT * oneMinusT * start[1] + 2 * oneMinusT * t * control[1] + t * t * end[1];
    return [lat, lon] as [number, number];
  });
}

function buildTooltip(flight: LiveFlight) {
  return buildTooltipContent(flight);
}

function projectLivePosition(flight: LiveFlight) {
  const updatedAtMs = flight.updated_at ? new Date(flight.updated_at).getTime() : Date.now();
  const elapsedHours = Math.max(0, (Date.now() - updatedAtMs) / 3_600_000);

  if (!Number.isFinite(flight.speed) || flight.speed <= 0 || flight.status === 'On Ground') {
    return [flight.lat, flight.lng] as [number, number];
  }

  const headingRad = (flight.heading * Math.PI) / 180;
  const milesTravelled = flight.speed * elapsedHours;
  const latitudeDelta = (milesTravelled * Math.cos(headingRad)) / 69;
  const longitudeScale = Math.max(Math.cos((flight.lat * Math.PI) / 180), 0.15);
  const longitudeDelta = (milesTravelled * Math.sin(headingRad)) / (69 * longitudeScale);

  return [flight.lat + latitudeDelta, flight.lng + longitudeDelta] as [number, number];
}

export const FlightMap: React.FC<FlightMapProps> = ({ flights, selectedFlight, onSelectFlight }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markerRefMap = useRef<Map<number, L.Marker>>(new Map());
  const currentFlightsRef = useRef<LiveFlight[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const selectedFlightId = selectedFlight?.id ?? null;

  const orderedFlights = useMemo(() => {
    return [...flights].sort((left, right) => left.flight_number.localeCompare(right.flight_number));
  }, [flights]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      worldCopyJump: true,
      zoomSnap: 0.25,
    }).setView([20.5937, 78.9629], 5);

    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution:
        '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      markerRefMap.current.forEach((marker) => marker.remove());
      markerRefMap.current.clear();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    orderedFlights.forEach((flight) => {
      const isSelected = selectedFlightId === flight.id;
      const origin = getAirportCoords(flight.origin, [flight.lat, flight.lng]);
      const destination = getAirportCoords(flight.destination, [flight.lat, flight.lng]);
      const hasRealRoute = AIRPORTS[flight.origin] && AIRPORTS[flight.destination] && flight.origin !== flight.destination;

      if (!hasRealRoute) {
        return;
      }

      const arc = buildArcPath(origin, destination);

      const shadow = L.polyline(arc, {
        className: 'route-path route-path--glow',
        color: isSelected ? '#67e8f9' : '#2563eb',
        weight: isSelected ? 7 : 5,
        opacity: 0.18,
      }).addTo(routeLayer);

      const line = L.polyline(arc, {
        className: 'route-path',
        color: isSelected ? '#67e8f9' : '#38bdf8',
        weight: isSelected ? 3.5 : 2.5,
        opacity: isSelected ? 0.95 : 0.72,
        dashArray: '12 16',
      }).addTo(routeLayer);

      shadow.bringToBack();
      line.bringToFront();
    });
  }, [orderedFlights, selectedFlightId]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    const startFlights = currentFlightsRef.current;
    const startMap = new Map(startFlights.map((flight) => [flight.id, flight]));
    const targetMap = new Map(flights.map((flight) => [flight.id, flight]));
    const duration = 1400;
    const startedAt = performance.now();

    if (markerRefMap.current.size === 0) {
      flights.forEach((flight) => {
        const marker = L.marker([flight.lat, flight.lng], {
          icon: createAircraftIcon(flight.heading, flight.status, selectedFlightId === flight.id),
          keyboard: false,
        }).addTo(markerLayer);

        marker.bindTooltip(buildTooltip(flight), {
          direction: 'top',
          offset: L.point(0, -12),
          className: 'flight-tooltip flight-tooltip--dark',
          opacity: 1,
        });

        marker.on('mouseover', () => marker.openTooltip());
        marker.on('mouseout', () => marker.closeTooltip());
        marker.on('click', () => onSelectFlight?.(flight));
        markerRefMap.current.set(flight.id, marker);
      });
      currentFlightsRef.current = flights;
      return;
    }

    const animate = () => {
      targetMap.forEach((targetFlight, flightId) => {
        const marker = markerRefMap.current.get(flightId);
        if (!marker) {
          const projectedPosition = projectLivePosition(targetFlight);
          const fallbackMarker = L.marker(projectedPosition, {
            icon: createAircraftIcon(targetFlight.heading, targetFlight.status, selectedFlightId === targetFlight.id),
            keyboard: false,
          }).addTo(markerLayer);
          fallbackMarker.bindTooltip(buildTooltip(targetFlight), {
            direction: 'top',
            offset: L.point(0, -12),
            className: 'flight-tooltip flight-tooltip--dark',
            opacity: 1,
          });
          fallbackMarker.on('mouseover', () => fallbackMarker.openTooltip());
          fallbackMarker.on('mouseout', () => fallbackMarker.closeTooltip());
          fallbackMarker.on('click', () => onSelectFlight?.(targetFlight));
          markerRefMap.current.set(flightId, fallbackMarker);
          return;
        }

        const projectedPosition = projectLivePosition(targetFlight);
        const interpolatedSpeed = targetFlight.speed;
        const interpolatedAltitude = targetFlight.altitude;
        const heading = targetFlight.heading || getBearing(projectedPosition, getAirportCoords(targetFlight.destination, [targetFlight.lat, targetFlight.lng]));

        marker.setLatLng(projectedPosition);
        marker.setIcon(createAircraftIcon(heading, targetFlight.status, selectedFlightId === flightId));
        marker.setTooltipContent(
          buildTooltip({
            ...targetFlight,
            lat: projectedPosition[0],
            lng: projectedPosition[1],
            speed: interpolatedSpeed,
            altitude: interpolatedAltitude,
            heading,
          })
        );
      });

      currentFlightsRef.current = flights;
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
  }, [flights, onSelectFlight, selectedFlightId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedFlight) return;
    map.flyTo([selectedFlight.lat, selectedFlight.lng], 6, { duration: 0.85 });
  }, [selectedFlight]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-[#020617]">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_40%),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.45))]" />
      <div className="pointer-events-none absolute left-5 top-5 z-20 rounded-full border border-cyan-400/20 bg-slate-950/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.42em] text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md">
        Live Radar
      </div>
    </div>
  );
};

export const TrackingMap = FlightMap;

export default FlightMap;
