var RealtimeAdapter = require('cozy-realtime-adapter');
var feed = require('./lib/feed');

module.exports.afterStart = function (app, server, callback) {

  feed.initialize(server);

  RealtimeAdapter(server, ['shared-count.*'],
      {path: '/public/socket.io'});
}
