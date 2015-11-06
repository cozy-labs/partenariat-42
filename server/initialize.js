
var RealtimeAdapter = require('cozy-realtime-adapter');
var feed = require('./lib/feed');

module.exports.afterStart = function (app, server, callback) {

  feed.initialize(server);

  var realtime = RealtimeAdapter(server, ['shared-count.*'],
      {path: '/public/socket.io'});

  realtime.on('shared-count.update', function (event, id) {
    console.log('event: ', event, ' / ', id);
  });
}
