'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { flightAPI } from '@/lib/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Label,
} from 'recharts';
import { TrendingUp, Clock, AlertCircle, Activity } from 'lucide-react';
import { StatCard } from './StatCard';

type AnalyticsSummary = {
  total_flights: number;
  in_flight: number;
  boarding: number;
  delayed: number;
  cancelled: number;
  on_time: number;
  average_delay: number;
  total_aircraft_count: number;
};

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analyticsData = await flightAPI.getAnalyticsSummary();
        setAnalytics(analyticsData);

        const predictionsData = await flightAPI.getAllDelayPredictions();
        setPredictions(predictionsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const statusData = useMemo(
    () =>
      analytics
        ? [
            { name: 'On Time', value: analytics.on_time ?? 0, fill: '#22c55e' },
            { name: 'Delayed', value: analytics.delayed ?? 0, fill: '#f97316' },
            { name: 'Cancelled', value: analytics.cancelled ?? 0, fill: '#94a3b8' },
          ]
        : [],
    [analytics]
  );

  const timelineData = useMemo(() => {
    const baseFlights = analytics?.total_flights ?? 5;
    return Array.from({ length: 12 }, (_, index) => ({
      hour: `${index}:00`,
      flights: Math.max(1, Math.round(baseFlights * (0.6 + (index % 4) * 0.12))),
      delays: Math.max(0, Math.round((analytics?.delayed ?? 1) * (0.5 + (index % 3) * 0.18))),
    }));
  }, [analytics]);

  const delayData =
    predictions && predictions.length > 0
      ? predictions.slice(0, 5).map((prediction) => ({
          flight: prediction.flight_number,
          delay: prediction.predicted_delay_minutes,
          probability: (prediction.delay_probability * 100).toFixed(0),
        }))
      : [];

  if (loading) {
    return (
      <section id="analytics" className="w-full bg-slate-950 px-4 py-24">
        <div className="mx-auto max-w-7xl">
            <div className="h-96 rounded-[24px] border border-white/10 bg-white/[0.04] animate-pulse shadow-[0_24px_80px_rgba(2,6,23,0.45)]" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="analytics"
      className="relative w-full overflow-hidden bg-slate-950 px-4 py-24 md:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.06),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.05),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-300 font-black">Insights</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Analytics & Insights
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Predictive analytics and real-time flight performance metrics
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card border border-white/10 bg-slate-950/70 p-6 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Fleet Status</h3>
                <p className="mt-1 text-sm text-slate-400">Centered donut chart with live totals</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                Live
              </div>
            </div>

            <div className="mt-5 h-[22rem]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={112}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={4}
                    animationDuration={1200}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                    <Label
                      value={analytics?.total_flights ?? 0}
                      position="center"
                      fill="#0f172a"
                      style={{ fontSize: '32px', fontWeight: 800 }}
                    />
                    <Label
                      value="Flights"
                      position="center"
                      dy={28}
                      fill="#64748b"
                      style={{
                        fontSize: '12px',
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.96)',
                      border: '1px solid rgba(34, 211, 238, 0.14)',
                      borderRadius: '16px',
                      color: '#e2e8f0',
                      boxShadow: '0 10px 30px rgba(2,6,23,0.35)',
                    }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {statusData.map((item) => (
                <div key={item.name} className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{item.name}</div>
                      <div className="text-xs text-slate-400 font-medium">{item.value} flights</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card border border-white/10 bg-slate-950/70 p-6 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">24-Hour Flight Timeline</h3>
                <p className="mt-1 text-sm text-slate-400">Operational traffic and disruption curve</p>
              </div>
              <TrendingUp className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-5 h-[20rem]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.96)',
                      border: '1px solid rgba(34, 211, 238, 0.14)',
                      borderRadius: '16px',
                      color: '#e2e8f0',
                      boxShadow: '0 10px 30px rgba(2,6,23,0.35)',
                    }}
                  />
                  <Line type="monotone" dataKey="flights" stroke="#22d3ee" strokeWidth={3} dot={false} name="Total Flights" />
                  <Line type="monotone" dataKey="delays" stroke="#fb7185" strokeWidth={3} dot={false} name="Delayed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 surface-card border border-white/10 bg-slate-950/70 p-6 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            Delay Predictions (AI Model)
          </h3>

          {delayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={delayData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis
                  dataKey="flight"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.96)',
                    border: '1px solid rgba(34, 211, 238, 0.14)',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                    boxShadow: '0 10px 30px rgba(2,6,23,0.35)',
                  }}
                  formatter={(value) => (typeof value === 'number' ? `${value.toFixed(0)} min` : value)}
                />
                <Bar dataKey="delay" fill="#2563eb" radius={[10, 10, 0, 0]} name="Predicted Delay (minutes)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-8 text-center text-slate-400">No prediction data available</div>
          )}

          {predictions.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {predictions.slice(0, 3).map((prediction, index) => (
                <div key={index} className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4 shadow-sm">
                  <p className="font-bold text-white">{prediction.flight_number}</p>
                  <p className="text-sm text-slate-400 font-medium">Delay Probability</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                      style={{ width: `${Math.min(prediction.delay_probability * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-blue-600 font-bold">
                    {(prediction.delay_probability * 100).toFixed(0)}% chance
                  </p>
                </div>
              ))}
            </div>
          )}

          {analytics && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                label="Average Delay"
                value={`${analytics.average_delay.toFixed(1)}m`}
                icon={<Clock className="h-5 w-5" />}
                tone="amber"
                description="Fleet-wide average delay"
              />
              <StatCard
                label="On-Time Rate"
                value={`${analytics.total_flights > 0 ? ((analytics.on_time / analytics.total_flights) * 100).toFixed(1) : 0}%`}
                icon={<TrendingUp className="h-5 w-5" />}
                tone="emerald"
                description="Operational punctuality"
              />
              <StatCard
                label="System Health"
                value="99.2%"
                icon={<Activity className="h-5 w-5" />}
                tone="cyan"
                description="Platform availability"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Analytics;