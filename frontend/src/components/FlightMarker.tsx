'use client';

import L from 'leaflet';

export type LiveFlight = {
  id: number;
  flight_number: string;
  origin: string;
  destination: string;
  route: string;
  lat: number;
  lng: number;
  speed: number;
  altitude: number;
  status: string;
  heading: number;
  delay_minutes: number;
  updated_at?: string;
};

export function createAircraftIcon(heading: number, status: string, active = false) {
  const statusColor =
    status === 'Delayed' ? '#fb7185' : status === 'Landed' ? '#94a3b8' : status === 'Boarding' ? '#38bdf8' : '#22d3ee';

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;transform:rotate(${heading}deg);transform-origin:center;">
        <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(34,211,238,0.08));box-shadow:0 0 18px ${statusColor}55, 0 0 40px ${statusColor}22;border:1px solid ${active ? '#67e8f9' : 'rgba(255,255,255,0.5)'};backdrop-filter:blur(6px);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16V14L13 8V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V8L2 14V16L10 13.5V19L7.5 20.5V22L11.5 21L15.5 22V20.5L13 19V13.5L21 16Z" fill="white" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export function buildTooltipContent(flight: LiveFlight) {
  return `
    <div style="min-width:180px;padding:10px 12px">
      <div style="font-size:14px;font-weight:800;color:#e2e8f0;letter-spacing:.02em">${flight.flight_number}</div>
      <div style="margin-top:4px;font-size:11px;font-weight:700;color:#67e8f9;text-transform:uppercase;letter-spacing:.22em">${flight.route}</div>
      <div style="margin-top:8px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;font-size:11px;color:#cbd5e1">
        <div><span style="color:#94a3b8;text-transform:uppercase;letter-spacing:.16em">Speed</span><br/>${flight.speed.toFixed(0)} mph</div>
        <div><span style="color:#94a3b8;text-transform:uppercase;letter-spacing:.16em">Altitude</span><br/>${flight.altitude.toFixed(0)} ft</div>
      </div>
      <div style="margin-top:8px;font-size:11px;font-weight:700;color:${flight.status === 'Delayed' ? '#fb7185' : '#67e8f9'};text-transform:uppercase;letter-spacing:.2em">${flight.status}${flight.delay_minutes > 0 ? ` • +${flight.delay_minutes}m` : ''}</div>
    </div>
  `;
}
