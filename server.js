var americano = require('americano');
var errorHandler = require('./server/middleware/error_handler');
var initialize = require('./server/initialize');

var application = module.exports = function (callback) {
  var options = {
    name: 'Count',
    root: __dirname,
    port: process.env.PORT || 9250,
    host: process.env.HOST || '127.0.0.1'
  };

  americano.start(options, function (app, server) {
    app.server = server;
    app.use(errorHandler);
    initialize.afterStart(app, server, callback);
  });
}

if (module.parent == undefined || module.parent == null) {
  application();
}
