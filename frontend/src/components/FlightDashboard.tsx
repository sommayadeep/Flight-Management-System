'use client';

import React, { useEffect, useState } from 'react';
import { flightAPI } from '@/lib/api';
import { Plane, MapPin, Activity, TimerReset, GaugeCircle } from 'lucide-react';
import clsx from 'clsx';
import { StatCard } from './StatCard';

interface Flight {
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
  departure_time: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'On Time':
      return 'green';
    case 'Delayed':
      return 'red';
    case 'Boarding':
      return 'blue';
    case 'In Flight':
      return 'cyan';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'In Flight':
      return '✈️';
    case 'Boarding':
      return '🚪';
    case 'Delayed':
      return '⏱️';
    default:
      return '✓';
  }
};

export const FlightDashboard: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await flightAPI.getActiveFlights();
        setFlights(data);

        const analyticsData = await flightAPI.getAnalyticsSummary();
        setAnalytics(analyticsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching flights:', error);
        setLoading(false);
      }
    };

    fetchFlights();

    // Refresh every 5 seconds
    const interval = setInterval(fetchFlights, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredFlights =
    filter === 'all' ? flights : flights.filter((f) => f.status === filter);

  const cardGrid = [
    {
      label: 'Total Flights',
      value: analytics?.total_flights ?? '—',
      icon: <Plane className="h-5 w-5" />,
      tone: 'cyan' as const,
      description: 'All active aircraft in the network',
    },
    {
      label: 'In Flight',
      value: analytics?.in_flight ?? '—',
      icon: <Activity className="h-5 w-5" />,
      tone: 'blue' as const,
      description: 'Currently airborne and being tracked',
    },
    {
      label: 'Delayed',
      value: analytics?.delayed ?? '—',
      icon: <TimerReset className="h-5 w-5" />,
      tone: 'red' as const,
      description: 'Flights with active schedule delays',
    },
    {
      label: 'Avg Delay',
      value: analytics ? `${analytics.average_delay.toFixed(1)}m` : '—',
      icon: <GaugeCircle className="h-5 w-5" />,
      tone: 'amber' as const,
      description: 'Fleet-wide delay average',
    },
  ];

  return (
    <section
      id="dashboard"
      className="relative w-full overflow-hidden bg-slate-950 px-4 py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.05),transparent_30%),radial-gradient(circle_at_right,rgba(37,99,235,0.03),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-300 font-bold">Operations</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Flight Dashboard
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Real-time tracking of all active flights with instant updates
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cardGrid.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="mt-12 flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Filter By</span>
          <div className="flex gap-2">
            {['all', 'On Time', 'In Flight', 'Delayed', 'Boarding'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={clsx(
                  'whitespace-nowrap rounded-[14px] border px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95',
                  filter === status
                    ? 'border-cyan-300 bg-cyan-300 text-slate-950 shadow-xl'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/30 hover:text-white'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="glass h-56 rounded-[20px] p-6 animate-pulse">
                  <div className="h-6 rounded bg-white/10 mb-4" />
                  <div className="h-4 rounded bg-white/10 mb-3" />
                  <div className="h-4 rounded bg-white/10" />
                </div>
              ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredFlights.map((flight) => (
              <div
                key={flight.id}
                className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-white">{flight.flight_number}</h3>
                    <p className="mt-1 text-sm text-slate-400 font-medium">Flight ID: {flight.id}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.05] p-3 text-xl shadow-inner">
                    {getStatusIcon(flight.status)}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <div
                    className={clsx(
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
                      flight.status === 'On Time' && 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                      flight.status === 'Delayed' && 'bg-rose-50 text-rose-600 border border-rose-100',
                      flight.status === 'Boarding' && 'bg-blue-50 text-blue-600 border border-blue-100',
                      flight.status === 'In Flight' && 'bg-blue-50 text-blue-600 border border-blue-100',
                      !['On Time', 'Delayed', 'Boarding', 'In Flight'].includes(flight.status) && 'bg-white/5 text-slate-300 border border-white/10'
                    )}
                  >
                    {flight.status}
                  </div>
                  {flight.delay_minutes > 0 && (
                    <div className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-600 border border-rose-100">
                      +{flight.delay_minutes}m delay
                    </div>
                  )}
                </div>

                <div className="mb-4 flex items-center gap-2 text-slate-600 font-medium">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  <span className="text-sm text-slate-300">
                    {flight.origin} → {flight.destination}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Altitude</p>
                    <p className="mt-1 font-bold text-white">
                      {flight.altitude.toFixed(0)} ft
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Speed</p>
                    <p className="mt-1 font-bold text-white">
                      {flight.speed.toFixed(0)} mph
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Latitude</p>
                    <p className="mt-1 font-bold text-slate-300">
                      {flight.latitude.toFixed(2)}°
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Longitude</p>
                    <p className="mt-1 font-bold text-slate-300">
                      {flight.longitude.toFixed(2)}°
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredFlights.length === 0 && !loading && (
          <div className="py-12 text-center">
            <p className="text-lg text-slate-400">No flights found with this filter</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FlightDashboard;
