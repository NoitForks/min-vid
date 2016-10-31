module.exports = function(src) {
  return Boolean(new RegExp('^(https?:)?//*.+(.mp3|.opus|.weba|.ogg|.wav|.flac)')
                 .exec(src));
}
