/**
 * Interactive Virtual Herbal Garden - Procedural Ambient Nature Audio Synthesizer
 * Generates organic, high-fidelity nature soundscapes using the Web Audio API.
 * No external MP3/WAV dependencies needed; ultra-lightweight, zero latency.
 */

class BotanicalAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.currentPreset = 'morning'; // 'morning', 'monsoon', 'meditation', 'night'
    this.activeNodes = [];
    this.timerIntervals = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  toggle() {
    this.init();
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play(this.currentPreset);
      return true;
    }
  }

  stop() {
    this.isPlaying = false;
    this.timerIntervals.forEach(t => clearInterval(t));
    this.timerIntervals = [];

    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  play(preset = 'morning') {
    this.init();
    this.stop();
    this.currentPreset = preset;
    this.isPlaying = true;

    // Base continuous wind in foliage
    this.createWindBreeze();

    if (preset === 'morning') {
      this.scheduleBirdChirps();
      this.scheduleWindChimes();
    } else if (preset === 'monsoon') {
      this.createRainfall();
      this.scheduleGentleThunder();
    } else if (preset === 'meditation') {
      this.createVedicHarmonicDrone();
      this.scheduleTibetanBowl();
    } else if (preset === 'night') {
      this.createCrickets();
      this.scheduleWindChimes();
    }
  }

  // Pink noise buffer generator for organic wind/water
  createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  createWindBreeze() {
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    // LFO to slowly modulate wind sweep
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();

    this.activeNodes.push(noiseSource, lfo, filter, gain, lfoGain);
  }

  createRainfall() {
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, bandpass, gain);
  }

  scheduleBirdChirps() {
    const chirp = () => {
      if (!this.isPlaying || this.currentPreset !== 'morning') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 2200 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, now + 0.16);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        chirp();
        setTimeout(() => chirp(), 160);
        if (Math.random() > 0.6) setTimeout(() => chirp(), 320);
      }
    }, 3800);

    this.timerIntervals.push(interval);
  }

  scheduleWindChimes() {
    // Pentatonic scale frequencies for sacred garden bamboo/bronze chimes
    const chimeFreqs = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];

    const strikeChime = () => {
      if (!this.isPlaying) return;
      const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.0);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        strikeChime();
        if (Math.random() > 0.5) setTimeout(() => strikeChime(), 400);
      }
    }, 5500);

    this.timerIntervals.push(interval);
  }

  createCrickets() {
    const cricket = () => {
      if (!this.isPlaying || this.currentPreset !== 'night') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4500 + Math.random() * 300, now);

      gain.gain.setValueAtTime(0, now);
      for (let i = 0; i < 4; i++) {
        gain.gain.setValueAtTime(0.04, now + i * 0.04);
        gain.gain.setValueAtTime(0.002, now + i * 0.04 + 0.02);
      }
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.28);
    };

    const interval = setInterval(() => {
      cricket();
    }, 1200);

    this.timerIntervals.push(interval);
  }

  scheduleGentleThunder() {
    const thunder = () => {
      if (!this.isPlaying || this.currentPreset !== 'monsoon') return;
      const now = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer();
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 5.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 5.2);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.6) thunder();
    }, 14000);

    this.timerIntervals.push(interval);
  }

  createVedicHarmonicDrone() {
    // 432 Hz Root Harmonic Chord (Vedic Healing Frequency)
    const freqs = [108, 216, 324, 432];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeNodes.push(osc, gain);
    });
  }

  scheduleTibetanBowl() {
    const ringBowl = () => {
      if (!this.isPlaying || this.currentPreset !== 'meditation') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(288, now); // D4 resonant tone

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 6.2);
    };

    const interval = setInterval(() => {
      ringBowl();
    }, 9000);

    this.timerIntervals.push(interval);
  }
}

export const botanicalAudio = new BotanicalAudioEngine();
