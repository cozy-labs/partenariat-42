var application = require('application');

$(function () {
	application.initialize();
	Backbone.history.start();
			$('[data-toggle=offcanvas]').click(function() {
				    $('.row-offcanvas').toggleClass('active');

				});
});
