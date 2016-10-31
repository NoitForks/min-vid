const React = require('react');
const isAudio = require('../client-lib/is-audio');
const emitter = require('../client-lib/emitter');
const PlayerControls = require('../components/player-controls');
// const ReplayView = require('../components/replay-view');
const Progress = require('../components/progress');

module.exports = class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hovered: false};
  }

  step() {
    emitter.emit('step');
    if (window.AppData.playing) this.currentStep = requestAnimationFrame(this.step);
  }

  onLoaded(duration) {
    clearTimeout(this.loadingTimeout);

    // let duration = 0;

    // if (this.refs.video) {
    //   duration = this.refs.video.duration
    // }

    // for YouTube we need to detect if the duration is 0 to see
    // if there was a problem loading.
    if ((this.props.player === 'youtube') && duration === 0) this.onError();

    // here we store the muted prop before it gets set in the
    // setVolume call so we can restore it afterwards.
    const wasMuted = this.props.muted;

    // set initial volume
    this.setVolume({
      target: {
        value: this.props.volume
      }
    });

    // set muted/unmuted (must be called before setVolume below)
    if (wasMuted) {
      emitter.emit('mute')
    } else {
      emitter.emit('unmute')
    }

    emitter.emit('load', {
      value: duration
    });

    this.currentStep = requestAnimationFrame(this.step);
  }

  componentWillUpdate() {
    this.setPlayer();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.src !== this.props.src) {
      this.loadingTimeout = setTimeout(() => {
        window.AppData.error = true;
      }, 30000); // 30 second timeout

      if (isAudio(this.props.src)) {
        const canvas = this.refs['audio-vis'];
        if (canvas) emitter.emit('init', {canvas: canvas, src: this.props.src});
        this.removeVideoListeners();
      } else this.attachVideoListeners();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.loadingTimeout);
    window.cancelAnimationFrame(this.currentStep);
    this.removeVideoListeners();
  }

  setPlayer() {
    if (!!~this.props.domain.indexOf('youtube.com')) { // eslint-disable-line no-extra-boolean-cast
      window.AppData.player = 'youtube';
    } else if (isAudio(this.props.src)) {
      window.AppData.player = 'audio';
    } else {
      window.AppData.player = 'video';
    }
  }

  attachVideoListeners() {
    if (!this.props.src) return;

    if (this.props.player === 'youtube') {
      emitter.emit('init', {
        video: this.refs.video,
        onLoaded: this.onLoaded
      });
    } else {
      emitter.emit('init', {
        video: this.refs.video
      });
      this.refs.video.addEventListener('canplay', this.onLoaded);
      this.refs.video.addEventListener('durationchange', this.onLoaded);
      this.refs.video.addEventListener('error', this.onError);
    }
  }

  removeVideoListeners() {
    this.refs.video.removeEventListener('canplay');
    this.refs.video.removeEventListener('durationchange');
    this.refs.video.removeEventListener('error');
  }

  onError() {
    if (!this.props.src) return;
    window.AppData.error = true;
  }

  enterPlayer() {
    this.setState({hovered: true});
  }

  leavePlayer() {
    this.setState({hovered: false});
  }

  hasExited() {
    // if (!this.refs.video || !this.refs['audio-vis'] || !window.AppData.loaded) return false;
    // const currentTime = (this.isYt && window.YTPlayer) ? ytCtrl.getTime() : this.refs.video.currentTime;
    // return (!this.props.playing && (currentTime >= this.props.duration));
  }

  handleVideoClick(ev) {
    if (!ev.target.classList.contains('video-wrapper')) return;
    if (this.props.playing) emitter.emit('pause')
    else emitter.emit('play')
  }

  render() {
    const noop = () => false;
    const visualEl = isAudio(this.props.src) ?
          (<canvas id='audio-vis' ref='audio-vis' onContextMenu={noop} />) :
          (this.props.player === 'youtube') ?
          (<iframe id='video' ref='video' src={this.props.src} onContextMenu={noop} />) :
          (<video id='video' ref='video' src={this.props.src} autoplay={false}
                  onContextMenu={noop} muted={this.props.muted} volume={this.props.volume}
                  currentTime={this.props.currentTime} />);

    return (
        <div className='video-wrapper'
             onMouseEnter={this.enterPlayer.bind(this)}
             onMouseLeave={this.leavePlayer.bind(this)}
             onClick={this.handleVideoClick.bind(this)}>

          <PlayerControls {...this.props} hasExited={this.hasExited}
                          hovered={this.state.hovered} />
          <Progress {...this.props} hovered={this.state.hovered} />

          {visualEl}
        </div>
    );
  }
}

  // <ReplayView {...this.props} hasExited={this.hasExited} />
