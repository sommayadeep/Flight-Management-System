import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Play } from 'lucide-react'
import { bookingAPI, flightAPI } from './utils/api'
import SoundManager from './utils/SoundManager'
import { useAuth } from './contexts/AuthContext'
import './index.css'

// Import components
import Navbar from './components/Navbar'
import FlightSearch from './components/FlightSearch'
import FlightList from './components/FlightList'
import BookingModal from './components/BookingModal'
import CinematicOverlay from './components/CinematicOverlay'

const EXPERIENCE = [
  { title: 'Live Cabin Stream', desc: 'Full-screen simulated window seat with atmospheric audio rendered in 3D space.', metric: '4K / 60fps' },
  { title: 'Haptic-friendly UI', desc: 'Large hit targets, depth, and motion that respond to scroll velocity.', metric: '8ms latency' },
  { title: 'Dynamic Parallax', desc: 'Layered horizons glide at different depths for real flight feel.', metric: '3-layer depth' },
]

const TIMELINE = [
  { label: 'Discover', detail: 'Search INR fares across domestic + international partners, backed by MongoDB.', tag: 'Step 01' },
  { label: 'Verify', detail: 'Google OAuth + email verification keeps accounts trusted before purchase.', tag: 'Step 02' },
  { label: 'Simulate', detail: 'Preview cabin lighting, ambience, and seat pitch inside the fly-through.', tag: 'Step 03' },
  { label: 'Fly Ready', detail: 'Boarding pass and lounge QR delivered with adaptive brightness.', tag: 'Step 04' },
]

const SAMPLE_FLIGHTS = [
  { id: 'AI217', source: 'Mumbai (BOM)', destination: 'Delhi (DEL)', departure_time: '21:10 IST', duration: '2h 05m', fare: 6499, available_seats: 8, gate: 'A06', status: 'Boarding' },
  { id: '6E403', source: 'Bengaluru (BLR)', destination: 'Mumbai (BOM)', departure_time: '20:15 IST', duration: '1h 35m', fare: 5599, available_seats: 14, gate: 'C14', status: 'On Time' },
  { id: 'BA118', source: 'Bengaluru (BLR)', destination: 'London (LHR)', departure_time: '07:05 IST', duration: '10h 35m', fare: 62499, available_seats: 5, gate: 'E08', status: 'On Time' },
  { id: 'SQ401', source: 'Delhi (DEL)', destination: 'Singapore (SIN)', departure_time: '09:00 IST', duration: '6h 00m', fare: 31299, available_seats: 7, gate: 'T3-F05', status: 'Boarding' },
]

function statusTone(status) {
  if (status === 'Boarding') return 'bg-emerald-400/20 text-emerald-200'
  if (status === 'Final Call') return 'bg-amber-400/20 text-amber-100'
  return 'bg-sky-400/15 text-sky-100'
}

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

function App() {
  const { user, login, logout: authLogout } = useAuth()
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [showBooking, setShowBooking] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [filters, setFilters] = useState({ from: 'Mumbai', to: 'Delhi', passengers: 1, date: today })
  const [hasSearched, setHasSearched] = useState(false)
  const [isMuted, setIsMuted] = useState(SoundManager.getMuteState())
  const [flights, setFlights] = useState([])
  const [loadingFlights, setLoadingFlights] = useState(false)
  const [flightError, setFlightError] = useState('')
  const [usedSample, setUsedSample] = useState(false)
  const [bookingForm, setBookingForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    seat: '', 
    cabin_class: 'economy', 
    meal_preference: '' 
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingStatus, setBookingStatus] = useState(null)
  const [isCinematicOpen, setIsCinematicOpen] = useState(false)
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false)
  
  // Track if we need an interaction gate after OAuth
  const needsGate = user && !isAudioUnlocked && window.location.pathname.includes('/auth/callback')

  useEffect(() => {
    SoundManager.init()
  }, [])

  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!isAudioUnlocked) {
        await SoundManager.unlockAudio()
        setIsAudioUnlocked(true)
      }
    }
    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)
    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [isAudioUnlocked])

  useEffect(() => {
    if (isAudioUnlocked && user) {
      console.log('[App] Audio unlocked and user present, playing welcome...')
      // It's handled immediately in AuthContext now, but this is a safe fallback
      // We removed the duplicate SoundManager.play('welcome') here to prevent double calls.
    }
  }, [isAudioUnlocked, !!user])

  useEffect(() => {
    if (!isMuted) {
      SoundManager.playAmbience()
    } else {
      SoundManager.stopAmbience()
    }
  }, [isMuted])

  useEffect(() => {
    fetchFlights(filters, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchFlights = async (query, silent = false) => {
    setFlightError('')
    setLoadingFlights(!silent)
    try {
      const response = await flightAPI.search({
        source: query.from,
        destination: query.to,
        date: query.date,
        passengers: query.passengers,
      })
      const live = Array.isArray(response.data) ? response.data : []
      if (live.length === 0) {
        setFlights(SAMPLE_FLIGHTS)
        setUsedSample(true)
        setHasSearched(true)
        setFlightError('No live flights returned; showing showcase data.')
      } else {
        setFlights(live)
        setHasSearched(true)
        setUsedSample(false)
        setFlightError('')
      }
      if (!silent) SoundManager.play('takeoff')
    } catch (error) {
      setFlights(SAMPLE_FLIGHTS)
      setUsedSample(true)
      setHasSearched(true)
      setFlightError('Live flight feed unavailable; showing showcase data.')
    } finally {
      setLoadingFlights(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchFlights(filters)
  }

  const toggleSound = () => {
    const next = SoundManager.toggleMute()
    setIsMuted(next)
    if (!next) SoundManager.playAmbience()
    if (next) SoundManager.stopAmbience()
  }

  const startCinematic = () => {
    setIsCinematicOpen(true)
    if (isMuted) {
      const next = SoundManager.toggleMute()
      setIsMuted(next)
    }
    SoundManager.play('engineStartup')
  }

  const handleGoogleAuth = () => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    window.location.href = `${base}/api/auth/google`
  }

  const handleBookFlight = (flight) => {
    setSelectedFlight(flight)
    setBookingForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      seat: flight?.available_seats ? `${Math.max(1, Math.min(30, flight.available_seats))}A` : '',
      cabin_class: 'economy',
      meal_preference: ''
    })
    setBookingStatus(null)
    setShowBooking(true)
  }

  const handleCloseBooking = () => {
    setShowBooking(false)
    setSelectedFlight(null)
    setBookingStatus(null)
  }

  const handleConfirmBooking = async () => {
    if (!selectedFlight) return
    if (!bookingForm.name || !bookingForm.email || !bookingForm.seat) {
      setBookingStatus('Please enter name, email, and seat.')
      return
    }

    setBookingLoading(true)
    setBookingStatus(null)

    const isSample = usedSample || !Number(selectedFlight.id || selectedFlight.flight_number)
    if (isSample) {
      setTimeout(() => {
        SoundManager.play('readyToDepart')
        setBookingStatus(`Booking confirmed · Ref BK${Math.random().toString(36).slice(2, 8).toUpperCase()}`)
        setBookingLoading(false)
      }, 600)
      return
    }

    try {
      const payload = {
        flight_id: selectedFlight.id || selectedFlight.flight_number,
        seat_number: bookingForm.seat,
        passenger_name: bookingForm.name,
        passenger_email: bookingForm.email,
        passenger_phone: bookingForm.phone,
        cabin_class: bookingForm.cabin_class,
        meal_preference: bookingForm.meal_preference
      }
      const res = await bookingAPI.create(payload)
      const ref = res.data?.booking_id || res.data?.id || 'BOOKED'
      SoundManager.play('readyToDepart')
      setBookingStatus(`Booking confirmed · Ref ${ref}`)
    } catch (error) {
      const detail = error.response?.data?.detail || 'Booking failed. Please retry.'
      setBookingStatus(typeof detail === 'string' ? detail : 'Booking failed. Check console.')
    } finally {
      setBookingLoading(false)
    }
  }

  const loadSample = () => {
    setFlights(SAMPLE_FLIGHTS)
    setHasSearched(true)
    setUsedSample(true)
    setFlightError('')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0c11] text-white font-sans">
      <BackgroundVideo />

      {/* Interaction Gate for Audio Autoplay Policy */}
      <AnimatePresence>
        {needsGate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={async () => {
              await SoundManager.unlockAudio();
              setIsAudioUnlocked(true);
              SoundManager.play('welcome');
              window.history.replaceState({}, document.title, '/');
            }}
          >
            <div className="text-center space-y-6 max-w-md px-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse shadow-lg shadow-sky-500/20">
                <Sparkles className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-3xl font-light text-white tracking-wide">Identity Confirmed</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Welcome back, {user.name}. Please tap anywhere to initialize the immersive booking studio and audio systems.
              </p>
              <button className="px-8 py-3 mt-8 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-medium tracking-wide transition border border-sky-500/30">
                Enter Studio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmosphere overlays */}
      <div className="fixed inset-0 pointer-events-none mix-blend-soft-light opacity-50 noise" />
      <div className="fixed inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-400/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="parallax-grid" aria-hidden />

      {/* HUD lines */}
      <div className="fixed top-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <section className="relative max-w-6xl mx-auto px-4 pb-20 pt-10 lg:pt-14">
        <Navbar 
            handleGoogleAuth={handleGoogleAuth} 
            toggleSound={toggleSound} 
            isMuted={isMuted} 
            startCinematic={startCinematic} 
            user={user}
            logout={authLogout}
        />

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Hero />
          <FlightSearch 
            filters={filters} 
            setFilters={setFilters} 
            handleSearch={handleSearch} 
            loadingFlights={loadingFlights} 
          />
        </div>

        <FlightTicker flights={flights} />

        <FlightList 
          flights={flights}
          hasSearched={hasSearched}
          loadingFlights={loadingFlights}
          flightError={flightError}
          usedSample={usedSample}
          loadSample={loadSample}
          handleBookFlight={handleBookFlight}
          formatINR={formatINR}
          statusTone={statusTone}
        />

        <ExperienceSection />
        <SimulationSection startCinematic={startCinematic} />
        <TimelineSection />
      </section>

      <BookingModal 
        showBooking={showBooking}
        selectedFlight={selectedFlight}
        handleCloseBooking={handleCloseBooking}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        bookingLoading={bookingLoading}
        bookingStatus={bookingStatus}
        handleConfirmBooking={handleConfirmBooking}
        formatINR={formatINR}
        user={user}
      />

      <CinematicOverlay 
        isOpen={isCinematicOpen}
        onClose={() => setIsCinematicOpen(false)}
        isMuted={isMuted}
        toggleMute={toggleSound}
      />
    </main>
  )
}

// Inline helper components for cleaner structure
const BackgroundVideo = () => (
    <div className="fixed inset-0 -z-10">
      <video className="w-full h-full object-cover opacity-90" autoPlay loop muted playsInline>
        <source src="/flight-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#120b0b]/40 to-[#0a0c11]/90" />
    </div>
)

const Hero = () => (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.25em] text-amber-200">
        <Sparkles className="w-4 h-4 text-sky-300" />
        India Domestic + International · IST
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white drop-shadow">
        A luxury-grade, India-first flight desk.
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-200 max-w-xl">
        Real video backdrops, spatial sound, and Google OAuth ready for production.
      </motion.p>
    </div>
)

const FlightTicker = ({ flights }) => {
    const tickerFlights = flights.length ? [...flights, ...flights] : []
    return (
        <div className="mt-12">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg h-12 flex items-center">
                <div className="flex animate-ticker-slow whitespace-nowrap">
                    {tickerFlights.map((f, i) => (
                        <div key={i} className="px-6 text-sm text-slate-300">
                            {f.source} → {f.destination} • {f.departure_time}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const ExperienceSection = () => (
    <div className="mt-16 grid md:grid-cols-3 gap-6">
        {EXPERIENCE.map(item => (
            <div key={item.title} className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-2">{item.metric}</p>
                <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                <p className="text-slate-300 text-sm">{item.desc}</p>
            </div>
        ))}
    </div>
)

const SimulationSection = ({ startCinematic }) => (
    <div className="mt-16 p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
            <h3 className="text-3xl font-semibold">Full-screen simulation</h3>
            <p className="text-slate-300">Experience the flight before you book with our 3D cabin simulation.</p>
            <button onClick={startCinematic} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 font-semibold">
                <Play className="w-4 h-4" /> Launch Simulation
            </button>
        </div>
        <div className="flex-1 w-full aspect-video rounded-2xl overflow-hidden border border-white/10">
            <video src="/flight-bg.mp4" autoPlay muted loop className="w-full h-full object-cover" />
        </div>
    </div>
)

const TimelineSection = () => (
    <div className="mt-16 space-y-8 pl-6 border-l border-white/10">
        {TIMELINE.map(step => (
            <div key={step.tag} className="relative">
                <div className="absolute -left-[31px] top-2 w-2.5 h-2.5 rounded-full bg-sky-400" />
                <h4 className="font-semibold">{step.label}</h4>
                <p className="text-slate-400 text-sm">{step.detail}</p>
            </div>
        ))}
    </div>
)

export default App
