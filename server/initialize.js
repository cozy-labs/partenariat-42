
var RealtimeAdapter = require('cozy-realtime-adapter');
var feed = require('./lib/feed');

module.exports.afterStart = function (app, server, callback) {

  feed.initialize(server);

  var realtime = RealtimeAdapter(server, ['shared-count.*'],
      {path: '/public/socker.io'});

  realtime.on('shared-count.*', function (event, id) {
    console.log('event: ', event, ' / ', id);
  });
}
