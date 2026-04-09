import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Phone, Mail, User, CreditCard, ShieldCheck, X } from 'lucide-react'

const BookingModal = ({
  showBooking,
  selectedFlight,
  handleCloseBooking,
  bookingForm,
  setBookingForm,
  bookingLoading,
  bookingStatus,
  handleConfirmBooking,
  formatINR,
  user
}) => {
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    if (showBooking && user) {
        setBookingForm(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
        }))
    }
  }, [showBooking, user, setBookingForm])

  const nextStep = () => setActiveStep(prev => prev + 1)
  const prevStep = () => setActiveStep(prev => prev - 1)

  const basePrice = Number(selectedFlight?.price || selectedFlight?.fare || 0)
  const fuelCharge = Math.floor(basePrice * 0.15)
  const gst = Math.floor((basePrice + fuelCharge) * 0.18)
  const totalPayable = basePrice + fuelCharge + gst

  return (
    <AnimatePresence>
      {showBooking && selectedFlight && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl bg-[#0f1116] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative"
          >
            {/* Indigo Blue Header Strip */}
            <div className="h-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700" />
            
            <button
              onClick={handleCloseBooking}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-semibold text-white mb-2">Complete Booking</h3>
                  <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> Sector: {selectedFlight.source} → {selectedFlight.destination}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span className="flex items-center gap-1"><Clock size={14} /> {selectedFlight.departure_time}</span>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">Flight No.</p>
                    <p className="text-xl font-mono text-sky-400">{selectedFlight.flight_number || selectedFlight.id}</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-4 mb-10">
                {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${activeStep >= step ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                            {step}
                        </div>
                        <span className={`text-xs uppercase tracking-widest ${activeStep >= step ? 'text-white' : 'text-slate-600'}`}>
                            {step === 1 ? 'Details' : step === 2 ? 'Add-ons' : 'Review'}
                        </span>
                        {step < 3 && <div className="w-8 h-px bg-white/10" />}
                    </div>
                ))}
              </div>

              <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-3 space-y-6">
                  {activeStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Passenger Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-sky-500 transition-all outline-none"
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            placeholder="Same as Govt ID"
                            />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Contact Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-sky-500 transition-all outline-none text-sm"
                                value={bookingForm.email}
                                onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                placeholder="Email"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-sky-500 transition-all outline-none text-sm"
                                value={bookingForm.phone || ''}
                                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                placeholder="+91"
                                />
                            </div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Preferred Seat (e.g., 12A)</label>
                        <input
                          className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-sky-500 transition-all outline-none"
                          value={bookingForm.seat || ''}
                          onChange={(e) => setBookingForm({ ...bookingForm, seat: e.target.value.toUpperCase() })}
                          placeholder="Ex: 15F"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-4 block tracking-widest">Cabin Class</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Economy', '6E Prime'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setBookingForm({...bookingForm, cabin_class: c.toLowerCase().replace(' ', '_')})}
                                        className={`p-4 rounded-2xl border transition-all text-left ${bookingForm.cabin_class === c.toLowerCase().replace(' ', '_') ? 'bg-sky-500/10 border-sky-500' : 'bg-white/5 border-white/10'}`}
                                    >
                                        <p className={`font-bold ${bookingForm.cabin_class === c.toLowerCase().replace(' ', '_') ? 'text-white' : 'text-slate-400'}`}>{c}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{c === 'Economy' ? 'Standard seat · 7kg carry-on' : 'Extra legroom · Quick check-in'}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Meal Preference</label>
                            <select 
                                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-sky-500 outline-none"
                                value={bookingForm.meal_preference || ''}
                                onChange={(e) => setBookingForm({...bookingForm, meal_preference: e.target.value})}
                            >
                                <option value="">No Meal</option>
                                <option value="veg_sandwich">Veg Sandwich Combo</option>
                                <option value="non_veg_sandwich">Chicken Junglee Sandwich</option>
                            </select>
                        </div>
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div className="p-6 rounded-2xl bg-sky-500/5 border border-sky-500/20">
                            <h4 className="text-sky-300 font-bold mb-4 flex items-center gap-2"><ShieldCheck size={18} /> Secure Reservation</h4>
                            <div className="space-y-2 text-sm">
                                <p className="flex justify-between"><span className="text-slate-500">Passenger:</span> <span className="text-white font-semibold">{bookingForm.name}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500">Class:</span> <span className="text-white font-semibold capitalize">{bookingForm.cabin_class?.replace('_', ' ')}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500">Contact:</span> <span className="text-white font-semibold">{bookingForm.phone}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-100">
                            <CreditCard size={18} className="text-amber-400" />
                            By continuing, you agree to the conditions of carriage and fare rules.
                        </div>
                    </motion.div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 space-y-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fare Breakup</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Base Fare</span> <span className="text-white">{formatINR(basePrice)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Fuel & Env Surcharge</span> <span className="text-white">{formatINR(fuelCharge)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Integrated GST</span> <span className="text-white">{formatINR(gst)}</span></div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span> <span className="text-sky-400">{formatINR(totalPayable)}</span></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {activeStep < 3 ? (
                        <button 
                            onClick={nextStep}
                            className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-sky-400 hover:text-white transition-all shadow-lg"
                        >
                            Continue
                        </button>
                    ) : (
                        <button 
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                            className="w-full py-4 rounded-2xl bg-sky-500 text-white font-bold hover:bg-sky-400 transition-all shadow-lg shadow-sky-900/40 disabled:opacity-50"
                        >
                            {bookingLoading ? 'Processing…' : 'Pay via Razorpay'}
                        </button>
                    )}
                    {activeStep > 1 && (
                        <button 
                            onClick={prevStep}
                            className="w-full py-3 mt-2 text-slate-400 text-xs hover:text-white transition-colors"
                        >
                            Go back
                        </button>
                    )}
                  </div>
                </div>
              </div>

              {bookingStatus && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 text-center text-sm font-medium"
                >
                    {bookingStatus}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BookingModal
