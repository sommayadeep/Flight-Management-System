'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { flightAPI } from '@/lib/api';
import dynamic from 'next/dynamic';
import { Plane, Radar, MapPin } from 'lucide-react';
import clsx from 'clsx';

const DynamicMap = dynamic(() => import('./FlightMap').then((mod) => mod.FlightMap), {
  loading: () => <MapSkeleton />,
  ssr: false,
});

function MapSkeleton() {
  return (
    <div className="flex h-[28rem] items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(2,6,23,0.42)] backdrop-blur-xl">
      <div className="text-center">
        <Radar className="mx-auto mb-3 h-8 w-8 text-cyan-300" />
        <p className="text-sm text-slate-400">Loading live radar...</p>
      </div>
    </div>
  );
}

export const FlightTracking: React.FC = () => {
  const [flights, setFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await flightAPI.getLiveFlights();
        setFlights(data);
        setSelectedFlight((currentSelected: any) => {
          if (!currentSelected) return data[0] ?? null;
          return data.find((flight: any) => flight.id === currentSelected.id) ?? data[0] ?? null;
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching flights:', error);
        setLoading(false);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 1000);
    return () => clearInterval(interval);
  }, []);

  const liveStats = useMemo(() => {
    const total = flights.length;
    const delayed = flights.filter((flight) => flight.status === 'Delayed').length;
    const airborne = flights.filter((flight) => flight.status === 'In Flight').length;
    return { total, delayed, airborne };
  }, [flights]);

  return (
    <section
      id="tracking"
      className="relative w-full overflow-hidden bg-slate-950 px-4 py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.05),transparent_30%),radial-gradient(circle_at_right,rgba(37,99,235,0.03),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-300 font-black">Tracking</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Flight Tracking Map
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Monitor real-time flight positions with live interpolation and route-aware motion
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="relative h-[34rem] overflow-hidden rounded-[28px] border border-cyan-400/10 bg-slate-950/80 p-3 shadow-[0_24px_90px_rgba(2,6,23,0.55)] ring-1 ring-white/5 transition-all duration-300 hover:shadow-[0_28px_100px_rgba(6,182,212,0.12)]">
            {!loading ? (
              <DynamicMap
                flights={flights}
                selectedFlight={selectedFlight}
                onSelectFlight={setSelectedFlight}
              />
            ) : (
              <MapSkeleton />
            )}
          </div>

          <aside className="surface-card flex flex-col border border-cyan-400/10 bg-slate-950/80 p-6 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300 font-black">Fleet List</p>
                <h3 className="mt-2 text-2xl font-extrabold text-white">Live Flights</h3>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
                <MapPin className="mr-1 inline-block h-3.5 w-3.5" />
                Live
              </div>
            </div>

            <div className="mt-6 space-y-2 max-h-[32rem] overflow-y-auto pr-2 no-scrollbar">
              {flights.map((flight) => (
                <button
                  key={flight.id}
                  onClick={() => setSelectedFlight(flight)}
                  className={clsx(
                    'w-full rounded-[16px] border p-4 text-left transition-all duration-300 active:scale-[0.98]',
                    selectedFlight?.id === flight.id
                      ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.08)]'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white shadow-sm'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={clsx('font-bold tracking-tight', selectedFlight?.id === flight.id ? 'text-cyan-100' : 'text-slate-100')}>{flight.flight_number}</div>
                      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                        {flight.origin} → {flight.destination}
                      </div>
                    </div>
                      <Plane className={clsx('h-4 w-4 transition-colors', selectedFlight?.id === flight.id ? 'text-cyan-300' : 'text-slate-400')} />
                  </div>
                </button>
              ))}
            </div>

            {selectedFlight && (
                <div className="mt-5 rounded-[18px] border border-cyan-400/10 bg-white/[0.04] p-4 shadow-sm backdrop-blur-md">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-black">Selected Aircraft</h4>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Altitude</p>
                      <p className="text-sm font-bold text-white">{selectedFlight.altitude.toFixed(0)} ft</p>
                  </div>
                  <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Speed</p>
                      <p className="text-sm font-bold text-white">{selectedFlight.speed.toFixed(0)} mph</p>
                  </div>
                  <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Heading</p>
                      <p className="text-sm font-bold text-white">{selectedFlight.heading?.toFixed(0) || 0}°</p>
                  </div>
                  <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={clsx('h-1.5 w-1.5 rounded-full', 
                        selectedFlight.status === 'On Time' ? 'bg-emerald-500' : 
                        selectedFlight.status === 'Delayed' ? 'bg-rose-500' : 'bg-blue-500'
                      )} />
                        <p className="text-sm font-bold text-white">{selectedFlight.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">Live</div>
                  <div className="mt-2 text-2xl font-black text-white">{liveStats.total}</div>
                </div>
                <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">Airborne</div>
                  <div className="mt-2 text-2xl font-black text-cyan-300">{liveStats.airborne}</div>
                </div>
                <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">Delayed</div>
                  <div className="mt-2 text-2xl font-black text-rose-300">{liveStats.delayed}</div>
                </div>
              </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default FlightTracking;
