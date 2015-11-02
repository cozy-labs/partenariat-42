var application = require('./application');

$(function () {
  application.initialize();
  console.log('cassou')

  Backbone.history.start();
});
