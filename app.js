const React = require('react');
const ReactDOM = require('react-dom');
const AppView = require('./components/app-view');

// global listeners
require('./client-lib/nsa');

const defaultData = {
  id: '',
  src: '',
  url: '', // only used for <audio> and <video> tags
  domain: '',
  minimized: false,
  loaded: false,
  error: false,
  muted: false,
  currentTime: '0:00 / 0:00',
  duration: 0,
  progress: 0.001, // force progress element to start out empty
  playing: false,
  volume: '0.5',
  strings: {},
  player: '' // player: 'youtube', 'video', 'audio'
};

window.AppData = new Proxy(defaultData, {
  set: function(obj, prop, value) {
    obj[prop] = value;
    renderApp();
    return true;
  }
});

function renderApp() {
  ReactDOM.render(React.createElement(AppView, window.AppData),
                  document.getElementById('container'));
}
