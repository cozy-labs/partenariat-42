var application = require('./application');

$(function () {
  application.initialize();

  Backbone.history.start();

  // Launch listener for responsive menu
  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
});
