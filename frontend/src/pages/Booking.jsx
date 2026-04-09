import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { bookingAPI } from '../utils/api'
import SoundManager from '../utils/SoundManager'

function Booking({ user, onNavigate }) {
  const [bookingStep, setBookingStep] = useState('video') // video, form, confirmation
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false)
  const [bookingData, setBookingData] = useState({
    seatNumber: '',
    passengerName: user?.name || '',
    passengerEmail: user?.email || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState(null)

  useEffect(() => {
    // Play continue video and transition to form
    const videoTimer = setTimeout(() => {
      setBookingStep('form')
    }, 5000) // Adjust based on video duration

    return () => clearTimeout(videoTimer)
  }, [])

const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await bookingAPI.create({
        flight_id: flight.id,
        seat_number: bookingData.seatNumber,
        passenger_name: bookingData.passengerName,
        passenger_email: bookingData.passengerEmail,
      })

      setBookingId(response.data.booking_id || response.data.id)

      // Trigger plane animation
      setShowPlaneAnimation(true)

      // Play takeoff sound
      SoundManager.play('takeoff')

      // Transition to confirmation
      setTimeout(() => {
        setBookingStep('confirmation')
        setShowPlaneAnimation(false)
      }, 3500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      className="fixed inset-0 z-30"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Video Stage */}
      {bookingStep === 'video' && (
        <motion.div
          className="w-full h-full flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <video
            autoPlay
            className="w-full h-full object-cover"
            onEnded={() => setBookingStep('form')}
          >
            <source src="/start-booking.mp4" type="video/mp4" />
          </video>
        </motion.div>
      )}

      {/* Form Stage */}
      {bookingStep === 'form' && (
        <motion.div
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Continue video in background */}
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              className="w-full h-full object-cover opacity-30"
            >
              <source src="/continue.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
          </div>

          {/* Plane animation overlay */}
          {showPlaneAnimation && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Plane */}
              <motion.div
                className="absolute top-1/2 -left-16 text-6xl filter drop-shadow-lg"
                animate={{
                  x: window.innerWidth + 100,
                  filter: 'drop-shadow(0 0 20px rgba(2, 132, 199, 0.8))',
                }}
                transition={{
                  duration: 3,
                  ease: 'easeInOut',
                }}
              >
                ✈️
              </motion.div>

              {/* Motion blur trail */}
              <motion.div
                className="absolute top-1/2 left-0 -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6, x: window.innerWidth }}
                transition={{
                  duration: 3,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-96 h-20 bg-gradient-to-r from-sky-500 via-sky-400 to-transparent blur-3xl"></div>
              </motion.div>
            </motion.div>
          )}

          {/* Form Card */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h1 className="text-3xl font-bold text-white mb-2">Complete Your Booking</h1>
              <p className="text-slate-300 text-sm mb-6">Fill in your passenger details</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Seat Number */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm text-slate-300 mb-2">Seat Number</label>
                  <input
                    type="text"
                    placeholder="e.g., 12A"
                    value={bookingData.seatNumber}
                    onChange={(e) => setBookingData({ ...bookingData, seatNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-sky-500 focus:bg-white/10"
                    required
                  />
                </motion.div>

                {/* Passenger Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm text-slate-300 mb-2">Passenger Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={bookingData.passengerName}
                    onChange={(e) => setBookingData({ ...bookingData, passengerName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-sky-500 focus:bg-white/10"
                    required
                  />
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={bookingData.passengerEmail}
                    onChange={(e) => setBookingData({ ...bookingData, passengerEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-sky-500 focus:bg-white/10"
                    required
                  />
                </motion.div>

                {/* Error message */}
                {error && (
                  <motion.div
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white font-semibold rounded-lg hover:from-sky-700 hover:to-sky-600 disabled:opacity-50 transition-all mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </motion.button>

                {/* Back Button */}
                <motion.button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="w-full py-3 border border-sky-500/30 text-sky-400 font-semibold rounded-lg hover:bg-sky-500/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Home
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Confirmation Stage */}
      {bookingStep === 'confirmation' && (
        <motion.div
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-6"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-slate-300 text-lg mb-4">Your booking reference: {bookingId}</p>

            <p className="text-slate-400 mb-8 max-w-md">
              A confirmation email has been sent to {bookingData.passengerEmail}
            </p>

            <motion.button
              onClick={() => onNavigate('home')}
              className="px-8 py-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white font-semibold rounded-lg hover:from-sky-700 hover:to-sky-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Booking
