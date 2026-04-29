'use client';

import React from 'react';

interface Flight {
  id: number;
  flight_number: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  status: string;
  origin: string;
  destination: string;
}

interface MapProps {
  flights: Flight[];
  selectedFlight?: Flight | null;
}

const toMapPosition = (latitude: number, longitude: number) => {
  const x = ((longitude + 180) / 360) * 100;
  const y = ((90 - latitude) / 180) * 100;

  return {
    left: `${Math.max(0, Math.min(100, x))}%`,
    top: `${Math.max(0, Math.min(100, y))}%`,
  };
};

export const Map: React.FC<MapProps> = ({ flights, selectedFlight }) => {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-dark-900 via-dark-950 to-aviation-950 glass">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.20),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(56,189,248,0.16),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.14),transparent_18%)]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gridFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
            </linearGradient>
          </defs>
          {[...Array(6)].map((_, index) => (
            <line
              key={`h-${index}`}
              x1="0"
              y1={index * 120}
              x2="1000"
              y2={index * 120}
              stroke="url(#gridFade)"
              strokeWidth="1"
            />
          ))}
          {[...Array(10)].map((_, index) => (
            <line
              key={`v-${index}`}
              x1={index * 100}
              y1="0"
              x2={index * 100}
              y2="600"
              stroke="url(#gridFade)"
              strokeWidth="1"
            />
          ))}
          <path d="M90,180 L180,120 L260,140 L320,100 L420,120 L500,90 L580,130 L650,110 L740,150 L820,140 L910,180" stroke="rgba(14,165,233,0.35)" strokeWidth="2" fill="none" />
          <path d="M120,420 L220,390 L290,420 L370,380 L460,410 L520,380 L610,430 L690,400 L770,430 L850,390" stroke="rgba(6,182,212,0.26)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="absolute left-4 top-4 z-10 rounded-full border border-cyan-400/30 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">
        Global Flight Radar
      </div>

      <div className="absolute inset-0 z-10">
        {flights.map((flight) => {
          const isSelected = selectedFlight?.id === flight.id;
          const position = toMapPosition(flight.latitude, flight.longitude);

          return (
            <div key={flight.id} className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out" style={position}>
              <div className={`relative flex h-6 w-6 items-center justify-center rounded-full border ${isSelected ? 'border-cyan-300 bg-cyan-400/90 shadow-[0_0_24px_rgba(34,211,238,0.55)]' : 'border-aviation-300 bg-aviation-500/90 shadow-[0_0_18px_rgba(14,165,233,0.35)]'}`}>
                <span className="text-[10px]">✈</span>
                <span className={`absolute inset-0 rounded-full ${isSelected ? 'animate-ping bg-cyan-300/35' : 'animate-pulse bg-cyan-300/20'}`} />
              </div>
              <div className="mt-2 min-w-[120px] rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[10px] text-white shadow-lg backdrop-blur-sm">
                <div className="font-semibold text-cyan-300">{flight.flight_number}</div>
                <div className="text-gray-300">{flight.origin} → {flight.destination}</div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedFlight && (
        <div className="absolute bottom-4 right-4 z-10 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md">
          <div className="mb-1 text-xs uppercase tracking-[0.3em] text-cyan-300">Selected Flight</div>
          <div className="font-semibold">{selectedFlight.flight_number}</div>
          <div className="text-xs text-gray-300">{selectedFlight.origin} → {selectedFlight.destination}</div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-300">
            <span>Status</span>
            <span className="text-cyan-300">{selectedFlight.status}</span>
            <span>Altitude</span>
            <span>{selectedFlight.altitude.toFixed(0)} ft</span>
            <span>Speed</span>
            <span>{selectedFlight.speed.toFixed(0)} mph</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
