var application = require('./application');

$(function () {
  application.initialize();
  console.log('cassou')

  Backbone.history.start();


  // Lauche listenert for responsive menu
  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
});
