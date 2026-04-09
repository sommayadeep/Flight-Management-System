import React from 'react'
import { MapPin, Calendar, Users, Search, Clock } from 'lucide-react'

const Field = ({ label, value, onChange, icon, placeholder, type = 'text', min }) => (
  <label className="block space-y-1.5">
    <span className="text-xs text-slate-300">{label}</span>
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus-within:border-sky-400/60 transition-all">
      {icon}
      <input
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-white placeholder:text-slate-500 text-sm focus:outline-none"
      />
    </div>
  </label>
)

const FlightSearch = ({ filters, setFilters, handleSearch, loadingFlights }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="relative"
    >
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/40 to-cyan-400/20 blur-3xl" />
      <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 shimmer opacity-40" />
        <form onSubmit={handleSearch} className="relative z-10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Flight Console</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Availability
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              icon={<MapPin className="w-4 h-4 text-sky-300" />}
              label="From"
              value={filters.from}
              placeholder="City or airport"
              onChange={(v) => setFilters({ ...filters, from: v })}
            />
            <Field
              icon={<MapPin className="w-4 h-4 text-sky-300" />}
              label="To"
              value={filters.to}
              placeholder="City or airport"
              onChange={(v) => setFilters({ ...filters, to: v })}
            />
            <Field
              type="date"
              icon={<Calendar className="w-4 h-4 text-sky-300" />}
              label="Date"
              value={filters.date}
              placeholder="Select date"
              onChange={(v) => setFilters({ ...filters, date: v })}
            />
            <Field
              type="number"
              icon={<Users className="w-4 h-4 text-sky-300" />}
              label="Passengers"
              value={filters.passengers}
              min={1}
              onChange={(v) => setFilters({ ...filters, passengers: Number(v) })}
            />
          </div>
          <button
            type="submit"
            className="group w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 shadow-lg shadow-amber-900/40 font-semibold disabled:opacity-60"
            disabled={loadingFlights}
          >
            <Search className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            {loadingFlights ? 'Fetching live fares…' : 'Engage Search (INR · IST)'}
          </button>
        </form>
        <div className="relative z-10 border-t border-white/10 px-6 py-4 flex items-center justify-between text-xs text-slate-300 bg-white/5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-300" />
            Real-time sync every 12 seconds · IST
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-300" />
            Cabin ambience ready
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Re-exporting motion here since it's used in the component
import { motion } from 'framer-motion'
export default FlightSearch
