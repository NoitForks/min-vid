const AudioSource = require('audiosource');
const FFT = require('audio-fft');
const context = new AudioContext();

module.exports = class AudioCtrl {
  constructor(options) {
    this.gainNode = context.createGain();
    this.gainNode.gain.value = options.volume | 0.5;

    // visuals
    this.fft = new FFT(context, {
      fillStyle: '#fff',
      strokeStyle: '#fff',
      canvas: options.canvas,
      type: 'time' // TODO(dj) options.type
    });

    const onConnect = () => {
      this.audio.source.connect(this.fft.input);
      this.audio.source.connect(this.gainNode);
      this.audio.source.connect(context.destination);
    };

    this.audio = new AudioSource({
      context: context,
      onConnect: onConnect
    });

    this.audio.load(options.src, () => options.onLoaded(this.duration));
  }

  get volume() {
    return this.gainNode.gain.value;
  }

  set volume(v) {
    this.gainNode.gain.value = v;
  }

  get time() {
    return this.audio.time();
  }

  set time(t) {
    this.audio.seek(t);
  }

  get duration() {
    return this.audio.time().total;
  }

  play() {
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  mute() {
    if (this.prevVolume !== 0) {
      this.prevVolume = this.volume;
    }
    this.gainNode.gain.value = 0;
  }

  unmute() {
    this.gainNode.gain.value = this.prevVolume;
  }
}
