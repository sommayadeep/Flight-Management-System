import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, Plane } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import SoundManager from '../../utils/SoundManager'

const Login = ({ onSuccess, onSwitchToSignup }) => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(formData)
      SoundManager.play('engineStartup')
      setTimeout(() => onSuccess(user), 1500) // Ignition delay
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-950 via-black/80 to-black flex items-center justify-center z-50 p-4"
    >
      {/* Background video subtle */}
      <video className="absolute inset-0 w-full h-full object-cover opacity-20" autoPlay loop muted>
        <source src="/flight-bg.mp4" type="video/mp4" />
      </video>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mx-auto w-20 h-20 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
          >
            <Plane className="w-10 h-10 text-white drop-shadow-lg" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
            Welcome Aboard
          </h1>
          <p className="text-slate-300">Sign in to access premium booking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-sky-400 focus:bg-white/10 transition"
              placeholder="pilot@skyhigh.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-sky-400 focus:bg-white/10 transition"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Igniting...
              </>
            ) : (
              <>
                <Plane className="w-5 h-5" />
                Clear for Takeoff
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          New pilot?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-sky-400 hover:text-sky-300 font-semibold underline"
            disabled={loading}
          >
            Create Account
          </button>
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Login

