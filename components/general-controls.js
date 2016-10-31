const React = require('react');
const cn = require('classnames');
const sendToAddon = require('../client-lib/send-to-addon');
const sendMetricsEvent = require('../client-lib/send-metrics-event');
const ReactTooltip = require('react-tooltip');

module.exports = class GeneralControls extends React.Component {
  getView() {
    if (this.props.error) return 'error_view';
    return this.props.loaded ? 'player_view' : 'loading_view';
  }

  close() {
    sendMetricsEvent(this.getView(), 'close');
    sendToAddon({action: 'close'});
    window.AppData.error = false;
  }

  minimize() {
    sendMetricsEvent(this.getView(), 'minimize');
    sendToAddon({action: 'minimize'});
    window.AppData.minimized = true;
  }

  maximize() {
    sendMetricsEvent(this.getView(), 'maximize');
    sendToAddon({action: 'maximize'});
    window.AppData.minimized = false;
  }

  sendToTab() {
    sendMetricsEvent(this.getView(), 'send_to_tab');
    let currentTime = 0;

    if (this.getView() === 'player_view') {
      currentTime = this.props.getTime();
    }

    sendToAddon({
      action: 'send-to-tab',
      id: this.props.id,
      domain: this.props.domain,
      time: currentTime,
      tabId: this.props.tabId,
      url: this.props.url
    });
    window.AppData.error = false;
  }

  render() {
    return (
      <div className='right'>
        <a onClick={this.sendToTab.bind(this)} data-tip data-for='sendToTab' className='tab'/>
        <ReactTooltip id='sendToTab' effect='solid' place={!this.props.minimized ? 'bottom': 'left'}>
          {this.props.strings.ttSendToTab}
        </ReactTooltip>

        <a className={cn('minimize', {hidden: this.props.minimized})}
           onClick={this.minimize.bind(this)} data-tip data-for='minimize' />
        <ReactTooltip id='minimize' effect='solid' place='left'>{this.props.strings.ttMinimize}</ReactTooltip>

        <a className={cn('maximize', {hidden: !this.props.minimized})}
           onClick={this.maximize.bind(this)} data-tip data-for='maximize' />
        <ReactTooltip id='maximize' effect='solid' place='left'>{this.props.strings.ttMaximize}</ReactTooltip>

        <a className='close' onClick={this.close.bind(this)} data-tip data-for='close' />
        <ReactTooltip id='close' effect='solid' place='left'>{this.props.strings.ttClose}</ReactTooltip>
      </div>
    );
  }
}
