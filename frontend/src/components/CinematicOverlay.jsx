import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX } from 'lucide-react'
import SoundManager from '../utils/SoundManager'

const CinematicOverlay = ({ isOpen, onClose, isMuted, toggleMute }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      if (!isMuted) {
          SoundManager.play('engineStartup')
      }
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, isMuted])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
        >
          <video
            autoPlay
            loop
            muted={isMuted}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            src="/flight-bg.mp4"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

          {/* HUD Elements */}
          <div className="relative z-10 w-full h-full p-10 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-start pointer-events-auto">
              <div className="space-y-1">
                <p className="text-xs tracking-[0.4em] text-sky-400 font-bold uppercase">Simulation Active</p>
                <h2 className="text-2xl font-light text-white/80">Aether Luxe · Cabin Ambience</h2>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={toggleMute}
                  className="p-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                >
                  {isMuted ? <VolumeX className="text-white" /> : <Volume2 className="text-white" />}
                </button>
                <button 
                  onClick={onClose}
                  className="p-3 rounded-full bg-white/10 border border-white/20 hover:bg-rose-500/40 transition-all"
                >
                  <X className="text-white" />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="w-64 h-1 bg-sky-500/50 rounded-full origin-left overflow-hidden"
                >
                    <motion.div 
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-full h-full bg-sky-300"
                    />
                </motion.div>
                <p className="text-[10px] tracking-[0.5em] text-slate-400 uppercase">Synchronizing Spatial Audio</p>
            </div>

            <div className="flex justify-between items-end">
                <div className="text-[10px] space-y-1 text-slate-500 font-mono uppercase">
                    <p>Altitude: 36,000 FT</p>
                    <p>Velocity: 480 KTS</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-sky-300 tracking-widest uppercase mb-1">Interactive cabin</p>
                    <p className="text-slate-400 text-[10px]">ESC to exit simulation</p>
                </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CinematicOverlay
