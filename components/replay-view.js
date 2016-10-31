const React = require('react');
const cn = require('classnames');
const deepAssign = require('deep-assign');
const sendToAddon = require('../client-lib/send-to-addon');
const sendMetricsEvent = require('../client-lib/send-metrics-event');

// const emitter = require('../client-lib/emitter');

module.exports = class ReplayView extends React.Component {
  replay() {
    // emitter.emit('replay');
    // this.refs.video.currentTime = 0;
    // this.step(); // step once to set currentTime of window.AppData and
    // // progress
    // emitter.emit('play');
  }

  close() {
    sendMetricsEvent('player_view', 'close');

    sendToAddon({action: 'close'});
    // reset error view
    window.AppData = deepAssign(window.AppData, {
      error: false
    });
  }

  render() {
    return (
        <div className={cn('exited', {hidden: !this.props.hasExited() || this.props.minimized})}>
          <div className='row'>
            <button className='exit-replay' onClick={this.replay}></button>
            <button className='exit-close' onClick={this.close}></button>
          </div>
        </div>
    );
  }
}
