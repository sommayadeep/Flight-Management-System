import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock } from 'lucide-react'

const FlightList = ({ 
  flights, 
  hasSearched, 
  loadingFlights, 
  flightError, 
  usedSample, 
  loadSample, 
  handleBookFlight, 
  formatINR, 
  statusTone 
}) => {
  return (
    <>
      <div className="mt-12 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Curated Results</p>
          <h2 className="text-2xl font-semibold text-white">Flights tuned to your route</h2>
        </div>
        <div className="text-sm text-slate-300 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
          Ultra-low latency pricing feed
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={loadSample}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 text-sm text-amber-100"
        >
          Load showcase flights
        </button>
        {usedSample && <span className="text-xs text-amber-200">Sample data in view · connect live API for production</span>}
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {(hasSearched ? flights : []).map((flight) => (
            <motion.div
              key={flight.id || `${flight.source}-${flight.destination}-${flight.departure_time}`}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 shadow-xl shadow-black/30"
            >
              <div className="absolute inset-0 shimmer opacity-30" />
              <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-[0.25em] text-slate-400">{flight.id || flight.flight_number || 'LIVE'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] ${statusTone(flight.status || flight.flight_status || 'On Time')}`}>
                      {flight.status || flight.flight_status || 'On Time'}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-white">{flight.source || flight.from}</p>
                  <p className="text-lg text-slate-200">→ {flight.destination || flight.to}</p>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Clock className="w-4 h-4 text-sky-300" />
                    {(flight.departure_time || flight.departure || '—')} · {(flight.duration || flight.duration_text || '—')}
                    {flight.gate && <span className="text-slate-500">Gate {flight.gate}</span>}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-3xl font-bold text-sky-200">{formatINR(Number(flight.price || flight.fare || 0))}</p>
                  <p className="text-xs text-slate-400">{(flight.available_seats || flight.seats_left || flight.seats || '–')} seats left</p>
                  <button 
                    onClick={() => handleBookFlight(flight)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-sm font-semibold shadow-lg shadow-sky-900/40">
                    Reserve Seat
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1 h-1 rounded-full bg-sky-400" />
                Cabin preview streaming • Priority boarding included
              </div>
            </motion.div>
          ))}
          {!loadingFlights && hasSearched && flights.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 text-center text-slate-300 py-10 border border-dashed border-white/10 rounded-2xl"
            >
              No flights returned for this query. Try changing route or date.
            </motion.div>
          )}
        </AnimatePresence>
        {flightError && (
          <div className="col-span-2 text-center text-rose-200 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            {flightError}
          </div>
        )}
      </div>
    </>
  )
}

export default FlightList
