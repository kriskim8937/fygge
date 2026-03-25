// AudioManager — Web Audio API stem controller
// All stems are decoded before any playback starts, then launched from a
// single shared timestamp to prevent sync drift.

const STEM_URLS = [
  ['assets/audio/stems/stem-01.ogg', 'assets/audio/stems/stem-01.mp3'],
  ['assets/audio/stems/stem-02.ogg', 'assets/audio/stems/stem-02.mp3'],
  ['assets/audio/stems/stem-03.ogg', 'assets/audio/stems/stem-03.mp3'],
  ['assets/audio/stems/stem-04.ogg', 'assets/audio/stems/stem-04.mp3'],
  ['assets/audio/stems/stem-05.ogg', 'assets/audio/stems/stem-05.mp3'],
];

const AMBIENT_URLS = ['assets/audio/ambient.ogg', 'assets/audio/ambient.mp3'];

function pickUrl(urls) {
  const audio = document.createElement('audio');
  for (const url of urls) {
    const ext = url.split('.').pop();
    const type = ext === 'ogg' ? 'audio/ogg' : 'audio/mpeg';
    if (audio.canPlayType(type) !== '') return url;
  }
  return urls[0];
}

async function fetchAndDecode(ctx, urls) {
  const url = pickUrl(urls);
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

export default class AudioManager {
  constructor() {
    this.ctx = null;
    this.gainNodes = [];
    this.sources = [];
    this.ambientSource = null;
    this.ready = false;
    this.stemsUnlocked = new Array(5).fill(false);
  }

  // Call once on first user gesture (start screen click)
  async init() {
    this.ctx = new AudioContext();

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Decode all buffers in parallel before starting any source
    const [stemBuffers, ambientBuffer] = await Promise.all([
      Promise.all(STEM_URLS.map((urls) => fetchAndDecode(this.ctx, urls))),
      fetchAndDecode(this.ctx, AMBIENT_URLS),
    ]);

    const startTime = this.ctx.currentTime + 0.1;

    // Stems — all silent at start, all launched at identical timestamp
    stemBuffers.forEach((buffer, i) => {
      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();

      source.buffer = buffer;
      source.loop = true;
      source.connect(gain).connect(this.ctx.destination);

      gain.gain.setValueAtTime(0, startTime);
      source.start(startTime);

      this.sources.push(source);
      this.gainNodes.push(gain);
    });

    // Ambient — always on at low volume
    const ambientSource = this.ctx.createBufferSource();
    const ambientGain = this.ctx.createGain();
    ambientSource.buffer = ambientBuffer;
    ambientSource.loop = true;
    ambientSource.connect(ambientGain).connect(this.ctx.destination);
    ambientGain.gain.setValueAtTime(0.4, startTime);
    ambientSource.start(startTime);
    this.ambientSource = ambientSource;

    this.ready = true;
  }

  // Called exactly once per stem, on first object interaction
  unlockStem(index, fadeDuration = 2.0) {
    if (!this.ready || this.stemsUnlocked[index]) return;
    this.stemsUnlocked[index] = true;

    const gain = this.gainNodes[index];
    const now = this.ctx.currentTime;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + fadeDuration);
    // Gain stays at 1 permanently after the ramp — no further automation
  }

  allUnlocked() {
    return this.stemsUnlocked.every(Boolean);
  }

  stemCount() {
    return this.stemsUnlocked.filter(Boolean).length;
  }
}
