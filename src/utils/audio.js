// Synthesizer for retro dial-up modem sound using Web Audio API
let activeAudioContext = null;
let activeNodes = [];

export function playDialUpSound(onCompleted) {
  try {
    // Standard AudioContext initialization
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    
    // Stop any ongoing sounds first
    stopDialUpSound();

    const ctx = new AudioContext();
    activeAudioContext = ctx;
    activeNodes = [];

    let time = ctx.currentTime;

    // Helper to register node for cleanup
    const registerNode = (node) => {
      activeNodes.push(node);
      return node;
    };

    // Helper to play a tone
    const playTone = (freq1, freq2, start, duration) => {
      const osc1 = ctx.createOscillator();
      const osc2 = freq2 ? ctx.createOscillator() : null;
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(freq1, start);
      if (osc2 && freq2) {
        osc2.frequency.setValueAtTime(freq2, start);
      }

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.05);
      gain.gain.setValueAtTime(0.08, start + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, start + duration);

      osc1.connect(gain);
      if (osc2) osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(start);
      osc1.stop(start + duration);
      registerNode(osc1);

      if (osc2) {
        osc2.start(start);
        osc2.stop(start + duration);
        registerNode(osc2);
      }

      registerNode(gain);
    };

    // 1. DIAL TONE (350 Hz + 440 Hz) - 1.2 seconds
    playTone(350, 440, time, 1.2);
    time += 1.3;

    // 2. DTMF DIALING (Synaptica phone) - 4 digits (7, 9, 6, 2)
    // 7: 852 + 1209, 9: 852 + 1477, 6: 770 + 1477, 2: 697 + 1336
    const dtmf = [
      [852, 1209],
      [852, 1477],
      [770, 1477],
      [697, 1336]
    ];
    dtmf.forEach(([f1, f2]) => {
      playTone(f1, f2, time, 0.15);
      time += 0.25;
    });

    time += 0.2; // brief pause

    // 3. RINGBACK TONE (440 Hz + 480 Hz) - 1.5 seconds
    playTone(440, 480, time, 1.5);
    time += 1.8;

    // 4. ANSWER TONE (2100 Hz high pitched) - 1.2 seconds
    playTone(2100, null, time, 1.2);
    time += 1.2;

    // 5. HANDSHAKE (Static white noise mixed with sweep tone) - 2.5 seconds
    const noiseLength = 2.5;
    const bufferSize = ctx.sampleRate * noiseLength;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter the noise to sound crackly and telephonic
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, time);
    filter.Q.setValueAtTime(1.0, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, time);
    noiseGain.gain.linearRampToValueAtTime(0.04, time + 0.1);
    
    // Modulate volume dynamically to simulate line crackling
    for (let t = 0.1; t < noiseLength - 0.2; t += 0.2) {
      noiseGain.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.05, time + t);
    }
    noiseGain.gain.linearRampToValueAtTime(0, time + noiseLength);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + noiseLength);
    registerNode(noise);
    registerNode(filter);
    registerNode(noiseGain);

    // 6. MODULATED SWEEP TONE (during handshake)
    const oscSweep = ctx.createOscillator();
    oscSweep.type = 'sawtooth';
    oscSweep.frequency.setValueAtTime(300, time);
    
    // Sweep up and down like a modem screech
    oscSweep.frequency.linearRampToValueAtTime(900, time + 0.5);
    oscSweep.frequency.linearRampToValueAtTime(150, time + 1.0);
    oscSweep.frequency.linearRampToValueAtTime(700, time + 1.5);
    oscSweep.frequency.linearRampToValueAtTime(200, time + 2.0);
    oscSweep.frequency.setValueAtTime(0, time + 2.2);

    const sweepFilter = ctx.createBiquadFilter();
    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(600, time);

    const sweepGain = ctx.createGain();
    sweepGain.gain.setValueAtTime(0, time);
    sweepGain.gain.linearRampToValueAtTime(0.015, time + 0.1);
    sweepGain.gain.setValueAtTime(0.015, time + 2.0);
    sweepGain.gain.linearRampToValueAtTime(0, time + 2.2);

    oscSweep.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(ctx.destination);

    oscSweep.start(time);
    oscSweep.stop(time + 2.2);
    registerNode(oscSweep);
    registerNode(sweepFilter);
    registerNode(sweepGain);

    time += noiseLength;

    // Trigger callback when sound completes
    const timer = setTimeout(() => {
      if (onCompleted) onCompleted();
    }, (time - ctx.currentTime) * 1000);
    
    activeNodes.push({
      stop: () => clearTimeout(timer)
    });

  } catch (error) {
    console.error("Failed to generate dial-up sounds:", error);
    if (onCompleted) onCompleted();
  }
}

export function stopDialUpSound() {
  if (activeNodes.length > 0) {
    activeNodes.forEach(node => {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (e) {
        // Suppress warnings for nodes already stopped
      }
    });
    activeNodes = [];
  }
  
  if (activeAudioContext) {
    try {
      activeAudioContext.close();
    } catch (e) {}
    activeAudioContext = null;
  }
}
