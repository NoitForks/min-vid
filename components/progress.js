const React = require('react');
const cn = require('classnames');
const emitter = require('../client-lib/emitter');

module.exports = class ProgressView extends React.Component {
  setTime(ev) {
    ev.stopPropagation();
    const x = ev.pageX - ev.target.offsetLeft;
    const clickedValue = x * ev.target.max / ev.target.offsetWidth;
    const currentTime = window.AppData.duration * clickedValue;

    emitter.emit('set-time', {
      value: currentTime
    });
  }

  render() {
    return (
        <div className={cn('progress', {hidden: !this.props.hovered || this.props.minimized})}>
          <span className='domain'>{this.props.domain}</span>
          <div className='time'>{this.props.currentTime}</div>
          <progress className='video-progress' onClick={this.setTime}
                    value={this.props.progress + ''}  />
        </div>
    );
  }
}
