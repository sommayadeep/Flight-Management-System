class SoundManager {
  constructor() {
    this.sounds = {
      engineStartup: null,
      ambienceFlight: null,
      takeoff: null,
      welcome: null,
      readyToDepart: null,
    }
    this.isMuted = localStorage.getItem('soundMuted') === 'true'
    this.audioCtx = null
    this.ambientNodes = null
    this.playedOnce = {
      welcome: false
    }
  }

  init() {
    // Create audio elements for different sounds
    this.sounds.engineStartup = new Audio('/sounds/engine-startup.mp3')
    this.sounds.ambienceFlight = new Audio('/sounds/ambient-flight.mp3')
    this.sounds.takeoff = new Audio('/sounds/takeoff.mp3')
    this.sounds.welcome = new Audio('/afterlogin.mp3')
    this.sounds.welcome.preload = 'auto'
    this.sounds.readyToDepart = new Audio('/afterbooking.mp3')
    this.sounds.readyToDepart.preload = 'auto'

    // Set properties
    Object.keys(this.sounds).forEach(key => {
      const sound = this.sounds[key]
      if (sound) {
        // High volume for the user's pilot files
        sound.volume = (key === 'welcome' || key === 'readyToDepart') ? 0.9 : 0.3
      }
    })

    this.sounds.ambienceFlight.loop = true
    this.sounds.ambienceFlight.volume = 0.1

    if (!this.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (Ctx) this.audioCtx = new Ctx()
    }
  }

  async ensureUnlocked() {
    if (!this.audioCtx) return
    if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume()
      } catch (_) {
        // Ignore browser gesture unlock errors.
      }
    }
  }

  async unlockAudio() {
    await this.ensureUnlocked()
    // Test sound briefly or just resume context
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume()
    }
    // Check SpeechSynthesis
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }

  playTone({ freq = 220, duration = 0.2, type = 'sine', gain = 0.05 }) {
    if (!this.audioCtx || this.isMuted) return
    const now = this.audioCtx.currentTime
    const osc = this.audioCtx.createOscillator()
    const amp = this.audioCtx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    amp.gain.setValueAtTime(0, now)
    amp.gain.linearRampToValueAtTime(gain, now + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(amp)
    amp.connect(this.audioCtx.destination)
    osc.start(now)
    osc.stop(now + duration)
  }

  playFallback(soundName) {
    // Fallbacks removed per user request to only use real MP3 files.
    console.warn(`[SoundManager] No audio file found for: ${soundName}. Fallback disabled.`);
  }

  play(soundName) {
    console.log(`[SoundManager] Attempting to play: ${soundName}`)
    if (this.isMuted || !this.sounds[soundName]) return

    // Prevent double-playing the welcome message
    if (soundName === 'welcome' && this.playedOnce.welcome) {
      console.log(`[SoundManager] Welcome already played this session. Skipping.`);
      return;
    }

    const sound = this.sounds[soundName]
    
    // Many stock voiceovers have a slight silent delay. We skip the first 0.8s for the welcoming voice.
    sound.currentTime = soundName === 'welcome' ? 0.8 : 0
    
    sound.play().then(() => {
      if (soundName === 'welcome') this.playedOnce.welcome = true;
    }).catch(() => {
      this.playFallback(soundName)
    })
  }

  stop(soundName) {
    if (!this.sounds[soundName]) return
    this.sounds[soundName].pause()
    this.sounds[soundName].currentTime = 0
  }

  playAmbience() {
    if (this.isMuted) return
    if (this.sounds.ambienceFlight) {
      this.sounds.ambienceFlight.play().catch(() => {
        console.warn('[SoundManager] Ambience audio file not found. Ambient fallback disabled.');
      })
    }
  }

  stopAmbience() {
    if (this.sounds.ambienceFlight) {
      this.sounds.ambienceFlight.pause()
    }
    if (this.ambientNodes) {
      const now = this.audioCtx ? this.audioCtx.currentTime : 0
      try {
        this.ambientNodes.gain.gain.cancelScheduledValues(now)
        this.ambientNodes.gain.gain.setValueAtTime(this.ambientNodes.gain.gain.value, now)
        this.ambientNodes.gain.gain.linearRampToValueAtTime(0.0001, now + 0.3)
        this.ambientNodes.osc.stop(now + 0.35)
      } catch (_) {
        // Ignore stop errors from already-stopped nodes.
      }
      this.ambientNodes = null
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    localStorage.setItem('soundMuted', this.isMuted.toString())
    return this.isMuted
  }

  getMuteState() {
    return this.isMuted
  }
}

export default new SoundManager()
