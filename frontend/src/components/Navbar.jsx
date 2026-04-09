import React from 'react'
import { Plane, Volume2, VolumeX, Play } from 'lucide-react'

const Navbar = ({ handleGoogleAuth, toggleSound, isMuted, startCinematic, user, logout }) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-10">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 border border-white/10 shadow-lg shadow-amber-900/40 overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-60" />
          <Plane className="w-5 h-5 text-amber-100" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Aether Luxe</p>
          <p className="text-lg font-semibold text-white leading-tight">Immersive Booking Studio</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!user ? (
          <button
            onClick={handleGoogleAuth}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400/50 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 533.5 544.3">
              <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.4H272v95.5h146.9c-6.3 34-25.3 62.8-53.9 82v67h87.2c51-47 80.3-116.1 80.3-194.1z" />
              <path fill="#34a853" d="M272 544.3c72.9 0 134-24.1 178.6-65.2l-87.2-67c-24.2 16.3-55 25.8-91.4 25.8-70 0-129.4-47.2-150.6-110.7H31.6v69.7c44.8 88.8 136.7 147.4 240.4 147.4z" />
              <path fill="#fbbc04" d="M121.4 327.2c-10.6-31.9-10.6-66.2 0-98.1V159.4H31.6c-43.4 86-43.4 188.9 0 274.9l89.8-69.1z" />
              <path fill="#ea4335" d="M272 107.7c39.6-.6 77.6 14.9 106.3 42.9l79.1-79.1C404.5 24.1 343.4 0 272 0 168.3 0 76.4 58.6 31.6 147.4l89.8 69.7C142.6 154.9 202 107.7 272 107.7z" />
            </svg>
            <span className="text-sm text-slate-200">Sign in with Google</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm text-amber-200 font-medium whitespace-nowrap">Hello, {user.name.split(' ')[0]}</span>
            <button
              onClick={logout}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-wider text-slate-400 hover:text-white transition"
            >
              Log Out
            </button>
          </div>
        )}
        <button
          onClick={toggleSound}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-amber-100" />}
          <span className="text-sm text-slate-200">{isMuted ? 'Sound Off' : 'Sound On'}</span>
        </button>
        <button
          onClick={startCinematic}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 shadow-lg shadow-amber-900/50 transition"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm font-semibold">Start Cinematic</span>
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        </button>
      </div>
    </div>
  )
}

export default Navbar
