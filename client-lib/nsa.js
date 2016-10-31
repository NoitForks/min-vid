const deepAssign = require('deep-assign');

const emitter = require('./emitter');
const formatTime = require('./format-time');
const sendMetricsEvent = require('./send-metrics-event');

const YtCtrl = require('./ctrls/yt-ctrl');
const AudioCtrl = require('./ctrls/audio-ctrl');
const VideoCtrl = require('./ctrls/video-ctrl');

const playerMap = {};

emitter.on('init', (opts) => {
  sendMetricsEvent('player_view', 'init');

  if (window.AppData.player === 'audio') {
    playerMap['audio'] = new AudioCtrl(opts);
  } else if (window.AppData.player === 'youtube') {
    const PLAYING = window.YT.PlayerState.PLAYING;
    const PAUSED = window.YT.PlayerState.PAUSED;

    playerMap['youtube'] = new YtCtrl({
      id: 'video',
      onReady: opts.onLoaded,
      onStateChange: (ev) => {
        if (ev.data === PLAYING && !window.AppData.playing) emitter.emit('play')
        else if (ev.data === PAUSED && window.AppData.playing) emitter.emit('pause')
      },
      onError: (err) => window.AppData.error = true
    });

  } else if (window.AppData.player === 'video') {
    playerMap['video'] = new VideoCtrl(opts);
  }
});

emitter.on('step', (opts) => {
  // const currentTime = this.isYt ? ytCtrl.time : videoCtrl.time;

  // window.AppData = deepAssign(window.AppData, {
  //   time: `${formatTime(currentTime)} / ${formatTime(window.AppData.duration)}`,
  //   progress: currentTime / window.AppData.duration
  // });

  // if (currentTime >= window.AppData.duration) {
  //   window.AppData = deepAssign(window.AppData, {
  //     playing: false
  //   });

  //   sendMetricsEvent('player_view', 'video_ended');
  // }
});

emitter.on('play', (opts) => {
  sendMetricsEvent('player_view', 'play');
  playerMap[window.AppData.player].play();
  window.AppData.playing = true;
});

emitter.on('pause', (opts) => {
  sendMetricsEvent('player_view', 'pause');
  playerMap[window.AppData.player].pause();
  window.AppData.playing = false;
});

emitter.on('mute', (opts) => {
  sendMetricsEvent('player_view', 'mute');
  playerMap[window.AppData.player].mute();
  window.AppData = deepAssign(window.AppData, {muted: true});
});

emitter.on('unmute', (opts) => {
  sendMetricsEvent('player_view', 'unmute');
  playerMap[window.AppData.player].unmute();
  window.AppData = deepAssign(window.AppData, {muted: false});
});

emitter.on('replay', (opts) => {
  sendMetricsEvent('player_view', 'replay');
});

emitter.on('load', (opts) => {
  sendMetricsEvent('player_view', 'video_loaded');

  if (!opts.duration) {
    // fetch duration
    // if (window.AppData.player === 'youtube') opts.duration = ytCtrl.getDuration();
  }

  window.AppData = deepAssign(window.AppData, {
    loaded: true,
    duration: opts.duration
  });
});

emitter.on('set-volume', (opts) => {
  playerMap[window.AppData.player].volume = opts.value;
  window.AppData = deepAssign(window.AppData, {
    volume: opts.value
  });
});

emitter.on('set-time', (opts) => {
  playerMap[window.AppData.player].time = opts.value;

  // if we are paused force the ui to update
  if (!window.AppData.playing) {
    window.AppData = deepAssign(window.AppData, {
      time: `${formatTime(opts.value)} / ${formatTime(window.AppData.duration)}`,
      progress: opts.value / window.AppData.duration,
      currentTime: opts.value
    });
  }
});
